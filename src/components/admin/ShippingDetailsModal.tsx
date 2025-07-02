import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Truck, User, Phone } from 'lucide-react';

interface ShippingDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: any;
  onShipped: () => Promise<void>;
}

const ShippingDetailsModal: React.FC<ShippingDetailsModalProps> = ({
  isOpen,
  onClose,
  order,
  onShipped
}) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [shippingDetails, setShippingDetails] = useState({
    vehicleNumber: '',
    driverName: '',
    driverPhone: '',
    transportCompany: '',
    estimatedDelivery: '',
    notes: ''
  });

  const generateTrackingNumber = () => {
    return `TRK${Date.now()}${Math.floor(Math.random() * 1000)}`;
  };

  const handleShip = async () => {
    if (!shippingDetails.vehicleNumber || !shippingDetails.driverName) {
      toast({
        title: "Required Fields Missing",
        description: "Please fill in vehicle number and driver name",
        variant: "destructive"
      });
      return;
    }

    try {
      setLoading(true);
      const trackingNumber = generateTrackingNumber();
      
      const { error } = await supabase
        .from('franchise_orders')
        .update({
          status: 'shipped',
          tracking_number: trackingNumber,
          shipped_at: new Date().toISOString(),
          shipping_details: shippingDetails,
          estimated_delivery: shippingDetails.estimatedDelivery || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', order.id);

      if (error) throw error;

      // Create notification for franchise about shipping
      await supabase
        .from('notifications')
        .insert([{
          type: 'order_shipped',
          title: 'Order Shipped',
          message: `Your order has been shipped! Tracking number: ${trackingNumber}`,
          user_id: order.franchise_members?.user_id,
          data: {
            order_id: order.id,
            tracking_number: trackingNumber,
            shipping_details: shippingDetails,
            estimated_delivery: shippingDetails.estimatedDelivery
          }
        }]);

      toast({
        title: "Order Shipped",
        description: `Order shipped with tracking number: ${trackingNumber}`,
      });

      await onShipped();
      onClose();
    } catch (error) {
      console.error('Error shipping order:', error);
      toast({
        title: "Error",
        description: "Failed to mark order as shipped",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Truck className="h-5 w-5" />
            Enter Shipping Details
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium mb-2">Order Information</h4>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span>Order ID:</span>
                <span>#{order.id.slice(-8)}</span>
              </div>
              <div className="flex justify-between">
                <span>Franchise:</span>
                <span>{order.franchise_name}</span>
              </div>
              <div className="flex justify-between">
                <span>Destination:</span>
                <span className="text-right">{order.shipping_address}</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="vehicleNumber">Vehicle Number *</Label>
              <Input
                id="vehicleNumber"
                value={shippingDetails.vehicleNumber}
                onChange={(e) => setShippingDetails(prev => ({
                  ...prev,
                  vehicleNumber: e.target.value.toUpperCase()
                }))}
                placeholder="e.g., KA01AB1234"
                className="uppercase"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="transportCompany">Transport Company</Label>
              <Input
                id="transportCompany"
                value={shippingDetails.transportCompany}
                onChange={(e) => setShippingDetails(prev => ({
                  ...prev,
                  transportCompany: e.target.value
                }))}
                placeholder="e.g., BlueDart"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="driverName">Driver Name *</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                <Input
                  id="driverName"
                  value={shippingDetails.driverName}
                  onChange={(e) => setShippingDetails(prev => ({
                    ...prev,
                    driverName: e.target.value
                  }))}
                  placeholder="Driver's full name"
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="driverPhone">Driver Phone</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                <Input
                  id="driverPhone"
                  type="tel"
                  value={shippingDetails.driverPhone}
                  onChange={(e) => setShippingDetails(prev => ({
                    ...prev,
                    driverPhone: e.target.value
                  }))}
                  placeholder="Phone number"
                  className="pl-10"
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="estimatedDelivery">Estimated Delivery Date</Label>
            <Input
              id="estimatedDelivery"
              type="date"
              value={shippingDetails.estimatedDelivery}
              onChange={(e) => setShippingDetails(prev => ({
                ...prev,
                estimatedDelivery: e.target.value
              }))}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Additional Notes</Label>
            <Textarea
              id="notes"
              value={shippingDetails.notes}
              onChange={(e) => setShippingDetails(prev => ({
                ...prev,
                notes: e.target.value
              }))}
              placeholder="Any special instructions or notes..."
              rows={3}
            />
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
              onClick={handleShip}
              disabled={loading}
              className="flex-1"
            >
              {loading ? 'Shipping...' : 'Mark as Shipped'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ShippingDetailsModal;