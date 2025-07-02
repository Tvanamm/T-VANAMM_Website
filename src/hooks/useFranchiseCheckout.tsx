
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { useFranchiseMembers } from '@/hooks/useFranchiseMembers';

interface CheckoutItem {
  id: number;
  name: string;
  quantity: number;
  price: number;
  unit: string;
}

interface CheckoutData {
  items: CheckoutItem[];
  totalAmount: number;
  deliveryFee: number;
  loyaltyPointsUsed: number;
  loyaltyGiftClaimed?: string;
  shippingAddress: string;
}

export const useFranchiseCheckout = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { franchiseMembers } = useFranchiseMembers();
  const [isCreatingOrder, setIsCreatingOrder] = useState(false);

  const createOrder = async (checkoutData: CheckoutData) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to place an order",
        variant: "destructive"
      });
      throw new Error('Authentication required');
    }

    try {
      setIsCreatingOrder(true);
      console.log('Creating order with data:', checkoutData);

      // Get franchise member data
      const franchiseMember = franchiseMembers.find(member => 
        member.user_id === user.id || member.email === user.email
      );

      if (!franchiseMember) {
        toast({
          title: "Access Denied",
          description: "Franchise member not found. Please contact support.",
          variant: "destructive"
        });
        throw new Error('Franchise member not found');
      }

      // Check if member has verified access
      if (franchiseMember.status !== 'active' && franchiseMember.status !== 'verified') {
        toast({
          title: "Account Not Verified",
          description: "Your account must be verified before placing orders.",
          variant: "destructive"
        });
        throw new Error('Account not verified');
      }

      // Prepare order items for the database function
      const orderItems = checkoutData.items.map(item => ({
        item_id: item.id,
        item_name: item.name,
        quantity: item.quantity,
        unit_price: item.price,
        total_price: item.price * item.quantity
      }));

      console.log('Calling create_franchise_order with:', {
        p_franchise_member_id: franchiseMember.id,
        p_franchise_name: franchiseMember.franchise_location,
        p_tvanamm_id: franchiseMember.tvanamm_id?.toString() || 'N/A',
        p_shipping_address: checkoutData.shippingAddress,
        p_total_amount: checkoutData.totalAmount,
        p_delivery_fee: checkoutData.deliveryFee,
        p_loyalty_points_used: checkoutData.loyaltyPointsUsed,
        p_loyalty_gift_claimed: checkoutData.loyaltyGiftClaimed,
        p_order_items: orderItems
      });

      // Create order using database function
      const { data: orderId, error: orderError } = await supabase.rpc('create_franchise_order', {
        p_franchise_member_id: franchiseMember.id,
        p_franchise_name: franchiseMember.franchise_location,
        p_tvanamm_id: franchiseMember.tvanamm_id?.toString() || 'N/A',
        p_shipping_address: checkoutData.shippingAddress,
        p_total_amount: checkoutData.totalAmount,
        p_delivery_fee: checkoutData.deliveryFee,
        p_loyalty_points_used: checkoutData.loyaltyPointsUsed,
        p_loyalty_gift_claimed: checkoutData.loyaltyGiftClaimed,
        p_order_items: orderItems
      });

      if (orderError) {
        console.error('Order creation error:', orderError);
        throw orderError;
      }

      if (!orderId) {
        throw new Error('Order creation failed - no order ID returned');
      }

      console.log('Order created successfully with ID:', orderId);

      toast({
        title: "Order Created Successfully! 🎉",
        description: "Your order has been placed and is awaiting admin confirmation.",
      });

      // Navigate back to order management
      navigate('/order');
      
      return { orderId, success: true };
    } catch (error: any) {
      console.error('Error creating order:', error);
      toast({
        title: "Order Creation Failed",
        description: error.message || "Failed to create order. Please try again.",
        variant: "destructive"
      });
      throw error;
    } finally {
      setIsCreatingOrder(false);
    }
  };

  return {
    createOrder,
    isCreatingOrder
  };
};
