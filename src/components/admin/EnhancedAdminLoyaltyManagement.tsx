
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useAdminLoyaltyManagement } from '@/hooks/useAdminLoyaltyManagement';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  Plus, 
  Star, 
  TrendingUp, 
  Users,
  Search,
  Eye
} from 'lucide-react';

interface FranchiseMember {
  id: string;
  name: string;
  email: string;
  franchise_location: string;
  tvanamm_id?: string;
}

const EnhancedAdminLoyaltyManagement = () => {
  const { toast } = useToast();
  const [franchiseMembers, setFranchiseMembers] = useState<FranchiseMember[]>([]);
  const [selectedMember, setSelectedMember] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [pointsToAdd, setPointsToAdd] = useState<string>('');
  const [description, setDescription] = useState('');
  const [isAddingPoints, setIsAddingPoints] = useState(false);
  const [viewingMember, setViewingMember] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const { 
    loyaltyData, 
    addManualPoints,
    loading: loyaltyLoading 
  } = useAdminLoyaltyManagement();

  useEffect(() => {
    fetchFranchiseMembers();
  }, []);

  const fetchFranchiseMembers = async () => {
    try {
      const { data, error } = await supabase
        .from('franchise_members')
        .select('id, name, email, franchise_location, tvanamm_id')
        .in('status', ['active', 'verified'])
        .order('name');

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

  const handleAddPoints = async () => {
    if (!selectedMember || !pointsToAdd) {
      toast({
        title: "Validation Error",
        description: "Please select a member and enter valid points",
        variant: "destructive"
      });
      return;
    }

    const pointsNumber = parseInt(pointsToAdd);
    if (isNaN(pointsNumber) || pointsNumber <= 0) {
      toast({
        title: "Invalid Points",
        description: "Please enter a valid positive number",
        variant: "destructive"
      });
      return;
    }

    setIsAddingPoints(true);
    try {
      const success = await addManualPoints(selectedMember, pointsNumber, description || 'Points added by admin');
      if (success) {
        setPointsToAdd('');
        setDescription('');
        setSelectedMember('');
      }
    } catch (error) {
      console.error('Error adding points:', error);
    } finally {
      setIsAddingPoints(false);
    }
  };

  const filteredMembers = franchiseMembers.filter(member =>
    member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.franchise_location.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (member.tvanamm_id && member.tvanamm_id.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getLoyaltyDataForMember = (memberId: string) => {
    return loyaltyData.find(data => data.franchise_member_id === memberId);
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
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-6 w-6" />
            Loyalty Program Management
          </CardTitle>
        </CardHeader>
      </Card>

      {/* Add Points Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Add Loyalty Points
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="member-select">Select Franchise Member</Label>
              <Select value={selectedMember} onValueChange={setSelectedMember}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a member" />
                </SelectTrigger>
                <SelectContent>
                  {franchiseMembers.map(member => (
                    <SelectItem key={member.id} value={member.id}>
                      {member.name} - {member.franchise_location}
                      {member.tvanamm_id && ` (${member.tvanamm_id})`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="points">Points to Add</Label>
              <Input
                id="points"
                type="number"
                value={pointsToAdd}
                onChange={(e) => setPointsToAdd(e.target.value)}
                placeholder="Enter points"
                min="1"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Reason for adding points"
            />
          </div>

          <Button
            onClick={handleAddPoints}
            disabled={isAddingPoints || !selectedMember || !pointsToAdd}
            className="bg-emerald-600 hover:bg-emerald-700"
          >
            {isAddingPoints ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Adding Points...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Add Points
              </div>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Members List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Franchise Members
            </CardTitle>
            <div className="flex items-center gap-2">
              <Search className="h-4 w-4 text-gray-500" />
              <Input
                placeholder="Search members..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-64"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {filteredMembers.length === 0 ? (
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No franchise members found</p>
              </div>
            ) : (
              filteredMembers.map(member => {
                const loyaltyMemberData = getLoyaltyDataForMember(member.id);
                return (
                  <div
                    key={member.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex-1">
                      <h3 className="font-semibold">{member.name}</h3>
                      <p className="text-sm text-gray-600">{member.email}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline">{member.franchise_location}</Badge>
                        {member.tvanamm_id && (
                          <Badge variant="outline">ID: {member.tvanamm_id}</Badge>
                        )}
                        <Badge className="bg-emerald-100 text-emerald-800">
                          {loyaltyMemberData?.current_balance || 0} points
                        </Badge>
                      </div>
                    </div>
                    
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setViewingMember(member.id)}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>Loyalty Details - {member.name}</DialogTitle>
                        </DialogHeader>
                        
                        <div className="space-y-6">
                          <div className="grid grid-cols-3 gap-4">
                            <Card>
                              <CardContent className="p-4 text-center">
                                <div className="text-2xl font-bold text-emerald-600">
                                  {loyaltyMemberData?.current_balance || 0}
                                </div>
                                <div className="text-sm text-gray-600">Current Balance</div>
                              </CardContent>
                            </Card>
                            <Card>
                              <CardContent className="p-4 text-center">
                                <div className="text-2xl font-bold text-blue-600">
                                  {loyaltyMemberData?.total_earned || 0}
                                </div>
                                <div className="text-sm text-gray-600">Total Earned</div>
                              </CardContent>
                            </Card>
                            <Card>
                              <CardContent className="p-4 text-center">
                                <div className="text-2xl font-bold text-purple-600">
                                  {loyaltyMemberData?.total_redeemed || 0}
                                </div>
                                <div className="text-sm text-gray-600">Total Redeemed</div>
                              </CardContent>
                            </Card>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EnhancedAdminLoyaltyManagement;
