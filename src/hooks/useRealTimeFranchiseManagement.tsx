
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface FranchiseMember {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  franchise_location: string;
  position: string;
  location_details: string | null;
  status: string;
  tvanamm_id: string | null;
  pincode: string | null;
  state: string | null;
  area: string | null;
  city: string | null;
  transportation_fee: number;
  revenue_generated: number;
  profile_completion_percentage: number;
  user_id: string | null;
  created_at: string;
  updated_at: string;
}

export const useRealTimeFranchiseManagement = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [franchiseMembers, setFranchiseMembers] = useState<FranchiseMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFranchiseMembers = async () => {
    try {
      setError(null);
      const { data, error: fetchError } = await supabase
        .from('franchise_members')
        .select('*')
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;
      setFranchiseMembers(data || []);
    } catch (error: any) {
      console.error('Error fetching franchise members:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const updateMemberStatus = async (memberId: string, status: string) => {
    try {
      const { error } = await supabase
        .from('franchise_members')
        .update({ status })
        .eq('id', memberId);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Franchise member status updated to ${status}`,
      });

      return true;
    } catch (error) {
      console.error('Error updating member status:', error);
      toast({
        title: "Error",
        description: "Failed to update member status",
        variant: "destructive"
      });
      return false;
    }
  };

  const updateMemberDetails = async (memberId: string, updates: Partial<FranchiseMember>) => {
    try {
      const { error } = await supabase
        .from('franchise_members')
        .update(updates)
        .eq('id', memberId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Franchise member details updated successfully",
      });

      return true;
    } catch (error) {
      console.error('Error updating member details:', error);
      toast({
        title: "Error",
        description: "Failed to update member details",
        variant: "destructive"
      });
      return false;
    }
  };

  const updateMemberTransportationFee = async (memberId: string, fee: number) => {
    try {
      const { error } = await supabase
        .from('franchise_members')
        .update({ transportation_fee: fee })
        .eq('id', memberId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Transportation fee updated successfully",
      });

      return true;
    } catch (error) {
      console.error('Error updating transportation fee:', error);
      toast({
        title: "Error",
        description: "Failed to update transportation fee",
        variant: "destructive"
      });
      return false;
    }
  };

  const canAccessDashboard = (member: FranchiseMember) => {
    return member.status === 'verified' && member.profile_completion_percentage >= 100;
  };

  useEffect(() => {
    fetchFranchiseMembers();

    // Set up real-time subscription
    const channel = supabase
      .channel('franchise_members_realtime')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'franchise_members'
      }, () => {
        fetchFranchiseMembers();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return {
    franchiseMembers,
    loading,
    error,
    updateMemberStatus,
    updateMemberDetails,
    updateMemberTransportationFee,
    canAccessDashboard,
    refetch: fetchFranchiseMembers
  };
};
