import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface FranchiseMember {
  id: string;
  user_id: string | null;
  name: string;
  email: string;
  phone: string | null;
  franchise_location: string;
  position: string;
  status: string;
  tvanamm_id: bigint | null;
  pincode: string | null;
  state: string | null;
  area: string | null;
  city: string | null;
  revenue_generated: number;
  profile_completion_percentage: number;
  dashboard_access_enabled: boolean;
  created_at: string;
  updated_at: string;
}

interface OnboardingNotification {
  id: string;
  type: string;
  title: string;
  message: string;
  user_id: string | null;
  franchise_member_id: string | null;
  read: boolean;
  created_at: string;
  data: any;
}

interface VerificationLog {
  id: string;
  action: string;
  timestamp: string;
  details: any;
}

export const useEnhancedFranchiseOnboarding = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [franchiseMembers, setFranchiseMembers] = useState<FranchiseMember[]>([]);
  const [notifications, setNotifications] = useState<OnboardingNotification[]>([]);
  const [verificationLogs, setVerificationLogs] = useState<VerificationLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [onboarding, setOnboarding] = useState(false);

  const canManageMembers = user && ['owner', 'admin'].includes(user.role);
  const isOwner = user?.role === 'owner';

  const fetchFranchiseMembers = useCallback(async () => {
    if (!user || !['owner', 'admin'].includes(user.role)) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('franchise_members')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setFranchiseMembers(data || []);
    } catch (error) {
      console.error('Error fetching franchise members:', error);
      toast({
        title: "Error",
        description: "Failed to load franchise members",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [user, toast]);

  const fetchNotifications = useCallback(async () => {
    if (!user || !['owner', 'admin'].includes(user.role)) return;

    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .in('type', ['franchise_onboarding', 'franchise_verification', 'new_franchise_member'])
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setNotifications(data || []);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  }, [user]);

  const fetchVerificationLogs = useCallback(async () => {
    if (!user || !['owner', 'admin'].includes(user.role)) return;

    try {
      // Create mock verification logs since we don't have a real table
      const mockLogs = franchiseMembers.map(member => ({
        id: `log-${member.id}`,
        action: `Member ${member.status}`,
        timestamp: member.updated_at,
        details: {
          member_name: member.name,
          franchise_location: member.franchise_location,
          status: member.status
        }
      }));
      setVerificationLogs(mockLogs);
    } catch (error) {
      console.error('Error fetching verification logs:', error);
    }
  }, [franchiseMembers, user]);

  // Fixed function with proper validation and error handling
  const completeFranchiseOnboarding = async (onboardingData: {
    userId: string;
    tvanammId: string;
    franchiseLocation: string;
  }) => {
    if (!user || !['owner', 'admin'].includes(user.role)) {
      toast({
        title: "Permission Denied",
        description: "Only owners and admins can complete franchise onboarding",
        variant: "destructive"
      });
      return false;
    }

    // Validate inputs
    if (!onboardingData.tvanammId || onboardingData.tvanammId.trim() === '') {
      toast({
        title: "Invalid Input",
        description: "Please enter a valid TVANAMM ID",
        variant: "destructive"
      });
      return false;
    }

    // Check if it's a valid number
    const tvanammIdNum = parseInt(onboardingData.tvanammId);
    if (isNaN(tvanammIdNum) || tvanammIdNum <= 0) {
      toast({
        title: "Invalid Input",
        description: "TVANAMM ID must be a valid positive number",
        variant: "destructive"
      });
      return false;
    }

    if (!onboardingData.franchiseLocation || onboardingData.franchiseLocation.trim().length < 3) {
      toast({
        title: "Invalid Input",
        description: "Please enter a valid franchise location (minimum 3 characters)",
        variant: "destructive"
      });
      return false;
    }

    setOnboarding(true);
    try {
      console.log('Starting franchise onboarding with data:', onboardingData);
      
      // Call the fixed database function with string parameter (will be converted to bigint in DB)
      const { data, error } = await supabase.rpc('complete_franchise_onboarding', {
        target_user_id: onboardingData.userId,
        tvanamm_id_param: onboardingData.tvanammId, // Send as string
        franchise_location_param: onboardingData.franchiseLocation.trim()
      });

      if (error) {
        console.error('Onboarding error:', error);
        throw error;
      }

      console.log('Onboarding successful:', data);

      toast({
        title: "Success",
        description: "Franchise onboarding completed successfully",
      });

      // Refresh data to show updated status
      await fetchFranchiseMembers();
      await fetchNotifications();
      
      return true;
    } catch (error: any) {
      console.error('Error completing franchise onboarding:', error);
      toast({
        title: "Error",
        description: `Failed to complete onboarding: ${error.message}`,
        variant: "destructive"
      });
      return false;
    } finally {
      setOnboarding(false);
    }
  };

  const updateFranchiseMemberStatus = async (memberId: string, status: string) => {
    try {
      const { error } = await supabase
        .from('franchise_members')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', memberId);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Franchise member status updated to ${status}`,
      });

      await fetchFranchiseMembers();
      return true;
    } catch (error) {
      console.error('Error updating franchise member status:', error);
      toast({
        title: "Error",
        description: "Failed to update franchise member status",
        variant: "destructive"
      });
      return false;
    }
  };

  const approveFranchiseMember = async (memberId: string) => {
    return await updateFranchiseMemberStatus(memberId, 'approved');
  };

  const markNotificationAsRead = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true, read_at: new Date().toISOString() })
        .eq('id', notificationId);

      if (error) throw error;

      setNotifications(prev => prev.map(n => 
        n.id === notificationId ? { ...n, read: true } : n
      ));

      return true;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      return false;
    }
  };

  const registerFranchiseMember = async (memberData: {
    name: string;
    email: string;
    phone: string;
    franchise_location: string;
    position: string;
    location_details?: string;
  }) => {
    try {
      const { error } = await supabase
        .from('franchise_members')
        .insert({
          name: memberData.name,
          email: memberData.email,
          phone: memberData.phone,
          franchise_location: memberData.franchise_location,
          position: memberData.position,
          location_details: memberData.location_details,
          status: 'pending'
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Franchise application submitted successfully",
      });

      await fetchFranchiseMembers();
      return true;
    } catch (error) {
      console.error('Error registering franchise member:', error);
      toast({
        title: "Error",
        description: "Failed to submit franchise application",
        variant: "destructive"
      });
      return false;
    }
  };

  // Get existing franchise member for a user
  const getFranchiseMemberByUserId = (userId: string): FranchiseMember | null => {
    return franchiseMembers.find(member => member.user_id === userId) || null;
  };

  // Computed values
  const pendingApprovalsCount = franchiseMembers.filter(m => m.status === 'pending').length;
  const verificationPendingCount = franchiseMembers.filter(m => m.status === 'approved').length;
  const unreadNotificationsCount = notifications.filter(n => !n.read).length;

  useEffect(() => {
    if (user && ['owner', 'admin'].includes(user.role)) {
      fetchFranchiseMembers();
      fetchNotifications();

      // Set up real-time subscription for franchise members
      const franchiseChannel = supabase
        .channel('franchise_members_onboarding')
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'franchise_members'
        }, () => {
          console.log('Franchise members updated via real-time');
          fetchFranchiseMembers();
        })
        .subscribe();

      // Set up real-time subscription for notifications
      const notificationChannel = supabase
        .channel('franchise_notifications')
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'notifications'
        }, () => {
          console.log('Notifications updated via real-time');
          fetchNotifications();
        })
        .subscribe();

      return () => {
        supabase.removeChannel(franchiseChannel);
        supabase.removeChannel(notificationChannel);
      };
    }
  }, [user, fetchFranchiseMembers, fetchNotifications]);

  useEffect(() => {
    fetchVerificationLogs();
  }, [fetchVerificationLogs]);

  return {
    franchiseMembers,
    notifications,
    verificationLogs,
    loading,
    onboarding,
    canManageMembers,
    isOwner,
    pendingApprovalsCount,
    verificationPendingCount,
    unreadNotificationsCount,
    completeFranchiseOnboarding,
    updateFranchiseMemberStatus,
    approveFranchiseMember,
    markNotificationAsRead,
    registerFranchiseMember,
    getFranchiseMemberByUserId,
    refetch: fetchFranchiseMembers
  };
};
