
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export type UserRole = 'owner' | 'admin' | 'franchise' | 'customer';

interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  created_at: string;
  updated_at: string;
  email_verified: boolean;
  phone: string | null;
  provider: string;
}

export const useUserManagement = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      console.log('Fetching users for management');
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      console.log('Users fetched:', data);
      setUsers(data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        title: "Error",
        description: "Failed to load users",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const updateUser = async (userId: string, updates: Partial<User>) => {
    try {
      console.log('Update user:', userId, updates);

      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', userId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "User updated successfully",
      });

      await fetchUsers();
      return { success: true };
    } catch (error) {
      console.error('Error updating user:', error);
      toast({
        title: "Error",
        description: "Failed to update user",
        variant: "destructive"
      });
      return { success: false };
    }
  };

  const deleteUser = async (userId: string) => {
    try {
      console.log('Delete user:', userId);

      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "User deleted successfully",
      });

      await fetchUsers();
      return { success: true };
    } catch (error) {
      console.error('Error deleting user:', error);
      toast({
        title: "Error",
        description: "Failed to delete user",
        variant: "destructive"
      });
      return { success: false };
    }
  };

  useEffect(() => {
    if (user) {
      fetchUsers();

      // Set up real-time subscription
      const channel = supabase
        .channel('profiles_realtime')
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'profiles'
        }, () => {
          console.log('Profiles updated via realtime');
          fetchUsers();
        })
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user]);

  return {
    users,
    loading,
    updateUser,
    deleteUser,
    refetch: fetchUsers
  };
};
