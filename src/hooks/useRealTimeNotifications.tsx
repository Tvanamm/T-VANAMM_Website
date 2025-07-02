import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  user_id?: string;
  data?: any;
  created_at: string | null;
}

export const useRealTimeNotifications = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchNotifications = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .or(`user_id.eq.${user.id},user_id.is.null`)
        .order('created_at', { ascending: false })
        .limit(25); // Reduced limit for better performance

      if (error) {
        console.error('Error fetching notifications:', error);
        return;
      }

      setNotifications(data || []);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true, read_at: new Date().toISOString() })
        .eq('id', notificationId);

      if (error) {
        console.error('Error marking notification as read:', error);
        return;
      }

      setNotifications(prev => 
        prev.map(notif => 
          notif.id === notificationId 
            ? { ...notif, read: true }
            : notif
        )
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    try {
      const unreadIds = notifications.filter(n => !n.read).map(n => n.id);
      
      if (unreadIds.length === 0) return;

      const { error } = await supabase
        .from('notifications')
        .update({ read: true, read_at: new Date().toISOString() })
        .in('id', unreadIds);

      if (error) {
        console.error('Error marking all as read:', error);
        return;
      }

      setNotifications(prev => 
        prev.map(notif => ({ ...notif, read: true }))
      );

      toast({
        title: "Success",
        description: "All notifications marked as read",
      });
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  }, [notifications, toast]);

  const createNotification = useCallback(async (
    type: string,
    title: string,
    message: string,
    targetUserId?: string,
    data?: any
  ) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('notifications')
        .insert([{
          type,
          title,
          message,
          user_id: targetUserId || null,
          data: data || null
        }]);

      if (error) {
        console.error('Error creating notification:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error creating notification:', error);
      return false;
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchNotifications();

      // Optimized real-time subscription with better throttling
      let timeout: NodeJS.Timeout;
      const debouncedFetch = () => {
        clearTimeout(timeout);
        timeout = setTimeout(fetchNotifications, 2000); // Increased to 2 seconds
      };

      const channel = supabase
        .channel(`notifications_${user.id}_optimized`)
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'notifications'
        }, debouncedFetch)
        .subscribe();

      return () => {
        clearTimeout(timeout);
        supabase.removeChannel(channel);
      };
    }
  }, [user, fetchNotifications]);

  return {
    notifications,
    loading,
    unreadCount: notifications.filter(n => !n.read).length,
    markAsRead,
    markAllAsRead,
    createNotification,
    refetch: fetchNotifications
  };
};
