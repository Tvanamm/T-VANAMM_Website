import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface IsolatedNotification {
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

export const useIsolatedNotifications = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [notifications, setNotifications] = useState<IsolatedNotification[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      console.log('Fetching isolated notifications for user:', user.id, 'role:', user.role);
      
      let query = supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      // Strict role-based filtering at database level
      if (user.role === 'franchise') {
        // Franchise users ONLY see their own notifications
        query = query.eq('user_id', user.id);
      } else if (user.role === 'admin') {
        // Admins see notifications for them OR system notifications (no user_id)
        query = query.or(`user_id.eq.${user.id},user_id.is.null`);
      } else if (user.role === 'owner') {
        // Owners see all notifications - no filter needed
      } else {
        // Default: only see own notifications
        query = query.eq('user_id', user.id);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching notifications:', error);
        return;
      }

      // Additional client-side filtering for extra security
      const filteredNotifications = (data || []).filter(notification => {
        // For franchise users: only show their own notifications
        if (user.role === 'franchise') {
          return notification.user_id === user.id;
        }
        
        // For admin users: show their notifications + system notifications
        if (user.role === 'admin') {
          return notification.user_id === user.id || notification.user_id === null;
        }
        
        // For owner: show all notifications (no additional filtering)
        if (user.role === 'owner') {
          return true;
        }
        
        // For other roles: only show their own notifications
        return notification.user_id === user.id;
      });

      console.log(`Filtered ${filteredNotifications.length} notifications for ${user.role} user`);
      setNotifications(filteredNotifications);
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
      setNotifications(prev => 
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
      const unreadIds = notifications
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
      setNotifications(prev => 
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

  // Set up real-time subscription with strict filtering
  useEffect(() => {
    if (!user) return;

    fetchNotifications();

    const channel = supabase
      .channel(`isolated_notifications_${user.id}_${user.role}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications'
      }, (payload) => {
        const newNotification = payload.new as IsolatedNotification;
        
        // Only add notification if it's meant for this user
        let shouldAdd = false;
        
        if (user.role === 'franchise') {
          shouldAdd = newNotification.user_id === user.id;
        } else if (user.role === 'admin') {
          shouldAdd = newNotification.user_id === user.id || newNotification.user_id === null;
        } else if (user.role === 'owner') {
          shouldAdd = true; // Owners see all notifications
        } else {
          shouldAdd = newNotification.user_id === user.id;
        }
        
        if (shouldAdd) {
          setNotifications(prev => [newNotification, ...prev]);
          
          // Show toast for important notifications
          if (!newNotification.read && 
              ['order_status_update', 'order_confirmed', 'order_shipped', 'owner_message'].includes(newNotification.type)) {
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
        const updatedNotification = payload.new as IsolatedNotification;
        
        setNotifications(prev => 
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
  }, [user?.id, user?.role, fetchNotifications, toast]);

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