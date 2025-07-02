
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { useRealTimeNotifications } from '@/hooks/useRealTimeNotifications';
import { useToast } from '@/hooks/use-toast';
import { Send, Search, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface EnhancedSendNotificationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const EnhancedSendNotificationModal: React.FC<EnhancedSendNotificationModalProps> = ({
  open,
  onOpenChange
}) => {
  const { user } = useAuth();
  const { createNotification } = useRealTimeNotifications();
  const { toast } = useToast();
  
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [notificationForm, setNotificationForm] = useState({
    type: 'general',
    title: '',
    message: '',
    targetType: 'all' // 'all', 'role', 'specific'
  });
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (open) {
      fetchUsers();
    }
  }, [open]);

  useEffect(() => {
    if (searchTerm) {
      const filtered = users.filter(u => 
        u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredUsers(filtered);
    } else {
      setFilteredUsers([]);
    }
  }, [searchTerm, users]);

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, name, email, role')
        .order('name');

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
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
      let targetUserId = undefined;
      let targetData: any = {
        target_type: notificationForm.targetType,
        sender_name: user?.name,
        sender_role: user?.role
      };

      if (notificationForm.targetType === 'specific' && selectedUser) {
        targetUserId = selectedUser.id;
        // Add target user info to the data object properly
        targetData = {
          ...targetData,
          target_user: {
            id: selectedUser.id,
            name: selectedUser.name,
            email: selectedUser.email
          }
        };
      }

      const success = await createNotification(
        notificationForm.type,
        notificationForm.title,
        notificationForm.message,
        targetUserId,
        targetData
      );

      if (success) {
        toast({
          title: "Success",
          description: `Notification sent successfully${selectedUser ? ` to ${selectedUser.name}` : ''}`,
        });
        onOpenChange(false);
        // Reset form
        setNotificationForm({
          type: 'general',
          title: '',
          message: '',
          targetType: 'all'
        });
        setSelectedUser(null);
        setSearchTerm('');
      }
    } catch (error) {
      console.error('Error sending notification:', error);
    } finally {
      setSending(false);
    }
  };

  const selectUser = (user: User) => {
    setSelectedUser(user);
    setSearchTerm(user.name);
    setFilteredUsers([]);
  };

  const clearUser = () => {
    setSelectedUser(null);
    setSearchTerm('');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Send className="h-5 w-5" />
            Send Notification
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Target Selection */}
          <div>
            <label className="text-sm font-medium mb-2 block">Send To</label>
            <Select
              value={notificationForm.targetType}
              onValueChange={(value) => {
                setNotificationForm(prev => ({ ...prev, targetType: value }));
                if (value !== 'specific') {
                  setSelectedUser(null);
                  setSearchTerm('');
                }
              }}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Everyone</SelectItem>
                <SelectItem value="role">By Role</SelectItem>
                <SelectItem value="specific">Specific User</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* User Search for Specific Target */}
          {notificationForm.targetType === 'specific' && (
            <div className="relative">
              <label className="text-sm font-medium mb-2 block">Search User</label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-10"
                />
                {selectedUser && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-1 top-1 h-8 w-8 p-0"
                    onClick={clearUser}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>

              {/* Search Results */}
              {filteredUsers.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto">
                  {filteredUsers.map((user) => (
                    <div
                      key={user.id}
                      className="p-3 hover:bg-gray-50 cursor-pointer border-b last:border-b-0"
                      onClick={() => selectUser(user)}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{user.name}</p>
                          <p className="text-sm text-gray-500">{user.email}</p>
                        </div>
                        <Badge variant="outline">{user.role}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Selected User */}
              {selectedUser && (
                <div className="mt-2 p-3 bg-blue-50 rounded-md">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-blue-900">{selectedUser.name}</p>
                      <p className="text-sm text-blue-600">{selectedUser.email}</p>
                    </div>
                    <Badge variant="outline">{selectedUser.role}</Badge>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Notification Type */}
          <div>
            <label className="text-sm font-medium mb-2 block">Type</label>
            <Select
              value={notificationForm.type}
              onValueChange={(value) => setNotificationForm(prev => ({ ...prev, type: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="general">General</SelectItem>
                <SelectItem value="alert">Alert</SelectItem>
                <SelectItem value="announcement">Announcement</SelectItem>
                <SelectItem value="system">System</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Title */}
          <div>
            <label className="text-sm font-medium mb-2 block">Title</label>
            <Input
              placeholder="Notification title"
              value={notificationForm.title}
              onChange={(e) => setNotificationForm(prev => ({ ...prev, title: e.target.value }))}
            />
          </div>

          {/* Message */}
          <div>
            <label className="text-sm font-medium mb-2 block">Message</label>
            <Textarea
              placeholder="Notification message"
              value={notificationForm.message}
              onChange={(e) => setNotificationForm(prev => ({ ...prev, message: e.target.value }))}
              rows={4}
            />
          </div>

          {/* Preview */}
          {notificationForm.title && notificationForm.message && (
            <div className="p-4 bg-gray-50 rounded-md">
              <h4 className="font-medium mb-2">Preview:</h4>
              <div className="bg-white p-3 rounded border">
                <h5 className="font-semibold">{notificationForm.title}</h5>
                <p className="text-sm text-gray-600 mt-1">{notificationForm.message}</p>
                <p className="text-xs text-gray-400 mt-2">
                  To: {notificationForm.targetType === 'specific' && selectedUser 
                    ? selectedUser.name 
                    : notificationForm.targetType === 'all' 
                    ? 'Everyone' 
                    : 'By Role'}
                </p>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleSendNotification} 
              disabled={sending || !notificationForm.title || !notificationForm.message}
            >
              {sending ? 'Sending...' : 'Send Notification'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EnhancedSendNotificationModal;
