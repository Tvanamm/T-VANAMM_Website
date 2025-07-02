
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CreditCard, Clock, AlertTriangle, Package } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { usePendingOrders } from '@/hooks/usePendingOrders';

const StickyPaymentReminder = () => {
  const navigate = useNavigate();
  const { pendingOrders, loading, hasPendingPayment } = usePendingOrders();

  // Don't show if no pending payments or still loading
  if (!hasPendingPayment || loading) {
    return null;
  }

  const confirmedOrders = pendingOrders.filter(order => order.status === 'confirmed');
  const totalAmount = confirmedOrders.reduce((sum, order) => 
    sum + order.total_amount + (order.delivery_fee_override || 0), 0
  );

  const handlePayNow = () => {
    if (confirmedOrders.length === 1) {
      // Single order - navigate directly to payment with order data
      navigate('/payment', {
        state: { orderId: confirmedOrders[0].id }
      });
    } else {
      // Multiple orders - navigate to franchise dashboard orders tab
      navigate('/franchise-dashboard', {
        state: { activeTab: 'orders' }
      });
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm animate-bounce">
      <Card className="bg-gradient-to-r from-red-50 to-orange-50 border-red-200 shadow-2xl border-2">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-red-100 rounded-full flex-shrink-0">
              <AlertTriangle className="h-5 w-5 text-red-600" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <Badge className="bg-red-100 text-red-800 border-red-200 text-xs">
                  Payment Required
                </Badge>
              </div>
              
              <h4 className="font-semibold text-red-800 mb-1 text-sm">
                {confirmedOrders.length === 1 
                  ? 'Order Awaiting Payment' 
                  : `${confirmedOrders.length} Orders Awaiting Payment`
                }
              </h4>
              
              <div className="text-xs text-red-700 mb-2 space-y-1">
                <div className="flex items-center gap-1">
                  <Package className="h-3 w-3" />
                  <span>Total: ₹{totalAmount.toLocaleString()}</span>
                </div>
                {confirmedOrders.length > 1 && (
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    <span>Multiple orders pending</span>
                  </div>
                )}
              </div>
              
              <Button
                onClick={handlePayNow}
                className="w-full bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                size="sm"
              >
                <CreditCard className="h-4 w-4 mr-2" />
                {confirmedOrders.length === 1 ? 'Pay Now' : 'View Orders'}
              </Button>
              
              <p className="text-xs text-red-600 mt-2 text-center">
                Complete payment to place new orders
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StickyPaymentReminder;
