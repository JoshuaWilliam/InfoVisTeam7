// Get data
var fileName = "../../data/test25.json";
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
  var outerRadius = 260;


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
      .style("stroke", "#2b2b2b")
      .style("stroke-width", 0.7)
      .attr("source", function(d) {return d.source.index})
      .attr("target", function(d) {return d.target.index})

var group = svg
    .datum(res)
    .append("g")
    .attr("class", "group")
    .selectAll("g")
    .data(function(d) { return d.groups; })
    .enter()

var arcs = group
    .append("path")
      .style("fill", function(d,i){ return myColor(i) })
      .style("stroke", "#2b2b2b")
      .style("stroke-width", 0.7)
      .attr("class", "arc")
      .attr("d", d3.arc()
        .innerRadius(innerRadius)
        .outerRadius(outerRadius)
      );


  group.append("text")
    .attr("transform", function(d, i) {
      var rotateBool = false;
      if ((d.startAngle + d.endAngle) / 2 > Math.PI) {
        rotateBool = true;
      }
      var extra_rot = rotateBool ? 180 : 0;
      var translateSign = rotateBool ? -1 : 1;
      return "rotate(" + ((d.startAngle + d.endAngle) / (2 * Math.PI) * 180 - 90 + extra_rot) + ")"+ "translate(" + ((outerRadius+ 10) * translateSign ).toString() + ",0)";})
    .style("text-anchor", function(d) { return ((d.startAngle + d.endAngle) / 2 > Math.PI) ? "end" : null; })
    .attr("class", "ticklabels")
    .text(function(d) {
      return subs[d.index]
    });


    var opacityLow = 0.2;


    d3.select(".tooltipChord").remove();
    var tooltip = d3.select("body")
          .append("div")
          .attr("class", "tooltipChord")
          .style("visibility", "hidden");

    links.on("mouseenter", function (d){
      d3.selectAll("path").style("opacity", opacityLow);
      d3.selectAll(".arc")
        .style("opacity", function (a){
          return d.source.index === a.index || d.target.index === a.index ? 1 : opacityLow;
        })
      d3.select(this)
      .style("opacity", 1)
      tooltip.style("visibility", "visible")
      tooltipText = "<b>" + subs[d["source"]["index"]] + "</b>:  " + d["source"]["value"] + "<br><b>"+  subs[d["target"]["index"]] + "</b>:   " + d["target"]["value"]
      tooltip.html(tooltipText)
    })

    links.on("mousemove", function(){
    tooltip.style("left", (d3.event.pageX + 10) + "px")
          .style("top", (d3.event.pageY) - 50 + "px");
        })

  links.on("mouseout", function(){
    d3.selectAll("path").style("opacity", 1)
    tooltip.style("visibility", "hidden");
  })

  arcs.on("mouseenter", function (d){
    d3.selectAll(".arc")
      .style("opacity", function (a) {
        if (matrix[a.index][d.index] > 0  || matrix[d.index][a.index] > 0 || a.index === d.index){
          return 1
        }
        else {
          return opacityLow
        }
      });
    d3.selectAll("path")
      .style("opacity", function (link) {
        console.log(d)
        if (link.source.index === d.index || link.target.index === d.index){
          return 1
        }
        else {
          return opacityLow
        }
      });
  })

  arcs.on("mouseout", function (d){
    d3.selectAll("group")
      .style("opacity", opacityLow)
    d3.selectAll("path")
      .style("opacity", 1)

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
