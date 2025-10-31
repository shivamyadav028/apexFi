import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useWallet } from '@solana/wallet-adapter-react';
import { toast } from 'sonner';
import bs58 from 'bs58';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signInWithWallet: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const { publicKey, signMessage, connected } = useWallet();

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signInWithWallet = async () => {
    if (!publicKey || !signMessage) {
      toast.error('Please connect your wallet first');
      return;
    }

    try {
      setLoading(true);
      const walletAddress = publicKey.toString();
      
      // Generate a nonce for the user to sign
      const nonce = crypto.randomUUID();
      const message = new TextEncoder().encode(
        `Sign this message to authenticate with ApexFi:\n\nNonce: ${nonce}\nWallet: ${walletAddress}`
      );

      // Request signature from wallet
      const signature = await signMessage(message);
      const signatureBase58 = bs58.encode(signature);

      // Hash the signature to ensure it's under 72 characters for bcrypt
      const msgUint8 = new Uint8Array(
        signatureBase58.split('').map(char => char.charCodeAt(0))
      );
      const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const password = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

      // Use wallet address as email
      const email = `${walletAddress}@apexfi.wallet`;

      // Try to sign in first
      const signInResult = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      let { data } = signInResult;
      const { error } = signInResult;

      // If user doesn't exist, sign up
      if (error && error.message.includes('Invalid login credentials')) {
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              wallet_address: walletAddress,
            },
          },
        });

        if (signUpError) throw signUpError;
        data = signUpData;
        
        toast.success('Account created successfully!');
      } else if (error) {
        throw error;
      } else {
        toast.success('Signed in successfully!');
      }

      setSession(data.session);
      setUser(data.user);
    } catch (error) {
      console.error('Authentication error:', error);
      toast.error('Failed to authenticate. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setSession(null);
    setUser(null);
    toast.success('Signed out successfully');
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, signInWithWallet, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
