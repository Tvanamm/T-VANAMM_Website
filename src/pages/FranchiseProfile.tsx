
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useEffect } from 'react';
import Navbar from '@/components/Navbar';
import FranchiseProfileManagement from '@/components/franchise/FranchiseProfileManagement';
import FranchiseNotifications from '@/components/franchise/FranchiseNotifications';
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const FranchiseProfile = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'profile';

  useEffect(() => {
    if (user && user.role !== 'franchise') {
      navigate('/');
    }
  }, [user, navigate]);

  if (!user || user.role !== 'franchise') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 flex items-center justify-center">
        <Card className="max-w-md w-full m-4">
          <CardContent className="p-6 text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Access Denied</h2>
            <p className="text-gray-600 mb-4">You need franchise permissions to access this page.</p>
            <Button onClick={() => navigate('/')} variant="outline">
              Go Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50">
      <Navbar />
      
      <div className="pt-20 px-3 sm:px-6 lg:px-8 max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Franchise Dashboard
          </h1>
          <p className="text-gray-600">
            Manage your franchise profile, verification status, and view notifications
          </p>
        </div>

        <Tabs value={activeTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="profile">Profile & Verification</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
          </TabsList>
          
          <TabsContent value="profile" className="space-y-6">
            <FranchiseProfileManagement />
          </TabsContent>
          
          <TabsContent value="notifications" className="space-y-6">
            <FranchiseNotifications />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default FranchiseProfile;
