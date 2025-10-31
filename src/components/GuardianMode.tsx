import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Shield, AlertTriangle, CheckCircle2, History, TrendingDown } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface GuardianStatus {
  solPrice?: number;
  priceChange24h?: number;
  riskDetected?: boolean;
  severity?: 'low' | 'medium' | 'high' | 'critical';
  description?: string;
}

interface RiskEvent {
  event_type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  created_at: string | number | Date;
}

const GuardianMode = () => {
  const [guardianStatus, setGuardianStatus] = useState<GuardianStatus | null>(null);
  const [isActive, setIsActive] = useState(false);
  const [loading, setLoading] = useState(true);
  const [guardianEnabled, setGuardianEnabled] = useState(true);
  const [riskHistory, setRiskHistory] = useState<RiskEvent[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    checkGuardianStatus();
    loadRiskHistory();
    const interval = setInterval(checkGuardianStatus, 60000);
    return () => clearInterval(interval);
  }, []);

  const loadRiskHistory = async () => {
    try {
      const { data, error } = await supabase
        .from('risk_events')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);
      
      if (error) throw error;
      const allowed = ['low', 'medium', 'high', 'critical'] as const;
      const normalized: RiskEvent[] = (data || []).map((e: any) => ({
        event_type: e.event_type,
        severity: allowed.includes(e.severity as typeof allowed[number])
          ? (e.severity as RiskEvent['severity'])
          : 'medium',
        description: e.description ?? '',
        created_at: e.created_at,
      }));
      setRiskHistory(normalized);
    } catch (error) {
      console.error('Error loading risk history:', error);
    }
  };

  const checkGuardianStatus = async () => {
    if (!guardianEnabled) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase.functions.invoke('ai-guardian');
      if (error) throw error;
      
      const wasActive = isActive;
      const newActiveState = data.riskDetected && (data.severity === 'critical' || data.severity === 'high');
      
      setGuardianStatus(data);
      setIsActive(newActiveState);
      setLoading(false);

      if (!wasActive && newActiveState) {
        toast.warning("Guardian Protection Activated!", {
          description: "Your funds are being moved to safety due to detected market risk."
        });
        loadRiskHistory();
      }
    } catch (error) {
      console.error('Error checking guardian status:', error);
      setLoading(false);
    }
  };

  const toggleGuardian = () => {
    setGuardianEnabled(!guardianEnabled);
    toast.success(guardianEnabled ? "Guardian Mode Disabled" : "Guardian Mode Enabled", {
      description: guardianEnabled 
        ? "Risk protection is now turned off" 
        : "AI will now monitor and protect your funds"
    });
  };

  if (loading) return null;

  return (
    <Card className="glass-card border-border p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Shield className={`w-5 h-5 ${isActive ? 'text-warning' : 'text-success'}`} />
          Aether Guardian
        </h3>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Protection</span>
            <Switch checked={guardianEnabled} onCheckedChange={toggleGuardian} />
          </div>
          <div className={`px-3 py-1 rounded-full text-xs font-medium ${
            isActive ? 'bg-warning/20 text-warning' : 'bg-success/20 text-success'
          }`}>
            {isActive ? 'ACTIVE' : 'MONITORING'}
          </div>
        </div>
      </div>

      {isActive ? (
        <div className="bg-warning/10 border border-warning/20 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-warning flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-warning mb-1">Risk Protection Activated</p>
              <p className="text-sm text-muted-foreground mb-2">{guardianStatus?.description}</p>
              <p className="text-xs text-muted-foreground">
                Your funds are being automatically moved to USDC to protect against market volatility.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-success/10 border border-success/20 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-success mb-1">All Systems Normal</p>
              <p className="text-sm text-muted-foreground">
                AI continuously monitoring market conditions for risk events
              </p>
            </div>
          </div>
        </div>
      )}

      {guardianStatus && guardianEnabled && (
        <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
          <div>
            <span className="text-muted-foreground">SOL Price:</span>
            <span className="ml-2 font-medium">${guardianStatus.solPrice?.toFixed(2)}</span>
          </div>
          <div>
            <span className="text-muted-foreground">24h Change:</span>
            <span className={`ml-2 font-medium ${guardianStatus.priceChange24h < 0 ? 'text-destructive' : 'text-success'}`}>
              {guardianStatus.priceChange24h?.toFixed(2)}%
            </span>
          </div>
        </div>
      )}

      {guardianEnabled && (
        <div className="mt-4">
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full"
            onClick={() => setShowHistory(!showHistory)}
          >
            <History className="w-4 h-4 mr-2" />
            {showHistory ? 'Hide' : 'View'} Risk Event History ({riskHistory.length})
          </Button>

          {showHistory && (
            <div className="mt-3 space-y-2 max-h-64 overflow-y-auto">
              {riskHistory.length > 0 ? (
                riskHistory.map((event, idx) => (
                  <div key={idx} className="bg-secondary/30 rounded-lg p-3 text-sm">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium capitalize">{event.event_type}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        event.severity === 'critical' ? 'bg-destructive/20 text-destructive' :
                        event.severity === 'high' ? 'bg-warning/20 text-warning' :
                        'bg-accent/20 text-accent'
                      }`}>
                        {event.severity}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mb-1">{event.description}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <TrendingDown className="w-3 h-3" />
                      {new Date(event.created_at).toLocaleString()}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-sm text-muted-foreground py-4">
                  No risk events detected
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </Card>
  );
};

export default GuardianMode;