import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { usePackingChecklist } from '@/hooks/usePackingChecklist';
import { Package, CheckCircle, AlertCircle } from 'lucide-react';

interface PackingWorkflowModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: any;
  onPackingComplete: () => Promise<void>;
}

const PackingWorkflowModal: React.FC<PackingWorkflowModalProps> = ({
  isOpen,
  onClose,
  order,
  onPackingComplete
}) => {
  const { 
    packingItems, 
    loading, 
    allPacked, 
    packedCount, 
    totalItems, 
    togglePacked, 
    createPackingChecklist 
  } = usePackingChecklist(order.id, isOpen);

  const hasInitialized = React.useRef(false);

  React.useEffect(() => {
    if (isOpen && !hasInitialized.current && packingItems.length === 0 && order.order_items?.length > 0) {
      hasInitialized.current = true;
      createPackingChecklist(order.order_items);
    }
    
    if (!isOpen) {
      hasInitialized.current = false;
    }
  }, [isOpen, packingItems.length, order.order_items]);

  const memoizedCreatePackingChecklist = React.useCallback(() => {
    if (order.order_items?.length > 0) {
      createPackingChecklist(order.order_items);
    }
  }, [createPackingChecklist, order.order_items]);

  React.useEffect(() => {
    if (allPacked && totalItems > 0) {
      onPackingComplete();
    }
  }, [allPacked, totalItems, onPackingComplete]);

  if (loading) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl">
          <div className="text-center py-8">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p>Loading packing checklist...</p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Packing Checklist - {order.franchise_name}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <p className="font-semibold text-blue-800">
                Progress: {packedCount}/{totalItems} items packed
              </p>
              {allPacked && totalItems > 0 ? (
                <Badge className="bg-green-100 text-green-800">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Complete
                </Badge>
              ) : (
                <Badge className="bg-yellow-100 text-yellow-800">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  In Progress
                </Badge>
              )}
            </div>
            <div className="w-full bg-blue-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${totalItems > 0 ? (packedCount / totalItems) * 100 : 0}%` }}
              />
            </div>
          </div>
          
          {packingItems.length > 0 ? (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {packingItems.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                  <div className="flex-1">
                    <p className="font-medium">{item.item_name}</p>
                    <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                    {item.packed && item.packed_at && (
                      <p className="text-xs text-green-600">
                        Packed on {new Date(item.packed_at).toLocaleString()}
                      </p>
                    )}
                  </div>
                  <Button
                    size="sm"
                    variant={item.packed ? "default" : "outline"}
                    onClick={() => togglePacked(item.id, !item.packed)}
                    className={item.packed ? "bg-green-600 hover:bg-green-700" : ""}
                  >
                    {item.packed ? (
                      <>
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Packed
                      </>
                    ) : (
                      <>
                        <Package className="h-4 w-4 mr-1" />
                        Pack
                      </>
                    )}
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No packing checklist available</p>
              <p className="text-sm text-gray-400">
                Order items will be loaded automatically
              </p>
            </div>
          )}
          
          {allPacked && totalItems > 0 && (
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <p className="font-semibold text-green-800">All items packed!</p>
              </div>
              <p className="text-sm text-green-600 mt-1">
                You can now proceed to mark this order as ready for shipping.
              </p>
            </div>
          )}

          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PackingWorkflowModal;