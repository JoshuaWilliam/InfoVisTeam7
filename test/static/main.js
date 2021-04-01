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

function getSubData(source, target) {
  d3.csv("/bar_data", function(data) {
    // console.log(data);
    var data1;
    var data2;
    var bool1 = false;
    var bool2 = false;
    for (let row of data) {
      if (row['SOURCE_SUBREDDIT'] === source && row['TARGET_SUBREDDIT'] === target) {
        data1 = row;
        bool1 = true;
      }
      if (row['TARGET_SUBREDDIT'] === source && row['SOURCE_SUBREDDIT'] === target) {
        data2 = row;
        bool2 = true
      }
      if (bool1 == true && bool2 == true) {
        break
      }
    }

    // Set values to zero if object does not exist
    if (data2 === undefined) {
      data2 = JSON.parse(JSON.stringify(data1));
      Object.keys(data2).forEach(function(key) {
        if (key !== 'SOURCE_SUBREDDIT' && key !== 'TARGET_SUBREDDIT')
          data2[key] = 0
      });
      var temp = data2['SOURCE_SUBREDDIT']
      data2['SOURCE_SUBREDDIT'] = data2['TARGET_SUBREDDIT']
      data2['TARGET_SUBREDDIT'] = temp
    }
    createBarChart(data1, data2);
  })
}

function initBarChart(source, target) {
  console.log('initialising')
  console.log(source)
  getSubData(source, target);
}

function createBarChart(sourceData, targetData) {
  var data = sourceData
  var margin = {
    top: 70,
    right: 50,
    bottom: 100,
    left: 90
  };
  var w = 900 - margin.left - margin.right;
  var h = 700 - margin.top - margin.bottom;
  subgroups = ['Source', 'Target']

  categories = ['LIWC_Swear',
    'LIWC_Social', 'LIWC_Family', 'LIWC_Friends', 'LIWC_Humans',
    'LIWC_Affect', 'LIWC_Posemo', 'LIWC_Negemo', 'LIWC_Anx', 'LIWC_Anger',
    'LIWC_Sad',
  ]
  //numberCategories = categories.length;
  var svgChart;

  var myColor = d3.scaleOrdinal().domain(subgroups)
    .range(["#5dc8c9", "#d16262"])

  fullData = [sourceData, targetData]

  // Create svg on first time
  if (d3.select(".barChart")['_groups'][0][0] === null) {
    svgChart = d3.select("#bar_plot").append("svg")
      .attr("class", "barChart")
      .attr("width", w + margin.left + margin.right)
      .attr("height", h + margin.top + margin.bottom)
      .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
  }

  var maxliwc = 0;

  for (let cat of categories) {
    if (data[cat] > maxliwc) {
      maxliwc = data[cat]
    }
    if (targetData[cat] > maxliwc) {
      maxliwc = targetData[cat]
    }
  }

  var yScale = d3.scaleLinear()
    .domain([0, Math.ceil(maxliwc * 10) / 10])
    .range([h, 0]);



  var svgChart = d3.select(".barChart")
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
  //.call(yAxis);

  //svgChart.call(yAxis);

  d3.select(".graphTitle").remove();
  svgChart.append("text")
    .attr("class", "graphTitle")
    .attr("x", w / 6)
    .attr("y", -18)
    .attr("text-anchor", "start")
    .html("LIWC scores between " + reddit_link(sourceData['SOURCE_SUBREDDIT']) + " and " + reddit_link(sourceData['TARGET_SUBREDDIT']));

  // Add label to y-axis
  svgChart.append("text")
    .attr("transform", "rotate(-90)")
    .attr("class", "y-axis-label")
    .attr("x", -(h / 2))
    .attr("text-anchor", "middle")
    .attr("y", -50)
    .text("LIWC scores");


  d3.select(".y-axis").remove();
  // Create y-axis
  var yAxis = d3.axisLeft(yScale)
    .ticks(5);

  svgChart.append("g")
    .attr("class", "y-axis")
    .call(yAxis);


  var yScale = d3.scaleLinear()
    .domain([0, Math.ceil(maxliwc * 10) / 10])
    .range([h, 0]);

  var xScale = d3.scaleBand()
    .domain(categories)
    .range([0, w])
    .padding(0.2);



  // Create x-axis
  d3.select(".x-axis").remove();
  var xAxis = d3.axisBottom(xScale);
  svgChart.append("g")
    .attr("class", "x-axis")
    .attr("transform", "translate(0," + h + ")")
    .call(xAxis)
    .selectAll("text")
    .attr("text-anchor", "end")
    .attr("y", 3)
    .attr("x", -7)
    .attr("transform", "rotate(-30)");

  var xSubgroup = d3.scaleBand()
    .domain(subgroups)
    .range([0, xScale.bandwidth()])
    .padding([0.075])

  // Create bars
  d3.selectAll(".bar").remove();
  var rects = svgChart.selectAll("rect")
    .data(categories)
    .enter()
    .append("g")
    .attr("transform", function(d) {
      return "translate(" + xScale(d) + ",0)";
    })
    .selectAll("rect")
    .data(function(d) {
      return subgroups.map(function(key) {
        var val = (key === "Source") ? fullData[0][d] : fullData[1][d]
        return {
          key: key,
          value: val
        };
      });
    })
    .enter().append("rect")
    .attr("x", function(d) {
      return xSubgroup(d.key)
    })
    .attr("class", "bar")
    .attr("y", function(d) {
      return yScale(d.value)
    })
    .attr("width", xSubgroup.bandwidth())
    .attr("height", function(d) {
      return h - yScale(d.value)
    })
    .attr("fill", function(d) {
      return myColor(d.key)
    });

  d3.selectAll(".legend").remove();
  var legend = svgChart.selectAll(".legend")
    .data(subgroups)
    .enter().append("g")
    .attr("class", "legend")
    .attr("transform", function(d, i) {
      return "translate(0," + i * 20 + ")";
    })
    .style("opacity", "1");

  legend.append("rect")
    .attr("x", w - 18)
    .attr("width", 18)
    .attr("height", 18)
    .style("fill", function(d) {
      return myColor(d);
    });

  legend.append("text")
    .attr("x", w - 24)
    .attr("y", 9)
    .attr("dy", ".35em")
    .style("text-anchor", "end")
    .attr("class", "legend-text")
    .text(function(d) {
      return (d === 'Source') ? "/r/" + data['SOURCE_SUBREDDIT'] : "/r/" + data['TARGET_SUBREDDIT'];
    });




}

