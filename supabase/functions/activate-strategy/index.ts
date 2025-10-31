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
    // Verify authentication
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: {
        headers: { Authorization: authHeader },
      },
    });

    // Verify user authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Invalid authentication token' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { strategy, walletAddress } = await req.json();
    
    if (!walletAddress) {
      return new Response(JSON.stringify({ error: 'Wallet address is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Verify wallet ownership
    if (user.user_metadata?.wallet_address !== walletAddress) {
      return new Response(JSON.stringify({ error: 'Wallet address mismatch' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    console.log(`Activating strategy for user ${user.id}, wallet ${walletAddress}:`, strategy);

    // Get or create user vault
    let { data: vault } = await supabase
      .from('user_vaults')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (!vault) {
      const { data: newVault, error: vaultError } = await supabase
        .from('user_vaults')
        .insert({ 
          user_id: user.id,
          wallet_address: walletAddress 
        })
        .select()
        .single();
      
      if (vaultError) throw vaultError;
      vault = newVault;
    }

    // Create active position
    const { error: positionError } = await supabase
      .from('active_positions')
      .insert({
        user_id: user.id,
        wallet_address: walletAddress,
        vault_id: vault.id,
        pool_id: strategy.poolId,
        pool_name: strategy.name,
        amount: 0,
        current_apy: strategy.apy
      });

    if (positionError) throw positionError;

    // Create transaction record
    const { error: txError } = await supabase
      .from('transactions')
      .insert({
        user_id: user.id,
        wallet_address: walletAddress,
        vault_id: vault.id,
        type: 'strategy_activation',
        to_pool: strategy.name,
        status: 'completed'
      });

    if (txError) throw txError;

    console.log('Strategy activated successfully');

    return new Response(JSON.stringify({ 
      success: true,
      message: 'Strategy activated successfully',
      vaultId: vault.id
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in activate-strategy:', error);
    
    // Return user-friendly error messages
    let errorMessage = 'An error occurred while activating the strategy';
    
    if (error instanceof Error) {
      if (error.message.includes('not found')) {
        errorMessage = 'Resource not found';
      } else if (error.message.includes('constraint')) {
        errorMessage = 'Invalid request data';
      }
    }
    
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});