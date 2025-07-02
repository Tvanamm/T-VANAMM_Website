
import { supabase } from '@/integrations/supabase/client';

interface NotificationFilters {
  userId?: string;
  userRole?: string;
  franchiseLocation?: string;
  limit?: number;
}

class NotificationService {
  private static instance: NotificationService;
  private cache = new Map<string, any[]>();
  private lastFetch = new Map<string, number>();

  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  async getNotifications(filters: NotificationFilters = {}) {
    const { userId, userRole, franchiseLocation, limit = 50 } = filters;
    
    if (!userId) return [];

    const cacheKey = `${userId}_${userRole}_${franchiseLocation}`;
    const now = Date.now();
    const lastFetchTime = this.lastFetch.get(cacheKey) || 0;
    
    // Cache for 30 seconds to prevent excessive fetches
    if (now - lastFetchTime < 30000 && this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey) || [];
    }

    try {
      let query = supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

      // Apply role-based filtering
      if (userRole === 'franchise') {
        query = query.or(`user_id.eq.${userId},user_id.is.null`);
      } else if (userRole === 'admin') {
        query = query.or(`user_id.eq.${userId},user_id.is.null`);
      } else {
        query = query.eq('user_id', userId);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching notifications:', error);
        return [];
      }

      // Client-side filtering for better control
      const filtered = this.filterNotificationsByRole(data || [], userId, userRole, franchiseLocation);
      
      // Update cache
      this.cache.set(cacheKey, filtered);
      this.lastFetch.set(cacheKey, now);
      
      return filtered;
    } catch (error) {
      console.error('Error in getNotifications:', error);
      return [];
    }
  }

  private filterNotificationsByRole(
    notifications: any[], 
    userId: string, 
    userRole?: string,
    franchiseLocation?: string
  ) {
    return notifications.filter(notification => {
      // Always show notifications directly for this user
      if (notification.user_id === userId) return true;
      
      // Role-specific filtering
      if (userRole === 'franchise') {
        // Exclude admin-only notifications
        const adminOnlyTypes = ['new_user', 'admin_message'];
        if (adminOnlyTypes.includes(notification.type)) return false;
        
        // Show owner messages and general notifications
        const allowedTypes = ['owner_message', 'verification_update', 'order_status_update'];
        return allowedTypes.includes(notification.type) || !notification.user_id;
      }
      
      if (userRole === 'admin') {
        // Show system notifications and owner messages
        const allowedTypes = ['owner_message', 'system_alert', 'new_franchise_order'];
        return allowedTypes.includes(notification.type) || !notification.user_id;
      }
      
      return !notification.user_id; // Show general notifications
    });
  }

  async markAsRead(notificationId: string): Promise<boolean> {
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

      // Clear cache to force refresh
      this.cache.clear();
      this.lastFetch.clear();
      
      return true;
    } catch (error) {
      console.error('Error in markAsRead:', error);
      return false;
    }
  }

  clearCache() {
    this.cache.clear();
    this.lastFetch.clear();
  }
}

export default NotificationService;
