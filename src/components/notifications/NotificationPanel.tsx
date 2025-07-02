
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  Bell, 
  Send, 
  Eye, 
  User, 
  Users, 
  Search,
  MessageCircle,
  AlertCircle,
  Info,
  CheckCircle
} from 'lucide-react';

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  created_at: string;
  data?: any;
}

const NotificationPanel = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);
  
  // Send notification form
  const [sendToAll, setSendToAll] = useState(true);
  const [specificUser, setSpecificUser] = useState('');
  const [notificationTitle, setNotificationTitle] = useState('');
  const [notificationMessage, setNotificationMessage] = useState('');
  const [notificationType, setNotificationType] = useState('announcement');
  const [sending, setSending] = useState(false);

  const fetchNotifications = async () => {
    if (!user) return;
    
    try {
      let query = supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      // Strict role-based filtering - franchise users only see their own notifications
      if (user.role === 'franchise') {
        query = query.eq('user_id', user.id);
      } else if (user.role === 'admin') {
        query = query.or(`user_id.eq.${user.id},user_id.is.null`);
      } else if (user.role === 'owner') {
        // Owners see all notifications - no filter needed
      } else {
        query = query.eq('user_id', user.id);
      }

      const { data, error } = await query;

      if (error) throw error;
      console.log(`Fetched ${data?.length || 0} notifications for ${user.role} user`);
      setNotifications(data || []);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchNotifications();

    // Real-time subscription
    const channel = supabase
      .channel('notifications_panel')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'notifications'
      }, fetchNotifications)
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const sendNotification = async () => {
    if (!notificationTitle.trim() || !notificationMessage.trim()) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive"
      });
      return;
    }

    setSending(true);
    try {
      const notificationData = {
        type: notificationType,
        title: notificationTitle,
        message: notificationMessage,
        user_id: sendToAll ? null : specificUser || null,
        data: {
          from: user?.name,
          priority: 'normal',
          broadcast: sendToAll
        }
      };

      const { error } = await supabase
        .from('notifications')
        .insert(notificationData);

      if (error) throw error;

      toast({
        title: "Success",
        description: sendToAll ? "Notification sent to all users" : "Notification sent to specific user",
      });

      // Reset form
      setNotificationTitle('');
      setNotificationMessage('');
      setSpecificUser('');
      setSendToAll(true);
      setNotificationType('announcement');
    } catch (error) {
      console.error('Error sending notification:', error);
      toast({
        title: "Error",
        description: "Failed to send notification",
        variant: "destructive"
      });
    } finally {
      setSending(false);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true, read_at: new Date().toISOString() })
        .eq('id', notificationId);

      if (error) throw error;
      fetchNotifications();
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'announcement': return <Bell className="h-4 w-4" />;
      case 'alert': return <AlertCircle className="h-4 w-4" />;
      case 'info': return <Info className="h-4 w-4" />;
      case 'success': return <CheckCircle className="h-4 w-4" />;
      default: return <MessageCircle className="h-4 w-4" />;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'announcement': return 'bg-blue-100 text-blue-800';
      case 'alert': return 'bg-red-100 text-red-800';
      case 'info': return 'bg-gray-100 text-gray-800';
      case 'success': return 'bg-green-100 text-green-800';
      default: return 'bg-purple-100 text-purple-800';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <div className="w-6 h-6 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p>Loading notifications...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Send Notification Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Send className="h-5 w-5" />
            Send Notification
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <input
                type="radio"
                id="sendToAll"
                checked={sendToAll}
                onChange={() => setSendToAll(true)}
              />
              <label htmlFor="sendToAll" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Send to All Users
              </label>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="radio"
                id="sendToSpecific"
                checked={!sendToAll}
                onChange={() => setSendToAll(false)}
              />
              <label htmlFor="sendToSpecific" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Send to Specific User
              </label>
            </div>
          </div>

          {!sendToAll && (
            <div>
              <label className="text-sm font-medium mb-2 block">User Email or ID</label>
              <Input
                value={specificUser}
                onChange={(e) => setSpecificUser(e.target.value)}
                placeholder="Enter user email or ID..."
              />
            </div>
          )}

          <div>
            <label className="text-sm font-medium mb-2 block">Notification Type</label>
            <select
              value={notificationType}
              onChange={(e) => setNotificationType(e.target.value)}
              className="w-full p-2 border rounded-md"
            >
              <option value="announcement">Announcement</option>
              <option value="alert">Alert</option>
              <option value="info">Information</option>
              <option value="success">Success</option>
            </select>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Title</label>
            <Input
              value={notificationTitle}
              onChange={(e) => setNotificationTitle(e.target.value)}
              placeholder="Enter notification title..."
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Message</label>
            <Textarea
              value={notificationMessage}
              onChange={(e) => setNotificationMessage(e.target.value)}
              placeholder="Enter notification message..."
              rows={3}
            />
          </div>

          <Button
            onClick={sendNotification}
            disabled={sending}
            className="w-full"
          >
            {sending ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
            ) : (
              <Send className="h-4 w-4 mr-2" />
            )}
            Send Notification
          </Button>
        </CardContent>
      </Card>

      {/* Recent Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Recent Notifications
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-4 border rounded-lg cursor-pointer transition-colors hover:bg-gray-50 ${
                  !notification.read ? 'border-emerald-200 bg-emerald-50' : 'border-gray-200'
                }`}
                onClick={() => {
                  setSelectedNotification(notification);
                  if (!notification.read) {
                    markAsRead(notification.id);
                  }
                }}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="flex-shrink-0 mt-1">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold">{notification.title}</h3>
                        <Badge className={getNotificationColor(notification.type)}>
                          {notification.type}
                        </Badge>
                        {!notification.read && (
                          <Badge variant="destructive" className="text-xs">NEW</Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {notification.message}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(notification.created_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <Button size="sm" variant="ghost">
                    <Eye className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Notification Details Dialog */}
      <Dialog open={!!selectedNotification} onOpenChange={() => setSelectedNotification(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedNotification && getNotificationIcon(selectedNotification.type)}
              Notification Details
            </DialogTitle>
          </DialogHeader>
          {selectedNotification && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Badge className={getNotificationColor(selectedNotification.type)}>
                  {selectedNotification.type}
                </Badge>
                <span className="text-sm text-gray-500">
                  {new Date(selectedNotification.created_at).toLocaleString()}
                </span>
              </div>
              
              <div>
                <h3 className="font-semibold text-lg mb-2">{selectedNotification.title}</h3>
                <p className="text-gray-700 whitespace-pre-wrap">{selectedNotification.message}</p>
              </div>

              {selectedNotification.data && (
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium mb-2">Additional Details:</h4>
                  <pre className="text-sm text-gray-600 whitespace-pre-wrap">
                    {JSON.stringify(selectedNotification.data, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default NotificationPanel;
