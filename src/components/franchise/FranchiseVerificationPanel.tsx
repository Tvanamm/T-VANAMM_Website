
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useFranchiseMembers } from '@/hooks/useFranchiseMembers';
import { supabase } from '@/integrations/supabase/client';
import { 
  CheckCircle, 
  Clock, 
  XCircle, 
  User, 
  Mail, 
  Phone, 
  MapPin,
  Calendar,
  Building,
  AlertCircle,
  Shield,
  ShieldOff
} from 'lucide-react';

const FranchiseVerificationPanel = () => {
  const { toast } = useToast();
  const { 
    franchiseMembers, 
    loading, 
    error, 
    updateFranchiseMember,
    refetch
  } = useFranchiseMembers();
  
  const [updatingMembers, setUpdatingMembers] = useState<Set<string>>(new Set());

  const handleStatusUpdate = async (memberId: string, status: 'approved' | 'rejected' | 'verified') => {
    setUpdatingMembers(prev => new Set(prev).add(memberId));
    
    try {
      await updateFranchiseMember(memberId, { status });
      toast({
        title: `Member ${status}`,
        description: `Franchise member has been ${status} successfully.`,
      });
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

  const handleDashboardAccessToggle = async (memberId: string, enabled: boolean) => {
    setUpdatingMembers(prev => new Set(prev).add(memberId));
    
    try {
      // Use the new database function for dashboard access updates
      const { data, error } = await supabase.rpc('update_franchise_dashboard_access', {
        target_member_id: memberId,
        access_enabled: enabled
      });

      if (error) {
        throw error;
      }

      toast({
        title: "Dashboard Access Updated",
        description: `Dashboard access has been ${enabled ? 'enabled' : 'disabled'} for this member.`,
      });

      // Refresh the members list to show updated data
      await refetch();
    } catch (error) {
      console.error('Error updating dashboard access:', error);
      toast({
        title: "Error",
        description: "Failed to update dashboard access. Please try again.",
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
      case 'verified':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" />Verified</Badge>;
      case 'approved':
        return <Badge className="bg-blue-100 text-blue-800"><CheckCircle className="h-3 w-3 mr-1" />Approved</Badge>;
      case 'rejected':
        return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />Rejected</Badge>;
      case 'active':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" />Active</Badge>;
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
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
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
          <Badge variant="outline" className="ml-2">
            {franchiseMembers.length} Members
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {franchiseMembers.length === 0 ? (
          <div className="text-center py-8">
            <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No franchise members found</p>
            <p className="text-sm text-gray-500 mt-2">
              Franchise members will appear here when they are assigned roles
            </p>
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
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        {member.franchise_location}
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        Applied: {new Date(member.created_at).toLocaleDateString()}
                      </div>
                      {member.tvanamm_id && (
                        <div className="flex items-center gap-2">
                          <Building className="h-4 w-4" />
                          TVANAMM ID: {member.tvanamm_id}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    {getStatusBadge(member.status)}
                    <div className="mt-2 text-sm text-gray-600">
                      Position: {member.position}
                    </div>
                  </div>
                </div>

                {/* Dashboard Access Control */}
                <div className="bg-blue-50 p-3 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {member.dashboard_access_enabled ? (
                        <Shield className="h-4 w-4 text-green-600" />
                      ) : (
                        <ShieldOff className="h-4 w-4 text-red-600" />
                      )}
                      <Label htmlFor={`dashboard-access-${member.id}`} className="text-sm font-medium">
                        Dashboard Access
                      </Label>
                    </div>
                    <Switch
                      id={`dashboard-access-${member.id}`}
                      checked={member.dashboard_access_enabled ?? true}
                      onCheckedChange={(enabled) => handleDashboardAccessToggle(member.id, enabled)}
                      disabled={updatingMembers.has(member.id)}
                    />
                  </div>
                  <p className="text-xs text-gray-600 mt-1">
                    {member.dashboard_access_enabled 
                      ? 'Member can access the franchise dashboard' 
                      : 'Member cannot access the franchise dashboard'
                    }
                  </p>
                </div>

                <div className="flex gap-2">
                  {member.status === 'pending' && (
                    <>
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
                    </>
                  )}
                  {member.status === 'approved' && (
                    <Button
                      onClick={() => handleStatusUpdate(member.id, 'verified')}
                      disabled={updatingMembers.has(member.id)}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      {updatingMembers.has(member.id) ? 'Updating...' : 'Verify'}
                    </Button>
                  )}
                  {(member.status === 'active' || member.status === 'verified') && (
                    <Badge className="bg-green-100 text-green-800">
                      Ready for Operations
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default FranchiseVerificationPanel;
