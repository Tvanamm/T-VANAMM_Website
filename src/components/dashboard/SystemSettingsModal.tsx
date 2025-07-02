
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

interface SystemSettingsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const SystemSettingsModal = ({ open, onOpenChange }: SystemSettingsModalProps) => {
  const { toast } = useToast();
  const [settings, setSettings] = useState({
    siteName: 'Tvanamm',
    maintenanceMode: false
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // TODO: Implement with Neon DB
    console.log('Update system settings:', settings);
    
    toast({
      title: "Info",
      description: "System settings will be available with Neon DB implementation",
    });
    
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>System Settings</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="siteName">Site Name</Label>
            <Input
              id="siteName"
              value={settings.siteName}
              onChange={(e) => setSettings(prev => ({ ...prev, siteName: e.target.value }))}
            />
          </div>
          
          <div className="flex gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">
              Save Settings
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default SystemSettingsModal;
