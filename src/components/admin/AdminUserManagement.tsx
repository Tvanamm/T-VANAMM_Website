
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Users, 
  Search, 
  UserPlus,
  Shield,
  Mail,
  MapPin
} from 'lucide-react';

const AdminUserManagement = () => {
  const mockUsers = [
    {
      id: '1',
      name: 'John Doe',
      email: 'john@example.com',
      role: 'franchise',
      location: 'Mumbai',
      status: 'active',
      joinDate: '2024-01-15'
    },
    {
      id: '2',
      name: 'Jane Smith',
      email: 'jane@example.com',
      role: 'admin',
      location: 'Delhi',
      status: 'active',
      joinDate: '2024-02-20'
    },
    {
      id: '3',
      name: 'Mike Johnson',
      email: 'mike@example.com',
      role: 'franchise',
      location: 'Bangalore',
      status: 'pending',
      joinDate: '2024-03-10'
    }
  ];

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'owner': return 'bg-purple-100 text-purple-800';
      case 'admin': return 'bg-blue-100 text-blue-800';
      case 'franchise': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'inactive': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Users className="h-6 w-6" />
              User Management
            </CardTitle>
            <Button className="bg-emerald-600 hover:bg-emerald-700">
              <UserPlus className="h-4 w-4 mr-2" />
              Add User
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search users..."
                className="pl-10"
              />
            </div>
            <Button variant="outline">
              Filter by Role
            </Button>
            <Button variant="outline">
              Filter by Status
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Users List */}
      <Card>
        <CardHeader>
          <CardTitle>All Users</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockUsers.map(user => (
              <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-gray-100 rounded-full">
                    <Users className="h-5 w-5 text-gray-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{user.name}</h3>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Mail className="h-3 w-3" />
                      <span>{user.email}</span>
                      <MapPin className="h-3 w-3 ml-2" />
                      <span>{user.location}</span>
                    </div>
                    <p className="text-xs text-gray-500">Joined {user.joinDate}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <Badge className={getRoleColor(user.role)}>
                    <Shield className="h-3 w-3 mr-1" />
                    {user.role}
                  </Badge>
                  <Badge className={getStatusColor(user.status)}>
                    {user.status}
                  </Badge>
                  <Button variant="outline" size="sm">
                    Edit
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminUserManagement;
