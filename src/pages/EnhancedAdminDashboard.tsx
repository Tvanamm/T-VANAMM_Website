
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import IsolatedAdminPanel from '@/components/admin/IsolatedAdminPanel';
import PageLoading from '@/components/PageLoading';

const EnhancedAdminDashboard = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <PageLoading />;
  }

  if (!user || !['owner', 'admin'].includes(user.role)) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600">You need administrator privileges to access this page.</p>
        </div>
      </div>
    );
  }

  return <IsolatedAdminPanel />;
};

export default EnhancedAdminDashboard;
