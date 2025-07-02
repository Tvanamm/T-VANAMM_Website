import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRealTimeAnalytics } from '@/hooks/useRealTimeAnalytics';
import { useRealTimeNotifications } from '@/hooks/useRealTimeNotifications';
import { useFormSubmissions } from '@/hooks/useFormSubmissions';
import ModernNavbar from '@/components/ModernNavbar';
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
  Settings,
  BarChart3,
  Store,
  Star,
  MessageSquare
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import ExecutiveSummaryCards from '@/components/dashboard/ExecutiveSummaryCards';
import OverviewTab from '@/components/dashboard/tabs/OverviewTab';
import AnalyticsTab from '@/components/dashboard/tabs/AnalyticsTab';
import UserManagementTab from '@/components/dashboard/tabs/UserManagementTab';
import FranchiseTab from '@/components/dashboard/tabs/FranchiseTab';
import AdminInventoryManagement from '@/components/admin/AdminInventoryManagement';
import AdminNotificationCenter from '@/components/admin/AdminNotificationCenter';
import AdminOrderManagement from '@/components/admin/AdminOrderManagement';
import AdminLoyaltyManagement from '@/components/admin/AdminLoyaltyManagement';
import FormSubmissionsTab from '@/components/dashboard/tabs/FormSubmissionsTab';

const OwnerDashboard = () => {
  const { user } = useAuth();
  const { analytics } = useRealTimeAnalytics();
  const { notifications, createNotification, unreadCount } = useRealTimeNotifications();
  const { franchiseEnquiries } = useFormSubmissions();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedTimeframe, setSelectedTimeframe] = useState("week");

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
      case 'send-notifications':
        await createNotification(
          'system_announcement',
          'System Announcement',
          'This is a test notification from the owner dashboard'
        );
        toast({ title: "Notification Sent", description: "System notification sent successfully" });
        break;
      case 'add-product':
        setActiveTab('inventory');
        toast({ title: "Action", description: "Switched to inventory management" });
        break;
      case 'generate-report':
        toast({ title: "Report Generation", description: "Generating comprehensive business report..." });
        break;
      case 'system-settings':
        toast({ title: "System Settings", description: "Opening system configuration..." });
        break;
      default:
        toast({ title: "Action", description: `Executing ${action}...` });
    }
  };

  const mockChartData = {
    revenueData: [
      { name: 'Jan', revenue: 45000, orders: 120 },
      { name: 'Feb', revenue: 52000, orders: 140 },
      { name: 'Mar', revenue: 48000, orders: 130 },
      { name: 'Apr', revenue: 61000, orders: 165 },
      { name: 'May', revenue: 58000, orders: 155 },
      { name: 'Jun', revenue: 67000, orders: 180 }
    ],
    categoryData: [
      { name: 'Food Items', value: 45, color: '#10b981' },
      { name: 'Beverages', value: 25, color: '#3b82f6' },
      { name: 'Snacks', value: 20, color: '#f59e0b' },
      { name: 'Others', value: 10, color: '#ef4444' }
    ],
    dailySubmissions: [
      { day: 'Mon', submissions: 12 },
      { day: 'Tue', submissions: 8 },
      { day: 'Wed', submissions: 15 },
      { day: 'Thu', submissions: 10 },
      { day: 'Fri', submissions: 18 },
      { day: 'Sat', submissions: 22 },
      { day: 'Sun', submissions: 14 }
    ]
  };

  const enhancedAnalytics = {
    ...analytics,
    franchiseEnquiries: franchiseEnquiries.length,
    totalInventory: analytics.totalInventory,
    supplyOrders: analytics.supplyOrders,
    activeFranchises: analytics.activeFranchises,
    conversionRate: analytics.conversionRate,
    bounceRate: analytics.bounceRate,
    avgSessionDuration: analytics.avgSessionDuration,
    formSubmissions: analytics.formSubmissions,
    contactFormFills: analytics.contactFormFills,
    newsletterSignups: analytics.newsletterSignups || 0,
    catalogRequests: analytics.catalogRequests
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50">
      <ModernNavbar />
      
      <div className="pt-20 px-3 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <DashboardHeader 
          selectedTimeframe={selectedTimeframe}
          onTimeframeChange={setSelectedTimeframe}
        />

        <ExecutiveSummaryCards
          currentData={{
            inventory: enhancedAnalytics.totalInventory,
            franchises: enhancedAnalytics.activeFranchises,
            growth: 12.5
          }}
          franchiseCount={enhancedAnalytics.activeFranchises}
        />

        {/* Alert Section */}
        {unreadCount > 0 && (
          <Card className="mb-8 border-amber-200 bg-amber-50">
            <CardHeader>
              <CardTitle className="text-amber-800 flex items-center gap-2">
                <Bell className="h-5 w-5" />
                System Alerts
                <Badge variant="destructive" className="ml-2">
                  {unreadCount} Unread
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <p className="text-amber-700">
                  You have {unreadCount} unread notifications requiring your attention.
                </p>
                <Button 
                  size="sm" 
                  onClick={() => setActiveTab('notifications')}
                  className="bg-amber-600 hover:bg-amber-700"
                >
                  View Notifications
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Main Dashboard Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
          <div className="overflow-x-auto">
            <TabsList className="grid w-full grid-cols-9 mb-6 min-w-[900px]">
              <TabsTrigger value="overview" className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Overview
              </TabsTrigger>
              <TabsTrigger value="analytics" className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Analytics
              </TabsTrigger>
              <TabsTrigger value="users" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Users
              </TabsTrigger>
              <TabsTrigger value="franchise" className="flex items-center gap-2">
                <Store className="h-4 w-4" />
                Franchise
              </TabsTrigger>
              <TabsTrigger value="inventory" className="flex items-center gap-2">
                <Package className="h-4 w-4" />
                Inventory
              </TabsTrigger>
              <TabsTrigger value="orders" className="flex items-center gap-2">
                <ShoppingCart className="h-4 w-4" />
                Orders
              </TabsTrigger>
              <TabsTrigger value="loyalty" className="flex items-center gap-2">
                <Star className="h-4 w-4" />
                Loyalty
              </TabsTrigger>
              <TabsTrigger value="forms" className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                Forms
              </TabsTrigger>
              <TabsTrigger value="notifications" className="flex items-center gap-2">
                <Bell className="h-4 w-4" />
                Notifications
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="overview">
            <OverviewTab 
              chartData={mockChartData}
              analytics={enhancedAnalytics}
              onQuickAction={handleQuickAction}
            />
          </TabsContent>

          <TabsContent value="analytics">
            <AnalyticsTab analytics={enhancedAnalytics} />
          </TabsContent>

          <TabsContent value="users">
            <UserManagementTab />
          </TabsContent>

          <TabsContent value="franchise">
            <FranchiseTab />
          </TabsContent>

          <TabsContent value="inventory">
            <AdminInventoryManagement />
          </TabsContent>

          <TabsContent value="orders">
            <AdminOrderManagement />
          </TabsContent>

          <TabsContent value="loyalty">
            <AdminLoyaltyManagement />
          </TabsContent>

          <TabsContent value="forms">
            <FormSubmissionsTab />
          </TabsContent>

          <TabsContent value="notifications">
            <AdminNotificationCenter />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default OwnerDashboard;
