
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, UserCheck, Shield } from 'lucide-react';
import { useRoleAssignment, UserRole } from '@/hooks/useRoleAssignment';

interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  provider: 'email' | 'google' | 'system' | 'hardcoded';
}

interface RoleAssignmentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: User | null;
  onRoleAssigned: () => void;
}

const RoleAssignmentModal = ({ open, onOpenChange, user, onRoleAssigned }: RoleAssignmentModalProps) => {
  const [selectedRole, setSelectedRole] = useState<UserRole>('customer');
  const { assignRole, assigning } = useRoleAssignment();

  const handleAssignRole = async () => {
    if (!user || !selectedRole) return;

    try {
      await assignRole({
        userId: user.id,
        newRole: selectedRole
      });

      onRoleAssigned();
      onOpenChange(false);
      setSelectedRole('customer');
    } catch (error) {
      // Error handling is done in the hook
    }
  };

  const getRoleIcon = (role: UserRole) => {
    switch (role) {
      case 'owner': return <Shield className="h-4 w-4 text-red-600" />;
      case 'admin': return <UserCheck className="h-4 w-4 text-blue-600" />;
      case 'franchise': return <Shield className="h-4 w-4 text-emerald-600" />;
      default: return null;
    }
  };

  const getRoleDescription = (role: UserRole) => {
    switch (role) {
      case 'owner': return 'Full system access and control';
      case 'admin': return 'Administrative access with verification required';
      case 'franchise': return 'Franchise management with verification required';
      case 'customer': return 'Standard user access';
      default: return '';
    }
  };

  const requiresVerification = selectedRole === 'franchise' || selectedRole === 'admin';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Assign Role to {user?.name}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="bg-gray-50 p-3 rounded-lg">
            <div className="text-sm text-gray-600">Current Role</div>
            <Badge variant="outline" className="mt-1">
              {user?.role}
            </Badge>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">New Role</label>
            <Select value={selectedRole} onValueChange={(value) => setSelectedRole(value as UserRole)}>
              <SelectTrigger>
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="customer">
                  <div className="flex items-center gap-2">
                    <span>Customer</span>
                  </div>
                </SelectItem>
                <SelectItem value="franchise">
                  <div className="flex items-center gap-2">
                    {getRoleIcon('franchise')}
                    <span>Franchise</span>
                  </div>
                </SelectItem>
                <SelectItem value="admin">
                  <div className="flex items-center gap-2">
                    {getRoleIcon('admin')}
                    <span>Admin</span>
                  </div>
                </SelectItem>
                <SelectItem value="owner">
                  <div className="flex items-center gap-2">
                    {getRoleIcon('owner')}
                    <span>Owner</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
            
            {selectedRole && (
              <p className="text-xs text-gray-500 mt-1">
                {getRoleDescription(selectedRole)}
              </p>
            )}
          </div>

          {requiresVerification && (
            <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5" />
                <div className="text-sm">
                  <div className="font-medium text-yellow-800">Verification Required</div>
                  <div className="text-yellow-700 mt-1">
                    The user will receive a notification to complete {selectedRole} verification process including:
                  </div>
                  <ul className="text-yellow-700 text-xs mt-2 space-y-1">
                    {selectedRole === 'franchise' ? (
                      <>
                        <li>• Franchise location details</li>
                        <li>• Documentation verification</li>
                        <li>• Government OTP verification</li>
                      </>
                    ) : (
                      <>
                        <li>• Admin credentials verification</li>
                        <li>• Security clearance</li>
                      </>
                    )}
                  </ul>
                </div>
              </div>
            </div>
          )}

          <div className="flex gap-2 pt-4">
            <Button 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleAssignRole}
              disabled={assigning || !selectedRole || selectedRole === user?.role}
              className="flex-1"
            >
              {assigning ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Assigning...
                </div>
              ) : (
                'Assign Role'
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RoleAssignmentModal;
