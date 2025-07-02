
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Store, Edit, Save, X, MapPin, Phone, Mail, CheckCircle, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface FranchiseMember {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  franchise_location: string;
  position: string;
  location_details: string | null;
  status: string;
  user_id: string | null;
  created_at: string;
  pincode?: string;
  state?: string;
  area?: string;
  transportation_fee?: number;
}

const EnhancedFranchiseManagement = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [franchiseMembers, setFranchiseMembers] = useState<FranchiseMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingMember, setEditingMember] = useState<string | null>(null);
  const [editDialog, setEditDialog] = useState(false);
  const [editValues, setEditValues] = useState<Partial<FranchiseMember>>({});

  useEffect(() => {
    fetchFranchiseMembers();
  }, []);

  const fetchFranchiseMembers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('franchise_members')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setFranchiseMembers(data || []);
    } catch (error) {
      console.error('Error fetching franchise members:', error);
      toast({
        title: "Error",
        description: "Failed to load franchise members",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const startEdit = (member: FranchiseMember) => {
    setEditingMember(member.id);
    setEditValues({
      name: member.name,
      email: member.email,
      phone: member.phone,
      franchise_location: member.franchise_location,
      position: member.position,
      location_details: member.location_details,
      pincode: member.pincode || '',
      state: member.state || '',
      area: member.area || '',
      transportation_fee: member.transportation_fee || 0
    });
    setEditDialog(true);
  };

  const saveEdit = async () => {
    if (!editingMember) return;

    try {
      const { error } = await supabase
        .from('franchise_members')
        .update(editValues)
        .eq('id', editingMember);

      if (error) throw error;

      setFranchiseMembers(prev => prev.map(member => 
        member.id === editingMember ? { ...member, ...editValues } : member
      ));

      toast({
        title: "Success",
        description: "Franchise details updated successfully",
      });

      setEditDialog(false);
      setEditingMember(null);
      setEditValues({});
    } catch (error) {
      console.error('Error updating franchise member:', error);
      toast({
        title: "Error",
        description: "Failed to update franchise details",
        variant: "destructive"
      });
    }
  };

  const verifyFranchiseMember = async (memberId: string) => {
    if (!user || user.role !== 'owner') {
      toast({
        title: "Access Denied",
        description: "Only owners can verify franchise members",
        variant: "destructive"
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('franchise_members')
        .update({ status: 'verified' })
        .eq('id', memberId);

      if (error) throw error;

      setFranchiseMembers(prev => prev.map(member => 
        member.id === memberId ? { ...member, status: 'verified' } : member
      ));

      toast({
        title: "Success",
        description: "Franchise member verified successfully",
      });
    } catch (error) {
      console.error('Error verifying franchise member:', error);
      toast({
        title: "Error",
        description: "Failed to verify franchise member",
        variant: "destructive"
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'verified': return 'bg-green-100 text-green-800';
      case 'active': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const canManageFranchise = user && ['owner', 'admin'].includes(user.role);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Store className="h-5 w-5" />
            Enhanced Franchise Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Member Details</TableHead>
                  <TableHead>Contact Information</TableHead>
                  <TableHead>Franchise Location</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Transportation Fee</TableHead>
                  {canManageFranchise && <TableHead>Actions</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      <div className="w-6 h-6 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                      Loading franchise members...
                    </TableCell>
                  </TableRow>
                ) : franchiseMembers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      <Store className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500">No franchise members found</p>
                    </TableCell>
                  </TableRow>
                ) : (
                  franchiseMembers.map((member) => (
                    <TableRow key={member.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{member.name}</div>
                          <div className="text-sm text-gray-500">{member.position}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-sm">
                            <Mail className="h-3 w-3 text-gray-500" />
                            <span className="text-xs">{member.email}</span>
                          </div>
                          {member.phone && (
                            <div className="flex items-center gap-2 text-sm">
                              <Phone className="h-3 w-3 text-gray-500" />
                              <span>{member.phone}</span>
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-start gap-2">
                          <MapPin className="h-4 w-4 text-gray-500 mt-0.5" />
                          <div>
                            <div className="font-medium text-sm">{member.franchise_location}</div>
                            {member.area && <div className="text-xs text-gray-500">{member.area}</div>}
                            {member.state && <div className="text-xs text-gray-500">{member.state}</div>}
                            {member.pincode && <div className="text-xs text-gray-500">PIN: {member.pincode}</div>}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(member.status)}>
                          {member.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {member.transportation_fee ? `₹${member.transportation_fee}` : 'Not Set'}
                      </TableCell>
                      {canManageFranchise && (
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => startEdit(member)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            {user?.role === 'owner' && member.status !== 'verified' && (
                              <Button
                                size="sm"
                                onClick={() => verifyFranchiseMember(member.id)}
                              >
                                <CheckCircle className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      )}
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={editDialog} onOpenChange={setEditDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Franchise Details</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Name</label>
              <Input
                value={editValues.name || ''}
                onChange={(e) => setEditValues(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Email</label>
              <Input
                value={editValues.email || ''}
                onChange={(e) => setEditValues(prev => ({ ...prev, email: e.target.value }))}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Phone</label>
              <Input
                value={editValues.phone || ''}
                onChange={(e) => setEditValues(prev => ({ ...prev, phone: e.target.value }))}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Position</label>
              <Input
                value={editValues.position || ''}
                onChange={(e) => setEditValues(prev => ({ ...prev, position: e.target.value }))}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Franchise Location</label>
              <Input
                value={editValues.franchise_location || ''}
                onChange={(e) => setEditValues(prev => ({ ...prev, franchise_location: e.target.value }))}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Area</label>
              <Input
                value={editValues.area || ''}
                onChange={(e) => setEditValues(prev => ({ ...prev, area: e.target.value }))}
                placeholder="Local area/district"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">State</label>
              <Input
                value={editValues.state || ''}
                onChange={(e) => setEditValues(prev => ({ ...prev, state: e.target.value }))}
                placeholder="State name"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">PIN Code</label>
              <Input
                value={editValues.pincode || ''}
                onChange={(e) => setEditValues(prev => ({ ...prev, pincode: e.target.value }))}
                placeholder="6-digit PIN code"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Transportation Fee (₹)</label>
              <Input
                type="number"
                value={editValues.transportation_fee || 0}
                onChange={(e) => setEditValues(prev => ({ ...prev, transportation_fee: parseFloat(e.target.value) || 0 }))}
                placeholder="Transportation fee for stock orders"
              />
            </div>
            <div className="md:col-span-2">
              <label className="text-sm font-medium mb-2 block">Location Details</label>
              <Textarea
                value={editValues.location_details || ''}
                onChange={(e) => setEditValues(prev => ({ ...prev, location_details: e.target.value }))}
                placeholder="Additional location details..."
                rows={3}
              />
            </div>
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <Button variant="outline" onClick={() => setEditDialog(false)}>
              Cancel
            </Button>
            <Button onClick={saveEdit}>
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EnhancedFranchiseManagement;
