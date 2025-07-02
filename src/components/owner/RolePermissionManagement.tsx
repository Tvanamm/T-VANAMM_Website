
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useUserManagement } from '@/hooks/useUserManagement';
import { useRoleAssignment, UserRole } from '@/hooks/useRoleAssignment';
import { useRealTimeNotifications } from '@/hooks/useRealTimeNotifications';
import { useToast } from '@/hooks/use-toast';
import RoleStatsCards from './role-management/RoleStatsCards';
import RoleManagementFilters from './role-management/RoleManagementFilters';
import UsersTable from './role-management/UsersTable';
import AccessRestrictedCard from './role-management/AccessRestrictedCard';

const RolePermissionManagement = () => {
  const { user: currentUser } = useAuth();
  const { users, loading, refetch } = useUserManagement();
  const { assignRole, assigning } = useRoleAssignment();
  const { createNotification } = useRealTimeNotifications();
  const { toast } = useToast();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('all');
  const [editingUser, setEditingUser] = useState<string | null>(null);

  // Set up real-time subscription
  useEffect(() => {
    if (currentUser && currentUser.role === 'owner') {
      // TODO: Implement real-time subscription with Neon DB
      console.log('Setting up real-time subscription for role management');
    }
  }, [currentUser, refetch]);

  const handleRoleChange = async (userId: string, newRole: UserRole) => {
    const targetUser = users.find(u => u.id === userId);
    if (!targetUser) return;

    try {
      await assignRole({
        userId,
        newRole
      });

      setEditingUser(null);
      
      // Send system notification
      await createNotification(
        'system_announcement',
        'Role Management',
        `${targetUser.name}'s role has been changed to ${newRole} by ${currentUser?.name}`,
        undefined,
        {
          action: 'role_change',
          target_user: targetUser.name,
          old_role: targetUser.role,
          new_role: newRole
        }
      );
    } catch (error) {
      // Error handling is done in the hook
    }
  };

  const handleDeleteUser = async (userId: string, userName: string) => {
    if (!confirm(`Are you sure you want to delete ${userName}? This action cannot be undone.`)) {
      return;
    }

    try {
      // TODO: Implement with Neon DB
      console.log('Delete user:', userId);

      toast({
        title: "User Deleted",
        description: `${userName} has been removed from the system`,
      });

      // Send notification about user deletion
      await createNotification(
        'system_announcement',
        'User Management',
        `User ${userName} has been deleted from the system by ${currentUser?.name}`,
        undefined,
        {
          action: 'user_deleted',
          deleted_user: userName
        }
      );

    } catch (error: any) {
      console.error('Error deleting user:', error);
      toast({
        title: "Error",
        description: "Failed to delete user: " + error.message,
        variant: "destructive"
      });
    }
  };

  if (currentUser?.role !== 'owner') {
    return <AccessRestrictedCard />;
  }

  return (
    <div className="space-y-6">
      {/* Header with stats */}
      <RoleStatsCards users={users} />

      {/* Search and filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Role & Permission Management (Real-time)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <RoleManagementFilters
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            selectedRole={selectedRole}
            setSelectedRole={setSelectedRole}
          />

          {/* Users table */}
          <UsersTable
            users={users}
            loading={loading}
            searchTerm={searchTerm}
            selectedRole={selectedRole}
            editingUser={editingUser}
            setEditingUser={setEditingUser}
            assigning={assigning}
            currentUserId={currentUser?.id}
            onRoleChange={handleRoleChange}
            onDeleteUser={handleDeleteUser}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default RolePermissionManagement;
