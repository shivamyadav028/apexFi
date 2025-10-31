-- Enable RLS (safe if already enabled)
alter table public.user_vaults enable row level security;
alter table public.transactions enable row level security;

-- USER_VAULTS policies
drop policy if exists "user_vaults_select_own" on public.user_vaults;
create policy "user_vaults_select_own" on public.user_vaults
  for select using (auth.uid() = user_id);

drop policy if exists "user_vaults_insert_own" on public.user_vaults;
create policy "user_vaults_insert_own" on public.user_vaults
  for insert with check (auth.uid() = user_id);

drop policy if exists "user_vaults_update_own" on public.user_vaults;
create policy "user_vaults_update_own" on public.user_vaults
  for update using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- TRANSACTIONS policies
drop policy if exists "transactions_select_own" on public.transactions;
create policy "transactions_select_own" on public.transactions
  for select using (auth.uid() = user_id);

drop policy if exists "transactions_insert_own" on public.transactions;
create policy "transactions_insert_own" on public.transactions
  for insert with check (auth.uid() = user_id);

drop policy if exists "transactions_update_own" on public.transactions;
create policy "transactions_update_own" on public.transactions
  for update using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Optional: allow deleting own transactions (usually not needed)
-- drop policy if exists "transactions_delete_own" on public.transactions;
-- create policy "transactions_delete_own" on public.transactions
--   for delete using (auth.uid() = user_id);

-- Note: If you also write to other tables from the client, add matching policies.

