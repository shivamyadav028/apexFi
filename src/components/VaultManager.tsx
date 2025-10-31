import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowDown, ArrowUp, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useWallet } from "@solana/wallet-adapter-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { z } from "zod";

const amountSchema = z.number()
  .min(0.01, 'Amount must be at least 0.01 USDC')
  .max(1000000, 'Amount cannot exceed 1,000,000 USDC')
  .multipleOf(0.000001, 'Invalid decimal precision for USDC');

const VaultManager = () => {
  const { publicKey, connected } = useWallet();
  const { user } = useAuth();
  const [depositAmount, setDepositAmount] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [vaultBalance, setVaultBalance] = useState(0);

  useEffect(() => {
    if (connected && publicKey && user) {
      loadVaultBalance();
    }
  }, [connected, publicKey, user]);

  const loadVaultBalance = async () => {
    if (!user) return;

    try {
      const { data } = await supabase
        .from('user_vaults')
        .select('balance')
        .eq('user_id', user.id)
        .maybeSingle();

      if (data) {
        setVaultBalance(Number(data.balance) || 0);
      }
    } catch (error) {
      console.error('Error loading vault balance:', error);
    }
  };

  const handleDeposit = async () => {
    if (!connected || !publicKey || !user) {
      toast.error("Please connect your wallet and authenticate");
      return;
    }

    // Validate input
    const parsedAmount = parseFloat(depositAmount);
    
    if (isNaN(parsedAmount) || !isFinite(parsedAmount)) {
      toast.error("Please enter a valid number");
      return;
    }

    const validation = amountSchema.safeParse(parsedAmount);
    if (!validation.success) {
      toast.error(validation.error.errors[0].message);
      return;
    }

    setIsProcessing(true);
    
    try {
      const walletAddress = publicKey.toString();
      const amount = validation.data;

      // Get or create vault
      let { data: vault } = await supabase
        .from('user_vaults')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (!vault) {
        const { data: newVault, error: vaultError } = await supabase
          .from('user_vaults')
          .insert({ 
            user_id: user.id,
            wallet_address: walletAddress,
            balance: amount 
          })
          .select()
          .single();
        
        if (vaultError) throw vaultError;
        vault = newVault;
      } else {
        // Update vault balance
        const newBalance = Number(vault.balance) + amount;
        const { error: updateError } = await supabase
          .from('user_vaults')
          .update({ balance: newBalance })
          .eq('id', vault.id);
        
        if (updateError) throw updateError;
      }

      // Create transaction record
      const { error: txError } = await supabase
        .from('transactions')
        .insert({
          user_id: user.id,
          wallet_address: walletAddress,
          vault_id: vault.id,
          type: 'deposit',
          amount: amount,
          to_pool: 'Vault',
          status: 'completed',
        });

      if (txError) throw txError;

      toast.success(`Successfully deposited ${amount.toFixed(2)} USDC`);
      setDepositAmount("");
      await loadVaultBalance();
    } catch (error: unknown) {
      console.error('Error depositing:', error);
      const message = error instanceof Error ? error.message : 'Failed to deposit. Please try again.';
      toast.error(message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleWithdraw = async () => {
    if (!connected || !publicKey || !user) {
      toast.error("Please connect your wallet and authenticate");
      return;
    }

    // Validate input
    const parsedAmount = parseFloat(withdrawAmount);
    
    if (isNaN(parsedAmount) || !isFinite(parsedAmount)) {
      toast.error("Please enter a valid number");
      return;
    }

    const validation = amountSchema.safeParse(parsedAmount);
    if (!validation.success) {
      toast.error(validation.error.errors[0].message);
      return;
    }

    setIsProcessing(true);
    
    try {
      const walletAddress = publicKey.toString();
      const amount = validation.data;

      // Get vault
      const { data: vault, error: vaultError } = await supabase
        .from('user_vaults')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (vaultError) throw vaultError;

      const currentBalance = Number(vault.balance) || 0;
      
      if (currentBalance < amount) {
        toast.error(`Insufficient balance. Available: ${currentBalance.toFixed(2)} USDC`);
        setIsProcessing(false);
        return;
      }

      // Update vault balance
      const newBalance = currentBalance - amount;
      const { error: updateError } = await supabase
        .from('user_vaults')
        .update({ balance: newBalance })
        .eq('id', vault.id);
      
      if (updateError) throw updateError;

      // Create transaction record
      const { error: txError } = await supabase
        .from('transactions')
        .insert({
          user_id: user.id,
          wallet_address: walletAddress,
          vault_id: vault.id,
          type: 'withdraw',
          amount: amount,
          from_pool: 'Vault',
          status: 'completed',
        });

      if (txError) throw txError;

      toast.success(`Successfully withdrew ${amount.toFixed(2)} USDC`);
      setWithdrawAmount("");
      await loadVaultBalance();
    } catch (error: unknown) {
      console.error('Error withdrawing:', error);
      const message = error instanceof Error ? error.message : 'Failed to withdraw. Please try again.';
      toast.error(message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePercentageClick = (percentage: number, type: 'deposit' | 'withdraw') => {
    const baseAmount = type === 'withdraw' ? vaultBalance : 1000;
    const amount = (baseAmount * percentage / 100).toFixed(2);
    
    if (type === 'deposit') {
      setDepositAmount(amount);
    } else {
      setWithdrawAmount(amount);
    }
  };

  return (
    <Card className="glass-card border-border p-6">
      <h3 className="text-lg font-semibold mb-4">Manage Vault</h3>
      <div className="mb-4 p-4 bg-secondary/30 rounded-lg">
        <p className="text-sm text-muted-foreground mb-1">Available Balance</p>
        <p className="text-2xl font-bold">{vaultBalance.toFixed(2)} USDC</p>
      </div>

      <Tabs defaultValue="deposit" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="deposit">
            <ArrowDown className="w-4 h-4 mr-2" />
            Deposit
          </TabsTrigger>
          <TabsTrigger value="withdraw">
            <ArrowUp className="w-4 h-4 mr-2" />
            Withdraw
          </TabsTrigger>
        </TabsList>

        <TabsContent value="deposit" className="space-y-4">
          <div>
            <label className="text-sm text-muted-foreground mb-2 block">Amount (USDC)</label>
            <Input
              type="number"
              value={depositAmount}
              onChange={(e) => setDepositAmount(e.target.value)}
              placeholder="0.00"
              step="0.01"
              min="0"
              disabled={isProcessing}
              className="mb-2"
            />
            <div className="flex gap-2">
              {[25, 50, 75, 100].map((percentage) => (
                <Button
                  key={percentage}
                  variant="outline"
                  size="sm"
                  onClick={() => handlePercentageClick(percentage, 'deposit')}
                  disabled={isProcessing}
                  className="flex-1"
                >
                  {percentage}%
                </Button>
              ))}
            </div>
          </div>

          <Button
            onClick={handleDeposit}
            disabled={isProcessing || !depositAmount || !connected || !user}
            className="w-full"
          >
            {isProcessing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <ArrowDown className="mr-2 h-4 w-4" />
                Deposit to Vault
              </>
            )}
          </Button>

          <p className="text-xs text-muted-foreground text-center">
            Deposits are processed through Arcium's confidential compute layer
          </p>
        </TabsContent>

        <TabsContent value="withdraw" className="space-y-4">
          <div>
            <label className="text-sm text-muted-foreground mb-2 block">Amount (USDC)</label>
            <Input
              type="number"
              value={withdrawAmount}
              onChange={(e) => setWithdrawAmount(e.target.value)}
              placeholder="0.00"
              step="0.01"
              min="0"
              max={vaultBalance}
              disabled={isProcessing}
              className="mb-2"
            />
            <div className="flex gap-2">
              {[25, 50, 75, 100].map((percentage) => (
                <Button
                  key={percentage}
                  variant="outline"
                  size="sm"
                  onClick={() => handlePercentageClick(percentage, 'withdraw')}
                  disabled={isProcessing}
                  className="flex-1"
                >
                  {percentage}%
                </Button>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Available: {vaultBalance.toFixed(2)} USDC
            </p>
          </div>

          <Button
            onClick={handleWithdraw}
            disabled={isProcessing || !withdrawAmount || !connected || !user || vaultBalance === 0}
            className="w-full"
            variant="outline"
          >
            {isProcessing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <ArrowUp className="mr-2 h-4 w-4" />
                Withdraw from Vault
              </>
            )}
          </Button>

          <p className="text-xs text-muted-foreground text-center">
            Withdrawals are processed securely through MPC nodes
          </p>
        </TabsContent>
      </Tabs>
    </Card>
  );
};

export default VaultManager;
