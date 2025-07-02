
import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface PackingItem {
  id: string;
  order_id: string;
  item_id: number;
  item_name: string;
  quantity: number;
  packed: boolean;
  packed_by: string | null;
  packed_at: string | null;
}

export const usePackingChecklist = (orderId: string, enabled: boolean = true) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [packingItems, setPackingItems] = useState<PackingItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const createTimeoutRef = useRef<NodeJS.Timeout>();

  const fetchPackingItems = useCallback(async () => {
    if (!orderId || !enabled) return;

    try {
      setLoading(true);
      console.log('Fetching packing items for order:', orderId);
      
      const { data, error } = await supabase
        .from('order_packing_checklist')
        .select('*')
        .eq('order_id', orderId)
        .order('item_name');

      if (error) throw error;
      
      console.log('Packing items fetched:', data);
      setPackingItems(data || []);
    } catch (error) {
      console.error('Error fetching packing items:', error);
    } finally {
      setLoading(false);
    }
  }, [orderId, enabled]);

  const createPackingChecklist = useCallback(async (orderItems: any[]) => {
    if (!user || !orderId || creating || !enabled) return;

    // Debounce multiple calls
    if (createTimeoutRef.current) {
      clearTimeout(createTimeoutRef.current);
    }

    createTimeoutRef.current = setTimeout(async () => {
      try {
        setCreating(true);
        console.log('Creating packing checklist for order items:', orderItems);
        
        // Check if checklist already exists
        const { data: existing } = await supabase
          .from('order_packing_checklist')
          .select('id')
          .eq('order_id', orderId)
          .limit(1);

        if (existing && existing.length > 0) {
          console.log('Packing checklist already exists, skipping creation');
          return;
        }

        const packingItems = orderItems.map(item => ({
          order_id: orderId,
          item_id: item.item_id,
          item_name: item.item_name,
          quantity: item.quantity,
          packed: false
        }));

        // Use upsert to handle race conditions
        const { error } = await supabase
          .from('order_packing_checklist')
          .upsert(packingItems, {
            onConflict: 'order_id,item_id',
            ignoreDuplicates: true
          });

        if (error && !error.message.includes('duplicate')) {
          throw error;
        }

        await fetchPackingItems();
        
        if (!error) {
          toast({
            title: "Success",
            description: "Packing checklist created successfully",
          });
        }
      } catch (error) {
        console.error('Error creating packing checklist:', error);
        toast({
          title: "Error",
          description: "Failed to create packing checklist",
          variant: "destructive"
        });
      } finally {
        setCreating(false);
      }
    }, 300);
  }, [user, orderId, creating, enabled, fetchPackingItems, toast]);

  const togglePacked = async (itemId: string, packed: boolean) => {
    if (!user) return;

    try {
      console.log('Toggle packed:', itemId, packed);

      const { error } = await supabase
        .from('order_packing_checklist')
        .update({
          packed,
          packed_by: packed ? user.id : null,
          packed_at: packed ? new Date().toISOString() : null
        })
        .eq('id', itemId);

      if (error) throw error;

      setPackingItems(prev => 
        prev.map(item => 
          item.id === itemId 
            ? { 
                ...item, 
                packed,
                packed_by: packed ? user.id : null,
                packed_at: packed ? new Date().toISOString() : null
              }
            : item
        )
      );

      toast({
        title: "Success",
        description: packed ? "Item marked as packed" : "Item unmarked as packed",
      });
    } catch (error) {
      console.error('Error updating packing status:', error);
      toast({
        title: "Error",
        description: "Failed to update packing status",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    if (orderId && enabled) {
      fetchPackingItems();

      // Set up real-time subscription with debounced updates
      let updateTimeout: NodeJS.Timeout;
      const channel = supabase
        .channel(`packing_checklist_${orderId}`)
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'order_packing_checklist',
          filter: `order_id=eq.${orderId}`
        }, (payload: any) => {
          console.log('Packing checklist updated:', payload);
          
          // Debounce updates to prevent excessive refetching
          clearTimeout(updateTimeout);
          updateTimeout = setTimeout(() => {
            fetchPackingItems();
          }, 100);
        })
        .subscribe();

      return () => {
        clearTimeout(updateTimeout);
        if (createTimeoutRef.current) {
          clearTimeout(createTimeoutRef.current);
        }
        supabase.removeChannel(channel);
      };
    }
  }, [orderId, enabled, fetchPackingItems]);

  const allPacked = packingItems.length > 0 && packingItems.every(item => item.packed);
  const packedCount = packingItems.filter(item => item.packed).length;

  return {
    packingItems,
    loading: loading || creating,
    allPacked,
    packedCount,
    totalItems: packingItems.length,
    togglePacked,
    createPackingChecklist,
    refetch: fetchPackingItems
  };
};
