
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Truck, Settings, Save, Plus } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface FranchiseMember {
  id: string;
  name: string;
  franchise_location: string;
  transportation_fee: number;
}

interface FranchiseDeliverySettings {
  id: string;
  franchise_location: string;
  delivery_fee: number;
  free_delivery_threshold: number;
  express_delivery_fee: number;
  active: boolean;
}

const FranchiseDeliverySettings = () => {
  const { toast } = useToast();
  const [franchiseMembers, setFranchiseMembers] = useState<FranchiseMember[]>([]);
  const [settings, setSettings] = useState<FranchiseDeliverySettings[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);

  const fetchFranchiseMembers = async () => {
    try {
      const { data, error } = await supabase
        .from('franchise_members')
        .select('id, name, franchise_location, transportation_fee')
        .neq('franchise_location', null);

      if (error) throw error;

      setFranchiseMembers(data || []);
    } catch (error) {
      console.error('Error fetching franchise members:', error);
    }
  };

  const fetchDeliverySettings = async () => {
    try {
      const { data, error } = await supabase
        .from('franchise_delivery_settings')
        .select('*')
        .order('franchise_location');

      if (error) throw error;

      setSettings(data || []);
    } catch (error) {
      console.error('Error fetching delivery settings:', error);
      toast({
        title: "Error",
        description: "Failed to load delivery settings",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const updateTransportationFee = async (memberId: string, newFee: number) => {
    setSaving(memberId);
    try {
      const { error } = await supabase
        .from('franchise_members')
        .update({ transportation_fee: newFee })
        .eq('id', memberId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Transportation fee updated successfully",
      });

      await fetchFranchiseMembers();
      await fetchDeliverySettings();
    } catch (error) {
      console.error('Error updating transportation fee:', error);
      toast({
        title: "Error",
        description: "Failed to update transportation fee",
        variant: "destructive"
      });
    } finally {
      setSaving(null);
    }
  };

  const handleFeeChange = (memberId: string, newFee: number) => {
    setFranchiseMembers(prev => 
      prev.map(member => 
        member.id === memberId 
          ? { ...member, transportation_fee: newFee }
          : member
      )
    );
  };

  useEffect(() => {
    fetchFranchiseMembers();
    fetchDeliverySettings();
  }, []);

  if (loading) {
    return <div>Loading delivery settings...</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Truck className="h-5 w-5" />
            Franchise Transportation Fee Settings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {franchiseMembers.map(member => {
              const hasCustomSettings = settings.some(s => s.franchise_location === member.franchise_location);
              
              return (
                <Card key={member.id} className="border-l-4 border-l-emerald-500">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center justify-between">
                      <div>
                        <div className="font-semibold">{member.name}</div>
                        <div className="text-sm text-gray-600">{member.franchise_location}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">
                          Current: ₹{member.transportation_fee || 0}
                        </Badge>
                        {hasCustomSettings && (
                          <Badge variant="secondary">Custom Settings</Badge>
                        )}
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
                      <div>
                        <Label htmlFor={`fee-${member.id}`}>Transportation Fee (₹)</Label>
                        <Input
                          id={`fee-${member.id}`}
                          type="number"
                          value={member.transportation_fee || 0}
                          onChange={(e) => handleFeeChange(member.id, Number(e.target.value))}
                          placeholder="Enter fee amount"
                        />
                      </div>
                      <div>
                        <Button
                          onClick={() => updateTransportationFee(member.id, member.transportation_fee || 0)}
                          disabled={saving === member.id}
                          className="w-full"
                        >
                          {saving === member.id ? (
                            <>
                              <Settings className="h-4 w-4 mr-2 animate-spin" />
                              Updating...
                            </>
                          ) : (
                            <>
                              <Save className="h-4 w-4 mr-2" />
                              Update Fee
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                    
                    <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-600">
                        <strong>Note:</strong> This transportation fee will be used as the delivery charge for orders from this franchise location. 
                        The fee is automatically applied when franchise members place orders.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FranchiseDeliverySettings;
