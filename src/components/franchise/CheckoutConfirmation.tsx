
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  ArrowLeft, 
  MapPin, 
  Package, 
  Truck,
  CreditCard,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { useFranchiseCart } from '@/contexts/FranchiseCartContext';
import { useRealFranchiseProfile } from '@/hooks/useRealFranchiseProfile';
import { useFranchiseOrders } from '@/hooks/useFranchiseOrders';
import { useToast } from '@/hooks/use-toast';
import EnhancedRazorpayPayment from './EnhancedRazorpayPayment';

interface CheckoutConfirmationProps {
  onProceedToPayment: () => void;
  onBack: () => void;
}

const CheckoutConfirmation: React.FC<CheckoutConfirmationProps> = ({ 
  onProceedToPayment, 
  onBack 
}) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { items, cartSummary, clearCart, isCartValid } = useFranchiseCart();
  const { franchiseProfile } = useRealFranchiseProfile();
  const { createOrder } = useFranchiseOrders();
  const [currentStep, setCurrentStep] = useState<'confirmation' | 'payment'>('confirmation');
  const [orderId, setOrderId] = useState<string | null>(null);
  const [isCreatingOrder, setIsCreatingOrder] = useState(false);

  // Validate cart before proceeding
  React.useEffect(() => {
    if (!items || items.length === 0 || !isCartValid) {
      toast({
        title: "Cart Error",
        description: "Your cart is empty or invalid. Redirecting...",
        variant: "destructive"
      });
      navigate('/franchise-dashboard');
    }
  }, [items, isCartValid, navigate, toast]);

  // Fix currency formatting function
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(amount);
  };

  const shippingAddress = franchiseProfile ? [
    franchiseProfile.franchise_location,
    franchiseProfile.location_details,
    franchiseProfile.city,
    franchiseProfile.state,
    franchiseProfile.pincode
  ].filter(Boolean).join(', ') : 'Address not available';

  const handleProceedToPayment = async () => {
    console.log('Proceeding to payment - validation:', {
      franchiseProfile: !!franchiseProfile,
      itemsCount: items.length,
      cartTotal: cartSummary.total,
      isCartValid
    });

    if (!franchiseProfile) {
      toast({
        title: "Profile Required",
        description: "Please complete your franchise profile first",
        variant: "destructive"
      });
      return;
    }

    if (!items || items.length === 0 || !isCartValid) {
      toast({
        title: "Cart Error",
        description: "Your cart is empty or invalid",
        variant: "destructive"
      });
      return;
    }

    if (cartSummary.total <= 0) {
      toast({
        title: "Invalid Total",
        description: "Cart total must be greater than zero",
        variant: "destructive"
      });
      return;
    }

    setIsCreatingOrder(true);
    
    try {
      // Pre-create the order for payment processing
      const orderData = {
        items: items.map(item => ({
          item_name: item.name,
          quantity: item.quantity,
          unit_price: item.price
        })),
        shipping_address: shippingAddress,
        franchise_name: franchiseProfile.franchise_location,
        delivery_fee: cartSummary.deliveryFee
      };

      console.log('Creating order with data:', orderData);

      const orderCreated = await createOrder(orderData);
      
      if (orderCreated) {
        // Generate a temporary order ID for payment processing
        const tempOrderId = `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        setOrderId(tempOrderId);
        setCurrentStep('payment');
        
        toast({
          title: "Ready for Payment",
          description: "Please complete your payment to confirm the order",
        });
      } else {
        toast({
          title: "Order Creation Failed",
          description: "Failed to prepare order for payment. Please try again.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error preparing order:', error);
      toast({
        title: "Error",
        description: "Failed to prepare order for payment. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsCreatingOrder(false);
    }
  };

  const handlePaymentSuccess = (paymentData: any) => {
    console.log('Payment successful:', paymentData);
    
    // Clear the cart
    clearCart();
    
    toast({
      title: "Order Confirmed!",
      description: "Your payment was successful and order has been confirmed",
    });

    // Navigate to dashboard
    navigate('/franchise-dashboard');
  };

  const handlePaymentError = (error: any) => {
    console.error('Payment failed:', error);
    toast({
      title: "Payment Failed",
      description: "There was an issue with your payment. Please try again.",
      variant: "destructive"
    });
    
    // Go back to confirmation step
    setCurrentStep('confirmation');
  };

  // Payment step
  if (currentStep === 'payment' && orderId) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="mb-6">
          <Button 
            variant="ghost" 
            onClick={() => setCurrentStep('confirmation')}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Order Review
          </Button>
          <h2 className="text-2xl font-bold text-gray-900">Complete Payment</h2>
          <p className="text-gray-600">Secure payment for your franchise order</p>
        </div>

        <EnhancedRazorpayPayment
          orderId={orderId}
          amount={Math.round(cartSummary.total * 100)} // Convert to paise properly
          orderDetails={{
            franchise_name: franchiseProfile?.franchise_location || 'Franchise',
            shipping_address: shippingAddress,
            items: items.map(item => ({
              item_name: item.name,
              quantity: item.quantity,
              unit_price: item.price
            }))
          }}
          onPaymentSuccess={handlePaymentSuccess}
          onPaymentError={handlePaymentError}
        />
      </div>
    );
  }

  // Show error if cart is invalid
  if (!items || items.length === 0 || !isCartValid) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="text-center">
          <AlertCircle className="h-16 w-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Cart Error</h2>
          <p className="text-gray-600 mb-6">Your cart is empty or contains invalid items.</p>
          <Button onClick={() => navigate('/franchise-dashboard')} className="bg-emerald-600 hover:bg-emerald-700">
            Return to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  // Confirmation step
  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-6">
        <Button variant="ghost" onClick={onBack} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Cart
        </Button>
        <h2 className="text-2xl font-bold text-gray-900">Order Confirmation</h2>
        <p className="text-gray-600">Review your order before proceeding to payment</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Order Items */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Order Items ({items.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {items.map((item) => (
                  <div key={item.id} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-medium">{item.name}</h4>
                      <p className="text-sm text-gray-600">
                        {formatCurrency(item.price)} per {item.unit}
                      </p>
                      <Badge variant="outline" className="mt-1">
                        {item.category}
                      </Badge>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                      <p className="font-semibold">{formatCurrency(item.price * item.quantity)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Shipping Address */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Delivery Address
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">{shippingAddress}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Order Summary */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Order Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span>Subtotal ({items.length} items):</span>
                  <span>{formatCurrency(cartSummary.subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>GST:</span>
                  <span>{formatCurrency(cartSummary.gst)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="flex items-center gap-1">
                    <Truck className="h-4 w-4" />
                    Delivery Fee:
                  </span>
                  <span className={cartSummary.deliveryFee === 0 ? 'text-green-600 font-semibold' : ''}>
                    {cartSummary.deliveryFee === 0 ? 'FREE' : formatCurrency(cartSummary.deliveryFee)}
                  </span>
                </div>
                {cartSummary.loyaltyDiscount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Loyalty Discount:</span>
                    <span>-{formatCurrency(cartSummary.loyaltyDiscount)}</span>
                  </div>
                )}
                <Separator />
                <div className="flex justify-between font-bold text-lg">
                  <span>Total:</span>
                  <span>{formatCurrency(cartSummary.total)}</span>
                </div>
                
                {cartSummary.deliveryFee === 0 && (
                  <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 p-2 rounded">
                    <CheckCircle className="h-4 w-4" />
                    <span>Free delivery applied!</span>
                  </div>
                )}
              </div>

              <div className="mt-6">
                <Button
                  onClick={handleProceedToPayment}
                  disabled={isCreatingOrder || !isCartValid || cartSummary.total <= 0}
                  className="w-full bg-emerald-600 hover:bg-emerald-700"
                >
                  {isCreatingOrder ? (
                    <>
                      <Package className="h-4 w-4 mr-2 animate-spin" />
                      Preparing Order...
                    </>
                  ) : (
                    <>
                      <CreditCard className="h-4 w-4 mr-2" />
                      Proceed to Payment
                    </>
                  )}
                </Button>
              </div>

              <div className="mt-4 text-xs text-gray-500 text-center">
                <CheckCircle className="h-3 w-3 inline mr-1" />
                Secure payment with Razorpay
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CheckoutConfirmation;
