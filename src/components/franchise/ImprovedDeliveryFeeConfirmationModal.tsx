
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Truck, Calculator, AlertCircle, Package, MapPin } from 'lucide-react';

interface ImprovedDeliveryFeeConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (deliveryFee: number, notes?: string) => void;
  order: {
    id: string;
    franchise_name: string;
    total_amount: number;
    shipping_address: string;
    detailed_address?: any;
  };
}

const ImprovedDeliveryFeeConfirmationModal: React.FC<ImprovedDeliveryFeeConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  order
}) => {
  const [deliveryFee, setDeliveryFee] = useState<number>(50);
  const [customFee, setCustomFee] = useState<string>('50');
  const [isCustom, setIsCustom] = useState(false);
  const [notes, setNotes] = useState<string>('');

  const handleConfirm = () => {
    const finalFee = isCustom ? parseFloat(customFee) || 0 : deliveryFee;
    
    // Validate delivery fee
    if (isNaN(finalFee) || finalFee < 0) {
      return;
    }
    
    console.log('Confirming delivery fee:', finalFee);
    onConfirm(finalFee, notes.trim() || undefined);
  };

  const handleFeePreset = (fee: number) => {
    setDeliveryFee(fee);
    setCustomFee(fee.toString());
    setIsCustom(false);
  };

  const handleCustomFeeChange = (value: string) => {
    // Only allow numeric values
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      setCustomFee(value);
      setIsCustom(true);
    }
  };

  const getFinalFee = () => {
    if (isCustom) {
      const parsed = parseFloat(customFee);
      return isNaN(parsed) ? 0 : parsed;
    }
    return deliveryFee;
  };

  const isValidFee = () => {
    const fee = getFinalFee();
    return !isNaN(fee) && fee >= 0;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Truck className="h-5 w-5 text-emerald-600" />
            Confirm Order & Set Delivery Fee
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Order Summary */}
          <Card className="bg-gradient-to-r from-emerald-50 to-teal-50 border-emerald-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <Package className="h-5 w-5 text-emerald-600" />
                <h3 className="font-semibold text-emerald-800">Order Details</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-emerald-700">Order ID:</span>
                    <span className="text-sm font-mono">#{order.id.slice(0, 8)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-emerald-700">Franchise:</span>
                    <span className="text-sm">{order.franchise_name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-emerald-700">Order Total:</span>
                    <span className="text-sm font-bold">₹{order.total_amount.toLocaleString()}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs font-medium text-emerald-700 mb-1">Delivery Address:</p>
                      <p className="text-sm text-gray-700">{order.shipping_address}</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Delivery Fee Options */}
          <div className="space-y-4">
            <h4 className="font-medium flex items-center gap-2">
              <Calculator className="h-4 w-4 text-blue-600" />
              Set Delivery Fee
            </h4>
            
            {/* Preset Options */}
            <div className="grid grid-cols-4 gap-3">
              <Button
                variant={!isCustom && deliveryFee === 0 ? "default" : "outline"}
                size="sm"
                onClick={() => handleFeePreset(0)}
                className="h-12 flex flex-col items-center justify-center"
              >
                <span className="font-semibold">Free</span>
                <span className="text-xs opacity-70">₹0</span>
              </Button>
              <Button
                variant={!isCustom && deliveryFee === 50 ? "default" : "outline"}
                size="sm"
                onClick={() => handleFeePreset(50)}
                className="h-12 flex flex-col items-center justify-center"
              >
                <span className="font-semibold">Standard</span>
                <span className="text-xs opacity-70">₹50</span>
              </Button>
              <Button
                variant={!isCustom && deliveryFee === 100 ? "default" : "outline"}
                size="sm"
                onClick={() => handleFeePreset(100)}
                className="h-12 flex flex-col items-center justify-center"
              >
                <span className="font-semibold">Express</span>
                <span className="text-xs opacity-70">₹100</span>
              </Button>
              <Button
                variant={!isCustom && deliveryFee === 150 ? "default" : "outline"}
                size="sm"
                onClick={() => handleFeePreset(150)}
                className="h-12 flex flex-col items-center justify-center"
              >
                <span className="font-semibold">Priority</span>
                <span className="text-xs opacity-70">₹150</span>
              </Button>
            </div>

            {/* Custom Fee Input */}
            <div className="space-y-2">
              <Label htmlFor="customFee">Custom Delivery Fee</Label>
              <Input
                id="customFee"
                type="text"
                placeholder="Enter custom amount"
                value={customFee}
                onChange={(e) => handleCustomFeeChange(e.target.value)}
                className={isCustom ? "border-blue-300 ring-1 ring-blue-200" : ""}
              />
              {!isValidFee() && (
                <p className="text-sm text-red-600">Please enter a valid delivery fee (0 or positive number)</p>
              )}
            </div>

            {/* Delivery Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes">Delivery Notes (Optional)</Label>
              <Textarea
                id="notes"
                placeholder="Add any special instructions or notes for delivery..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
              />
            </div>
          </div>

          {/* Total Calculation */}
          <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
            <CardContent className="p-4">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-blue-800">Order Amount:</span>
                  <span className="font-semibold text-blue-700">₹{order.total_amount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-medium text-blue-800">Delivery Fee:</span>
                  <span className="font-semibold text-blue-700">₹{getFinalFee()}</span>
                </div>
                <div className="border-t border-blue-200 pt-2">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold text-blue-900">Total Amount:</span>
                    <span className="text-xl font-bold text-blue-800">
                      ₹{(order.total_amount + getFinalFee()).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Warning */}
          <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-amber-800">
              <p className="font-medium mb-1">Important:</p>
              <p>Once confirmed, the franchise will be notified and can proceed with payment. The delivery fee is final and cannot be changed after confirmation.</p>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleConfirm} 
            disabled={!isValidFee()}
            className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700"
          >
            Confirm Order & Set Delivery Fee
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ImprovedDeliveryFeeConfirmationModal;
