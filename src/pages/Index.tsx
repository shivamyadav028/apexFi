import WalletConnect from "@/components/WalletConnect";
import Dashboard from "@/components/Dashboard";
import { useWallet } from "@solana/wallet-adapter-react";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import Onboarding from "@/components/Onboarding";
import { supabase } from "@/integrations/supabase/client";

const Index = () => {
  const { publicKey, disconnect } = useWallet();
  const { user, signInWithWallet, loading } = useAuth();
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    // Auto-authenticate when wallet connects
    if (publicKey && !user && !loading) {
      signInWithWallet();
    }
  }, [publicKey, user, loading]);

  useEffect(() => {
    const checkFirstTime = async () => {
      // Respect local onboarding flag first
      if (localStorage.getItem('aether_onboarded') === '1') {
        setShowOnboarding(false);
        return;
      }
      if (!user) return;
      const { data } = await supabase
        .from('user_vaults')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();
      if (!data) setShowOnboarding(true);
    };
    void checkFirstTime();
  }, [user]);

  if (!publicKey) {
    return <WalletConnect />;
  }

  if (loading || (publicKey && !user)) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-accent" />
          <p className="text-muted-foreground">Authenticating...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Dashboard walletAddress={publicKey.toBase58()} onDisconnect={disconnect} />
      <Onboarding open={showOnboarding} onClose={() => setShowOnboarding(false)} />
    </>
  );
};

export default Index;
