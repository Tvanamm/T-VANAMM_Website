import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { filterNotificationsForUser } from '@/utils/notificationFilters';

interface OptimizedNotification {
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

export const useOptimizedNotifications = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [allNotifications, setAllNotifications] = useState<OptimizedNotification[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
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

  // Apply role-based filtering to notifications
  const notifications = user ? filterNotificationsForUser(allNotifications, user.id, user.role) : [];
  console.log('Filtered notifications for', user?.role, ':', notifications.length);

  const createNotification = async (
    type: string,
    title: string,
    message: string,
    targetUserId?: string,
    data?: any
  ): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('notifications')
        .insert({
          type,
          title,
          message,
          user_id: targetUserId || null,
          data
        });

      if (error) {
        console.error('Error creating notification:', error);
        return false;
      }

      // Only refresh if we're creating a notification for the current user
      if (!targetUserId || targetUserId === user?.id) {
        await fetchNotifications();
      }
      return true;
    } catch (error) {
      console.error('Error creating notification:', error);
      return false;
    }
  };

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

      // Update local state immediately for better UX
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
      const { error } = await supabase
        .from('notifications')
        .update({ 
          read: true,
          read_at: new Date().toISOString()
        })
        .or(`user_id.eq.${user.id},user_id.is.null`)
        .eq('read', false);

      if (error) {
        console.error('Error marking all notifications as read:', error);
        return false;
      }

      // Update local state
      setAllNotifications(prev => 
        prev.map(notification => ({ 
          ...notification, 
          read: true, 
          read_at: new Date().toISOString() 
        }))
      );

      toast({
        title: "Success",
        description: "All notifications marked as read"
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
      .channel('notifications_realtime')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications'
      }, (payload) => {
        console.log('New notification received:', payload);
        const newNotification = payload.new as OptimizedNotification;
        if (!newNotification.user_id || newNotification.user_id === user.id) {
          setAllNotifications(prev => [newNotification, ...prev]);
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, fetchNotifications]);

  const unreadCount = notifications.filter(notification => !notification.read).length;

  return {
    notifications,
    loading,
    unreadCount,
    createNotification,
    markAsRead,
    markAllAsRead,
    refetch: fetchNotifications
  };
};
