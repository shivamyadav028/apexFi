-- Clear existing test data (no authentication means this data is insecure anyway)
DELETE FROM active_positions;
DELETE FROM transactions;
DELETE FROM user_vaults;

-- Drop existing insecure RLS policies
DROP POLICY IF EXISTS "Anyone can view vaults" ON user_vaults;
DROP POLICY IF EXISTS "Anyone can insert vaults" ON user_vaults;
DROP POLICY IF EXISTS "Anyone can update vaults" ON user_vaults;

DROP POLICY IF EXISTS "Anyone can view positions" ON active_positions;
DROP POLICY IF EXISTS "Anyone can insert positions" ON active_positions;
DROP POLICY IF EXISTS "Anyone can update positions" ON active_positions;
DROP POLICY IF EXISTS "Anyone can delete positions" ON active_positions;

DROP POLICY IF EXISTS "Anyone can view transactions" ON transactions;
DROP POLICY IF EXISTS "Anyone can insert transactions" ON transactions;

-- Make user_id non-nullable and set up proper constraints
ALTER TABLE user_vaults 
  ALTER COLUMN user_id SET NOT NULL,
  ADD CONSTRAINT balance_positive CHECK (balance >= 0),
  ADD CONSTRAINT balance_reasonable CHECK (balance <= 1000000000);

ALTER TABLE active_positions
  ALTER COLUMN user_id SET NOT NULL;

ALTER TABLE transactions
  ALTER COLUMN user_id SET NOT NULL;

-- Create secure RLS policies for user_vaults
CREATE POLICY "Users can view own vault"
  ON user_vaults FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own vault"
  ON user_vaults FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own vault"
  ON user_vaults FOR UPDATE
  USING (auth.uid() = user_id);

-- Create secure RLS policies for active_positions
CREATE POLICY "Users can view own positions"
  ON active_positions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own positions"
  ON active_positions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own positions"
  ON active_positions FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own positions"
  ON active_positions FOR DELETE
  USING (auth.uid() = user_id);

-- Create secure RLS policies for transactions
CREATE POLICY "Users can view own transactions"
  ON transactions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own transactions"
  ON transactions FOR INSERT
  WITH CHECK (auth.uid() = user_id);