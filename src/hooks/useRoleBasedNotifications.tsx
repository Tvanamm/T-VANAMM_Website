
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { filterNotificationsForUser } from '@/utils/notificationFilters';
import { useRealFranchiseProfile } from '@/hooks/useRealFranchiseProfile';

interface RoleBasedNotification {
  id: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  user_id?: string;
  data?: any;
  created_at: string;
  read_at?: string;
}

export const useRoleBasedNotifications = () => {
  const { user } = useAuth();
  const { franchiseProfile } = useRealFranchiseProfile();
  const { toast } = useToast();
  const [allNotifications, setAllNotifications] = useState<RoleBasedNotification[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      console.log('Fetching notifications for user:', user.id, 'role:', user.role);
      
      // Get notifications for specific user or role-based notifications
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .or(`user_id.eq.${user.id},user_id.is.null`)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) {
        console.error('Error fetching notifications:', error);
        return;
      }

      console.log('Raw notifications fetched:', data?.length || 0);
      setAllNotifications(data || []);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  // Apply strict role-based filtering
  const notifications = user ? filterNotificationsForUser(
    allNotifications, 
    user.id, 
    user.role,
    franchiseProfile?.franchise_location
  ) : [];
  
  console.log('Filtered notifications for', user?.role, 'at', franchiseProfile?.franchise_location, ':', notifications.length);

  const markAsRead = async (notificationId: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ 
          read: true,
          read_at: new Date().toISOString()
        })
        .eq('id', notificationId);

      if (error) {
        console.error('Error marking notification as read:', error);
        return false;
      }

      // Update local state immediately
      setAllNotifications(prev => 
        prev.map(notification => 
          notification.id === notificationId 
            ? { ...notification, read: true, read_at: new Date().toISOString() }
            : notification
        )
      );

      return true;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      return false;
    }
  };

  const markAllAsRead = async (): Promise<boolean> => {
    if (!user) return false;

    try {
      const unreadNotificationIds = notifications
        .filter(n => !n.read)
        .map(n => n.id);

      if (unreadNotificationIds.length === 0) {
        toast({
          title: "No Unread Notifications",
          description: "All notifications are already read"
        });
        return true;
      }

      const { error } = await supabase
        .from('notifications')
        .update({ 
          read: true,
          read_at: new Date().toISOString()
        })
        .in('id', unreadNotificationIds);

      if (error) {
        console.error('Error marking all notifications as read:', error);
        return false;
      }

      // Update local state
      setAllNotifications(prev => 
        prev.map(notification => 
          unreadNotificationIds.includes(notification.id)
            ? { ...notification, read: true, read_at: new Date().toISOString() }
            : notification
        )
      );

      toast({
        title: "Success",
        description: `Marked ${unreadNotificationIds.length} notifications as read`
      });

      return true;
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      return false;
    }
  };

  // Set up real-time subscription with role-based filtering
  useEffect(() => {
    if (!user) return;

    fetchNotifications();

    const channel = supabase
      .channel(`notifications_${user.role}_${user.id}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications'
      }, (payload) => {
        console.log('New notification received:', payload);
        const newNotification = payload.new as RoleBasedNotification;
        
        // Only add if it passes our role-based filter
        const filtered = filterNotificationsForUser(
          [newNotification], 
          user.id, 
          user.role,
          franchiseProfile?.franchise_location
        );
        
        if (filtered.length > 0) {
          setAllNotifications(prev => [newNotification, ...prev]);
          
          // Show toast for important notifications
          if (!newNotification.read && 
              ['new_franchise_order', 'order_status_update', 'owner_message'].includes(newNotification.type)) {
            toast({
              title: newNotification.title,
              description: newNotification.message,
            });
          }
        }
      })
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'notifications'
      }, (payload) => {
        console.log('Notification updated:', payload);
        const updatedNotification = payload.new as RoleBasedNotification;
        
        setAllNotifications(prev => 
          prev.map(notification => 
            notification.id === updatedNotification.id 
              ? updatedNotification 
              : notification
          )
        );
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, user?.role, franchiseProfile?.franchise_location, fetchNotifications]);

  const unreadCount = notifications.filter(notification => !notification.read).length;

  return {
    notifications,
    loading,
    unreadCount,
    markAsRead,
    markAllAsRead,
    refetch: fetchNotifications
  };
};
