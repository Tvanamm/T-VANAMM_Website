
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface StockItem {
  id: string;
  name: string;
  description?: string;
  category: string;
  price: number;
  stock: number;
  unit: string;
  supplier_id?: string;
  created_at: string;
  updated_at: string;
}

export interface StockOrder {
  id: string;
  order_number: string;
  franchise_id: string;
  total_amount: number;
  status: 'pending' | 'confirmed' | 'packed' | 'shipped' | 'delivered' | 'cancelled';
  shipping_address: string;
  tracking_number?: string;
  estimated_delivery?: string;
  created_at: string;
  updated_at: string;
  items: StockOrderItem[];
}

export interface StockOrderItem {
  id: string;
  order_id: string;
  item_name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
}

export interface CartItem {
  item: StockItem;
  quantity: number;
}

export const useStockOrdering = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [stockItems, setStockItems] = useState<StockItem[]>([]);
  const [stockOrders, setStockOrders] = useState<StockOrder[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);

  // Mock stock items
  const mockStockItems: StockItem[] = [
    {
      id: '1',
      name: 'Coffee Beans - Premium',
      description: 'High quality arabica coffee beans',
      category: 'Beverages',
      price: 500,
      stock: 50,
      unit: 'kg',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: '2',
      name: 'Paper Cups - Large',
      description: 'Disposable paper cups for hot beverages',
      category: 'Supplies',
      price: 25,
      stock: 1000,
      unit: 'pieces',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: '3',
      name: 'Sugar Packets',
      description: 'Individual sugar packets',
      category: 'Ingredients',
      price: 200,
      stock: 100,
      unit: 'box',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ];

  useEffect(() => {
    if (user && ['franchise', 'admin', 'owner'].includes(user.role)) {
      fetchStockItems();
      fetchStockOrders();
    }
  }, [user]);

  const fetchStockItems = async () => {
    try {
      setLoading(true);
      // TODO: Implement with Neon DB
      console.log('Fetching stock items');
      setStockItems(mockStockItems);
    } catch (error) {
      console.error('Error fetching stock items:', error);
      toast({
        title: "Error",
        description: "Failed to fetch stock items",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchStockOrders = async () => {
    try {
      // TODO: Implement with Neon DB
      console.log('Fetching stock orders');
      setStockOrders([]);
    } catch (error) {
      console.error('Error fetching stock orders:', error);
    }
  };

  const createStockOrder = async (orderData: {
    item_id: number;
    item_name: string;
    requested_quantity: number;
    urgency: 'low' | 'medium' | 'high';
    notes?: string;
  }) => {
    try {
      // TODO: Implement with Neon DB
      console.log('Creating stock order:', orderData);
      
      toast({
        title: "Stock Order Created",
        description: "Your stock order has been submitted successfully",
      });

      await fetchStockOrders();
      return { success: true, orderId: `order_${Date.now()}` };
    } catch (error) {
      console.error('Error creating stock order:', error);
      toast({
        title: "Error",
        description: "Failed to create stock order",
        variant: "destructive"
      });
      return { success: false, orderId: null };
    }
  };

  const approveStockOrder = async (orderId: string, approvedQuantity: number) => {
    try {
      // TODO: Implement with Neon DB
      console.log('Approving stock order:', orderId, approvedQuantity);
      
      toast({
        title: "Order Approved",
        description: "Stock order has been approved successfully",
      });

      await fetchStockOrders();
      return true;
    } catch (error) {
      console.error('Error approving stock order:', error);
      toast({
        title: "Error",
        description: "Failed to approve stock order",
        variant: "destructive"
      });
      return false;
    }
  };

  // Cart functionality
  const addToCart = (item: StockItem, quantity: number) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(cartItem => cartItem.item.id === item.id);
      if (existingItem) {
        return prevCart.map(cartItem =>
          cartItem.item.id === item.id
            ? { ...cartItem, quantity: cartItem.quantity + quantity }
            : cartItem
        );
      } else {
        return [...prevCart, { item, quantity }];
      }
    });

    toast({
      title: "Added to Cart",
      description: `${item.name} has been added to your cart`,
    });
  };

  const removeFromCart = (itemId: string) => {
    setCart(prevCart => prevCart.filter(cartItem => cartItem.item.id !== itemId));
    
    toast({
      title: "Removed from Cart",
      description: "Item has been removed from your cart",
    });
  };

  const updateCartQuantity = (itemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(itemId);
      return;
    }

    setCart(prevCart =>
      prevCart.map(cartItem =>
        cartItem.item.id === itemId
          ? { ...cartItem, quantity: newQuantity }
          : cartItem
      )
    );
  };

  const placeOrder = async (shippingAddress: string) => {
    if (cart.length === 0) {
      return { success: false, orderId: null };
    }

    try {
      const orderId = `order_${Date.now()}`;
      const orderNumber = `ORD-${orderId.slice(-8).toUpperCase()}`;
      
      const newOrder: StockOrder = {
        id: orderId,
        order_number: orderNumber,
        franchise_id: user?.id || '',
        total_amount: cartTotal,
        status: 'pending',
        shipping_address: shippingAddress,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        items: cart.map(cartItem => ({
          id: `item_${Date.now()}_${cartItem.item.id}`,
          order_id: orderId,
          item_name: cartItem.item.name,
          quantity: cartItem.quantity,
          unit_price: cartItem.item.price,
          total_price: cartItem.item.price * cartItem.quantity
        }))
      };

      // TODO: Implement with Neon DB
      console.log('Placing order:', newOrder);
      
      setStockOrders(prev => [newOrder, ...prev]);
      setCart([]); // Clear cart after successful order

      return { success: true, orderId };
    } catch (error) {
      console.error('Error placing order:', error);
      return { success: false, orderId: null };
    }
  };

  const cartTotal = cart.reduce((total, cartItem) => 
    total + (cartItem.item.price * cartItem.quantity), 0
  );

  const cartItemsCount = cart.reduce((total, cartItem) => total + cartItem.quantity, 0);

  const refetch = async () => {
    await fetchStockItems();
    await fetchStockOrders();
  };

  return {
    stockItems,
    stockOrders,
    cart,
    loading,
    createStockOrder,
    approveStockOrder,
    addToCart,
    removeFromCart,
    updateCartQuantity,
    placeOrder,
    cartTotal,
    cartItemsCount,
    refetch,
    // Legacy properties for backward compatibility
    orders: stockOrders
  };
};
