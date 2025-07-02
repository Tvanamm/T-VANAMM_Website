
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp, 
  Users, 
  Package, 
  ShoppingCart,
  DollarSign,
  Activity
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface AdminStats {
  totalOrders: number;
  totalRevenue: number;
  activeFranchises: number;
  inventoryItems: number;
  recentActivity: Array<{
    type: string;
    message: string;
    time: string;
    status: string;
  }>;
}

const AdminOverview = () => {
  const [stats, setStats] = useState<AdminStats>({
    totalOrders: 0,
    totalRevenue: 0,
    activeFranchises: 0,
    inventoryItems: 0,
    recentActivity: []
  });
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      // Fetch orders
      const { data: orders } = await supabase
        .from('franchise_orders')
        .select('total_amount, status, created_at, franchise_name');

      // Fetch franchises
      const { data: franchises, count: franchiseCount } = await supabase
        .from('franchise_members')
        .select('*', { count: 'exact', head: true });

      // Fetch inventory
      const { data: inventory, count: inventoryCount } = await supabase
        .from('inventory')
        .select('*', { count: 'exact', head: true });

      // Fetch recent form submissions
      const { data: forms } = await supabase
        .from('form_submissions')
        .select('type, name, created_at')
        .order('created_at', { ascending: false })
        .limit(5);

      // Calculate stats
      const totalOrders = orders?.length || 0;
      const totalRevenue = orders?.reduce((sum, order) => sum + (order.total_amount || 0), 0) || 0;

      // Create recent activity
      const recentActivity = [
        ...(orders?.slice(0, 3).map(order => ({
          type: 'order',
          message: `New order from ${order.franchise_name}`,
          time: new Date(order.created_at).toLocaleTimeString(),
          status: order.status
        })) || []),
        ...(forms?.slice(0, 2).map(form => ({
          type: 'form',
          message: `New ${form.type} form from ${form.name}`,
          time: new Date(form.created_at).toLocaleTimeString(),
          status: 'new'
        })) || [])
      ].sort((a, b) => b.time.localeCompare(a.time)).slice(0, 5);

      setStats({
        totalOrders,
        totalRevenue,
        activeFranchises: franchiseCount || 0,
        inventoryItems: inventoryCount || 0,
        recentActivity
      });
    } catch (error) {
      console.error('Error fetching admin stats:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();

    // Real-time subscriptions
    const ordersChannel = supabase
      .channel('admin_orders')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'franchise_orders'
      }, fetchStats)
      .subscribe();

    const formsChannel = supabase
      .channel('admin_forms')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'form_submissions'
      }, fetchStats)
      .subscribe();

    return () => {
      supabase.removeChannel(ordersChannel);
      supabase.removeChannel(formsChannel);
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'confirmed': return 'bg-blue-100 text-blue-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'new': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalOrders}</div>
            <div className="flex items-center gap-1 mt-2">
              <Activity className="h-3 w-3 text-green-500 animate-pulse" />
              <span className="text-xs text-green-600">Live data</span>
            </div>
          </CardContent>
        </Card>


        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Franchises</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeFranchises}</div>
            <div className="flex items-center gap-1 mt-2">
              <Activity className="h-3 w-3 text-green-500 animate-pulse" />
              <span className="text-xs text-green-600">Live data</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inventory Items</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.inventoryItems}</div>
            <div className="flex items-center gap-1 mt-2">
              <Activity className="h-3 w-3 text-green-500 animate-pulse" />
              <span className="text-xs text-green-600">Live data</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {stats.recentActivity.length > 0 ? (
              stats.recentActivity.map((activity, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-emerald-100 rounded-full">
                      {activity.type === 'order' ? (
                        <ShoppingCart className="h-4 w-4 text-emerald-600" />
                      ) : (
                        <Users className="h-4 w-4 text-emerald-600" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium">{activity.message}</p>
                      <p className="text-sm text-gray-600">{activity.time}</p>
                    </div>
                  </div>
                  <Badge className={getStatusColor(activity.status)}>
                    {activity.status}
                  </Badge>
                </div>
              ))
            ) : (
              <p className="text-center text-gray-500 py-4">No recent activity</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminOverview;
