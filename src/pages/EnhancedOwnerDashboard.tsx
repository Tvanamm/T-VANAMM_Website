
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useEnhancedNotifications } from '@/hooks/useEnhancedNotifications';
import { useEnhancedInventory } from '@/hooks/useEnhancedInventory';
import { useEnhancedFranchiseLocations } from '@/hooks/useEnhancedFranchiseLocations';
import { useSupplyOrders } from '@/hooks/useSupplyOrders';
import { useEnhancedAnalytics } from '@/hooks/useEnhancedAnalytics';
import Navbar from '@/components/Navbar';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { 
  AlertCircle,
  TrendingUp,
  Package,
  MapPin,
  Bell,
  Users,
  DollarSign,
  ShoppingCart,
  Activity,
  Settings
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const EnhancedOwnerDashboard = () => {
  const { user } = useAuth();
  const { notifications, createNotification, urgentCount } = useEnhancedNotifications();
  const { inventory, lowStockItems, outOfStockItems, totalValue } = useEnhancedInventory();
  const { franchiseLocations, totalRevenue, averagePerformance } = useEnhancedFranchiseLocations();
  const { orders, pendingOrders, urgentOrders } = useSupplyOrders();
  const { dashboardMetrics, loading: analyticsLoading } = useEnhancedAnalytics();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState("overview");

  // Redirect if not owner
  useEffect(() => {
    if (user && user.role !== 'owner') {
      navigate('/');
      toast({
        title: "Access Denied",
        description: "You don't have permission to access the owner dashboard.",
        variant: "destructive"
      });
    }
  }, [user, navigate, toast]);

  if (!user || user.role !== 'owner') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="p-6 text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Access Denied</h2>
            <p className="text-gray-600 mb-4">You need owner permissions to access this dashboard.</p>
            <Button onClick={() => navigate('/')} variant="outline">
              Go Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleQuickAction = async (action: string) => {
    switch (action) {
      case 'send-notification':
        await createNotification(
          'system_announcement',
          'System Announcement',
          'This is a test notification from the owner dashboard',
          { category: 'system', priority: 'medium' }
        );
        toast({ title: "Notification Sent", description: "System notification sent successfully" });
        break;
      case 'check-inventory':
        setActiveTab('inventory');
        break;
      case 'view-orders':
        setActiveTab('orders');
        break;
      default:
        toast({ title: "Action", description: `Executing ${action}...` });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50">
      <Navbar />
      
      <div className="pt-20 px-3 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {/* Enhanced Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Enhanced Owner Dashboard</h1>
              <p className="text-gray-600 mt-1">Real-time franchise management system</p>
            </div>
            <div className="flex items-center gap-3">
              {urgentCount > 0 && (
                <Badge variant="destructive" className="animate-pulse">
                  {urgentCount} Urgent Alerts
                </Badge>
              )}
              <Button onClick={() => handleQuickAction('send-notification')} size="sm">
                <Bell className="h-4 w-4 mr-2" />
                Send Alert
              </Button>
            </div>
          </div>
        </div>

        {/* Executive Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100">Total Revenue</p>
                  <p className="text-2xl font-bold">₹{dashboardMetrics.totalRevenue.toLocaleString()}</p>
                  <p className="text-sm text-blue-100">+{dashboardMetrics.revenueGrowth}% from last month</p>
                </div>
                <DollarSign className="h-12 w-12 text-blue-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-emerald-100">Active Franchises</p>
                  <p className="text-2xl font-bold">{franchiseLocations.length}</p>
                  <p className="text-sm text-emerald-100">Avg Performance: {averagePerformance.toFixed(1)}</p>
                </div>
                <MapPin className="h-12 w-12 text-emerald-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100">Total Orders</p>
                  <p className="text-2xl font-bold">{dashboardMetrics.totalOrders}</p>
                  <p className="text-sm text-purple-100">{pendingOrders.length} pending approval</p>
                </div>
                <ShoppingCart className="h-12 w-12 text-purple-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100">Inventory Value</p>
                  <p className="text-2xl font-bold">₹{totalValue.toLocaleString()}</p>
                  <p className="text-sm text-orange-100">{lowStockItems.length} low stock alerts</p>
                </div>
                <Package className="h-12 w-12 text-orange-200" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button onClick={() => handleQuickAction('send-notification')} variant="outline" className="h-20 flex-col">
                <Bell className="h-6 w-6 mb-2" />
                Send Alert
              </Button>
              <Button onClick={() => handleQuickAction('check-inventory')} variant="outline" className="h-20 flex-col">
                <Package className="h-6 w-6 mb-2" />
                Check Inventory
              </Button>
              <Button onClick={() => handleQuickAction('view-orders')} variant="outline" className="h-20 flex-col">
                <ShoppingCart className="h-6 w-6 mb-2" />
                View Orders
              </Button>
              <Button onClick={() => setActiveTab('analytics')} variant="outline" className="h-20 flex-col">
                <TrendingUp className="h-6 w-6 mb-2" />
                Analytics
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Alert Section */}
        {(urgentOrders.length > 0 || outOfStockItems.length > 0 || lowStockItems.length > 0) && (
          <Card className="mb-8 border-red-200 bg-red-50">
            <CardHeader>
              <CardTitle className="text-red-800 flex items-center gap-2">
                <AlertCircle className="h-5 w-5" />
                Urgent Alerts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {urgentOrders.length > 0 && (
                  <div className="flex items-center justify-between p-3 bg-red-100 rounded-md">
                    <span className="text-red-800">{urgentOrders.length} urgent orders require attention</span>
                    <Button size="sm" onClick={() => setActiveTab('orders')}>View Orders</Button>
                  </div>
                )}
                {outOfStockItems.length > 0 && (
                  <div className="flex items-center justify-between p-3 bg-red-100 rounded-md">
                    <span className="text-red-800">{outOfStockItems.length} items are out of stock</span>
                    <Button size="sm" onClick={() => setActiveTab('inventory')}>View Inventory</Button>
                  </div>
                )}
                {lowStockItems.length > 0 && (
                  <div className="flex items-center justify-between p-3 bg-orange-100 rounded-md">
                    <span className="text-orange-800">{lowStockItems.length} items have low stock</span>
                    <Button size="sm" onClick={() => setActiveTab('inventory')}>View Inventory</Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Main Dashboard Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
          <div className="overflow-x-auto">
            <TabsList className="grid w-full grid-cols-6 mb-6 min-w-[600px]">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
              <TabsTrigger value="inventory">Inventory</TabsTrigger>
              <TabsTrigger value="orders">Orders</TabsTrigger>
              <TabsTrigger value="franchises">Franchises</TabsTrigger>
              <TabsTrigger value="notifications">Notifications</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="overview">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Top Performing Locations */}
              <Card>
                <CardHeader>
                  <CardTitle>Top Performing Locations</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {dashboardMetrics.topPerformingLocations.map((location, index) => (
                      <div key={location.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                        <div>
                          <span className="font-medium">#{index + 1} {location.name}</span>
                          <p className="text-sm text-gray-600">₹{location.revenue.toLocaleString()} revenue</p>
                        </div>
                        <Badge variant="outline">{location.performance_score.toFixed(1)} score</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Recent Activity */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {dashboardMetrics.recentActivity.map((activity, index) => (
                      <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded-md">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full mt-2"></div>
                        <div>
                          <p className="text-sm">{activity.description}</p>
                          <p className="text-xs text-gray-500">
                            {new Date(activity.timestamp).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="analytics">
            <Card>
              <CardHeader>
                <CardTitle>Analytics Dashboard</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <TrendingUp className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-600 mb-2">Advanced Analytics</h3>
                  <p className="text-gray-500">Comprehensive analytics dashboard coming soon...</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="inventory">
            <Card>
              <CardHeader>
                <CardTitle>Inventory Management</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-600 mb-2">Inventory Management</h3>
                  <p className="text-gray-500">Enhanced inventory management interface coming soon...</p>
                  <p className="text-sm text-gray-400 mt-2">
                    Current stats: {inventory.length} items, {lowStockItems.length} low stock, {outOfStockItems.length} out of stock
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="orders">
            <Card>
              <CardHeader>
                <CardTitle>Supply Orders Management</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <ShoppingCart className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-600 mb-2">Order Management</h3>
                  <p className="text-gray-500">Advanced order management interface coming soon...</p>
                  <p className="text-sm text-gray-400 mt-2">
                    Current stats: {orders.length} total orders, {pendingOrders.length} pending, {urgentOrders.length} urgent
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="franchises">
            <Card>
              <CardHeader>
                <CardTitle>Franchise Management</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <MapPin className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-600 mb-2">Franchise Management</h3>
                  <p className="text-gray-500">Comprehensive franchise management interface coming soon...</p>
                  <p className="text-sm text-gray-400 mt-2">
                    Current stats: {franchiseLocations.length} locations, ₹{totalRevenue.toLocaleString()} total revenue
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications">
            <Card>
              <CardHeader>
                <CardTitle>Notifications Management</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <Bell className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-600 mb-2">Notifications Center</h3>
                  <p className="text-gray-500">Enhanced notifications management interface coming soon...</p>
                  <p className="text-sm text-gray-400 mt-2">
                    Current stats: {notifications.length} total notifications, {urgentCount} urgent
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default EnhancedOwnerDashboard;