function reddit_link(sub) {
  return "<a href=\'https://www.reddit.com/r/" + sub + "\' target=\'_blank\'>/r/" + sub + "</a>"
}

function createGraph(data) {
  var subs = Object.keys(data)
  var innerRadius = 250;
  var outerRadius = 260;


  var svg = d3.select("#chord_plot")
    .append("svg")
    .attr("width", 800)
    .attr("height", 750)
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
      var rotateBool = false;
      if ((d.startAngle + d.endAngle) / 2 > Math.PI) {
        rotateBool = true;
      }
      var extra_rot = rotateBool ? 180 : 0;
      var translateSign = rotateBool ? -1 : 1;
      return "rotate(" + ((d.startAngle + d.endAngle) / (2 * Math.PI) * 180 - 90 + extra_rot) + ")" + "translate(" + ((outerRadius + 10) * translateSign).toString() + ",0)";
    })
    .style("text-anchor", function(d) {
      return ((d.startAngle + d.endAngle) / 2 > Math.PI) ? "end" : null;
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
    d3.selectAll("path").style("opacity", opacityLow);
    d3.selectAll(".arc")
      .style("opacity", function(a) {
        return d.source.index === a.index || d.target.index === a.index ? 1 : opacityLow;
      })
    d3.select(this)
      .style("opacity", 1)
    tooltip.style("visibility", "visible")
    tooltipText = "<b>Connections originating from source</b><br>&nbsp&nbsp" + subs[d["source"]["index"]] + ":  " + d["source"]["value"] + "<br>&nbsp&nbsp" + subs[d["target"]["index"]] + ":   " + d["target"]["value"]
    tooltip.html(tooltipText)
  })

  links.on("mousemove", function() {
    tooltip.style("left", (d3.event.pageX + 10) + "px")
      .style("top", (d3.event.pageY) - 50 + "px");
  })

  links.on("mouseout", function() {
    d3.selectAll("path").style("opacity", 1)
    tooltip.style("visibility", "hidden");
  })

  links.on("click", function(d) {
    highlighter(subs[d.source.index], subs[d.target.index]);
    initBarChart(subs[d.source.index], subs[d.target.index]);

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

  //
  // var scatter_svg = d3.select("#scatter_plot")
  //   .append("svg")
  //   .classed("svg-container", true)
  //   .attr("preserveAspectRatio", "xMinYMin meet")
  //   .attr("viewBox", "0 0 1000 1000")
  //   // class to make it responsive
  //   .attr('class', 'svg-content-responsive')
  // // .attr("width", scatter_width + margin_scatter.left + margin_scatter.right)
  // // .attr("height", scatter_height + margin_scatter.top + margin_scatter.bottom)
  // .append("g")
  //   .attr("transform",
  //     "translate(" + margin_scatter.left + "," + margin_scatter.top + ")");
  //


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

highlightColors = ['#8dd3c7', '#ffffb3', '#bebada', '#fb8072', '#80b1d3', '#fdb462', '#b3de69', '#fccde5', '#d9d9d9', '#bc80bd']

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

function createClusterGraph(featureNumber) {


  // CLUSTER SECTION


  d3.selection.prototype.moveToFront = function() {
    return this.each(function() {
      this.parentNode.appendChild(this);
    });
  };


  d3.csv("/cluster_data?feature=" + featureNumber, function(data) {
    console.log(featureNumber);
    var margin = {
        top: 50,
        right: 100,
        bottom: 50,
        left: 50
      },
      outerWidth = 1050,
      outerHeight = 700,
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

    i = -1


    data.forEach(function(d) {
      d.Feat_2 = +d.Feat_2;
      d.Feat_1 = +d.Feat_1;
    });

    var xMax = d3.max(data, function(d) {
        return d[xCat];
      }) * 1.05,
      xMin = d3.min(data, function(d) {
        return d[xCat];
      }),
      xMin = xMin > 0 ? 0 : xMin,
      yMax = d3.max(data, function(d) {
        return d[yCat];
      }) * 1.05,
      yMin = d3.min(data, function(d) {
        return d[yCat];
      }),
      yMin = yMin > 0 ? 0 : yMin;

    x.domain([xMin, xMax]);
    y.domain([yMin, yMax]);

    var xAxis = d3.axisBottom()
      .scale(x)
      .tickSize(-height);

    var yAxis = d3.axisLeft()
      .scale(y)
      .tickSize(-width);

    var color = d3.scaleOrdinal().range([
      "#66b24b",
      "#c361aa",
      "#4aac8b",
      "#ca5437",
      "#688dcd",
      "#c98f44",
      "#ca586f"
    ]);

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

    var svg = d3.select("#cluster_plot")
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

    svg.append("text")
      .attr("transform",
        "translate(" + (width / 2) + " ," +
        (height + 50) + ")")
      .style("text-anchor", "middle")
      .text("Feature 1");

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

    svg.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 0 - margin.left)
      .attr("x", 0 - (height / 2))
      .attr("dy", "1em")
      .style("text-anchor", "middle")
      .text("Feature 2");

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
      .attr("r", 3) //function (d) { return 6 * Math.sqrt(d[rCat] / Math.PI); }
      .attr("transform", transform)
      .style("fill", function(d) {
        return color(d[colorCat]);
      })
      .attr("id", function(d) {
        return "circle_" + d["SOURCE_SUBREDDIT"];
      })
      .on("mouseover", tip.show)
      .on("mouseout", tip.hide);

    // var legend = svg.selectAll(".legend")
    //   .data(color.domain())
    //   .enter().append("g")
    //   .classed("legend", true)
    //   .attr("transform", function(d, i) {
    //     return "translate(0," + i * 20 + ")";
    //   });
    //
    // legend.append("circle")
    //   .attr("r", 3.5)
    //   .attr("cx", width + 20)
    //   .attr("fill", color);

    // legend.append("text")
    //   .attr("x", width + 26)
    //   .attr("dy", ".35em")
    //   .text(function(d) {
    //     return d;
    //   });

    dots.on("mouseenter", function(d) {
      tip.style("visibility", "visible")
      tooltipText = "/r/" + d['SOURCE_SUBREDDIT']
      tip.html(tooltipText)
    })

    dots.on("mousemove", function() {
      tip.style("left", (d3.event.pageX + 10) + "px")
        .style("top", (d3.event.pageY) - 30 + "px");
    })

    dots.on("mouseout", function() {
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

}

function changeClusterFeature() {
  d3.select("#cluster_plot").selectAll("*").remove();
  feature = document.getElementById("indicatorChoice").value;
  console.log(feature);
  createClusterGraph(feature);
}






// generatePlots();


// Get data
// getScatterData();
createScatterGraph();
createClusterGraph();
getChordData();
