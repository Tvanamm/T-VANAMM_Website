import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useFranchiseCart } from '@/contexts/FranchiseCartContext';
import { useRealFranchiseProfile } from '@/hooks/useRealFranchiseProfile';
import { useFranchiseCheckout } from '@/hooks/useFranchiseCheckout';
import { useAuth } from '@/contexts/AuthContext';
import { useFranchiseMembers } from '@/hooks/useFranchiseMembers';
import { ArrowLeft, Package, MapPin, FileText, AlertCircle, CreditCard, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import EnhancedRazorpayPayment from '@/components/franchise/EnhancedRazorpayPayment';

interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  unit: string;
  gst_rate: number;
  category: string;
}

interface CustomerInfo {
  name?: string;
  email?: string;
  phone?: string;
  tvanammId?: string;
}

interface CheckoutData {
  items: {
    id: string;
    name: string;
    price: number;
    quantity: number;
    unit: string;
    gst_rate: number;
    category: string;
  }[];
  totalAmount: number;
  deliveryFee: number;
  loyaltyPointsUsed: number;
  shippingAddress: string;
  customerInfo?: CustomerInfo;
}

interface OrderData extends CheckoutData {
  paymentId: string;
  paymentStatus: string;
}

interface RazorpayPaymentSuccessResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

interface RazorpayPaymentError {
  error: {
    code: string;
    description: string;
    source?: string;
    step?: string;
    reason?: string;
    metadata?: any;
  };
}

