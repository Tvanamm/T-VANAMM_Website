
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useNavigate } from 'react-router-dom';
import { 
  AlertTriangle, 
  CreditCard, 
  Clock, 
  Package,
  ArrowRight
} from 'lucide-react';

interface PendingOrder {
  id: string;
  total_amount: number;
  delivery_fee_override?: number;
  franchise_name: string;
  created_at: string;
  status: string;
}

interface OrderBlockingMessageProps {
  pendingOrder: PendingOrder;
}

const OrderBlockingMessage: React.FC<OrderBlockingMessageProps> = ({ pendingOrder }) => {
  const navigate = useNavigate();

  const totalAmount = pendingOrder.total_amount + (pendingOrder.delivery_fee_override || 0);

  const handlePayNow = () => {
    navigate('/payment', { state: { orderId: pendingOrder.id } });
  };

  const getStatusMessage = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'Payment required to proceed';
      case 'payment_pending':
        return 'Bank transfer confirmation pending';
      default:
        return 'Order requires attention';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'payment_pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <Alert className="border-2 border-amber-200 bg-amber-50">
      <AlertTriangle className="h-5 w-5 text-amber-600" />
      <AlertDescription>
        <div className="space-y-4">
          <div>
            <h3 className="font-semibold text-amber-800 mb-2">
              Complete Previous Order to Continue
            </h3>
            <p className="text-amber-700 text-sm">
              You have a pending order that requires payment completion before placing new orders.
            </p>
          </div>

          <Card className="bg-white border-amber-200">
            <CardContent className="p-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Package className="h-4 w-4 text-gray-600" />
                    <span className="font-medium">Order #{pendingOrder.id.slice(0, 8)}</span>
                  </div>
                  <Badge className={getStatusColor(pendingOrder.status)}>
                    {getStatusMessage(pendingOrder.status)}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Amount:</span>
                    <div className="font-semibold text-lg text-emerald-600">
                      ₹{totalAmount.toLocaleString()}
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-600">Ordered:</span>
                    <div className="font-medium">
                      {new Date(pendingOrder.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>

                {pendingOrder.status === 'confirmed' && (
                  <Button 
                    onClick={handlePayNow}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
                  >
                    <CreditCard className="h-4 w-4 mr-2" />
                    Complete Payment
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                )}

                {pendingOrder.status === 'payment_pending' && (
                  <div className="flex items-center gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <Clock className="h-4 w-4 text-yellow-600" />
                    <span className="text-yellow-800 text-sm">
                      Bank transfer confirmation is being processed. You'll be notified once confirmed.
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <div className="text-xs text-amber-700">
            💡 <strong>Why this restriction?</strong> This ensures proper order tracking and prevents inventory conflicts while your payment is being processed.
          </div>
        </div>
      </AlertDescription>
    </Alert>
  );
};

export default OrderBlockingMessage;
