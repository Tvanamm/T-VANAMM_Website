
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AnalyticsTab from './tabs/AnalyticsTab';
import FranchiseTab from './tabs/FranchiseTab';
import InventoryTab from './tabs/InventoryTab';
import NotificationPanel from '@/components/notifications/NotificationPanel';
import UserManagement from '@/components/user/UserManagement';
import AdminOrderManagement from '@/components/admin/AdminOrderManagement';
import EnhancedAdminLoyaltyManagement from '@/components/admin/EnhancedAdminLoyaltyManagement';
import { useAuth } from '@/contexts/AuthContext';
import { 
  TrendingUp, 
  Users, 
  Package, 
  Bell, 
  ShoppingCart,
  UserCheck,
  Star
} from 'lucide-react';

const DashboardTabs = () => {
  const { user } = useAuth();
  const isOwnerOrAdmin = user && ['owner', 'admin'].includes(user.role);

  return (
    <Tabs defaultValue="analytics" className="space-y-6">
      <div className="overflow-x-auto">
        <TabsList className="grid w-full grid-cols-7 min-w-[700px]">
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Analytics
          </TabsTrigger>
          <TabsTrigger value="orders" className="flex items-center gap-2">
            <ShoppingCart className="h-4 w-4" />
            Orders
          </TabsTrigger>
          <TabsTrigger value="inventory" className="flex items-center gap-2">
            <Package className="h-4 w-4" />
            Inventory
          </TabsTrigger>
          <TabsTrigger value="franchise" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Franchise
          </TabsTrigger>
          <TabsTrigger value="loyalty" className="flex items-center gap-2">
            <Star className="h-4 w-4" />
            Loyalty
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Notifications
          </TabsTrigger>
          {user?.role === 'owner' && (
            <TabsTrigger value="users" className="flex items-center gap-2">
              <UserCheck className="h-4 w-4" />
              Users
            </TabsTrigger>
          )}
        </TabsList>
      </div>

      <TabsContent value="analytics">
        <AnalyticsTab analytics={{}} />
      </TabsContent>

      <TabsContent value="orders">
        <AdminOrderManagement />
      </TabsContent>

      <TabsContent value="inventory">
        <InventoryTab />
      </TabsContent>

      <TabsContent value="franchise">
        <FranchiseTab />
      </TabsContent>

      <TabsContent value="loyalty">
        <EnhancedAdminLoyaltyManagement />
      </TabsContent>

      <TabsContent value="notifications">
        <NotificationPanel />
      </TabsContent>

      {user?.role === 'owner' && (
        <TabsContent value="users">
          <UserManagement />
        </TabsContent>
      )}
    </Tabs>
  );
};

export default DashboardTabs;
