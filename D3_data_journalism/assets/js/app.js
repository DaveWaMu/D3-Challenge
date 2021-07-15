// SVG
var svgWidth = 1000;
var svgHeight = 1000;

var margin = {
    top: 20,
    right: 40,
    bottom: 80,
    left: 100
};

var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

var svg = d3
    .select("#scatter")
    .append("svg")
    .attr("width", svgWidth)
    .attr("height", svgHeight + 50);

var svgGroup = svg.append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

//First chart
var xAxis = "poverty";
var yAxis = "healthcare";

// X-Scale
function xScale(data, xAxis) {
    var xLinearScale = d3.scaleLinear()
        .domain([d3.min(data, d => d[xAxis]) * 0.9, d3.max(data, d => d[xAxis]) * 1.1])
        .range([0, width]);
    return xLinearScale;
}

// Y-Scale
function yScale(data, yAxis) {
    var yLinearScale = d3.scaleLinear()
        .domain([d3.min(data, d => d[yAxis]) - 2, d3.max(data, d => d[yAxis]) + 2])
        .range([height, 0]);
    return yLinearScale;
}

// X-Axis
function renderXaxis(newXScale, axisX) {
    var bottomAxis = d3.axisBottom(newXScale);
    axisX.transition()
        .duration(1000)
        .call(bottomAxis);
    return axisX;
}

// Y-Axis
function renderYaxis(newYScale, axisY) {
    var leftAxis = d3.axisLeft(newYScale);
    axisY.transition()
        .duration(1000)
        .call(leftAxis);
    return axisY;
}

// X-Circles
function renderXCircles(circles, newXScale, xAxis) {
    circles.transition()
        .duration(1000)
        .attr("cx", d => newXScale(d[xAxis]));
    return circles;
}

// Y-Circles
function renderYCircles(circles, newYScale, yAxis) {
    circles.transition()
        .duration(1000)
        .attr("cy", d => newYScale(d[yAxis]));
    return circles;
}

// X-Circles text
function renderXText(circlesText, newXScale, xAxis) {
    circlesText.transition()
        .duration(1000)
        .attr("x", d => newXScale(d[xAxis]));
    return circlesText;
}

// Y-Circles text
function renderYText(circlesText, newYScale, yAxis) {
    circlesText.transition()
        .duration(1000)
        .attr("y", d => newYScale(d[yAxis]) + 5)
    return circlesText;
}

// ToolTip
function updateToolTip(xAxis, yAxis, circlesGroup) {

    var xlabel;
    var ylabel;

    if (xAxis === "poverty") {
        xlabel = "Poverty  (%):";
    }
    else if (xAxis === "age") {
        xlabel = "Age  (Median):";
    }
    else if (xAxis === "income") {
        xlabel = "Household Income  (Median):";
    }

    if (yAxis === 'healthcare') {
        ylabel = "No Healthcare  (%):"
    }
    else if (yAxis === 'smokes') {
        ylabel = "Smoker  (%):"
    }
    else if (yAxis === 'obesity') {
        ylabel = "Obese  (%):"
    }

    var toolTip = d3.tip()
        .attr("class", "tooltip")
        .style("color", "white")
        .style("background", 'blue')
        .style("border", "solid")
        .style("border-width", "1px")
        .style("border-radius", "5px")
        .style("padding", "5px")
        .html(function (d) {
            return (`${d.state}<br>${xlabel} ${d[xAxis]}%<br>${ylabel} ${d[yAxis]}%`);
        });

    circlesGroup.call(toolTip);

    circlesGroup.on("mouseover", function (data) {
        toolTip.show(data, this);
    });

    circlesGroup.on("mouseout", function (data) {
        toolTip.hide(data);
    });
    return circlesGroup;
}

