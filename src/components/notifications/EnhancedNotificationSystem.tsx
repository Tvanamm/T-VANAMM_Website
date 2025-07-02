
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Bell, Reply, Send, Trash2, MessageSquare, Eye } from 'lucide-react';

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  user_id?: string;
  parent_id?: string;
  reply_to?: string;
  is_reply: boolean;
  data?: any;
  created_at: string;
  read_at?: string;
}

const EnhancedNotificationSystem = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [isReplyModalOpen, setIsReplyModalOpen] = useState(false);
  const [replyingTo, setReplyingTo] = useState<Notification | null>(null);
  const [replyMessage, setReplyMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const fetchNotifications = async () => {
    if (!user) return;

    try {
      console.log('Fetching notifications for user:', user.id, 'role:', user.role);
      
      let query = supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false });

      // Filter based on user role and ownership
      if (user.role === 'franchise') {
        // Franchise users see notifications meant for them OR general notifications
        query = query.or(`user_id.eq.${user.id},user_id.is.null`);
      } else if (['admin', 'owner'].includes(user.role)) {
        // Admin/owner can see all notifications + their specific ones
        query = query.or(`user_id.eq.${user.id},user_id.is.null,data->>target_role.eq.${user.role}`);
      } else {
        // Regular users only see their own notifications
        query = query.eq('user_id', user.id);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching notifications:', error);
        throw error;
      }
      
      console.log('Fetched notifications:', data?.length);
      setNotifications(data || []);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      toast({
        title: "Error",
        description: "Failed to load notifications",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();

    // Real-time subscription
    const channel = supabase
      .channel('notifications_realtime')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'notifications'
      }, (payload) => {
        console.log('Real-time notification update:', payload);
        fetchNotifications();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const markAsRead = async (notificationId: string) => {
    try {
      console.log('Marking notification as read:', notificationId);
      
      // Only mark as read if the notification belongs to current user or is a general notification
      const notification = notifications.find(n => n.id === notificationId);
      if (!notification) return;

      // Check if user can mark this notification as read
      const canMarkAsRead = 
        notification.user_id === user?.id || 
        notification.user_id === null || 
        ['admin', 'owner'].includes(user?.role || '');

      if (!canMarkAsRead) {
        toast({
          title: "Access Denied",
          description: "You cannot mark this notification as read",
          variant: "destructive"
        });
        return;
      }

      const { error } = await supabase
        .from('notifications')
        .update({ read: true, read_at: new Date().toISOString() })
        .eq('id', notificationId);

      if (error) throw error;

      setNotifications(prev => 
        prev.map(notif => 
          notif.id === notificationId ? { ...notif, read: true } : notif
        )
      );
    } catch (error) {
      console.error('Error marking as read:', error);
      toast({
        title: "Error",
        description: "Failed to mark as read",
        variant: "destructive"
      });
    }
  };

  const markAllAsRead = async () => {
    try {
      // Only mark notifications that belong to the current user or are general
      const userNotifications = notifications.filter(n => 
        !n.read && (n.user_id === user?.id || n.user_id === null)
      );
      
      if (userNotifications.length === 0) {
        toast({
          title: "Info",
          description: "No unread notifications"
        });
        return;
      }

      const notificationIds = userNotifications.map(n => n.id);
      console.log('Marking notifications as read:', notificationIds);
      
      const { error } = await supabase
        .from('notifications')
        .update({ read: true, read_at: new Date().toISOString() })
        .in('id', notificationIds);

      if (error) throw error;

      setNotifications(prev => 
        prev.map(notif => 
          notificationIds.includes(notif.id) ? { ...notif, read: true } : notif
        )
      );

      toast({
        title: "Success",
        description: "All notifications marked as read"
      });
    } catch (error) {
      console.error('Error marking all as read:', error);
      toast({
        title: "Error",
        description: "Failed to mark all as read",
        variant: "destructive"
      });
    }
  };

  const deleteNotification = async (notificationId: string) => {
    try {
      console.log('Deleting notification:', notificationId);
      
      // Check if user can delete this notification
      const notification = notifications.find(n => n.id === notificationId);
      if (!notification) return;

      const canDelete = 
        notification.user_id === user?.id || 
        ['admin', 'owner'].includes(user?.role || '');

      if (!canDelete) {
        toast({
          title: "Access Denied", 
          description: "You cannot delete this notification",
          variant: "destructive"
        });
        return;
      }

      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId);

      if (error) throw error;

      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      
      toast({
        title: "Success",
        description: "Notification deleted"
      });
    } catch (error) {
      console.error('Error deleting notification:', error);
      toast({
        title: "Error",
        description: "Failed to delete notification",
        variant: "destructive"
      });
    }
  };

  const sendReply = async () => {
    if (!replyingTo || !replyMessage.trim()) {
      toast({
        title: "Error",
        description: "Please enter a reply message",
        variant: "destructive"
      });
      return;
    }

    try {
      console.log('Sending reply to notification:', replyingTo.id);
      
      // Determine the target user ID for the reply
      let targetUserId = null;
      
      // If replying to a notification from a franchise member, send reply to that user
      if (replyingTo.data?.sender_id && replyingTo.data?.sender_id !== user?.id) {
        targetUserId = replyingTo.data.sender_id;
      } 
      // If replying to a general notification, send to the original user who created it
      else if (replyingTo.user_id && replyingTo.user_id !== user?.id) {
        targetUserId = replyingTo.user_id;
      }
      // If it's a system notification, send to admins/owners
      else if (!replyingTo.data?.sender_id && ['franchise'].includes(user?.role || '')) {
        // For franchise users replying to system notifications, send to owners
        const { data: ownerProfiles } = await supabase
          .from('profiles')
          .select('id')
          .eq('role', 'owner')
          .limit(1);
        
        if (ownerProfiles && ownerProfiles.length > 0) {
          targetUserId = ownerProfiles[0].id;
        }
      }

      const { error } = await supabase
        .from('notifications')
        .insert([{
          type: 'reply',
          title: `Re: ${replyingTo.title}`,
          message: replyMessage,
          user_id: targetUserId,
          parent_id: replyingTo.parent_id || replyingTo.id,
          reply_to: replyingTo.id,
          is_reply: true,
          data: {
            sender_name: user?.name || `${user?.role} User`,
            sender_id: user?.id,
            sender_role: user?.role,
            original_message: replyingTo.message,
            replied_at: new Date().toISOString()
          }
        }]);

      if (error) {
        console.error('Error sending reply:', error);
        throw error;
      }

      toast({
        title: "Success",
        description: "Reply sent successfully"
      });

      setIsReplyModalOpen(false);
      setReplyingTo(null);
      setReplyMessage('');
      fetchNotifications();
    } catch (error) {
      console.error('Error sending reply:', error);
      toast({
        title: "Error",
        description: "Failed to send reply",
        variant: "destructive"
      });
    }
  };

  const openReplyModal = (notification: Notification) => {
    console.log('Opening reply modal for notification:', notification);
    setReplyingTo(notification);
    setIsReplyModalOpen(true);
  };

  const filteredNotifications = notifications.filter(notif =>
    notif.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    notif.message.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const unreadCount = filteredNotifications.filter(n => !n.read).length;

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
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notifications
              {unreadCount > 0 && (
                <Badge variant="destructive">
                  {unreadCount} unread
                </Badge>
              )}
            </CardTitle>
            {unreadCount > 0 && (
              <Button onClick={markAllAsRead} size="sm">
                Mark All Read
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <Input
              placeholder="Search notifications..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>

          <div className="space-y-3 max-h-96 overflow-y-auto">
            {filteredNotifications.length === 0 ? (
              <div className="text-center py-8">
                <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No notifications found</p>
              </div>
            ) : (
              filteredNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 rounded-lg border transition-all ${
                    notification.read ? 'bg-gray-50' : 'bg-blue-50 border-blue-200'
                  } ${notification.is_reply ? 'ml-6 border-l-4 border-l-green-500' : ''}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-sm">{notification.title}</h4>
                        {notification.is_reply && (
                          <Badge variant="outline" className="text-xs">
                            <Reply className="h-3 w-3 mr-1" />
                            Reply
                          </Badge>
                        )}
                        {!notification.read && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{notification.message}</p>
                      <div className="flex items-center justify-between">
                        <p className="text-xs text-gray-500">
                          {new Date(notification.created_at).toLocaleString()}
                          {notification.data?.sender_name && (
                            <span className="ml-2">
                              from {notification.data.sender_name}
                            </span>
                          )}
                        </p>
                        <div className="flex items-center gap-2">
                          {!notification.read && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => markAsRead(notification.id)}
                            >
                              <Eye className="h-3 w-3 mr-1" />
                              Read
                            </Button>
                          )}
                          {['admin', 'owner'].includes(user?.role || '') && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => openReplyModal(notification)}
                              className="text-green-600 hover:text-green-700"
                            >
                              <Reply className="h-3 w-3 mr-1" />
                              Reply
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => deleteNotification(notification.id)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Reply Modal */}
      <Dialog open={isReplyModalOpen} onOpenChange={setIsReplyModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Reply to Message
            </DialogTitle>
          </DialogHeader>
          {replyingTo && (
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm font-medium mb-2">Original Message:</p>
                <p className="text-sm text-gray-600 mb-2">{replyingTo.message}</p>
                <p className="text-xs text-gray-500">
                  From: {replyingTo.data?.sender_name || 'System'} - {new Date(replyingTo.created_at).toLocaleString()}
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Your Reply:</label>
                <Textarea
                  value={replyMessage}
                  onChange={(e) => setReplyMessage(e.target.value)}
                  placeholder="Type your reply here..."
                  rows={4}
                />
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsReplyModalOpen(false);
                    setReplyMessage('');
                    setReplyingTo(null);
                  }}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={sendReply}
                  disabled={!replyMessage.trim()}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                >
                  <Send className="h-4 w-4 mr-2" />
                  Send Reply
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EnhancedNotificationSystem;
