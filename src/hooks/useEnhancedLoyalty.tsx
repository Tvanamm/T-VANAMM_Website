
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRealFranchiseProfile } from './useRealFranchiseProfile';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface LoyaltyPoints {
  current_balance: number;
  total_earned: number;
  total_redeemed: number;
}

interface LoyaltyTransaction {
  id: string;
  transaction_type: string;
  points: number;
  description: string;
  created_at: string;
  order_id?: string;
}

export const useEnhancedLoyalty = (franchiseMemberId?: string) => {
  const { user } = useAuth();
  const { franchiseProfile } = useRealFranchiseProfile();
  const { toast } = useToast();
  
  const [loyaltyPoints, setLoyaltyPoints] = useState<LoyaltyPoints>({
    current_balance: 0,
    total_earned: 0,
    total_redeemed: 0
  });
  const [transactions, setTransactions] = useState<LoyaltyTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Use provided franchiseMemberId or fallback to current user's profile
  const targetMemberId = franchiseMemberId || franchiseProfile?.id;

  const fetchLoyaltyData = async () => {
    if (!targetMemberId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Fetch loyalty points
      const { data: pointsData, error: pointsError } = await supabase
        .from('loyalty_points')
        .select('current_balance, total_earned, total_redeemed')
        .eq('franchise_member_id', targetMemberId)
        .maybeSingle();

      if (pointsError && pointsError.code !== 'PGRST116') {
        console.error('Error fetching loyalty points:', pointsError);
        throw pointsError;
      }

      if (pointsData) {
        setLoyaltyPoints(pointsData);
      } else {
        // Initialize loyalty points if they don't exist
        const { error: insertError } = await supabase
          .from('loyalty_points')
          .insert({
            franchise_member_id: targetMemberId,
            current_balance: 0,
            total_earned: 0,
            total_redeemed: 0
          });

        if (insertError) {
          console.error('Error initializing loyalty points:', insertError);
        }
      }

      // Fetch transactions
      const { data: transactionsData, error: transactionsError } = await supabase
        .from('loyalty_transactions')
        .select('*')
        .eq('franchise_member_id', targetMemberId)
        .order('created_at', { ascending: false })
        .limit(10);

      if (transactionsError) {
        console.error('Error fetching loyalty transactions:', transactionsError);
        throw transactionsError;
      }

      setTransactions(transactionsData || []);
    } catch (err) {
      console.error('Error in fetchLoyaltyData:', err);
      setError('Failed to load loyalty data');
    } finally {
      setLoading(false);
    }
  };

  const addLoyaltyPoints = async (points: number, description: string, orderId?: string) => {
    if (!targetMemberId || points <= 0) {
      console.error('Invalid parameters for adding loyalty points');
      return false;
    }

    try {
      // Add transaction record
      const { error: transactionError } = await supabase
        .from('loyalty_transactions')
        .insert({
          franchise_member_id: targetMemberId,
          transaction_type: 'earned',
          points: points,
          description: description,
          order_id: orderId
        });

      if (transactionError) {
        console.error('Error adding loyalty transaction:', transactionError);
        throw transactionError;
      }

      // Update loyalty points balance
      const { error: updateError } = await supabase
        .from('loyalty_points')
        .upsert({
          franchise_member_id: targetMemberId,
          current_balance: loyaltyPoints.current_balance + points,
          total_earned: loyaltyPoints.total_earned + points,
          total_redeemed: loyaltyPoints.total_redeemed
        });

      if (updateError) {
        console.error('Error updating loyalty points:', updateError);
        throw updateError;
      }

      // Refresh data
      await fetchLoyaltyData();
      
      toast({
        title: "Points Added!",
        description: `You earned ${points} loyalty points! ${description}`,
      });

      return true;
    } catch (error) {
      console.error('Error adding loyalty points:', error);
      toast({
        title: "Error",
        description: "Failed to add loyalty points. Please try again.",
        variant: "destructive"
      });
      return false;
    }
  };

  const addLoyaltyPointsManually = async (points: number, description: string, orderId?: string) => {
    if (!targetMemberId || points <= 0) {
      console.error('Invalid parameters for adding loyalty points manually');
      return false;
    }

    try {
      // Add transaction record
      const { error: transactionError } = await supabase
        .from('loyalty_transactions')
        .insert({
          franchise_member_id: targetMemberId,
          transaction_type: 'manual_addition',
          points: points,
          description: description,
          order_id: orderId
        });

      if (transactionError) {
        console.error('Error adding loyalty transaction:', transactionError);
        throw transactionError;
      }

      // Update loyalty points balance
      const { error: updateError } = await supabase
        .from('loyalty_points')
        .upsert({
          franchise_member_id: targetMemberId,
          current_balance: loyaltyPoints.current_balance + points,
          total_earned: loyaltyPoints.total_earned + points,
          total_redeemed: loyaltyPoints.total_redeemed
        });

      if (updateError) {
        console.error('Error updating loyalty points:', updateError);
        throw updateError;
      }

      // Refresh data
      await fetchLoyaltyData();
      
      toast({
        title: "Points Added Manually!",
        description: `${points} loyalty points added manually! ${description}`,
      });

      return true;
    } catch (error) {
      console.error('Error adding loyalty points manually:', error);
      toast({
        title: "Error",
        description: "Failed to add loyalty points manually. Please try again.",
        variant: "destructive"
      });
      return false;
    }
  };

  const redeemLoyaltyPoints = async (points: number, description: string, orderId?: string) => {
    if (!targetMemberId || points <= 0 || points > loyaltyPoints.current_balance) {
      console.error('Invalid parameters for redeeming loyalty points');
      return false;
    }

    try {
      // Add transaction record
      const { error: transactionError } = await supabase
        .from('loyalty_transactions')
        .insert({
          franchise_member_id: targetMemberId,
          transaction_type: 'redeemed',
          points: points,
          description: description,
          order_id: orderId
        });

      if (transactionError) {
        console.error('Error adding loyalty transaction:', transactionError);
        throw transactionError;
      }

      // Update loyalty points balance
      const { error: updateError } = await supabase
        .from('loyalty_points')
        .update({
          current_balance: loyaltyPoints.current_balance - points,
          total_redeemed: loyaltyPoints.total_redeemed + points
        })
        .eq('franchise_member_id', targetMemberId);

      if (updateError) {
        console.error('Error updating loyalty points:', updateError);
        throw updateError;
      }

      // Refresh data
      await fetchLoyaltyData();
      
      toast({
        title: "Points Redeemed!",
        description: `You redeemed ${points} loyalty points! ${description}`,
      });

      return true;
    } catch (error) {
      console.error('Error redeeming loyalty points:', error);
      toast({
        title: "Error",
        description: "Failed to redeem loyalty points. Please try again.",
        variant: "destructive"
      });
      return false;
    }
  };

  // Helper functions for LoyaltyCheckout
  const canClaimGift = (requiredPoints: number) => {
    return loyaltyPoints.current_balance >= requiredPoints;
  };

  const calculateDiscount = (points: number, orderTotal: number) => {
    return Math.min(points, loyaltyPoints.current_balance, orderTotal);
  };

  useEffect(() => {
    fetchLoyaltyData();
  }, [targetMemberId]);

  return {
    loyaltyPoints,
    loyaltyData: loyaltyPoints, // Alias for backward compatibility
    transactions,
    loading,
    error,
    addLoyaltyPoints,
    addLoyaltyPointsManually,
    redeemLoyaltyPoints,
    canClaimGift,
    calculateDiscount,
    refetch: fetchLoyaltyData
  };
};
