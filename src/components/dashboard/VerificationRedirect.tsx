
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, ArrowRight, Shield, UserCheck } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface VerificationRedirectProps {
  notification: {
    id: string;
    type: string;
    title: string;
    message: string;
    data?: any;
    read: boolean;
    created_at: string;
  };
  onStartVerification: (notificationId: string, verificationType: string) => void;
}

const VerificationRedirect = ({ notification, onStartVerification }: VerificationRedirectProps) => {
  const { user } = useAuth();

  const handleStartVerification = async () => {
    // TODO: Implement verification process without Aadhar/OTP
    console.log('Starting verification process for:', notification.id);
  };

  const getVerificationIcon = (type: string) => {
    switch (type) {
      case 'franchise_member':
        return <Shield className="h-5 w-5 text-emerald-600" />;
      case 'admin_verification':
        return <UserCheck className="h-5 w-5 text-blue-600" />;
      default:
        return <AlertCircle className="h-5 w-5 text-yellow-600" />;
    }
  };

  const getVerificationDescription = (type: string) => {
    switch (type) {
      case 'franchise_member':
        return 'Complete franchise member verification including profile and location details.';
      case 'admin_verification':
        return 'Complete admin verification process to access administrative features.';
      default:
        return 'Complete the required verification process.';
    }
  };

  if (notification.type !== 'role_assigned' || !notification.data?.requires_verification) {
    return null;
  }

  return (
    <Card className="border-emerald-200 bg-emerald-50">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-3">
          {getVerificationIcon(notification.data.verification_type)}
          <div>
            <div className="text-lg">Verification Required</div>
            <Badge variant="outline" className="mt-1">
              {notification.data.assigned_role} Role
            </Badge>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-gray-700">
          {getVerificationDescription(notification.data.verification_type)}
        </p>
        
        <div className="bg-white p-3 rounded-lg">
          <h4 className="font-semibold text-sm mb-2">Next Steps:</h4>
          <ul className="text-sm text-gray-600 space-y-1">
            {notification.data.verification_type === 'franchise_member' ? (
              <>
                <li>• Complete your franchise profile</li>
                <li>• Provide franchise location details</li>
                <li>• Submit required documentation</li>
                <li>• Submit for admin verification</li>
              </>
            ) : (
              <>
                <li>• Verify admin credentials</li>
                <li>• Set up administrative permissions</li>
                <li>• Complete security verification</li>
              </>
            )}
          </ul>
        </div>

        <Button 
          onClick={handleStartVerification}
          className="w-full bg-emerald-600 hover:bg-emerald-700"
        >
          <div className="flex items-center gap-2">
            Start Verification Process
            <ArrowRight className="h-4 w-4" />
          </div>
        </Button>
      </CardContent>
    </Card>
  );
};

export default VerificationRedirect;
