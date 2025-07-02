
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export type UserRole = 'customer' | 'admin' | 'owner' | 'franchise';

interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  created_at: string;
  phone?: string;
  email_verified: boolean;
}

interface RoleAssignmentData {
  userId: string;
  newRole: UserRole;
  reason?: string;
  franchiseLocation?: string;
}

export const useRoleAssignment = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [assigning, setAssigning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = async () => {
    try {
      setError(null);
      setLoading(true);
      
      const { data, error: fetchError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;
      
      console.log('Fetched users for role assignment:', data);
      setUsers(data || []);
      
    } catch (error) {
      console.error('Error fetching users:', error);
      setError('Failed to load users');
      toast({
        title: "Error",
        description: "Failed to load users",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const assignRole = async (assignmentData: RoleAssignmentData) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "You must be logged in to assign roles",
        variant: "destructive"
      });
      throw new Error('Authentication required');
    }

    // Only owners can assign roles
    if (user.role !== 'owner') {
      toast({
        title: "Permission Denied",
        description: "Only owners can assign user roles",
        variant: "destructive"
      });
      throw new Error('Permission denied');
    }

    try {
      setAssigning(true);
      
      console.log('Assigning role:', assignmentData);

      // Use the database function to assign role and create franchise member if needed
      const { data, error } = await supabase.rpc('assign_role_and_create_member', {
        target_user_id: assignmentData.userId,
        new_role: assignmentData.newRole,
        member_name: null, // Will use profile name
        member_email: null, // Will use profile email
        franchise_location: assignmentData.franchiseLocation || 'Not specified'
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: `Role assigned successfully to ${assignmentData.newRole}`,
      });

      await fetchUsers(); // Refresh the users list
      return { success: true };
    } catch (error: any) {
      console.error('Error assigning role:', error);
      toast({
        title: "Error",
        description: `Failed to assign role: ${error.message || 'Unknown error'}`,
        variant: "destructive"
      });
      throw error;
    } finally {
      setAssigning(false);
    }
  };

  // Permission check helper
  const canAssignRole = (targetRole: UserRole) => {
    if (!user) return false;
    
    // Only owners can assign any role
    if (user.role === 'owner') return true;
    
    return false;
  };

  const getUsersByRole = (role: UserRole) => {
    return users.filter(u => u.role === role);
  };

  const getPendingUsers = () => {
    return users.filter(u => u.role === 'customer' && !u.email_verified);
  };

  useEffect(() => {
    if (user) {
      fetchUsers();
    }
  }, [user]);

  return {
    users,
    loading,
    error,
    assigning,
    assignRole,
    canAssignRole,
    getUsersByRole,
    getPendingUsers,
    refetch: fetchUsers
  };
};
