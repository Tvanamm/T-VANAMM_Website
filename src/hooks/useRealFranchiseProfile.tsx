
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface FranchiseProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  franchise_location: string;
  position: string;
  status: string;
  tvanamm_id?: string;
  profile_completion_percentage?: number;
  transportation_fee?: number;
  location_details?: string;
  city?: string;
  state?: string;
  pincode?: string;
  area?: string;
  created_at: string;
  updated_at: string;
}

export const useRealFranchiseProfile = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [franchiseProfile, setFranchiseProfile] = useState<FranchiseProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = async () => {
    if (!user) {
      console.log('useRealFranchiseProfile: No user found');
      setLoading(false);
      setError(null);
      setFranchiseProfile(null);
      return;
    }

    try {
      console.log('useRealFranchiseProfile: Fetching profile for user:', user.id);
      setLoading(true);
      setError(null);

      // Add timeout to prevent infinite loading
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Profile fetch timeout')), 10000)
      );

      const fetchPromise = supabase
        .from('franchise_members')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle(); // Use maybeSingle instead of single

      const { data, error: fetchError } = await Promise.race([fetchPromise, timeoutPromise]) as any;

      if (fetchError) {
        console.error('useRealFranchiseProfile: Error fetching profile:', fetchError);
        if (fetchError.message !== 'Profile fetch timeout') {
          setError(fetchError.message);
        } else {
          setError('Loading timeout - please refresh the page');
        }
        setFranchiseProfile(null);
        return;
      }

      console.log('useRealFranchiseProfile: Profile data received:', data ? 'Found profile' : 'No profile found');
      setFranchiseProfile(data);
      setError(null);

    } catch (error: any) {
      console.error('useRealFranchiseProfile: Unexpected error:', error);
      setError('Failed to load franchise profile');
      setFranchiseProfile(null);
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updates: Partial<FranchiseProfile>) => {
    if (!franchiseProfile) return false;

    try {
      const { error } = await supabase
        .from('franchise_members')
        .update(updates)
        .eq('id', franchiseProfile.id);

      if (error) {
        toast({
          title: "Error",
          description: "Failed to update profile",
          variant: "destructive"
        });
        return false;
      }

      toast({
        title: "Success",
        description: "Profile updated successfully"
      });
      
      await fetchProfile();
      return true;
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive"
      });
      return false;
    }
  };

  useEffect(() => {
    fetchProfile();

    // Set up real-time subscription only if user exists
    if (!user?.id) return;

    const channel = supabase
      .channel('franchise_profile_realtime')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'franchise_members',
        filter: `user_id=eq.${user.id}`
      }, () => {
        console.log('useRealFranchiseProfile: Real-time update received');
        fetchProfile();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id]);

  return {
    franchiseProfile,
    loading,
    error,
    updateProfile,
    refetch: fetchProfile
  };
};
