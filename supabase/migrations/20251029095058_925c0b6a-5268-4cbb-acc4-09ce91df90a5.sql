-- Add wallet_address column to user_vaults table
ALTER TABLE user_vaults ADD COLUMN IF NOT EXISTS wallet_address TEXT;

-- Make user_id nullable since we'll use wallet_address instead
ALTER TABLE user_vaults ALTER COLUMN user_id DROP NOT NULL;

-- Create index on wallet_address for better query performance
CREATE INDEX IF NOT EXISTS idx_user_vaults_wallet_address ON user_vaults(wallet_address);

-- Update RLS policies to work with wallet_address
DROP POLICY IF EXISTS "Users can view their own vault" ON user_vaults;
DROP POLICY IF EXISTS "Users can insert their own vault" ON user_vaults;
DROP POLICY IF EXISTS "Users can update their own vault" ON user_vaults;

-- For now, make vaults accessible (we'll add proper wallet-based RLS later)
CREATE POLICY "Anyone can view vaults" ON user_vaults FOR SELECT USING (true);
CREATE POLICY "Anyone can insert vaults" ON user_vaults FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update vaults" ON user_vaults FOR UPDATE USING (true);

-- Similar updates for transactions table
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS wallet_address TEXT;
ALTER TABLE transactions ALTER COLUMN user_id DROP NOT NULL;
CREATE INDEX IF NOT EXISTS idx_transactions_wallet_address ON transactions(wallet_address);

-- Update transactions RLS policies
DROP POLICY IF EXISTS "Users can view their own transactions" ON transactions;
DROP POLICY IF EXISTS "Users can insert their own transactions" ON transactions;

CREATE POLICY "Anyone can view transactions" ON transactions FOR SELECT USING (true);
CREATE POLICY "Anyone can insert transactions" ON transactions FOR INSERT WITH CHECK (true);

-- Similar updates for active_positions table
ALTER TABLE active_positions ADD COLUMN IF NOT EXISTS wallet_address TEXT;
ALTER TABLE active_positions ALTER COLUMN user_id DROP NOT NULL;
CREATE INDEX IF NOT EXISTS idx_active_positions_wallet_address ON active_positions(wallet_address);

-- Update active_positions RLS policies
DROP POLICY IF EXISTS "Users can view their own positions" ON active_positions;
DROP POLICY IF EXISTS "Users can insert their own positions" ON active_positions;
DROP POLICY IF EXISTS "Users can update their own positions" ON active_positions;
DROP POLICY IF EXISTS "Users can delete their own positions" ON active_positions;

CREATE POLICY "Anyone can view positions" ON active_positions FOR SELECT USING (true);
CREATE POLICY "Anyone can insert positions" ON active_positions FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update positions" ON active_positions FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete positions" ON active_positions FOR DELETE USING (true);