
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface DeliverySettings {
  id: string;
  base_delivery_fee: number;
  free_delivery_threshold: number;
  express_delivery_fee: number;
  active: boolean;
}

export const useDeliverySettings = () => {
  const [deliverySettings, setDeliverySettings] = useState<DeliverySettings | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchDeliverySettings = async () => {
    try {
      console.log('Fetching delivery settings...');
      
      const { data, error } = await supabase
        .from('delivery_settings')
        .select('*')
        .eq('active', true)
        .order('created_at', { ascending: false })
        .limit(1);

      if (error) {
        console.error('Error fetching delivery settings:', error);
        throw error;
      }

      if (data && data.length > 0) {
        console.log('Delivery settings found:', data[0]);
        setDeliverySettings(data[0]);
      } else {
        console.log('No delivery settings found, using defaults');
        // Use default settings if none found
        setDeliverySettings({
          id: 'default',
          base_delivery_fee: 50,
          free_delivery_threshold: 2000,
          express_delivery_fee: 100,
          active: true
        });
      }
    } catch (error) {
      console.error('Error fetching delivery settings:', error);
      toast({
        title: "Settings Error",
        description: "Using default delivery settings",
        variant: "destructive"
      });
      // Use default settings on error
      setDeliverySettings({
        id: 'default',
        base_delivery_fee: 50,
        free_delivery_threshold: 2000,
        express_delivery_fee: 100,
        active: true
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateDeliveryFee = (orderAmount: number): number => {
    console.log('Calculating delivery fee for amount:', orderAmount, 'Settings:', deliverySettings);
    
    if (!deliverySettings) {
      console.log('No delivery settings, using default fee of 50');
      return 50;
    }
    
    if (orderAmount >= deliverySettings.free_delivery_threshold) {
      console.log('Order qualifies for free delivery');
      return 0;
    }
    
    console.log('Applying base delivery fee:', deliverySettings.base_delivery_fee);
    return deliverySettings.base_delivery_fee;
  };

  useEffect(() => {
    fetchDeliverySettings();
  }, []);

  return {
    deliverySettings,
    loading,
    calculateDeliveryFee,
    refetch: fetchDeliverySettings
  };
};
