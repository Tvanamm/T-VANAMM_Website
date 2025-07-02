
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface LoyaltyPoints {
  id: string;
  franchise_member_id: string;
  current_balance: number;
  total_earned: number;
  total_redeemed: number;
  created_at: string;
  updated_at: string;
}

interface LoyaltyTransaction {
  id: string;
  franchise_member_id: string;
  transaction_type: string;
  points: number;
  description: string;
  created_at: string;
  order_id?: string;
}

interface LoyaltyGift {
  id: string;
  franchise_member_id: string;
  gift_type: string;
  points_used: number;
  claimed_at: string;
  status: string;
  order_id?: string;
}

export const useLoyaltyPoints = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loyaltyPoints, setLoyaltyPoints] = useState<LoyaltyPoints | null>(null);
  const [transactions, setTransactions] = useState<LoyaltyTransaction[]>([]);
  const [gifts, setGifts] = useState<LoyaltyGift[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLoyaltyData = async () => {
    if (!user?.id) return;

    try {
      console.log('Fetching loyalty data for user:', user.id);
      
      // Get franchise member ID
      const { data: franchiseMember, error: memberError } = await supabase
        .from('franchise_members')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (memberError) {
        console.error('Error fetching franchise member:', memberError);
        setLoading(false);
        return;
      }

      if (!franchiseMember) {
        console.log('No franchise member found for user:', user.id);
        setLoading(false);
        return;
      }

      console.log('Found franchise member:', franchiseMember.id);

      // Fetch loyalty points - create if doesn't exist
      let { data: loyaltyData, error: loyaltyError } = await supabase
        .from('loyalty_points')
        .select('*')
        .eq('franchise_member_id', franchiseMember.id)
        .single();

      if (loyaltyError && loyaltyError.code === 'PGRST116') {
        console.log('Creating new loyalty record for franchise member:', franchiseMember.id);
        // No loyalty record exists, create one
        const { data: newLoyaltyData, error: insertError } = await supabase
          .from('loyalty_points')
          .insert({
            franchise_member_id: franchiseMember.id,
            current_balance: 0,
            total_earned: 0,
            total_redeemed: 0
          })
          .select()
          .single();

        if (insertError) {
          console.error('Error creating loyalty record:', insertError);
          throw insertError;
        }
        loyaltyData = newLoyaltyData;
      } else if (loyaltyError) {
        console.error('Error fetching loyalty points:', loyaltyError);
        throw loyaltyError;
      }

      console.log('Loyalty data fetched:', loyaltyData);
      setLoyaltyPoints(loyaltyData);

      // Fetch transactions
      const { data: transactionData, error: transactionError } = await supabase
        .from('loyalty_transactions')
        .select('*')
        .eq('franchise_member_id', franchiseMember.id)
        .order('created_at', { ascending: false });

      if (transactionError) {
        console.error('Error fetching transactions:', transactionError);
      } else {
        console.log('Transactions fetched:', transactionData);
        setTransactions(transactionData || []);
      }

      // Fetch gifts
      const { data: giftsData, error: giftsError } = await supabase
        .from('loyalty_gifts')
        .select('*')
        .eq('franchise_member_id', franchiseMember.id)
        .order('claimed_at', { ascending: false });

      if (giftsError) {
        console.error('Error fetching gifts:', giftsError);
      } else {
        console.log('Gifts fetched:', giftsData);
        setGifts(giftsData || []);
      }

    } catch (error) {
      console.error('Error in fetchLoyaltyData:', error);
    } finally {
      setLoading(false);
    }
  };

  const claimGift = async (giftType: 'free_delivery' | 'tea_cups') => {
    if (!loyaltyPoints || loyaltyPoints.current_balance < 500 || !user?.id) {
      toast({
        title: "Error",
        description: "Insufficient points or authentication error",
        variant: "destructive"
      });
      return false;
    }

    try {
      // Get franchise member ID
      const { data: franchiseMember } = await supabase
        .from('franchise_members')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!franchiseMember) throw new Error('Franchise member not found');

      // Deduct points
      const { error: updateError } = await supabase
        .from('loyalty_points')
        .update({
          current_balance: loyaltyPoints.current_balance - 500,
          total_redeemed: loyaltyPoints.total_redeemed + 500,
          updated_at: new Date().toISOString()
        })
        .eq('franchise_member_id', franchiseMember.id);

      if (updateError) throw updateError;

      // Record gift claim
      const { error: giftError } = await supabase
        .from('loyalty_gifts')
        .insert({
          franchise_member_id: franchiseMember.id,
          gift_type: giftType,
          points_used: 500,
          status: 'claimed'
        });

      if (giftError) throw giftError;

      // Record transaction
      const { error: transactionError } = await supabase
        .from('loyalty_transactions')
        .insert({
          franchise_member_id: franchiseMember.id,
          transaction_type: 'gift_claim',
          points: -500,
          description: `Gift claimed: ${giftType === 'free_delivery' ? 'Free Delivery' : '30 Tea Cups'}`
        });

      if (transactionError) throw transactionError;

      toast({
        title: "Gift Claimed!",
        description: `Your ${giftType === 'free_delivery' ? 'free delivery' : 'tea cups'} gift has been claimed successfully.`
      });

      await fetchLoyaltyData();
      return true;
    } catch (error) {
      console.error('Error claiming gift:', error);
      toast({
        title: "Error",
        description: "Failed to claim gift. Please try again.",
        variant: "destructive"
      });
      return false;
    }
  };

  useEffect(() => {
    fetchLoyaltyData();

    if (!user?.id) return;

    // Set up real-time subscription with better error handling
    const channel = supabase
      .channel('loyalty_realtime_enhanced')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'loyalty_points'
      }, (payload) => {
        console.log('Loyalty points updated via realtime:', payload);
        fetchLoyaltyData();
      })
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'loyalty_transactions'
      }, (payload) => {
        console.log('Loyalty transactions updated via realtime:', payload);
        fetchLoyaltyData();
      })
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'loyalty_gifts'
      }, (payload) => {
        console.log('Loyalty gifts updated via realtime:', payload);
        fetchLoyaltyData();
      })
      .subscribe((status) => {
        console.log('Loyalty realtime subscription status:', status);
      });

    return () => {
      console.log('Cleaning up loyalty realtime subscription');
      supabase.removeChannel(channel);
    };
  }, [user?.id]);

  return {
    loyaltyPoints,
    transactions,
    gifts,
    loading,
    claimGift,
    refetch: fetchLoyaltyData
  };
};
