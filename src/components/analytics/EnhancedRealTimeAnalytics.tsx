import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingUp, 
  TrendingDown,
  Users, 
  ShoppingCart, 
  DollarSign, 
  Package,
  Activity,
  Clock,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar } from 'recharts';

interface AnalyticsData {
  totalRevenue: number;
  totalOrders: number;
  revenueChange: number;
  ordersChange: number;
  ordersByStatus: Array<{ status: string; count: number; percentage: number }>;
  revenueByMonth: Array<{ month: string; revenue: number; orders: number }>;
  topFranchises: Array<{ name: string; revenue: number; orders: number }>;
  recentActivity: Array<{ type: string; message: string; time: string }>;
}

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

const EnhancedRealTimeAnalytics = () => {
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    totalRevenue: 0,
    totalOrders: 0,
    revenueChange: 0,
    ordersChange: 0,
    ordersByStatus: [],
    revenueByMonth: [],
    topFranchises: [],
    recentActivity: []
  });
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  const fetchAnalyticsData = async () => {
    try {
      // Fetch orders with franchise details
      const { data: orders, error: ordersError } = await supabase
        .from('franchise_orders')
        .select(`
          *,
          franchise_members (
            name,
            franchise_location
          )
        `)
        .order('created_at', { ascending: false });

      if (ordersError) throw ordersError;

      // Fetch form submissions
      const { data: forms, error: formsError } = await supabase
        .from('form_submissions')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      if (formsError) throw formsError;

      // Calculate analytics
      const totalRevenue = orders?.reduce((sum, order) => sum + (Number(order.total_amount) || 0), 0) || 0;
      const totalOrders = orders?.length || 0;

      // Previous period comparison (last 30 days vs previous 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const sixtyDaysAgo = new Date();
      sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

      const recentOrders = orders?.filter(order => 
        new Date(order.created_at) >= thirtyDaysAgo
      ) || [];
      const previousOrders = orders?.filter(order => 
        new Date(order.created_at) >= sixtyDaysAgo && 
        new Date(order.created_at) < thirtyDaysAgo
      ) || [];

      const recentRevenue = recentOrders.reduce((sum, order) => sum + (Number(order.total_amount) || 0), 0);
      const previousRevenue = previousOrders.reduce((sum, order) => sum + (Number(order.total_amount) || 0), 0);

      const revenueChange = previousRevenue > 0 ? ((recentRevenue - previousRevenue) / previousRevenue) * 100 : 0;
      const ordersChange = previousOrders.length > 0 ? ((recentOrders.length - previousOrders.length) / previousOrders.length) * 100 : 0;

      // Orders by status
      const statusCounts = orders?.reduce((acc, order) => {
        acc[order.status] = (acc[order.status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {};

      const ordersByStatus = Object.entries(statusCounts).map(([status, count]) => ({
        status,
        count: Number(count),
        percentage: totalOrders > 0 ? (Number(count) / totalOrders) * 100 : 0
      }));

      // Revenue by month (last 6 months)
      const monthlyData = [];
      for (let i = 5; i >= 0; i--) {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
        const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);

        const monthOrders = orders?.filter(order => {
          const orderDate = new Date(order.created_at);
          return orderDate >= monthStart && orderDate <= monthEnd;
        }) || [];

        monthlyData.push({
          month: date.toLocaleDateString('en-US', { month: 'short' }),
          revenue: monthOrders.reduce((sum, order) => sum + (Number(order.total_amount) || 0), 0),
          orders: monthOrders.length
        });
      }

      // Top franchises
      const franchiseData = orders?.reduce((acc, order) => {
        const franchiseName = order.franchise_members?.name || order.franchise_name || 'Unknown';
        if (!acc[franchiseName]) {
          acc[franchiseName] = { name: franchiseName, revenue: 0, orders: 0 };
        }
        acc[franchiseName].revenue += Number(order.total_amount) || 0;
        acc[franchiseName].orders += 1;
        return acc;
      }, {} as Record<string, { name: string; revenue: number; orders: number }>) || {};

      const topFranchises = (Object.values(franchiseData) as Array<{ name: string; revenue: number; orders: number }>)
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 5);

      // Recent activity
      const recentActivity = [
        ...recentOrders.slice(0, 3).map(order => ({
          type: 'order',
          message: `New order from ${order.franchise_members?.name || order.franchise_name}`,
          time: new Date(order.created_at).toLocaleTimeString()
        })),
        ...forms?.slice(0, 2).map(form => ({
          type: 'form',
          message: `New ${form.type} submission from ${form.name || form.email}`,
          time: new Date(form.created_at).toLocaleTimeString()
        })) || []
      ].sort((a, b) => b.time.localeCompare(a.time)).slice(0, 5);

      setAnalytics({
        totalRevenue,
        totalOrders,
        revenueChange,
        ordersChange,
        ordersByStatus,
        revenueByMonth: monthlyData,
        topFranchises,
        recentActivity
      });

      setLastUpdate(new Date());
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalyticsData();

    // Set up real-time subscriptions
    const ordersChannel = supabase
      .channel('analytics_orders')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'franchise_orders'
      }, () => {
        console.log('Orders updated, refreshing analytics...');
        fetchAnalyticsData();
      })
      .subscribe();

    const formsChannel = supabase
      .channel('analytics_forms')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'form_submissions'
      }, () => {
        console.log('Forms updated, refreshing analytics...');
        fetchAnalyticsData();
      })
      .subscribe();

    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchAnalyticsData, 30000);

    return () => {
      supabase.removeChannel(ordersChannel);
      supabase.removeChannel(formsChannel);
      clearInterval(interval);
    };
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        {[1, 2, 3, 4].map(i => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
              <div className="h-8 bg-gray-200 rounded w-1/2"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with last update */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Real-Time Analytics</h2>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Activity className="h-4 w-4 animate-pulse text-green-500" />
          Last updated: {lastUpdate.toLocaleTimeString()}
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold">₹{analytics.totalRevenue.toLocaleString()}</p>
                <div className="flex items-center gap-1 mt-2">
                  {analytics.revenueChange >= 0 ? (
                    <TrendingUp className="h-4 w-4 text-green-500" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-red-500" />
                  )}
                  <span className={`text-sm ${analytics.revenueChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {Math.abs(analytics.revenueChange).toFixed(1)}%
                  </span>
                </div>
              </div>
              <DollarSign className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Orders</p>
                <p className="text-2xl font-bold">{analytics.totalOrders}</p>
                <div className="flex items-center gap-1 mt-2">
                  {analytics.ordersChange >= 0 ? (
                    <TrendingUp className="h-4 w-4 text-green-500" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-red-500" />
                  )}
                  <span className={`text-sm ${analytics.ordersChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {Math.abs(analytics.ordersChange).toFixed(1)}%
                  </span>
                </div>
              </div>
              <ShoppingCart className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Franchises</p>
                <p className="text-2xl font-bold">{analytics.topFranchises.length}</p>
                <p className="text-sm text-gray-500 mt-2">Contributing to revenue</p>
              </div>
              <Users className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Order Value</p>
                <p className="text-2xl font-bold">
                  ₹{analytics.totalOrders > 0 ? Math.round(analytics.totalRevenue / analytics.totalOrders).toLocaleString() : 0}
                </p>
                <p className="text-sm text-gray-500 mt-2">Per order</p>
              </div>
              <Package className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts and Data */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="orders">Orders</TabsTrigger>
          <TabsTrigger value="franchises">Franchises</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Revenue Trend (Last 6 Months)</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={analytics.revenueByMonth}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value: any) => [`₹${value.toLocaleString()}`, 'Revenue']} />
                    <Line type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Orders by Status</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={analytics.ordersByStatus}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={120}
                      paddingAngle={5}
                      dataKey="count"
                    >
                      {analytics.ordersByStatus.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="mt-4 space-y-2">
                  {analytics.ordersByStatus.map((status, index) => (
                    <div key={status.status} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        />
                        <span className="capitalize">{status.status}</span>
                      </div>
                      <span className="font-medium">{status.count}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="orders" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Monthly Orders vs Revenue</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={analytics.revenueByMonth}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Bar yAxisId="left" dataKey="orders" fill="#3b82f6" name="Orders" />
                  <Bar yAxisId="right" dataKey="revenue" fill="#10b981" name="Revenue (₹)" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="franchises" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Top Performing Franchises</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics.topFranchises.map((franchise, index) => (
                  <div key={franchise.name} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Badge variant="outline" className="w-6 h-6 p-0 flex items-center justify-center">
                        {index + 1}
                      </Badge>
                      <div>
                        <p className="font-medium">{franchise.name}</p>
                        <p className="text-sm text-gray-600">{franchise.orders} orders</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">₹{franchise.revenue.toLocaleString()}</p>
                      <Progress 
                        value={(franchise.revenue / analytics.totalRevenue) * 100} 
                        className="w-20 h-2 mt-1" 
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics.recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 border rounded-lg">
                    {activity.type === 'order' ? (
                      <ShoppingCart className="h-5 w-5 text-blue-500" />
                    ) : (
                      <Users className="h-5 w-5 text-green-500" />
                    )}
                    <div className="flex-1">
                      <p className="text-sm">{activity.message}</p>
                      <p className="text-xs text-gray-500">
                        <Clock className="h-3 w-3 inline mr-1" />
                        {activity.time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EnhancedRealTimeAnalytics;