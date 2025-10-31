// @ts-nocheck
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch SOL price from CoinGecko
    const priceResponse = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd&include_24hr_change=true');
    const priceData = await priceResponse.json();
    
    const solPrice = priceData.solana.usd;
    const priceChange24h = priceData.solana.usd_24h_change;

    console.log(`SOL Price: $${solPrice}, 24h Change: ${priceChange24h}%`);

    let riskDetected = false;
    let eventType = null;
    let severity = 'low';
    let description = '';

    // Check for high-risk conditions
    if (priceChange24h < -15) {
      riskDetected = true;
      eventType = 'price_drop';
      severity = 'critical';
      description = `SOL price dropped ${Math.abs(priceChange24h).toFixed(2)}% in 24 hours`;
    } else if (priceChange24h < -10) {
      riskDetected = true;
      eventType = 'volatility_spike';
      severity = 'high';
      description = `High volatility detected: ${Math.abs(priceChange24h).toFixed(2)}% price drop`;
    }

    if (riskDetected) {
      // Log risk event
      await supabase.from('risk_events').insert({
        event_type: eventType,
        severity,
        description,
        triggered_guardian: severity === 'critical' || severity === 'high'
      });

      console.log(`Risk event detected: ${eventType} - ${severity}`);
    }

    return new Response(JSON.stringify({ 
      riskDetected,
      eventType,
      severity,
      description,
      solPrice,
      priceChange24h
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in ai-guardian function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});