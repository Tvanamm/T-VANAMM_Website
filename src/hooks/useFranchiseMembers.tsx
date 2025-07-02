
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface FranchiseMember {
  id: string;
  name: string;
  email: string;
  phone?: string;
  franchise_location: string;
  position: string;
  status: string;
  user_id?: string;
  location_details?: string;
  assigned_by?: string;
  assigned_at: string;
  created_at: string;
  updated_at: string;
  tvanamm_id?: number;
  dashboard_access_enabled?: boolean;
}

/**
 * Hook to manage franchise members CRUD operations with Supabase.
 */
export const useFranchiseMembers = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [franchiseMembers, setFranchiseMembers] = useState<FranchiseMember[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /** Fetch all franchise members from the database */
  const fetchFranchiseMembers = async () => {
    if (!user) {
      setFranchiseMembers([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from('franchise_members')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching franchise members:', error);
        setError(error.message);
        toast({
          title: 'Error',
          description: 'Failed to load franchise members',
          variant: 'destructive',
        });
      } else {
        console.log('Fetched franchise members:', data);
        setFranchiseMembers(data || []);
      }
    } catch (err) {
      console.error('Unexpected error:', err);
      setError('Unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  /** Add a new franchise member */
  const addFranchiseMember = async (
    memberData: Omit<FranchiseMember, 'id' | 'created_at' | 'updated_at' | 'assigned_at'>
  ) => {
    if (!user) {
      toast({
        title: 'Authentication Required',
        description: 'You must be logged in to add franchise members',
        variant: 'destructive',
      });
      throw new Error('Authentication required');
    }

    setLoading(true);
    const { data, error } = await supabase
      .from('franchise_members')
      .insert([memberData])
      .select()
      .single();

    if (error) {
      console.error('Error adding franchise member:', error);
      toast({
        title: 'Error',
        description: `Failed to add franchise member: ${error.message}`,
        variant: 'destructive',
      });
      setLoading(false);
      throw error;
    }

    toast({
      title: 'Success',
      description: 'Franchise member added successfully',
    });

    await fetchFranchiseMembers();
    setLoading(false);
    return data;
  };

  /** Update an existing franchise member */
  const updateFranchiseMember = async (
    id: string,
    updates: Partial<FranchiseMember>
  ) => {
    setLoading(true);
    const { data, error } = await supabase
      .from('franchise_members')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating franchise member:', error);
      toast({
        title: 'Error',
        description: 'Failed to update franchise member',
        variant: 'destructive',
      });
      setLoading(false);
      throw error;
    }

    toast({
      title: 'Success',
      description: 'Franchise member updated successfully',
    });

    await fetchFranchiseMembers();
    setLoading(false);
    return data;
  };

  /** Delete a franchise member */
  const deleteFranchiseMember = async (id: string) => {
    setLoading(true);
    const { error } = await supabase
      .from('franchise_members')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting franchise member:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete franchise member',
        variant: 'destructive',
      });
      setLoading(false);
      throw error;
    }

    toast({
      title: 'Success',
      description: 'Franchise member deleted successfully',
    });

    await fetchFranchiseMembers();
    setLoading(false);
  };

  // Initial load and real-time subscription
  useEffect(() => {
    fetchFranchiseMembers();

    // Set up real-time subscription for franchise_members changes
    const channel = supabase
      .channel('franchise_members_changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'franchise_members'
      }, (payload) => {
        console.log('Real-time franchise member change:', payload);
        fetchFranchiseMembers();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  return {
    franchiseMembers,
    loading,
    error,
    addFranchiseMember,
    updateFranchiseMember,
    deleteFranchiseMember,
    refetch: fetchFranchiseMembers,
  };
};
