//createBarChart();

function getSubData(source, target) {
  d3.csv("../../data/averages.csv", function(data) {
    for (let row of data){
      if (row['SOURCE_SUBREDDIT'] === source && row['TARGET_SUBREDDIT'] === target){
        createBarChart(row)
        break
      }
    }
  })
}

function initBarChart(source, target) {
  getSubData(source, target);
}

function createBarChart(data) {
  var sourceData = data
  var margin = {top: 70, right: 0, bottom: 100, left: 90};
  var w = 900 - margin.left;
  var h = 645 - margin.top - margin.bottom;

  categories = ['Compound sentiment calculated by VADER', 'LIWC_Swear',
       'LIWC_Social', 'LIWC_Family', 'LIWC_Friends', 'LIWC_Humans',
       'LIWC_Affect', 'LIWC_Posemo', 'LIWC_Negemo', 'LIWC_Anx', 'LIWC_Anger',
       'LIWC_Sad',]
  //numberCategories = categories.length;

  // Create svg on first time
  if (d3.select(".barChart")['_groups'][0][0] === null) {
    var svgChart = d3.select("body").append("svg")
                  .attr("class", "barChart")
                  .attr("width", w + margin.left)
                  .attr("height", h + margin.top + margin.bottom)
                .append("g")
                  .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var yScale = d3.scaleLinear()
            .domain([0, 1])
            .range([h, 0]);
    // Create y-axis
    var yAxis = d3.axisLeft(yScale);
    svgChart.append("g")
            .attr("class", "y-axis")
            .call(yAxis);

    d3.select(".graphTitle").remove();
    svgChart.append("text")
        .attr("class", "graphTitle")
        .attr("x", 0)
        .attr("y", - 18)
        .attr("text-anchor", "start")
        .text(sourceData["Compound sentiment calculated by VADER"] + " Sentiment");

    // Add label to y-axis
    svgChart.append("text")
      .attr("transform", "rotate(-90)")
      .attr("class", "y-axis-label")
      .attr("x", -(h / 2))
      .attr("text-anchor", "middle")
      .attr("y", - 35)
      .text("LIWC scores");
  }


  // Select chart
  var svgChart = d3.select(".barChart")
                  .append("g")
                    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  var yScale = d3.scaleLinear()
          .domain([0, 1])
          .range([h, 0]);

  var xScale = d3.scaleBand()
          .domain(categories)
          .range([0, w])
          .padding(0.1);

  // Create bars
  d3.selectAll(".bar").remove();
  var rects = svgChart.selectAll("rect")
                .data(categories)
                .enter()
                .append("rect")
                .attr("class","bar")
                .attr("x", function(d) {
                          return xScale(d);
                        })
                .attr("y", function(d) {
                      return yScale(sourceData[d]);
                        })
                .attr("width", xScale.bandwidth())
                .attr("height", function(d) {
                      return h - yScale(sourceData[d]);
                })
                .attr("fill", "skyblue");

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




}



  /*
  var drivers = Object.keys(winners);
  var nationalDrivers = {};
  var first = true;
  // Create new json for just drivers of this country
  for (let driver of drivers) {
    if (winners[driver]['country_id'] === countryID){
      nationalDrivers[driver] = {'victories': winners[driver]['victories']};
      if (first) {
        var nationality = winners[driver]['nationality'];
        first = false;
      }
    }
  }

  var nationalDriversNames = Object.keys(nationalDrivers);

  var margin = {top: 50, right: 0, bottom: 70, left: 90};
  var w = 800 - margin.left;
  var h = 645 - margin.top - margin.bottom;

  // Create svg on first time
  if (d3.select(".barChart")['_groups'][0][0] === null) {
    var svgChart = d3.select("body").append("svg")
                  .attr("class", "barChart")
                  .attr("width", w + margin.left)
                  .attr("height", h + margin.top + margin.bottom)
                .append("g")
                  .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var yScale = d3.scaleLinear()
            .domain([0, maxWins])
            .range([h, 0]);
    // Create y-axis
    var yAxis = d3.axisLeft(yScale);
    svgChart.append("g")
            .attr("class", "y-axis")
            .call(yAxis);

    // Add label to y-axis
    svgChart.append("text")
      .attr("transform", "rotate(-90)")
      .attr("class", "y-axis-label")
      .attr("x", -(h / 2))
      .attr("text-anchor", "middle")
      .attr("y", - 35)
      .text("Race Victories");
  }

  // Select chart
  var svgChart = d3.select(".barChart")
                  .append("g")
                    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  var yScale = d3.scaleLinear()
          .domain([0, maxWins])
          .range([h, 0]);
  // Set width of chart depending on amount of drivers
  if ((nationalDriversNames.length - 1) * 80 < w) {
    var xRangeMax = nationalDriversNames.length * 80;
  }
  else {
    var xRangeMax = w;
  }
  var xScale = d3.scaleBand()
          .domain(nationalDriversNames)
          .range([0, xRangeMax])
          .padding(0.1);

  // Create bars
  d3.selectAll(".bar").remove();
  var rects = svgChart.selectAll("rect")
                .data(nationalDriversNames)
                .enter()
                .append("rect")
                .attr("class","bar")
                .attr("x", function(d) {
                          return xScale(d);
                        })
                .attr("y", function(d) {
                      return yScale(nationalDrivers[d].victories);
                        })
                .attr("width", xScale.bandwidth())
                .attr("height", function(d) {
                      return h - yScale(nationalDrivers[d].victories);
                })
                .attr("fill", "skyblue");

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

*/
