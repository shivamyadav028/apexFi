import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, TrendingUp, AlertCircle, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useWallet } from "@solana/wallet-adapter-react";
import type { RaydiumPoolInfo } from "@/lib/raydium";

const StrategyCards = () => {
  const { publicKey, connected } = useWallet();
  const [isGenerating, setIsGenerating] = useState(false);
  const [isActivating, setIsActivating] = useState<string | null>(null);
  const [strategies, setStrategies] = useState<RaydiumPoolInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [strategyProfile, setStrategyProfile] = useState('balanced');

  useEffect(() => {
    loadStrategies();
    if (connected && publicKey) {
      loadStrategyProfile();
    }
  }, [connected, publicKey]);

  const loadStrategyProfile = async () => {
    if (!publicKey) return;
    
    try {
      const walletAddress = publicKey.toString();
      const { data } = await supabase
        .from('user_vaults')
        .select('strategy_profile')
        .eq('wallet_address', walletAddress)
        .maybeSingle();

      if (data?.strategy_profile) {
        setStrategyProfile(data.strategy_profile);
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    }
  };

  const loadStrategies = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('raydium-pools');
      
      if (error) throw error;

      if (data?.pools) {
        setStrategies(data.pools.slice(0, 6));
      }
      setLoading(false);
    } catch (error) {
      console.error('Error loading strategies:', error);
      toast.error('Failed to load strategies');
      setLoading(false);
    }
  };

  const generateNewStrategies = async () => {
    setIsGenerating(true);
    
    try {
      // Fetch fresh pool data
      await loadStrategies();

      // Run AI analysis
      const { data: analysisData, error: analysisError } = await supabase.functions.invoke(
        'ai-strategy-analysis',
        {
          body: { pools: strategies, strategyProfile }
        }
      );

      if (analysisError) throw analysisError;

      toast.success("New strategies generated!", {
        description: `AI recommends: ${analysisData.recommendedPools?.[0] || 'Check recommendations'}`,
      });
    } catch (error) {
      console.error('Error generating strategies:', error);
      toast.error('Failed to generate new strategies');
    } finally {
      setIsGenerating(false);
    }
  };

  const activateStrategy = async (strategy: RaydiumPoolInfo) => {
    if (!connected || !publicKey) {
      toast.error('Please connect your wallet first');
      return;
    }
    
    setIsActivating(strategy.poolId);
    
    try {
      const { data, error } = await supabase.functions.invoke('activate-strategy', {
        body: { 
          strategy,
          walletAddress: publicKey.toString()
        }
      });

      if (error) throw error;

      toast.success('Strategy activated!', {
        description: `Now earning ${strategy.apy}% APY on ${strategy.name}`,
      });

      // Reload strategies to update active status
      await loadStrategies();
    } catch (error) {
      console.error('Error activating strategy:', error);
      toast.error('Failed to activate strategy');
    } finally {
      setIsActivating(null);
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case "Low":
        return "bg-success/20 text-success border-success/30";
      case "Medium":
        return "bg-primary/20 text-primary border-primary/30";
      case "High":
        return "bg-destructive/20 text-destructive border-destructive/30";
      default:
        return "";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-accent/20 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-accent" />
          </div>
          AI Strategy Recommendations
        </h2>
        
        <Button
          onClick={generateNewStrategies}
          disabled={isGenerating}
          variant="outline"
          className="border-border hover:border-accent hover:text-accent"
        >
          {isGenerating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <Sparkles className="mr-2 h-4 w-4" />
              Generate New
            </>
          )}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {strategies.map((strategy) => (
          <Card
            key={strategy.poolId}
            className="glass-card border-border p-6"
          >
            <h3 className="text-xl font-bold mb-4">{strategy.name}</h3>
            
            <div className="space-y-3 mb-6">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">APY</span>
                <span className="text-lg font-bold text-success flex items-center gap-1">
                  <TrendingUp className="w-4 h-4" />
                  {strategy.apy.toFixed(2)}%
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">TVL</span>
                <span className="font-semibold">${(strategy.tvl / 1000000).toFixed(2)}M</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Volume 24h</span>
                <span className="font-semibold">${(strategy.volume24h / 1000).toFixed(0)}K</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Risk Level</span>
                <Badge className={getRiskColor(strategy.riskLevel)}>
                  {strategy.riskLevel}
                </Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">AI Score</span>
                <div className="flex items-center gap-2">
                  <div className="w-16 h-2 bg-secondary rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-primary"
                      style={{ width: `${strategy.aiScore}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-semibold">{Math.round(strategy.aiScore)}</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Type</span>
                <Badge variant="outline">{strategy.type}</Badge>
              </div>
            </div>

            <Button
              className="w-full"
              variant="outline"
              onClick={() => activateStrategy(strategy)}
              disabled={isActivating === strategy.poolId}
            >
              {isActivating === strategy.poolId ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Activating...
                </>
              ) : (
                'Activate Strategy'
              )}
            </Button>
          </Card>
        ))}
      </div>

      <div className="mt-6 p-4 bg-accent/10 border border-accent/20 rounded-xl flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
        <div className="text-sm">
          <strong className="text-foreground">Live Raydium Data:</strong>
          <p className="text-muted-foreground mt-1">
            Strategies are generated from real-time Raydium pool data. All recommendations are based on current APYs, TVL, and trading volumes.
          </p>
        </div>
      </div>
    </div>
  );
};

export default StrategyCards;