
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Shield, Users, FileText, BarChart3, 
  Settings, AlertTriangle, CheckCircle,
  Clock, Activity
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import AdminFranchiseManagement from './AdminFranchiseManagement';
import RealTimeAnalyticsDashboard from '@/components/analytics/RealTimeAnalyticsDashboard';
import { useEnhancedFranchiseOnboarding } from '@/hooks/useEnhancedFranchiseOnboarding';
import { useEnhancedFormSubmissions } from '@/hooks/useEnhancedFormSubmissions';

const IsolatedAdminPanel = () => {
  const { user } = useAuth();
  const { 
    franchiseMembers, 
    pendingApprovalsCount, 
    unreadNotificationsCount 
  } = useEnhancedFranchiseOnboarding();
  const { getSubmissionStats } = useEnhancedFormSubmissions();
  
  const [activeTab, setActiveTab] = useState('overview');
  const submissionStats = getSubmissionStats();

  if (!user || !['owner', 'admin'].includes(user.role)) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <Shield className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Access Denied</h3>
            <p className="text-gray-600">This admin panel requires administrator privileges.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Admin Header */}
      <div className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <Shield className="h-8 w-8 text-emerald-600 mr-3" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Admin Control Panel</h1>
                <p className="text-sm text-gray-600">
                  Comprehensive system management for {user.role === 'owner' ? 'Owner' : 'Administrator'}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant={pendingApprovalsCount > 0 ? "destructive" : "secondary"}>
                {pendingApprovalsCount} Pending Approvals
              </Badge>
              <Badge variant={unreadNotificationsCount > 0 ? "default" : "secondary"}>
                {unreadNotificationsCount} Notifications
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Quick Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-3 bg-blue-100 rounded-full">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Franchises</p>
                  <p className="text-2xl font-bold">{franchiseMembers.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-3 bg-yellow-100 rounded-full">
                  <Clock className="h-6 w-6 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Pending Actions</p>
                  <p className="text-2xl font-bold">{pendingApprovalsCount}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-3 bg-green-100 rounded-full">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Active Franchises</p>
                  <p className="text-2xl font-bold">
                    {franchiseMembers.filter(f => f.status === 'verified').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-3 bg-purple-100 rounded-full">
                  <FileText className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Form Submissions</p>
                  <p className="text-2xl font-bold">{submissionStats.total}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Admin Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="franchises" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Franchise Management
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="system" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              System Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-orange-600" />
                    Action Items Requiring Attention
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {pendingApprovalsCount > 0 && (
                      <div className="flex items-center justify-between p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <div>
                          <h4 className="font-medium text-yellow-800">Pending Franchise Approvals</h4>
                          <p className="text-sm text-yellow-600">
                            {pendingApprovalsCount} franchise applications require your review
                          </p>
                        </div>
                        <Button 
                          variant="outline" 
                          onClick={() => setActiveTab('franchises')}
                          className="border-yellow-300 text-yellow-700 hover:bg-yellow-100"
                        >
                          Review Now
                        </Button>
                      </div>
                    )}

                    {submissionStats.pending > 0 && (
                      <div className="flex items-center justify-between p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <div>
                          <h4 className="font-medium text-blue-800">Unprocessed Form Submissions</h4>
                          <p className="text-sm text-blue-600">
                            {submissionStats.pending} form submissions need follow-up
                          </p>
                        </div>
                        <Button 
                          variant="outline"
                          className="border-blue-300 text-blue-700 hover:bg-blue-100"
                        >
                          Process Forms
                        </Button>
                      </div>
                    )}

                    {pendingApprovalsCount === 0 && submissionStats.pending === 0 && (
                      <div className="text-center py-8">
                        <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900">All Caught Up!</h3>
                        <p className="text-gray-600">No pending actions require your attention.</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Recent Activity */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent System Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {franchiseMembers.slice(0, 5).map((member, index) => (
                      <div key={member.id} className="flex items-center justify-between py-2 border-b last:border-b-0">
                        <div>
                          <p className="font-medium">{member.name}</p>
                          <p className="text-sm text-gray-600">
                            {member.franchise_location} • Status: {member.status}
                          </p>
                        </div>
                        <Badge variant={member.status === 'verified' ? 'default' : 'secondary'}>
                          {member.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="franchises">
            <AdminFranchiseManagement />
          </TabsContent>

          <TabsContent value="analytics">
            <RealTimeAnalyticsDashboard />
          </TabsContent>

          <TabsContent value="system">
            <Card>
              <CardHeader>
                <CardTitle>System Configuration</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-4">User Management</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 border rounded-lg">
                        <h4 className="font-medium">Total Users</h4>
                        <p className="text-2xl font-bold">{franchiseMembers.length}</p>
                        <p className="text-sm text-gray-600">Registered franchise members</p>
                      </div>
                      <div className="p-4 border rounded-lg">
                        <h4 className="font-medium">Role Distribution</h4>
                        <div className="space-y-1 mt-2">
                          <div className="flex justify-between text-sm">
                            <span>Verified</span>
                            <span>{franchiseMembers.filter(f => f.status === 'verified').length}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Pending</span>
                            <span>{franchiseMembers.filter(f => f.status === 'pending').length}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-4">System Health</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span>Database Connection</span>
                        <Badge variant="default">Healthy</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Real-time Updates</span>
                        <Badge variant="default">Active</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Notification System</span>
                        <Badge variant="default">Operational</Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default IsolatedAdminPanel;
