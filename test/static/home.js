
// set the dimensions and margins of the graph
var margin = {top: 30, right: 30, bottom: 70, left: 60},
    width = 460 - margin.left - margin.right,
    height = 400 - margin.top - margin.bottom;

// append the svg object to the body of the page
var svg = d3.select("#my_dataviz")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform",
        "translate(" + margin.left + "," + margin.top + ")");

//Read the data
d3.csv("scatterplot.csv", function(data) {

    console.log("reading csv")
    var data_source = [];
    var data_anger = [];
    var data_sad = [];
    var data_swear = [];
    var data_sentiment = [];
    data.forEach(function (item) {
        data_source.push(item.SOURCE_SUBREDDIT)
        var key = item.SOURCE_SUBREDDIT
        var anger = {"source": key, "value": item.mean_liwc_anger}
        var sad = {"source": key, "value":item.mean_liwc_sad}
        var swear = {"source": key, "value":item.mean_liwc_swear}
        var sentiment = {"source": key, "value":item.mean_vader_sentiment}

        data_anger.push(anger)
        data_sad.push(sad)
        data_swear.push(swear)
        data_sentiment.push(sentiment)

    })
    console.log(data_sentiment)
    data_anger.map(function(d) { console.log( d.source)})

    // Add X axis
    var x = d3.scaleBand()
        .range([ 0, width ])
        .domain(data_anger.map(function(d) { return d.source; }))
        .padding(0.2);
    svg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x))
        .selectAll("text")
        .attr("transform", "translate(-10,0)rotate(-45)")
        .style("text-anchor", "end");

    // Add Y axis
    var y = d3.scaleLinear()
        .domain([-2, 1])
        .range([ height, 0]);
    svg.append("g")
        .call(d3.axisLeft(y));

    // Add dots
    svg.selectAll(".bar")
        .data(data_anger)
        .enter()
        .append("rect")
        .attr("x", function(d) { return x(d.source); })
        .attr("y", function(d) { return y(d.value); })
        .attr("width", x.bandwidth())
        .attr("height", function(d) { return height - y(d.Value); })
        .attr("fill", "#69b3a2")

})

