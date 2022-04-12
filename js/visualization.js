// Read in data and print to console
d3.csv("data/updated_data.csv").then((data) => {

// WORLD MAP CODE STARTS HERE...
// SOURCE1: https://d3-graph-gallery.com/graph/choropleth_hover_effect.html

// The svg
let svg = d3.select("svg"),
    width1 = +svg.attr("width"),
    height1 = +svg.attr("height"),
    margin1 = {top: 50, right: 100, bottom: 50, left: 50};

// Map and projection
let path = d3.geoPath();

let projection = d3.geoMercator()
    .scale(100)
    .center([75, 0])
    .translate([width1 / 2, height1 / 2]);


// Data and color scale
let data1 = new Map()
let colorScale = d3.scaleThreshold()
    .domain([0, 500, 50000, 500000, 5000000, 50000000, 500000000])
    .range(d3.schemeBlues[6]);

// Load external data and boot
let promises = []
promises.push(d3.json("data/countries.geojson"))
promises.push(d3.csv("data/updated_data.csv", function(d) { data1.set(d.code, +d.waste_gen); }))

myDataPromises = Promise.all(promises).then(function(mydata) {

    let topo = mydata[0]

    // tooltip
    let tooltip1 = d3.select(".vis-holder")
        .append("div")
        .style("opacity", 0)
        .attr("class", "tooltip1")
        .style("background-color", "skyblue")
        .style("border", "solid")
        .style("border-width", "1px")
        .style("border-radius", "5px")
        .style("margin-right", "732px")


    // legend
    const legend_x = width1 - margin1.left - 200
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


    let mouseOver = function(d, event) {
        d3.selectAll(".Country")
            .transition()
            .duration(200)
        d3.select(this)
            .transition()
            .duration(200)
            .style("stroke", "black")

        // tooltip
        tooltip1
            .style("opacity", 1)
            .style("visibility", "visible")
    }

    let mouseMove = function(d, event) {
        tooltip1
            .html("Country Name: " + event.properties.ADMIN + "<br>Waste Generation: " + event.total + " kg/day")
            .style("text-align", "center")
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
        tooltip1
            .transition()
            .duration(200)
            .style("opacity", 1)
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
        .on("mousemove", mouseMove)

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
    let yKey1 = "waste_generation_rate(kg/person/day)";

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
            .text("Waste Generation (kg/person/day)")
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
    .style("opacity", 0.5)
    .on("mouseover", mouseover)
    .on("mousemove", mousemove)
    .on("mouseleave", mouseleave);
svg4.append(tooltip);

});
