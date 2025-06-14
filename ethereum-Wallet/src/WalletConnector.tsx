import React, { useState, useEffect } from "react";
import Web3 from "web3";
import classNames from "classnames";
import axios from "axios";

const WalletConnector = () => {
  const [walletAddress, setWalletAddress] = useState("Not connected");
  const [isConnected, setIsConnected] = useState(false);
  const [balance, setBalance] = useState<string | null>(null);
  const [currencySymbol, setCurrencySymbol] = useState("Unknown");
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [transactionHash, setTransactionHash] = useState<string | null>(null);

  const chainIdToCurrencySymbol: { [key: string]: string } = {
    "0x1": "ETH",
    "0x38": "BNB",
    "0x61": "TBNB",
    "0x89": "MATIC",
    "0xe708": "LINA",
  };

  const updateCurrencySymbol = (chainId: string) => {
    setCurrencySymbol(chainIdToCurrencySymbol[chainId] || "Unknown");
  };

  const handleNetworkChange = async () => {
    if (window.ethereum && walletAddress.startsWith("0x")) {
      const chainId = (await window.ethereum.request({
        method: "eth_chainId",
      })) as string;
      updateCurrencySymbol(chainId);

      const web3 = new Web3(window.ethereum);
      const balanceWei = await web3.eth.getBalance(walletAddress);
      setBalance(web3.utils.fromWei(balanceWei, "ether"));
    }
  };

  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.on("chainChanged", handleNetworkChange);
      handleNetworkChange();
    }
    return () => {
      window.ethereum?.removeListener("chainChanged", handleNetworkChange);
    };
  }, [walletAddress]);

  const connectWallet = async () => {
    if (!window.ethereum) {
      setWalletAddress("Please install MetaMask!");
      return;
    }
    try {
      const accounts = (await window.ethereum.request({
        method: "eth_requestAccounts",
      })) as string[];
      if (accounts.length) {
        setWalletAddress(accounts[0]);
        setIsConnected(true);
      }
    } catch {
      setWalletAddress("Connection failed. Please try again.");
    }
  };

  // at the top of your component
const [transactionHash, setTransactionHash] = useState<string | null>(null);

// …

const handleTransfer = async (e: React.FormEvent) => {
  e.preventDefault();
  const web3 = new Web3(window.ethereum);
  const [sender] = await web3.eth.getAccounts();

  try {
    const value = web3.utils.toWei(amount, "ether");
    const tx = await web3.eth.sendTransaction({ from: sender, to: recipient, value });

    // normalize the hash into a string
    const hashHex: string =
      typeof tx.transactionHash === "string"
        ? tx.transactionHash
        : Web3.utils.bytesToHex(tx.transactionHash as Uint8Array);

    setTransactionHash(hashHex);

    await axios.post("http://localhost:1001/api/transactions", {
      sender,
      recipient,
      amount,
      transactionHash: hashHex,
    });

    // reset form + refresh balance
    setAmount("");
    setRecipient("");
    handleNetworkChange();
    alert("Transaction successful and recorded.");
  } catch {
    alert("Transaction failed.");
  }
};


  return (
    <div>
      <h1>Connect Your Ethereum Wallet</h1>
      <button onClick={connectWallet} disabled={isConnected}>
        {isConnected ? "Connected" : "Connect Wallet"}
      </button>

      <p>Wallet Address: {walletAddress}</p>
      <p>Balance: {balance ?? "--"} {currencySymbol}</p>

      <form
        onSubmit={handleTransfer}
        className={classNames("etrAmnt", { hidden: !isConnected })}
      >
        <div>
          <label>Enter amount to transfer:</label>
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
        <button type="submit">Transfer</button>
      </form>

      {/* Render the transaction hash so it's “used” */}
      {transactionHash && (
        <p>
          <strong>Transaction Hash:</strong> {transactionHash}
        </p>
      )}
    </div>
  );
};

export default WalletConnector;
