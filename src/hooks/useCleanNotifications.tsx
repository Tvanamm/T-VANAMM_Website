
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useRealFranchiseProfile } from '@/hooks/useRealFranchiseProfile';

interface CleanNotification {
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

export const useCleanNotifications = () => {
  const { user } = useAuth();
  const { franchiseProfile } = useRealFranchiseProfile();
  const { toast } = useToast();
  const [allNotifications, setAllNotifications] = useState<CleanNotification[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      // Get notifications based on user role
      let query = supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (user.role === 'franchise') {
        // Franchise users only see their own notifications
        query = query.eq('user_id', user.id);
      } else if (user.role === 'admin') {
        // Admins see system notifications and their own
        query = query.or(`user_id.eq.${user.id},user_id.is.null`);
      } else if (user.role === 'owner') {
        // Owners see all notifications
        // No additional filter needed
      } else {
        // Regular users see only their notifications
        query = query.eq('user_id', user.id);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching notifications:', error);
        return;
      }

      // Additional client-side filtering
      const filteredNotifications = (data || []).filter(notification => {
        if (user.role === 'franchise') {
          // Filter out admin-specific notifications
          const excludeTypes = ['new_user', 'role_assigned'];
          if (excludeTypes.includes(notification.type)) {
            return false;
          }
          
          // Only show notifications for this user or general franchise notifications
          return !notification.user_id || notification.user_id === user.id;
        }
        
        if (user.role === 'admin') {
          // Filter out franchise-specific notifications for other users
          if (notification.type === 'franchise_order_placed' && 
              notification.user_id && 
              notification.user_id !== user.id) {
            return false;
          }
        }
        
        return true;
      });

      setAllNotifications(filteredNotifications);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  }, [user?.id, user?.role]);

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

      // Update local state
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
      const unreadIds = allNotifications
        .filter(n => !n.read)
        .map(n => n.id);

      if (unreadIds.length === 0) {
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
        .in('id', unreadIds);

      if (error) {
        console.error('Error marking all notifications as read:', error);
        return false;
      }

      // Update local state
      setAllNotifications(prev => 
        prev.map(notification => 
          unreadIds.includes(notification.id)
            ? { ...notification, read: true, read_at: new Date().toISOString() }
            : notification
        )
      );

      toast({
        title: "Success",
        description: `Marked ${unreadIds.length} notifications as read`
      });

      return true;
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      return false;
    }
  };

  // Set up real-time subscription
  useEffect(() => {
    if (!user) return;

    fetchNotifications();

    const channel = supabase
      .channel(`clean_notifications_${user.id}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'notifications'
      }, (payload) => {
        console.log('Notification change:', payload);
        fetchNotifications(); // Refetch to ensure proper filtering
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, fetchNotifications]);

  const unreadCount = allNotifications.filter(notification => !notification.read).length;

  return {
    notifications: allNotifications,
    loading,
    unreadCount,
    markAsRead,
    markAllAsRead,
    refetch: fetchNotifications
  };
};
