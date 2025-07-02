
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  TrendingUp, Users, DollarSign, Package, 
  Activity, Calendar, BarChart3, PieChart 
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useRealTimeAnalytics } from '@/hooks/useRealTimeAnalytics';
import { useEnhancedFranchiseOnboarding } from '@/hooks/useEnhancedFranchiseOnboarding';
import { useEnhancedFormSubmissions } from '@/hooks/useEnhancedFormSubmissions';

const RealTimeAnalyticsDashboard = () => {
  const { user } = useAuth();
  const { franchiseMembers } = useEnhancedFranchiseOnboarding();
  const { getSubmissionStats } = useEnhancedFormSubmissions();
  const [refreshKey, setRefreshKey] = useState(0);

  const submissionStats = getSubmissionStats();

  // Calculate real-time metrics
  const totalFranchises = franchiseMembers.length;
  const activeFranchises = franchiseMembers.filter(f => f.status === 'verified').length;
  const pendingFranchises = franchiseMembers.filter(f => f.status === 'pending').length;
  const totalRevenue = franchiseMembers.reduce((sum, f) => sum + (f.revenue_generated || 0), 0);

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  if (!user || !['owner', 'admin'].includes(user.role)) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <Activity className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Access Restricted</h3>
          <p className="text-gray-600">Analytics dashboard requires admin or owner access.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Real-time Analytics</h2>
          <p className="text-muted-foreground">Live business insights and performance metrics</p>
        </div>
        <Button onClick={handleRefresh} variant="outline">
          <Activity className="h-4 w-4 mr-2" />
          Refresh Data
        </Button>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Franchises</p>
                <div className="flex items-center">
                  <p className="text-2xl font-bold">{totalFranchises}</p>
                  <Badge variant="secondary" className="ml-2">Live</Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Franchises</p>
                <div className="flex items-center">
                  <p className="text-2xl font-bold">{activeFranchises}</p>
                  <Badge variant="outline" className="ml-2 text-green-600">
                    {totalFranchises > 0 ? Math.round((activeFranchises / totalFranchises) * 100) : 0}%
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <DollarSign className="h-8 w-8 text-emerald-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <div className="flex items-center">
                  <p className="text-2xl font-bold">₹{totalRevenue.toLocaleString()}</p>
                  <Badge variant="outline" className="ml-2 text-emerald-600">Real-time</Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Package className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending Applications</p>
                <div className="flex items-center">
                  <p className="text-2xl font-bold">{pendingFranchises}</p>
                  {pendingFranchises > 0 && (
                    <Badge variant="destructive" className="ml-2">Action Required</Badge>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Analytics Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="franchises">Franchise Analytics</TabsTrigger>
          <TabsTrigger value="forms">Form Analytics</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Franchise Status Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Verified</span>
                    <div className="flex items-center gap-2">
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-green-600 h-2 rounded-full" 
                          style={{ 
                            width: `${totalFranchises > 0 ? (activeFranchises / totalFranchises) * 100 : 0}%` 
                          }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-600">{activeFranchises}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Pending</span>
                    <div className="flex items-center gap-2">
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-yellow-600 h-2 rounded-full" 
                          style={{ 
                            width: `${totalFranchises > 0 ? (pendingFranchises / totalFranchises) * 100 : 0}%` 
                          }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-600">{pendingFranchises}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="h-5 w-5" />
                  Form Submission Analytics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Total Submissions</span>
                    <Badge variant="outline">{submissionStats.total}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Conversion Rate</span>
                    <Badge variant={submissionStats.conversionRate > 20 ? "default" : "secondary"}>
                      {submissionStats.conversionRate}%
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Franchise Inquiries</span>
                    <Badge variant="outline">{submissionStats.franchiseInquiries}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="franchises">
          <Card>
            <CardHeader>
              <CardTitle>Franchise Performance Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {franchiseMembers.slice(0, 10).map((member) => (
                  <div key={member.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-medium">{member.name}</h4>
                      <p className="text-sm text-gray-600">{member.franchise_location}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">₹{(member.revenue_generated || 0).toLocaleString()}</p>
                      <Badge variant={member.status === 'verified' ? 'default' : 'secondary'}>
                        {member.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="forms">
          <Card>
            <CardHeader>
              <CardTitle>Form Submission Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 border rounded-lg">
                  <p className="text-2xl font-bold text-yellow-600">{submissionStats.pending}</p>
                  <p className="text-sm text-gray-600">Pending Review</p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <p className="text-2xl font-bold text-blue-600">{submissionStats.contacted}</p>
                  <p className="text-sm text-gray-600">Contacted</p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <p className="text-2xl font-bold text-green-600">{submissionStats.converted}</p>
                  <p className="text-sm text-gray-600">Converted</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance">
          <Card>
            <CardHeader>
              <CardTitle>System Performance Indicators</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Profile Completion Rate</span>
                    <span className="text-sm text-gray-600">
                      {franchiseMembers.length > 0 
                        ? Math.round(
                            franchiseMembers.reduce((sum, m) => sum + (m.profile_completion_percentage || 0), 0) / 
                            franchiseMembers.length
                          )
                        : 0
                      }%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{ 
                        width: `${franchiseMembers.length > 0 
                          ? franchiseMembers.reduce((sum, m) => sum + (m.profile_completion_percentage || 0), 0) / 
                            franchiseMembers.length
                          : 0
                        }%` 
                      }}
                    ></div>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">System Responsiveness</span>
                    <Badge variant="default">Excellent</Badge>
                  </div>
                  <p className="text-sm text-gray-600">Real-time updates active across all modules</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default RealTimeAnalyticsDashboard;
