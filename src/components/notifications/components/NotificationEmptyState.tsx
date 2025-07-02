
import React from 'react';
import { Bell, Package, Shield, Crown } from 'lucide-react';

interface NotificationEmptyStateProps {
  userRole?: string;
}

const NotificationEmptyState: React.FC<NotificationEmptyStateProps> = ({ userRole }) => {
  const getEmptyStateContent = () => {
    switch (userRole) {
      case 'owner':
        return {
          icon: <Crown className="h-12 w-12 text-yellow-400" />,
          title: "No Owner Notifications",
          description: "You'll receive updates about franchise applications, system alerts, and important business notifications here."
        };
      case 'admin':
        return {
          icon: <Shield className="h-12 w-12 text-blue-400" />,
          title: "No Admin Notifications",
          description: "You'll receive updates about new orders, inventory alerts, and franchise communications here."
        };
      case 'franchise':
        return {
          icon: <Package className="h-12 w-12 text-green-400" />,
          title: "No Messages Yet",
          description: "You'll receive updates about your orders, verifications, and communications from admin here."
        };
      default:
        return {
          icon: <Bell className="h-12 w-12 text-gray-400" />,
          title: "No Notifications",
          description: "You'll receive important updates and messages here."
        };
    }
  };

  const content = getEmptyStateContent();

  return (
    <div className="text-center py-12">
      <div className="flex justify-center mb-4">
        {content.icon}
      </div>
      <h3 className="text-lg font-semibold text-gray-800 mb-2">
        {content.title}
      </h3>
      <p className="text-gray-600 text-sm max-w-sm mx-auto">
        {content.description}
      </p>
    </div>
  );
};

export default NotificationEmptyState;
