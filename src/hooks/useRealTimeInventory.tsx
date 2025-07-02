
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface InventoryItem {
  id: number;
  name: string;
  category: string;
  unit: string;
  description: string | null;
  stock: number;
  price: number;
  min_order: number;
  status: string;
  gst_rate: number;
  created_at: string;
  updated_at: string;
}

export const useRealTimeInventory = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchInventory = async () => {
    try {
      const { data, error } = await supabase
        .from('inventory')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      console.log('Fetched inventory:', data);
      setInventory(data || []);
    } catch (error) {
      console.error('Error fetching inventory:', error);
    } finally {
      setLoading(false);
    }
  };

  const addProduct = async (productData: {
    name: string;
    category: string;
    stock: number;
    price: number;
    unit: string;
    description?: string;
    min_order: number;
    gst_rate?: number;
  }) => {
    if (!user || !['admin', 'owner'].includes(user.role)) {
      toast({
        title: "Access Denied",
        description: "Only admin and owner can add products",
        variant: "destructive"
      });
      return { success: false };
    }

    try {
      console.log('Adding product:', productData);
      const { error } = await supabase
        .from('inventory')
        .insert([{
          ...productData,
          gst_rate: productData.gst_rate || 18,
          status: productData.stock <= 0 ? 'Out of Stock' : productData.stock <= (productData.min_order || 1) ? 'Low Stock' : 'In Stock'
        }]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Product added successfully",
      });

      await fetchInventory();
      return { success: true };
    } catch (error) {
      console.error('Error adding product:', error);
      toast({
        title: "Error",
        description: "Failed to add product",
        variant: "destructive"
      });
      return { success: false };
    }
  };

  const updateStock = async (id: number, newStock: number) => {
    if (!user || !['admin', 'owner'].includes(user.role)) {
      toast({
        title: "Access Denied",
        description: "Only admin and owner can update stock",
        variant: "destructive"
      });
      return { success: false };
    }

    try {
      console.log('Updating stock for item:', id, 'new stock:', newStock);
      
      // Get the item first to check min_order
      const { data: item } = await supabase
        .from('inventory')
        .select('min_order')
        .eq('id', id)
        .single();

      const minOrder = item?.min_order || 1;
      const newStatus = newStock <= 0 ? 'Out of Stock' : newStock <= minOrder ? 'Low Stock' : 'In Stock';

      const { error } = await supabase
        .from('inventory')
        .update({ 
          stock: newStock,
          status: newStatus
        })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Stock updated successfully",
      });

      await fetchInventory();
      return { success: true };
    } catch (error) {
      console.error('Error updating stock:', error);
      toast({
        title: "Error",
        description: "Failed to update stock",
        variant: "destructive"
      });
      return { success: false };
    }
  };

  const deleteProduct = async (id: number) => {
    if (!user || !['admin', 'owner'].includes(user.role)) {
      toast({
        title: "Access Denied",
        description: "Only admin and owner can delete products",
        variant: "destructive"
      });
      return { success: false };
    }

    try {
      console.log('Deleting product with ID:', id);

      // Check if item has any references in orders first
      const { data: orderItemsCheck } = await supabase
        .from('order_items')
        .select('id')
        .eq('item_id', id)
        .limit(1);

      const { data: packingCheck } = await supabase
        .from('order_packing_checklist')
        .select('id')
        .eq('item_id', id)
        .limit(1);

      if (orderItemsCheck && orderItemsCheck.length > 0) {
        toast({
          title: "Cannot Delete Product",
          description: "This product is referenced in existing orders and cannot be deleted. You can set stock to 0 to mark it as unavailable.",
          variant: "destructive"
        });
        return { success: false };
      }

      if (packingCheck && packingCheck.length > 0) {
        toast({
          title: "Cannot Delete Product", 
          description: "This product is referenced in packing checklists and cannot be deleted. You can set stock to 0 to mark it as unavailable.",
          variant: "destructive"
        });
        return { success: false };
      }

      // If no references, proceed with deletion
      const { error } = await supabase
        .from('inventory')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Product deleted successfully",
      });

      await fetchInventory();
      return { success: true };
    } catch (error) {
      console.error('Error deleting product:', error);
      toast({
        title: "Error",
        description: "Failed to delete product. It may be referenced in existing orders.",
        variant: "destructive"
      });
      return { success: false };
    }
  };

  const generateInventoryReport = async () => {
    try {
      const totalValue = inventory.reduce((sum, item) => sum + (item.stock * item.price), 0);
      const lowStockCount = inventory.filter(item => item.stock <= item.min_order).length;
      const outOfStockCount = inventory.filter(item => item.stock === 0).length;

      const reportData = {
        totalItems: inventory.length,
        totalValue: totalValue,
        lowStockItems: lowStockCount,
        outOfStockItems: outOfStockCount,
        generatedAt: new Date().toISOString(),
        items: inventory
      };

      console.log('Inventory Report:', reportData);
      
      toast({
        title: "Report Generated",
        description: "Inventory report has been generated successfully",
      });

      return reportData;
    } catch (error) {
      console.error('Error generating report:', error);
      toast({
        title: "Error",
        description: "Failed to generate inventory report",
        variant: "destructive"
      });
      return null;
    }
  };

  useEffect(() => {
    fetchInventory();

    // Set up real-time subscription
    const channel = supabase
      .channel('inventory_realtime')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'inventory'
      }, (payload) => {
        console.log('Real-time inventory update:', payload);
        fetchInventory();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const lowStockItems = inventory.filter(item => item.stock <= item.min_order && item.stock > 0);
  const outOfStockItems = inventory.filter(item => item.stock <= 0);

  return {
    inventory,
    loading,
    lowStockItems,
    outOfStockItems,
    addProduct,
    updateStock,
    deleteProduct,
    generateInventoryReport,
    refetch: fetchInventory
  };
};
