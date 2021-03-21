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
var margin = {
    top: 30,
    right: 30,
    bottom: 70,
    left: 60
  },
  width = 460 - margin.left - margin.right,
  height = 400 - margin.top - margin.bottom;

// append the svg object to the body of the page
var scatter_svg = d3.select("#scatter_plot")
  .append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
  .append("g")
  .attr("transform",
    "translate(" + margin.left + "," + margin.top + ")");

function createScatterGraph(scatter_data) {
  //Read the data
  d3.csv(scatter_data, function(data) {
    console.log("reading csv")
    var data_source = [];
    var data_anger = [];
    var data_sad = [];
    var data_swear = [];
    var data_sentiment = [];
    console.log(scatter_data);
    scatter_data.forEach(function(item) {
      data_source.push(item.SOURCE_SUBREDDIT)
      var key = item.SOURCE_SUBREDDIT
      var anger = {
        "source": key,
        "value": item.mean_liwc_anger
      }
      var sad = {
        "source": key,
        "value": item.mean_liwc_sad
      }
      var swear = {
        "source": key,
        "value": item.mean_liwc_swear
      }
      var sentiment = {
        "source": key,
        "value": item.mean_vader_sentiment
      }

      data_anger.push(anger)
      data_sad.push(sad)
      data_swear.push(swear)
      data_sentiment.push(sentiment)

    })
    console.log(data_sentiment)
    data_anger.map(function(d) {
      console.log(d.source)
    })

    // Add X axis
    var x = d3.scaleBand()
      .range([0, width])
      .domain(data_anger.map(function(d) {
        return d.source;
      }))
      .padding(0.2);
    scatter_svg.append("g")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(x))
      .selectAll("text")
      .attr("transform", "translate(-10,0)rotate(-45)")
      .style("text-anchor", "end");

    // Add Y axis
    var y = d3.scaleLinear()
      .domain([-2, 1])
      .range([height, 0]);
    scatter_svg.append("g")
      .call(d3.axisLeft(y));

    // Add dots
    scatter_svg.selectAll(".bar")
      .data(data_anger)
      .enter()
      .append("rect")
      .attr("x", function(d) {
        return x(d.source);
      })
      .attr("y", function(d) {
        return y(d.value);
      })
      .attr("width", x.bandwidth())
      .attr("height", function(d) {
        return height - y(d.Value);
      })
      .attr("fill", "#69b3a2")

  })
}
// generatePlots();


// Get data
getChordData();
getScatterData();
