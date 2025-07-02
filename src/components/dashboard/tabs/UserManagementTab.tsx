import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useUserManagement } from '@/hooks/useUserManagement';
import { useEnhancedFranchiseOnboarding } from '@/hooks/useEnhancedFranchiseOnboarding';
import { Users, Search, UserPlus, Shield, Activity } from 'lucide-react';
import RoleAssignmentModal from '../RoleAssignmentModal';
import SmartFranchiseOnboardingModal from '@/components/franchise/SmartFranchiseOnboardingModal';

const UserManagementTab = () => {
  const { users, loading, updateUser, deleteUser } = useUserManagement();
  const { completeFranchiseOnboarding, onboarding, getFranchiseMemberByUserId } = useEnhancedFranchiseOnboarding();
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [roleModalOpen, setRoleModalOpen] = useState(false);
  const [onboardingModalOpen, setOnboardingModalOpen] = useState(false);

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'owner': return 'bg-red-100 text-red-800';
      case 'admin': return 'bg-blue-100 text-blue-800';
      case 'franchise': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const userStats = {
    total: users.length,
    customers: users.filter(u => u.role === 'customer').length,
    franchises: users.filter(u => u.role === 'franchise').length,
    admins: users.filter(u => u.role === 'admin').length,
    owners: users.filter(u => u.role === 'owner').length
  };

  const handleRoleAssignment = () => {
    setRoleModalOpen(false);
    setSelectedUser(null);
  };

  const handleFranchiseOnboarding = async (data: any) => {
    const success = await completeFranchiseOnboarding(data);
    if (success) {
      setOnboardingModalOpen(false);
      setSelectedUser(null);
    }
    return success;
  };

  const openOnboardingModal = (user: any) => {
    setSelectedUser(user);
    setOnboardingModalOpen(true);
  };

  const getFranchiseStatus = (user: any, existingMember: any) => {
    if (!existingMember) return null;
    
    const isFullyOnboarded = existingMember.status === 'verified' && 
      existingMember.tvanamm_id && 
      existingMember.franchise_location &&
      existingMember.profile_completion_percentage >= 100;
    
    if (isFullyOnboarded) {
      return { text: 'Fully Onboarded', className: 'bg-green-100 text-green-800' };
    } else if (existingMember.status === 'pending') {
      return { text: 'Pending Approval', className: 'bg-yellow-100 text-yellow-800' };
    } else if (existingMember.status === 'approved') {
      return { text: 'Needs Onboarding', className: 'bg-blue-100 text-blue-800' };
    } else {
      return { text: existingMember.status, className: 'bg-gray-100 text-gray-800' };
    }
  };

  const getOnboardingButtonText = (user: any, existingMember: any) => {
    if (!existingMember) return 'Onboard';
    
    const isFullyOnboarded = existingMember.status === 'verified' && 
      existingMember.tvanamm_id && 
      existingMember.franchise_location &&
      existingMember.profile_completion_percentage >= 100;
    
    return isFullyOnboarded ? 'View Details' : 'Complete Onboarding';
  };

  return (
    <div className="space-y-6">
      {/* User Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <Users className="h-8 w-8 text-blue-600 mx-auto mb-2" />
            <h3 className="font-semibold text-blue-800">Total Users</h3>
            <p className="text-2xl font-bold text-blue-700">{users.length}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <Shield className="h-8 w-8 text-red-600 mx-auto mb-2" />
            <h3 className="font-semibold text-red-800">Owners</h3>
            <p className="text-2xl font-bold text-red-700">{users.filter(u => u.role === 'owner').length}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <Shield className="h-8 w-8 text-blue-600 mx-auto mb-2" />
            <h3 className="font-semibold text-blue-800">Admins</h3>
            <p className="text-2xl font-bold text-blue-700">{users.filter(u => u.role === 'admin').length}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <Activity className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <h3 className="font-semibold text-green-800">Franchises</h3>
            <p className="text-2xl font-bold text-green-700">{users.filter(u => u.role === 'franchise').length}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <Users className="h-8 w-8 text-gray-600 mx-auto mb-2" />
            <h3 className="font-semibold text-gray-800">Customers</h3>
            <p className="text-2xl font-bold text-gray-700">{users.filter(u => u.role === 'customer').length}</p>
          </CardContent>
        </Card>
      </div>

      {/* User Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            User Management
            <Badge variant="outline" className="ml-2">
              {filteredUsers.length} Users
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="owner">Owner</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="franchise">Franchise</SelectItem>
                <SelectItem value="customer">Customer</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Users Table */}
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      <div className="w-6 h-6 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                      Loading users...
                    </TableCell>
                  </TableRow>
                ) : filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500">No users found</p>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsers.map((user) => {
                    const existingMember = getFranchiseMemberByUserId(user.id);
                    const franchiseStatus = getFranchiseStatus(user, existingMember);

                    return (
                      <TableRow key={user.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{user.name}</div>
                            {user.phone && (
                              <div className="text-sm text-gray-500">{user.phone}</div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          <Badge className={getRoleColor(user.role)}>
                            {user.role}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-1">
                            <Badge variant={user.email_verified ? "default" : "secondary"} className="text-xs">
                              {user.email_verified ? "Email Verified" : "Email Unverified"}
                            </Badge>
                            {user.role === 'franchise' && franchiseStatus && (
                              <Badge className={`${franchiseStatus.className} text-xs`}>
                                {franchiseStatus.text}
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {new Date(user.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setSelectedUser(user);
                                setRoleModalOpen(true);
                              }}
                            >
                              <Shield className="h-4 w-4 mr-1" />
                              Role
                            </Button>
                            {user.role === 'franchise' && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setSelectedUser(user);
                                  setOnboardingModalOpen(true);
                                }}
                                className={
                                  franchiseStatus?.text === 'Fully Onboarded'
                                    ? "bg-green-50 hover:bg-green-100 text-green-700"
                                    : "bg-emerald-50 hover:bg-emerald-100 text-emerald-700"
                                }
                              >
                                <UserPlus className="h-4 w-4 mr-1" />
                                {getOnboardingButtonText(user, existingMember)}
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Role Assignment Modal */}
      <RoleAssignmentModal
        open={roleModalOpen}
        onOpenChange={setRoleModalOpen}
        user={selectedUser}
        onRoleAssigned={() => {
          setRoleModalOpen(false);
          setSelectedUser(null);
        }}
      />

      {/* Smart Franchise Onboarding Modal */}
      <SmartFranchiseOnboardingModal
        open={onboardingModalOpen}
        onOpenChange={setOnboardingModalOpen}
        user={selectedUser}
        existingMember={selectedUser ? getFranchiseMemberByUserId(selectedUser.id) : null}
        onComplete={async (data) => {
          const success = await completeFranchiseOnboarding(data);
          if (success) {
            setOnboardingModalOpen(false);
            setSelectedUser(null);
          }
          return success;
        }}
        loading={onboarding}
      />
    </div>
  );
};

export default UserManagementTab;
