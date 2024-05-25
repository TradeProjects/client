// eslint-disable-next-line
import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Container,
  TextField,
  Button,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Box,
} from "@mui/material";
import * as d3 from "d3";

const calculateSMA = (data, windowSize) => {
  let sma = data.map((_, idx, arr) => {
    if (idx < windowSize - 1) {
      return { date: arr[idx].date, sma: null };
    }
    const windowSlice = arr.slice(idx - windowSize + 1, idx + 1);
    const average =
      windowSlice.reduce((acc, val) => acc + val.close, 0) / windowSize;
    return { date: arr[idx].date, sma: average };
  });
  return sma;
};

const CandleStickChart = ({ data }) => {
  const svgRef = React.useRef();
  // eslint-disable-next-line
  useEffect(() => {
    if (data && data.length > 0) {
      drawChart();
    }
  }, [data]);

  const drawChart = () => {
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove(); // Clear previous content

    const margin = { top: 20, right: 30, bottom: 30, left: 40 },
      width = 800 - margin.left - margin.right,
      height = 400 - margin.top - margin.bottom;

    const x = d3
      .scaleBand()
      .range([0, width])
      .domain(data.map((d) => d.date))
      .padding(0.2);

    const xTimeScale = d3
      .scaleTime()
      .domain(d3.extent(data, (d) => d.date))
      .range([0, width]);

    const y = d3
      .scaleLinear()
      .domain([d3.min(data, (d) => d.low), d3.max(data, (d) => d.high)])
      .nice()
      .range([height, 0]);

    const xAxis = (g) =>
      g
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(xTimeScale));

    const yAxis = (g) =>
      g.attr("transform", `translate(0,0)`).call(d3.axisLeft(y));

    svg
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    svg
      .append("g")
      .call(xAxis)
      .selectAll("text")
      .attr("transform", "rotate(-45)")
      .style("text-anchor", "end");

    svg.append("g").call(yAxis);

    svg
      .append("g")
      .selectAll(".candle")
      .data(data)
      .enter()
      .append("rect")
      .attr("class", "candle")
      .attr("x", (d) => x(d.date))
      .attr("y", (d) => y(Math.max(d.open, d.close)))
      .attr("width", x.bandwidth())
      .attr("height", (d) => Math.abs(y(d.open) - y(d.close)))
      .attr("fill", (d) => (d.open > d.close ? "red" : "green"));

    svg
      .append("g")
      .selectAll(".wick")
      .data(data)
      .enter()
      .append("line")
      .attr("class", "wick")
      .attr("x1", (d) => x(d.date) + x.bandwidth() / 2)
      .attr("x2", (d) => x(d.date) + x.bandwidth() / 2)
      .attr("y1", (d) => y(d.high))
      .attr("y2", (d) => y(d.low))
      .attr("stroke", "black");

    const smaData = calculateSMA(data, 10).filter((d) => d.sma !== null);

    const line = d3
      .line()
      .x((d) => x(d.date) + x.bandwidth() / 2)
      .y((d) => y(d.sma));

    svg
      .append("path")
      .datum(smaData)
      .attr("fill", "none")
      .attr("stroke", "blue")
      .attr("stroke-width", 2)
      .attr("d", line);
  };

  return <svg ref={svgRef} width={800} height={400} />;
};

const App = () => {
  const [stock, setStock] = useState("");
  const [year, setYear] = useState("");
  const [quarter, setQuarter] = useState("");
  const [data, setData] = useState(null);
  const [response, setResponse] = useState("");

  const [field1Text, setField1Text] = useState("");
  const [field1Percent, setField1Percent] = useState("");
  const [field2Text, setField2Text] = useState("");
  const [field2Percent, setField2Percent] = useState("");
  const [field3Text, setField3Text] = useState("");
  const [field3Percent, setField3Percent] = useState("");

  const fetchData = async () => {
    try {
      const response = await axios.post("/api/stock", { stock, year, quarter });
      const stockData = response.data.map((d) => ({
        date: new Date(d.date),
        open: d.open,
        high: d.high,
        low: d.low,
        close: d.close,
        volume: d.volume,
      }));
      setData(stockData);
    } catch (error) {
      console.error("Error fetching stock data", error);
    }
  };

  const handleReset = () => {
    setStock("");
    setYear("");
    setQuarter("");
    setField1Text("");
    setField1Percent("");
    setField2Text("");
    setField2Percent("");
    setField3Text("");
    setField3Percent("");
  };

  const handleSubmit = async () => {
    try {
      const response = await axios.post("/api/save", {
        stock,
        year,
        quarter,
        field1Text,
        field1Percent,
        field2Text,
        field2Percent,
        field3Text,
        field3Percent,
        data,
      });
      setResponse(response.data);
    } catch (error) {
      console.error("Error saving data", error);
      setResponse("Error saving data");
    }
  };

  return (
    <Container>
      <h1>Stock Data</h1>
      <Box component="form" noValidate autoComplete="off">
        <TextField
          label="Stock"
          value={stock}
          onChange={(e) => setStock(e.target.value)}
          fullWidth
          margin="normal"
        />
        <TextField
          label="Year"
          value={year}
          onChange={(e) => setYear(e.target.value)}
          fullWidth
          margin="normal"
        />
        <FormControl fullWidth margin="normal">
          <InputLabel>Quarter</InputLabel>
          <Select value={quarter} onChange={(e) => setQuarter(e.target.value)}>
            <MenuItem value={1}>Q1</MenuItem>
            <MenuItem value={2}>Q2</MenuItem>
            <MenuItem value={3}>Q3</MenuItem>
            <MenuItem value={4}>Q4</MenuItem>
          </Select>
        </FormControl>
        <Button variant="contained" color="primary" onClick={fetchData}>
          Fetch Data
        </Button>
        <Box component="form" noValidate autoComplete="off">
          {/* Other form fields */}
          <Button variant="contained" color="secondary" onClick={handleReset}>
            Reset
          </Button>
        </Box>
      </Box>
      <div style={{ marginTop: "20px" }}>
        {data && <CandleStickChart data={data} />}
      </div>
      {data && (
        <Box component="form" noValidate autoComplete="off" mt={3}>
          <TextField
            label="Field 1 Text"
            value={field1Text}
            onChange={(e) => setField1Text(e.target.value)}
            fullWidth
            margin="normal"
          />
          <TextField
            label="Field 1 Percent"
            value={field1Percent}
            onChange={(e) => setField1Percent(e.target.value)}
            fullWidth
            margin="normal"
          />
          <TextField
            label="Field 2 Text"
            value={field2Text}
            onChange={(e) => setField2Text(e.target.value)}
            fullWidth
            margin="normal"
          />
          <TextField
            label="Field 2 Percent"
            value={field2Percent}
            onChange={(e) => setField2Percent(e.target.value)}
            fullWidth
            margin="normal"
          />
          <TextField
            label="Field 3 Text"
            value={field3Text}
            onChange={(e) => setField3Text(e.target.value)}
            fullWidth
            margin="normal"
          />
          <TextField
            label="Field 3 Percent"
            value={field3Percent}
            onChange={(e) => setField3Percent(e.target.value)}
            fullWidth
            margin="normal"
          />
          <Button variant="contained" color="primary" onClick={handleSubmit}>
            Submit
          </Button>
        </Box>
      )}
      {response && (
        <Box mt={3}>
          <p>{response}</p>
        </Box>
      )}
    </Container>
  );
};

export default App;
