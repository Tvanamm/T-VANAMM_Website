
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface SupplyOrder {
  id: string;
  franchise_id: string;
  status: 'pending' | 'approved' | 'shipped' | 'delivered';
  items: any[];
  total_amount: number;
  requested_delivery_date: string;
  actual_delivery_date?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export const useSupplyOrders = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [orders, setOrders] = useState<SupplyOrder[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      // TODO: Implement with Neon DB
      console.log('Fetching supply orders');
      setOrders([]);
    } catch (error) {
      console.error('Error fetching supply orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const createOrder = async (orderData: {
    franchise_id: string;
    items: any[];
    total_amount: number;
    requested_delivery_date: string;
    notes?: string;
  }) => {
    try {
      // TODO: Implement with Neon DB
      console.log('Create supply order:', orderData);

      toast({
        title: "Order Created",
        description: "Supply order has been created successfully",
      });

      return { success: true };
    } catch (error) {
      console.error('Error creating supply order:', error);
      toast({
        title: "Error",
        description: "Failed to create supply order",
        variant: "destructive"
      });
      return { success: false };
    }
  };

  const updateOrderStatus = async (orderId: string, status: string) => {
    try {
      // TODO: Implement with Neon DB
      console.log('Update order status:', orderId, status);

      toast({
        title: "Order Updated",
        description: "Order status has been updated",
      });
    } catch (error) {
      console.error('Error updating order status:', error);
      toast({
        title: "Error",
        description: "Failed to update order status",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    if (user) {
      fetchOrders();
    }
  }, [user]);

  const pendingOrders = orders.filter(order => order.status === 'pending');
  const urgentOrders = orders.filter(order => {
    const deliveryDate = new Date(order.requested_delivery_date);
    const today = new Date();
    const diffTime = deliveryDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 3 && order.status !== 'delivered';
  });

  return {
    orders,
    loading,
    pendingOrders,
    urgentOrders,
    createOrder,
    updateOrderStatus,
    refetch: fetchOrders
  };
};
