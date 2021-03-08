// Get data
var fileName = "../../data/test20.json";
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
  var innerRadius = 250;
  var outerRadius = 256;


  var svg = d3.select("body")
    .append("svg")
      .attr("width", 800)
      .attr("height", 800)
    .append("g")
      .attr("transform", "translate(400,400)")

  var limit = 50

  var matrix = [];
  for (let sub of subs){
    submatrix = []
    for (let sub2 of subs){
      if (data[sub][sub2] + data[sub2][sub] < limit) {
        submatrix.push(0)
      }
      else {
        submatrix.push(data[sub][sub2])
      }
    }
    matrix.push(submatrix)
  }


  // create a matrix

  // 4 groups, so create a vector of 4 colors
  //var colors = ['#8dd3c7','#ffffb3','#bebada','#fb8072','#80b1d3','#fdb462','#b3de69','#fccde5','#d9d9d9','#bc80bd']
  var myColor = d3.scaleOrdinal().domain(data)
  .range(d3.schemeSet3);
  // give this matrix to d3.chord(): it will calculates all the info we need to draw arc and ribbon
  var res = d3.chord()
      .padAngle(0.05)
      .sortSubgroups(d3.descending)
      (matrix)

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
        .radius(innerRadius)
      )
      .style("fill", function(d, i){ return myColor(d.source.index) }) // colors depend on the source group. Change to target otherwise.
      .style("stroke", "#2b2b2b");

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
    .attr("class", "group")
    .selectAll("g")
    .data(function(d) { return d.groups; })
    .enter()
    .append("g")
    .append("path")
      .style("fill", function(d,i){ return myColor(i) })
      .style("stroke", "#2b2b2b")
      .attr("d", d3.arc()
        .innerRadius(innerRadius)
        .outerRadius(outerRadius)
      )

  group.append("g")

    .append("text")
    .attr("transform", function(d, i) {

      var extra_rot =  (d.groups[i].startAngle + d.groups[i].endAngle) / 2 > Math.PI ? 180 : 0;
      console.log(extra_rot)
      return "rotate(" + ((d.groups[i].startAngle + d.groups[i].endAngle) / (2 * Math.PI) * 180 - 90) + ")"+ "translate(" + (outerRadius+ 10).toString() + ",0)";})
    //.attr("transform", function(d, i) { return (d.groups[i].startAngle + d.groups[i].endAngle) / 2 > Math.PI ? "rotate(180)translate(-16)" : null; })
    .attr("class", "ticklabels")
    .text(function(d, i) {
      return subs[i]
    });







    d3.select(".tooltipChord").remove();
    var tooltip = d3.select("body")
          .append("div")
          .attr("class", "tooltipChord")
          .style("visibility", "hidden");

    links.on("mouseover", function (d){
      d3.selectAll("path").style("opacity", 0.25)
      d3.select(this)
      .style("stroke-width", 2)
      .style("opacity", 1)
      tooltip.style("visibility", "visible")
      tooltipText = "<b>" + subs[d["source"]["index"]] + "</b>:  " + d["source"]["value"] + "<br><b>"+  subs[d["target"]["index"]] + "</b>:   " + d["target"]["value"]
      tooltip.html(tooltipText)
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

function groupTicks(d) {

  var k = (d.endAngle - d.startAngle) / d.value;
  return d3.range(0, d.value, 1).map(function(v, i) {
    return {
      angle: v * k + d.startAngle,
      label: i % 5 ? null : v + "%"
    };
  });
};
