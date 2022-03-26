//This is filler -- delete it and start coding your visualization tool here
d3.select("#vis-container")
  .append("text")
  .attr("x", 20)
  .attr("y", 20)
  .text("Hello World!");

// Read in data and print to console
d3.csv("data/plastic_pollution_data.csv").then((data) => {console.log(data)})

