//createBarChart();

function getSubData(source, target) {
  d3.csv("../../data/averages.csv", function(data) {
    var data1;
    var data2;
    var bool1 = false;
    var bool2 = false;
    for (let row of data){
      if (row['SOURCE_SUBREDDIT'] === source && row['TARGET_SUBREDDIT'] === target){
        data1 = row;
        bool1 = true;
      }
      if (row['TARGET_SUBREDDIT'] === source && row['SOURCE_SUBREDDIT'] === target){
        data2 = row;
        bool2 = true
      }
      if (bool1 == true && bool2 == true) {break}
    }

    // Set values to zero if object does not exist
    if (data2 === undefined) {
      data2 = JSON.parse(JSON.stringify(data1));
      Object.keys(data2).forEach(function(key){
        if (key !== 'SOURCE_SUBREDDIT' && key !== 'TARGET_SUBREDDIT')
        data2[key] = 0 });
      var temp = data2['SOURCE_SUBREDDIT']
      data2['SOURCE_SUBREDDIT'] = data2['TARGET_SUBREDDIT']
      data2['TARGET_SUBREDDIT'] = temp
    }
  createBarChart(data1, data2);
})}

function initBarChart(source, target) {
  getSubData(source, target);
}

function createBarChart(sourceData, targetData) {
  var data = sourceData
  var margin = {top: 70, right: 0, bottom: 100, left: 90};
  var w = 900 - margin.left;
  var h = 645 - margin.top - margin.bottom;
  subgroups = ['Source', 'Target']

  categories = ['LIWC_Swear',
       'LIWC_Social', 'LIWC_Family', 'LIWC_Friends', 'LIWC_Humans',
       'LIWC_Affect', 'LIWC_Posemo', 'LIWC_Negemo', 'LIWC_Anx', 'LIWC_Anger',
       'LIWC_Sad',]
  //numberCategories = categories.length;
  var svgChart;

  var myColor = d3.scaleOrdinal().domain(subgroups)
    .range(d3.schemeSet3);

  fullData = [sourceData, targetData]

  // Create svg on first time
  if (d3.select(".barChart")['_groups'][0][0] === null) {
    svgChart = d3.select("body").append("svg")
                  .attr("class", "barChart")
                  .attr("width", w + margin.left)
                  .attr("height", h + margin.top + margin.bottom)
                .append("g")
                  .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
                }

    var maxliwc = 0;

    for (let cat of categories) {
      if (data[cat] > maxliwc) {maxliwc = data[cat]}
    }

    var yScale = d3.scaleLinear()
            .domain([0, Math.ceil(maxliwc * 10) / 10 ])
            .range([h, 0]);



    var svgChart = d3.select(".barChart")
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
            //.call(yAxis);

    //svgChart.call(yAxis);

    d3.select(".graphTitle").remove();
    svgChart.append("text")
        .attr("class", "graphTitle")
        .attr("x", 0)
        .attr("y", - 18)
        .attr("text-anchor", "start")
        .text(sourceData["Compound sentiment calculated by VADER"] + " Sentiment between " + sourceData['SOURCE_SUBREDDIT'] + " and " + sourceData['TARGET_SUBREDDIT']);

    // Add label to y-axis
    svgChart.append("text")
      .attr("transform", "rotate(-90)")
      .attr("class", "y-axis-label")
      .attr("x", -(h / 2))
      .attr("text-anchor", "middle")
      .attr("y", - 35)
      .text("LIWC scores");


    d3.select(".y-axis").remove();
      // Create y-axis
    var yAxis = d3.axisLeft(yScale);

    svgChart.append("g")
            .attr("class", "y-axis")
            .call(yAxis);





  var yScale = d3.scaleLinear()
          .domain([0, Math.ceil(maxliwc * 10) / 10 ])
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
                    return "translate(" + xScale(d) + ",0)"; })
                .selectAll("rect")
                .data(function(d) {
                  return subgroups.map(function(key) {
                    var val = (key === "Source") ? fullData[0][d] : fullData[1][d]
                    return {key: key, value: val}; }); })
                .enter().append("rect")
                .attr("x", function(d) {return xSubgroup(d.key)})
                .attr("class", "bar")
                .attr("y", function(d) {return yScale(d.value)})
                .attr("width", xSubgroup.bandwidth())
                .attr("height", function(d) {return h - yScale(d.value)})
                .attr("fill", function(d) {return myColor(d.key)});



  }
