import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Truck, IndianRupee } from 'lucide-react';

interface DeliveryFeeConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: any;
  onConfirmed: () => Promise<void>;
}

const DeliveryFeeConfirmationModal: React.FC<DeliveryFeeConfirmationModalProps> = ({
  isOpen,
  onClose,
  order,
  onConfirmed
}) => {
  const { toast } = useToast();
  const [deliveryFee, setDeliveryFee] = useState(50);
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    try {
      setLoading(true);
      
      const { error } = await supabase
        .from('franchise_orders')
        .update({
          status: 'confirmed',
          delivery_fee_override: deliveryFee,
          updated_at: new Date().toISOString()
        })
        .eq('id', order.id);

      if (error) throw error;

      // Create notification for franchise about confirmation
      await supabase
        .from('notifications')
        .insert([{
          type: 'order_confirmed',
          title: 'Order Confirmed',
          message: `Your order has been confirmed with delivery fee ₹${deliveryFee}. Please proceed with payment.`,
          user_id: order.franchise_members?.user_id,
          data: {
            order_id: order.id,
            delivery_fee: deliveryFee,
            total_amount: order.total_amount + deliveryFee
          }
        }]);

      toast({
        title: "Order Confirmed",
        description: `Order confirmed with delivery fee ₹${deliveryFee}`,
      });

      await onConfirmed();
      onClose();
    } catch (error) {
      console.error('Error confirming order:', error);
      toast({
        title: "Error",
        description: "Failed to confirm order",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Truck className="h-5 w-5" />
            Confirm Order & Set Delivery Fee
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium mb-2">Order Details</h4>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span>Franchise:</span>
                <span>{order.franchise_name}</span>
              </div>
              <div className="flex justify-between">
                <span>Order Amount:</span>
                <span>₹{order.total_amount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Items:</span>
                <span>{order.order_items?.length || 0} items</span>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="deliveryFee">Delivery Fee</Label>
            <div className="relative">
              <IndianRupee className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
              <Input
                id="deliveryFee"
                type="number"
                min="0"
                value={deliveryFee}
                onChange={(e) => setDeliveryFee(Number(e.target.value))}
                className="pl-10"
                placeholder="Enter delivery fee"
              />
            </div>
          </div>

          <div className="bg-blue-50 p-3 rounded-lg">
            <div className="flex justify-between font-medium">
              <span>Total Amount (with delivery):</span>
              <span>₹{(order.total_amount + deliveryFee).toLocaleString()}</span>
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={loading}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirm}
              disabled={loading}
              className="flex-1"
            >
              {loading ? 'Confirming...' : 'Confirm Order'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DeliveryFeeConfirmationModal;