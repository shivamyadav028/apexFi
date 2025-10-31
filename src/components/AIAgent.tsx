import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Brain, Loader2, CheckCircle2, TrendingUp, Shield } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";

const AIAgent = () => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState("");
  const [analysisComplete, setAnalysisComplete] = useState(false);

  const steps = [
    { label: "Scanning Raydium pools...", duration: 2000 },
    { label: "Analyzing yield opportunities...", duration: 2500 },
    { label: "Calculating risk metrics...", duration: 2000 },
    { label: "Optimizing portfolio allocation...", duration: 2500 },
    { label: "Preparing confidential execution...", duration: 2000 },
  ];

  const startAnalysis = async () => {
    setIsAnalyzing(true);
    setProgress(0);
    setAnalysisComplete(false);

    let totalDuration = 0;
    for (const step of steps) {
      setCurrentStep(step.label);
      await new Promise((resolve) => setTimeout(resolve, step.duration));
      totalDuration += step.duration;
      setProgress((totalDuration / steps.reduce((acc, s) => acc + s.duration, 0)) * 100);
    }

    setIsAnalyzing(false);
    setAnalysisComplete(true);
    toast.success("Analysis complete!", {
      description: "AI agent has identified optimal strategy",
    });
  };

  return (
    <Card className="glass-card border-border p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-accent/20 flex items-center justify-center">
            <Brain className="w-5 h-5 text-accent" />
          </div>
          AI Agent Status
        </h2>
        
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${isAnalyzing ? 'bg-accent animate-pulse' : 'bg-success'}`}></div>
          <span className="text-sm text-muted-foreground">
            {isAnalyzing ? "Active" : "Idle"}
          </span>
        </div>
      </div>

      {isAnalyzing && (
        <div className="space-y-4 mb-6">
          <div className="flex items-center gap-3">
            <Loader2 className="w-5 h-5 text-accent animate-spin" />
            <span className="text-sm text-muted-foreground">{currentStep}</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      )}

      {analysisComplete && (
        <div className="bg-success/10 border border-success/20 rounded-xl p-4 mb-6">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle2 className="w-5 h-5 text-success" />
            <span className="font-semibold text-success">Strategy Optimized</span>
          </div>
          <p className="text-sm text-muted-foreground">
            AI agent recommends rebalancing to SOL-USDC CLMM pool with 18.2% projected APY
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-secondary/30 rounded-xl p-4">
          <div className="text-sm text-muted-foreground mb-1">Active Pools</div>
          <div className="text-2xl font-bold">3</div>
        </div>
        
        <div className="bg-secondary/30 rounded-xl p-4">
          <div className="text-sm text-muted-foreground mb-1">Rebalances (24h)</div>
          <div className="text-2xl font-bold">7</div>
        </div>
        
        <div className="bg-secondary/30 rounded-xl p-4">
          <div className="text-sm text-muted-foreground mb-1">Avg Response Time</div>
          <div className="text-2xl font-bold">2.3s</div>
        </div>
      </div>

      <Button
        onClick={startAnalysis}
        disabled={isAnalyzing}
        className="w-full bg-gradient-secondary hover:opacity-90 text-accent-foreground h-12 text-base font-semibold"
      >
        {isAnalyzing ? (
          <>
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Analyzing...
          </>
        ) : (
          <>
            <Brain className="mr-2 h-5 w-5" />
            Run AI Analysis
          </>
        )}
      </Button>

      <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
        <Shield className="w-4 h-4 text-primary" />
        All AI operations executed privately via Arcium MPC
      </div>
    </Card>
  );
};

export default AIAgent;
