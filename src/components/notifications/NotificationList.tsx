
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Bell, AlertCircle, CheckCircle, Eye } from 'lucide-react';
import { AdminNotification } from '@/types/notifications';

interface NotificationListProps {
  notifications: AdminNotification[];
  onNotificationClick: (notification: AdminNotification) => void;
}

const getTypeColor = (type: string) => {
  switch (type) {
    case 'system_alert': return 'bg-red-100 text-red-800';
    case 'new_registration': return 'bg-blue-100 text-blue-800';
    case 'franchise_approved': return 'bg-green-100 text-green-800';
    case 'aadhar_verified': return 'bg-purple-100 text-purple-800';
    case 'owner_message': return 'bg-yellow-100 text-yellow-800';
    case 'admin_message': return 'bg-blue-100 text-blue-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

const getTypeIcon = (type: string) => {
  switch (type) {
    case 'system_alert': return <AlertCircle className="h-4 w-4" />;
    case 'franchise_approved': return <CheckCircle className="h-4 w-4" />;
    default: return <Bell className="h-4 w-4" />;
  }
};

const NotificationList = ({ notifications, onNotificationClick }: NotificationListProps) => {
  return (
    <div className="space-y-4 max-h-96 overflow-y-auto">
      {notifications.map((notification) => (
        <div 
          key={notification.id}
          className={`p-4 border rounded-lg cursor-pointer transition-colors ${
            notification.read ? 'bg-gray-50' : 'bg-blue-50 border-blue-200'
          }`}
          onClick={() => onNotificationClick(notification)}
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Badge className={`${getTypeColor(notification.type)} flex items-center gap-1`}>
                  {getTypeIcon(notification.type)}
                  {notification.type.replace('_', ' ')}
                </Badge>
                {!notification.read && (
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                )}
              </div>
              <h4 className="font-semibold text-sm">{notification.title}</h4>
              <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
              <div className="flex items-center justify-between mt-2">
                <span className="text-xs text-gray-500">
                  {notification.created_at ? new Date(notification.created_at).toLocaleString() : 'Unknown time'}
                </span>
                {notification.target_role && (
                  <Badge variant="outline" className="text-xs">
                    Target: {notification.target_role}
                  </Badge>
                )}
              </div>
            </div>
            <Button
              size="sm"
              variant="ghost"
              className="h-8 w-8 p-0"
            >
              <Eye className="h-3 w-3" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
};

export { getTypeColor };
export default NotificationList;
