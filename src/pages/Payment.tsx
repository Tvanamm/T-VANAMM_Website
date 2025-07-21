import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useRealFranchiseProfile } from '@/hooks/useRealFranchiseProfile';
import ModernNavbar from '@/components/ModernNavbar';
import Footer from '@/components/Footer';
import EnhancedRazorpayPayment from '@/components/franchise/EnhancedRazorpayPayment';
import LoyaltyCheckout from '@/components/franchise/LoyaltyCheckout';
import { 
  AlertCircle, 
  Package,
  Truck,
  ArrowLeft,
  CreditCard,
  RefreshCw
} from 'lucide-react';

interface OrderDetails {
  id: string;
  total_amount: number;
  delivery_fee_override?: number;
  franchise_name: string;
  status: string;
  created_at: string;
  shipping_address: string;
  franchise_member_id: string;
  order_items?: Array<{
    item_id?: number;
    item_name: string;
    quantity: number;
    unit_price: number;
    total_price: number;
  }>;
}

const Payment = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const { franchiseProfile } = useRealFranchiseProfile();
  const [order, setOrder] = useState<OrderDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [loyaltyDiscount, setLoyaltyDiscount] = useState(0);
  const [loyaltyPointsUsed, setLoyaltyPointsUsed] = useState(0);
  const [claimedGift, setClaimedGift] = useState<string | null>(null);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const orderId = location.state?.orderId;

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (!orderId) {
      toast({
        title: "No Order Found",
        description: "Please select an order to make payment",
        variant: "destructive"
      });
      navigate('/franchise-dashboard');
      return;
    }

    fetchOrderDetails();
  }, [user, orderId]);

  // Real-time subscription for loyalty points updates
  useEffect(() => {
    if (!franchiseProfile?.id) return;

    const channel = supabase
      .channel('loyalty_points_updates')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'loyalty_points',
        filter: `franchise_member_id=eq.${franchiseProfile.id}`
      }, (payload) => {
        console.log('Loyalty points updated:', payload);
        // Refresh loyalty checkout component
        window.location.reload();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [franchiseProfile?.id]);

  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('franchise_orders')
        .select(`
          *,
          order_items(*)
        `)
        .eq('id', orderId)
        .single();

      if (error) throw error;
      
      // Check if order is already confirmed/paid
      if (data.status === 'confirmed' || data.status === 'paid' || data.status === 'completed') {
        // Check if payment transaction exists for this order
        const { data: transaction } = await supabase
          .from('payment_transactions')
          .select('razorpay_payment_id, status')
          .eq('order_id', orderId)
          .eq('status', 'completed')
          .single();

        if (transaction) {
          console.log('Order already paid, redirecting to success page');
          navigate('/payment-success', {
            state: {
              orderId: orderId,
              paymentId: transaction.razorpay_payment_id,
              items: data.order_items?.map(item => ({
                item: {
                  id: item.item_id,
                  name: item.item_name,
                  price: item.unit_price,
                  category: '',
                  unit: '',
                  gst_rate: 0
                },
                quantity: item.quantity
              })) || [],
              total: data.total_amount,
              shippingAddress: data.shipping_address,
              deliveryFee: data.delivery_fee_override || 0,
              loyaltyPointsUsed: data.loyalty_points_used || 0
            }
          });
          return;
        }
      }
      
      setOrder(data);
    } catch (error) {
      console.error('Error fetching order:', error);
      toast({
        title: "Error",
        description: "Failed to load order details",
        variant: "destructive"
      });
      navigate('/franchise-dashboard');
    } finally {
      setLoading(false);
    }
  };

  const refreshOrderDetails = async () => {
    setRefreshing(true);
    await fetchOrderDetails();
    setRefreshing(false);
  };

  const handleApplyDiscount = (discount: number, pointsUsed: number) => {
    setLoyaltyDiscount(discount);
    setLoyaltyPointsUsed(pointsUsed);
    toast({
      title: "Discount Applied",
      description: `₹${discount} discount applied using ${pointsUsed} loyalty points`,
    });
  };

  const handleClaimGift = (giftType: string, pointsUsed: number) => {
    setClaimedGift(giftType);
    setLoyaltyPointsUsed(pointsUsed);
    toast({
      title: "Gift Claimed",
      description: `${giftType === 'free_delivery' ? 'Free delivery' : '30 tea cups'} gift claimed!`,
    });
  };

  const handlePaymentSuccess = async (paymentData: any) => {
    try {
      console.log('Payment successful:', paymentData);
      
      // Update order with loyalty points usage
      if (loyaltyPointsUsed > 0) {
        const { error: updateError } = await supabase
          .from('franchise_orders')
          .update({
            loyalty_points_used: loyaltyPointsUsed,
            loyalty_gift_claimed: claimedGift,
            total_amount: finalAmount
          })
          .eq('id', order?.id);

        if (updateError) {
          console.error('Error updating order with loyalty info:', updateError);
        }
      }
      
      // Handle loyalty-covered orders differently
      if (finalAmount === 0 && paymentData.razorpay_payment_id === 'loyalty_covered') {
        // For loyalty-covered orders, directly update order status
        const { error: orderError } = await supabase
          .from('franchise_orders')
          .update({
            status: 'confirmed',
            loyalty_points_used: loyaltyPointsUsed,
            loyalty_gift_claimed: claimedGift,
            updated_at: new Date().toISOString()
          })
          .eq('id', order?.id);

        if (orderError) {
          throw orderError;
        }

        // Create a payment transaction record for tracking
        const { error: transactionError } = await supabase
          .from('payment_transactions')
          .insert({
            order_id: order?.id,
            amount: 0,
            currency: 'INR',
            status: 'completed',
            payment_method: 'loyalty_points',
            razorpay_payment_id: 'loyalty_covered',
            razorpay_order_id: 'loyalty_covered',
            razorpay_signature: 'loyalty_covered'
          });

        if (transactionError) {
          console.error('Error creating loyalty transaction:', transactionError);
        }

        toast({
          title: "Order Completed! 🎉",
          description: "Your order has been processed using loyalty benefits.",
        });

        navigate('/payment-success', {
          state: {
            orderId: order?.id,
            paymentId: 'loyalty_covered',
            items: order?.order_items?.map(item => ({
              item: {
                id: item.item_id || '',
                name: item.item_name,
                price: item.unit_price,
                category: '',
                unit: '',
                gst_rate: 0
              },
              quantity: item.quantity
            })) || [],
            total: order?.total_amount || 0,
            shippingAddress: order?.shipping_address || '',
            deliveryFee: order?.delivery_fee_override || 0,
            loyaltyPointsUsed: loyaltyPointsUsed
          }
        });
        return;
      }
      
      // For regular Razorpay payments, verify with our edge function
      const { data, error } = await supabase.functions.invoke('verify-razorpay-payment', {
        body: {
          razorpay_order_id: paymentData.razorpay_order_id,
          razorpay_payment_id: paymentData.razorpay_payment_id,
          razorpay_signature: paymentData.razorpay_signature,
          order_id: order?.id,
          amount: finalAmount * 100
        }
      });

      if (error) throw error;

      if (data?.verified) {
        toast({
          title: "Payment Successful! 🎉",
          description: "Your payment has been processed successfully.",
        });

        navigate('/payment-success', {
          state: {
            orderId: order?.id,
            paymentId: paymentData.razorpay_payment_id,
            items: order?.order_items?.map(item => ({
              item: {
                id: item.item_id || '',
                name: item.item_name,
                price: item.unit_price,
                category: '',
                unit: '',
                gst_rate: 0
              },
              quantity: item.quantity
            })) || [],
            total: order?.total_amount || 0,
            shippingAddress: order?.shipping_address || '',
            deliveryFee: order?.delivery_fee_override || 0,
            loyaltyPointsUsed: loyaltyPointsUsed
          }
        });
      } else {
        throw new Error('Payment verification failed');
      }
    } catch (error) {
      console.error('Payment verification error:', error);
      setPaymentError(error.message || 'Payment verification failed');
      toast({
        title: "Payment Verification Failed",
        description: "Please contact support for assistance.",
        variant: "destructive"
      });
    }
  };

  const handlePaymentError = (error: any) => {
    console.error('Payment error:', error);
    const errorMessage = error?.description || error?.message || "Payment could not be processed. Please try again.";
    setPaymentError(errorMessage);
    toast({
      title: "Payment Failed",
      description: errorMessage,
      variant: "destructive"
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50">
        <ModernNavbar />
        <div className="pt-24 pb-16 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="w-8 h-8 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p>Loading payment details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50">
        <ModernNavbar />
        <div className="pt-24 pb-16 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Order Not Found</h2>
            <p className="text-gray-600 mb-4">The requested order could not be found.</p>
            <Button onClick={() => navigate('/franchise-dashboard')}>
              Return to Dashboard
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const subtotal = order.total_amount;
  const deliveryFee = order.delivery_fee_override || 0;
  const giftDeliveryDiscount = claimedGift === 'free_delivery' ? deliveryFee : 0;
  const finalAmount = Math.max(0, subtotal + deliveryFee - loyaltyDiscount - giftDeliveryDiscount);

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50">
      <ModernNavbar />
      
      <div className="pt-24 pb-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <Button
              variant="ghost"
              onClick={() => navigate('/franchise-dashboard')}
              className="mb-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Complete Payment</h1>
                <p className="text-gray-600">
                  Order #{order.id.slice(0, 8)} • {order.franchise_name}
                </p>
              </div>
              <Button
                variant="outline"
                onClick={refreshOrderDetails}
                disabled={refreshing}
                className="flex items-center gap-2"
              >
                <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </div>

          {paymentError && (
            <Alert className="mb-6" variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Payment Error:</strong> {paymentError}
                <br />
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-2"
                  onClick={() => setPaymentError(null)}
                >
                  Retry Payment
                </Button>
              </AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Order Summary */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5" />
                    Order Summary
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {order.order_items && order.order_items.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="font-medium text-gray-900">Items Ordered:</h4>
                      {order.order_items.map((item, index) => (
                        <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100">
                          <div>
                            <span className="font-medium">{item.item_name}</span>
                            <p className="text-sm text-gray-600">
                              {item.quantity} × ₹{item.unit_price.toLocaleString()}
                            </p>
                          </div>
                          <span className="font-medium">₹{item.total_price.toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="space-y-2 pt-4 border-t">
                    <div className="flex justify-between">
                      <span>Subtotal:</span>
                      <span>₹{subtotal.toLocaleString()}</span>
                    </div>
                    {deliveryFee > 0 && (
                      <div className="flex justify-between">
                        <span className="flex items-center gap-1">
                          <Truck className="h-4 w-4" />
                          Delivery Fee:
                        </span>
                        <span>₹{deliveryFee.toLocaleString()}</span>
                      </div>
                    )}
                    {loyaltyDiscount > 0 && (
                      <div className="flex justify-between text-green-600">
                        <span>Loyalty Points Discount:</span>
                        <span>-₹{loyaltyDiscount.toLocaleString()}</span>
                      </div>
                    )}
                    {giftDeliveryDiscount > 0 && (
                      <div className="flex justify-between text-green-600">
                        <span>Free Delivery Gift:</span>
                        <span>-₹{giftDeliveryDiscount.toLocaleString()}</span>
                      </div>
                    )}
                    <div className="flex justify-between font-bold text-lg pt-2 border-t">
                      <span>Total Amount:</span>
                      <span className="text-emerald-600">₹{finalAmount.toLocaleString()}</span>
                    </div>
                    {finalAmount === 0 && (
                      <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                        <p className="text-sm text-green-800 font-medium">
                          🎉 Your order is completely covered by loyalty benefits! No payment required.
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-800">
                      <strong>Shipping Address:</strong><br />
                      {order.shipping_address}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Payment Section */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    Payment
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {order.status === 'confirmed' ? (
                    finalAmount > 0 ? (
                      <EnhancedRazorpayPayment
                        orderId={order.id}
                        amount={finalAmount * 100}
                        orderDetails={{
                          franchise_name: order.franchise_name,
                          shipping_address: order.shipping_address,
                          items: order.order_items || []
                        }}
                        onPaymentSuccess={handlePaymentSuccess}
                        onPaymentError={handlePaymentError}
                      />
                    ) : (
                      <div className="text-center py-8">
                        <div className="text-green-600 mb-4">
                          <CreditCard className="h-12 w-12 mx-auto mb-2" />
                          <h3 className="text-lg font-semibold">Order Fully Covered!</h3>
                          <p className="text-sm">Your loyalty benefits cover the entire order amount.</p>
                        </div>
                        <Button
                          onClick={() => handlePaymentSuccess({
                            razorpay_order_id: 'loyalty_covered',
                            razorpay_payment_id: 'loyalty_covered',
                            razorpay_signature: 'loyalty_covered'
                          })}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          Complete Order
                        </Button>
                      </div>
                    )
                  ) : (
                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        This order is not ready for payment. Current status: {order.status}
                      </AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Loyalty Benefits Sidebar */}
            <div className="lg:col-span-1">
              {franchiseProfile && (
                <LoyaltyCheckout
                  franchiseMemberId={franchiseProfile.id}
                  orderTotal={subtotal + deliveryFee}
                  onApplyDiscount={handleApplyDiscount}
                  onClaimGift={handleClaimGift}
                  appliedDiscount={loyaltyDiscount}
                  claimedGift={claimedGift}
                />
              )}
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default Payment;
