import yahooFinance from "yahoo-finance2";
import mongoose from "mongoose";

// MongoDB connection
const mongoURI =
  "mongodb://tradedata:Trade1234@ac-m6cnuwr-shard-00-00.awscipt.mongodb.net:27017,ac-m6cnuwr-shard-00-01.awscipt.mongodb.net:27017,ac-m6cnuwr-shard-00-02.awscipt.mongodb.net:27017/?ssl=true&replicaSet=atlas-112lz4-shard-0&authSource=admin&retryWrites=true&w=majority&appName=trading";
mongoose
  .connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Define your schema and model
const stockSchema = new mongoose.Schema({
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

const Stock = mongoose.model("Stock", stockSchema);

const fetchStockData = async (req, res) => {
  const { stock, year, quarter } = req.body;
  const startDate = `${year}-${String((quarter - 1) * 3 + 1).padStart(
    2,
    "0"
  )}-01`;
  const endDate = `${year}-${String(quarter * 3).padStart(2, "0")}-01`;

  try {
    const queryOptions = {
      period1: startDate,
      period2: endDate,
      interval: "1d",
    };
    const result = await yahooFinance.historical(stock, queryOptions);
    res.json(result);
  } catch (error) {
    console.error("Error fetching stock data:", error.message);
    res.status(500).send("Error fetching stock data");
  }
};

const saveStockData = async (req, res) => {
  const {
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
  } = req.body;

  try {
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

    await newStock.save();
    res.status(200).send("Data saved successfully");
  } catch (error) {
    console.error("Error saving data:", error.message);
    res.status(500).send("Error saving data");
  }
};

export { fetchStockData, saveStockData };
