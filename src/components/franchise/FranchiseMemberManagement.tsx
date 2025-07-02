import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Users, UserPlus, CheckCircle, AlertCircle, Trash2, MapPin, Phone, Edit, Eye } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { useFranchiseMembers } from '@/hooks/useFranchiseMembers';
import { useRealTimeNotifications } from '@/hooks/useRealTimeNotifications';

interface FranchiseUser {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
}

const FranchiseMemberManagement = () => {
  const { user } = useAuth();
  const { createNotification } = useRealTimeNotifications();
  const {
    franchiseMembers,
    loading,
    addFranchiseMember,
    updateFranchiseMember,
    deleteFranchiseMember,
    refetch
  } = useFranchiseMembers();
  
  const [franchiseUsers, setFranchiseUsers] = useState<FranchiseUser[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<FranchiseUser | null>(null);
  const [editingMember, setEditingMember] = useState<any>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [newMemberForm, setNewMemberForm] = useState({
    franchise_location: '',
    position: 'Franchise Manager',
    phone: ''
  });

  const canManageMembers = user?.role === 'admin' || user?.role === 'owner';

  // Real-time subscription for franchise members
  useEffect(() => {
    if (user) {
      fetchFranchiseUsers();
      
      // Set up real-time subscription - TODO: Implement with Neon DB
      console.log('Setting up real-time subscription for franchise members');
    }
  }, [user, refetch]);

  const fetchFranchiseUsers = async () => {
    try {
      console.log('Fetching franchise users...');
      
      // System users with franchise role
      const systemFranchiseUsers = [
        {
          id: '22222222-2222-2222-2222-222222222222',
          name: 'Franchise Partner',
          email: 'josnnsris@gmail.com',
          role: 'franchise'
        }
      ];

      // TODO: Implement with Neon DB to fetch database users with franchise role
      let dbFranchiseUsers: FranchiseUser[] = [];

      // Combine system and database users
      const allFranchiseUsers = [...systemFranchiseUsers, ...dbFranchiseUsers];

      // Filter out users who are already in franchise_members
      const unassignedFranchiseUsers = allFranchiseUsers.filter(franchiseUser => 
        !franchiseMembers.some(member => 
          member.email === franchiseUser.email || member.user_id === franchiseUser.id
        )
      );

      console.log('Unassigned franchise users:', unassignedFranchiseUsers);
      setFranchiseUsers(unassignedFranchiseUsers);
      
    } catch (error) {
      console.error('Error fetching franchise data:', error);
      toast({
        title: "Error",
        description: "Failed to fetch franchise data. Please check your connection.",
        variant: "destructive"
      });
    }
  };

  const handleUserSelection = (userId: string) => {
    const selected = franchiseUsers.find(u => u.id === userId);
    setSelectedUser(selected || null);
    if (selected) {
      setNewMemberForm({
        franchise_location: '',
        position: 'Franchise Manager',
        phone: selected.phone || ''
      });
    }
  };

  const handleAddMemberFromUser = async () => {
    if (!canManageMembers || !selectedUser) return;

    if (!newMemberForm.franchise_location) {
      toast({
        title: "Missing Information",
        description: "Please fill in franchise location.",
        variant: "destructive"
      });
      return;
    }

    try {
      const memberData = {
        user_id: selectedUser.id,
        name: selectedUser.name,
        email: selectedUser.email,
        phone: newMemberForm.phone || selectedUser.phone,
        franchise_location: newMemberForm.franchise_location,
        position: newMemberForm.position,
        assigned_by: user?.id,
        status: 'active'
      };

      const data = await addFranchiseMember(memberData);

      // Send notification to the franchise member
      await createNotification(
        'franchise_assignment',
        'Franchise Assignment Completed',
        `You have been assigned to ${newMemberForm.franchise_location} as ${newMemberForm.position}.`,
        selectedUser.id
      );

      // Reset form and close dialog
      setNewMemberForm({
        franchise_location: '',
        position: 'Franchise Manager',
        phone: ''
      });
      setSelectedUser(null);
      setIsAddDialogOpen(false);
      
    } catch (error) {
      console.error('Error adding member:', error);
    }
  };

  const handleEditMember = (member: any) => {
    setEditingMember({ ...member });
    setEditDialogOpen(true);
  };

  const handleUpdateMember = async () => {
    if (!editingMember || !canManageMembers) return;

    try {
      await updateFranchiseMember(editingMember.id, {
        name: editingMember.name,
        phone: editingMember.phone,
        franchise_location: editingMember.franchise_location,
        position: editingMember.position,
        location_details: editingMember.location_details
      });

      // Send notification about profile update
      await createNotification(
        'profile_updated',
        'Franchise Profile Updated',
        'Your franchise profile has been updated by an administrator.',
        editingMember.user_id
      );

      setEditDialogOpen(false);
      setEditingMember(null);
    } catch (error) {
      console.error('Error updating member:', error);
    }
  };

  const handleDeleteMember = async (memberId: string, memberName: string) => {
    if (!canManageMembers) return;

    if (!window.confirm(`Are you sure you want to delete member "${memberName}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const member = franchiseMembers.find(m => m.id === memberId);
      
      await deleteFranchiseMember(memberId);
      
      // Send notification about removal
      if (member?.user_id) {
        await createNotification(
          'franchise_removal',
          'Franchise Assignment Removed',
          'Your franchise assignment has been removed by an administrator. Please contact support if you believe this is an error.',
          member.user_id
        );
      }
    } catch (error) {
      console.error('Error deleting member:', error);
    }
  };

  const handleToggleStatus = async (memberId: string) => {
    const member = franchiseMembers.find(m => m.id === memberId);
    if (!member || !canManageMembers) return;

    const newStatus = member.status === 'active' ? 'inactive' : 'active';
    
    try {
      await updateFranchiseMember(memberId, { status: newStatus });
      
      // Send notification about status change
      await createNotification(
        'status_change',
        `Franchise Status ${newStatus === 'active' ? 'Activated' : 'Deactivated'}`,
        `Your franchise status has been ${newStatus === 'active' ? 'activated' : 'deactivated'} by an administrator.`,
        member.user_id
      );
    } catch (error) {
      console.error('Error toggling status:', error);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <div className="w-6 h-6 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p>Loading franchise members...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <Users className="h-8 w-8 text-emerald-600 mx-auto mb-2" />
            <h3 className="font-semibold text-emerald-800">Active Members</h3>
            <p className="text-2xl font-bold text-emerald-700">{franchiseMembers.filter(m => m.status === 'active').length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <h3 className="font-semibold text-green-800">Total Members</h3>
            <p className="text-2xl font-bold text-green-700">
              {franchiseMembers.length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <AlertCircle className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
            <h3 className="font-semibold text-yellow-800">Inactive Members</h3>
            <p className="text-2xl font-bold text-yellow-700">
              {franchiseMembers.filter(member => member.status === 'inactive').length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <UserPlus className="h-8 w-8 text-blue-600 mx-auto mb-2" />
            <h3 className="font-semibold text-blue-800">Awaiting Assignment</h3>
            <p className="text-2xl font-bold text-blue-700">{franchiseUsers.length}</p>
          </CardContent>
        </Card>
      </div>

      {/* Unassigned Users Alert */}
      {franchiseUsers.length > 0 && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-blue-800">
                <AlertCircle className="h-5 w-5" />
                <div>
                  <span className="font-semibold block">
                    {franchiseUsers.length} user(s) assigned as franchise but not yet added to franchise management
                  </span>
                  <div className="text-sm mt-1">
                    Users needing franchise details: {franchiseUsers.map(u => u.email).join(', ')}
                  </div>
                </div>
              </div>
              {canManageMembers && (
                <Button 
                  onClick={() => setIsAddDialogOpen(true)}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Assign Franchise Details
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Members Table */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Franchise Members Management (Real-time)
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Member Details</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Location & Position</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {franchiseMembers.map((member) => (
                <TableRow key={member.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{member.name}</div>
                      <div className="text-sm text-gray-500">{member.email}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-sm">
                      <Phone className="h-3 w-3" />
                      {member.phone || 'N/A'}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="flex items-center gap-1 text-sm">
                        <MapPin className="h-3 w-3" />
                        {member.franchise_location}
                      </div>
                      <Badge variant="outline" className="text-xs mt-1">{member.position}</Badge>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant={member.status === 'active' ? 'default' : 'secondary'}
                      className={member.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}
                    >
                      {member.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      {canManageMembers && (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEditMember(member)}
                            className="h-8 w-8 p-0"
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleToggleStatus(member.id)}
                            className="h-8 w-8 p-0"
                          >
                            <Eye className="h-3 w-3" />
                          </Button>
                          
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDeleteMember(member.id, member.name)}
                            className="h-8 w-8 p-0"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Add Member Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Assign Franchise Details</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Select User</Label>
              <Select onValueChange={handleUserSelection}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a franchise user" />
                </SelectTrigger>
                <SelectContent>
                  {franchiseUsers.map(user => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.name} ({user.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {selectedUser && (
              <>
                <div>
                  <Label>Franchise Location</Label>
                  <Input
                    value={newMemberForm.franchise_location}
                    onChange={(e) => setNewMemberForm({...newMemberForm, franchise_location: e.target.value})}
                    placeholder="e.g., Mumbai Central Mall"
                  />
                </div>
                <div>
                  <Label>Position</Label>
                  <Select 
                    value={newMemberForm.position} 
                    onValueChange={(value) => setNewMemberForm({...newMemberForm, position: value})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Franchise Owner">Franchise Owner</SelectItem>
                      <SelectItem value="Franchise Manager">Franchise Manager</SelectItem>
                      <SelectItem value="Assistant Manager">Assistant Manager</SelectItem>
                      <SelectItem value="Staff">Staff</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Phone Number</Label>
                  <Input
                    value={newMemberForm.phone}
                    onChange={(e) => setNewMemberForm({...newMemberForm, phone: e.target.value})}
                    placeholder="+91 XXXXX XXXXX"
                  />
                </div>
              </>
            )}
            
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleAddMemberFromUser}
                disabled={!selectedUser || !newMemberForm.franchise_location}
              >
                Add Member
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Member Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Franchise Member</DialogTitle>
          </DialogHeader>
          {editingMember && (
            <div className="space-y-4">
              <div>
                <Label>Name</Label>
                <Input
                  value={editingMember.name}
                  onChange={(e) => setEditingMember({...editingMember, name: e.target.value})}
                />
              </div>
              <div>
                <Label>Phone</Label>
                <Input
                  value={editingMember.phone || ''}
                  onChange={(e) => setEditingMember({...editingMember, phone: e.target.value})}
                />
              </div>
              <div>
                <Label>Franchise Location</Label>
                <Input
                  value={editingMember.franchise_location}
                  onChange={(e) => setEditingMember({...editingMember, franchise_location: e.target.value})}
                />
              </div>
              <div>
                <Label>Position</Label>
                <Select 
                  value={editingMember.position} 
                  onValueChange={(value) => setEditingMember({...editingMember, position: value})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Franchise Owner">Franchise Owner</SelectItem>
                    <SelectItem value="Franchise Manager">Franchise Manager</SelectItem>
                    <SelectItem value="Assistant Manager">Assistant Manager</SelectItem>
                    <SelectItem value="Staff">Staff</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleUpdateMember}>
                  Update Member
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FranchiseMemberManagement;
