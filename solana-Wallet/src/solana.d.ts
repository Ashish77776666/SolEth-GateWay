interface Window {
    solana?: {
      isConnected: boolean;
      connect: () => Promise<void>;
      disconnect: () => Promise<void>;
      on: (event: string, callback: () => void) => void;
      off: (event: string, callback: () => void) => void;
      publicKey: { toString: () => string };
      signAndSendTransaction: (transaction: import("@solana/web3.js").Transaction) => Promise<{ signature: string }>;
    };
  }