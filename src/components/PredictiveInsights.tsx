import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Brain, TrendingUp, Clock, Filter, BarChart3, Target } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

interface Prediction {
  id: string | number;
  pool_id: string;
  actual_result: boolean | null;
  prediction_time: string | number | Date;
  confidence_score: number;
  created_at: string | number | Date;
  predicted_volume_spike?: boolean;
}

const PredictiveInsights = () => {
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [totalAlpha, setTotalAlpha] = useState(0);
  const [filter, setFilter] = useState<'all' | 'success' | 'miss'>('all');
  const [selectedPrediction, setSelectedPrediction] = useState<Prediction | null>(null);
  const [showStats, setShowStats] = useState(false);

  useEffect(() => {
    loadPredictions();
  }, []);

  const loadPredictions = async () => {
    try {
      const { data } = await supabase
        .from('ai_predictions')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);

      if (data) {
        setPredictions(data);
        const successfulPredictions = data.filter(p => p.actual_result === true);
        setTotalAlpha(successfulPredictions.length * 127.50);
      }
    } catch (error) {
      console.error('Error loading predictions:', error);
    }
  };

  const filteredPredictions = predictions.filter(p => {
    if (filter === 'all') return true;
    if (filter === 'success') return p.actual_result === true;
    if (filter === 'miss') return p.actual_result === false;
    return true;
  });

  const accuracyRate = predictions.length > 0 
    ? ((predictions.filter(p => p.actual_result === true).length / predictions.filter(p => p.actual_result !== null).length) * 100) || 0
    : 0;

  const avgConfidence = predictions.length > 0
    ? predictions.reduce((acc, p) => acc + (p.confidence_score || 0), 0) / predictions.length
    : 0;

  return (
    <Card className="glass-card border-border p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Brain className="w-5 h-5 text-accent" />
          Predictive Fee Capture
        </h3>
        <div className="bg-success/20 text-success px-3 py-1 rounded-full text-xs font-medium">
          ACTIVE
        </div>
      </div>

      <div className="bg-gradient-secondary rounded-xl p-4 mb-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-sm text-muted-foreground mb-1">Total Alpha Generated</div>
            <div className="text-2xl font-bold text-accent">+${totalAlpha.toFixed(2)}</div>
            <div className="text-xs text-muted-foreground mt-1">
              {predictions.filter(p => p.actual_result).length} successful predictions
            </div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground mb-1">Accuracy Rate</div>
            <div className="text-2xl font-bold text-success">{accuracyRate.toFixed(1)}%</div>
            <Progress value={accuracyRate} className="mt-2 h-2" />
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 mb-4">
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => setShowStats(!showStats)}
        >
          <BarChart3 className="w-4 h-4 mr-2" />
          {showStats ? 'Hide' : 'Show'} Analytics
        </Button>
        <div className="flex gap-1 ml-auto">
          <Badge 
            variant={filter === 'all' ? 'default' : 'outline'} 
            className="cursor-pointer"
            onClick={() => setFilter('all')}
          >
            All
          </Badge>
          <Badge 
            variant={filter === 'success' ? 'default' : 'outline'} 
            className="cursor-pointer"
            onClick={() => setFilter('success')}
          >
            Success
          </Badge>
          <Badge 
            variant={filter === 'miss' ? 'default' : 'outline'} 
            className="cursor-pointer"
            onClick={() => setFilter('miss')}
          >
            Miss
          </Badge>
        </div>
      </div>

      {showStats && (
        <div className="mb-4 grid grid-cols-3 gap-3 p-4 bg-secondary/20 rounded-lg">
          <div className="text-center">
            <div className="text-xs text-muted-foreground">Avg Confidence</div>
            <div className="text-lg font-bold text-accent">{avgConfidence.toFixed(1)}%</div>
          </div>
          <div className="text-center">
            <div className="text-xs text-muted-foreground">Total Predictions</div>
            <div className="text-lg font-bold">{predictions.length}</div>
          </div>
          <div className="text-center">
            <div className="text-xs text-muted-foreground">Active Monitoring</div>
            <div className="text-lg font-bold text-success">Live</div>
          </div>
        </div>
      )}

      <div className="space-y-3">
        <div className="text-sm font-semibold mb-2">
          Recent Predictions ({filteredPredictions.length})
        </div>
        {filteredPredictions.length > 0 ? (
          filteredPredictions.slice(0, 5).map((prediction, index) => (
            <div 
              key={index} 
              className="bg-secondary/30 rounded-lg p-3 cursor-pointer hover:bg-secondary/50 transition-colors"
              onClick={() => setSelectedPrediction(selectedPrediction?.id === prediction.id ? null : prediction)}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium flex items-center gap-2">
                  <Target className="w-3 h-3" />
                  {prediction.pool_id.substring(0, 8)}...
                </span>
                {prediction.actual_result !== null && (
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    prediction.actual_result ? 'bg-success/20 text-success' : 'bg-destructive/20 text-destructive'
                  }`}>
                    {prediction.actual_result ? 'Success' : 'Miss'}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                <Clock className="w-3 h-3" />
                {new Date(prediction.prediction_time).toLocaleString()}
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Confidence:</span>
                <div className="flex items-center gap-2">
                  <Progress value={prediction.confidence_score} className="w-20 h-1.5" />
                  <span className="font-medium">{prediction.confidence_score}%</span>
                </div>
              </div>
              
              {selectedPrediction?.id === prediction.id && (
                <div className="mt-3 pt-3 border-t border-border space-y-2">
                  <div className="text-xs">
                    <span className="text-muted-foreground">Pool ID:</span>
                    <span className="ml-2 font-mono">{prediction.pool_id}</span>
                  </div>
                  <div className="text-xs">
                    <span className="text-muted-foreground">Predicted:</span>
                    <span className="ml-2">{prediction.predicted_volume_spike ? 'Volume Spike' : 'Normal Activity'}</span>
                  </div>
                  <div className="text-xs">
                    <span className="text-muted-foreground">Created:</span>
                    <span className="ml-2">{new Date(prediction.created_at).toLocaleString()}</span>
                  </div>
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="text-sm text-muted-foreground text-center py-4">
            {filter !== 'all' ? `No ${filter} predictions found` : 'AI is analyzing historical data to generate predictions...'}
          </div>
        )}
      </div>

      <div className="mt-4 p-3 bg-accent/10 border border-accent/20 rounded-lg">
        <div className="flex items-start gap-2">
          <TrendingUp className="w-4 h-4 text-accent flex-shrink-0 mt-0.5" />
          <p className="text-xs text-muted-foreground">
            AI analyzes trading patterns to predict volume spikes before they happen, capturing outsized fees
          </p>
        </div>
      </div>
    </Card>
  );
};

export default PredictiveInsights;