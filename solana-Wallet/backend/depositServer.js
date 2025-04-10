
const mongoose = require("mongoose");
const { Connection, clusterApiUrl, PublicKey } = require("@solana/web3.js");

// MongoDB Connection
mongoose.connect("mongodb://localhost:27017/solanaIncoming-transactions");
const db = mongoose.connection;
db.on("error", console.error.bind(console, "Connection error:"));
db.once("open", () => {
  console.log("Connected to MongoDB");
});

// Define Transaction Schema
const transactionSchema = new mongoose.Schema({
  signature: String,
  blockTime: Number,
  slot: Number,
  err: Object,
  amount: Number,
  sender: String,
  receiver: String,
});

const Transaction = mongoose.model("Transaction", transactionSchema);

// Solana Connection
const connection = new Connection(clusterApiUrl("devnet"), "confirmed");

// Your Wallet Address
const walletAddress = new PublicKey("HNE1yXp7xLhGZ1kMLAtGY89BSHgkSj7PhNfe94VzAok1");

connection.onAccountChange(
  walletAddress,
  async (accountInfo, context) => {
    console.log("Account balance changed!");

    // Fetch the latest transaction signatures for your wallet
    const signatures = await connection.getSignaturesForAddress(walletAddress, { limit: 1 });

    if (signatures.length > 0) {
      const latestSignature = signatures[0].signature;

      // Replace getTransaction with getParsedTransaction
      const transactionDetails = await connection.getParsedTransaction(
        latestSignature,
        { commitment: "confirmed", maxSupportedTransactionVersion: 0 }
      );

      if (transactionDetails ) {
        // Adjust how we extract sender, receiver, and amount from parsed transaction
        const sender = transactionDetails.transaction.message.accountKeys[0].pubkey.toBase58();
        const receiver = transactionDetails.transaction.message.accountKeys[1].pubkey.toBase58();
        const amount = (transactionDetails.meta.postBalances[1] - transactionDetails.meta.preBalances[1]) / 1e9; // Convert lamports to SOL

        console.log(`New transaction detected! Signature: ${latestSignature}`);
        console.log(amount, " ", transactionDetails.meta.postBalances[1]/ 1e9, " ",transactionDetails.meta.preBalances[1]/ 1e9 );

        // Save transaction to MongoDB only if reciever is HNE1yXp7xLhGZ1kMLAtGY89BSHgkSj7PhNfe94VzAok1
        // if( receiver === "HNE1yXp7xLhGZ1kMLAtGY89BSHgkSj7PhNfe94VzAok1"){
        const transaction = new Transaction({
          signature: latestSignature,
          blockTime: transactionDetails.blockTime,
          slot: transactionDetails.slot,
          err: transactionDetails.meta.err,
          amount,
          sender,
          receiver,
        });

        try {
          await transaction.save();
          console.log("Transaction saved to MongoDB:", transaction);
        } catch (error) {
          console.error("Error saving transaction:", error);
        }
      // }
      }
    }
  },
  {commitment: "confirmed"}
);

