
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  CreditCard, 
  AlertCircle, 
  CheckCircle, 
  Clock,
  Banknote,
  Smartphone
} from 'lucide-react';

interface PaymentProcessorProps {
  order: {
    id: string;
    total_amount: number;
    delivery_fee_override?: number;
    franchise_name: string;
    status: string;
  };
  onPaymentComplete: () => void;
}

const PaymentProcessor: React.FC<PaymentProcessorProps> = ({ order, onPaymentComplete }) => {
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'razorpay' | 'bank_transfer' | null>(null);

  const finalAmount = order.total_amount + (order.delivery_fee_override || 0);

  const handleRazorpayPayment = async () => {
    setIsProcessing(true);
    try {
      // Create payment transaction record
      const { data: transaction, error: transactionError } = await supabase
        .from('payment_transactions')
        .insert([{
          order_id: order.id,
          amount: finalAmount,
          currency: 'INR',
          status: 'created',
          payment_method: 'razorpay'
        }])
        .select()
        .single();

      if (transactionError) throw transactionError;

      // In a real implementation, you would integrate with Razorpay here
      // For now, we'll simulate a successful payment
      setTimeout(async () => {
        await completePayment(transaction.id, 'razorpay_payment_123', 'razorpay_signature_123');
      }, 2000);

      toast({
        title: "Payment Initiated",
        description: "Processing payment with Razorpay...",
      });

    } catch (error) {
      console.error('Error initiating payment:', error);
      toast({
        title: "Payment Error",
        description: "Failed to initiate payment. Please try again.",
        variant: "destructive"
      });
      setIsProcessing(false);
    }
  };

  const handleBankTransferPayment = async () => {
    setIsProcessing(true);
    try {
      // Create payment transaction record for bank transfer
      const { data: transaction, error: transactionError } = await supabase
        .from('payment_transactions')
        .insert([{
          order_id: order.id,
          amount: finalAmount,
          currency: 'INR',
          status: 'pending',
          payment_method: 'bank_transfer'
        }])
        .select()
        .single();

      if (transactionError) throw transactionError;

      // Update order status to indicate payment is pending
      const { error: orderError } = await supabase
        .from('franchise_orders')
        .update({ status: 'payment_pending' })
        .eq('id', order.id);

      if (orderError) throw orderError;

      toast({
        title: "Bank Transfer Initiated",
        description: "Please complete the bank transfer. Your order will be processed upon payment confirmation.",
      });

      onPaymentComplete();
    } catch (error) {
      console.error('Error initiating bank transfer:', error);
      toast({
        title: "Error",
        description: "Failed to initiate bank transfer. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const completePayment = async (transactionId: string, paymentId: string, signature: string) => {
    try {
      // Update payment transaction
      const { error: transactionError } = await supabase
        .from('payment_transactions')
        .update({
          status: 'completed',
          razorpay_payment_id: paymentId,
          razorpay_signature: signature
        })
        .eq('id', transactionId);

      if (transactionError) throw transactionError;

      // Update order status to paid
      const { error: orderError } = await supabase
        .from('franchise_orders')
        .update({ status: 'paid' })
        .eq('id', order.id);

      if (orderError) throw orderError;

      toast({
        title: "Payment Successful",
        description: "Your payment has been processed successfully. Order will be packed and shipped soon.",
      });

      onPaymentComplete();
    } catch (error) {
      console.error('Error completing payment:', error);
      toast({
        title: "Payment Error",
        description: "Payment processing failed. Please contact support.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  if (order.status !== 'confirmed') {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          This order is not ready for payment. Current status: {order.status}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          Payment Required
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Order Summary */}
        <div className="p-4 bg-gray-50 rounded-lg">
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Order Total:</span>
              <span>₹{order.total_amount.toLocaleString()}</span>
            </div>
            {order.delivery_fee_override && (
              <div className="flex justify-between">
                <span>Delivery Fee:</span>
                <span>₹{order.delivery_fee_override}</span>
              </div>
            )}
            <div className="border-t pt-2">
              <div className="flex justify-between font-bold text-lg">
                <span>Total Amount:</span>
                <span>₹{finalAmount.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Methods */}
        <div className="space-y-3">
          <h4 className="font-semibold">Select Payment Method</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Razorpay Option */}
            <Button
              variant={paymentMethod === 'razorpay' ? "default" : "outline"}
              className="h-auto p-4 justify-start"
              onClick={() => setPaymentMethod('razorpay')}
            >
              <div className="flex items-center gap-3">
                <Smartphone className="h-6 w-6" />
                <div className="text-left">
                  <div className="font-medium">Online Payment</div>
                  <div className="text-sm opacity-70">UPI, Cards, Net Banking</div>
                </div>
              </div>
            </Button>

            {/* Bank Transfer Option */}
            <Button
              variant={paymentMethod === 'bank_transfer' ? "default" : "outline"}
              className="h-auto p-4 justify-start"
              onClick={() => setPaymentMethod('bank_transfer')}
            >
              <div className="flex items-center gap-3">
                <Banknote className="h-6 w-6" />
                <div className="text-left">
                  <div className="font-medium">Bank Transfer</div>
                  <div className="text-sm opacity-70">NEFT, RTGS, IMPS</div>
                </div>
              </div>
            </Button>
          </div>
        </div>

        {/* Bank Transfer Details */}
        {paymentMethod === 'bank_transfer' && (
          <Alert>
            <Banknote className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-2">
                <p className="font-medium">Bank Transfer Details:</p>
                <div className="text-sm space-y-1">
                  <p><strong>Account Name:</strong> Tvanamm Tea Empire</p>
                  <p><strong>Account Number:</strong> 1234567890</p>
                  <p><strong>IFSC Code:</strong> HDFC0001234</p>
                  <p><strong>Bank:</strong> HDFC Bank</p>
                  <p><strong>Amount:</strong> ₹{finalAmount.toLocaleString()}</p>
                </div>
                <p className="text-xs text-gray-600 mt-2">
                  Please use Order ID #{order.id.slice(0, 8)} as reference
                </p>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Payment Actions */}
        <div className="space-y-2">
          {paymentMethod === 'razorpay' && (
            <Button
              onClick={handleRazorpayPayment}
              disabled={isProcessing}
              className="w-full"
            >
              {isProcessing ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Processing Payment...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4" />
                  Pay ₹{finalAmount.toLocaleString()}
                </div>
              )}
            </Button>
          )}

          {paymentMethod === 'bank_transfer' && (
            <Button
              onClick={handleBankTransferPayment}
              disabled={isProcessing}
              className="w-full"
            >
              {isProcessing ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Processing...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  Confirm Bank Transfer
                </div>
              )}
            </Button>
          )}
        </div>

        {/* Security Notice */}
        <div className="text-xs text-gray-500 p-3 bg-blue-50 rounded-lg">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            <span>Your payment is secure and encrypted. You'll receive a confirmation once processed.</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PaymentProcessor;
