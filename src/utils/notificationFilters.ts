
import { Notification, NotificationData } from '@/types/notifications';

export const filterNotificationsForAdmin = (notifications: Notification[]): Notification[] => {
  return notifications.filter(notification => {
    const notificationData = notification.data as NotificationData;
    
    // Filter out "user assigned as franchise but not yet added" notifications
    if (notification.type === 'role_assigned' && 
        notification.message.includes('not yet added') && 
        notificationData?.new_role === 'franchise') {
      return false;
    }

    // Admins should not see new user registration notifications
    if (notification.type === 'new_user') {
      return false;
    }
    
    // Admins should not see role assignment notifications unless sent by owner
    if (notification.type === 'role_assigned' && 
        notificationData?.assigned_by !== 'Owner' && 
        notificationData?.sent_by !== 'owner') {
      return false;
    }
    
    return true;
  });
};

export const filterNotificationsForFranchise = (
  notifications: Notification[], 
  userId: string,
  franchiseLocation?: string
): Notification[] => {
  return notifications.filter(notification => {
    const notificationData = notification.data as NotificationData;
    
    // Show only notifications meant for this specific user
    if (notification.user_id && notification.user_id !== userId) {
      return false;
    }
    
    // Filter franchise order notifications - only show their own orders
    if (notification.type === 'new_franchise_order' || 
        notification.type === 'franchise_order_placed') {
      return notificationData?.sender_id === userId ||
             notificationData?.franchise_location === franchiseLocation;
    }
    
    // Don't show new user registration notifications
    if (notification.type === 'new_user') {
      return false;
    }
    
    // Don't show role assignment notifications for other users
    if (notification.type === 'role_assigned' && 
        notification.message.includes('not yet added') &&
        notificationData?.target_user_id !== userId) {
      return false;
    }
    
    // Don't show admin-specific notifications
    if (['admin_message', 'system_alert'].includes(notification.type) && 
        !notificationData?.target_role?.includes('franchise')) {
      return false;
    }
    
    // Don't show messages from other franchise members
    if (notification.type === 'franchise_message' && 
        notificationData?.sender_id !== userId &&
        notification.user_id !== userId) {
      return false;
    }
    
    // Show notifications that are:
    // - Directly for this user (user_id matches)
    // - Owner messages to all franchises (no user_id but type is owner_message)  
    // - Verification related for this user
    // - Order confirmations for this user's orders
    return !notification.user_id || 
           notification.user_id === userId || 
           ['owner_message', 'verification_update', 'verification_request', 
            'aadhar_verified', 'order_status_update'].includes(notification.type);
  });
};

export const filterNotificationsForUser = (
  notifications: Notification[], 
  userId: string, 
  userRole: string,
  franchiseLocation?: string
): Notification[] => {
  if (userRole === 'admin') {
    const adminFiltered = filterNotificationsForAdmin(notifications);
    return adminFiltered.filter(notification => {
      const notificationData = notification.data as NotificationData;
      
      return !notification.user_id ||
             notification.user_id === userId || 
             ['owner_message', 'admin_message', 'system_alert', 'new_franchise_order'].includes(notification.type) ||
             notificationData?.sent_by === 'owner';
    });
  }
  
  if (userRole === 'franchise') {
    return filterNotificationsForFranchise(notifications, userId, franchiseLocation);
  }

  // For other roles, filter out franchise-specific notifications
  return notifications.filter(notification => {
    const notificationData = notification.data as NotificationData;
    
    if (notification.type === 'role_assigned' && 
        notification.message.includes('not yet added') && 
        notificationData?.new_role === 'franchise') {
      return false;
    }

    return !notification.user_id || notification.user_id === userId;
  });
};
