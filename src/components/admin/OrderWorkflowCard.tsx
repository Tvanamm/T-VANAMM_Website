import React, { memo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import DeliveryFeeConfirmationModal from './DeliveryFeeConfirmationModal';
import PackingWorkflowModal from './PackingWorkflowModal';
import ShippingDetailsModal from './ShippingDetailsModal';
import { 
  Package, 
  User,
  Mail,
  MapPin,
  Calendar,
  IndianRupee,
  CreditCard,
  Truck,
  CheckCircle,
  Clock,
  AlertCircle
} from 'lucide-react';

interface OrderWorkflowCardProps {
  order: any;
  onOrderUpdated: () => Promise<void>;
}

const OrderWorkflowCard = memo(({ order, onOrderUpdated }: OrderWorkflowCardProps) => {
  const [showDeliveryModal, setShowDeliveryModal] = useState(false);
  const [showPackingModal, setShowPackingModal] = useState(false);
  const [showShippingModal, setShowShippingModal] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'confirmed': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'paid': return 'bg-green-100 text-green-800 border-green-300';
      case 'packing': return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'packed': return 'bg-indigo-100 text-indigo-800 border-indigo-300';
      case 'shipped': return 'bg-cyan-100 text-cyan-800 border-cyan-300';
      case 'delivered': return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'confirmed': return <CheckCircle className="h-4 w-4" />;
      case 'paid': return <CreditCard className="h-4 w-4" />;
      case 'packing': 
      case 'packed': return <Package className="h-4 w-4" />;
      case 'shipped': return <Truck className="h-4 w-4" />;
      case 'delivered': return <CheckCircle className="h-4 w-4" />;
      case 'cancelled': return <AlertCircle className="h-4 w-4" />;
      default: return <Package className="h-4 w-4" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Card className="border-l-4 border-l-primary/20 hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Package className="h-4 w-4 text-muted-foreground" />
              <span className="font-mono text-sm text-muted-foreground">
                Order #{order.id.slice(-8)}
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">{order.franchise_members?.name}</span>
              <Badge variant="outline" className="text-xs">
                ID: {order.franchise_members?.tvanamm_id}
              </Badge>
            </div>
            
            {order.franchise_members?.email && (
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  {order.franchise_members.email}
                </span>
              </div>
            )}
          </div>
          
          <div className="text-right space-y-2">
            <Badge className={`${getStatusColor(order.status)} font-medium flex items-center gap-1`}>
              {getStatusIcon(order.status)}
              {order.status.toUpperCase()}
            </Badge>
            <div className="flex items-center gap-1 text-lg font-bold text-green-600">
              <IndianRupee className="h-4 w-4" />
              {order.total_amount?.toLocaleString()}
            </div>
            {order.delivery_fee_override && (
              <div className="text-xs text-gray-600">
                + ₹{order.delivery_fee_override} delivery
              </div>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="space-y-3">
          <div className="flex items-start gap-2">
            <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
            <div>
              <p className="text-sm font-medium">Franchise: {order.franchise_name}</p>
              <p className="text-sm text-muted-foreground">{order.shipping_address}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              Ordered: {formatDate(order.created_at)}
            </span>
          </div>

          {order.order_items && order.order_items.length > 0 && (
            <div className="mt-3">
              <p className="text-xs text-muted-foreground mb-2">
                {order.order_items.length} item(s)
              </p>
              <div className="grid grid-cols-1 gap-1">
                {order.order_items.slice(0, 3).map((item: any, index: number) => (
                  <div key={index} className="flex justify-between text-sm">
                    <span className="truncate">{item.item_name}</span>
                    <span className="text-muted-foreground ml-2">
                      {item.quantity}x ₹{item.unit_price}
                    </span>
                  </div>
                ))}
                {order.order_items.length > 3 && (
                  <p className="text-xs text-muted-foreground">
                    +{order.order_items.length - 3} more items
                  </p>
                )}
              </div>
            </div>
          )}
          
          <OrderActions 
            order={order} 
            onOrderUpdated={onOrderUpdated}
            onShowDeliveryModal={() => setShowDeliveryModal(true)}
            onShowPackingModal={() => setShowPackingModal(true)}
            onShowShippingModal={() => setShowShippingModal(true)}
          />
        </div>
      </CardContent>

      {/* Modals */}
      <DeliveryFeeConfirmationModal
        isOpen={showDeliveryModal}
        onClose={() => setShowDeliveryModal(false)}
        order={order}
        onConfirmed={async () => {
          await onOrderUpdated();
          setShowDeliveryModal(false);
        }}
      />

      <PackingWorkflowModal

          isOpen={showPackingModal}
          onClose={() => setShowPackingModal(false)}
          order={order}
          onPackingComplete={async () => {
            // 1) mark as packed in DB (if not already)
            await supabase
              .from('franchise_orders')
              .update({
                status: 'packed',
                packed_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              })
              .eq('id', order.id);

            // 2) refresh data
            await onOrderUpdated();

        -   // 3) (wrong) keep packing open
        -   setShowPackingModal(true);

        +   // 3) close packing
        +   setShowPackingModal(false);
        +   // 4) auto-open shipping
        +   setShowShippingModal(true);
          }}
      />

      <ShippingDetailsModal
        isOpen={showShippingModal}
        onClose={() => setShowShippingModal(false)}
        order={order}
        onShipped={async () => {
          await onOrderUpdated();
          setShowShippingModal(false);
        }}
      />
    </Card>
  );
});

OrderWorkflowCard.displayName = 'OrderWorkflowCard';

const OrderActions = memo(({ order, onOrderUpdated, onShowDeliveryModal, onShowPackingModal, onShowShippingModal }: { 
  order: any; 
  onOrderUpdated: () => Promise<void>;
  onShowDeliveryModal: () => void;
  onShowPackingModal: () => void;
  onShowShippingModal: () => void;
}) => {
  const { toast } = useToast();
  const [processing, setProcessing] = React.useState(false);

  const updateOrderStatus = async (orderId: string, status: string) => {
    setProcessing(true);
    try {
      const updateData: any = { 
        status, 
        updated_at: new Date().toISOString() 
      };

      if (status === 'packed') {
        updateData.packed_at = new Date().toISOString();
      } else if (status === 'shipped') {
        updateData.shipped_at = new Date().toISOString();
        updateData.tracking_number = `TRK${Date.now()}${Math.floor(Math.random() * 1000)}`;
      }

      const { error } = await supabase
        .from('franchise_orders')
        .update(updateData)
        .eq('id', orderId);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Order status updated to ${status}`,
      });

      await onOrderUpdated();
    } catch (error) {
      console.error('Error updating order status:', error);
      toast({
        title: "Error",
        description: "Failed to update order status",
        variant: "destructive"
      });
    } finally {
      setProcessing(false);
    }
  };

  const getActionButtons = () => {
    switch (order.status) {
      case 'pending':
        return (
          <Button
            size="sm"
            onClick={onShowDeliveryModal}
            disabled={processing}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <CheckCircle className="h-4 w-4 mr-2" />
            Confirm & Set Delivery Fee
          </Button>
        );
      
      case 'confirmed':
        return (
          <div className="flex gap-2">
            <Badge variant="outline" className="text-yellow-600 border-yellow-300">
              <CreditCard className="h-3 w-3 mr-1" />
              Waiting for Payment
            </Badge>
            <Button
              size="sm"
              onClick={() => updateOrderStatus(order.id, 'paid')}
              disabled={processing}
              variant="outline"
              className="text-xs"
            >
              Mark as Paid
            </Button>
          </div>
        );
      
      case 'paid':
        return (
          <Button
            size="sm"
            onClick={onShowPackingModal}
            disabled={processing}
            className="bg-purple-600 hover:bg-purple-700"
          >
            <Package className="h-4 w-4 mr-2" />
            Start Packing
          </Button>
        );
      
      case 'packing':
        return (
          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={onShowPackingModal}
              variant="outline"
              className="border-purple-500 text-purple-600"
            >
              <Package className="h-4 w-4 mr-2" />
              View Packing
            </Button>
            <Button
              size="sm"
              onClick={() => updateOrderStatus(order.id, 'packed')}
              disabled={processing}
              className="bg-indigo-600 hover:bg-indigo-700"
            >
              {processing ? 'Processing...' : 'Mark as Packed'}
            </Button>
          </div>
        );
      
      case 'packed':
        return (
          <Button
            size="sm"
            onClick={onShowShippingModal}
            disabled={processing}
            className="bg-cyan-600 hover:bg-cyan-700"
          >
            <Truck className="h-4 w-4 mr-2" />
            Enter Shipping Details
          </Button>
        );
      
      case 'shipped':
        return (
          <div className="flex gap-2">
            {order.tracking_number && (
              <Badge variant="outline" className="text-cyan-600 border-cyan-300">
                <Truck className="h-3 w-3 mr-1" />
                {order.tracking_number}
              </Badge>
            )}
            <Button
              size="sm"
              onClick={() => updateOrderStatus(order.id, 'delivered')}
              disabled={processing}
              className="bg-green-600 hover:bg-green-700"
            >
              {processing ? 'Processing...' : 'Mark as Delivered'}
            </Button>
          </div>
        );
      
      case 'delivered':
        return (
          <Badge className="bg-green-100 text-green-800">
            <CheckCircle className="h-3 w-3 mr-1" />
            Order Completed
          </Badge>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="flex gap-2 pt-2 flex-wrap">
      {getActionButtons()}
    </div>
  );
});

OrderActions.displayName = 'OrderActions';

export default OrderWorkflowCard; 