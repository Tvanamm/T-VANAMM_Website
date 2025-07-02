
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TrendingUp, Users, Package, ShoppingCart, Eye, DollarSign } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import { supabase } from '@/integrations/supabase/client';
import { useRealTimeRevenue } from '@/hooks/useRealTimeRevenue';

interface AnalyticsData {
  websiteVisits: number;
  totalInventory: number;
  totalUsers: number;
  totalOrders: number;
  totalRevenue: number;
}

interface InventoryItem {
  id: number;
  name: string;
  stock: number;
  price: number;
  category: string;
}

interface WebsiteVisit {
  id: string;
  page_url: string;
  created_at: string;
}

const RealTimeAnalyticsDashboard = () => {
  const { revenueData } = useRealTimeRevenue();
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData>({
    websiteVisits: 0,
    totalInventory: 0,
    totalUsers: 0,
    totalOrders: 0,
    totalRevenue: 0
  });
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [recentVisits, setRecentVisits] = useState<WebsiteVisit[]>([]);
  const [timeframe, setTimeframe] = useState('24h');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
    setupRealTimeSubscriptions();
  }, [timeframe]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);

      // Calculate date range based on timeframe
      const now = new Date();
      let startDate = new Date();
      
      switch (timeframe) {
        case '24h':
          startDate.setDate(now.getDate() - 1);
          break;
        case '7d':
          startDate.setDate(now.getDate() - 7);
          break;
        case '30d':
          startDate.setDate(now.getDate() - 30);
          break;
      }

      // Fetch all data in parallel
      const [
        visitsResult,
        inventoryResult,
        usersResult,
        recentVisitsResult
      ] = await Promise.allSettled([
        supabase
          .from('website_visits')
          .select('*', { count: 'exact', head: true })
          .gte('created_at', startDate.toISOString()),
        
        supabase
          .from('inventory')
          .select('id, name, stock, price, category')
          .order('stock', { ascending: true }),
        
        supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true }),
        
        supabase
          .from('website_visits')
          .select('id, page_url, created_at')
          .order('created_at', { ascending: false })
          .limit(10)
      ]);

      // Process results
      const websiteVisits = visitsResult.status === 'fulfilled' ? visitsResult.value.count || 0 : 0;
      const inventory = inventoryResult.status === 'fulfilled' ? inventoryResult.value.data || [] : [];
      const totalUsers = usersResult.status === 'fulfilled' ? usersResult.value.count || 0 : 0;
      const visits = recentVisitsResult.status === 'fulfilled' ? recentVisitsResult.value.data || [] : [];

      setAnalyticsData({
        websiteVisits,
        totalInventory: inventory.length,
        totalUsers,
        totalOrders: revenueData.totalOrders,
        totalRevenue: revenueData.totalRevenue
      });

      setInventoryItems(inventory);
      setRecentVisits(visits);

    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const setupRealTimeSubscriptions = () => {
    // Website visits real-time subscription
    const visitsChannel = supabase
      .channel('website_visits_realtime')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'website_visits'
      }, () => {
        fetchAnalytics();
      })
      .subscribe();

    // Inventory real-time subscription
    const inventoryChannel = supabase
      .channel('inventory_realtime')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'inventory'
      }, () => {
        fetchAnalytics();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(visitsChannel);
      supabase.removeChannel(inventoryChannel);
    };
  };

  const getInventoryChartData = () => {
    return inventoryItems.slice(0, 10).map(item => ({
      name: item.name.length > 15 ? item.name.substring(0, 15) + '...' : item.name,
      stock: item.stock,
      value: item.stock * item.price
    }));
  };

  const getVisitsChartData = () => {
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dayVisits = recentVisits.filter(visit => 
        new Date(visit.created_at).toDateString() === date.toDateString()
      ).length;
      
      last7Days.push({
        day: date.toLocaleDateString('en', { weekday: 'short' }),
        visits: dayVisits
      });
    }
    return last7Days;
  };

  const getFranchiseRevenueData = () => {
    return revenueData.revenueByFranchise.slice(0, 8).map(franchise => ({
      name: franchise.franchise_name.length > 12 ? 
        franchise.franchise_name.substring(0, 12) + '...' : 
        franchise.franchise_name,
      revenue: franchise.revenue,
      orders: franchise.orders
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Time Range Selector */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Real-Time Analytics Dashboard</h2>
        <Select value={timeframe} onValueChange={setTimeframe}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="24h">Last 24h</SelectItem>
            <SelectItem value="7d">Last 7 days</SelectItem>
            <SelectItem value="30d">Last 30 days</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Website Visits</p>
                <p className="text-2xl font-bold">{analyticsData.websiteVisits}</p>
                <Badge variant="outline" className="mt-1">Real-time</Badge>
              </div>
              <Eye className="h-12 w-12 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold">₹{analyticsData.totalRevenue.toLocaleString()}</p>
                <Badge variant="outline" className="mt-1">Live</Badge>
              </div>
              <DollarSign className="h-12 w-12 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Orders</p>
                <p className="text-2xl font-bold">{analyticsData.totalOrders}</p>
                <Badge variant="outline" className="mt-1">Real-time</Badge>
              </div>
              <ShoppingCart className="h-12 w-12 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Users</p>
                <p className="text-2xl font-bold">{analyticsData.totalUsers}</p>
              </div>
              <Users className="h-12 w-12 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Franchise Revenue Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Revenue by Franchise (Real-time)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={getFranchiseRevenueData()}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="revenue" fill="#10b981" name="Revenue (₹)" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Website Visits Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Website Visits Trend (Real-time)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={getVisitsChartData()}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="visits" stroke="#3b82f6" strokeWidth={2} name="Daily Visits" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Inventory Items Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Inventory Stock Levels</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={getInventoryChartData()}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="stock" fill="#f59e0b" name="Stock Quantity" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Orders by Franchise Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Orders by Franchise (Real-time)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={getFranchiseRevenueData()}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="orders" fill="#8b5cf6" name="Order Count" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default RealTimeAnalyticsDashboard;
