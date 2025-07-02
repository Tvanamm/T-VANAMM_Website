
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface FranchiseMember {
  id: string;
  name: string;
  email: string;
  franchise_location: string;
  status: string;
  tvanamm_id?: string;
}

interface LoyaltyData {
  franchise_member_id: string;
  current_balance: number;
  total_earned: number;
  total_redeemed: number;
  franchise_members: FranchiseMember;
}

export const useAdminLoyaltyManagement = () => {
  const [loyaltyData, setLoyaltyData] = useState<LoyaltyData[]>([]);
  const [franchiseMembers, setFranchiseMembers] = useState<FranchiseMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchLoyaltyData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch loyalty points with franchise member details
      const { data: loyaltyPoints, error: loyaltyError } = await supabase
        .from('loyalty_points')
        .select(`
          *,
          franchise_members!inner(
            id,
            name,
            email,
            franchise_location,
            status,
            tvanamm_id
          )
        `)
        .in('franchise_members.status', ['active', 'verified']); // Include both active and verified

      if (loyaltyError) {
        console.error('Error fetching loyalty data:', loyaltyError);
        setError('Failed to fetch loyalty data');
        return;
      }

      console.log('Fetched loyalty data:', loyaltyPoints);
      setLoyaltyData(loyaltyPoints || []);

    } catch (error) {
      console.error('Error in fetchLoyaltyData:', error);
      setError('Failed to load loyalty data');
    } finally {
      setLoading(false);
    }
  };

  const fetchFranchiseMembers = async () => {
    try {
      // Fetch all franchise members with active or verified status
      const { data: members, error: membersError } = await supabase
        .from('franchise_members')
        .select('id, name, email, franchise_location, status, tvanamm_id')
        .in('status', ['active', 'verified']) // Include both active and verified
        .order('name');

      if (membersError) {
        console.error('Error fetching franchise members:', membersError);
        return;
      }

      console.log('Fetched franchise members:', members);
      setFranchiseMembers(members || []);
    } catch (error) {
      console.error('Error fetching franchise members:', error);
    }
  };

  const addManualPoints = async (franchiseMemberId: string, points: number, description: string) => {
    try {
      console.log('Adding manual points:', { franchiseMemberId, points, description });

      // Call the database function to add points
      const { data, error } = await supabase.rpc('add_loyalty_points_manual', {
        target_franchise_member_id: franchiseMemberId,
        points_to_add: points,
        description_text: description
      });

      if (error) {
        console.error('Error adding manual points:', error);
        throw error;
      }

      console.log('Manual points added successfully:', data);

      // Refresh the loyalty data
      await fetchLoyaltyData();

      toast({
        title: "Points Added Successfully",
        description: `${points} points have been added to the franchise member's account.`,
      });

      return true;
    } catch (error) {
      console.error('Error adding manual points:', error);
      toast({
        title: "Error Adding Points",
        description: "Failed to add points. Please try again.",
        variant: "destructive"
      });
      return false;
    }
  };

  useEffect(() => {
    fetchLoyaltyData();
    fetchFranchiseMembers();

    // Set up real-time subscription for loyalty points
    const channel = supabase
      .channel('admin_loyalty_realtime')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'loyalty_points'
      }, (payload) => {
        console.log('Loyalty points real-time update:', payload);
        fetchLoyaltyData();
      })
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'loyalty_transactions'
      }, (payload) => {
        console.log('Loyalty transactions real-time update:', payload);
        fetchLoyaltyData();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return {
    loyaltyData,
    franchiseMembers,
    loading,
    error,
    addManualPoints,
    refetch: fetchLoyaltyData
  };
};
