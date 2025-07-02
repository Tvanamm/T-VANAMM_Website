
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Bell, AlertCircle, Shield, Users } from 'lucide-react';
import { AdminNotification } from '@/types/notifications';

interface NotificationStatsProps {
  notifications: AdminNotification[];
}

const NotificationStats = ({ notifications }: NotificationStatsProps) => {
  const totalNotifications = notifications.length;
  const unreadNotifications = notifications.filter(n => !n.read).length;
  const adminMessages = notifications.filter(n => n.type === 'admin_message').length;
  const ownerMessages = notifications.filter(n => n.type === 'owner_message').length;

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <Card>
        <CardContent className="p-4 text-center">
          <Bell className="h-8 w-8 text-blue-600 mx-auto mb-2" />
          <h3 className="font-semibold text-blue-800">Total Notifications</h3>
          <p className="text-2xl font-bold text-blue-700">{totalNotifications}</p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4 text-center">
          <AlertCircle className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
          <h3 className="font-semibold text-yellow-800">Unread</h3>
          <p className="text-2xl font-bold text-yellow-700">{unreadNotifications}</p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4 text-center">
          <Shield className="h-8 w-8 text-purple-600 mx-auto mb-2" />
          <h3 className="font-semibold text-purple-800">Owner Messages</h3>
          <p className="text-2xl font-bold text-purple-700">{ownerMessages}</p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4 text-center">
          <Users className="h-8 w-8 text-green-600 mx-auto mb-2" />
          <h3 className="font-semibold text-green-800">Admin Messages</h3>
          <p className="text-2xl font-bold text-green-700">{adminMessages}</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default NotificationStats;
