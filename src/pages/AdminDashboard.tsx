
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ModernNavbar from '@/components/ModernNavbar';
import AdminOverview from '@/components/admin/AdminOverview';
import AdminInventoryManagement from '@/components/admin/AdminInventoryManagement';
import AdminOrderManagement from '@/components/admin/AdminOrderManagement';
import AdminUserManagement from '@/components/admin/AdminUserManagement';
import AdminFranchiseManagement from '@/components/admin/AdminFranchiseManagement';
import AdminLoyaltyManagement from '@/components/admin/AdminLoyaltyManagement';

const AdminDashboard = () => {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (!isLoading && (!user || !['admin', 'owner'].includes(user.role))) {
      navigate('/');
    }
  }, [user, isLoading, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50">
        <ModernNavbar />
        <div className="pt-24 flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  if (!user || !['admin', 'owner'].includes(user.role)) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50">
      <ModernNavbar />
      
      <div className="pt-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-2">Manage your business operations</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 bg-white shadow-sm">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="orders">Orders</TabsTrigger>
            <TabsTrigger value="inventory">Inventory</TabsTrigger>
            <TabsTrigger value="franchise">Franchise</TabsTrigger>
            <TabsTrigger value="loyalty">Loyalty</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <AdminOverview />
          </TabsContent>

          <TabsContent value="orders">
            <AdminOrderManagement />
          </TabsContent>

          <TabsContent value="inventory">
            <AdminInventoryManagement />
          </TabsContent>


          <TabsContent value="franchise">
            <AdminFranchiseManagement />
          </TabsContent>

          <TabsContent value="loyalty">
            <AdminLoyaltyManagement />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;
