
import React from 'react';
import { Badge } from "@/components/ui/badge";
import { TableCell, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertCircle, CheckCircle, User } from 'lucide-react';
import UserActionsDropdown from './UserActionsDropdown';

type UserRole = 'owner' | 'admin' | 'franchise' | 'customer';

interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  created_at: string;
  updated_at: string;
  email_verified: boolean;
  phone: string | null;
  provider: 'email' | 'google' | 'system' | 'hardcoded';
  avatar_url: string | null;
}

interface UserTableRowProps {
  user: User;
  canManageUsers: boolean;
  isMainOwner: boolean;
  onRoleChange: (userId: string, newRole: UserRole) => void;
  onDeleteUser: (userId: string, userName: string) => void;
}

const UserTableRow = ({ user, canManageUsers, isMainOwner, onRoleChange, onDeleteUser }: UserTableRowProps) => {
  const getRoleColor = (role: UserRole) => {
    switch (role) {
      case 'owner': return 'bg-red-100 text-red-800';
      case 'admin': return 'bg-blue-100 text-blue-800';
      case 'franchise': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const isProtectedUser = user.email === 'surojutrinadh.s@gmail.com' || user.provider === 'system';

  return (
    <TableRow>
      <TableCell>
        <div className="flex items-center gap-2">
          <User className="h-4 w-4 text-gray-500" />
          {user.name}
        </div>
      </TableCell>
      <TableCell>
        <div className="flex flex-col">
          <span>{user.email}</span>
          {!user.email_verified && (
            <Badge variant="secondary" className="w-fit mt-1 text-xs">Unverified</Badge>
          )}
        </div>
      </TableCell>
      <TableCell>
        <Badge className={getRoleColor(user.role)}>{user.role}</Badge>
      </TableCell>
      <TableCell>
        {user.email_verified ? (
          <div className="flex items-center gap-1 text-green-500">
            <CheckCircle className="h-4 w-4" />
            Verified
          </div>
        ) : (
          <div className="flex items-center gap-1 text-yellow-500">
            <AlertCircle className="h-4 w-4" />
            Pending
          </div>
        )}
      </TableCell>
      <TableCell className="text-right">
        <div className="flex justify-end gap-2">
          {canManageUsers && isMainOwner && !isProtectedUser && (
            <Select value={user.role} onValueChange={(newRole) => onRoleChange(user.id, newRole as UserRole)}>
              <SelectTrigger className="w-[120px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="owner">Owner</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="franchise">Franchise</SelectItem>
                <SelectItem value="customer">Customer</SelectItem>
              </SelectContent>
            </Select>
          )}
          <UserActionsDropdown 
            user={user}
            canManageUsers={canManageUsers}
            isMainOwner={isMainOwner}
            onDeleteUser={onDeleteUser}
          />
        </div>
      </TableCell>
    </TableRow>
  );
};

export default UserTableRow;
