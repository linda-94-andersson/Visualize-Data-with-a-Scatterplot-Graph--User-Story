import { useEffect, useState } from "react";
import axios from "axios";
import * as d3 from "d3";
import "./App.css";

function App() {
  const [data, setData] = useState([]);

  useEffect(() => {
    // Fetch the dataset using Axios
    axios
      .get(
        "https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/cyclist-data.json"
      )
      .then((response) => {
        setData(response.data);
        createScatterplot(response.data);
      })
      .catch((error) => console.error(error));
  }, []);

  const createScatterplot = (data) => {
    // Constants for the dimensions of the SVG and the margins
    const margin = { top: 50, right: 50, bottom: 100, left: 70 };
    const width = 800 - margin.left - margin.right;
    const height = 500 - margin.top - margin.bottom;

    // Parse the time data
    const parseTime = d3.timeParse("%M:%S");
    data.forEach((d) => {
      d.Time = parseTime(d.Time);
    });

    // Create scales for x and y axes
    const xScale = d3
      .scaleTime()
      .domain(d3.extent(data, (d) => d.Year))
      .range([0, width]);

    const yScale = d3
      .scaleTime()
      .domain(d3.extent(data, (d) => d.Time))
      .range([height, 0]);

    // Create the SVG element and append a group to it
    const svg = d3
      .select("#scatterplot")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left}, ${margin.top})`);

    // Create the x and y axes
    const xAxis = d3.axisBottom(xScale).tickFormat(d3.format("d"));
    const yAxis = d3.axisLeft(yScale).tickFormat(d3.timeFormat("%M:%S"));

    svg
      .append("g")
      .attr("id", "x-axis")
      .attr("transform", `translate(0, ${height})`)
      .call(xAxis);

    svg.append("g").attr("id", "y-axis").call(yAxis);

    // Create dots for each data point
    svg
      .selectAll(".dot")
      .data(data)
      .enter()
      .append("circle")
      .attr("class", "dot")
      .attr("r", 5)
      .attr("cx", (d) => xScale(d.Year))
      .attr("cy", (d) => yScale(d.Time))
      .attr("data-xvalue", (d) => d.Year)
      .attr("data-yvalue", (d) => d.Time.toISOString())
      .on("mouseover", handleMouseOver)
      .on("mouseout", handleMouseOut);

    // Create the legend
    const legend = svg
      .append("g")
      .attr("id", "legend")
      .attr("transform", `translate(${width - 200}, ${height - 70})`);

    legend
      .append("rect")
      .attr("width", 20)
      .attr("height", 20)
      .attr("fill", "steelblue");

    legend
      .append("text")
      .attr("x", 30)
      .attr("y", 15)
      .text("Riders with doping allegations");

    // Create the tooltip
    const tooltip = d3
      .select("#tooltip")
      .attr("id", "tooltip")
      .style("position", "absolute")
      .style("padding", "10px")
      .style("background", "#f0f0f0")
      .style("border", "1px solid #ccc")
      .style("border-radius", "5px")
      .style("color", "black")
      .style("pointer-events", "none");

    function handleMouseOver(event, d) {
      tooltip.style("display", "inline");
      tooltip.style("left", event.pageX + 10 + "px");
      tooltip.style("top", event.pageY + 10 + "px");
      tooltip.attr("data-year", d.Year);
      tooltip.html(
        `${d.Name}: ${d.Nationality}<br/>Year: ${
          d.Year
        }, Time: ${d.Time.getMinutes()}:${d.Time.getSeconds()}<br/>${d.Doping}`
      );
    }

    function handleMouseOut() {
      tooltip.style("display", "none");
    }
  };

  return (
    <div>
      <h1 id="title">Scatterplot Graph</h1>
      <svg id="scatterplot"></svg>
      <div id="tooltip" style={{ display: "none" }}></div>
      <div id="legend">Legend Text</div>
    </div>
  );
}

export default App;
