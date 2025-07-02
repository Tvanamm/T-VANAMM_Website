
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users, CheckCircle, AlertTriangle, 
  Clock, Activity, FileText, Eye, ThumbsUp 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useEnhancedFranchiseOnboarding } from '@/hooks/useEnhancedFranchiseOnboarding';

const AdminFranchiseManagement = () => {
  const { user } = useAuth();
  const {
    franchiseMembers,
    verificationLogs,
    notifications,
    loading,
    canManageMembers,
    isOwner,
    approveFranchiseMember,
    markNotificationAsRead,
    pendingApprovalsCount,
    verificationPendingCount,
    unreadNotificationsCount
  } = useEnhancedFranchiseOnboarding();

  if (!canManageMembers) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Access Restricted</h3>
          <p className="text-gray-600">You need admin or owner privileges to manage franchise members.</p>
        </CardContent>
      </Card>
    );
  }

  const handleApproveMember = async (memberId: string) => {
    await approveFranchiseMember(memberId);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-blue-100 text-blue-800';
      case 'verified': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <div className="w-6 h-6 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p>Loading franchise data...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Admin Dashboard Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <Clock className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
            <h3 className="font-semibold text-yellow-800">Pending Approvals</h3>
            <p className="text-2xl font-bold text-yellow-700">{pendingApprovalsCount}</p>
            <p className="text-xs text-yellow-600 mt-1">Require {isOwner ? 'Owner' : 'Admin'} Action</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <CheckCircle className="h-8 w-8 text-blue-600 mx-auto mb-2" />
            <h3 className="font-semibold text-blue-800">Approved Members</h3>
            <p className="text-2xl font-bold text-blue-700">{verificationPendingCount}</p>
            <p className="text-xs text-blue-600 mt-1">Ready for Operations</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <h3 className="font-semibold text-green-800">Active Members</h3>
            <p className="text-2xl font-bold text-green-700">
              {franchiseMembers.filter(m => m.status === 'verified').length}
            </p>
            <p className="text-xs text-green-600 mt-1">Fully Operational</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <Activity className="h-8 w-8 text-purple-600 mx-auto mb-2" />
            <h3 className="font-semibold text-purple-800">Notifications</h3>
            <p className="text-2xl font-bold text-purple-700">{unreadNotificationsCount}</p>
            <p className="text-xs text-purple-600 mt-1">Unread Messages</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="members" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="members">Franchise Members</TabsTrigger>
          <TabsTrigger value="logs">Verification Logs</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
        </TabsList>

        <TabsContent value="members">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Franchise Members Management (Real-time)
                <Badge variant="outline" className="ml-auto">
                  {franchiseMembers.length} Total
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Member Details</TableHead>
                    <TableHead>Location & Position</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {franchiseMembers.map((member) => (
                    <TableRow key={member.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{member.name}</div>
                          <div className="text-sm text-gray-500">{member.email}</div>
                          <div className="text-sm text-gray-500">{member.phone}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{member.franchise_location}</div>
                          <Badge variant="outline" className="text-xs mt-1">
                            {member.position}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(member.status)}>
                          {member.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          {member.status === 'pending' && (
                            <Button
                              size="sm"
                              onClick={() => handleApproveMember(member.id)}
                              className="h-8 px-2 text-xs bg-green-600 hover:bg-green-700"
                            >
                              <ThumbsUp className="h-3 w-3 mr-1" />
                              Approve
                            </Button>
                          )}
                          
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 w-8 p-0"
                          >
                            <Eye className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="logs">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Verification Audit Logs (Real-time)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {verificationLogs.map((log) => (
                  <div key={log.id} className="p-3 border rounded-lg bg-gray-50">
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant="outline">{log.action}</Badge>
                      <span className="text-xs text-gray-500">
                        {new Date(log.timestamp).toLocaleString()}
                      </span>
                    </div>
                    <div className="text-sm">
                      {log.details?.member_name && (
                        <div>Member: <strong>{log.details.member_name}</strong></div>
                      )}
                      {log.details?.franchise_location && (
                        <div>Location: {log.details.franchise_location}</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Real-time Notifications
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {notifications.map((notification) => (
                  <div 
                    key={notification.id} 
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      notification.read ? 'bg-gray-50' : 'bg-blue-50 border-blue-200'
                    }`}
                    onClick={() => !notification.read && markNotificationAsRead(notification.id)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-semibold text-sm">{notification.title}</h4>
                        <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                        {notification.data?.member_name && (
                          <div className="text-xs text-gray-500 mt-2">
                            Member: {notification.data.member_name}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500">
                          {new Date(notification.created_at).toLocaleString()}
                        </span>
                        {!notification.read && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        )}
                      </div>
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

export default AdminFranchiseManagement;
