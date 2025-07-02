
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';

export interface InventoryItem {
  id: number;
  name: string;
  category: string;
  stock: number;
  price: number;
  status: 'In Stock' | 'Low Stock' | 'Critical' | 'Out of Stock';
  unit: string;
  min_order: number;
  description: string;
  created_at: string;
  updated_at: string;
}

export interface FranchiseOrder {
  id: string;
  franchise_id: string;
  franchise_name: string;
  total_amount: number;
  status: 'pending' | 'confirmed' | 'packed' | 'shipped' | 'out-for-delivery' | 'delivered' | 'cancelled';
  estimated_delivery?: string;
  tracking_number?: string;
  shipping_address: string;
  created_at: string;
  updated_at: string;
  items?: OrderItem[];
}

export interface OrderItem {
  id: string;
  order_id: string;
  item_id: number;
  item_name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  created_at: string;
}

interface InventoryContextType {
  inventory: InventoryItem[];
  orders: FranchiseOrder[];
  updateStock: (itemId: number, newStock: number) => Promise<void>;
  updateOrderStatus: (orderId: string, status: FranchiseOrder['status'], trackingNumber?: string) => Promise<void>;
  createOrder: (orderData: Omit<FranchiseOrder, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  getAvailableStock: (itemId: number) => number;
  loading: boolean;
  error: string | null;
}

const InventoryContext = createContext<InventoryContextType | undefined>(undefined);

export const useInventory = () => {
  const context = useContext(InventoryContext);
  if (!context) {
    throw new Error('useInventory must be used within an InventoryProvider');
  }
  return context;
};

export const InventoryProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [orders, setOrders] = useState<FranchiseOrder[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Mock data for demonstration
  useEffect(() => {
    // TODO: Replace with Neon DB calls
    const mockInventory: InventoryItem[] = [
      {
        id: 1,
        name: 'Premium Green Tea',
        category: 'Green Tea',
        stock: 50,
        price: 299,
        status: 'In Stock',
        unit: 'kg',
        min_order: 1,
        description: 'Premium quality green tea',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ];
    setInventory(mockInventory);
    setLoading(false);
  }, []);

  const updateStock = async (itemId: number, newStock: number) => {
    // TODO: Implement with Neon DB
    console.log('Update stock:', itemId, newStock);
  };

  const updateOrderStatus = async (orderId: string, status: FranchiseOrder['status'], trackingNumber?: string) => {
    // TODO: Implement with Neon DB
    console.log('Update order status:', orderId, status, trackingNumber);
  };

  const createOrder = async (orderData: Omit<FranchiseOrder, 'id' | 'created_at' | 'updated_at'>) => {
    // TODO: Implement with Neon DB
    console.log('Create order:', orderData);
  };

  const getAvailableStock = (itemId: number) => {
    const item = inventory.find(item => item.id === itemId);
    return item ? item.stock : 0;
  };

  return (
    <InventoryContext.Provider value={{
      inventory,
      orders,
      updateStock,
      updateOrderStatus,
      createOrder,
      getAvailableStock,
      loading,
      error
    }}>
      {children}
    </InventoryContext.Provider>
  );
};
