
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import LoadingSpinner from '@/components/LoadingSpinner';

interface AuthGuardProps {
  children: React.ReactNode;
  allowedRoles: string[];
}

export const AuthGuard: React.FC<AuthGuardProps> = ({ children, allowedRoles }) => {
  const { user, isLoading } = useAuth();

  console.log('AuthGuard check:', { user: user?.role, isLoading, allowedRoles });

  // Show loading while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" variant="coffee" text="Checking permissions..." />
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!user) {
    console.log('AuthGuard: No user, redirecting to login');
    return <Navigate to="/login" replace />;
  }

  // Check if user has required access
  const hasAccess = allowedRoles.includes(user.role) || 
    (allowedRoles.includes('franchise') && user.isFranchiseMember);

  console.log('AuthGuard access check:', { 
    userRole: user.role, 
    isFranchiseMember: user.isFranchiseMember, 
    hasAccess,
    allowedRoles 
  });

  if (!hasAccess) {
    // Redirect based on user role to their appropriate dashboard
    const currentPath = window.location.pathname;
    
    if (user.role === 'admin' && currentPath !== '/admin-dashboard') {
      return <Navigate to="/admin-dashboard" replace />;
    } else if (user.role === 'owner' && currentPath !== '/owner-dashboard') {
      return <Navigate to="/owner-dashboard" replace />;
    } else if ((user.role === 'franchise' || user.isFranchiseMember) && currentPath !== '/franchise-dashboard') {
      return <Navigate to="/franchise-dashboard" replace />;
    } else {
      // Users with no role or unknown role go to dashboard for role assignment
      return <Navigate to="/dashboard" replace />;
    }
  }

  // Render children if authenticated and authorized
  return <>{children}</>;
};
