
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Settings, Bell, Shield, Database, Globe, Mail, Smartphone } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const OwnerSystemSettings = () => {
  const { toast } = useToast();
  const [settings, setSettings] = useState({
    // General Settings
    companyName: 'Franchise Business',
    companyEmail: 'admin@franchise.com',
    companyPhone: '+91 9876543210',
    companyAddress: 'Business District, Mumbai',
    
    // Notification Settings
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true,
    notificationFrequency: 'real-time',
    
    // Security Settings
    twoFactorAuth: false,
    sessionTimeout: '24',
    passwordPolicy: 'strong',
    loginAttempts: '3',
    
    // Business Settings
    businessHours: '9:00 AM - 6:00 PM',
    timezone: 'Asia/Kolkata',
    currency: 'INR',
    language: 'en',
    
    // System Settings
    autoBackup: true,
    backupFrequency: 'daily',
    maintenanceMode: false,
    debugMode: false
  });

  const handleSettingChange = (key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSaveSettings = () => {
    // TODO: Implement with Neon DB
    console.log('Saving settings:', settings);
    toast({
      title: "Settings Saved",
      description: "System settings will be saved when Neon DB is implemented"
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            System Settings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="general" className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="general">General</TabsTrigger>
              <TabsTrigger value="notifications">Notifications</TabsTrigger>
              <TabsTrigger value="security">Security</TabsTrigger>
              <TabsTrigger value="business">Business</TabsTrigger>
              <TabsTrigger value="system">System</TabsTrigger>
            </TabsList>

            <TabsContent value="general" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="companyName">Company Name</Label>
                    <Input
                      id="companyName"
                      value={settings.companyName}
                      onChange={(e) => handleSettingChange('companyName', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="companyEmail">Company Email</Label>
                    <Input
                      id="companyEmail"
                      type="email"
                      value={settings.companyEmail}
                      onChange={(e) => handleSettingChange('companyEmail', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="companyPhone">Company Phone</Label>
                    <Input
                      id="companyPhone"
                      value={settings.companyPhone}
                      onChange={(e) => handleSettingChange('companyPhone', e.target.value)}
                    />
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="companyAddress">Company Address</Label>
                    <Textarea
                      id="companyAddress"
                      value={settings.companyAddress}
                      onChange={(e) => handleSettingChange('companyAddress', e.target.value)}
                      rows={3}
                    />
                  </div>
                  <div>
                    <Label htmlFor="language">Default Language</Label>
                    <Select value={settings.language} onValueChange={(value) => handleSettingChange('language', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="hi">Hindi</SelectItem>
                        <SelectItem value="mr">Marathi</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="notifications" className="space-y-6">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      Email Notifications
                    </Label>
                    <p className="text-sm text-gray-600">Receive notifications via email</p>
                  </div>
                  <Switch
                    checked={settings.emailNotifications}
                    onCheckedChange={(checked) => handleSettingChange('emailNotifications', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label className="flex items-center gap-2">
                      <Smartphone className="h-4 w-4" />
                      SMS Notifications
                    </Label>
                    <p className="text-sm text-gray-600">Receive notifications via SMS</p>
                  </div>
                  <Switch
                    checked={settings.smsNotifications}
                    onCheckedChange={(checked) => handleSettingChange('smsNotifications', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label className="flex items-center gap-2">
                      <Bell className="h-4 w-4" />
                      Push Notifications
                    </Label>
                    <p className="text-sm text-gray-600">Receive browser push notifications</p>
                  </div>
                  <Switch
                    checked={settings.pushNotifications}
                    onCheckedChange={(checked) => handleSettingChange('pushNotifications', checked)}
                  />
                </div>

                <div>
                  <Label>Notification Frequency</Label>
                  <Select value={settings.notificationFrequency} onValueChange={(value) => handleSettingChange('notificationFrequency', value)}>
                    <SelectTrigger className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="real-time">Real-time</SelectItem>
                      <SelectItem value="hourly">Hourly</SelectItem>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="security" className="space-y-6">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label className="flex items-center gap-2">
                      <Shield className="h-4 w-4" />
                      Two-Factor Authentication
                    </Label>
                    <p className="text-sm text-gray-600">Add an extra layer of security</p>
                  </div>
                  <Switch
                    checked={settings.twoFactorAuth}
                    onCheckedChange={(checked) => handleSettingChange('twoFactorAuth', checked)}
                  />
                </div>

                <div>
                  <Label htmlFor="sessionTimeout">Session Timeout (hours)</Label>
                  <Input
                    id="sessionTimeout"
                    type="number"
                    value={settings.sessionTimeout}
                    onChange={(e) => handleSettingChange('sessionTimeout', e.target.value)}
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label>Password Policy</Label>
                  <Select value={settings.passwordPolicy} onValueChange={(value) => handleSettingChange('passwordPolicy', value)}>
                    <SelectTrigger className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="basic">Basic (6+ characters)</SelectItem>
                      <SelectItem value="strong">Strong (8+ with symbols)</SelectItem>
                      <SelectItem value="complex">Complex (12+ mixed case)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="loginAttempts">Max Login Attempts</Label>
                  <Input
                    id="loginAttempts"
                    type="number"
                    value={settings.loginAttempts}
                    onChange={(e) => handleSettingChange('loginAttempts', e.target.value)}
                    className="mt-2"
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="business" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="businessHours">Business Hours</Label>
                    <Input
                      id="businessHours"
                      value={settings.businessHours}
                      onChange={(e) => handleSettingChange('businessHours', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>Timezone</Label>
                    <Select value={settings.timezone} onValueChange={(value) => handleSettingChange('timezone', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Asia/Kolkata">Asia/Kolkata (IST)</SelectItem>
                        <SelectItem value="UTC">UTC</SelectItem>
                        <SelectItem value="America/New_York">America/New_York (EST)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <Label>Currency</Label>
                    <Select value={settings.currency} onValueChange={(value) => handleSettingChange('currency', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="INR">Indian Rupee (₹)</SelectItem>
                        <SelectItem value="USD">US Dollar ($)</SelectItem>
                        <SelectItem value="EUR">Euro (€)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="system" className="space-y-6">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label className="flex items-center gap-2">
                      <Database className="h-4 w-4" />
                      Auto Backup
                    </Label>
                    <p className="text-sm text-gray-600">Automatically backup system data</p>
                  </div>
                  <Switch
                    checked={settings.autoBackup}
                    onCheckedChange={(checked) => handleSettingChange('autoBackup', checked)}
                  />
                </div>

                <div>
                  <Label>Backup Frequency</Label>
                  <Select value={settings.backupFrequency} onValueChange={(value) => handleSettingChange('backupFrequency', value)}>
                    <SelectTrigger className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hourly">Hourly</SelectItem>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label>Maintenance Mode</Label>
                    <p className="text-sm text-gray-600">Put system in maintenance mode</p>
                  </div>
                  <Switch
                    checked={settings.maintenanceMode}
                    onCheckedChange={(checked) => handleSettingChange('maintenanceMode', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label>Debug Mode</Label>
                    <p className="text-sm text-gray-600">Enable debug logging</p>
                  </div>
                  <Switch
                    checked={settings.debugMode}
                    onCheckedChange={(checked) => handleSettingChange('debugMode', checked)}
                  />
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <div className="mt-8 flex justify-end">
            <Button onClick={handleSaveSettings} className="bg-emerald-600 hover:bg-emerald-700">
              Save Settings
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OwnerSystemSettings;
