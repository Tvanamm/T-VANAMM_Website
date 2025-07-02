
import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useRealTimeInventory } from '@/hooks/useRealTimeInventory';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Percent, Save } from 'lucide-react';

const CustomGSTInput = () => {
  const { inventory, loading } = useRealTimeInventory();
  const { toast } = useToast();
  const [gstRates, setGstRates] = useState<{ [key: number]: number }>({});
  const [saving, setSaving] = useState<{ [key: number]: boolean }>({});

  React.useEffect(() => {
    // Initialize GST rates from inventory
    const initialRates: { [key: number]: number } = {};
    inventory.forEach(item => {
      initialRates[item.id] = item.gst_rate || 18;
    });
    setGstRates(initialRates);
  }, [inventory]);

  const updateGSTRate = async (itemId: number, newRate: number) => {
    setSaving(prev => ({ ...prev, [itemId]: true }));
    
    try {
      const { error } = await supabase
        .from('inventory')
        .update({ gst_rate: newRate })
        .eq('id', itemId);

      if (error) throw error;

      toast({
        title: "Success",
        description: `GST rate updated to ${newRate}%`,
      });
    } catch (error) {
      console.error('Error updating GST rate:', error);
      toast({
        title: "Error",
        description: "Failed to update GST rate",
        variant: "destructive"
      });
    } finally {
      setSaving(prev => ({ ...prev, [itemId]: false }));
    }
  };

  const handleGSTChange = (itemId: number, value: string) => {
    const numValue = parseFloat(value) || 0;
    setGstRates(prev => ({ ...prev, [itemId]: numValue }));
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <div className="w-6 h-6 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p>Loading inventory...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Percent className="h-5 w-5" />
          Custom GST Rate Management
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {inventory.map((item) => (
            <div key={item.id} className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex-1">
                <h3 className="font-semibold">{item.name}</h3>
                <p className="text-sm text-gray-600">{item.category}</p>
              </div>
              
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    max="100"
                    value={gstRates[item.id] || 18}
                    onChange={(e) => handleGSTChange(item.id, e.target.value)}
                    className="w-20 text-center"
                  />
                  <span className="text-sm text-gray-500">%</span>
                </div>
                
                <Button
                  size="sm"
                  onClick={() => updateGSTRate(item.id, gstRates[item.id] || 18)}
                  disabled={saving[item.id]}
                  className="min-w-[80px]"
                >
                  {saving[item.id] ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-1" />
                      Save
                    </>
                  )}
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default CustomGSTInput;
