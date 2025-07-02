
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Users, Shield, UserPlus } from 'lucide-react';
import { UserRole } from '@/hooks/useRoleAssignment';

interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  created_at: string;
  updated_at: string;
  email_verified: boolean;
  phone: string | null;
  provider: string;
}

interface RoleStatsCardsProps {
  users: User[];
}

const RoleStatsCards: React.FC<RoleStatsCardsProps> = ({ users }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <Card>
        <CardContent className="p-4 text-center">
          <Users className="h-8 w-8 text-blue-600 mx-auto mb-2" />
          <h3 className="font-semibold text-blue-800">Total Users</h3>
          <p className="text-2xl font-bold text-blue-700">{users.length}</p>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4 text-center">
          <Shield className="h-8 w-8 text-emerald-600 mx-auto mb-2" />
          <h3 className="font-semibold text-emerald-800">Admins</h3>
          <p className="text-2xl font-bold text-emerald-700">
            {users.filter(u => u.role === 'admin').length}
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4 text-center">
          <UserPlus className="h-8 w-8 text-purple-600 mx-auto mb-2" />
          <h3 className="font-semibold text-purple-800">Franchise</h3>
          <p className="text-2xl font-bold text-purple-700">
            {users.filter(u => u.role === 'franchise').length}
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4 text-center">
          <Users className="h-8 w-8 text-gray-600 mx-auto mb-2" />
          <h3 className="font-semibold text-gray-800">Customers</h3>
          <p className="text-2xl font-bold text-gray-700">
            {users.filter(u => u.role === 'customer').length}
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default RoleStatsCards;
