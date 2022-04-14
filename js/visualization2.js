// Read in data and print to console
d3.csv("data/updated_data.csv").then((data) => {

// -----------Map:-------------
// SOURCE1: https://d3-graph-gallery.com/graph/choropleth_hover_effect.html

// The svg
    let svg = d3.select("#my_dataviz"),
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
        let tooltip1 = d3.select("#page1_desc")
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
        }

         let formatted = d3.format(",")

        let mouseMove = function(d, event) {
            tooltip1
                .html("Country Name: " + event.properties.ADMIN + "<br>Waste Generation: " + formatted(event.total) + " kg/day")
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
            .on("mousemove", mouseMove)

    })
// -----------Pie Chart:-------------
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
    let svg2 = d3.select("#page3_desc")
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

    //Tooltip Set-up

    const yTooltipOffset2 = 15;

// Add div for tooltip to webpage

    const tooltip2 = d3.select("#page3_desc")
        .append("div")
        .attr('id', "tooltip")
        .style("opacity", 0)
        .attr("class", "tooltip");


// Add values to tooltip on mouseover, make tooltip div opaque
    const mouseover2 = function(event, d) {
        let avg_waste_gen = averages.map(function(d) {
            return (d['waste_generation_rate(kg/person/day)']); });
        let total = d3.sum(averages.map(function(d) {                // NEW
            return (d['waste_generation_rate(kg/person/day)']); }));
        let percent = Math.round(1000 * d.data['waste_generation_rate(kg/person/day)'] / total) / 10;
        tooltip2.html("Economic Status: " + d.data.economic_status + "<br> Waste Generation (kg/person/day): " + d.data['waste_generation_rate(kg/person/day)'] + "<br> Percent: " + percent + '%')
            .style("opacity", 1);

    }

// Position tooltip to follow mouse

    const mousemove2 = function(event, d) {
        tooltip2.style("left", (event.pageX) + "px")
            .style("top", (event.pageY + yTooltipOffset2) + "px");
    }

// Return tooltip to transparent when mouse leaves

    const mouseleave2 = function(event, d) {
        tooltip2.style("opacity", 0);
    }

    arcs.on("mouseover", mouseover2)
    arcs.on("mousemove", mousemove2)
    arcs.on("mouseleave", mouseleave2);


    // -- GROUPED BARCHART STARTS HERE--
    let marginBar = {top: 20, right: 80, bottom: 80, left: 120},
        widthBar = 500,
        heightBar = 500;

    let groupsBar = data.map(d => d.continent);

    let subGroupBar = ['waste2010', 'waste2025'];
    let continentWaste = [];
    data.reduce(function (res, value) {
        if (!res[value.continent]) {
            res[value.continent] = {continent: value.continent, waste2010: 0, waste2025: 0};
            continentWaste.push(res[value.continent])
        }
        res[value.continent].waste2010 += parseInt(value['mismanaged_plastic_waste_in_2010(tonnes)']);
        res[value.continent].waste2025 += parseInt(value['mismanaged_plastic_waste_in_2025(tonnes)']);
        return res;
    }, {});

    console.log(continentWaste)
    let svg3 = d3.select("#bar_viz")
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
        .style('font-size', '12px')
        .call(d3.axisBottom(xAxisBar).tickSize(0));

    // add x axis label
    svg3.append('text')
        .attr('x', widthBar/2 - marginBar.right)
        .attr('y', heightBar + marginBar.top * 2)
        .style('font-size', '20px')
        .text('Continent');

    // add y axis
    let yAxisBar = d3.scaleLinear()
        .domain([0, 52000000])
        .range([ heightBar, 0 ]);
    svg3.append('g')
        .style('font-size', '12px')
        .call(d3.axisLeft(yAxisBar).ticks(10));

    // add y axis label
    svg3.append('text')
        .attr('y', - 100)
        .attr('x', -widthBar/2 - marginBar.bottom * 2)
        .attr('transform', 'rotate(-90)')
        .style('font-size', '20px')
        .text('Mismanaged Plastic Waste (Tonnes)');

    // scale for continent subgroup
    let xSubGroupBar = d3.scaleBand()
        .domain(subGroupBar)
        .range([0, xAxisBar.bandwidth()])
        .padding([0.05])

    // color palette for years
    let colorBar = d3.scaleOrdinal()
        .domain(subGroupBar)
        .range(['salmon','cornflowerblue'])

    let tooltipOffsetBar = 15;
    // Add div for tooltip to webpage
    const tooltipBar = d3.select("#page2_desc")
        .append("div")
        .classed('tooltip', true);


