// Read in data and print to console
d3.csv("data/updated_data.csv").then((data) => {console.log(data)})

// WORLD MAP CODE STARTS HERE...
const w = 920;
const h = 480;
const svg = d3.select("#map").append("svg").attr("preserveAspectRatio", "xMinYMin meet").style("background-color", "#62b6ef")
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
// SOURCE: https://www.educative.io/edpresso/how-to-create-a-pie-chart-using-d3
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


