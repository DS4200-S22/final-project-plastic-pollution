// Read in data and print to console
d3.csv("data/updated_data.csv").then((data) => {console.log(data)})

// WORLD MAP CODE STARTS HERE...
// SOURCE1: https://d3-graph-gallery.com/graph/choropleth_hover_effect.html
// SOURCE2:

// The svg
let svg = d3.select("svg"),
    width1 = +svg.attr("width"),
    height1 = +svg.attr("height"),
    margin1 = {top: 20, right: 10, bottom: 40, left: 100};

// const labels = ["< 500000 kg/day", "< 500000 kg/day - < 100000000 kg/day", "> 100000000 kg/day"]

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
            // .style("opacity", .5)
        d3.select(this)
            .transition()
            .duration(200)
            // .style("opacity", 1)
            .style("stroke", "black")

        d3.select(this)
            .on("click", makeAnnotations)

        // tooltip
        d3.selectAll("#annotation")
            .style("opacity", 0)
            .style("opacity", 0.8)
            // .style("left", (event.pageX) + "px")
            // .style("top", (event.pageY - 28) + "px");
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

// PIE CHART CODE STARTS HERE...
// SOURCE: https://www.geeksforgeeks.org/d3-js-pie-function/
// set the dimensions and margins of the graph
const width2 = 450
const height2 = 450
const margin2 = 40

// The radius of the pieplot is half the width or half the height (smallest one). I subtract a bit of margin.
const radius = Math.min(width2, height2) / 2 - margin2;

// append the svg object to the div called 'viz-holder'
var svg2 = d3.select("#pie")
    .append("svg")
    .attr("width", width2)
    .attr("height", height2)
    .append("g")
    .attr("transform", "translate(" + width2 / 2 + "," + height2 / 2 + ")");

// Create dummy data
var data2 = [{name: "A", share: 20.70},
    {name: "B", share: 30.92},
    {name: "C", share: 15.42},
    {name: "D", share: 13.65},
    {name: "E", share: 19.31}];


// set the color scale (doesn't work)
//var color = d3.scaleOrdinal()
//.domain(data2)
//.range(["#98abc5", "#8a89a6", "#7b6888", "#6b486b", "#a05d56"])

// Creaing pie chart:
var pie = d3.pie().value(function(d) {
    return d.share;
});

// Creating arc
var arc = d3.arc()
    .outerRadius(radius)
    .innerRadius(0);

// Grouping different arcs
var arcs = svg2.selectAll("arc")
    .data(pie(data2))
    .enter()
    .append("g");

// Appending path
arcs.append("path")
    .attr("fill", (data, i)=>{
        let value=data.data2;
        return d3.schemeSet3[i+1];
    })
    .attr("d", arc);

// Add Labels
var label = d3.arc()
    .outerRadius(radius)
    .innerRadius(0);


arcs.append("text")
    .attr("transform", function(d) {
        return "translate(" + label.centroid(d) + ")";
    })
    .text(function(d) { return d.data.name; })
    .style("font-family", "arial")
    .style("font-size", 15);


// Build the pie chart: Basically, each part of the pie is a path that we build using the arc function.

// DOUBLE BAR GRAPH CODE STARTS HERE...
// SOURCE: https://bl.ocks.org/LyssenkoAlex/21df1ce37906bdb614bbf4159618699d

// hardcoded data for barchart
const bar_data = [
    { key: 'North America', values:
            [
                {grpName:'2010', grpValue:30},
                {grpName:'2025', grpValue:50}
            ]
    },
    { key: 'South America', values:
            [
                {grpName:'2010', grpValue:20},
                {grpName:'2025', grpValue:25}
            ]
    },
    { key: 'Africa', values:
            [
                {grpName:'2010', grpValue:15},
                {grpName:'2025', grpValue:20}
            ]
    },
    { key: 'Asia', values:
            [
                {grpName:'2010', grpValue:40},
                {grpName:'2025', grpValue:55}
            ]
    },
    { key: 'Europe', values:
            [
                {grpName:'2010', grpValue:30},
                {grpName:'2025', grpValue:45}
            ]
    },
    { key: 'Australia', values:
            [
                {grpName:'2010', grpValue:20},
                {grpName:'2025', grpValue:30}
            ]
    },

    { key: 'Antartica', values:
            [
                {grpName:'2010', grpValue:5},
                {grpName:'2025', grpValue:10},
            ]
    }
];

// set dimensions and margins of graph
let margin = {top: 20, right: 20, bottom: 30, left: 40},
    width = 800 - margin.left - margin.right,
    height = 400 - margin.top - margin.bottom;

// append svg object to the body of the page to house bar chart
const svg3 = d3.select("#bar")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

/*
   Axes
 */

// create x scale
let x0  = d3.scaleBand().rangeRound([0, width], 0.).padding(0.2);
let x1  = d3.scaleBand();
let xAxis = d3.axisBottom().scale(x0)
    .tickValues(bar_data.map(d=>d.key));

// create y scale
let y   = d3.scaleLinear().rangeRound([height, 0]);
let yAxis = d3.axisLeft().scale(y);

// color palette, each subgroup has a distinct color
const color = d3.scaleOrdinal()
    .range(['#f4a582','#92c5de'])

// continent names and mismanaged plastic waste values
let continent = bar_data.map(function(d) { return d.key; });
let mismanaged_plastic = bar_data[0].values.map(function(d) { return d.grpName; });

x0.domain(continent);
x1.domain(mismanaged_plastic).rangeRound([0, x0.bandwidth()]);
y.domain([0, d3.max(bar_data, function(key) { return d3.max(key.values, function(d) { return d.grpValue; }); })]);

// add x axis
svg3.append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + height + ")")
    .call(xAxis)
    .call((g) => g.append("text")
        .attr("x", (width - margin.right)/2)
        .attr("y", margin.bottom)
        .attr("fill", "black")
        .attr("text-anchor", "end")
        .text("Continent"));

// add y axis
svg3.append("g")
    .attr("class", "y axis")
    .call(yAxis)
    .call((g) => g.append("text")
        .attr("transform", "rotate(-90)")
        .attr("dy", ".71em")
        .attr("x", 0)
        .attr("y", margin.top - 15)
        .attr("fill", "black")
        .attr("text-anchor", "end")
        .text("Mismanaged plastic waste (tonnes)"));

// Add bars to graph
let slice = svg3.selectAll(".slice")
    .data(bar_data)
    .enter().append("g")
    .attr("class", "g")
    .attr("transform",function(d) { return "translate(" + x0(d.key) + ",0)"; });

// create bars
slice.selectAll("rect")
    .data(function(d) { return d.values; })
    .enter().append("rect")
    .attr("width", x1.bandwidth())
    .attr("x", function(d) { return x1(d.grpName); })
    .style("fill", function(d) { return color(d.grpName) })
    .attr("y", function(d) { return y(d.grpValue); })
    .attr("height", function(d) { return height - y(d.grpValue); })

/*
   Legend
*/

// Add legend to graph
let legend = svg3.selectAll(".legend")
    .data(bar_data[0].values.map(function(d) { return d.grpName; }).reverse())
    .enter().append("g")
    .attr("class", "legend")
    .attr("transform", function(d,i) { return "translate(0," + i * 20 + ")"; })

// create squares for legend
legend.append("rect")
    .attr("x", width - 18)
    .attr("width", 18)
    .attr("height", 18)
    .style("fill", function(d) { return color(d); });


// create text for legend
legend.append("text")
    .attr("x", width - 24)
    .attr("y", 9)
    .attr("dy", ".35em")
    .style("text-anchor", "end")
    .text(function(d) {return d; });