// Add values to tooltip on mouseover, make tooltip div opaque
    const mouseoverbar = function(event, d) {
        d3.select(this).style('opacity', 1);
        tooltipBar.html('Mismanaged waste: ' + formatted(d.value) + " Tonnes")
            .style("opacity", 1);
    }

// Position tooltip to follow mouse
    const mousemovebar = function(event, d) {
        tooltipBar.style("left", (event.pageX + tooltipOffsetBar) + "px")
            .style("top", (event.pageY + tooltipOffsetBar) + "px");
    }

// Return tooltip to transparent when mouse leaves
    const mouseleavebar = function(event, d) {
        d3.select(this).style('opacity', 0.8);
        tooltipBar.style("opacity", 0);
    }

    const clickbar = function(event, d) {
        continent = d.continent;
        circles.classed('brushed', false);
        circles.classed('continent', function(d) {
            return d.continent == continent;
        });
        continentLabel.text('Continent: ' + continent);
        bars.style('stroke', 'none');
    }

    // add the bars
    let bars = svg3.append('g')
        .selectAll('g')
        .data(continentWaste)
        .join('g')
        .attr('transform', d => `translate(${xAxisBar(d.continent)}, 0)`)
        .selectAll('rect')
        .data(function(d) { return subGroupBar.map(function(key) { return {key: key, value: d[key], continent: d.continent}; }); })
        .join('rect')
        .attr('x', d => xSubGroupBar(d.key))
        .attr('y', d => yAxisBar(d.value))
        .attr('width', xSubGroupBar.bandwidth())
        .attr('height', d => heightBar - yAxisBar(d.value))
        .attr('fill', d => colorBar(d.key))
        .style('stroke-width', 4)
        .style('opacity', 0.8)
        .on("mouseover", mouseoverbar)
        .on("mousemove", mousemovebar)
        .on("mouseleave", mouseleavebar)
        .on("click", clickbar);

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

// -----------Scatterplot:-------------
    const margin3 = {top: 50, right: 70, bottom: 45, left: 70};
    const width3 = 850; //- margin3.left - margin.right;
    const height3 = 550; //- margin.top - margin.bottom;

