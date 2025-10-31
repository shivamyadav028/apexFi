# 🧠 ApexFi — Autonomous AI-Powered DeFi Yield Optimizer on Solana

> **ApexFi** is an autonomous AI-powered DeFi yield optimizer built on **Solana**, combining artificial intelligence with **confidential computing** to maximize returns while preserving user privacy.  
> It automatically rebalances liquidity positions across **Raydium pools** using AI-driven strategies, all while maintaining **transaction confidentiality** through **Arcium's MPC technology**.

---

## 🌟 Features Overview

| Feature | Description |
|----------|-------------|
| 🤖 **AI-Powered Yield Farming** | Automatically reallocates liquidity based on Raydium pool APYs, TVL, and volume. |
| 🛡️ **Risk Management (Guardian Mode)** | Detects high-volatility events and auto-switches to safe positions. |
| 🎯 **Personalized Strategies** | Conservative, Balanced, and Aggressive yield profiles. |
| 🔮 **Predictive Alpha Generation** | AI anticipates trading volume spikes for higher returns. |
| 🔐 **Confidential Transactions** | Privacy-preserving rebalancing using Arcium MPC. |
| ⚡ **High-Speed Execution** | Low-latency transactions powered by Triton RPC and Solana. |

---

## 🏗️ Core Integrations

### 🔐 **Arcium (Privacy Layer)**
- Enables **confidential DeFi operations** with MPC.
- Prevents **MEV** and **copy-trading** attacks.
- Ensures **private vault execution** and **encrypted transaction data**.

📘 **Docs:** [https://docs.arcium.com/](https://docs.arcium.com/)

---

### 🌊 **Raydium (Liquidity Protocol)**
- Solana’s leading AMM with $3B+ TVL.
- Provides yield opportunities for ApexFi’s AI to manage.
- Supports pool monitoring, swaps, and liquidity operations.

📘 **Docs:** [https://docs.raydium.io/](https://docs.raydium.io/)

---

### ⚡ **Triton (High-Performance RPC)**
- Real-time on-chain monitoring and low-latency execution.
- Provides reliable Solana data for AI-driven decisions.

📘 **Docs:** [https://docs.triton.one/](https://docs.triton.one/)

---

### 🟣 **Phantom (Wallet Interface)**
- Solana wallet integration for authentication and signing.
- Supports Phantom, Solflare, and Torus wallets.

📘 **Docs:** [https://docs.phantom.app/](https://docs.phantom.app/)

---

### ⛓️ **Solana (Blockchain Foundation)**
- Fast, low-fee transactions ideal for frequent DeFi operations.
- On-chain vault program holds user funds securely.

📘 **Docs:** [https://solana.com/docs](https://solana.com/docs)

---

### 🤖 **Lovable AI (Strategy Engine)**
- AI engine analyzes market data and recommends yield strategies.
- Uses **Google Gemini** for intelligent strategy generation.

📘 **Docs:** [https://docs.lovable.dev/features/ai](https://docs.lovable.dev/features/ai)

---

### 💾 **Lovable Cloud (Backend Infrastructure)**
- Serverless backend for database, authentication, and real-time data.
- Handles AI analysis and transaction processing via Edge Functions.

📘 **Docs:** [https://docs.lovable.dev/features/cloud](https://docs.lovable.dev/features/cloud)

---

## 🚀 Getting Started

### 🧱 Prerequisites
- Node.js 18+ or Bun
- Phantom Wallet extension
- (Optional) Triton RPC endpoint for production

### ⚙️ Installation

```bash
# Clone the repository
git clone <repository-url>
cd apexfi

# Install dependencies
npm install  # or bun install

# Start development server
npm run dev  # or bun run dev
```

---

## 🌐 Environment Setup

ApexFi uses Lovable Cloud auto-config for Supabase and AI services.

```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_key
LOVABLE_API_KEY=your_lovable_api_key
VITE_TRITON_RPC_ENDPOINT=your_triton_endpoint_here
```

---

## 📁 Project Structure

```
apexfi/
├── src/
│   ├── components/
│   │   ├── Dashboard.tsx
│   │   ├── VaultManager.tsx
│   │   ├── StrategyCards.tsx
│   │   ├── GuardianMode.tsx
│   │   ├── StrategyProfileSelector.tsx
│   │   ├── TransactionHistory.tsx
│   │   └── WalletConnect.tsx
│   ├── integrations/supabase/
│   │   ├── client.ts
│   │   └── types.ts
│   └── main.tsx
├── supabase/functions/
│   ├── raydium-pools/
│   ├── ai-strategy-analysis/
│   ├── ai-guardian/
│   └── activate-strategy/
└── README.md
```

---

## 📊 Database Schema

| Table | Purpose |
|--------|----------|
| `user_vaults` | Stores user vaults and strategy preferences |
| `transactions` | Tracks transaction history in real-time |
| `active_positions` | Current liquidity positions |
| `ai_predictions` | AI-generated insights and forecasts |
| `risk_events` | Market risk events detected by Guardian Mode |

---

## 🧠 Tech Stack

- **Frontend:** React 18, TypeScript, Vite  
- **Styling:** Tailwind CSS, Shadcn UI  
- **Blockchain:** Solana Web3.js, Wallet Adapter  
- **Backend:** Supabase (Lovable Cloud)  
- **AI Engine:** Lovable AI (Google Gemini)  
- **DeFi Protocol:** Raydium  
- **RPC Layer:** Triton  

---

## 🔮 Future Enhancements

- ✅ Full Arcium MPC transaction support  
- 🤖 Advanced AI model training for better yield prediction  
- 💹 Raydium SDK direct liquidity provisioning  
- 🔐 Enhanced private rebalancing logic  
- 📈 Cross-pool arbitrage detection  

---

## 🤝 Contributing

This project was built for **Solana Colosseum Hackathon**.  
Contributions, issues, and feature requests are welcome!

---

## 📄 License

**MIT License** — free to use, modify, and distribute.

---

## ❤️ Acknowledgments

- **Solana Foundation** — Blockchain infrastructure  
- **Arcium** — Privacy technology sponsor  
- **Raydium** — Liquidity protocol sponsor  
- **Triton** — RPC infrastructure sponsor  
- **Phantom** — Wallet interface sponsor  
- **Lovable** — Cloud and AI platform  

---
