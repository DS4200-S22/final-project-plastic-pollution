// Read in data and print to console
d3.csv("data/updated_data.csv").then((data) => {
    console.log(data)
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

    Promise.all([worldmap, cities]).then(function (values) {
        // draw map
        svg.selectAll("path")
            .data(values[0].features)
            .enter()
            .append("path")
            .attr("class", "continent")
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

    console.log(averages)

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
        width4 = 800 - margin4.left - margin4.right,
        height4= 800 - margin4.top - margin4.bottom;

// append the svg object to the body of the page

    var svg5 = d3.select("#bar")
        .append("svg")
        .attr("width", width4 + margin4.left + margin4.right)
        .attr("height", height4 + margin4.top + margin4.bottom)
        .append("g");
    //.attr("transform",`translate(${margin4.left},${margin4.top})`);

// Parse the Data
    d3.csv("data/updated_data.csv").then(function(data) {

        // Another scale for subgroup position?
        const xSubgroup = d3.scaleBand()
            .rangeRound([(margin4.left - 22), width4])
            .paddingInner(0.1);

        //X Scale for spacing each group's bar
        let x1 = d3.scaleBand()
            .padding(0.05);

        // color palette = one color per subgroup
        const color = d3.scaleOrdinal()
            .range(['#e41a1c','#377eb8'])

        let continent2010sums = d3
            .rollups( data,
                (xs) => d3.sum(xs, (x) => x['mismanaged_plastic_waste_in_2010(tonnes)']),
                (d) => d.continent
            )
            .map(([k, v]) => ({ continent: k, 'wastein2010': v }));


        let continent2025sum = d3
            .rollups( data,
                (xs) => d3.sum(xs, (x) => x['mismanaged_plastic_waste_in_2025(tonnes)']),
                (d) => d.continent
            )
            .map(([k, v]) => ({ continent: k, 'wastein2025': v }));

        let merged = [];

        for(let i=0; i<continent2010sums.length; i++) {
          merged.push({
           ...continent2010sums[i], 
           ...continent2025sum[i]
          });
        }

        console.log(merged);

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
                                     .tickValues(merged.map(d=>d.key));

         // create y scale
         let y   = d3.scaleLinear().rangeRound([height, 0]);
         let yAxis = d3.axisLeft().scale(y);

         // color palette, each subgroup has a distinct color
         const color = d3.scaleOrdinal()
         .range(['#f4a582','#92c5de'])

         // continent names and mismanaged plastic waste values
         let continent = merged.map(function(d) { return d.key; });
         let mismanaged_plastic = merged[0].values.map(function(d) { return d.wastein2010; });

         x0.domain(continent);
         x1.domain(mismanaged_plastic).rangeRound([0, x0.bandwidth()]);
         y.domain([0, d3.max(merged, function(key) { return d3.max(key.values, function(d) { return d.wastein2025; }); })]);

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
           .data(merged)
           .enter().append("g")
           .attr("class", "g")
           .attr("transform",function(d) { return "translate(" + x0(d.key) + ",0)"; });

           // create bars
           slice.selectAll("rect")
           .data(function(d) { return d.values; })
             .enter().append("rect")
                 .attr("width", x1.bandwidth())
                 .attr("x", function(d) { return x1(d.wastein2010); })
                  .style("fill", function(d) { return color(d.wastein2010) })
                  .attr("y", function(d) { return y(d.wastein2025); })
                  .attr("height", function(d) { return height - y(d.wastein2025); })

          let keys = ["mismanaged_plastic_waste_in_2010(tonnes)","mismanaged_plastic_waste_in_2025(tonnes)"];

          // List of groups = each country
          const groups = ["Europe", "Africa", "North America", "South America","Oceania", "Asia", ]
          
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
              .call(d3.axisLeft(y))
              .call((g) => g.append("text")
                  .attr("transform", "rotate(-90)")
                  .attr("dy", ".71em")
                  .attr("x", 0)
                  .attr("y", margin4.top - 15)
                  .attr("fill", "black")
                  .attr("text-anchor", "end")
                  .text("Mismanaged plastic waste (tonnes)"));

          // Show the bars
          svg5.append("g")
              .selectAll("g")
              // Enter in data = loop group per group
              .data(merged)
              .enter()
              .append("g")
              .attr("transform", function(d) { return "translate(" + x(d.continent) + ",0)"; })
              .selectAll("rect")
              .data(function(d) { return keys.map(function(key) { return {key: key, value: d[key]}; }); })
              .enter().append("rect")
              .attr("x", function(d) { return xSubgroup(d.key); })
              .attr("y", function(d) { return y(d.value); })
              .attr("width", xSubgroup.bandwidth())
              .attr("height", function(d) { return height4 - y(d.value); })
              .attr("fill", function(d) { return color(d.key); });

      // })
      
// -----------  Scatterplot:-------------

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

        svg4.selectAll(".point")
            .data(data)
            .enter()
            .append("circle")
            .attr("cx", (d) => x3(d[xKey1]))
            .attr("cy", (d) => y3(d[yKey1]))
            .attr("r", 8)
            .style("opacity", 0.5);
    }
})