// Append svg object to the body of the page to house the scatterplot
    const svg4 = d3.select("#scatter_viz")
        .append("svg")
        .attr("width", width3)//+ margin3.left + margin3.right)
        .attr("height", height3)// + margin3.top + margin3.bottom)
        .attr("viewBox", [0, 0, width3 + 20, height3 + 20]);

    let xKey1 = "coastal_population";
    let yKey1 = "mismanaged_plastic_waste(kg/person/day)";

    // Find max x
    let maxX1 = d3.max(data, (d) => {
        return d[xKey1];
    });

    // Create X scale
    let x3 = d3.scaleLinear()
        .domain([0, maxX1])
        .range([margin3.left, width3 - margin3.right]);

    // Add x axis
    svg4.append("g")
        .attr("transform", `translate(0,${height3 - margin3.bottom})`)
        .call(d3.axisBottom(x3))
        .attr("font-size", '15px')
        .call((g) => g.append("text")
            .attr("x", width3 / 2)
            .attr("y", margin3.bottom - 4)
            .attr("fill", "black")
            .attr("text-anchor", "end")
            .attr("font-size", '20px')
            .text("Coastal Population")
        );

    // Find max y
    let maxY1 = d3.max(data, (d) => {
        return d[yKey1];
    });

    // Create Y scale
    let y3 = d3.scaleLinear()
        .domain([0, maxY1])
        .range([height3 - margin3.bottom, margin3.top]);

    // Add y axis
    svg4.append("g")
        .attr("transform", `translate(${margin3.left}, 0)`)
        .call(d3.axisLeft(y3))
        .attr("font-size", '15px')
        .call((g) => g.append("text")
            .attr("x", -(height3 / 3))
            .attr("transform", `rotate(-90)`)
            .attr("y", margin3.top - 100)
            .attr("fill", "black")
            .attr("text-anchor", "end")
            .attr("font-size", '20px')
            .text("Mismanaged Waste (kg/person/day)")
        );

    let brush = d3.brush().on('start brush', selectCircles)
    svg4.call(brush);
    brush.on('end', function(event) {
        if(event.sourceEvent!==undefined&&event.sourceEvent.type!='end'){
            svg4.call(brush.move, null)
        }
    })
    // Add div for tooltip to webpage
    let tooltipOffsetScatter = 15;

    const tooltip = d3.select("#page2_desc")
        .append("div")
        .classed('tooltip', true);

    let formatted = d3.format(",")

    // Add values to tooltip on mouseover, make tooltip div opaque
    const mouseover = function(event, d) {
        d3.select(this).style('opacity', 1);
        tooltip.html("Country: " + d.country + "<br> Waste Generation (kg/person/day): " + d[yKey1] + "<br>Coastal Population: " + formatted(d[xKey1]))
            .style("opacity", 1);
    }

    // Position tooltip to follow mouse
    const mousemove = function(event, d) {
        tooltip.style("left", (event.pageX + tooltipOffsetScatter) + "px")
            .style("top", (event.pageY + tooltipOffsetScatter) + "px");
    }

    // Return tooltip to transparent when mouse leaves
    const mouseleave = function(event, d) {
        d3.select(this).style('opacity', 0.5);
        tooltip.style("opacity", 0);
    }

    circles = svg4.selectAll(".point")
        .data(data)
        .enter()
        .append("circle")
        .attr("cx", (d) => x3(d[xKey1]))
        .attr("cy", (d) => y3(d[yKey1]))
        .attr("r", 8)
        .attr("fill", "cornflowerblue")
        .style("opacity", 0.5)
        .style('stroke-width', 1)
        .style('stroke', 'black')
        .on("mouseover", mouseover)
        .on("mousemove", mousemove)
        .on("mouseleave", mouseleave);

    let continentLabel = d3.select('#scatter_viz')
        .append('text')
        .attr('x', 450)
        .attr('y', 100)
        .style('font-size', 25);

    function selectCircles() {
        selected = d3.brushSelection(this);
        if (selected == null){
            return;
        }
        selectedCircles = []
        continentLabel.text('');
        circles.classed('continent', false);
        circles.classed('brushed', function(d) {
            xMin = selected[0][0],
                xMax = selected[1][0],
                yMin = selected[0][1],
                yMax = selected[1][1],
                xValue = x3(d[xKey1]),
                yValue = y3(d[yKey1])
            return (xValue >= xMin && xValue <= xMax && yValue >= yMin && yValue <= yMax);
        });
        linkBarChart(svg4.selectAll('.brushed').data());
    };

    function linkBarChart(selectedData) {
        continents = [];
        for (i = 0; i < selectedData.length; i++) {
            continent = selectedData[i]['continent']
            if (!continents.includes(continent)) {
                continents.push(continent);
            };
        };
        bars.classed('linked', function(d) {
            return continents.includes(d.continent);
        });
    };
});

function openPage(evt, pageName) {
    // Declare all variables
    let i, tabcontent, tablinks;
    // Get all elements with class="tabcontent" and hide them
    tabcontent = document.getElementsByClassName("tabcontent");
    for (i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = "none";
    }
    // Get all elements with class="tablinks" and remove the class "active"
    tablinks = document.getElementsByClassName("tablinks");
    for (i = 0; i < tablinks.length; i++) {
        tablinks[i].className = tablinks[i].className.replace(" active", "");
    }
    // Show the current tab, and add an "active" class to the button that opened the tab
    document.getElementById(pageName).style.display = "block";
    evt.currentTarget.className += " active";
}

document.getElementById("defaultOpen").click();
