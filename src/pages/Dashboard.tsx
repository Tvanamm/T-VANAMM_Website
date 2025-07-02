
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';

const Dashboard = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Dashboard</h1>
        
        <Card>
          <CardHeader>
            <CardTitle>Welcome to Tvanamm Dashboard</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">
              Dashboard functionality will be implemented with Neon DB integration.
            </p>
            {user && (
              <div className="mt-4">
                <p><strong>User:</strong> {user.name || user.email}</p>
                <p><strong>Role:</strong> {user.role}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
