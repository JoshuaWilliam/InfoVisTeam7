
function createNewChart2() {
    var margin = {top: 10, right: 30, bottom: 20, left: 50},
        width = 1000 - margin.left - margin.right,
        height = 400 - margin.top - margin.bottom;

    var svg = d3.select("#my_dataviz2")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")");


    d3.csv("../../data/scatterplot.csv", function(data) {

        console.log("csv data1:", data)

        var subgroups = data.columns.slice(1)
        var groups = d3.map(data, function(d){return(d.SOURCE_SUBREDDIT)}).keys()
        console.log("groups1:", groups)

        var x = d3.scaleBand()
            .domain(groups)
            .range([0, width])
            .padding([0.2])
        svg.append("g")
            .attr("transform", "translate(0," + (height/2) + ")")
            .call(d3.axisBottom(x).tickSize(0));

        var y = d3.scaleLinear()
            .domain([-0.3, 0.3])
            .range([ height, 0 ]);
        svg.append("g")
            .call(d3.axisLeft(y));

        //add tooltips
        var tooltip = d3.select("#my_dataviz2")
            .append("div")
            .style("opacity", 0)
            .attr("class", "tooltip")
            .style("background-color", "white")
            .style("border", "solid")
            .style("border-width", "1px")
            .style("border-radius", "5px")
            .style("padding", "10px")

        var mouseover = function(d) {
            tooltip
                .style("opacity", 1)
        }

        var mousemove = function(d) {
            tooltip
                .html("The exact value of<br>" + d.key + "<br>is<br>" + d.value )
                .style("left", (d3.mouse(this)[0]+90) + "px")
                .style("top", (d3.mouse(this)[1]) + "px")
        }

        var mouseleave = function(d) {
            tooltip
                .transition()
                .duration(200)
                .style("opacity", 0)
        }

        var xSubgroup = d3.scaleBand()
            .domain(subgroups)
            .range([0, x.bandwidth()])
            .padding([0.05])

        // color palette = one color per subgroup
        var color = d3.scaleOrdinal()
            .domain(subgroups)
            .range(['#A52A2A','#FF8700','#4daf4b', '#FFEBCD'])

        svg.append("g")
            .selectAll("g")
            .data(data)
            .enter()
            .append("g")
            .attr("transform", function(d) { return "translate(" + x(d.SOURCE_SUBREDDIT) + ",0)"; })
            .selectAll("dot")
            .data(function(d) { return subgroups.map(function(key) { return {key: key, value: d[key]}; }); })
            .enter().append("circle")
            .attr("cx", function(d) { return xSubgroup(d.key); })
            .attr("cy", function(d) { return y(d.value); })
            .attr("r", 5)
            .attr("fill", function(d) { return color(d.key); })
            .on("mouseover", mouseover)
            .on("mousemove", mousemove)
            .on("mouseleave", mouseleave)

    })
};



