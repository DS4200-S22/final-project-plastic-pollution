// Read in data and print to console

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
// SOURCE: https://www.geeksforgeeks.org/d3-js-pie-function/
// set the dimensions and margins of the graph
const width2 = 450
const height2 = 450
const margin2 = 40

// The radius of the pieplot is half the width or half the height (smallest one). I subtract a bit of margin.
const radius = Math.min(width2, height2) / 2 - margin2;

// append the svg object to the div called 'viz-holder'
let svg2 = d3.select("#pie")
    .append("svg")
    .attr("width", width2)
    .attr("height", height2)
    .append("g")
    .attr("transform", "translate(" + width2 / 2 + "," + height2 / 2 + ")");

// Create dummy data
const data2 = [{name: "A", share: 20.70},
                    {name: "B", share: 30.92},
                    {name: "C", share: 15.42},
                    {name: "D", share: 13.65},
                    {name: "E", share: 19.31}];

// set the color scale (doesn't work)
//const color = d3.scaleOrdinal()
  //.domain(data2)
  //.range(["#98abc5", "#8a89a6", "#7b6888", "#6b486b", "#a05d56"])

// Creaing pie chart:
const pie = d3.pie().value(function(d) {
                return d.share;
            });

// Creating arc
const arc = d3.arc()
                .outerRadius(radius)
                .innerRadius(0);

// Grouping different arcs
const arcs = svg2.selectAll("arc")
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
const label = d3.arc()
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

/*

// DOUBLE BAR GRAPH CODE STARTS HERE...
// SOURCE: https://bl.ocks.org/LyssenkoAlex/21df1ce37906bdb614bbf4159618699
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
 /*

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

/*
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

*/

// set the dimensions and margins of the graph
var margin4 = {top: 10, right: 30, bottom: 20, left: 50},
    width4 = 1500 - margin4.left - margin4.right,
    height4= 1500 - margin4.top - margin4.bottom;

// append the svg object to the body of the page

var svg5 = d3.select("#bar")
    .append("svg")
    .attr("width", width4 + margin4.left + margin4.right)
    .attr("height", height4 + margin4.top + margin4.bottom)
    .append("g");
    //.attr("transform",`translate(${margin4.left},${margin4.top})`);

// Parse the Data

d3.csv("data/updated_data.csv").then(function(data) {

    // List of subgroups = header of the csv files = soil condition here
    const subgroups = data.columns.slice(13, 15)
console.log(subgroups)
    // List of groups = each country
    const groups = data.map(d => d.country)
console.log(groups)

    // Add X axis
    const x = d3.scaleBand()
        .domain(groups)
        .range([0, width4])
        .padding([0.2])
    svg.append("g")
        .attr("transform", "translate(0," + height4 + ")")
        .call(d3.axisBottom(x).tickSize(0));

    // Add Y axis
    const y = d3.scaleLinear()
        .domain([0, 40])
        .range([ height4, 0 ]);
    svg5.append("g")
        .call(d3.axisLeft(y));

    // Another scale for subgroup position?
    const xSubgroup = d3.scaleBand()
        .domain(subgroups)
        .range([0, x.bandwidth()])
        .padding([0.05])

    // color palette = one color per subgroup
    const color = d3.scaleOrdinal()
        .domain(subgroups)
        .range(['#e41a1c','#377eb8'])

    // Show the bars
    svg5.append("g")
        .selectAll("g")
        // Enter in data = loop group per group
        .data(data)
        .enter()
        .append("g")
        .attr("transform", function(d) { return "translate(" + x(d.country) + ",0)"; })
        .selectAll("rect")
        .data(function(d) { return subgroups.map(function(key) { return {key: key, value: d[key]}; }); })
        .enter().append("rect")
        .attr("x", function(d) { return xSubgroup(d.key); })
        .attr("y", function(d) { return y(d.value); })
        .attr("width", xSubgroup.bandwidth())
        .attr("height", function(d) { return height4 - y(d.value); })
        .attr("fill", function(d) { return color(d.key); });

})


// Scatterplot:
d3.csv("data/updated_data.csv").then(function(data) {

    {
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

 /*
        // Find max x
        let maxX3 = d3.max(data, function(d) { return d[xKey1]; });

        // Create X scale
        let x3 = d3.scaleLinear()
            .domain([0, maxX3])
            .range([margin3.left, width3 - margin3.right]);

        // Find max y
        let maxY3 = d3.max(data, function (d) { return d[yKey1]; });

        // Create Y scale
        let y3 = d3.scaleLinear()
            .domain([0, maxY3])
            .range([height3 - margin3.bottom, margin3.top]);


        // Add x axis
        svg4.append("g")
            .attr("transform", "translate(0," + height3 + ")")
            .call(d3.axisBottom(x3))
            .attr("font-size", '10px')
            .call((g) => g.append("text")
                .attr("x", width3 - margin3.right)
                .attr("y", margin3.bottom -4 )
                .attr("fill", "black")
                .attr("text-anchor", "middle")
                .text("Coastal Population")
    );

        // Add y axis
        svg4.append("g")
            .call(d3.axisLeft(y3))
            .attr("font-size", '10px')
            .call((g) => g.append("text")
                .attr("transform", "rotate(-90)")
                .attr("x", 0)
                .attr("y", margin3.top -4)
                .attr("fill", "black")
                .attr("text-anchor", "middle")
                .text("Waste Generation (kg/person/day)")
            );

*/


        // Find max x
        let maxX1 = d3.max(data, (d) => { return d[xKey1]; });

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
                .attr("x", width3/ 2)
                .attr("y", margin3.bottom - 4)
                .attr("fill", "black")
                .attr("text-anchor", "end")
                .text("Coastal Population" )
            );

        // Find max y
        let maxY1 = d3.max(data, (d) => { return d[yKey1];});

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
                .attr("x", -(height3/3))
                .attr("transform", `rotate(-90)`)
                .attr("y", margin3.top - 100)
                .attr("fill", "black")
                .attr("text-anchor", "end")
                .text("Waste Generation (kg/person/day)")
            );

        svg4.selectAll(".point")
            .data(data)
            .enter()
            .append("circle")
            .attr("cx", (d) => x3(d[xKey1]))
            .attr("cy", (d) => y3(d[yKey1]))
            .attr("r", 8)
            .style("opacity", 0.5);
    }
});
