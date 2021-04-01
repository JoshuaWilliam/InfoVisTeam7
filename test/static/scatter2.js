var margin = { top: 50, right: 300, bottom: 50, left: 50 },
    outerWidth = 1050,
    outerHeight = 500,
    width = outerWidth - margin.left - margin.right,
    height = outerHeight - margin.top - margin.bottom;

var x = d3.scaleLinear()
    .range([0, width]).nice();

var y = d3.scaleLinear()
    .range([height, 0]).nice();

var xCat = "Feat_1",
    yCat = "Feat_2",
    rCat = "Feat_1",
    colorCat = "clusters";


highlightColors = ['#8dd3c7','#ffffb3','#bebada','#fb8072','#80b1d3','#fdb462','#b3de69','#fccde5','#d9d9d9','#bc80bd']
i = -1
function highlighter(sub1, sub2) {
  i++
  console.log(sub1)
  d3.selectAll("#circle_" + sub1)
  .moveToFront()
  .attr("r", 4)
  .style("fill", highlightColors[i])
  .style("fill-opacity", 1)
  .style("stroke", "black");
  d3.selectAll("#circle_" + sub2)
  .moveToFront()
  .attr("r", 4)
  .style("fill", highlightColors[i])
  .style("fill-opacity", 1)
  .style("stroke", "black");
  }

d3.selection.prototype.moveToFront = function() {
  return this.each(function(){
    this.parentNode.appendChild(this);
  });
};


d3.csv("../../data/Artitra.csv", function(data) {
  data.forEach(function(d) {
    d.Feat_2 = +d.Feat_2;
    d.Feat_1 = +d.Feat_1;
  });

  var xMax = d3.max(data, function(d) { return d[xCat]; }) * 1.05,
      xMin = d3.min(data, function(d) { return d[xCat]; }),
      xMin = xMin > 0 ? 0 : xMin,
      yMax = d3.max(data, function(d) { return d[yCat]; }) * 1.05,
      yMin = d3.min(data, function(d) { return d[yCat]; }),
      yMin = yMin > 0 ? 0 : yMin;

  x.domain([xMin, xMax]);
  y.domain([yMin, yMax]);

  var xAxis = d3.axisBottom()
      .scale(x)
      .tickSize(-height);

  var yAxis = d3.axisLeft()
      .scale(y)
      .tickSize(-width);

  var color =  d3.scaleOrdinal().range( [
"#66b24b",
"#c361aa",
"#4aac8b",
"#ca5437",
"#688dcd",
"#c98f44",
"#ca586f"]);

var tip = d3.select("body")
      .append("div")
      .attr("class", "tooltipScatter")
      .style("visibility", "hidden");

  /*
  var zoomBeh = d3.behavior.zoom()
      .x(x)
      .y(y)
      .scaleExtent([0, 500])
      .on("zoom", zoom);
  */

  var svg = d3.select("#scatter")
    .append("svg")
      .attr("width", outerWidth)
      .attr("height", outerHeight)
    .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
      //.call(zoomBeh);


  svg.append("rect")
      .attr("width", width)
      .attr("height", height)
      .attr("class", "scatterbackground");

  svg.append("g")
      .classed("x axis", true)
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis)
    .append("text")
      .classed("label", true)
      .attr("x", width)
      .attr("y", margin.bottom - 10)
      .style("text-anchor", "end")
      .text(xCat);

  svg.append("g")
      .classed("y axis", true)
      .call(yAxis)
    .append("text")
      .classed("label", true)
      .attr("transform", "rotate(-90)")
      .attr("y", -margin.left)
      .attr("dy", ".71em")
      .style("text-anchor", "end")
      .text(yCat);

  var objects = svg.append("svg")
      .classed("objects", true)
      .attr("width", width)
      .attr("height", height);

  objects.append("svg:line")
      .classed("axisLine hAxisLine", true)
      .attr("x1", 0)
      .attr("y1", 0)
      .attr("x2", width)
      .attr("y2", 0)
      .attr("transform", "translate(0," + height + ")");

  objects.append("svg:line")
      .classed("axisLine vAxisLine", true)
      .attr("x1", 0)
      .attr("y1", 0)
      .attr("x2", 0)
      .attr("y2", height);

  var dots = objects.selectAll(".dot")
      .data(data)
    .enter().append("circle")
      .classed("dot", true)
      .attr("r", 3)//function (d) { return 6 * Math.sqrt(d[rCat] / Math.PI); }
      .attr("transform", transform)
      .style("fill", function(d) { return color(d[colorCat]); })
      .attr("id", function(d) { return "circle_" + d["SOURCE_SUBREDDIT"]; })
      .on("mouseover", tip.show)
      .on("mouseout", tip.hide);

  var legend = svg.selectAll(".legend")
      .data(color.domain())
    .enter().append("g")
      .classed("legend", true)
      .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });

  legend.append("circle")
      .attr("r", 3.5)
      .attr("cx", width + 20)
      .attr("fill", color);

  legend.append("text")
      .attr("x", width + 26)
      .attr("dy", ".35em")
      .text(function(d) { return d; });

  dots.on("mouseenter", function (d){
    tip.style("visibility", "visible")
    tooltipText = "/r/" + d['SOURCE_SUBREDDIT']
    tip.html(tooltipText)
  })

  dots.on("mousemove", function(){
  tip.style("left", (d3.event.pageX + 10) + "px")
        .style("top", (d3.event.pageY) - 30 + "px");
      })

  dots.on("mouseout", function(){
    tip.style("visibility", "hidden");
  })

  //d3.select("input").on("click", change);


  function zoom() {
    svg.select(".x.axis").call(xAxis);
    svg.select(".y.axis").call(yAxis);

    svg.selectAll(".dot")
        .attr("transform", transform);
  }

  function transform(d) {
    return "translate(" + x(d[xCat]) + "," + y(d[yCat]) + ")";
  }



});
