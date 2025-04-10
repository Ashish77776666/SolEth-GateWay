import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Connection, PublicKey, SystemProgram, Transaction, LAMPORTS_PER_SOL } from "@solana/web3.js";
import classNames from "classnames";
import axios from "axios";
import { Buffer } from "buffer";

// Polyfill Buffer globally
window.Buffer = window.Buffer || Buffer;
const WalletConnector = () => {
  const [walletAddress, setWalletAddress] = useState("Not connected");
  const [isConnected, setIsConnected] = useState(false);
  const [balance, setBalance] = useState("Unknown");
  // const [balance, setBalance] = useState<string | null>(null);
  const [recipient, setRecipient] = useState("");
  const [transactionSignature, setTransactionSignature] = useState("");
  const [amount, setAmount] = useState("");

  // Memoize the connection object
  const connection = useMemo(() => new Connection("https://api.devnet.solana.com", "confirmed"), []);

  const updateBalance = useCallback(async () => {
    if (walletAddress === "Not connected" || !window.solana?.isConnected) return;
    const publicKey = new PublicKey(walletAddress);
    const lamports = await connection.getBalance(publicKey);
    console.log("i am here ", lamports);
    setBalance((lamports / LAMPORTS_PER_SOL).toFixed(10));
  }, [walletAddress, connection]);

  const handleDisconnect = useCallback(() => {
    setWalletAddress("Not connected");
    setIsConnected(false);
    setBalance("Unknown");
  }, []);

  useEffect(() => {
    if (window.solana) {
      window.solana.on("connect", updateBalance);
      window.solana.on("disconnect", handleDisconnect);
      updateBalance();
    }
    return () => {
      if (window.solana) {
        window.solana.off("connect", updateBalance);
        window.solana.off("disconnect", handleDisconnect);
      }
    };
  }, [walletAddress, updateBalance, handleDisconnect]);

  const connectWallet = async () => {
    if (!window.solana) return alert("Please install a Solana wallet like Phantom!");
    try {
      await window.solana.connect();
      const publicKey = window.solana.publicKey.toString();
      setWalletAddress(publicKey);
      setIsConnected(true);
    } catch (error) {
      console.error("Connection failed:", error);
      setWalletAddress("Connection failed. Please try again.");
    }
  };

  const handleTransfer = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!window.solana?.isConnected) return alert("Please connect a Solana wallet!");

    const senderPublicKey = new PublicKey(walletAddress);
    const recipientPublicKey = new PublicKey(recipient);

    try {
      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: senderPublicKey,
          toPubkey: recipientPublicKey,
          lamports: parseFloat(amount) * LAMPORTS_PER_SOL,
        })
      );

      const { blockhash } = await connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = senderPublicKey;

      const { signature } = await window.solana.signAndSendTransaction(transaction);
      await connection.confirmTransaction({
        signature,
        blockhash,
        lastValidBlockHeight: (await connection.getLatestBlockhash()).lastValidBlockHeight,
      });

      setTransactionSignature(signature);

      await axios.post("http://localhost:2001/api/transactions", {
        sender: walletAddress,
        recipient,
        amount,
        transactionSignature: signature,
      });

      setAmount("");
      setRecipient("");
      updateBalance();
      alert("Transaction successful and recorded.");
    } catch (error) {
      console.error("Transaction failed:", error);
      alert("Transaction failed: " + ((error as Error).message || "Unknown error"));
    }
  };

  return (
    <div>
      <h1>Connect Your Solana Wallet</h1>
      <button onClick={connectWallet} disabled={isConnected}>
        {isConnected ? "Connected" : "Connect Wallet"}
      </button>
      <p>Wallet Address: {walletAddress}</p>
      <p>Balance: {balance} SOL</p>
      <form onSubmit={handleTransfer} className={classNames("etrAmnt", { hidden: !isConnected })}>
        <div>
          <label>Enter amount to transfer (SOL):</label>
          <input
            type="text"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Recipient Wallet Address:</label>
          <input
            type="text"
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
            required
          />
        </div>
        <button className="button2" type="submit">Transfer</button>
      </form>
    </div>
  );
};

export default WalletConnector;