const EnhancedCheckoutPage = () => {
  const { cartItems, cartSummary, clearCart } = useFranchiseCart();
  const { franchiseProfile } = useRealFranchiseProfile();
  const { createOrder, isCreatingOrder } = useFranchiseCheckout();
  const { user } = useAuth();
  const { franchiseMembers } = useFranchiseMembers();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [showPayment, setShowPayment] = useState(false);
  const [checkoutData, setCheckoutData] = useState<CheckoutData | null>(null);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  const formattedCartSummary = useMemo(() => ({
    subtotal: cartSummary.subtotal.toLocaleString(),
    gst: cartSummary.gst.toLocaleString(),
    loyaltyDiscount: cartSummary.loyaltyDiscount.toLocaleString(),
    deliveryFee: cartSummary.deliveryFee === 0 ? 'Confirmation Required' : `₹${cartSummary.deliveryFee.toLocaleString()}`,
    total: cartSummary.total.toLocaleString()
  }), [cartSummary]);

  const currentMember = franchiseMembers.find(member =>
    member.email === user?.email
  );
  const hasVerifiedAccess = currentMember && (currentMember.status === 'active' || currentMember.status === 'verified');

  const [shippingDetails, setShippingDetails] = useState({
    fullAddress: franchiseProfile?.franchise_location || '',
    landmark: '',
    specialInstructions: ''
  });
  const [orderNotes, setOrderNotes] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (cartItems.length === 0) {
      toast({
        title: "Cart Empty",
        description: "Please add items to your cart before checking out.",
        variant: "destructive"
      });
      return;
    }

    if (!shippingDetails.fullAddress.trim()) {
      toast({
        title: "Address Required",
        description: "Please enter a complete delivery address.",
        variant: "destructive"
      });
      return;
    }

    try {
      const data: CheckoutData = {
        items: cartItems.map(item => ({
          id: String(item.id),
          name: item.name,
          quantity: item.quantity,
          price: item.price,
          unit: item.unit,
          gst_rate: item.gst_rate,
          category: item.category
        })),
        totalAmount: cartSummary.total,
        deliveryFee: cartSummary.deliveryFee,
        loyaltyPointsUsed: cartSummary.loyaltyDiscount,
        shippingAddress: [
          shippingDetails.fullAddress,
          shippingDetails.landmark && `Landmark: ${shippingDetails.landmark}`,
          shippingDetails.specialInstructions && `Instructions: ${shippingDetails.specialInstructions}`,
          orderNotes && `Notes: ${orderNotes}`
        ].filter(Boolean).join(' | '),
        customerInfo: {
          name: franchiseProfile?.name,
          email: franchiseProfile?.email,
          phone: franchiseProfile?.phone,
          tvanammId: franchiseProfile?.tvanamm_id
        }
      };
      setCheckoutData(data);
      setShowPayment(true);
    } catch (error) {
      console.error('Checkout error:', error);
      toast({
        title: "Order Failed",
        description: "Failed to process order. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handlePaymentSuccess = async (response: RazorpayPaymentSuccessResponse) => {
    setIsProcessingPayment(true);
    try {
      if (!checkoutData) {
        throw new Error('Checkout data is missing');
      }

      const orderData: OrderData = {
        ...checkoutData,
        items: checkoutData.items.map(item => ({
          ...item,
          id: String(item.id)
        })),
        paymentId: response.razorpay_payment_id,
        paymentStatus: 'completed'
      };

      const checkoutDataForOrder = {
        ...orderData,
        items: orderData.items.map(item => ({
          ...item,
          id: typeof item.id === 'string' ? Number(item.id) : item.id
        }))
      };

      const orderResult = await createOrder(checkoutDataForOrder);

      if (!orderResult.success) {
        throw new Error('Order creation failed');
      }

      navigate('/payment-success', {
        state: {
          orderId: orderResult.orderId,
          paymentId: response.razorpay_payment_id,
          items: checkoutData.items.map(item => ({
            item: {
              id: item.id,
              name: item.name,
              price: item.price,
              unit: item.unit,
              category: item.category,
              gst_rate: item.gst_rate
            },
            quantity: item.quantity
          })),
          total: checkoutData.totalAmount,
          shippingAddress: checkoutData.shippingAddress,
          deliveryFee: checkoutData.deliveryFee,
          loyaltyPointsUsed: checkoutData.loyaltyPointsUsed,
          customerName: franchiseProfile?.name,
          orderDate: new Date().toISOString()
        }
      });

      clearCart();

    } catch (error: any) {
      console.error('Order creation error:', error);
      toast({
        title: "Order Failed",
        description: error.message || "Payment was successful but order creation failed. Please contact support.",
        variant: "destructive",
        action: (
          <Button
            variant="ghost"
            onClick={() => navigate('/franchise-dashboard')}
          >
            Go to Dashboard
          </Button>
        )
      });
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const handlePaymentError = (error: RazorpayPaymentError) => {
    console.error('Payment error:', error);
    let errorMessage = "Payment could not be processed. Please try again.";

    if (error.error) {
      errorMessage = error.error.description ||
        error.error.reason ||
        errorMessage;
    }

    toast({
      title: "Payment Failed",
      description: errorMessage,
      variant: "destructive",
      action: (
        <Button variant="ghost" onClick={() => setShowPayment(false)}>
          Try Again
        </Button>
      )
    });
    setShowPayment(false);
  };

  if (!hasVerifiedAccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 pt-20 px-4">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardContent className="p-8 text-center">
              <Shield className="h-16 w-16 text-red-500 mx-auto mb-6" />
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Checkout Access Restricted</h2>
              <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-6">
                <div className="flex items-start gap-4">
                  <AlertCircle className="h-6 w-6 text-red-600 flex-shrink-0 mt-0.5" />
                  <div className="text-left">
                    <h3 className="font-semibold text-red-800 mb-2">Verification Required</h3>
                    <p className="text-red-700 mb-4">
                      Your account must be verified before you can proceed to checkout.
                    </p>
                    <div className="bg-white rounded-lg p-4 border border-red-200">
                      <h4 className="font-medium text-red-800 mb-2">Current Status:</h4>
                      <div className="flex items-center gap-2">
                        <Badge className={
                          currentMember?.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100'
                            : currentMember?.status === 'approved'
                              ? 'bg-blue-100 text-blue-800 hover:bg-blue-100'
                              : 'bg-red-100 text-red-800 hover:bg-red-100'
                        }>
                          {currentMember?.status || 'Unknown'}
                        </Badge>
                        <span className="text-sm text-red-700">
                          {currentMember?.status === 'pending' && 'Awaiting admin review'}
                          {currentMember?.status === 'approved' && 'Approved, awaiting final verification'}
                          {currentMember?.status === 'rejected' && 'Application rejected'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button
                  onClick={() => navigate('/order')}
                  variant="outline"
                  className="w-full sm:w-auto"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Inventory
                </Button>
                <Button
                  onClick={() => navigate('/franchise-dashboard')}
                  className="w-full sm:w-auto bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700"
                >
                  Go to Dashboard
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 pt-20 px-4">
        <div className="max-w-md mx-auto">
          <Card>
            <CardContent className="p-6 text-center">
              <Package className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">Cart is Empty</h2>
              <p className="text-gray-600 mb-4">Add some items to your cart before checking out.</p>
              <Button onClick={() => navigate('/order')}>
                Browse Products
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (showPayment && checkoutData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 pt-20 px-4">
        <div className="max-w-md mx-auto">
          <EnhancedRazorpayPayment
            orderId={`ord_${Date.now()}`}
            amount={checkoutData.totalAmount * 100}
            orderDetails={{
              franchise_name: franchiseProfile?.name || 'Franchise Member',
              shipping_address: checkoutData.shippingAddress,
              items: checkoutData.items.map(item => ({
                item_name: item.name,
                quantity: item.quantity,
                unit_price: item.price,
              }))
            }}
            onPaymentSuccess={handlePaymentSuccess}
            onPaymentError={handlePaymentError}
          />
          <Button
            onClick={() => setShowPayment(false)}
            variant="outline"
            className="w-full mt-4"
            disabled={isProcessingPayment}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            {isProcessingPayment ? 'Processing Payment...' : 'Back to Order Review'}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 pt-20 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate('/order')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Shopping
          </Button>
          <h1 className="text-2xl font-bold text-gray-900">Checkout</h1>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Order Items ({cartItems.length} items)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {cartItems.map((item) => {
                  const itemTotal = item.price * item.quantity;
                  const itemGst = (itemTotal * item.gst_rate) / 100;

                  return (
                    <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <h4 className="font-medium">{item.name}</h4>
                        <p className="text-sm text-gray-600">{item.category} • {item.unit}</p>
                        <p className="text-sm text-gray-500">₹{item.price.toLocaleString()} × {item.quantity}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">₹{itemTotal.toLocaleString()}</p>
                        <Badge variant="outline" className="text-xs">
                          GST: {item.gst_rate}% (₹{itemGst.toFixed(2)})
                        </Badge>
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Delivery Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="fullAddress">Full Address *</Label>
                  <Textarea
                    id="fullAddress"
                    value={shippingDetails.fullAddress}
                    onChange={(e) => setShippingDetails(prev => ({
                      ...prev,
                      fullAddress: e.target.value
                    }))}
                    placeholder="Enter complete delivery address"
                    required
                    rows={3}
                  />
                </div>
                <div>
                  <Label htmlFor="landmark">Landmark (Optional)</Label>
                  <Input
                    id="landmark"
                    value={shippingDetails.landmark}
                    onChange={(e) => setShippingDetails(prev => ({
                      ...prev,
                      landmark: e.target.value
                    }))}
                    placeholder="Nearby landmark for easy identification"
                  />
                </div>
                <div>
                  <Label htmlFor="specialInstructions">Special Instructions (Optional)</Label>
                  <Textarea
                    id="specialInstructions"
                    value={shippingDetails.specialInstructions}
                    onChange={(e) => setShippingDetails(prev => ({
                      ...prev,
                      specialInstructions: e.target.value
                    }))}
                    placeholder="Any special instructions for delivery"
                    rows={2}
                  />
                </div>
                <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-blue-800">
                    <p className="font-medium mb-1">Delivery Information</p>
                    <p>Delivery details will be confirmed after order placement. Contact us for any special requirements.</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Order Notes (Optional)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={orderNotes}
                  onChange={(e) => setOrderNotes(e.target.value)}
                  placeholder="Add any special notes or requirements for this order..."
                  rows={3}
                />
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Order Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal:</span>
                    <span>₹{formattedCartSummary.subtotal}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>GST:</span>
                    <span>₹{formattedCartSummary.gst}</span>
                  </div>
                  {cartSummary.loyaltyDiscount > 0 && (
                    <div className="flex justify-between text-sm text-green-600">
                      <span>Loyalty Discount:</span>
                      <span>-₹{formattedCartSummary.loyaltyDiscount}</span>
                    </div>
                  )}
                  <p className="text-sm text-red-600 whitespace-nowrap">
                    Delivery Fee:{' '}
                    <span className="font-medium">
                      {formattedCartSummary.deliveryFee}
                    </span>
                  </p>
                  <Separator />
                  <div className="flex justify-between font-semibold text-lg">
                    <span>Total:</span>
                    <span>₹{formattedCartSummary.total}</span>
                  </div>
                </div>
                <div className="border-t pt-4">
                  <h4 className="font-medium mb-2">Customer Information</h4>
                  <div className="text-sm space-y-1">
                    <p><strong>Name:</strong> {franchiseProfile?.name}</p>
                    <p><strong>Email:</strong> {franchiseProfile?.email}</p>
                    <p><strong>Phone:</strong> {franchiseProfile?.phone}</p>
                    <p><strong>TVANAMM ID:</strong> {franchiseProfile?.tvanamm_id}</p>
                  </div>
                </div>
                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 mt-4"
                  disabled={isCreatingOrder || !shippingDetails.fullAddress.trim()}
                >
                  {isCreatingOrder ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Processing...
                    </div>
                  ) : (
                    'Proceed to Payment'
                  )}
                </Button>
                <p className="text-xs text-gray-500 text-center mt-2">
                  You'll be redirected to Razorpay's secure payment gateway
                </p>
              </CardContent>
            </Card>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EnhancedCheckoutPage;
