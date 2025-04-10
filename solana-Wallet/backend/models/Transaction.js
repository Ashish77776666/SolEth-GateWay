const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema({
  recipient: { type: String, required: true }, // Your wallet address
  sender: { type: String, required: true },    // Who sent the SOL
  amount: { type: Number, required: true },    // SOL amount
  signature: { type: String, required: true }, // Transaction ID
  timestamp: { type: Date, default: Date.now },
});

module.exports = mongoose.model("IncomingTransaction", transactionSchema);