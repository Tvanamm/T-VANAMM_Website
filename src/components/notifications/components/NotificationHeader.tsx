
import React from 'react';
import { Button } from '@/components/ui/button';
import { CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Bell, CheckCheck, User, Shield, Crown } from 'lucide-react';

interface NotificationHeaderProps {
  userRole?: string;
  unreadCount: number;
  onMarkAllRead: () => void;
}

const NotificationHeader: React.FC<NotificationHeaderProps> = ({ 
  userRole, 
  unreadCount, 
  onMarkAllRead 
}) => {
  const getRoleIcon = () => {
    switch (userRole) {
      case 'owner':
        return <Crown className="h-4 w-4 text-yellow-600" />;
      case 'admin':
        return <Shield className="h-4 w-4 text-blue-600" />;
      case 'franchise':
        return <User className="h-4 w-4 text-green-600" />;
      default:
        return <Bell className="h-4 w-4" />;
    }
  };

  const getRoleLabel = () => {
    switch (userRole) {
      case 'owner':
        return 'Owner';
      case 'admin':
        return 'Admin';
      case 'franchise':
        return 'Franchise';
      default:
        return 'User';
    }
  };

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          {getRoleIcon()}
          <CardTitle className="text-lg">
            {getRoleLabel()} Notifications
          </CardTitle>
        </div>
        {unreadCount > 0 && (
          <Badge variant="destructive" className="animate-pulse">
            {unreadCount} New
          </Badge>
        )}
      </div>
      
      {unreadCount > 0 && (
        <Button
          variant="outline"
          size="sm"
          onClick={onMarkAllRead}
          className="flex items-center gap-1"
        >
          <CheckCheck className="h-3 w-3" />
          Mark All Read
        </Button>
      )}
    </div>
  );
};

export default NotificationHeader;
