
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Plus, 
  RefreshCw, 
  Download, 
  Settings, 
  Users, 
  Package,
  BarChart3,
  Bell,
  Mail,
  FileText
} from 'lucide-react';

interface QuickActionsProps {
  onAction: (action: string) => void;
}

const QuickActions = ({ onAction }: QuickActionsProps) => {
  const actions = [
    { id: 'add-product', label: 'Add Product', icon: Plus, color: 'bg-emerald-500 hover:bg-emerald-600' },
    { id: 'bulk-update', label: 'Bulk Update', icon: RefreshCw, color: 'bg-blue-500 hover:bg-blue-600' },
    { id: 'export-data', label: 'Export Data', icon: Download, color: 'bg-purple-500 hover:bg-purple-600' },
    { id: 'manage-franchise', label: 'Manage Franchise', icon: Users, color: 'bg-orange-500 hover:bg-orange-600' },
    { id: 'inventory-check', label: 'Inventory Check', icon: Package, color: 'bg-teal-500 hover:bg-teal-600' },
    { id: 'generate-report', label: 'Generate Report', icon: FileText, color: 'bg-indigo-500 hover:bg-indigo-600' },
    { id: 'send-notifications', label: 'Send Notifications', icon: Bell, color: 'bg-red-500 hover:bg-red-600' },
    { id: 'system-settings', label: 'System Settings', icon: Settings, color: 'bg-gray-500 hover:bg-gray-600' }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-emerald-600" />
          Quick Actions
        </CardTitle>
        <CardDescription>Frequently used operations for efficient management</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {actions.map((action) => (
            <Button
              key={action.id}
              onClick={() => onAction(action.id)}
              className={`${action.color} text-white border-0 h-auto p-4 flex flex-col items-center gap-2 transition-all duration-200 transform hover:scale-105`}
            >
              <action.icon className="h-5 w-5" />
              <span className="text-xs font-medium">{action.label}</span>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default QuickActions;
