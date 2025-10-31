import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import "@solana/wallet-adapter-react-ui/styles.css";

import { ConnectionProvider, WalletProvider } from "@solana/wallet-adapter-react";
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import { PhantomWalletAdapter, SolflareWalletAdapter, TorusWalletAdapter } from "@solana/wallet-adapter-wallets";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import { clusterApiUrl } from "@solana/web3.js";
import { AuthProvider } from "./contexts/AuthContext";

// Use Solana Devnet for development (change to mainnet-beta for production)
const network = WalletAdapterNetwork.Devnet;

// Use Triton RPC endpoint if available, otherwise fallback to default
const getEndpoint = () => {
  const tritonEndpoint = import.meta.env.VITE_TRITON_RPC_ENDPOINT;
  
  if (tritonEndpoint) {
    console.log('🚀 Using Triton RPC endpoint for high-performance access');
    return tritonEndpoint;
  }
  
  console.log('📡 Using default Solana RPC endpoint (configure VITE_TRITON_RPC_ENDPOINT for Triton)');
  return clusterApiUrl(network);
};

const endpoint = getEndpoint();

// Configure wallets (Phantom, Solflare, Torus)
const wallets = [
  new PhantomWalletAdapter(),
  new SolflareWalletAdapter(),
  new TorusWalletAdapter(),
];

createRoot(document.getElementById("root")!).render(
  <ConnectionProvider endpoint={endpoint}>
    <WalletProvider wallets={wallets} autoConnect>
      <WalletModalProvider>
        <AuthProvider>
          <App />
        </AuthProvider>
      </WalletModalProvider>
    </WalletProvider>
  </ConnectionProvider>
);
