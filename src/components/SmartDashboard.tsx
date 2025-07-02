
import React, { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent } from '@/components/ui/card';
import { Shield, ArrowRight, AlertCircle } from 'lucide-react';

const SmartDashboard = () => {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  console.log('SmartDashboard: Current state', {
    isLoading,
    user: user ? { id: user.id, role: user.role, isFranchiseMember: user.isFranchiseMember } : null
  });

  useEffect(() => {
    // Only redirect if we're not loading and have a user
    if (!isLoading && user) {
      console.log('SmartDashboard: Redirecting user based on role:', user.role);
      
      if (user.role === 'admin') {
        navigate('/admin-dashboard', { replace: true });
      } else if (user.role === 'owner') {
        navigate('/owner-dashboard', { replace: true });
      } else if (user.role === 'franchise' || user.isFranchiseMember) {
        navigate('/franchise-dashboard', { replace: true });
      }
    }
  }, [user, isLoading, navigate]);

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="p-6 text-center">
            <Shield className="h-12 w-12 text-emerald-600 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Authentication Required</h2>
            <p className="text-gray-600 mb-4">Please log in to access your dashboard.</p>
            <button 
              onClick={() => navigate('/login')}
              className="w-full bg-emerald-600 text-white py-2 px-4 rounded-lg hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2"
            >
              Go to Login <ArrowRight className="h-4 w-4" />
            </button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // For users with unknown/empty roles, show role assignment needed
  if (!user.role || user.role === '') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="p-6 text-center">
            <AlertCircle className="h-12 w-12 text-amber-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Role Assignment Needed</h2>
            <p className="text-gray-600 mb-4">
              Your account needs to be assigned a role by an administrator to access the dashboard.
            </p>
            <div className="space-y-2">
              <button 
                onClick={() => navigate('/contact')}
                className="w-full bg-emerald-600 text-white py-2 px-4 rounded-lg hover:bg-emerald-700 transition-colors"
              >
                Contact Admin
              </button>
              <button 
                onClick={() => navigate('/')}
                className="w-full bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors"
              >
                Go to Home
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Default loading for other role redirections
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 flex items-center justify-center">
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-600">Setting up your dashboard...</p>
      </div>
    </div>
  );
};

export default SmartDashboard;
