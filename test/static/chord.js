// Get data
var fileName = "../../data/test10.json";
var txtFile = new XMLHttpRequest();
txtFile.onreadystatechange = function () {
    if (txtFile.readyState === 4 && txtFile.status == 200) {
        var data = JSON.parse(txtFile.responseText);
        createGraph(data);
    }
}
txtFile.open("GET", fileName);
txtFile.send();


function createGraph(data){
  var subs = Object.keys(data)



  var svg = d3.select("body")
    .append("svg")
      .attr("width", 800)
      .attr("height", 800)
    .append("g")
      .attr("transform", "translate(400,400)")

  var matrix = [];
  for (let sub of subs){
    submatrix = []
    for (let sub2 of subs){
      submatrix.push(data[sub][sub2])
    }
    matrix.push(submatrix)
  }


  // create a matrix

  // 4 groups, so create a vector of 4 colors
  var colors = ['#8dd3c7','#ffffb3','#bebada','#fb8072','#80b1d3','#fdb462','#b3de69','#fccde5','#d9d9d9','#bc80bd']

  // give this matrix to d3.chord(): it will calculates all the info we need to draw arc and ribbon
  var res = d3.chord()
      .padAngle(0.05)
      .sortSubgroups(d3.descending)
      (matrix)
  console.log(res)
      // Add the links between groups
  var links = svg
    .datum(res)
    .append("g")
    .selectAll("path")
    .data(function(d) {
      return d;
    })
    .enter()
    .append("path")
      .attr("d", d3.ribbon()
        .radius(350)
      )
      .style("fill", function(d){ return(colors[d.source.index]) }) // colors depend on the source group. Change to target otherwise.
      .style("stroke", "black");

  var group = svg
    .datum(res)
    .append("g")
    .selectAll("g")
    .data(function(d) { return d.groups; })
    .enter()

  // add the groups on the outer part of the circle
  group
    .datum(res)
    .append("g")
    .selectAll("g")
    .data(function(d) { return d.groups; })
    .enter()
    .append("g")
    .append("path")
      .style("fill", function(d,i){ return colors[i] })
      .style("stroke", "black")
      .attr("d", d3.arc()
        .innerRadius(350)
        .outerRadius(360)
      )

    d3.select(".tooltipChord").remove();
    var tooltip = d3.select("body")
          .append("div")
          .attr("class", "tooltipChord")
          .style("visibility", "hidden");

    links.on("mouseover", function (d){
      d3.selectAll("path").style("opacity", 0.25)
      d3.select(this).style("stroke", "#83ff36")
      .style("stroke-width", 2)
      .style("opacity", 1)
      tooltip.style("visibility", "visible")
      tooltipText = "<b>" + subs[d["source"]["index"]] + "</b>:  " + d["source"]["value"] + "<br><b>"+  subs[d["target"]["index"]] + "</b>:   " + d["target"]["value"]
      tooltip.html(tooltipText)
      console.log(tooltipText)
    })

    links.on("mousemove", function(){
    tooltip.style("left", (d3.event.pageX + 10) + "px")
          .style("top", (d3.event.pageY) - 70 + "px");
        })

  links.on("mouseout", function(){
    d3.select(this).style("stroke", "black")
    .style("stroke-width", 1)
    d3.selectAll("path").style("opacity", 1)
    tooltip.style("visibility", "hidden");
  })





}
