
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export const useLoyaltyManagement = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isAdding, setIsAdding] = useState(false);

  const addLoyaltyPoints = async (
    franchiseMemberId: string, 
    points: number, 
    description: string = 'Manually added by admin'
  ) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "You must be logged in to add points",
        variant: "destructive"
      });
      throw new Error('Authentication required');
    }

    if (user.role !== 'owner' && user.role !== 'admin') {
      toast({
        title: "Permission Denied",
        description: "Only owners and admins can add loyalty points",
        variant: "destructive"
      });
      throw new Error('Permission denied');
    }

    try {
      setIsAdding(true);
      console.log('Adding loyalty points:', { franchiseMemberId, points, description });

      const { data, error } = await supabase.rpc('add_loyalty_points_manual', {
        target_franchise_member_id: franchiseMemberId,
        points_to_add: points,
        description_text: description
      });

      if (error) {
        console.error('Loyalty points error:', error);
        throw error;
      }

      toast({
        title: "Success! 🎉",
        description: `Successfully added ${points} loyalty points`,
      });

      return { success: true };
    } catch (error: any) {
      console.error('Error adding loyalty points:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to add loyalty points",
        variant: "destructive"
      });
      throw error;
    } finally {
      setIsAdding(false);
    }
  };

  return {
    addLoyaltyPoints,
    isAdding
  };
};
