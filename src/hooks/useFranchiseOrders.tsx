
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface FranchiseOrder {
  id: string;
  franchise_name: string;
  total_amount: number;
  status: 'pending' | 'confirmed' | 'paid' | 'packing' | 'shipped' | 'delivered' | 'cancelled';
  tracking_number?: string;
  shipping_address: string;
  estimated_delivery?: string;
  created_at: string;
  updated_at: string;
  delivery_fee_override?: number;
  order_items?: Array<{
    item_name: string;
    quantity: number;
    unit_price: number;
    total_price: number;
  }>;
}

export const useFranchiseOrders = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [orders, setOrders] = useState<FranchiseOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOrders = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      console.log('Fetching orders for user:', user.id);
      
      let franchiseMemberId = user.franchiseMemberId;
      
      // If we don't have franchise member ID, try to get it
      if (!franchiseMemberId) {
        const { data: franchiseMember, error: memberError } = await supabase
          .from('franchise_members')
          .select('id')
          .eq('user_id', user.id)
          .maybeSingle();

        if (memberError) {
          console.error('Error fetching franchise member:', memberError);
          setError('Unable to load franchise profile. Please contact support.');
          setLoading(false);
          return;
        }

        if (!franchiseMember) {
          console.log('No franchise member found for user');
          setError('Franchise profile not found. Please complete your registration.');
          setLoading(false);
          return;
        }

        franchiseMemberId = franchiseMember.id;
      }

      console.log('Found franchise member ID:', franchiseMemberId);

      // Get orders for this franchise member
      const { data, error } = await supabase
        .from('franchise_orders')
        .select(`
          *,
          order_items(*)
        `)
        .eq('franchise_member_id', franchiseMemberId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching franchise orders:', error);
        setError(`Failed to load orders: ${error.message}`);
        return;
      }

      console.log('Fetched orders:', data);
      setOrders(data || []);
      setError(null);
    } catch (error) {
      console.error('Unexpected error fetching franchise orders:', error);
      setError('An unexpected error occurred while loading orders');
    } finally {
      setLoading(false);
    }
  };

  const createOrder = async (orderData: {
    items: Array<{
      item_name: string;
      quantity: number;
      unit_price: number;
    }>;
    shipping_address: string;
    franchise_name: string;
    delivery_fee?: number;
  }) => {
    if (!user) {
      console.error('No user found');
      toast({
        title: "Error",
        description: "Please log in to place an order",
        variant: "destructive"
      });
      return false;
    }

    try {
      console.log('Creating order for user:', user.id);
      console.log('Order data:', orderData);

      let franchiseMemberId = user.franchiseMemberId;
      
      // Get franchise member ID if not available
      if (!franchiseMemberId) {
        const { data: franchiseMember, error: memberError } = await supabase
          .from('franchise_members')
          .select('id, franchise_location')
          .eq('user_id', user.id)
          .maybeSingle();

        if (memberError || !franchiseMember) {
          console.error('Error fetching franchise member:', memberError);
          toast({
            title: "Error",
            description: "Franchise profile not found. Please complete your profile first.",
            variant: "destructive"
          });
          return false;
        }

        franchiseMemberId = franchiseMember.id;
      }

      const itemsTotal = orderData.items.reduce((sum, item) => 
        sum + (item.quantity * item.unit_price), 0
      );
      
      const totalAmount = itemsTotal + (orderData.delivery_fee || 0);

      console.log('Calculated totals - Items:', itemsTotal, 'Delivery:', orderData.delivery_fee, 'Total:', totalAmount);

      // Create the order
      const orderPayload = {
        franchise_member_id: franchiseMemberId,
        franchise_name: orderData.franchise_name,
        total_amount: totalAmount,
        shipping_address: orderData.shipping_address,
        status: 'pending' as const
      };

      console.log('Order payload:', orderPayload);

      const { data: order, error: orderError } = await supabase
        .from('franchise_orders')
        .insert(orderPayload)
        .select()
        .single();

      if (orderError) {
        console.error('Error creating order:', orderError);
        toast({
          title: "Error",
          description: `Failed to create order: ${orderError.message}`,
          variant: "destructive"
        });
        return false;
      }

      console.log('Created order:', order);

      // Create order items
      const orderItems = orderData.items.map(item => ({
        order_id: order.id,
        item_name: item.item_name,
        quantity: item.quantity,
        unit_price: item.unit_price,
        total_price: item.quantity * item.unit_price
      }));

      console.log('Creating order items:', orderItems);

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) {
        console.error('Error creating order items:', itemsError);
        toast({
          title: "Warning",
          description: "Order created but there was an issue with order items",
        });
      }

      // Create packing checklist entries
      const packingItems = orderData.items.map(item => ({
        order_id: order.id,
        item_name: item.item_name,
        quantity: item.quantity,
        packed: false
      }));

      const { error: packingError } = await supabase
        .from('order_packing_checklist')
        .insert(packingItems);

      if (packingError) {
        console.error('Error creating packing checklist:', packingError);
      }

      // Create notification for owners/admins about new order
      const { error: notificationError } = await supabase
        .from('notifications')
        .insert([{
          type: 'new_franchise_order',
          title: 'New Franchise Order',
          message: `New order #${order.id.slice(0, 8)} from ${orderData.franchise_name} for ₹${totalAmount.toLocaleString()}`,
          data: {
            order_id: order.id,
            franchise_name: orderData.franchise_name,
            total_amount: totalAmount,
            status: 'pending',
            sender_name: orderData.franchise_name,
            sender_id: user.id
          }
        }]);

      if (notificationError) {
        console.error('Error creating notification:', notificationError);
      }

      toast({
        title: "Success",
        description: "Order created successfully!"
      });

      await fetchOrders();
      return true;
    } catch (error) {
      console.error('Unexpected error creating order:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred while creating the order",
        variant: "destructive"
      });
      return false;
    }
  };

  useEffect(() => {
    if (user) {
      fetchOrders();

      // Set up real-time subscription for orders
      const channel = supabase
        .channel('franchise_orders_realtime')
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'franchise_orders'
        }, (payload) => {
          console.log('Real-time order update received:', payload);
          fetchOrders();
        })
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    } else {
      setLoading(false);
    }
  }, [user?.id]);

  return {
    orders,
    loading,
    error,
    createOrder,
    refetch: fetchOrders
  };
};
