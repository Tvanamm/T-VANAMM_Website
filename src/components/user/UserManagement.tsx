
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  Users, 
  CheckCircle, 
  XCircle, 
  User, 
  Mail, 
  Calendar,
  Shield,
  AlertCircle
} from 'lucide-react';

interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: string;
  created_at: string;
  phone?: string;
  provider: string;
}

const UserManagement = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [approving, setApproving] = useState<string | null>(null);

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    if (user?.role === 'owner') {
      fetchUsers();

      // Real-time subscription
      const channel = supabase
        .channel('user_management')
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'profiles'
        }, fetchUsers)
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user]);

  const approveUser = async (userId: string, newRole: string) => {
    setApproving(userId);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ role: newRole as 'customer' | 'franchise' | 'admin' | 'owner' })
        .eq('id', userId);

      if (error) throw error;

      toast({
        title: "Success",
        description: `User approved with role: ${newRole}`,
      });

      fetchUsers();
    } catch (error) {
      console.error('Error approving user:', error);
      toast({
        title: "Error",
        description: "Failed to approve user",
        variant: "destructive"
      });
    } finally {
      setApproving(null);
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'owner': return 'bg-purple-100 text-purple-800';
      case 'admin': return 'bg-blue-100 text-blue-800';
      case 'franchise': return 'bg-green-100 text-green-800';
      case 'customer': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const pendingUsers = users.filter(u => u.role === 'customer');
  const approvedUsers = users.filter(u => u.role !== 'customer');

  if (!user || user.role !== 'owner') {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Access Denied</h2>
          <p className="text-gray-600">Only owners can manage users.</p>
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <div className="w-6 h-6 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p>Loading users...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <Users className="h-8 w-8 text-blue-600 mx-auto mb-2" />
            <h3 className="font-semibold text-blue-800">Total Users</h3>
            <p className="text-2xl font-bold text-blue-700">{users.length}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <AlertCircle className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
            <h3 className="font-semibold text-yellow-800">Pending Approval</h3>
            <p className="text-2xl font-bold text-yellow-700">{pendingUsers.length}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <h3 className="font-semibold text-green-800">Approved Users</h3>
            <p className="text-2xl font-bold text-green-700">{approvedUsers.length}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <Shield className="h-8 w-8 text-purple-600 mx-auto mb-2" />
            <h3 className="font-semibold text-purple-800">Admins</h3>
            <p className="text-2xl font-bold text-purple-700">
              {users.filter(u => u.role === 'admin').length}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Pending Approvals */}
      {pendingUsers.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-yellow-600" />
              Pending User Approvals
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {pendingUsers.map((pendingUser) => (
                <div key={pendingUser.id} className="p-4 border rounded-lg bg-yellow-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <User className="h-8 w-8 text-gray-500" />
                      <div>
                        <h3 className="font-semibold">{pendingUser.name}</h3>
                        <p className="text-sm text-gray-600">{pendingUser.email}</p>
                        <p className="text-xs text-gray-500">
                          Registered: {new Date(pendingUser.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        onClick={() => approveUser(pendingUser.id, 'franchise')}
                        disabled={approving === pendingUser.id}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        {approving === pendingUser.id ? (
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <>
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Approve as Franchise
                          </>
                        )}
                      </Button>
                      
                      <Button
                        size="sm"
                        onClick={() => approveUser(pendingUser.id, 'admin')}
                        disabled={approving === pendingUser.id}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        {approving === pendingUser.id ? (
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <>
                            <Shield className="h-4 w-4 mr-1" />
                            Approve as Admin
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* All Users */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            All Users
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {users.map((userProfile) => (
              <div
                key={userProfile.id}
                className="p-4 border rounded-lg cursor-pointer hover:bg-gray-50"
                onClick={() => setSelectedUser(userProfile)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <User className="h-8 w-8 text-gray-500" />
                    <div>
                      <h3 className="font-semibold">{userProfile.name}</h3>
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-gray-400" />
                        <p className="text-sm text-gray-600">{userProfile.email}</p>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <p className="text-xs text-gray-500">
                          Joined: {new Date(userProfile.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Badge className={getRoleColor(userProfile.role)}>
                      {userProfile.role}
                    </Badge>
                    <Badge variant="outline">
                      {userProfile.provider}
                    </Badge>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* User Details Dialog */}
      <Dialog open={!!selectedUser} onOpenChange={() => setSelectedUser(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>User Details</DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-4">
              <div className="text-center">
                <User className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold">{selectedUser.name}</h3>
                <p className="text-gray-600">{selectedUser.email}</p>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <strong>Role:</strong>
                  <Badge className={getRoleColor(selectedUser.role)}>
                    {selectedUser.role}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <strong>Provider:</strong>
                  <span>{selectedUser.provider}</span>
                </div>
                <div className="flex justify-between">
                  <strong>Phone:</strong>
                  <span>{selectedUser.phone || 'Not provided'}</span>
                </div>
                <div className="flex justify-between">
                  <strong>Joined:</strong>
                  <span>{new Date(selectedUser.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UserManagement;
