-- Create user vaults table
CREATE TABLE IF NOT EXISTS public.user_vaults (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  balance DECIMAL(20, 6) NOT NULL DEFAULT 0,
  strategy_profile TEXT NOT NULL DEFAULT 'balanced' CHECK (strategy_profile IN ('conservative', 'balanced', 'aggressive')),
  guardian_mode_active BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.user_vaults ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own vault"
ON public.user_vaults FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own vault"
ON public.user_vaults FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own vault"
ON public.user_vaults FOR UPDATE
USING (auth.uid() = user_id);

-- Create active positions table (tracks current Raydium pool positions)
CREATE TABLE IF NOT EXISTS public.active_positions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  vault_id UUID NOT NULL REFERENCES public.user_vaults(id) ON DELETE CASCADE,
  pool_id TEXT NOT NULL,
  pool_name TEXT NOT NULL,
  amount DECIMAL(20, 6) NOT NULL,
  entry_price DECIMAL(20, 6),
  current_apy DECIMAL(8, 2),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.active_positions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own positions"
ON public.active_positions FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own positions"
ON public.active_positions FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own positions"
ON public.active_positions FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own positions"
ON public.active_positions FOR DELETE
USING (auth.uid() = user_id);

-- Create transactions table
CREATE TABLE IF NOT EXISTS public.transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  vault_id UUID NOT NULL REFERENCES public.user_vaults(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('deposit', 'withdraw', 'rebalance', 'swap', 'guardian_exit', 'strategy_activation')),
  amount DECIMAL(20, 6),
  from_pool TEXT,
  to_pool TEXT,
  signature TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own transactions"
ON public.transactions FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own transactions"
ON public.transactions FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Create AI predictions table (for predictive fee capture)
CREATE TABLE IF NOT EXISTS public.ai_predictions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  pool_id TEXT NOT NULL,
  predicted_volume_spike BOOLEAN NOT NULL DEFAULT false,
  prediction_time TIMESTAMP WITH TIME ZONE NOT NULL,
  confidence_score DECIMAL(5, 2),
  actual_result BOOLEAN,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.ai_predictions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view AI predictions"
ON public.ai_predictions FOR SELECT
USING (true);

-- Create risk events table (for Guardian feature)
CREATE TABLE IF NOT EXISTS public.risk_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_type TEXT NOT NULL CHECK (event_type IN ('price_drop', 'exploit', 'network_distress', 'volatility_spike')),
  severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  description TEXT,
  triggered_guardian BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.risk_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view risk events"
ON public.risk_events FOR SELECT
USING (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_user_vaults_updated_at
BEFORE UPDATE ON public.user_vaults
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_active_positions_updated_at
BEFORE UPDATE ON public.active_positions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();