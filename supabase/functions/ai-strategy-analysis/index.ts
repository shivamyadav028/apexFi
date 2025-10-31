// @ts-nocheck
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { pools, strategyProfile } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    let systemPrompt = `You are an AI DeFi strategist analyzing Raydium liquidity pools on Solana. 
    Analyze the provided pools and recommend the best strategy.`;

    if (strategyProfile === 'conservative') {
      systemPrompt += ` Focus on stable, high-TVL pools with lower risk. Prioritize SOL-USDC and other stablecoin pairs.`;
    } else if (strategyProfile === 'aggressive') {
      systemPrompt += ` Focus on high-APY opportunities, new token launches, and higher-risk pools with potential for outsized returns.`;
    } else {
      systemPrompt += ` Balance risk and reward by mixing stable pools with some higher-APY opportunities.`;
    }

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Analyze these Raydium pools and provide strategy recommendations: ${JSON.stringify(pools.slice(0, 10))}. Return your analysis as a JSON object with: recommendedPools (array of pool names), reasoning (string), expectedApy (number), riskAssessment (string).` }
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI Gateway error:', response.status, errorText);
      throw new Error('AI analysis failed');
    }

    const data = await response.json();
    const analysisText = data.choices[0].message.content;
    
    console.log('AI Analysis:', analysisText);

    // Parse AI response
    type Pool = { name: string; apy?: number };
    let analysis;
    try {
      const jsonMatch = analysisText.match(/\{[\s\S]*\}/);
      analysis = jsonMatch ? JSON.parse(jsonMatch[0]) : {
        recommendedPools: (pools as Pool[]).slice(0, 3).map((p) => p.name),
        reasoning: analysisText,
        expectedApy: (pools as Pool[])[0]?.apy || 18.2,
        riskAssessment: 'Moderate risk with strong upside potential'
      };
    } catch (parseError) {
      analysis = {
        recommendedPools: (pools as Pool[]).slice(0, 3).map((p) => p.name),
        reasoning: analysisText,
        expectedApy: (pools as Pool[])[0]?.apy || 18.2,
        riskAssessment: 'Moderate risk with strong upside potential'
      };
    }

    return new Response(JSON.stringify(analysis), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in ai-strategy-analysis:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});