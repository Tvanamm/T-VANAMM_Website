
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useRealTimeFranchiseManagement } from '@/hooks/useRealTimeFranchiseManagement';
import { 
  CheckCircle, 
  Clock, 
  XCircle, 
  User, 
  Mail, 
  Phone, 
  MapPin,
  Calendar,
  DollarSign,
  Building
} from 'lucide-react';

const FranchiseVerificationPanel = () => {
  const { toast } = useToast();
  const { 
    franchiseMembers, 
    loading, 
    error, 
    updateMemberStatus,
    updateMemberTransportationFee
  } = useRealTimeFranchiseManagement();
  
  const [updatingMembers, setUpdatingMembers] = useState<Set<string>>(new Set());
  const [transportationFees, setTransportationFees] = useState<Record<string, number>>({});

  const handleStatusUpdate = async (memberId: string, status: 'approved' | 'rejected') => {
    setUpdatingMembers(prev => new Set(prev).add(memberId));
    
    try {
      const success = await updateMemberStatus(memberId, status);
      if (success) {
        toast({
          title: `Member ${status}`,
          description: `Franchise member has been ${status} successfully.`,
        });
      } else {
        throw new Error('Failed to update status');
      }
    } catch (error) {
      console.error('Error updating member status:', error);
      toast({
        title: "Error",
        description: "Failed to update member status. Please try again.",
        variant: "destructive"
      });
    } finally {
      setUpdatingMembers(prev => {
        const newSet = new Set(prev);
        newSet.delete(memberId);
        return newSet;
      });
    }
  };

  const handleTransportationFeeUpdate = async (memberId: string) => {
    const fee = transportationFees[memberId];
    if (!fee || fee <= 0) {
      toast({
        title: "Invalid Fee",
        description: "Please enter a valid transportation fee.",
        variant: "destructive"
      });
      return;
    }

    setUpdatingMembers(prev => new Set(prev).add(memberId));
    
    try {
      const success = await updateMemberTransportationFee(memberId, fee);
      if (success) {
        toast({
          title: "Fee Updated",
          description: "Transportation fee has been updated successfully.",
        });
        setTransportationFees(prev => ({ ...prev, [memberId]: 0 }));
      } else {
        throw new Error('Failed to update fee');
      }
    } catch (error) {
      console.error('Error updating transportation fee:', error);
      toast({
        title: "Error",
        description: "Failed to update transportation fee. Please try again.",
        variant: "destructive"
      });
    } finally {
      setUpdatingMembers(prev => {
        const newSet = new Set(prev);
        newSet.delete(memberId);
        return newSet;
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" />Approved</Badge>;
      case 'rejected':
        return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />Rejected</Badge>;
      default:
        return <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Franchise Verification</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="w-6 h-6 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin mr-2"></div>
            <span>Loading franchise members...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Franchise Verification</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <p className="text-red-600">Error loading franchise members: {error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building className="h-5 w-5" />
          Franchise Verification
        </CardTitle>
      </CardHeader>
      <CardContent>
        {franchiseMembers.length === 0 ? (
          <div className="text-center py-8">
            <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No franchise applications pending verification</p>
          </div>
        ) : (
          <div className="space-y-6">
            {franchiseMembers.map((member) => (
              <div key={member.id} className="border rounded-lg p-4 space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-lg">{member.name}</h3>
                    <div className="mt-2 space-y-1 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4" />
                        {member.email}
                      </div>
                      {member.phone && (
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4" />
                          {member.phone}
                        </div>
                      )}
                      {member.franchise_location && (
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4" />
                          {member.franchise_location}
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        Applied: {new Date(member.created_at).toLocaleDateString()}
                      </div>
                      {member.revenue_generated > 0 && (
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4" />
                          Revenue: ₹{member.revenue_generated.toLocaleString()}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    {getStatusBadge(member.status)}
                    {member.profile_completion_percentage && (
                      <div className="mt-2 text-sm text-gray-600">
                        Profile: {member.profile_completion_percentage.toFixed(0)}% complete
                      </div>
                    )}
                  </div>
                </div>

                {member.status === 'approved' && (
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Transportation Fee (₹)
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        placeholder="Enter fee amount"
                        value={transportationFees[member.id] || ''}
                        onChange={(e) => setTransportationFees(prev => ({
                          ...prev,
                          [member.id]: parseInt(e.target.value) || 0
                        }))}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
                      />
                      <Button
                        onClick={() => handleTransportationFeeUpdate(member.id)}
                        disabled={updatingMembers.has(member.id) || !transportationFees[member.id]}
                        size="sm"
                      >
                        {updatingMembers.has(member.id) ? 'Updating...' : 'Update Fee'}
                      </Button>
                    </div>
                    {member.transportation_fee && (
                      <p className="text-xs text-gray-600 mt-1">
                        Current fee: ₹{member.transportation_fee}
                      </p>
                    )}
                  </div>
                )}

                {member.status === 'pending' && (
                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleStatusUpdate(member.id, 'approved')}
                      disabled={updatingMembers.has(member.id)}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      {updatingMembers.has(member.id) ? 'Updating...' : 'Approve'}
                    </Button>
                    <Button
                      onClick={() => handleStatusUpdate(member.id, 'rejected')}
                      disabled={updatingMembers.has(member.id)}
                      variant="destructive"
                    >
                      {updatingMembers.has(member.id) ? 'Updating...' : 'Reject'}
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default FranchiseVerificationPanel;
