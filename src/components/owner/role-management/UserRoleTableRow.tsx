
import React from 'react';
import { TableCell, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Trash2, Edit, Shield, Users, Crown, UserPlus } from 'lucide-react';
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

interface UserRoleTableRowProps {
  user: User;
  editingUser: string | null;
  setEditingUser: (id: string | null) => void;
  assigning: boolean;
  currentUserId?: string;
  onRoleChange: (userId: string, newRole: UserRole) => void;
  onDeleteUser: (userId: string, userName: string) => void;
}

const UserRoleTableRow: React.FC<UserRoleTableRowProps> = ({
  user,
  editingUser,
  setEditingUser,
  assigning,
  currentUserId,
  onRoleChange,
  onDeleteUser
}) => {
  const getRoleBadgeColor = (role: UserRole) => {
    switch (role) {
      case 'owner': return 'bg-red-100 text-red-800 border-red-200';
      case 'admin': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'franchise': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'customer': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getRoleIcon = (role: UserRole) => {
    switch (role) {
      case 'owner': return <Crown className="h-3 w-3 text-red-600" />;
      case 'admin': return <Shield className="h-3 w-3 text-blue-600" />;
      case 'franchise': return <UserPlus className="h-3 w-3 text-emerald-600" />;
      default: return <Users className="h-3 w-3 text-gray-600" />;
    }
  };

  return (
    <TableRow>
      <TableCell>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
            <span className="text-emerald-700 font-medium">
              {user.name.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <div className="font-medium">{user.name}</div>
            <div className="text-sm text-gray-500">{user.email}</div>
            {user.phone && (
              <div className="text-xs text-gray-400">{user.phone}</div>
            )}
          </div>
        </div>
      </TableCell>
      <TableCell>
        {editingUser === user.id ? (
          <Select
            value={user.role}
            onValueChange={(value) => onRoleChange(user.id, value as UserRole)}
            disabled={assigning}
          >
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="customer">Customer</SelectItem>
              <SelectItem value="franchise">Franchise</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
              <SelectItem value="owner">Owner</SelectItem>
            </SelectContent>
          </Select>
        ) : (
          <Badge className={`${getRoleBadgeColor(user.role)} flex items-center gap-1 w-fit`}>
            {getRoleIcon(user.role)}
            {user.role}
          </Badge>
        )}
      </TableCell>
      <TableCell>
        <Badge variant={user.email_verified ? "default" : "secondary"}>
          {user.email_verified ? "Verified" : "Unverified"}
        </Badge>
      </TableCell>
      <TableCell>
        <div className="text-sm text-gray-600">
          {new Date(user.created_at).toLocaleDateString()}
        </div>
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-1">
          {editingUser === user.id ? (
            <Button
              size="sm"
              variant="outline"
              onClick={() => setEditingUser(null)}
              disabled={assigning}
            >
              Cancel
            </Button>
          ) : (
            <>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setEditingUser(user.id)}
                disabled={user.role === 'owner' && user.id !== currentUserId}
              >
                <Edit className="h-3 w-3 mr-1" />
                Edit
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={() => onDeleteUser(user.id, user.name)}
                disabled={user.role === 'owner' || user.id === currentUserId}
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </>
          )}
        </div>
      </TableCell>
    </TableRow>
  );
};

export default UserRoleTableRow;
