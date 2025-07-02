
import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useRoleBasedNotifications } from '@/hooks/useRoleBasedNotifications';
import { useAuth } from '@/contexts/AuthContext';
import NotificationHeader from './components/NotificationHeader';
import NotificationItem from './components/NotificationItem';
import NotificationEmptyState from './components/NotificationEmptyState';

const RoleBasedNotificationPanel = () => {
  const { notifications, loading, markAsRead, markAllAsRead, unreadCount } = useRoleBasedNotifications();
  const { user } = useAuth();

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="w-6 h-6 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
            <span className="ml-2">Loading notifications...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full">
      <CardHeader>
        <NotificationHeader
          userRole={user?.role}
          unreadCount={unreadCount}
          onMarkAllRead={markAllAsRead}
        />
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[500px]">
          <div className="space-y-3">
            {notifications.length === 0 ? (
              <NotificationEmptyState userRole={user?.role} />
            ) : (
              notifications.map((notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  userRole={user?.role}
                  onMarkAsRead={markAsRead}
                />
              ))
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default RoleBasedNotificationPanel;
