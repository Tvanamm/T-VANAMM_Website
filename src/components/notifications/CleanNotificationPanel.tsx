
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAuth } from '@/contexts/AuthContext';
import { useRealFranchiseProfile } from '@/hooks/useRealFranchiseProfile';
import NotificationService from '@/services/notificationService';
import NotificationHeader from './components/NotificationHeader';
import NotificationItem from './components/NotificationItem';
import NotificationEmptyState from './components/NotificationEmptyState';

const CleanNotificationPanel = () => {
  const { user } = useAuth();
  const { franchiseProfile } = useRealFranchiseProfile();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const notificationService = NotificationService.getInstance();

  const fetchNotifications = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      const data = await notificationService.getNotifications({
        userId: user.id,
        userRole: user.role,
        franchiseLocation: franchiseProfile?.franchise_location
      });
      setNotifications(data);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId: string): Promise<boolean> => {
    const success = await notificationService.markAsRead(notificationId);
    if (success) {
      // Update local state
      setNotifications(prev => 
        prev.map(notification => 
          notification.id === notificationId 
            ? { ...notification, read: true, read_at: new Date().toISOString() }
            : notification
        )
      );
    }
    return success;
  };

  const markAllAsRead = async (): Promise<boolean> => {
    const unreadNotifications = notifications.filter(n => !n.read);
    
    if (unreadNotifications.length === 0) {
      return true;
    }

    // Mark all as read
    const promises = unreadNotifications.map(n => notificationService.markAsRead(n.id));
    const results = await Promise.all(promises);
    
    if (results.every(r => r)) {
      // Update local state
      setNotifications(prev => 
        prev.map(notification => 
          !notification.read
            ? { ...notification, read: true, read_at: new Date().toISOString() }
            : notification
        )
      );
      return true;
    }
    
    return false;
  };

  useEffect(() => {
    if (user) {
      fetchNotifications();
    }
  }, [user?.id, user?.role, franchiseProfile?.franchise_location]);

  const unreadCount = notifications.filter(notification => !notification.read).length;

  if (loading) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            <div className="space-y-2">
              <div className="h-16 bg-gray-200 rounded"></div>
              <div className="h-16 bg-gray-200 rounded"></div>
              <div className="h-16 bg-gray-200 rounded"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <NotificationHeader 
          userRole={user?.role}
          unreadCount={unreadCount}
          onMarkAllRead={markAllAsRead}
        />
      </CardHeader>
      <CardContent className="p-0">
        {notifications.length === 0 ? (
          <NotificationEmptyState userRole={user?.role} />
        ) : (
          <ScrollArea className="h-96">
            <div className="space-y-2 p-4">
              {notifications.map((notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  userRole={user?.role}
                  onMarkAsRead={markAsRead}
                />
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
};

export default CleanNotificationPanel;
