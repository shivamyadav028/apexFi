import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowUpRight, ArrowDownLeft, Repeat, ExternalLink } from "lucide-react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

interface Transaction {
  id: string;
  type: string;
  description: string;
  amount: string;
  status: string;
  timestamp: string;
  hash: string;
}

const TransactionHistory = () => {
  const { publicKey } = useWallet();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!publicKey) {
      setTransactions([]);
      setLoading(false);
      return;
    }

    const fetchTransactions = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('transactions')
          .select('*')
          .eq('wallet_address', publicKey.toString())
          .order('created_at', { ascending: false })
          .limit(10);

        if (error) throw error;

        const formattedTxs = (data || []).map((tx: Tables<'transactions'>) => ({
          id: tx.id,
          type: tx.type,
          description: tx.to_pool 
            ? `${tx.type === 'deposit' ? 'Deposited to' : tx.type === 'withdraw' ? 'Withdrew from' : 'Rebalanced to'} ${tx.to_pool}`
            : tx.from_pool
            ? `Withdrew from ${tx.from_pool}`
            : `Transaction ${tx.type}`,
          amount: tx.amount ? `$${Number(tx.amount).toFixed(2)}` : '-',
          status: tx.status,
          timestamp: new Date(tx.created_at).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          }),
          hash: tx.signature || tx.id.substring(0, 8)
        }));

        setTransactions(formattedTxs);
      } catch (error) {
        console.error('Error fetching transactions:', error);
        setTransactions([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();

    // Subscribe to real-time updates
    const channel = supabase
      .channel('transactions-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'transactions'
        },
        () => {
          fetchTransactions();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [publicKey]);

  const getIcon = (type: string) => {
    switch (type) {
      case "deposit":
        return <ArrowDownLeft className="w-4 h-4 text-success" />;
      case "withdraw":
        return <ArrowUpRight className="w-4 h-4 text-destructive" />;
      case "rebalance":
        return <Repeat className="w-4 h-4 text-accent" />;
      default:
        return null;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "deposit":
        return <Badge className="bg-success/20 text-success border-success/30">Deposit</Badge>;
      case "withdraw":
        return <Badge className="bg-destructive/20 text-destructive border-destructive/30">Withdraw</Badge>;
      case "rebalance":
        return <Badge className="bg-accent/20 text-accent border-accent/30">Rebalance</Badge>;
      default:
        return null;
    }
  };

  if (!publicKey) {
    return (
      <Card className="glass-card border-border p-6">
        <h2 className="text-2xl font-bold mb-6">Transaction History</h2>
        <p className="text-muted-foreground text-center py-8">Connect your wallet to view transaction history</p>
      </Card>
    );
  }

  return (
    <Card className="glass-card border-border p-6">
      <h2 className="text-2xl font-bold mb-6">Transaction History</h2>
      
      {loading ? (
        <p className="text-muted-foreground text-center py-8">Loading transactions...</p>
      ) : transactions.length === 0 ? (
        <p className="text-muted-foreground text-center py-8">No transactions yet</p>
      ) : (
        <div className="space-y-4">
          {transactions.map((tx) => (
          <div
            key={tx.id}
            className="flex items-center justify-between p-4 bg-secondary/30 rounded-xl border border-border hover:border-primary/50 transition-all duration-300"
          >
            <div className="flex items-center gap-4 flex-1">
              <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center">
                {getIcon(tx.type)}
              </div>
              
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold">{tx.description}</span>
                  {getTypeLabel(tx.type)}
                </div>
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <span>{tx.timestamp}</span>
                  <span>•</span>
                  <button className="flex items-center gap-1 hover:text-primary transition-colors">
                    <span className="font-mono">{tx.hash}</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
            
            <div className="text-right">
              <div className="font-bold text-lg">{tx.amount}</div>
              <Badge className="bg-success/20 text-success border-success/30 text-xs">
                {tx.status}
              </Badge>
            </div>
          </div>
          ))}
        </div>
      )}
    </Card>
  );
};

export default TransactionHistory;
