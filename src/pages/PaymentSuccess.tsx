import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useStockOrdering } from '@/hooks/useStockOrdering';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Download, Package, Truck } from 'lucide-react';
import ModernNavbar from '@/components/ModernNavbar';
import { useToast } from '@/hooks/use-toast';

const PaymentSuccess = () => {
  const { user } = useAuth();
  const { cart, placeOrder, cartTotal } = useStockOrdering();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);

  // Get state from location if coming from checkout
  const stateItems = location.state?.items || [];
  const stateCart = location.state?.cart || [];

  // Use either URL params or state
  const shippingAddress = searchParams.get('address') || location.state?.shippingAddress || '';
  const paymentId = searchParams.get('payment_id') || location.state?.paymentId || '';

  // Use combined cart data (from state or hook)
  const currentCart = stateCart.length > 0 ? stateCart : cart;
  const currentCartTotal = location.state?.total || cartTotal;

  useEffect(() => {
    if (user && currentCart.length > 0 && shippingAddress && !orderPlaced) {
      handleOrderPlacement();
    }
  }, [user, currentCart, shippingAddress, orderPlaced]);

  const handleOrderPlacement = async () => {
    if (orderPlaced) return;
    
    try {
      const result = await placeOrder(shippingAddress);
      if (result.success) {
        setOrderId(result.orderId);
        setOrderPlaced(true);
        toast({
          title: "Order Placed Successfully!",
          description: "Your order has been confirmed and will be processed soon.",
        });
      } else {
        navigate('/franchise-dashboard');
      }
    } catch (error) {
      console.error('Order placement error:', error);
      toast({
        title: "Order Failed",
        description: "There was an error processing your order.",
        variant: "destructive"
      });
      navigate('/order');
    }
  };

  const generateInvoice = () => {
    if (!orderId || currentCart.length === 0) {
      toast({
        title: "Cannot Generate Invoice",
        description: "Order information is incomplete.",
        variant: "destructive"
      });
      return;
    }

    const invoiceData = {
      orderId: orderId.slice(0, 8),
      date: new Date().toLocaleDateString(),
      customerName: user?.name || 'Franchise Member',
      items: currentCart,
      total: currentCartTotal,
      paymentId: paymentId,
      shippingAddress: shippingAddress
    };

    const invoiceContent = `
INVOICE
=======
Order ID: ${invoiceData.orderId}
Date: ${invoiceData.date}
Customer: ${invoiceData.customerName}
Payment ID: ${invoiceData.paymentId}

ITEMS:
------
${invoiceData.items.map((item: any) => 
  `${item.item?.name || 'Unknown Item'} x ${item.quantity} = ₹${((item.item?.price || 0) * item.quantity).toLocaleString()}`
).join('\n')}

TOTAL: ₹${invoiceData.total.toLocaleString()}

Shipping Address:
${invoiceData.shippingAddress}
    `;

    const blob = new Blob([invoiceContent], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `invoice-${invoiceData.orderId}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  if (!orderPlaced && currentCart.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50">
        <ModernNavbar />
        <div className="pt-20 px-4 max-w-md mx-auto">
          <Card>
            <CardContent className="p-6 text-center">
              <Package className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">No Order Found</h2>
              <p className="text-gray-600 mb-4">There doesn't seem to be any order to process.</p>
              <Button onClick={() => navigate('/franchise-dashboard')}>
                Go to Dashboard
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50">
      <ModernNavbar />
      <div className="pt-20 px-4 max-w-2xl mx-auto">
        <Card className="mb-6">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4">
              <CheckCircle className="h-16 w-16 text-green-500" />
            </div>
            <CardTitle className="text-2xl text-green-700">Payment Successful!</CardTitle>
            <p className="text-gray-600">Your order has been placed successfully</p>
          </CardHeader>
          <CardContent className="space-y-6">
            {orderId && (
              <div className="text-center">
                <Badge variant="outline" className="text-lg px-4 py-2">
                  Order ID: {orderId.slice(0, 8)}
                </Badge>
              </div>
            )}

            <div className="border-t pt-4">
              <h3 className="font-semibold mb-3">Order Summary</h3>
              <div className="space-y-2">
                {currentCart.map((item: any) => (
                  <div key={item.item?.id || Math.random()} className="flex justify-between text-sm">
                    <span>{item.item?.name || 'Unknown Item'} x {item.quantity}</span>
                    <span>₹{((item.item?.price || 0) * item.quantity).toLocaleString()}</span>
                  </div>
                ))}
                <div className="border-t pt-2 font-semibold flex justify-between">
                  <span>Total:</span>
                  <span>₹{currentCartTotal.toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div className="border-t pt-4">
              <h3 className="font-semibold mb-2">Shipping Address</h3>
              <p className="text-sm text-gray-600">{shippingAddress}</p>
            </div>

            {paymentId && (
              <div className="border-t pt-4">
                <h3 className="font-semibold mb-2">Payment Details</h3>
                <p className="text-sm text-gray-600">Payment ID: {paymentId}</p>
              </div>
            )}

            <div className="flex gap-3">
              <Button onClick={generateInvoice} variant="outline" className="flex-1">
                <Download className="h-4 w-4 mr-2" />
                Download Invoice
              </Button>
              <Button onClick={() => navigate('/franchise-dashboard')} className="flex-1">
                <Truck className="h-4 w-4 mr-2" />
                Track Order
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PaymentSuccess;