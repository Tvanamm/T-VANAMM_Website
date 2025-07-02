
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, Clock, XCircle, CheckCircle, ShieldOff } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useFranchiseMembers } from '@/hooks/useFranchiseMembers';

const FranchiseVerificationCheck = () => {
  const { user } = useAuth();
  const { franchiseMembers, loading } = useFranchiseMembers();

  // Find current user's franchise member record by email or user_id
  const currentMember = franchiseMembers.find(member => 
    member.user_id === user?.id || member.email === user?.email
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="p-6 text-center">
            <div className="w-8 h-8 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Checking Access...</h2>
            <p className="text-gray-600">Please wait while we verify your franchise status.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!currentMember) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <XCircle className="h-6 w-6 text-red-600" />
            </div>
            <CardTitle className="text-xl text-gray-800">Access Denied</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <div className="p-4 bg-red-50 rounded-lg border border-red-200">
              <p className="text-sm text-red-700">
                No franchise member record found for your account. Please contact the administrator to set up your franchise profile.
              </p>
            </div>
            
            <div className="text-sm text-gray-600">
              <p><strong>Account:</strong> {user?.name}</p>
              <p><strong>Email:</strong> {user?.email}</p>
              <p><strong>Role:</strong> {user?.role}</p>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-semibold text-blue-800 mb-2">What you need to do:</h4>
              <ul className="text-sm text-blue-700 space-y-1 text-left">
                <li>• Contact the administrator to add you as a franchise member</li>
                <li>• Provide your complete profile information</li>
                <li>• Wait for verification and approval</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Check if member has proper verification status AND dashboard access
  const hasAccess = (currentMember.status === 'active' || currentMember.status === 'verified') && 
                   (currentMember.dashboard_access_enabled ?? true);

  if (hasAccess) {
    // If user has access, don't show this verification check
    return null;
  }

  // Check if dashboard access is disabled
  if (currentMember.dashboard_access_enabled === false) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <ShieldOff className="h-6 w-6 text-red-600" />
            </div>
            <CardTitle className="text-xl text-gray-800">Dashboard Access Disabled</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <div className="p-4 bg-red-50 rounded-lg border border-red-200">
              <p className="text-sm text-red-700">
                Your dashboard access has been temporarily disabled by the administrator. Please contact support for assistance.
              </p>
            </div>
            
            <div className="text-sm text-gray-600">
              <p><strong>Account:</strong> {user?.name}</p>
              <p><strong>Email:</strong> {user?.email}</p>
              <p><strong>Status:</strong> {currentMember.status}</p>
              <p><strong>Location:</strong> {currentMember.franchise_location}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getStatusMessage = () => {
    switch (currentMember.status) {
      case 'pending':
        return {
          title: "Verification Pending",
          message: "Your franchise application is under review. Please wait for the administrator to verify your account.",
          icon: <Clock className="h-6 w-6 text-yellow-600" />,
          bgColor: "bg-yellow-100",
          borderColor: "border-yellow-200",
          textColor: "text-yellow-700"
        };
      case 'approved':
        return {
          title: "Approval Received",
          message: "Your application has been approved but final verification is still pending. You will be notified once complete.",
          icon: <CheckCircle className="h-6 w-6 text-blue-600" />,
          bgColor: "bg-blue-100",
          borderColor: "border-blue-200",
          textColor: "text-blue-700"
        };
      case 'rejected':
        return {
          title: "Application Rejected",
          message: "Your franchise application has been rejected. Please contact the administrator for more information.",
          icon: <XCircle className="h-6 w-6 text-red-600" />,
          bgColor: "bg-red-100",
          borderColor: "border-red-200",
          textColor: "text-red-700"
        };
      default:
        return {
          title: "Account Unverified",
          message: "Your account requires verification before you can access the franchise dashboard.",
          icon: <AlertCircle className="h-6 w-6 text-orange-600" />,
          bgColor: "bg-orange-100",
          borderColor: "border-orange-200",
          textColor: "text-orange-700"
        };
    }
  };

  const statusInfo = getStatusMessage();

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
            {statusInfo.icon}
          </div>
          <CardTitle className="text-xl text-gray-800">{statusInfo.title}</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <div className={`p-4 ${statusInfo.bgColor} rounded-lg border ${statusInfo.borderColor}`}>
            <div className="flex items-start gap-3">
              {statusInfo.icon}
              <div className="text-left">
                <h4 className={`font-semibold ${statusInfo.textColor.replace('text-', 'text-').replace('-700', '-800')}`}>
                  {statusInfo.title}
                </h4>
                <p className={`text-sm ${statusInfo.textColor} mt-1`}>
                  {statusInfo.message}
                </p>
              </div>
            </div>
          </div>
          
          <div className="text-sm text-gray-600">
            <p><strong>Account:</strong> {user?.name}</p>
            <p><strong>Email:</strong> {user?.email}</p>
            <p><strong>Status:</strong> {currentMember.status}</p>
            <p><strong>Location:</strong> {currentMember.franchise_location}</p>
            <p><strong>Position:</strong> {currentMember.position}</p>
          </div>
          
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-semibold text-blue-800 mb-2">Next Steps:</h4>
            <ul className="text-sm text-blue-700 space-y-1 text-left">
              {currentMember.status === 'pending' && (
                <>
                  <li>• Wait for administrator review</li>
                  <li>• Ensure all required information is complete</li>
                  <li>• Check back regularly for status updates</li>
                </>
              )}
              {currentMember.status === 'approved' && (
                <>
                  <li>• Final verification is in progress</li>
                  <li>• You will receive notification when complete</li>
                  <li>• No action required from your side</li>
                </>
              )}
              {currentMember.status === 'rejected' && (
                <>
                  <li>• Contact administrator for details</li>
                  <li>• Provide additional information if requested</li>
                  <li>• Reapply if possible</li>
                </>
              )}
            </ul>
          </div>
          
          <p className="text-xs text-gray-500">
            If you have any questions, please contact your administrator.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default FranchiseVerificationCheck;
