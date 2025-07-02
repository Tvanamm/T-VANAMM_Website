
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface DeliverySettings {
  delivery_fee: number;
  free_delivery_threshold: number;
  express_delivery_fee: number;
  franchise_location: string;
}

export const useFranchiseDeliverySettings = () => {
  const { user } = useAuth();
  const [deliverySettings, setDeliverySettings] = useState<DeliverySettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDeliverySettings = async () => {
      try {
        setLoading(true);
        setError(null);

        // If no user, use default settings
        if (!user) {
          console.log('No user found, using default delivery settings');
          setDeliverySettings({
            delivery_fee: 50,
            free_delivery_threshold: 2000,
            express_delivery_fee: 100,
            franchise_location: 'default'
          });
          setLoading(false);
          return;
        }

        console.log('Fetching delivery settings for user:', user.id);

        // Try to get franchise member location first
        let franchiseLocation = null;
        
        if (user.isFranchiseMember && user.franchiseMemberId) {
          const { data: franchiseMember } = await supabase
            .from('franchise_members')
            .select('franchise_location')
            .eq('id', user.franchiseMemberId)
            .maybeSingle();
          
          franchiseLocation = franchiseMember?.franchise_location;
        }

        // Get delivery settings for the franchise location
        let settings = null;
        if (franchiseLocation) {
          const { data: franchiseSettings } = await supabase
            .from('franchise_delivery_settings')
            .select('*')
            .eq('franchise_location', franchiseLocation)
            .eq('active', true)
            .maybeSingle();
          
          if (franchiseSettings) {
            settings = {
              delivery_fee: franchiseSettings.delivery_fee,
              free_delivery_threshold: franchiseSettings.free_delivery_threshold || 2000,
              express_delivery_fee: franchiseSettings.express_delivery_fee || 100,
              franchise_location: franchiseLocation
            };
          }
        }

        // Fallback to global delivery settings if no franchise-specific settings
        if (!settings) {
          const { data: globalSettings } = await supabase
            .from('delivery_settings')
            .select('*')
            .eq('active', true)
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();

          settings = {
            delivery_fee: globalSettings?.base_delivery_fee || 50,
            free_delivery_threshold: globalSettings?.free_delivery_threshold || 2000,
            express_delivery_fee: globalSettings?.express_delivery_fee || 100,
            franchise_location: franchiseLocation || 'default'
          };
        }

        console.log('Final delivery settings:', settings);
        setDeliverySettings(settings);
      } catch (err) {
        console.error('Error fetching delivery settings:', err);
        setError('Failed to load delivery settings');
        // Set default settings on error
        setDeliverySettings({
          delivery_fee: 50,
          free_delivery_threshold: 2000,
          express_delivery_fee: 100,
          franchise_location: 'default'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchDeliverySettings();
  }, [user?.id, user?.isFranchiseMember, user?.franchiseMemberId]);

  const calculateDeliveryFee = (orderAmount: number): number => {
    if (!deliverySettings) return 50; // Default fee
    
    if (orderAmount >= deliverySettings.free_delivery_threshold) {
      return 0; // Free delivery
    }
    
    return deliverySettings.delivery_fee;
  };

  return {
    deliverySettings,
    loading,
    error,
    calculateDeliveryFee
  };
};
