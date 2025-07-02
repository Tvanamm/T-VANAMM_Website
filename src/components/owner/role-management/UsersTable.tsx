
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Users } from 'lucide-react';
import { UserRole } from '@/hooks/useRoleAssignment';
import UserRoleTableRow from './UserRoleTableRow';

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

interface UsersTableProps {
  users: User[];
  loading: boolean;
  searchTerm: string;
  selectedRole: string;
  editingUser: string | null;
  setEditingUser: (id: string | null) => void;
  assigning: boolean;
  currentUserId?: string;
  onRoleChange: (userId: string, newRole: UserRole) => void;
  onDeleteUser: (userId: string, userName: string) => void;
}

const UsersTable: React.FC<UsersTableProps> = ({
  users,
  loading,
  searchTerm,
  selectedRole,
  editingUser,
  setEditingUser,
  assigning,
  currentUserId,
  onRoleChange,
  onDeleteUser
}) => {
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = selectedRole === 'all' || user.role === selectedRole;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>User Details</TableHead>
            <TableHead>Current Role</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Joined</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-8">
                <div className="w-6 h-6 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                Loading users...
              </TableCell>
            </TableRow>
          ) : filteredUsers.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-8">
                <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">
                  {searchTerm || selectedRole !== 'all' ? 'No users found matching your criteria.' : 'No users found.'}
                </p>
              </TableCell>
            </TableRow>
          ) : (
            filteredUsers.map((user) => (
              <UserRoleTableRow
                key={user.id}
                user={user}
                editingUser={editingUser}
                setEditingUser={setEditingUser}
                assigning={assigning}
                currentUserId={currentUserId}
                onRoleChange={onRoleChange}
                onDeleteUser={onDeleteUser}
              />
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default UsersTable;
