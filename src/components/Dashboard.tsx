import { useState } from "react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { Card } from "@/components/ui/card";
import { Activity, TrendingUp, DollarSign } from "lucide-react";
// using the previous inline header instead of NavBar
import VaultManager from "./VaultManager";
import AIAgent from "./AIAgent";
import StrategyCards from "./StrategyCards";
import TransactionHistory from "./TransactionHistory";
import GuardianMode from "./GuardianMode";
import StrategyProfileSelector from "./StrategyProfileSelector";
import PredictiveInsights from "./PredictiveInsights";
 

function netProfitPercent() { return "+22.5%"; }

interface DashboardProps {
  walletAddress: string;
  onDisconnect: () => void;
}

const Dashboard = ({ walletAddress, onDisconnect }: DashboardProps) => {
  const [vaultBalance] = useState(2450.75);
  const [totalProfit] = useState(450.75);
  const [apy] = useState('12.4%');

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'hsl(222 47% 11%)', color: 'hsl(var(--foreground))' }}>
      {/* Header */}
      <header className="border-b border-border backdrop-blur-sm sticky top-0 z-50"
        style={{ backgroundColor: 'hsl(222 47% 11%)', color: 'hsl(var(--foreground))' }}>
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                   style={{ background: 'var(--gradient-primary)' }}>
                <Activity className="w-6 h-6" />
              </div>
              <h1 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                ApexFi
              </h1>
            </div>

            <div className="flex items-center gap-4">
              <WalletMultiButton className="!bg-transparent" />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="glass-card border-border p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Vault Balance</span>
              <DollarSign className="w-5 h-5 text-primary" />
            </div>
            <div className="text-3xl font-bold mb-1">${vaultBalance.toLocaleString()}</div>
            <div className="text-sm text-success flex items-center gap-1">
              <TrendingUp className="w-4 h-4" />
              +{totalProfit.toLocaleString()} USDC
            </div>
          </Card>

          <Card className="glass-card border-border p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Current APY</span>
              <Activity className="w-5 h-5 text-accent" />
            </div>
            <div className="text-3xl font-bold mb-1">{apy}</div>
            <div className="text-sm text-muted-foreground">Updated recently</div>
          </Card>

          <Card className="glass-card border-border p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Total Profit</span>
              <TrendingUp className="w-5 h-5 text-success" />
            </div>
            <div className="text-3xl font-bold mb-1">{netProfitPercent()}</div>
            <div className="text-sm text-muted-foreground">All time (from deposits/withdrawals)</div>
          </Card>
        </div>

        {/* Vault Manager */}
        <div className="mb-8">
          <VaultManager />
        </div>

        {/* AI Agent */}
        <div className="mb-8">
          <AIAgent />
        </div>

        {/* Guardian Mode & Strategy Profile */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <GuardianMode />
          <PredictiveInsights />
        </div>

        {/* Strategy Profile Selector */}
        <div className="mb-8">
          <StrategyProfileSelector />
        </div>

        {/* Strategy Cards */}
        <div className="mb-8">
          <StrategyCards />
        </div>

        {/* Transaction History */}
        <div>
          <TransactionHistory />
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
