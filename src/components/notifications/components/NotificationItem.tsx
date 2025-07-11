
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Bell, 
  Package, 
  UserCheck, 
  AlertCircle, 
  MessageSquare,
  Shield,
  Crown,
  CheckCircle,
  Truck,
  Calendar,
  User,
  MapPin
} from 'lucide-react';

interface NotificationItemProps {
  notification: {
    id: string;
    type: string;
    title: string;
    message: string;
    read: boolean;
    created_at: string;
    data?: any;
  };
  userRole?: string;
  onMarkAsRead: (id: string) => void;
}

const NotificationItem: React.FC<NotificationItemProps> = ({ 
  notification, 
  userRole, 
  onMarkAsRead 
}) => {
  const getNotificationIcon = () => {
    switch (notification.type) {
      case 'new_franchise_order':
      case 'franchise_order_placed':
        return <Package className="h-4 w-4 text-blue-600" />;
      case 'order_status_update':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'order_shipped':
        return <Truck className="h-4 w-4 text-blue-600" />;
      case 'owner_message':
        return <Crown className="h-4 w-4 text-yellow-600" />;
      case 'admin_message':
        return <Shield className="h-4 w-4 text-blue-600" />;
      case 'franchise_message':
        return <MessageSquare className="h-4 w-4 text-green-600" />;
      case 'role_assigned':
      case 'aadhar_verified':
        return <UserCheck className="h-4 w-4 text-emerald-600" />;
      case 'verification_request':
      case 'verification_update':
        return <AlertCircle className="h-4 w-4 text-orange-600" />;
      default:
        return <Bell className="h-4 w-4 text-gray-600" />;
    }
  };

  const getNotificationBgColor = () => {
    if (notification.read) return 'bg-white hover:bg-gray-50';
    
    switch (notification.type) {
      case 'new_franchise_order':
        return 'bg-blue-50 hover:bg-blue-100 border-blue-200';
      case 'owner_message':
        return 'bg-yellow-50 hover:bg-yellow-100 border-yellow-200';
      case 'order_shipped':
        return 'bg-blue-50 hover:bg-blue-100 border-blue-200';
      case 'verification_request':
        return 'bg-orange-50 hover:bg-orange-100 border-orange-200';
      default:
        return 'bg-emerald-50 hover:bg-emerald-100 border-emerald-200';
    }
  };

  const getPriorityBadge = () => {
    switch (notification.type) {
      case 'owner_message':
        return <Badge variant="destructive" className="text-xs">High Priority</Badge>;
      case 'new_franchise_order':
        return <Badge variant="default" className="text-xs">New Order</Badge>;
      case 'order_shipped':
        return <Badge className="text-xs bg-blue-100 text-blue-800">Shipped</Badge>;
      case 'verification_request':
        return <Badge variant="secondary" className="text-xs">Action Required</Badge>;
      default:
        return null;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  };

  return (
    <div
      className={`p-4 rounded-lg border cursor-pointer transition-all duration-200 ${getNotificationBgColor()}`}
      onClick={() => !notification.read && onMarkAsRead(notification.id)}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 flex-1">
          <div className="mt-1">
            {getNotificationIcon()}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h4 className={`font-medium text-sm truncate ${!notification.read ? 'font-semibold' : ''}`}>
                {notification.title}
              </h4>
              {getPriorityBadge()}
            </div>
            <p className={`text-sm text-gray-600 mb-2 line-clamp-2 ${!notification.read ? 'text-gray-800' : ''}`}>
              {notification.message}
            </p>
        
        {/* Special handling for order_shipped notifications */}
            {notification.type === 'order_shipped' && notification.data && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-2 space-y-2">
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {notification.data.tracking_number && (
                    <div className="flex items-center gap-1">
                      <Package className="h-3 w-3 text-blue-600" />
                      <span className="font-mono text-blue-800">
                        {notification.data.tracking_number}
                      </span>
                    </div>
                  )}
                  {notification.data.shipping_details?.vehicleNumber && (
                    <div className="flex items-center gap-1">
                      <Truck className="h-3 w-3 text-blue-600" />
                      <span className="text-blue-800">
                        {notification.data.shipping_details.vehicleNumber}
                      </span>
                    </div>
                  )}
                  {notification.data.shipping_details?.driverName && (
                    <div className="flex items-center gap-1">
                      <User className="h-3 w-3 text-blue-600" />
                      <span className="text-blue-800">
                        {notification.data.shipping_details.driverName}
                      </span>
                    </div>
                  )}
                  {notification.data.estimated_delivery && (
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3 text-blue-600" />
                      <span className="text-blue-800">
                        {new Date(notification.data.estimated_delivery).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500">
                {formatDate(notification.created_at)}
              </span>
              {notification.data?.franchise_location && (
                <Badge variant="outline" className="text-xs">
                  {notification.data.franchise_location}
                </Badge>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex flex-col items-end gap-2">
          {!notification.read && (
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
          )}
          {!notification.read && (
            <Button
              size="sm"
              variant="ghost"
              onClick={(e) => {
                e.stopPropagation();
                onMarkAsRead(notification.id);
              }}
              className="text-xs h-6 px-2"
            >
              Mark Read
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationItem;
