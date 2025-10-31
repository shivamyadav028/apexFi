import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Shield, TrendingUp, Zap } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useWallet } from "@solana/wallet-adapter-react";
import { useAuth } from "@/contexts/AuthContext";

const profiles = [
  {
    id: 'conservative',
    name: 'Conservative',
    icon: Shield,
    description: 'Low-risk, stable pools with consistent returns',
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10'
  },
  {
    id: 'balanced',
    name: 'Balanced',
    icon: TrendingUp,
    description: 'Mix of stable and high-yield opportunities',
    color: 'text-accent',
    bgColor: 'bg-accent/10'
  },
  {
    id: 'aggressive',
    name: 'Aggressive',
    icon: Zap,
    description: 'High-risk, high-reward strategies',
    color: 'text-warning',
    bgColor: 'bg-warning/10'
  }
];

const StrategyProfileSelector = () => {
  const { publicKey, connected } = useWallet();
  const { user } = useAuth();
  const [selectedProfile, setSelectedProfile] = useState<string>('balanced');
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (connected && publicKey && user) {
      loadCurrentProfile();
    }
  }, [connected, publicKey, user]);

  const loadCurrentProfile = async () => {
    if (!user) return;
    
    try {
      const { data } = await supabase
        .from('user_vaults')
        .select('strategy_profile')
        .eq('user_id', user.id)
        .maybeSingle();

      if (data?.strategy_profile) {
        setSelectedProfile(data.strategy_profile);
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    }
  };

  const updateProfile = async (profileId: string) => {
    if (!connected || !publicKey || !user) {
      toast.error('Please connect your wallet first');
      return;
    }

    setIsUpdating(true);
    try {
      const walletAddress = publicKey.toString();

      // Get or create vault
      let { data: vault } = await supabase
        .from('user_vaults')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (!vault) {
        const { data: newVault, error: createError } = await supabase
          .from('user_vaults')
          .insert({ 
            user_id: user.id,
            wallet_address: walletAddress,
            strategy_profile: profileId 
          })
          .select()
          .single();
        
        if (createError) throw createError;
        vault = newVault;
      } else {
        const { error: updateError } = await supabase
          .from('user_vaults')
          .update({ strategy_profile: profileId })
          .eq('id', vault.id);
        
        if (updateError) throw updateError;
      }

      setSelectedProfile(profileId);
      toast.success(`Strategy profile updated to ${profiles.find(p => p.id === profileId)?.name}`);
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update strategy profile');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Card className="glass-card border-border p-6">
      <h3 className="text-lg font-semibold mb-4">AI Strategy Profile</h3>
      <p className="text-sm text-muted-foreground mb-6">
        Select your risk appetite. The AI will automatically adjust its strategy to match your profile.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {profiles.map((profile) => {
          const Icon = profile.icon;
          const isSelected = selectedProfile === profile.id;

          return (
            <button
              key={profile.id}
              onClick={() => updateProfile(profile.id)}
              disabled={isUpdating}
              className={`p-4 rounded-xl border-2 transition-all ${
                isSelected
                  ? 'border-accent bg-accent/10'
                  : 'border-border hover:border-accent/50'
              }`}
            >
              <div className={`w-10 h-10 rounded-lg ${profile.bgColor} flex items-center justify-center mb-3`}>
                <Icon className={`w-5 h-5 ${profile.color}`} />
              </div>
              <h4 className="font-semibold mb-1">{profile.name}</h4>
              <p className="text-xs text-muted-foreground">{profile.description}</p>
            </button>
          );
        })}
      </div>

      <div className="mt-4 p-3 bg-secondary/30 rounded-lg">
        <p className="text-xs text-muted-foreground">
          <Shield className="w-3 h-3 inline mr-1" />
          All strategy changes are executed privately via Arcium MPC
        </p>
      </div>
    </Card>
  );
};

export default StrategyProfileSelector;