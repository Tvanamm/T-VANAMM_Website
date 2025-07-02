
import React from 'react';
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Mail, MoreVertical, Phone, Trash2, Shield } from 'lucide-react';

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

interface UserActionsDropdownProps {
  user: User;
  canManageUsers: boolean;
  isMainOwner: boolean;
  onDeleteUser: (userId: string, userName: string) => void;
}

const UserActionsDropdown = ({ user, canManageUsers, isMainOwner, onDeleteUser }: UserActionsDropdownProps) => {
  const { toast } = useToast();

  const isProtectedUser = user.email === 'surojutrinadh.s@gmail.com' || user.provider === 'system';

  const handleCopyEmail = () => {
    if (user.provider !== 'system' && user.email) {
      navigator.clipboard.writeText(user.email);
      toast({ 
        title: "Success",
        description: "Email copied to clipboard" 
      });
    } else {
      toast({ 
        title: "Error",
        description: "Cannot copy system user email", 
        variant: 'destructive' 
      });
    }
  };

  const handleCopyPhone = () => {
    if (user.provider !== 'system' && user.phone) {
      navigator.clipboard.writeText(user.phone);
      toast({ 
        title: "Success",
        description: "Phone copied to clipboard" 
      });
    } else {
      toast({ 
        title: "Error",
        description: "No phone number available", 
        variant: 'destructive' 
      });
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">Open menu</span>
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        <DropdownMenuItem onClick={handleCopyEmail}>
          <Mail className="mr-2 h-4 w-4" /> 
          Copy Email
        </DropdownMenuItem>
        {user.phone && (
          <DropdownMenuItem onClick={handleCopyPhone}>
            <Phone className="mr-2 h-4 w-4" /> 
            Copy Phone
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        {isProtectedUser && (
          <DropdownMenuItem disabled>
            <Shield className="mr-2 h-4 w-4" /> 
            Protected User
          </DropdownMenuItem>
        )}
        {canManageUsers && isMainOwner && !isProtectedUser && (
          <DropdownMenuItem 
            onClick={() => onDeleteUser(user.id, user.name)}
            className="text-red-600 focus:text-red-600"
          >
            <Trash2 className="mr-2 h-4 w-4" /> 
            Delete User
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserActionsDropdown;
