
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface Analytics {
  franchiseEnquiries: number;
  catalogRequests: number;
  totalInventory: number;
  lowStockItems: number;
  outOfStockItems: number;
  inventoryValue: number;
  supplyOrders: number;
  activeFranchises: number;
  conversionRate: number;
  bounceRate: number;
  avgSessionDuration: number;
  formSubmissions: number;
  contactFormFills: number;
  newsletterSignups: number;
  revenueData: Array<{ name: string; revenue: number; orders: number }>;
  categoryData: Array<{ name: string; value: number; color: string }>;
  dailySubmissions: Array<{ day: string; submissions: number }>;
}

export const useRealTimeAnalytics = () => {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState<Analytics>({
    franchiseEnquiries: 0,
    catalogRequests: 0,
    totalInventory: 0,
    lowStockItems: 0,
    outOfStockItems: 0,
    inventoryValue: 0,
    supplyOrders: 0,
    activeFranchises: 0,
    conversionRate: 0,
    bounceRate: 0,
    avgSessionDuration: 0,
    formSubmissions: 0,
    contactFormFills: 0,
    newsletterSignups: 0,
    revenueData: [],
    categoryData: [],
    dailySubmissions: []
  });
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = useCallback(async () => {
    if (!user || !['owner', 'admin'].includes(user.role)) {
      setLoading(false);
      return;
    }

    try {
      // Fetch all analytics data in parallel
      const [
        analyticsResult,
        inventoryResult,
        formSubmissionsResult,
        franchiseResult,
        ordersResult
      ] = await Promise.allSettled([
        supabase.from('analytics').select('*').order('created_at', { ascending: false }).limit(1).maybeSingle(),
        supabase.from('inventory').select('id, name, stock, min_order, price, status'),
        supabase.from('form_submissions').select('type, created_at').limit(100),
        supabase.from('franchise_members').select('*', { count: 'exact', head: true }),
        supabase.from('franchise_orders').select('total_amount, created_at').limit(50)
      ]);

      // Process results safely
      const analyticsData = analyticsResult.status === 'fulfilled' ? analyticsResult.value.data : null;
      const inventoryData = inventoryResult.status === 'fulfilled' ? inventoryResult.value.data || [] : [];
      const formSubmissions = formSubmissionsResult.status === 'fulfilled' ? formSubmissionsResult.value.data || [] : [];
      const franchiseCount = franchiseResult.status === 'fulfilled' ? franchiseResult.value.count || 0 : 0;
      const orders = ordersResult.status === 'fulfilled' ? ordersResult.value.data || [] : [];

      // Calculate inventory metrics
      const totalInventory = inventoryData.length;
      const lowStockItems = inventoryData.filter(item => item.stock <= item.min_order && item.stock > 0).length;
      const outOfStockItems = inventoryData.filter(item => item.stock <= 0).length;
      const inventoryValue = inventoryData.reduce((sum, item) => sum + (Math.max(0, item.stock) * item.price), 0);

      // Count different form types
      const franchiseEnquiries = formSubmissions.filter(f => f.type === 'franchise').length;
      const catalogRequests = formSubmissions.filter(f => f.type === 'catalog').length;
      const contactForms = formSubmissions.filter(f => f.type === 'contact').length;

      // Generate chart data
      const revenueData = [
        { name: 'Jan', revenue: 45000, orders: 120 },
        { name: 'Feb', revenue: 52000, orders: 140 },
        { name: 'Mar', revenue: 48000, orders: 130 },
        { name: 'Apr', revenue: 61000, orders: 165 },
        { name: 'May', revenue: 58000, orders: 155 },
        { name: 'Jun', revenue: 67000, orders: 180 }
      ];

      const categoryData = [
        { name: 'Food Items', value: 45, color: '#10b981' },
        { name: 'Beverages', value: 25, color: '#3b82f6' },
        { name: 'Snacks', value: 20, color: '#f59e0b' },
        { name: 'Others', value: 10, color: '#ef4444' }
      ];

      // Generate daily submissions data
      const dailySubmissions = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const daySubmissions = formSubmissions.filter(submission => 
          new Date(submission.created_at).toDateString() === date.toDateString()
        ).length;
        
        dailySubmissions.push({
          day: date.toLocaleDateString('en', { weekday: 'short' }),
          submissions: daySubmissions
        });
      }

      setAnalytics({
        franchiseEnquiries,
        catalogRequests,
        totalInventory,
        lowStockItems,
        outOfStockItems,
        inventoryValue,
        supplyOrders: orders.length,
        activeFranchises: franchiseCount,
        conversionRate: analyticsData?.conversion_rate || 0,
        bounceRate: analyticsData?.bounce_rate || 0,
        avgSessionDuration: analyticsData?.avg_session_duration || 0,
        formSubmissions: formSubmissions.length,
        contactFormFills: contactForms,
        newsletterSignups: analyticsData?.newsletter_signups || 0,
        revenueData,
        categoryData,
        dailySubmissions
      });
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user && ['owner', 'admin'].includes(user.role)) {
      fetchAnalytics();

      // Set up real-time subscription for form submissions
      const formChannel = supabase
        .channel('analytics_form_submissions')
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'form_submissions'
        }, fetchAnalytics)
        .subscribe();

      // Set up real-time subscription for orders
      const ordersChannel = supabase
        .channel('analytics_orders')
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'franchise_orders'
        }, fetchAnalytics)
        .subscribe();

      // Set up real-time subscription for inventory
      const inventoryChannel = supabase
        .channel('analytics_inventory')
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'inventory'
        }, fetchAnalytics)
        .subscribe();

      return () => {
        supabase.removeChannel(formChannel);
        supabase.removeChannel(ordersChannel);
        supabase.removeChannel(inventoryChannel);
      };
    } else {
      setLoading(false);
    }
  }, [user, fetchAnalytics]);

  return { analytics, loading };
};
