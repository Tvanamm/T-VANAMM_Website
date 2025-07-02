
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface InventoryItem {
  id: string;
  name: string;
  description?: string;
  category: string;
  price: number;
  stock: number;
  min_stock_level: number;
  status: string;
  unit: string;
  created_at: string;
  updated_at?: string;
}

export const useEnhancedInventory = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchInventory = async () => {
    try {
      setLoading(true);
      // TODO: Implement with Neon DB
      console.log('Fetching inventory');
      
      // Mock data for now
      const mockInventory: InventoryItem[] = [
        {
          id: '1',
          name: 'Premium Green Tea',
          description: 'High quality green tea',
          category: 'Green Tea',
          price: 299,
          stock: 50,
          min_stock_level: 10,
          status: 'In Stock',
          unit: 'kg',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ];

      setInventory(mockInventory);
    } catch (error) {
      console.error('Error fetching inventory:', error);
      toast({
        title: "Error",
        description: "Failed to load inventory",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const addInventoryItem = async (itemData: Omit<InventoryItem, 'id' | 'created_at' | 'updated_at'>) => {
    if (!user || !['admin', 'owner'].includes(user.role)) {
      toast({
        title: "Access Denied",
        description: "Only admin and owner can add inventory items",
        variant: "destructive"
      });
      return { success: false };
    }

    try {
      // TODO: Implement with Neon DB
      console.log('Add inventory item:', itemData);

      toast({
        title: "Success",
        description: "Inventory item added successfully",
      });

      return { success: true };
    } catch (error: any) {
      console.error('Error adding inventory item:', error);
      toast({
        title: "Error",
        description: "Failed to add inventory item",
        variant: "destructive"
      });
      return { success: false };
    }
  };

  const updateInventoryItem = async (id: string, updates: Partial<InventoryItem>) => {
    if (!user || !['admin', 'owner'].includes(user.role)) {
      toast({
        title: "Access Denied",
        description: "Only admin and owner can update inventory items",
        variant: "destructive"
      });
      return { success: false };
    }

    try {
      // TODO: Implement with Neon DB
      console.log('Update inventory item:', id, updates);

      toast({
        title: "Success",
        description: "Inventory item updated successfully",
      });

      return { success: true };
    } catch (error: any) {
      console.error('Error updating inventory item:', error);
      toast({
        title: "Error",
        description: "Failed to update inventory item",
        variant: "destructive"
      });
      return { success: false };
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  return {
    inventory,
    loading,
    addInventoryItem,
    updateInventoryItem,
    refetch: fetchInventory,
    lowStockItems: inventory.filter(item => item.stock <= item.min_stock_level),
    outOfStockItems: inventory.filter(item => item.stock === 0),
    totalValue: inventory.reduce((sum, item) => sum + (item.price * item.stock), 0),
    totalItems: inventory.length
  };
};
