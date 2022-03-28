// Read in data and print to console
// d3.csv("data/plastic_pollution_data.csv").then((data) => {console.log(data)})

// Margins and dimensions
// const margin = { top: 50, right: 50, bottom: 50, left: 200 };
// const width = 900;
// const height = 650;


// Add graph placeholder
// const svg1 = d3.select("#vis-holder")
//     .append("svg")
//     .attr("width", width - margin.left - margin.right)
//     .attr("height", height - margin.top - margin.bottom)
//     .attr("viewBox", [0, 0, width, height]);

const width = Math.max(document.documentElement.clientWidth, window.innerWidth || 0),
    height = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);

const svg = d3.select("#vis-holder")
    .append("svg")
    .style("cursor", "move");

svg.attr("viewBox", "50 10 " + width + " " + height)
    .attr("preserveAspectRatio", "xMinYMin");

let map = svg.append("g")
    .attr("class", "map");
const zoom = d3.zoom()
    .on("zoom", function () {
        let transform = d3.zoomTransform(this);
        map.attr("transform", transform);
    });

svg.call(zoom);


d3.queue()
    .defer(d3.json, "data/50m.json")
    .defer(d3.json, "data/population.json")
    .await(function (error, world, data) {
        if (error) {
            console.error('Oh dear, something went wrong: ' + error);
        }
        else {
            drawMap(world, data);
        }
    });

function drawMap(world, data) {
    // geoMercator projection
    const projection = d3.geoMercator() //d3.geoOrthographic()
        .scale(130)
        .translate([width / 2, height / 1.5]);

    // geoPath projection
    let path = d3.geoPath().projection(projection);

    //colors for population metrics
    let color = d3.scaleThreshold()
        .domain([10000, 100000, 500000, 1000000, 5000000, 10000000, 50000000, 100000000, 500000000, 1500000000])
        .range(["#f7fcfd", "#e0ecf4", "#bfd3e6", "#9ebcda", "#8c96c6", "#8c6bb1", "#88419d", "#810f7c", "#4d004b"]);

    let features = topojson.feature(world, world.objects.countries).features;
    let populationById = {};

    data.forEach(function (d) {
        populationById[d.country] = {
            total: +d.total,
            females: +d.females,
            males: +d.males
        }
    });
    features.forEach(function (d) {
        d.details = populationById[d.properties.name] ? populationById[d.properties.name] : {};
    });

    map.append("g")
        .selectAll("path")
        .data(features)
        .enter().append("path")
        .attr("name", function (d) {
            return d.properties.name;
        })
        .attr("id", function (d) {
            return d.id;
        })
        .attr("d", path)
        .style("fill", function (d) {
            return d.details && d.details.total ? color(d.details.total) : undefined;
        })
        .on('mouseover', function (d) {
            d3.select(this)
                .style("stroke", "white")
                .style("stroke-width", 1)
                .style("cursor", "pointer");

            d3.select(".country")
                .text(d.properties.name);

            d3.select(".females")
                .text(d.details && d.details.females && "Female " + d.details.females || "¯\\_(ツ)_/¯");

            d3.select(".males")
                .text(d.details && d.details.males && "Male " + d.details.males || "¯\\_(ツ)_/¯");

            d3.select('.details')
                .style('visibility', "visible")
        })
        .on('mouseout', function (d) {
            d3.select(this)
                .style("stroke", null)
                .style("stroke-width", 0.25);

            d3.select('.details')
                .style('visibility', "hidden");
        });
}

