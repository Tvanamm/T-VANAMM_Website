
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { useLoyaltyPoints } from '@/hooks/useLoyaltyPoints';
import { 
  Gift, 
  Truck, 
  Coffee,
  Star
} from 'lucide-react';

interface GiftSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGiftSelected: (giftType: 'free_delivery' | 'tea_cups' | null) => void;
  currentPoints: number;
}

const GiftSelectionModal: React.FC<GiftSelectionModalProps> = ({
  isOpen,
  onClose,
  onGiftSelected,
  currentPoints
}) => {
  const { claimGift } = useLoyaltyPoints();
  const [wantsGift, setWantsGift] = useState(false);
  const [selectedGift, setSelectedGift] = useState<'free_delivery' | 'tea_cups' | null>(null);
  const [processing, setProcessing] = useState(false);

  const canClaimGift = currentPoints >= 500;

  const handleConfirm = async () => {
    if (!wantsGift || !selectedGift) {
      onGiftSelected(null);
      onClose();
      return;
    }

    setProcessing(true);
    const success = await claimGift(selectedGift);
    setProcessing(false);

    if (success) {
      onGiftSelected(selectedGift);
      onClose();
    }
  };

  const handleClose = () => {
    setWantsGift(false);
    setSelectedGift(null);
    onClose();
  };

  const handleWantsGiftChange = (checked: boolean | 'indeterminate') => {
    setWantsGift(checked === true);
  };

  if (!canClaimGift) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Gift className="h-5 w-5 text-purple-600" />
            Claim Your Gift!
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Points Display */}
          <div className="text-center p-4 bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg border border-purple-200">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Star className="h-5 w-5 text-purple-600" />
              <span className="font-semibold text-purple-800">You have {currentPoints} points!</span>
            </div>
            <p className="text-sm text-purple-600">
              Congratulations! You're eligible for a 500-point gift.
            </p>
          </div>

          {/* Gift Option Checkbox */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="want-gift"
              checked={wantsGift}
              onCheckedChange={handleWantsGiftChange}
            />
            <label 
              htmlFor="want-gift"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Do you want a gift for your 500 points?
            </label>
          </div>

          {/* Gift Selection */}
          {wantsGift && (
            <div className="space-y-3">
              <p className="text-sm font-medium text-gray-700">Choose your gift:</p>
              
              <div className="space-y-2">
                <div 
                  className={`p-4 border rounded-lg cursor-pointer transition-all ${
                    selectedGift === 'free_delivery' 
                      ? 'border-emerald-500 bg-emerald-50' 
                      : 'border-gray-200 hover:border-emerald-300'
                  }`}
                  onClick={() => setSelectedGift('free_delivery')}
                >
                  <div className="flex items-center gap-3">
                    <Truck className="h-5 w-5 text-emerald-600" />
                    <div>
                      <p className="font-medium">Free Delivery</p>
                      <p className="text-sm text-gray-600">Free shipping on your next order</p>
                    </div>
                  </div>
                </div>

                <div 
                  className={`p-4 border rounded-lg cursor-pointer transition-all ${
                    selectedGift === 'tea_cups' 
                      ? 'border-orange-500 bg-orange-50' 
                      : 'border-gray-200 hover:border-orange-300'
                  }`}
                  onClick={() => setSelectedGift('tea_cups')}
                >
                  <div className="flex items-center gap-3">
                    <Coffee className="h-5 w-5 text-orange-600" />
                    <div>
                      <p className="font-medium">30 Tea Cups</p>
                      <p className="text-sm text-gray-600">Premium tea cups delivered to you</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button 
              variant="outline" 
              onClick={handleClose}
              className="flex-1"
              disabled={processing}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleConfirm}
              className="flex-1 bg-purple-600 hover:bg-purple-700"
              disabled={processing || (wantsGift && !selectedGift)}
            >
              {processing ? 'Processing...' : 'Confirm'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default GiftSelectionModal;
