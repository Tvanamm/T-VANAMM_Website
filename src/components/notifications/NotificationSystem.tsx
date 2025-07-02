
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { useRealTimeNotifications } from '@/hooks/useRealTimeNotifications';
import { useToast } from '@/hooks/use-toast';
import { Send, Bell, Users, AlertTriangle } from 'lucide-react';

const NotificationSystem = () => {
  const { user } = useAuth();
  const { createNotification } = useRealTimeNotifications();
  const { toast } = useToast();
  
  const [notificationForm, setNotificationForm] = useState({
    type: 'general',
    title: '',
    message: '',
    targetRole: 'all',
    targetUserId: ''
  });
  const [sending, setSending] = useState(false);

  const getRoleOptions = () => {
    if (user?.role === 'owner') {
      return [
        { value: 'all', label: 'Everyone' },
        { value: 'admin', label: 'All Admins' },
        { value: 'franchise', label: 'All Franchises' },
        { value: 'customer', label: 'All Customers' }
      ];
    } else if (user?.role === 'admin') {
      return [
        { value: 'franchise', label: 'All Franchises' },
        { value: 'customer', label: 'All Customers' }
      ];
    } else if (user?.role === 'franchise') {
      return [
        { value: 'admin', label: 'Admins Only' }
      ];
    }
    return [];
  };

  const handleSendNotification = async () => {
    if (!notificationForm.title || !notificationForm.message) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    setSending(true);
    try {
      const success = await createNotification(
        notificationForm.type,
        notificationForm.title,
        notificationForm.message,
        notificationForm.targetUserId || undefined,
        {
          target_role: notificationForm.targetRole,
          sender_name: user?.name,
          sender_role: user?.role
        }
      );

      if (success) {
        toast({
          title: "Success",
          description: "Notification sent successfully",
        });
        setNotificationForm({
          type: 'general',
          title: '',
          message: '',
          targetRole: 'all',
          targetUserId: ''
        });
      }
    } catch (error) {
      console.error('Error sending notification:', error);
    } finally {
      setSending(false);
    }
  };

  const notificationTypes = [
    { value: 'general', label: 'General', icon: Bell },
    { value: 'alert', label: 'Alert', icon: AlertTriangle },
    { value: 'announcement', label: 'Announcement', icon: Users }
  ];

  if (!user || !['owner', 'admin', 'franchise'].includes(user.role)) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">You don't have permission to send notifications.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Send className="h-5 w-5" />
          Send Notification
          <Badge variant="outline" className="ml-2">
            {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Notification Type</label>
            <Select
              value={notificationForm.type}
              onValueChange={(value) => setNotificationForm(prev => ({ ...prev, type: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {notificationTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    <div className="flex items-center gap-2">
                      <type.icon className="h-4 w-4" />
                      {type.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Send To</label>
            <Select
              value={notificationForm.targetRole}
              onValueChange={(value) => setNotificationForm(prev => ({ ...prev, targetRole: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {getRoleOptions().map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <label className="text-sm font-medium mb-2 block">Title *</label>
          <Input
            placeholder="Enter notification title"
            value={notificationForm.title}
            onChange={(e) => setNotificationForm(prev => ({ ...prev, title: e.target.value }))}
          />
        </div>

        <div>
          <label className="text-sm font-medium mb-2 block">Message *</label>
          <Textarea
            placeholder="Enter your message"
            value={notificationForm.message}
            onChange={(e) => setNotificationForm(prev => ({ ...prev, message: e.target.value }))}
            rows={4}
          />
        </div>

        <Button 
          onClick={handleSendNotification}
          disabled={sending}
          className="w-full"
        >
          <Send className="h-4 w-4 mr-2" />
          {sending ? 'Sending...' : 'Send Notification'}
        </Button>
      </CardContent>
    </Card>
  );
};

export default NotificationSystem;
