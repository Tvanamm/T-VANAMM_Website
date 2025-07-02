
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

interface SendNotificationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const SendNotificationModal = ({ open, onOpenChange }: SendNotificationModalProps) => {
  const { toast } = useToast();
  const [notification, setNotification] = useState({
    title: '',
    message: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // TODO: Implement with Neon DB
    console.log('Send notification:', notification);
    
    toast({
      title: "Info",
      description: "Notification system will be available with Neon DB implementation",
    });
    
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Send Notification</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={notification.title}
              onChange={(e) => setNotification(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Notification title"
            />
          </div>
          
          <div>
            <Label htmlFor="message">Message</Label>
            <Textarea
              id="message"
              value={notification.message}
              onChange={(e) => setNotification(prev => ({ ...prev, message: e.target.value }))}
              placeholder="Notification message"
              rows={4}
            />
          </div>
          
          <div className="flex gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">
              Send Notification
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default SendNotificationModal;
