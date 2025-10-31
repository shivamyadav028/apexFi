import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { Shield, Zap, Lock } from "lucide-react";

const WalletConnect = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute w-96 h-96 bg-primary/20 rounded-full blur-3xl -top-48 -left-48 animate-float"></div>
        <div className="absolute w-96 h-96 bg-accent/20 rounded-full blur-3xl -bottom-48 -right-48 animate-float" style={{ animationDelay: "1s" }}></div>
      </div>

      <div className="relative z-10 max-w-2xl mx-auto px-6 text-center">
        {/* Logo */}
        <div className="mb-8 inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-primary animate-pulse-glow">
          <Shield className="w-10 h-10 text-primary-foreground" />
        </div>

        {/* Title */}
        <h1 className="text-6xl font-bold mb-4 bg-gradient-primary bg-clip-text text-transparent">
          ApexFi
        </h1>
        <p className="text-xl text-muted-foreground mb-12">
          Privacy-Preserving AI Yield Agent on Solana
        </p>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="glass-card rounded-2xl p-6 border-border hover:border-primary/50 transition-all duration-300">
            <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center mb-4 mx-auto">
              <Lock className="w-6 h-6 text-primary" />
            </div>
            <h3 className="font-semibold mb-2">Confidential Execution</h3>
            <p className="text-sm text-muted-foreground">
              Powered by Arcium's privacy layer
            </p>
          </div>

          <div className="glass-card rounded-2xl p-6 border-border hover:border-primary/50 transition-all duration-300">
            <div className="w-12 h-12 bg-accent/20 rounded-xl flex items-center justify-center mb-4 mx-auto">
              <Zap className="w-6 h-6 text-accent" />
            </div>
            <h3 className="font-semibold mb-2">AI-Optimized Yields</h3>
            <p className="text-sm text-muted-foreground">
              Intelligent rebalancing on Raydium
            </p>
          </div>

          <div className="glass-card rounded-2xl p-6 border-border hover:border-primary/50 transition-all duration-300">
            <div className="w-12 h-12 bg-success/20 rounded-xl flex items-center justify-center mb-4 mx-auto">
              <Shield className="w-6 h-6 text-success" />
            </div>
            <h3 className="font-semibold mb-2">MEV Protected</h3>
            <p className="text-sm text-muted-foreground">
              Front-running prevention built-in
            </p>
          </div>
        </div>

        {/* CTA */}
        <div className="flex justify-center">
          <WalletMultiButton className="!bg-gradient-primary hover:!opacity-90 !text-primary-foreground !font-semibold !px-8 !py-6 !text-lg !rounded-xl !shadow-glow-primary !transition-opacity" />
        </div>

        <p className="text-sm text-muted-foreground mt-6">
          Supports Phantom, Solflare, and all Solana wallets
        </p>
      </div>
    </div>
  );
};

export default WalletConnect;
