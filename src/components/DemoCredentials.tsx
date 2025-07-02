
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { User, Mail, Lock } from 'lucide-react';

const DemoCredentials = () => {
  const credentials = [
    {
      role: 'Owner',
      email: 'trinadhsuroju.s@gmail.com',
      password: 'owner123',
      description: 'Full system access and control',
      variant: 'destructive' as const
    },
    {
      role: 'Admin',
      email: 'surojutrinadh.s@gmail.com',
      password: 'admin123',
      description: 'Administrative access',
      variant: 'default' as const
    },
    {
      role: 'Franchise',
      email: 'trinadh.batch7@gmail.com',
      password: 'franchise123',
      description: 'Franchise management access',
      variant: 'secondary' as const
    }
  ];

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          Demo Credentials
        </CardTitle>
        <p className="text-sm text-gray-600">
          Use these credentials to test different role permissions
        </p>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4">
          {credentials.map((cred) => (
            <div key={cred.role} className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <Badge variant={cred.variant}>{cred.role}</Badge>
                <span className="text-xs text-gray-500">{cred.description}</span>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4 text-gray-500" />
                  <code className="bg-gray-100 px-2 py-1 rounded text-xs">
                    {cred.email}
                  </code>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Lock className="h-4 w-4 text-gray-500" />
                  <code className="bg-gray-100 px-2 py-1 rounded text-xs">
                    {cred.password}
                  </code>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>Note:</strong> These are actual database accounts for testing purposes. 
            Login with any of these credentials to test different user roles.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default DemoCredentials;
