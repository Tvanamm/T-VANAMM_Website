
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRealFranchiseProfile } from './useRealFranchiseProfile';
import { supabase } from '@/integrations/supabase/client';

interface PendingOrder {
  id: string;
  total_amount: number;
  delivery_fee_override?: number;
  franchise_name: string;
  created_at: string;
  status: string;
}

export const usePendingOrders = () => {
  const { user } = useAuth();
  const { franchiseProfile } = useRealFranchiseProfile();
  const [pendingOrders, setPendingOrders] = useState<PendingOrder[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPendingOrders = async () => {
    if (!user || !franchiseProfile?.id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      
      // Fetch confirmed orders that require payment
      const { data, error } = await supabase
        .from('franchise_orders')
        .select('*')
        .eq('franchise_member_id', franchiseProfile.id)
        .eq('status', 'confirmed')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching pending orders:', error);
        return;
      }

      console.log('Fetched pending payment orders:', data);
      setPendingOrders(data || []);
    } catch (error) {
      console.error('Error in fetchPendingOrders:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingOrders();

    // Set up real-time subscription for order updates
    const channel = supabase
      .channel('pending_orders_realtime')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'franchise_orders',
        filter: `franchise_member_id=eq.${franchiseProfile?.id}`
      }, (payload) => {
        console.log('Order update received:', payload);
        fetchPendingOrders();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, franchiseProfile?.id]);

  // Check if there's a confirmed order blocking new orders
  const hasPendingPayment = pendingOrders.some(order => order.status === 'confirmed');

  return {
    pendingOrders,
    loading,
    hasPendingPayment,
    refetch: fetchPendingOrders
  };
};
