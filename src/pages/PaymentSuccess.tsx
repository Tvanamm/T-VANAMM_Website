import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Download, Package, Truck, AlertCircle } from 'lucide-react';
import ModernNavbar from '@/components/ModernNavbar';
import { useToast } from '@/hooks/use-toast';
import { useInvoiceManagement } from '@/hooks/useInvoiceManagement';
import { supabase } from '@/integrations/supabase/client';

interface OrderData {
  id: string;
  total_amount: number;
  shipping_address: string;
  delivery_fee_override?: number;
  loyalty_points_used?: number;
  status: string;
  created_at: string;
  franchise_members: {
    name: string;
    email: string;
    tvanamm_id: number;
  };
  order_items: {
    item_name: string;
    quantity: number;
    unit_price: number;
    total_price: number;
  }[];
}

interface PaymentData {
  razorpay_payment_id: string;
  status: string;
}

interface LocationState {
  orderId: string;
  paymentId?: string;
}

const PaymentSuccess = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as LocationState;
  
  const [orderData, setOrderData] = useState<OrderData | null>(null);
  const [paymentData, setPaymentData] = useState<PaymentData | null>(null);
  const [loading, setLoading] = useState(true);
  
  const { generateInvoice, generating } = useInvoiceManagement(state?.orderId);

  // Fetch order data on component mount
  useEffect(() => {
    const fetchOrderData = async () => {
      if (!state?.orderId) {
        setLoading(false);
        return;
      }

      try {
        // Fetch order details
        const { data: order, error: orderError } = await supabase
          .from('franchise_orders')
          .select(`
            *,
            franchise_members!inner(name, email, tvanamm_id),
            order_items!inner(item_name, quantity, unit_price, total_price)
          `)
          .eq('id', state.orderId)
          .single();

        if (orderError || !order) {
          throw new Error('Order not found');
        }

        setOrderData(order);

        // Fetch payment details
        const { data: payment } = await supabase
          .from('payment_transactions')
          .select('razorpay_payment_id, status')
          .eq('order_id', state.orderId)
          .eq('status', 'completed')
          .single();

        setPaymentData(payment);

        // Auto-generate invoice for completed payments
        if (payment?.status === 'completed') {
          try {
            await generateInvoice(state.orderId);
          } catch (error) {
            console.log('Invoice generation in background failed:', error);
          }
        }

      } catch (error) {
        console.error('Error fetching order data:', error);
        toast({
          title: "Error Loading Order",
          description: "Failed to load order details. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchOrderData();
  }, [state?.orderId, generateInvoice, toast]);

  // If no state data or still loading
  if (!state || loading || !orderData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50">
        <ModernNavbar />
        <div className="pt-20 px-4 max-w-md mx-auto">
          <Card>
            <CardContent className="p-6 text-center">
              {loading ? (
                <>
                  <Package className="h-12 w-12 text-gray-300 mx-auto mb-4 animate-pulse" />
                  <h2 className="text-xl font-semibold mb-2">Loading Order Details...</h2>
                  <p className="text-gray-600">Please wait while we fetch your order information.</p>
                </>
              ) : (
                <>
                  <Package className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <h2 className="text-xl font-semibold mb-2">No Order Found</h2>
                  <p className="text-gray-600 mb-4">
                    Please complete your purchase to view order details.
                    If you believe this is an error, contact support.
                  </p>
                  <div className="flex flex-col gap-2">
                    <Button onClick={() => navigate('/order')} className="w-full">
                      Back to Shopping
                    </Button>
                    <Button 
                      onClick={() => navigate('/franchise-dashboard')} 
                      variant="outline" 
                      className="w-full"
                    >
                      Go to Dashboard
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Extract data from orderData
  const orderId = orderData.id;
  const items = orderData.order_items;
  const total = orderData.total_amount;
  const shippingAddress = orderData.shipping_address;
  const deliveryFee = orderData.delivery_fee_override || 0;
  const loyaltyPointsUsed = orderData.loyalty_points_used || 0;
  const paymentId = paymentData?.razorpay_payment_id || 'N/A';

  const handleDownloadInvoice = async () => {
    try {
      await generateInvoice(orderId);
    } catch (error) {
      console.error('Failed to generate invoice:', error);
    }
  };

  // Calculate correct amounts for display
  const itemsSubtotal = items.reduce((sum, item) => sum + parseFloat(item.total_price.toString()), 0);
  const loyaltyDiscountAmount = loyaltyPointsUsed * 10; // 10 points = ₹1

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50">
      <ModernNavbar />
      <div className="pt-20 px-4 max-w-3xl mx-auto">
        <Card className="mb-6 border border-green-200">
          <CardHeader className="text-center pb-0">
            <div className="mx-auto mb-4">
              <CheckCircle className="h-16 w-16 text-green-500" />
            </div>
            <CardTitle className="text-3xl font-bold text-green-700">
              Order Confirmed!
            </CardTitle>
            <p className="text-gray-600 mt-2">
              Thank you for your purchase. Your order #{orderId.slice(0, 8)} has been placed successfully.
            </p>
          </CardHeader>
          
          <CardContent className="space-y-6 pt-4">
            {/* Order Summary Section */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                <Package className="h-5 w-5" />
                Order Summary
              </h3>
              
              <div className="space-y-3">
                {items.map((item, index) => (
                  <div key={index} className="flex justify-between items-center p-2 hover:bg-gray-100 rounded">
                    <div>
                      <p className="font-medium">{item.item_name}</p>
                      <p className="text-sm text-gray-600">
                        {item.quantity} × ₹{parseFloat(item.unit_price.toString()).toLocaleString()}
                      </p>
                    </div>
                    <p className="font-semibold">
                      ₹{parseFloat(item.total_price.toString()).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>

              <div className="border-t mt-4 pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Subtotal:</span>
                  <span>₹{itemsSubtotal.toLocaleString()}</span>
                </div>
                {deliveryFee > 0 && (
                  <div className="flex justify-between text-sm">
                    <span>Delivery Fee:</span>
                    <span>₹{deliveryFee.toLocaleString()}</span>
                  </div>
                )}
                {loyaltyPointsUsed > 0 && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Loyalty Points Used ({loyaltyPointsUsed} points):</span>
                    <span>-₹{loyaltyDiscountAmount.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-lg pt-2 border-t">
                  <span>Total Amount:</span>
                  <span>₹{total.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Shipping and Payment Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
                  <Truck className="h-5 w-5" />
                  Shipping Details
                </h3>
                <p className="text-sm text-gray-600 whitespace-pre-line">
                  {shippingAddress}
                </p>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
                  <CheckCircle className="h-5 w-5" />
                  Payment Details
                </h3>
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Payment ID:</span> {paymentId}
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  <span className="font-medium">Status:</span> Paid
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Button 
                onClick={handleDownloadInvoice} 
                variant="outline" 
                className="flex-1"
                disabled={generating}
              >
                <Download className="h-4 w-4 mr-2" />
                {generating ? 'Generating...' : 'Download Invoice'}
              </Button>
              <Button 
                onClick={() => navigate('/franchise-dashboard')} 
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                <Truck className="h-4 w-4 mr-2" />
                Track Your Order
              </Button>
              <Button 
                onClick={() => navigate('/order')} 
                variant="ghost" 
                className="flex-1"
              >
                Continue Shopping
              </Button>
            </div>

            <p className="text-xs text-gray-500 text-center pt-4">
              A confirmation has been sent to your email. 
              Contact support if you have any questions about your order.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PaymentSuccess;