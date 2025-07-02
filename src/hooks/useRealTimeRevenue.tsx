
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface RevenueData {
  totalRevenue: number;
  totalOrders: number;
  revenueByFranchise: Array<{
    franchise_id: string;
    franchise_name: string;
    revenue: number;
    orders: number;
    tvanamm_id?: string;
  }>;
}

export const useRealTimeRevenue = () => {
  const { user } = useAuth();
  const [revenueData, setRevenueData] = useState<RevenueData>({
    totalRevenue: 0,
    totalOrders: 0,
    revenueByFranchise: []
  });
  const [loading, setLoading] = useState(true);

  const fetchRevenueData = async () => {
    try {
      setLoading(true);
      console.log('Fetching revenue data...');
      
      // Fetch total revenue and orders from confirmed/delivered orders
      const { data: orders, error: ordersError } = await supabase
        .from('franchise_orders')
        .select(`
          total_amount, 
          franchise_id, 
          franchise_name, 
          franchise_member_id,
          status,
          franchise_members!inner(tvanamm_id, name)
        `)
        .in('status', ['confirmed', 'delivered']);

      if (ordersError) {
        console.error('Orders error:', ordersError);
        throw ordersError;
      }

      console.log('Fetched orders:', orders);

      const totalRevenue = orders?.reduce((sum, order) => sum + (order.total_amount || 0), 0) || 0;
      const totalOrders = orders?.length || 0;

      // Group revenue by franchise with TVANAMM ID
      const revenueByFranchise = orders?.reduce((acc, order) => {
        const existing = acc.find(item => item.franchise_id === order.franchise_id);
        const memberData = Array.isArray(order.franchise_members) 
          ? order.franchise_members[0] 
          : order.franchise_members;
        
        if (existing) {
          existing.revenue += order.total_amount || 0;
          existing.orders += 1;
        } else {
          acc.push({
            franchise_id: order.franchise_id || '',
            franchise_name: order.franchise_name || 'Unknown',
            revenue: order.total_amount || 0,
            orders: 1,
            tvanamm_id: memberData?.tvanamm_id || 'N/A'
          });
        }
        return acc;
      }, [] as RevenueData['revenueByFranchise']) || [];

      const newRevenueData = {
        totalRevenue,
        totalOrders,
        revenueByFranchise
      };

      console.log('Calculated revenue data:', newRevenueData);
      setRevenueData(newRevenueData);
    } catch (error) {
      console.error('Error fetching revenue data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && ['owner', 'admin'].includes(user.role)) {
      fetchRevenueData();

      // Set up real-time subscription for orders
      const ordersChannel = supabase
        .channel('revenue_realtime')
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'franchise_orders'
        }, (payload) => {
          console.log('Revenue realtime update:', payload);
          fetchRevenueData();
        })
        .subscribe();

      // Set up real-time subscription for franchise members
      const membersChannel = supabase
        .channel('franchise_members_revenue')
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'franchise_members'
        }, (payload) => {
          console.log('Members realtime update:', payload);
          fetchRevenueData();
        })
        .subscribe();

      return () => {
        supabase.removeChannel(ordersChannel);
        supabase.removeChannel(membersChannel);
      };
    }
  }, [user]);

  return { revenueData, loading, refetch: fetchRevenueData };
};
