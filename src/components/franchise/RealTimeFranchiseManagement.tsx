
import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Building2, Users, MapPin, Phone, Mail, Activity } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface FranchiseMember {
  id: string;
  name: string;
  email: string;
  phone?: string;
  franchise_location: string;
  position: string;
  status: string;
  location_details?: string;
  created_at: string;
}

const RealTimeFranchiseManagement = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [franchiseMembers, setFranchiseMembers] = useState<FranchiseMember[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchFranchiseMembers = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('franchise_members')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching franchise members:', error);
        toast({
          title: "Error",
          description: "Failed to load franchise members",
          variant: "destructive"
        });
        return;
      }

      setFranchiseMembers(data || []);
    } catch (error) {
      console.error('Error fetching franchise members:', error);
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchFranchiseMembers();

    // Set up real-time subscription
    const channel = supabase
      .channel('franchise_members_realtime')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'franchise_members'
      }, () => {
        fetchFranchiseMembers();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchFranchiseMembers]);

  const franchiseStats = {
    total: franchiseMembers.length,
    active: franchiseMembers.filter(m => m.status === 'active').length,
    locations: Array.from(new Set(franchiseMembers.map(m => m.franchise_location))).length,
    managers: franchiseMembers.filter(m => m.position.toLowerCase().includes('manager')).length
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
      {/* Franchise Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <Users className="h-8 w-8 text-blue-600 mx-auto mb-2" />
            <h3 className="font-semibold text-blue-800">Total Members</h3>
            <p className="text-2xl font-bold text-blue-700">{franchiseStats.total}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <Activity className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <h3 className="font-semibold text-green-800">Active Members</h3>
            <p className="text-2xl font-bold text-green-700">{franchiseStats.active}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <MapPin className="h-8 w-8 text-purple-600 mx-auto mb-2" />
            <h3 className="font-semibold text-purple-800">Locations</h3>
            <p className="text-2xl font-bold text-purple-700">{franchiseStats.locations}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <Building2 className="h-8 w-8 text-orange-600 mx-auto mb-2" />
            <h3 className="font-semibold text-orange-800">Managers</h3>
            <p className="text-2xl font-bold text-orange-700">{franchiseStats.managers}</p>
          </CardContent>
        </Card>
      </div>

      {/* Franchise Members */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Real-Time Franchise Management
            <Badge variant="outline" className="ml-2">
              {franchiseMembers.length} Members
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {franchiseMembers.length === 0 ? (
            <div className="text-center py-8">
              <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No franchise members found</p>
              <p className="text-sm text-gray-500 mt-2">
                Franchise members will appear here when they register
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Member Details</TableHead>
                    <TableHead>Contact Information</TableHead>
                    <TableHead>Branch & Location</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Joined</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {franchiseMembers.map((member) => (
                    <TableRow key={member.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium text-gray-900">{member.name}</div>
                          <Badge variant="outline" className="text-xs mt-1">
                            {member.position}
                          </Badge>
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
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-gray-500" />
                          <div>
                            <div className="font-medium text-sm">{member.franchise_location}</div>
                            {member.location_details && (
                              <div className="text-xs text-gray-500">{member.location_details}</div>
                            )}
                          </div>
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
                        <div className="text-sm text-gray-500">
                          {new Date(member.created_at).toLocaleDateString()}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default RealTimeFranchiseManagement;
