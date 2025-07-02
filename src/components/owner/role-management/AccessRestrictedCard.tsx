
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Shield } from 'lucide-react';

const AccessRestrictedCard: React.FC = () => {
  return (
    <Card>
      <CardContent className="p-6 text-center">
        <Shield className="h-12 w-12 text-red-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-red-600 mb-2">Access Restricted</h3>
        <p className="text-red-500">Only the Owner can access role and permission management.</p>
      </CardContent>
    </Card>
  );
};

export default AccessRestrictedCard;