// Read CSV
d3.csv("assets/data/data.csv").then(function (data) {
    console.log("Data", data);

    data.forEach(d => {
        d.poverty = +d.poverty;
        d.healthcare = +d.healthcare;
        d.age = +d.age;
        d.income = +d.income;
        d.obesity = +d.obesity;
        d.smokes = +d.smokes;
    });

    // LinearScale
    var xLinearScale = xScale(data, xAxis);
    var yLinearScale = yScale(data, yAxis);

    // Chart axes
    var bottomAxis = d3.axisBottom(xLinearScale);
    var leftAxis = d3.axisLeft(yLinearScale);

    // X-Y axes
    var axisX = svgGroup.append("g")
        .attr("transform", `translate(0, ${height})`)
        .call(bottomAxis);
    var axisY = svgGroup.append("g")
        .call(leftAxis);

    // Circles
    var circlesGroup = svgGroup.selectAll("circle")
        .data(data)
        .enter()
        .append("g");

    var circles = circlesGroup.append("circle")
        .attr("cx", d => xLinearScale(d[xAxis]))
        .attr("cy", d => yLinearScale(d[yAxis]))
        .attr("r", "15")
        .classed('stateCircle', true);

    var circlesText = circlesGroup.append("text")
        .text(d => d.abbr)
        .attr("x", d => xLinearScale(d[xAxis]))
        .attr("y", d => yLinearScale(d[yAxis]) + 5)
        .classed('stateText', true);

    // X-Labels
    var xlabelsGroup = svgGroup.append("g")
        .attr("transform", `translate(${width / 2}, ${height + 20})`);

    var firstX = xlabelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 20)
        .attr("value", "poverty")
        .classed("active", true)
        .classed("inactive", false)
        .text("Poverty  (%)");

    var secondX = xlabelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 40)
        .attr("value", "age")
        .classed("active", false)
        .classed("inactive", true)
        .text("Age  (Median)");

    var thirdX = xlabelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 60)
        .attr("value", "income")
        .classed("active", false)
        .classed("inactive", true)
        .text("Household Income  (Median)");

    // Y-Labels
    var ylabelsGroup = svgGroup.append("g")
        .attr("transform", `translate(${width * 0}, ${height / 2})`);

    var firstY = ylabelsGroup.append("text")
        .attr("transform", "rotate(-90)")
        .attr("x", 0)
        .attr("y", -30)
        .attr("value", "healthcare")
        .classed("active", true)
        .classed("inactive", false)
        .text("No Healthcare  (%)");

    var secondY = ylabelsGroup.append("text")
        .attr("transform", "rotate(-90)")
        .attr("x", 0)
        .attr("y", -50)
        .attr("value", "smokes")
        .classed("active", false)
        .classed("inactive", true)
        .text("Smoker  (%)");

    var thirdY = ylabelsGroup.append("text")
        .attr("transform", "rotate(-90)")
        .attr("x", 0)
        .attr("y", -70)
        .attr("value", "obesity")
        .classed("active", false)
        .classed("inactive", true)
        .text("Obese  (%)");

    // ToolTip
    circlesGroup = updateToolTip(xAxis, yAxis, circlesGroup);

    // Update X data
    xlabelsGroup.selectAll("text")
        .on("click", function () {
            var value = d3.select(this).attr("value");

            if (value !== xAxis) {
                xAxis = value;
                xLinearScale = xScale(data, xAxis);
                axisX = renderXaxis(xLinearScale, axisX);
                circles = renderXCircles(circles, xLinearScale, xAxis);
                circlesText = renderXText(circlesText, xLinearScale, xAxis);
                circlesGroup = updateToolTip(xAxis, yAxis, circlesGroup);

                // Labels
                if (xAxis === "poverty") {
                    firstX
                        .classed("active", true)
                        .classed("inactive", false);
                    secondX
                        .classed("active", false)
                        .classed("inactive", true);
                    thirdX
                        .classed("active", false)
                        .classed("inactive", true);
                }
                else if (xAxis === 'age') {
                    firstX
                        .classed("active", false)
                        .classed("inactive", true);
                    secondX
                        .classed("active", true)
                        .classed("inactive", false);
                    thirdX
                        .classed("active", false)
                        .classed("inactive", true);
                }
                else if (xAxis === 'income') {
                    firstX
                        .classed("active", false)
                        .classed("inactive", true);
                    secondX
                        .classed("active", false)
                        .classed("inactive", true);
                    thirdX
                        .classed("active", true)
                        .classed("inactive", false);
                }
            }
        });

    // Update Y data
    ylabelsGroup.selectAll("text")
        .on("click", function () {
            var value = d3.select(this).attr("value");

            if (value !== yAxis) {
                yAxis = value;
                yLinearScale = yScale(data, yAxis);
                axisY = renderYaxis(yLinearScale, axisY);
                circles = renderYCircles(circles, yLinearScale, yAxis);
                circlesText = renderYText(circlesText, yLinearScale, yAxis);
                circlesGroup = updateToolTip(xAxis, yAxis, circlesGroup);

                // Labels
                if (yAxis === "healthcare") {
                    firstY
                        .classed("active", true)
                        .classed("inactive", false);
                    secondY
                        .classed("active", false)
                        .classed("inactive", true);
                    thirdY
                        .classed("active", false)
                        .classed("inactive", true);
                }
                else if (yAxis === 'smokes') {
                    firstY
                        .classed("active", false)
                        .classed("inactive", true);
                    secondY
                        .classed("active", true)
                        .classed("inactive", false);
                    thirdY
                        .classed("active", false)
                        .classed("inactive", true);
                }
                else if (yAxis === 'obesity') {
                    firstY
                        .classed("active", false)
                        .classed("inactive", true);
                    secondY
                        .classed("active", false)
                        .classed("inactive", true);
                    thirdY
                        .classed("active", true)
                        .classed("inactive", false);
                }
            }
        });
}).catch(function (error) {
    console.log(error);
});
