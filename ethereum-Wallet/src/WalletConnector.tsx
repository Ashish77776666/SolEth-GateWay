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
  const [transactionHash, setTransactionHash] = useState("");
  const [amount, setAmount] = useState("");

  const chainIdToCurrencySymbol: { [key: string]: string } = {
    "0x1": "ETH",
    "0x38": "BNB",
    "0x61": "TBNB",
    "0x89": "MATIC",
    "0xe708": "LINA",
  };

  const updateCurrencySymbol = (chainId: string) => {
    const symbol = chainIdToCurrencySymbol[chainId] || "Unknown";
    setCurrencySymbol(symbol);
  }

  const handleNetworkChange = async () => {
    if (window.ethereum) {
      if (
        walletAddress !== "Not connected" &&
        walletAddress !== "Connection failed. Please try again." &&
        walletAddress !== "Please install MetaMask!"
      ) {
        const chainId = (await window.ethereum.request({
          method: "eth_chainId",
        })) as string;
        updateCurrencySymbol(chainId);

        const web3 = new Web3(window.ethereum);
        const balanceWei = await web3.eth.getBalance(walletAddress);
        const balanceConverted = web3.utils.fromWei(balanceWei, "ether");
        setBalance(balanceConverted);
      }
    }
  };

  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.on("chainChanged", handleNetworkChange);
      handleNetworkChange();
    }
    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener("chainChanged", handleNetworkChange);
      }
    };
  });

  const connectWallet = async () => {
    if (typeof window.ethereum !== "undefined") {
      try {
        const accounts = await (window.ethereum.request({
          method: "eth_requestAccounts",
        }) as Promise<string[]>);
        if (accounts.length > 0) {
          const account = accounts[0];
          setWalletAddress(account);
          setIsConnected(true);
        } else {
          setWalletAddress("Please install MetaMask!");
        }
      } catch (error) {
        console.error("Connection failed:", error);
        setWalletAddress("Connection failed. Please try again.");
      }
    }
  };

  const handleTransfer = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!window.ethereum) {
      alert("Please install MetaMask to use this feature.");
      return;
    }

    const web3 = new Web3(window.ethereum);
    const accounts = await web3.eth.getAccounts();
    console.log(accounts)
    const sender = accounts[0];

    try {
      const value = web3.utils.toWei(amount, "ether");
      const tx = await web3.eth.sendTransaction({
        from: sender,
        to: recipient,
        value,
      });
      // setTransactionHash(tx.transactionHash);
      console.log(tx.transactionHash)
      const hashString = Web3.utils.bytesToHex(tx.transactionHash);
      setTransactionHash(hashString);

      // Send transaction details to the backend
      await axios.post("http://localhost:1001/api/transactions", {
        sender,
        recipient,
        amount,
        transactionHash: tx.transactionHash,
      });
      setAmount(""); // Clear amount field
      setRecipient(""); // Clear recipient field
      handleNetworkChange(); // Refresh balance
      alert("Transaction successful and recorded.");
    } catch (error) {
      console.error("Transaction failed:", error);
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
      <p>
        Balance: {balance} {currencySymbol}
      </p>

      <form
        onSubmit={handleTransfer}
        className={classNames("etrAmnt", { hidden: !isConnected })}
      >
        <div>
          <label>Enter amount to transfer :</label>
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
        <button className="button2" type="submit">
          Transfer
        </button>
      </form>
    </div>
  );
};

export default WalletConnector;
