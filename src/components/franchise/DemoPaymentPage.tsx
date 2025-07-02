
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, CreditCard, Truck, Package } from 'lucide-react';

interface DemoPaymentPageProps {
  orderSummary: {
    items: Array<{
      name: string;
      quantity: number;
      price: number;
    }>;
    subtotal: number;
    gst: number;
    deliveryFee: number;
    total: number;
  };
  shippingDetails: {
    name: string;
    address: string;
  };
  onPaymentComplete: () => void;
  onBack: () => void;
}

const DemoPaymentPage: React.FC<DemoPaymentPageProps> = ({
  orderSummary,
  shippingDetails,
  onPaymentComplete,
  onBack
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentComplete, setPaymentComplete] = useState(false);

  const handleDemoPayment = async () => {
    setIsProcessing(true);
    
    // Simulate payment processing delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setIsProcessing(false);
    setPaymentComplete(true);
    
    // Auto-proceed after showing success
    setTimeout(() => {
      onPaymentComplete();
    }, 2000);
  };

  if (paymentComplete) {
    return (
      <div className="max-w-md mx-auto">
        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-8 text-center">
            <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-green-800 mb-2">Payment Successful!</h2>
            <p className="text-green-600 mb-4">Your order has been placed successfully.</p>
            <Badge className="bg-green-100 text-green-800">
              Order Total: ₹{orderSummary.total.toLocaleString()}
            </Badge>
            <p className="text-sm text-gray-600 mt-4">Redirecting to order confirmation...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Order Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Order Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {orderSummary.items.map((item, index) => (
              <div key={index} className="flex justify-between items-center py-2 border-b">
                <div>
                  <span className="font-medium">{item.name}</span>
                  <span className="text-gray-500 ml-2">× {item.quantity}</span>
                </div>
                <span>₹{(item.price * item.quantity).toLocaleString()}</span>
              </div>
            ))}
            
            <div className="space-y-2 pt-3 border-t">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>₹{orderSummary.subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>GST:</span>
                <span>₹{orderSummary.gst.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-1">
                  <Truck className="h-4 w-4" />
                  <span>Delivery Fee:</span>
                </div>
                <span>₹{orderSummary.deliveryFee.toLocaleString()}</span>
              </div>
              <div className="flex justify-between font-bold text-lg pt-2 border-t">
                <span>Total Amount:</span>
                <span>₹{orderSummary.total.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Shipping Details */}
      <Card>
        <CardHeader>
          <CardTitle>Shipping Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div>
            <p className="font-medium">{shippingDetails.name}</p>
            <p className="text-sm text-gray-600 mt-1">{shippingDetails.address}</p>
          </div>
        </CardContent>
      </Card>

      {/* Demo Payment Section */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-800">
            <CreditCard className="h-5 w-5" />
            Demo Payment
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center space-y-4">
            <p className="text-blue-700">
              This is a demo payment page. In production, this will integrate with Razorpay.
            </p>
            <Badge variant="outline" className="text-blue-600 border-blue-300">
              Demo Mode - No Real Payment Required
            </Badge>
            
            <div className="flex gap-3 justify-center pt-4">
              <Button variant="outline" onClick={onBack}>
                Back to Cart
              </Button>
              <Button 
                onClick={handleDemoPayment}
                disabled={isProcessing}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isProcessing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Processing...
                  </>
                ) : (
                  <>
                    <CreditCard className="h-4 w-4 mr-2" />
                    Complete Demo Payment
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DemoPaymentPage;
