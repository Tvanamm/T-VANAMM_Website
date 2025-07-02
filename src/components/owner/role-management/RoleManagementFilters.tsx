
import React from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search } from 'lucide-react';

interface RoleManagementFiltersProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  selectedRole: string;
  setSelectedRole: (value: string) => void;
}

const RoleManagementFilters: React.FC<RoleManagementFiltersProps> = ({
  searchTerm,
  setSearchTerm,
  selectedRole,
  setSelectedRole
}) => {
  return (
    <div className="flex flex-col sm:flex-row gap-4 mb-6">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          placeholder="Search users by name or email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>
      <Select value={selectedRole} onValueChange={setSelectedRole}>
        <SelectTrigger className="w-full sm:w-48">
          <SelectValue placeholder="Filter by role" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Roles</SelectItem>
          <SelectItem value="owner">Owner</SelectItem>
          <SelectItem value="admin">Admin</SelectItem>
          <SelectItem value="franchise">Franchise</SelectItem>
          <SelectItem value="customer">Customer</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};

export default RoleManagementFilters;
