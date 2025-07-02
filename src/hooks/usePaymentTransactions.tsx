
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface PaymentTransaction {
  id: string;
  order_id: string;
  razorpay_order_id: string;
  razorpay_payment_id?: string;
  razorpay_signature?: string;
  amount: number;
  currency: string;
  status: 'created' | 'attempted' | 'paid' | 'failed';
  payment_method?: string;
  created_at: string;
  updated_at: string;
}

export const usePaymentTransactions = (orderId?: string) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [transactions, setTransactions] = useState<PaymentTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTransactions = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      
      let query = supabase
        .from('payment_transactions')
        .select(`
          *,
          franchise_orders!inner(
            franchise_member_id,
            franchise_members!inner(user_id)
          )
        `)
        .eq('franchise_orders.franchise_members.user_id', user.id)
        .order('created_at', { ascending: false });

      if (orderId) {
        query = query.eq('order_id', orderId);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching payment transactions:', error);
        setError(error.message);
        return;
      }

      console.log('Fetched payment transactions:', data);
      setTransactions(data || []);
      setError(null);
    } catch (error) {
      console.error('Error fetching payment transactions:', error);
      setError('Failed to load payment transactions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();

    // Set up real-time subscription for payment transactions
    const channel = supabase
      .channel('payment_transactions_realtime')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'payment_transactions'
      }, (payload) => {
        console.log('Real-time payment transaction update:', payload);
        
        if (payload.eventType === 'UPDATE' && payload.new.status === 'paid') {
          toast({
            title: "Payment Confirmed!",
            description: "Your order has been confirmed and will be processed soon.",
          });
        }
        
        fetchTransactions();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, orderId]);

  return {
    transactions,
    loading,
    error,
    refetch: fetchTransactions
  };
};
