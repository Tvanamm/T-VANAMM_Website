
import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { CreditCard, AlertCircle, CheckCircle, Loader } from 'lucide-react';

interface EnhancedRazorpayPaymentProps {
  orderId: string;
  amount: number; // in paise
  orderDetails: {
    franchise_name: string;
    shipping_address: string;
    items: Array<{
      item_name: string;
      quantity: number;
      unit_price: number;
    }>;
  };
  onPaymentSuccess: (paymentData: any) => void;
  onPaymentError: (error: any) => void;
}

declare global {
  interface Window {
    Razorpay: any;
  }
}

const EnhancedRazorpayPayment: React.FC<EnhancedRazorpayPaymentProps> = ({
  orderId,
  amount,
  orderDetails,
  onPaymentSuccess,
  onPaymentError
}) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [razorpayKey, setRazorpayKey] = useState<string | null>(null);
  const [razorpayOrderId, setRazorpayOrderId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load Razorpay key
  useEffect(() => {
    const fetchRazorpayKey = async () => {
      try {
        console.log('Fetching Razorpay key...');
        const { data, error } = await supabase.functions.invoke('get-razorpay-key');
        
        if (error) {
          console.error('Error fetching Razorpay key:', error);
          setError(`Failed to initialize payment system: ${error.message}`);
          return;
        }
        
        if (data?.key) {
          setRazorpayKey(data.key);
          console.log('Razorpay key loaded successfully');
        } else {
          console.error('No Razorpay key received:', data);
          setError('No Razorpay key received from server');
        }
      } catch (err) {
        console.error('Error loading Razorpay key:', err);
        setError(`Failed to initialize payment system: ${err.message}`);
      }
    };

    fetchRazorpayKey();
  }, []);

  // Load Razorpay script
  useEffect(() => {
    if (!razorpayKey) return;

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => {
      console.log('Razorpay script loaded successfully');
      setIsInitialized(true);
    };
    script.onerror = () => {
      console.error('Failed to load Razorpay script');
      setError('Failed to load payment gateway');
    };
    
    document.body.appendChild(script);

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, [razorpayKey]);

  const createRazorpayOrder = async () => {
    try {
      console.log('Creating Razorpay order with amount:', amount);
      
      const { data, error } = await supabase.functions.invoke('create-razorpay-order', {
        body: {
          amount: amount,
          currency: 'INR',
          orderId: orderId,
          notes: {
            franchise_name: orderDetails.franchise_name,
            franchise_order_id: orderId
          }
        }
      });

      if (error) {
        console.error('Error creating Razorpay order:', error);
        throw new Error(error.message || 'Failed to create payment order');
      }

      console.log('Razorpay order response:', data);

      if (data?.order?.id) {
        setRazorpayOrderId(data.order.id);
        console.log('Razorpay order created:', data.order.id);
        return data.order.id;
      } else if (data?.id) {
        // Handle direct order response
        setRazorpayOrderId(data.id);
        console.log('Razorpay order created:', data.id);
        return data.id;
      } else {
        console.error('Invalid order response:', data);
        throw new Error('No Razorpay order ID received');
      }
    } catch (error: any) {
      console.error('Failed to create Razorpay order:', error);
      setError(error.message || 'Failed to create payment order');
      throw error;
    }
  };

  const handlePayment = async () => {
    if (!razorpayKey || !window.Razorpay || !isInitialized) {
      setError('Payment system not ready. Please try again.');
      return;
    }

    if (amount <= 0) {
      setError('Invalid payment amount');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      let orderIdToUse = razorpayOrderId;
      
      if (!orderIdToUse) {
        orderIdToUse = await createRazorpayOrder();
      }

      const options = {
        key: razorpayKey,
        amount: amount,
        currency: 'INR',
        order_id: orderIdToUse,
        name: 'Tvanamm Tea',
        description: `Order for ${orderDetails.franchise_name}`,
        prefill: {
          name: orderDetails.franchise_name,
        },
        notes: {
          franchise_name: orderDetails.franchise_name,
          franchise_order_id: orderId,
          shipping_address: orderDetails.shipping_address
        },
        theme: {
          color: '#047857'
        },
        handler: function (response: any) {
          console.log('Payment successful:', response);
          setIsLoading(false);
          onPaymentSuccess(response);
        },
        modal: {
          ondismiss: function() {
            console.log('Payment modal dismissed');
            setIsLoading(false);
            onPaymentError({ message: 'Payment cancelled by user' });
          }
        }
      };

      console.log('Opening Razorpay checkout with options:', options);
      const razorpayInstance = new window.Razorpay(options);
      
      razorpayInstance.on('payment.failed', function (response: any) {
        console.error('Payment failed:', response.error);
        setIsLoading(false);
        onPaymentError(response.error);
      });

      razorpayInstance.open();
    } catch (error: any) {
      console.error('Error initiating payment:', error);
      setIsLoading(false);
      setError(error.message || 'Failed to initiate payment');
      onPaymentError(error);
    }
  };

  const formatAmount = (amountInPaise: number) => {
    return `₹${(amountInPaise / 100).toLocaleString('en-IN')}`;
  };

  if (!razorpayKey || !isInitialized) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center space-x-2">
            <Loader className="h-4 w-4 animate-spin" />
            <span>Initializing payment system...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Payment Error:</strong> {error}
            </AlertDescription>
          </Alert>
          <Button 
            onClick={() => {
              setError(null);
              setRazorpayOrderId(null);
            }}
            variant="outline" 
            className="mt-4 w-full"
          >
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          Secure Payment
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="p-4 bg-gray-50 rounded-lg">
          <div className="flex justify-between items-center mb-2">
            <span className="font-semibold">Total Amount:</span>
            <span className="text-xl font-bold text-emerald-600">
              {formatAmount(amount)}
            </span>
          </div>
          <div className="text-sm text-gray-600">
            Order: {orderDetails.franchise_name}
          </div>
        </div>

        <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 p-3 rounded-lg">
          <CheckCircle className="h-4 w-4" />
          <span>Secured by Razorpay - Your payment information is safe</span>
        </div>

        <Button
          onClick={handlePayment}
          disabled={isLoading}
          className="w-full bg-emerald-600 hover:bg-emerald-700"
          size="lg"
        >
          {isLoading ? (
            <>
              <Loader className="h-4 w-4 mr-2 animate-spin" />
              Processing Payment...
            </>
          ) : (
            <>
              <CreditCard className="h-4 w-4 mr-2" />
              Pay {formatAmount(amount)}
            </>
          )}
        </Button>

        <div className="text-xs text-gray-500 text-center">
          By proceeding, you agree to our terms and conditions
        </div>
      </CardContent>
    </Card>
  );
};

export default EnhancedRazorpayPayment;
