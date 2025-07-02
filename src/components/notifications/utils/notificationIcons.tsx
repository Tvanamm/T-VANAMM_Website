
import React from 'react';
import { Crown, Shield, Users, User, UserCheck, AlertTriangle, MessageSquare, Bell } from 'lucide-react';

export const getRoleIcon = (role: string) => {
  switch (role) {
    case 'owner':
      return <Crown className="h-4 w-4 text-yellow-600" />;
    case 'admin':
      return <Shield className="h-4 w-4 text-blue-600" />;
    case 'franchise':
      return <Users className="h-4 w-4 text-green-600" />;
    default:
      return <User className="h-4 w-4 text-gray-600" />;
  }
};

export const getNotificationIcon = (type: string) => {
  switch (type) {
    case 'new_user':
      return <User className="h-4 w-4 text-blue-500" />;
    case 'role_assigned':
      return <UserCheck className="h-4 w-4 text-green-500" />;
    case 'verification_required':
    case 'verification_request':
      return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
    case 'admin_message':
    case 'owner_message':
    case 'franchise_message':
      return <MessageSquare className="h-4 w-4 text-purple-500" />;
    default:
      return <Bell className="h-4 w-4 text-gray-500" />;
  }
};

export const getRoleBadgeColor = (role: string) => {
  switch (role) {
    case 'owner':
      return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    case 'admin':
      return 'bg-blue-100 text-blue-800 border-blue-300';
    case 'franchise':
      return 'bg-green-100 text-green-800 border-green-300';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-300';
  }
};
