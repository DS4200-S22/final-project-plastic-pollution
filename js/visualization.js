// Read in data and print to console
d3.csv("data/updated_data.csv").then((data) => {

// WORLD MAP CODE STARTS HERE...
// SOURCE1: https://d3-graph-gallery.com/graph/choropleth_hover_effect.html

// The svg
let svg = d3.("svg"),
    width1 = +svg.attr("width"),
    height1 = +svg.attr("height"),
    margin1 = {top: 20, right: 10, bottom: 40, left: 100};


// Map and projection
let path = d3.geoPath();

let projection = d3.geoMercator()
    .scale(120)
    .center([0, 5])
    .translate([width1 / 2, height1 / 2]);


// Data and color scale
let data1 = new Map()
let colorScale = d3.scaleThreshold()
    .domain([0, 50, 5000, 50000, 500000, 5000000, 500000000])
    .range(d3.schemeBlues[6]);

// Load external data and boot
let promises = []
promises.push(d3.json("data/countries.geojson"))
promises.push(d3.csv("data/updated_data.csv", function(d) { data1.set(d.code, +d.waste_gen); }))

myDataPromises = Promise.all(promises).then(function(mydata) {

    // legend
    const legend_x = width1 - margin1.left - 120
    const legend_y = height1 - 200

    svg.append("g")
        .attr("class", "legendQuant")
        .attr("transform", "translate(" + legend_x + "," + legend_y+")")

    let legendLinear = d3.legendColor()
        .title("Waste Generation (kg/day)")
        .shapeWidth(25)
        .orient('vertical')
        .scale(colorScale);

    svg.select(".legendQuant")
        .call(legendLinear)

    // Features of the annotation
    const annotations = [
        {
            note: {
                label: "Waste Generation 10,055,659 kg/day",
                title: "Russia",
                wrap: 150,  // try something smaller to see text split in several lines
                padding: 10   // More = text lower

            },
            color: ["#62b6ef"],
            x: projection([150.916672,-31.083332])[0],
            y: projection([150.916672,67.083332])[1],
            dy: -30,
            dx: 10
        }
    ]

    // Add annotation to the chart
    let makeAnnotations = function(d) {

        let ann = d3.annotation().annotations(annotations)

        svg.append("g")
            .style("opacity", 1)
            .attr("id", "annotation")
            .call(ann)

        console.log("Annotations function hit")
    }

    let topo = mydata[0]

    let mouseOver = function(d, event) {
        d3.selectAll(".Country")
            .transition()
            .duration(200)
        d3.select(this)
            .transition()
            .duration(200)
            .style("stroke", "black")

        d3.select(this)
            .on("click", makeAnnotations)

        // tooltip
        d3.selectAll("#annotation")
            .style("opacity", 0)
            .style("opacity", 0.8)
    }

    let mouseLeave = function(d) {
        d3.selectAll(".Country")
            .transition()
            .duration(200)
            // .style("opacity", .8)
        d3.select(this)
            .transition()
            .duration(200)
            .style("stroke", "transparent")

        // tooltip
        d3.selectAll("#annotation")
            // .style("opacity", 1)
            .style("opacity", 0)
    }

    // Draw the map
    svg.append("g")
        .selectAll("path")
        .data(topo.features)
        .enter()
        .append("path")

        // draw each country
        .attr("d", d3.geoPath()
            .projection(projection)
        )

        // set the color of each country
        .attr("fill", function (d) {
            d.total = data1.get(d.properties.ISO_A3) || 0;
            return colorScale(d.total);
        })
        .style("stroke", "transparent")
        .attr("class", function(d) { return d.properties.ADMIN } )
        .style("opacity", .8)
        .on("mouseover", mouseOver)
        .on("mouseleave", mouseLeave)

})
    // PIE CHART CODE STARTS HERE
    // SOURCE: https://www.geeksforgeeks.org/d3-js-pie-function/
    // set the dimensions and margins of the graph
    let margin2 = {
        top: 30,
        right: 30,
        bottom: 30,
        left: 30
    }
    let chart = {
        width: 1000,
        height: 500,
        margin2: 70
    };

    chart.rightEdge = margin2.left + chart.width;
    chart.bottomEdge = margin2.top + chart.height;
    chart.totalHeight = chart.bottomEdge + margin2.bottom;
    chart.totalWidth = chart.rightEdge + margin2.right;


    // The radius of the pieplot is half the width or half the height (smallest one). I subtract a bit of margin.
    const radius = Math.min(chart.width, chart.height) / 2 - chart.margin2;

    const color2 = d3.scaleOrdinal()
        .range(['salmon', 'cornflowerblue', 'darkseagreen', 'goldenrod'])

    // append the svg object to the div called 'viz-holder'
    let svg2 = d3.select("#pie")
        .append("svg")
        .attr("width", chart.width)
        .attr("height", chart.height)
        .append("g")
        .attr("transform", "translate(" + chart.width / 2 + "," + chart.height / 2 + ")");

    let averages = d3
        .rollups(
            data,
            (xs) => d3.mean(xs, (x) => x['waste_generation_rate(kg/person/day)']),
            (d) => d.economic_status
        )
        .map(([k, v]) => ({economic_status: k, 'waste_generation_rate(kg/person/day)': v}));

    const economicStatusNames = {
        LMI: "Low Middle Income",
        UMI: "Upper Middle Income",
        HIC: "High Income Countries",
        LI: "Low Income Countries"
    }

    // Creaing pie chart:
    let pie = d3.pie().value(function (d) {
        return d['waste_generation_rate(kg/person/day)'];
    });

    // Creating arc
    let arc = d3.arc()
        .outerRadius(radius)
        .innerRadius(0);

    // Grouping different arcs
    let arcs = svg2.selectAll("arc")
        .data(pie(averages))
        .enter()
        .append("g");

    // Appending path
    arcs.append("path")
        .attr("fill", (d, i) => {
            return color2(i)
        })
        .attr("d", arc);

    // Add Labels
    let label = d3.arc()
        .outerRadius(radius)
        .innerRadius(0);


    arcs.append("text")
        .attr("transform", function (d) {
            return "translate(" + label.centroid(d) + ")";
        })
        .text(function (d) {
            return d.data.economic_status;
        })
        .style("font-family", "arial")
        .style("font-size", 15);

    // Handmade legend
    svg2.append("circle").attr("cx", -415).attr("cy", -160).attr("r", 6).style("fill", "goldenrod")
    svg2.append("circle").attr("cx", -415).attr("cy", -140).attr("r", 6).style("fill", "salmon")
    svg2.append("circle").attr("cx", -415).attr("cy", -120).attr("r", 6).style("fill", "cornflowerblue")
    svg2.append("circle").attr("cx", -415).attr("cy", -100).attr("r", 6).style("fill", "darkseagreen")

    svg2.append("text").attr("x", -400).attr("y", -160).text("Lower Income Country ").style("font-size", "15px").attr("alignment-baseline", "middle")
    svg2.append("text").attr("x", -400).attr("y", -140).text("Lower Middle Income Country ").style("font-size", "15px").attr("alignment-baseline", "middle")
    svg2.append("text").attr("x", -400).attr("y", -120).text("Upper Middle Income Country ").style("font-size", "15px").attr("alignment-baseline", "middle")
    svg2.append("text").attr("x", -400).attr("y", -100).text("High Income Country").style("font-size", "15px").attr("alignment-baseline", "middle")

    svg2.append("text").attr("x", -300).attr("y", -215).text("Comparison of Waste Generation Per Day Per Person by Economic Status").style("font-size", "20px").attr("alginment-baseline", "bottom")

    // -- Grouped Bar Chart --
    let marginBar = {top: 20, right: 80, bottom: 80, left: 120},
        widthBar = 500,
        heightBar = 500;

    let groupsBar = data.map(d => d.continent);

    let subGroupBar = ['mismanaged_plastic_waste_in_2010(tonnes)', 'mismanaged_plastic_waste_in_2025(tonnes)'];

    let svg3 = d3.select("#bar")
        .append("svg")
        .attr('preserveAspectRatio', 'xMidYMid meet')
        .attr('width', '100%')
        .attr('height', heightBar + marginBar.top + marginBar.bottom)
        .attr('viewBox', [0, 0, widthBar + marginBar.left + marginBar.right, heightBar + marginBar.top + marginBar.bottom].join(' '))
        .append('g')
        .attr('transform', 'translate(' + marginBar.left + ',' + marginBar.top + ')');

    // add x axis
    let xAxisBar = d3.scaleBand()
        .domain(groupsBar)
        .range([0, widthBar])
        .padding([0.2])
    svg3.append('g')
        .attr('transform', `translate(0, ${heightBar})`)
        .call(d3.axisBottom(xAxisBar).tickSize(0));

    // add x axis label
    svg3.append('text')
        .attr('x', widthBar/2 - marginBar.right)
        .attr('y', heightBar + marginBar.top * 2)
        .style('stroke', 'black')
        .style('font-size', '20px')
        .text('Continent');

    // add y axis
    let yAxisBar = d3.scaleLinear()
        .domain([0, 20000000])
        .range([ heightBar, 0 ]);
    svg3.append('g')
        .call(d3.axisLeft(yAxisBar).ticks(10));

    // add y axis label
    svg3.append('text')
        .attr('y', - marginBar.right)
        .attr('x', -widthBar/2 - marginBar.bottom * 2)
        .style('stroke', 'black')
        .attr('transform', 'rotate(-90)')
        .style('font-size', '20px')
        .text('Mismanaged Plastic Waste (Tonnes)');

    // scale for medal subgroup
    let xSubGroupBar = d3.scaleBand()
        .domain(subGroupBar)
        .range([0, xAxisBar.bandwidth()])
        .padding([0.05])

    // color palette for medals
    let colorBar = d3.scaleOrdinal()
        .domain(subGroupBar)
        .range(['salmon','cornflowerblue'])

    // add the bars
    svg3.append('g')
        .selectAll('g')
        .data(data)
        .join('g')
        .attr('transform', d => `translate(${xAxisBar(d.continent)}, 0)`)
        .selectAll('rect')
        .data(function(d) { return subGroupBar.map(function(key) { return {key: key, value: d[key]}; }); })
        .join('rect')
        .attr('x', d => xSubGroupBar(d.key))
        .attr('y', d => yAxisBar(d.value))
        .attr('width', xSubGroupBar.bandwidth())
        .attr('height', d => heightBar - yAxisBar(d.value))
        .attr('fill', d => colorBar(d.key));

    // add a legend
    svg3.append('rect')
        .attr('x', widthBar)
        .attr('y', marginBar.bottom)
        .attr('width', 20)
        .attr('height', 20)
        .style('stroke', 'black')
        .style('fill', 'salmon');
    svg3.append('text')
        .attr('x', widthBar + 25)
        .attr('y', marginBar.bottom + 16)
        .text('2010')
        .style('font-size', '15px')
    svg3.append('rect')
        .attr('x', widthBar)
        .attr('y', marginBar.bottom + 25)
        .attr('width', 20)
        .attr('height', 20)
        .style('stroke', 'black')
        .style('fill', 'cornflowerblue');
    svg3.append('text')
        .attr('x', widthBar + 25)
        .attr('y', marginBar.bottom + 41)
        .text('2025')
        .style('font-size', '15px')

// set the dimensions and margins of the graph
    let margin4 = {top: 10, right: 30, bottom: 20, left: 50},
        width4 = 800 - margin4.left - margin4.right,
        height4= 800 - margin4.top - margin4.bottom;



// -----------Scatterplot:-------------
    const margin3 = {top: 50, right: 50, bottom: 50, left: 30};
    const width3 = 1000; //- margin3.left - margin.right;
    const height3 = 600; //- margin.top - margin.bottom;

// Append svg object to the body of the page to house the scatterplot

    const svg4 = d3.select("#scatterplot")
        .append("svg")
        .attr("width", width3 - margin3.left - margin3.right)
        .attr("height", height3 - margin3.top - margin3.bottom)
        .attr("viewBox", [0, 0, width3 + 20, height3 + 20]);

    let xKey1 = "coastal_population";
    let yKey1 = "mismanaged_plastic_waste(kg/person/day)";

    // Find max x
    let maxX1 = d3.max(data, (d) => {
        return d[xKey1];
    });

    // Create X scale
    x3 = d3.scaleLinear()
        .domain([0, maxX1])
        .range([margin3.left, width3 - margin3.right]);

    // Add x axis
    svg4.append("g")
        .attr("transform", `translate(0,${height3 - margin3.bottom})`)
        .call(d3.axisBottom(x3))
        .attr("font-size", '10px')
        .call((g) => g.append("text")
            .attr("x", width3 / 2)
            .attr("y", margin3.bottom - 4)
            .attr("fill", "black")
            .attr("text-anchor", "end")
            .text("Coastal Population")
        );

    // Find max y
    let maxY1 = d3.max(data, (d) => {
        return d[yKey1];
    });

    // Create Y scale
    y3 = d3.scaleLinear()
        .domain([0, maxY1])
        .range([height3 - margin3.bottom, margin3.top]);

    // Add y axis
    svg4.append("g")
        .attr("transform", `translate(${margin3.left}, 0)`)
        .call(d3.axisLeft(y3))
        .attr("font-size", '10px')
        .call((g) => g.append("text")
            .attr("x", -(height3 / 3))
            .attr("transform", `rotate(-90)`)
            .attr("y", margin3.top - 100)
            .attr("fill", "black")
            .attr("text-anchor", "end")
            .text("Mismanaged Waste (kg/person/day)")
        );
//Tooltip Set-up
const yTooltipOffset = 15;


// Add div for tooltip to webpage
const tooltip = d3.select("#scatterplot")
    .append("div")
    .attr('id', "tooltip")
    .style("opacity", 0)
    .attr("class", "tooltip");

// Add values to tooltip on mouseover, make tooltip div opaque
const mouseover = function(event, d) {
    tooltip.html("Country: " + d.country + "<br> Waste Generation (kg/person/day): " + d[yKey1] + "<br>Coastal Population: " + d[xKey1])
        .style("opacity", 1);
}

// Position tooltip to follow mouse
const mousemove = function(event, d) {
    tooltip.style("left", (event.pageX) + "px")
        .style("top", (event.pageY + yTooltipOffset) + "px");
}

// Return tooltip to transparent when mouse leaves
const mouseleave = function(event, d) {
    tooltip.style("opacity", 0);
}

svg4.selectAll(".point")
    .data(data)
    .enter()
    .append("circle")
    .attr("cx", (d) => x3(d[xKey1]))
    .attr("cy", (d) => y3(d[yKey1]))
    .attr("r", 8)
    .attr("fill", "cornflowerblue")
    .style("opacity", 0.5)
    .on("mouseover", mouseover)
    .on("mousemove", mousemove)
    .on("mouseleave", mouseleave);
svg4.append(tooltip);

});
