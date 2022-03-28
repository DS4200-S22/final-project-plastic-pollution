// Read in data and print to console
d3.csv("data/plastic_pollution_data.csv").then((data) => {console.log(data)})

// WORLD MAP CODE STARTS HERE...
const w = 920;
const h = 480;
const svg = d3.select("#vis-holder").append("svg").attr("preserveAspectRatio", "xMinYMin meet").style("background-color", "#62b6ef")
    .attr("viewBox", "0 0 " + w + " " + h)
    .classed("svg-content", true);

let projection = d3.geoEquirectangular()
let path = d3.geoPath().projection(projection);

// load data
const worldmap = d3.json("data/countries.geojson");
const cities = d3.csv("data/cities.csv");

Promise.all([worldmap, cities]).then(function(values){
    // draw map
    svg.selectAll("path")
        .data(values[0].features)
        .enter()
        .append("path")
        .attr("class","continent")
        .attr("d", path)
        .style("fill", "#050505")
        .style("stroke", "#f86405")
        .style("stroke-width", "0.3")

        // // draw points
        // svg.selectAll("circle")
        //     .data(values[1])
        //     .enter()
        //     .append("circle")
        //     .attr("class","circles")
        //     .attr("cx", function(d) {return projection([d.Longitude, d.Lattitude])[0];})
        //     .attr("cy", function(d) {return projection([d.Longitude, d.Lattitude])[1];})
        //     .attr("r", "1px"),
        // // add labels
        // svg.selectAll("text")
        //     .data(values[1])
        //     .enter()
        //     .append("text")
        //     .text(function(d) {
        //         return d.City;
        //     })
        //     .attr("x", function(d) {return projection([d.Longitude, d.Lattitude])[0] + 5;})
        //     .attr("y", function(d) {return projection([d.Longitude, d.Lattitude])[1] + 15;})
        //     .attr("class","labels");

});


// PIE CHART CODE STARTS HERE...
// set the dimensions and margins of the graph
const width2 = 450
const height2 = 450
const margin2 = 40

// The radius of the pieplot is half the width or half the height (smallest one). I subtract a bit of margin.
const radius = Math.min(width2, height2) / 2 - margin2;

// append the svg object to the div called 'viz-holder'
let svg2 = d3.select("#viz-holder")
    .append("svg")
    .attr("width", width2)
    .attr("height", height2)
    .append("g")
    .attr("transform", "translate(" + width2 / 2 + "," + height2 / 2 + ")");

// Create dummy data
const data2 = {a: 9, b: 20, c: 30, d: 8, e: 12};

// set the color scale
let color = d3.scaleOrdinal()
    .domain(data2)
    .range(["#98abc5", "#8a89a6", "#7b6888", "#6b486b", "#a05d56"]);

// Compute the position of each group on the pie:
let pie = d3.pie()
    .value(function (d) {
        return d.value;
    });
const data_ready = pie(d3.entries(data2));

// Build the pie chart: Basically, each part of the pie is a path that we build using the arc function.
svg2.selectAll('path')
    .data(data_ready)
    .enter()
    .append('path')
    .attr('d', d3.arc()
        .innerRadius(100)         // This is the size of the donut hole
        .outerRadius(radius))
    .attr('fill', function(d){ return(color(d.data.key)) })
    .attr("stroke", "black")
    .style("stroke-width", "2px")
    .style("opacity", 0.7)

