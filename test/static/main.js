var chord_data;

function getChordData() {
  url = '/chord_data'
  fetch(url)
    .then(function(response) {
      return response.json();
    })
    .then((data) => {
      chord_data = data;
      createGraph(chord_data);
      console.log(data);
    })
}

function getScatterData() {
  url = "/scatter_data";
  fetch(url)
    .then(function(response) {
      return response.json();
    })
    .then((data) => {
      scatter_data = data;
      createScatterGraph(scatter_data);
      console.log(data);
    })
}

function generatePlots() {
  getChordData();
  getScatterData();
}



function createGraph(data) {
  var subs = Object.keys(data)
  var innerRadius = 250;
  var outerRadius = 260;


  var svg = d3.select("#chord_plot")
    .append("svg")
    .attr("width", 800)
    .attr("height", 800)
    .append("g")
    .attr("transform", "translate(400,400)")

  var limit = 50

  var matrix = [];
  for (let sub of subs) {
    submatrix = []
    for (let sub2 of subs) {
      if (data[sub][sub2] + data[sub2][sub] < limit) {
        submatrix.push(0)
      } else {
        submatrix.push(data[sub][sub2])
      }
    }
    matrix.push(submatrix)
  }
  console.log(subs);


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
    .style("fill", function(d, i) {
      return myColor(d.source.index)
    }) // colors depend on the source group. Change to target otherwise.
    .style("stroke", "#2b2b2b")
    .style("stroke-width", 0.7)
    .attr("source", function(d) {
      return d.source.index
    })
    .attr("target", function(d) {
      return d.target.index
    })

  var group = svg
    .datum(res)
    .append("g")
    .attr("class", "group")
    .selectAll("g")
    .data(function(d) {
      return d.groups;
    })
    .enter()

  var arcs = group
    .append("path")
    .style("fill", function(d, i) {
      return myColor(i)
    })
    .style("stroke", "#2b2b2b")
    .style("stroke-width", 0.7)
    .attr("class", "arc")
    .attr("d", d3.arc()
      .innerRadius(innerRadius)
      .outerRadius(outerRadius)
    );


  group.append("text")
    .attr("transform", function(d, i) {
      //var extra_rot =  (d.startAngle + d.endAngle) / 2 > Math.PI ? 180 : 0;
      return "rotate(" + ((d.startAngle + d.endAngle) / (2 * Math.PI) * 180 - 90) + ")" + "translate(" + (outerRadius + 10).toString() + ",0)";
    })
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

  links.on("mouseenter", function(d) {
    d3.selectAll("path").style("opacity", opacityLow)
    d3.select(this)
      .style("stroke-width", 1.5)
      .style("opacity", 1)
    tooltip.style("visibility", "visible")
    tooltipText = "<b>" + subs[d["source"]["index"]] + "</b>:  " + d["source"]["value"] + "<br><b>" + subs[d["target"]["index"]] + "</b>:   " + d["target"]["value"]
    tooltip.html(tooltipText)
  })

  links.on("mousemove", function() {
    tooltip.style("left", (d3.event.pageX + 10) + "px")
      .style("top", (d3.event.pageY) - 70 + "px");
  })

  links.on("mouseout", function() {
    d3.select(this).style("stroke", "black")
      .style("stroke-width", 0.7)
    d3.selectAll("path").style("opacity", 1)
    tooltip.style("visibility", "hidden");
  })

  arcs.on("mouseenter", function(d) {
    d3.selectAll(".arc")
      .style("opacity", function(a) {
        if (matrix[a.index][d.index] > 0 || matrix[d.index][a.index] > 0 || a.index === d.index) {
          return 1
        } else {
          return opacityLow
        }
      });
    d3.selectAll("path")
      .style("opacity", function(link) {
        if (link.source.index === d.index || link.target.index === d.index) {
          return 1
        } else {
          return opacityLow
        }
      });
  })

  arcs.on("mouseout", function(d) {
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


// set the dimensions and margins of the graph
// var margin = {
//     top: 30,
//     right: 30,
//     bottom: 70,
//     left: 60
//   },
//   width = 460 - margin.left - margin.right,
//   height = 400 - margin.top - margin.bottom;
//
// // append the svg object to the body of the page
// var scatter_svg = d3.select("#scatter_plot")
//   .append("svg")
//   .attr("width", width + margin.left + margin.right)
//   .attr("height", height + margin.top + margin.bottom)
//   .append("g")
//   .attr("transform",
//     "translate(" + margin.left + "," + margin.top + ")");

// function createScatterGraph(scatter_data) {
function createScatterGraph() {
  var margin_scatter = {
      top: 10,
      right: 30,
      bottom: 20,
      left: 50
    },
    scatter_width = 800 - margin_scatter.left - margin_scatter.right,
    scatter_height = 400 - margin_scatter.top - margin_scatter.bottom;

  var scatter_svg = d3.select("#scatter_plot")
    .append("svg")
    .attr("width", scatter_width + margin_scatter.left + margin_scatter.right)
    .attr("height", scatter_height + margin_scatter.top + margin_scatter.bottom)
    .append("g")
    .attr("transform",
      "translate(" + margin_scatter.left + "," + margin_scatter.top + ")");


  //Read the data
  d3.csv("/scatter_data", function(data) {

    console.log("csv data1:", data)
    console.log("scatter_height", scatter_height);
    console.log("scatter_width", scatter_height);

    var subgroups = data.columns.slice(1)
    var groups = d3.map(data, function(d) {
      return (d.SOURCE_SUBREDDIT)
    }).keys()
    console.log("groups1:", groups)

    // Add X axis
    var x = d3.scaleBand()
      .domain(groups)
      .range([0, scatter_width])
      .padding([0.2])
    scatter_svg.append("g")
      .attr("transform", "translate(0," + (scatter_height / 2) + ")")
      .call(d3.axisBottom(x).tickSize(0));

    var y = d3.scaleLinear()
      .domain([-0.3, 0.3])
      .range([scatter_height, 0]);
    scatter_svg.append("g")
      .call(d3.axisLeft(y));

    //add tooltips
    var tooltip = d3.select("#scatter_plot")
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
        .html("The exact value of<br>" + d.key + "<br>is<br>" + d.value)
        .style("left", (d3.mouse(this)[0] + 90) + "px")
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
      .range(['#A52A2A', '#FF8700', '#4daf4b', '#FFEBCD'])

    scatter_svg.append("g")
      .selectAll("g")
      .data(data)
      .enter()
      .append("g")
      .attr("transform", function(d) {
        return "translate(" + x(d.SOURCE_SUBREDDIT) + ",0)";
      })
      .selectAll("dot")
      .data(function(d) {
        return subgroups.map(function(key) {
          return {
            key: key,
            value: d[key]
          };
        });
      })
      .enter().append("circle")
      .attr("cx", function(d) {
        return xSubgroup(d.key);
      })
      .attr("cy", function(d) {
        return y(d.value);
      })
      .attr("r", 5)
      .attr("fill", function(d) {
        return color(d.key);
      })
      .on("mouseover", mouseover)
      .on("mousemove", mousemove)
      .on("mouseleave", mouseleave)

  })

  console.log("scatter: ", scatter_svg);
}
// generatePlots();


// Get data
// getScatterData();
createScatterGraph();
getChordData();
