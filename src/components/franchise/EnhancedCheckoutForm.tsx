
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import LoyaltyCheckout from './LoyaltyCheckout';
import { useFranchiseCart } from '@/contexts/FranchiseCartContext';
import { useRealFranchiseProfile } from '@/hooks/useRealFranchiseProfile';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  MapPin, 
  User, 
  CreditCard, 
  Truck,
  CheckCircle
} from 'lucide-react';

interface CheckoutFormData {
  tvanamm_id: string;
  street_address: string;
  city: string;
  state: string;
  pincode: string;
  landmark?: string;
  delivery_instructions?: string;
}

interface EnhancedCheckoutFormProps {
  onSubmit: (orderData: any) => Promise<void>;
  onCancel: () => void;
}

const EnhancedCheckoutForm: React.FC<EnhancedCheckoutFormProps> = ({
  onSubmit,
  onCancel
}) => {
  const { cartItems, getTotalPrice } = useFranchiseCart();
  const { franchiseProfile } = useRealFranchiseProfile();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState<CheckoutFormData>({
    tvanamm_id: franchiseProfile?.tvanamm_id || '',
    street_address: '',
    city: franchiseProfile?.city || '',
    state: franchiseProfile?.state || '',
    pincode: franchiseProfile?.pincode || '',
    landmark: '',
    delivery_instructions: ''
  });

  const [loyaltyDiscount, setLoyaltyDiscount] = useState(0);
  const [loyaltyPointsUsed, setLoyaltyPointsUsed] = useState(0);
  const [claimedGift, setClaimedGift] = useState<string | null>(null);
  const [deliveryFee, setDeliveryFee] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const subtotal = getTotalPrice();
  const finalTotal = subtotal - loyaltyDiscount + deliveryFee;

  React.useEffect(() => {
    // Calculate delivery fee based on franchise location
    const calculateDeliveryFee = async () => {
      if (!franchiseProfile?.franchise_location) return;

      try {
        const { data, error } = await supabase
          .from('franchise_delivery_settings')
          .select('delivery_fee, free_delivery_threshold')
          .eq('franchise_location', franchiseProfile.franchise_location)
          .eq('active', true)
          .single();

        if (error) {
          // Use default delivery fee if no specific settings found
          setDeliveryFee(subtotal >= 2000 ? 0 : 50);
          return;
        }

        const fee = subtotal >= (data.free_delivery_threshold || 2000) ? 0 : data.delivery_fee;
        setDeliveryFee(claimedGift === 'free_delivery' ? 0 : fee);
      } catch (error) {
        console.error('Error calculating delivery fee:', error);
        setDeliveryFee(subtotal >= 2000 ? 0 : 50);
      }
    };

    calculateDeliveryFee();
  }, [subtotal, franchiseProfile, claimedGift]);

  const handleInputChange = (field: keyof CheckoutFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleLoyaltyDiscount = (discount: number, pointsUsed: number) => {
    setLoyaltyDiscount(discount);
    setLoyaltyPointsUsed(pointsUsed);
  };

  const handleGiftClaim = (giftType: string, pointsUsed: number) => {
    setClaimedGift(giftType);
    setLoyaltyPointsUsed(prev => prev + pointsUsed);
    
    if (giftType === 'free_delivery') {
      setDeliveryFee(0);
    }
  };

  const validateForm = () => {
    if (!formData.tvanamm_id.trim()) {
      toast({
        title: "Validation Error",
        description: "TVANAMM ID is required",
        variant: "destructive"
      });
      return false;
    }

    if (!formData.street_address.trim() || !formData.city.trim() || 
        !formData.state.trim() || !formData.pincode.trim()) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required address fields",
        variant: "destructive"
      });
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const orderData = {
        franchise_member_id: franchiseProfile?.id,
        franchise_name: franchiseProfile?.franchise_location || 'Unknown',
        tvanamm_id: formData.tvanamm_id,
        detailed_address: {
          street_address: formData.street_address,
          city: formData.city,
          state: formData.state,
          pincode: formData.pincode,
          landmark: formData.landmark,
          delivery_instructions: formData.delivery_instructions
        },
        shipping_address: `${formData.street_address}, ${formData.city}, ${formData.state} - ${formData.pincode}`,
        total_amount: finalTotal,
        loyalty_points_used: loyaltyPointsUsed,
        loyalty_gift_claimed: claimedGift,
        delivery_fee_override: deliveryFee,
        items: cartItems
      };

      await onSubmit(orderData);
    } catch (error) {
      console.error('Error submitting order:', error);
      toast({
        title: "Error",
        description: "Failed to submit order. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="space-y-6">
        {/* Personal Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Personal Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="tvanamm_id">TVANAMM ID *</Label>
              <Input
                id="tvanamm_id"
                value={formData.tvanamm_id}
                onChange={(e) => handleInputChange('tvanamm_id', e.target.value)}
                placeholder="Enter your TVANAMM ID"
                required
              />
            </div>
          </CardContent>
        </Card>

        {/* Delivery Address */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Delivery Address
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="street_address">Street Address *</Label>
              <Textarea
                id="street_address"
                value={formData.street_address}
                onChange={(e) => handleInputChange('street_address', e.target.value)}
                placeholder="Enter complete street address"
                required
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="city">City *</Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                  placeholder="City"
                  required
                />
              </div>
              <div>
                <Label htmlFor="state">State *</Label>
                <Input
                  id="state"
                  value={formData.state}
                  onChange={(e) => handleInputChange('state', e.target.value)}
                  placeholder="State"
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="pincode">Pincode *</Label>
              <Input
                id="pincode"
                value={formData.pincode}
                onChange={(e) => handleInputChange('pincode', e.target.value)}
                placeholder="Pincode"
                required
              />
            </div>

            <div>
              <Label htmlFor="landmark">Landmark (Optional)</Label>
              <Input
                id="landmark"
                value={formData.landmark}
                onChange={(e) => handleInputChange('landmark', e.target.value)}
                placeholder="Nearby landmark"
              />
            </div>

            <div>
              <Label htmlFor="delivery_instructions">Delivery Instructions (Optional)</Label>
              <Textarea
                id="delivery_instructions"
                value={formData.delivery_instructions}
                onChange={(e) => handleInputChange('delivery_instructions', e.target.value)}
                placeholder="Special delivery instructions"
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-6">
        {/* Loyalty Benefits */}
        {franchiseProfile?.id && (
          <LoyaltyCheckout
            franchiseMemberId={franchiseProfile.id}
            orderTotal={subtotal}
            onApplyDiscount={handleLoyaltyDiscount}
            onClaimGift={handleGiftClaim}
            appliedDiscount={loyaltyDiscount}
            claimedGift={claimedGift}
          />
        )}

        {/* Order Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Order Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>₹{subtotal.toLocaleString()}</span>
              </div>
              
              {loyaltyDiscount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Loyalty Discount</span>
                  <span>-₹{loyaltyDiscount.toLocaleString()}</span>
                </div>
              )}
              
              <div className="flex justify-between">
                <span className="flex items-center gap-1">
                  <Truck className="h-4 w-4" />
                  Delivery Fee
                </span>
                <span>{deliveryFee === 0 ? 'Free' : `₹${deliveryFee}`}</span>
              </div>
              
              <Separator />
              
              <div className="flex justify-between text-lg font-semibold">
                <span>Total</span>
                <span>₹{finalTotal.toLocaleString()}</span>
              </div>
            </div>

            <div className="space-y-2 pt-4">
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting || cartItems.length === 0}
                className="w-full bg-emerald-600 hover:bg-emerald-700"
              >
                {isSubmitting ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Processing...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4" />
                    Place Order
                  </div>
                )}
              </Button>
              
              <Button
                onClick={onCancel}
                variant="outline"
                className="w-full"
                disabled={isSubmitting}
              >
                Cancel
              </Button>
            </div>

            <div className="text-xs text-gray-500 text-center">
              Orders will be confirmed by admin before processing
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EnhancedCheckoutForm;
