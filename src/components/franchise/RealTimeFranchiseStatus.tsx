
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  CheckCircle, Clock, Shield, AlertTriangle, 
  User, MapPin, Phone, Mail, FileText, Activity 
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useEnhancedFranchiseOnboarding } from '@/hooks/useEnhancedFranchiseOnboarding';

const RealTimeFranchiseStatus = () => {
  const { user } = useAuth();
  const { franchiseMembers, notifications } = useEnhancedFranchiseOnboarding();

  // Find current user's franchise member record
  const currentMember = franchiseMembers.find(member => 
    member.user_id === user?.id || member.email === user?.email
  );

  // Get user-specific notifications
  const userNotifications = notifications.filter(notification => 
    notification.user_id === user?.id || notification.franchise_member_id === currentMember?.id
  ).slice(0, 5);

  if (!currentMember) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <User className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Franchise Application Found</h3>
          <p className="text-gray-600 mb-4">
            You haven't submitted a franchise application yet.
          </p>
          <Button className="bg-emerald-600 hover:bg-emerald-700">
            Apply for Franchise
          </Button>
        </CardContent>
      </Card>
    );
  }

  const getStatusProgress = (status: string) => {
    switch (status) {
      case 'pending': return 25;
      case 'approved': return 75;
      case 'verified': return 100;
      case 'rejected': return 0;
      default: return 0;
    }
  };

  const getStatusIcon = (status: string) => {
    if (status === 'verified') {
      return <CheckCircle className="h-5 w-5 text-green-600" />;
    } else if (status === 'approved') {
      return <Shield className="h-5 w-5 text-blue-600" />;
    } else if (status === 'pending') {
      return <Clock className="h-5 w-5 text-yellow-600" />;
    } else if (status === 'rejected') {
      return <AlertTriangle className="h-5 w-5 text-red-600" />;
    }
    return <Clock className="h-5 w-5 text-gray-600" />;
  };

  const getStatusMessage = (status: string) => {
    if (status === 'verified') {
      return 'Your franchise application is fully verified. You have complete access to the franchise dashboard.';
    } else if (status === 'approved') {
      return 'Your application has been approved! You now have access to your franchise dashboard.';
    } else if (status === 'pending') {
      return 'Your franchise application is under review. We\'ll notify you once it\'s approved.';
    } else if (status === 'rejected') {
      return 'Your application was not approved. Please contact support for more information.';
    }
    return 'Status unknown. Please contact support.';
  };

  const progress = getStatusProgress(currentMember.status);

  return (
    <div className="space-y-6">
      {/* Status Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Real-Time Franchise Status
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Progress Bar */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Application Progress</span>
              <span className="text-sm text-gray-500">{progress}% Complete</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {/* Current Status */}
          <div className="flex items-start gap-4 p-4 border rounded-lg bg-gray-50">
            {getStatusIcon(currentMember.status)}
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Badge className={
                  currentMember.status === 'verified'
                    ? 'bg-green-100 text-green-800'
                    : currentMember.status === 'approved'
                    ? 'bg-blue-100 text-blue-800'
                    : currentMember.status === 'pending'
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-red-100 text-red-800'
                }>
                  {currentMember.status === 'verified' 
                    ? 'Fully Verified' 
                    : currentMember.status.charAt(0).toUpperCase() + currentMember.status.slice(1)}
                </Badge>
              </div>
              <p className="text-sm text-gray-700">
                {getStatusMessage(currentMember.status)}
              </p>
            </div>
          </div>

          {/* Application Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <User className="h-4 w-4 text-gray-500" />
                <span className="font-medium">Name:</span>
                <span>{currentMember.name}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Mail className="h-4 w-4 text-gray-500" />
                <span className="font-medium">Email:</span>
                <span>{currentMember.email}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Phone className="h-4 w-4 text-gray-500" />
                <span className="font-medium">Phone:</span>
                <span>{currentMember.phone || 'Not provided'}</span>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="h-4 w-4 text-gray-500" />
                <span className="font-medium">Location:</span>
                <span>{currentMember.franchise_location}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <FileText className="h-4 w-4 text-gray-500" />
                <span className="font-medium">Position:</span>
                <span>{currentMember.position}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4 text-gray-500" />
                <span className="font-medium">Applied:</span>
                <span>{new Date(currentMember.created_at).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Recent Updates
            {userNotifications.filter(n => !n.read).length > 0 && (
              <Badge variant="destructive" className="ml-2">
                {userNotifications.filter(n => !n.read).length} new
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {userNotifications.length === 0 ? (
            <p className="text-center text-gray-500 py-4">No recent updates</p>
          ) : (
            <div className="space-y-3">
              {userNotifications.map((notification) => (
                <div 
                  key={notification.id}
                  className={`p-3 border rounded-lg ${
                    notification.read ? 'bg-gray-50' : 'bg-blue-50 border-blue-200'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium text-sm">{notification.title}</h4>
                      <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500">
                        {new Date(notification.created_at).toLocaleDateString()}
                      </span>
                      {!notification.read && (
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default RealTimeFranchiseStatus;
