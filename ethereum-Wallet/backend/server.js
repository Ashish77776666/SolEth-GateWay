const mongoose = require("mongoose");
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");

// Connect to MongoDB
mongoose.connect("mongodb://localhost:27017/crypto-transactions");

const db = mongoose.connection;
db.on("error", (err) => {
  console.error("MongoDB connection error:", err);
});
db.once("open", () => {
  console.log("Connected to MongoDB");
});

// Define schema and model
const transactionSchema = new mongoose.Schema({
  sender: String,
  recipient: String,
  amount: String,
  transactionHash: String,
  timestamp: { type: Date, default: Date.now },
});

const Transaction = mongoose.model("Transaction", transactionSchema);

// Set up Express app
const app = express();
const port = 1001;

app.use(bodyParser.json());
app.use(cors());

app.post("/api/transactions", async (req, res) => {
  console.log("Received POST request:", req.body);
  const { sender, recipient, amount, transactionHash } = req.body;

  const newTransaction = new Transaction({
    sender,
    recipient,
    amount,
    transactionHash,
  });

  try {
    await newTransaction.save();
    console.log("Transaction saved to MongoDB:", newTransaction);
    res.status(201).json({ message: "Transaction recorded successfully." });
  } catch (error) {
    console.error("Error saving transaction:", error);
    res.status(500).json({ error: "Failed to record transaction." });
  }
});

// Test route
app.get("/", (req, res) => {
  res.send("Server is running!");
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
}).on("error", (err) => {
  console.error("Server failed to start:", err);
});