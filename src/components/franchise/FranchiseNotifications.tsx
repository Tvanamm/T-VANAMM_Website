
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Bell, User, UserCheck, Clock, CheckCircle, AlertTriangle, ExternalLink, Shield, MessageSquare, CreditCard, FileText } from 'lucide-react';
import { useRealTimeNotifications } from '@/hooks/useRealTimeNotifications';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const FranchiseNotifications = () => {
  const { notifications, loading, markAsRead, markAllAsRead, unreadCount } = useRealTimeNotifications();
  const { user } = useAuth();
  const navigate = useNavigate();

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'new_user':
        return <User className="h-4 w-4 text-blue-500" />;
      case 'role_assigned':
        return <UserCheck className="h-4 w-4 text-green-500" />;
      case 'verification_update':
      case 'verification_request':
        return <CheckCircle className="h-4 w-4 text-emerald-500" />;
      case 'verification_required':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'aadhar_submitted':
      case 'aadhar_verified':
        return <Shield className="h-4 w-4 text-blue-500" />;
      case 'owner_message':
      case 'admin_message':
        return <MessageSquare className="h-4 w-4 text-purple-500" />;
      case 'payment_update':
        return <CreditCard className="h-4 w-4 text-green-500" />;
      case 'new_franchise_member':
        return <FileText className="h-4 w-4 text-orange-500" />;
      default:
        return <Bell className="h-4 w-4 text-gray-500" />;
    }
  };

  const getNotificationPriority = (notification: any) => {
    if (['verification_required', 'role_assigned'].includes(notification.type) && notification.data?.requires_verification) {
      return 'high';
    }
    if (['verification_update', 'aadhar_verified', 'owner_message'].includes(notification.type)) {
      return 'medium';
    }
    return 'normal';
  };

  const handleNotificationAction = async (notification: any) => {
    await markAsRead(notification.id);
    
    // Handle specific actions based on notification type
    if (notification.type === 'role_assigned' && notification.data?.requires_verification) {
      navigate('/franchise-profile', { replace: true });
    } else if (notification.type === 'verification_request') {
      navigate('/franchise-profile', { replace: true });
    } else if (notification.type === 'aadhar_submitted') {
      navigate('/franchise-profile', { replace: true });
    }
  };

  const formatNotificationTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays}d ago`;
    }
  };

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
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            My Notifications
            {unreadCount > 0 && (
              <Badge variant="destructive" className="ml-2">
                {unreadCount}
              </Badge>
            )}
          </CardTitle>
          {unreadCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={markAllAsRead}
              className="text-emerald-600 border-emerald-600 hover:bg-emerald-50"
            >
              Mark All Read
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[500px]">
          <div className="space-y-3">
            {notifications.length === 0 ? (
              <div className="text-center py-8">
                <Bell className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No notifications yet</p>
                <p className="text-sm text-gray-400 mt-1">
                  You'll receive updates about your verification status, messages from administrators, and important announcements here.
                </p>
              </div>
            ) : (
              notifications.map((notification) => {
                const priority = getNotificationPriority(notification);
                const requiresAction = ['role_assigned', 'verification_request'].includes(notification.type) && 
                                     notification.data?.requires_verification && !notification.read;
                
                return (
                  <div
                    key={notification.id}
                    className={`p-4 rounded-lg border transition-all hover:shadow-md cursor-pointer ${
                      notification.read 
                        ? 'bg-gray-50 border-gray-200' 
                        : priority === 'high'
                        ? 'bg-red-50 border-red-200 shadow-sm'
                        : priority === 'medium'
                        ? 'bg-yellow-50 border-yellow-200'
                        : 'bg-emerald-50 border-emerald-200'
                    }`}
                    onClick={() => !notification.read && markAsRead(notification.id)}
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-1 flex-shrink-0">
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <h4 className="font-semibold text-sm mb-1 pr-2">{notification.title}</h4>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <span className="text-xs text-gray-500">
                              {formatNotificationTime(notification.created_at)}
                            </span>
                            {!notification.read && (
                              <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                            )}
                          </div>
                        </div>
                        
                        <p className="text-sm text-gray-600 mb-2 leading-relaxed">{notification.message}</p>
                        
                        {/* Show additional data if available */}
                        {notification.data && (
                          <div className="mb-2 space-y-1">
                            {notification.data.verification_type && (
                              <Badge variant="outline" className="text-xs">
                                {notification.data.verification_type === 'franchise_member' 
                                  ? 'Franchise Verification' 
                                  : 'Admin Verification'}
                              </Badge>
                            )}
                            {notification.data.franchise_location && (
                              <div className="text-xs text-gray-500">
                                Location: {notification.data.franchise_location}
                              </div>
                            )}
                          </div>
                        )}
                        
                        {requiresAction && (
                          <div className="mt-3">
                            <Button
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleNotificationAction(notification);
                              }}
                              className="bg-emerald-600 hover:bg-emerald-700 text-white"
                            >
                              <ExternalLink className="h-3 w-3 mr-1" />
                              Take Action
                            </Button>
                          </div>
                        )}
                        
                        {/* Special styling for owner messages */}
                        {['owner_message', 'admin_message'].includes(notification.type) && (
                          <div className="mt-2 p-2 bg-purple-50 border border-purple-200 rounded text-sm">
                            <div className="flex items-center gap-1 text-purple-700 font-medium">
                              <MessageSquare className="h-3 w-3" />
                              Official Message
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default FranchiseNotifications;
