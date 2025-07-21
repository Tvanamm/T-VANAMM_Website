
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
  status: 'created' | 'attempted' | 'paid' | 'failed' | 'completed' | 'pending';
  payment_method?: string;
  created_at: string;
  updated_at: string;
}

interface UsePaymentTransactionsReturn {
  transactions: PaymentTransaction[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  isOrderPaid: (orderIdToCheck: string) => boolean;
  hasExistingTransaction: (orderIdToCheck: string) => boolean;
  getPaymentStatus: (orderIdToCheck: string) => string;
  paymentStatusCache: Record<string, string>;
}

export const usePaymentTransactions = (orderId?: string): UsePaymentTransactionsReturn => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [transactions, setTransactions] = useState<PaymentTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [paymentStatusCache, setPaymentStatusCache] = useState<Record<string, string>>({});

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
      const formattedTransactions = (data || []).map(transaction => ({
        ...transaction,
        status: transaction.status as 'created' | 'attempted' | 'paid' | 'failed' | 'completed' | 'pending'
      }));
      
      setTransactions(formattedTransactions);
      
      // Update payment status cache
      const newCache: Record<string, string> = {};
      formattedTransactions.forEach(t => {
        newCache[t.order_id] = t.status;
      });
      setPaymentStatusCache(newCache);
      
      setError(null);
    } catch (error) {
      console.error('Error fetching payment transactions:', error);
      setError('Failed to load payment transactions');
    } finally {
      setLoading(false);
    }
  };

  // Check if an order has a completed payment
  const isOrderPaid = (orderIdToCheck: string): boolean => {
    return transactions.some(t => t.order_id === orderIdToCheck && t.status === 'completed');
  };

  // Prevent duplicate payment transactions
  const hasExistingTransaction = (orderIdToCheck: string): boolean => {
    return transactions.some(t => t.order_id === orderIdToCheck && 
      ['created', 'attempted', 'paid', 'completed'].includes(t.status));
  };

  // Get payment status for an order
  const getPaymentStatus = (orderIdToCheck: string): string => {
    const orderTransactions = transactions.filter(t => t.order_id === orderIdToCheck);
    if (orderTransactions.length === 0) return 'pending';
    
    // Return the latest transaction status
    const latestTransaction = orderTransactions.sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )[0];
    
    return latestTransaction.status;
  };

  useEffect(() => {
    fetchTransactions();

    // Set up real-time subscription for payment transactions with user filter
    const channel = supabase
      .channel('payment_transactions_realtime')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'payment_transactions'
      }, (payload) => {
        console.log('Real-time payment transaction update:', payload);
        
        // Only process updates for current user's orders
        if (orderId && payload.new && 'order_id' in payload.new && payload.new.order_id === orderId) {
          if (payload.eventType === 'UPDATE' && payload.new && 'status' in payload.new && payload.new.status === 'completed') {
            toast({
              title: "Payment Confirmed!",
              description: "Your order has been confirmed and will be processed soon.",
            });
          }
          
          // Fetch transactions to get updated data
          setTimeout(() => fetchTransactions(), 1000);
        } else if (!orderId) {
          // If no specific order, refetch all transactions
          setTimeout(() => fetchTransactions(), 1000);
        }
      })
      .subscribe();

    // Subscribe to franchise orders for status updates
    const ordersChannel = supabase
      .channel('franchise_orders_realtime')
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'franchise_orders'
      }, (payload) => {
        console.log('Real-time order update:', payload);
        
        // Only process updates for current user's orders
        if (orderId && payload.new && 'id' in payload.new && payload.new.id === orderId) {
          if (payload.new && 'status' in payload.new && payload.new.status === 'confirmed') {
            toast({
              title: "Order Confirmed!",
              description: "Your payment has been processed and order confirmed.",
            });
          }
          
          // Update cache and refetch
          setTimeout(() => fetchTransactions(), 1000);
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
      supabase.removeChannel(ordersChannel);
    };
  }, [user?.id, orderId]);

  return {
    transactions,
    loading,
    error,
    refetch: fetchTransactions,
    isOrderPaid,
    hasExistingTransaction,
    getPaymentStatus,
    paymentStatusCache
  };
};
