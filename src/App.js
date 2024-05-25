/* eslint-disable */
import React, { useState } from "react";
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
import yahooFinance from "yahoo-finance2";
import mongoose from "mongoose";

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

  const saveDataToMongoDB = async () => {
    const mongoURI =
      "mongodb://tradedata:Trade1234@ac-m6cnuwr-shard-00-00.awscipt.mongodb.net:27017,ac-m6cnuwr-shard-00-01.awscipt.mongodb.net:27017,ac-m6cnuwr-shard-00-02.awscipt.mongodb.net:27017/?ssl=true&replicaSet=atlas-112lz4-shard-0&authSource=admin&retryWrites=true&w=majority&appName=trading"; // Replace with your MongoDB URI
    mongoose
      .connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
      .then(() => console.log("MongoDB connected"))
      .catch((err) => console.error("MongoDB connection error:", err));

    const Stock = mongoose.model("Stock", {
      stock: String,
      year: Number,
      quarter: Number,
      field1Text: String,
      field1Percent: Number,
      field2Text: String,
      field2Percent: Number,
      field3Text: String,
      field3Percent: Number,
      data: Array,
    });

    const newStock = new Stock({
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

    try {
      await newStock.save();
      setResponse("Data saved successfully");
    } catch (error) {
      console.error("Error saving data:", error.message);
      setResponse("Error saving data");
    }
  };

  const fetchDataFromYahooFinance = async () => {
    const startDate = `${year}-${String((quarter - 1) * 3 + 1).padStart(
      2,
      "0"
    )}-01`;
    const endDate = `${year}-${String(quarter * 3).padStart(2, "0")}-01`;

    const queryOptions = {
      period1: startDate,
      period2: endDate,
      interval: "1d",
    };

    try {
      const result = await yahooFinance.historical(stock, queryOptions);
      const stockData = result.map((d) => ({
        date: new Date(d.date),
        open: d.open,
        high: d.high,
        low: d.low,
        close: d.close,
        volume: d.volume,
      }));
      setData(stockData);
    } catch (error) {
      console.error("Error fetching stock data:", error.message);
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
            <MenuItem value={2}>Q Q2</MenuItem>
            <MenuItem value={3}>Q3</MenuItem>
            <MenuItem value={4}>Q4</MenuItem>
          </Select>
        </FormControl>
        <Button
          variant="contained"
          color="primary"
          onClick={fetchDataFromYahooFinance}
        >
          Fetch Data
        </Button>
        <Box component="form" noValidate autoComplete="off">
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
          <Button
            variant="contained"
            color="primary"
            onClick={saveDataToMongoDB}
          >
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
