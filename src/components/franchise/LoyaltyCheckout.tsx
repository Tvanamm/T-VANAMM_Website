
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useEnhancedLoyalty } from '@/hooks/useEnhancedLoyalty';
import { 
  Gift, 
  Star, 
  Truck, 
  Coffee,
  Coins,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

interface LoyaltyCheckoutProps {
  franchiseMemberId: string;
  orderTotal: number;
  onApplyDiscount: (discount: number, pointsUsed: number) => void;
  onClaimGift: (giftType: string, pointsUsed: number) => void;
  appliedDiscount?: number;
  claimedGift?: string;
}

const LoyaltyCheckout: React.FC<LoyaltyCheckoutProps> = ({
  franchiseMemberId,
  orderTotal,
  onApplyDiscount,
  onClaimGift,
  appliedDiscount = 0,
  claimedGift
}) => {
  const { loyaltyPoints, canClaimGift, calculateDiscount } = useEnhancedLoyalty(franchiseMemberId);
  const [pointsToUse, setPointsToUse] = useState(0);
  const [showPointsInput, setShowPointsInput] = useState(false);

  const handleApplyDiscount = () => {
    if (pointsToUse > 0 && loyaltyPoints) {
      // Validate points to use
      if (pointsToUse > loyaltyPoints.current_balance) {
        alert(`You only have ${loyaltyPoints.current_balance} points available.`);
        return;
      }

      // Calculate maximum discount (can't exceed order total)
      const maxDiscount = Math.min(pointsToUse, loyaltyPoints.current_balance, orderTotal);
      
      // Apply 1 point = 1 rupee discount
      onApplyDiscount(maxDiscount, maxDiscount);
      setPointsToUse(0);
      setShowPointsInput(false);
    }
  };

  const handleClaimGift = (giftType: string) => {
    if (canClaimGift(500)) {
      onClaimGift(giftType, 500);
    }
  };

  const handleQuickDiscount = (percentage: number) => {
    if (!loyaltyPoints) return;
    
    const discountAmount = Math.floor(orderTotal * percentage / 100);
    const maxDiscount = Math.min(discountAmount, loyaltyPoints.current_balance, orderTotal);
    
    if (maxDiscount > 0) {
      onApplyDiscount(maxDiscount, maxDiscount);
    }
  };

  if (!loyaltyPoints) {
    return (
      <Card>
        <CardContent className="p-4">
          <div className="text-center text-gray-500">
            <div className="w-6 h-6 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
            Loading loyalty information...
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-2 border-emerald-200">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-emerald-700">
          <Star className="h-5 w-5" />
          Loyalty Benefits
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current Balance */}
        <div className="flex items-center justify-between p-3 bg-emerald-50 rounded-lg">
          <div className="flex items-center gap-2">
            <Coins className="h-5 w-5 text-emerald-600" />
            <span className="font-medium text-emerald-800">Available Points</span>
          </div>
          <Badge className="bg-emerald-600 hover:bg-emerald-700">
            {loyaltyPoints.current_balance} Points
          </Badge>
        </div>

        {/* Points Discount Section */}
        {loyaltyPoints.current_balance > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-gray-800">Use Points for Discount</h4>
              <span className="text-xs text-gray-500">1 Point = ₹1</span>
            </div>
            
            {appliedDiscount > 0 ? (
              <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <div className="flex-1">
                  <span className="text-green-800 font-medium">
                    ₹{appliedDiscount} discount applied
                  </span>
                  <p className="text-xs text-green-600">
                    {appliedDiscount} points used
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onApplyDiscount(0, 0)}
                  className="text-green-600 hover:text-green-700"
                >
                  Remove
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {/* Quick Discount Options */}
                <div className="grid grid-cols-3 gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleQuickDiscount(5)}
                    disabled={loyaltyPoints.current_balance < Math.floor(orderTotal * 0.05)}
                  >
                    5% Off
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleQuickDiscount(10)}
                    disabled={loyaltyPoints.current_balance < Math.floor(orderTotal * 0.10)}
                  >
                    10% Off
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowPointsInput(!showPointsInput)}
                  >
                    Custom
                  </Button>
                </div>

                {/* Custom Points Input */}
                {showPointsInput && (
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <Input
                        type="number"
                        placeholder="Points to use"
                        value={pointsToUse}
                        onChange={(e) => setPointsToUse(Math.max(0, parseInt(e.target.value) || 0))}
                        max={Math.min(loyaltyPoints.current_balance, orderTotal)}
                        min="0"
                        className="flex-1"
                      />
                      <Button 
                        onClick={handleApplyDiscount}
                        disabled={pointsToUse <= 0 || pointsToUse > loyaltyPoints.current_balance}
                        size="sm"
                      >
                        Apply
                      </Button>
                    </div>
                    
                    {pointsToUse > 0 && (
                      <div className="text-sm text-gray-600">
                        Discount: ₹{Math.min(pointsToUse, loyaltyPoints.current_balance, orderTotal)}
                      </div>
                    )}
                    
                    {pointsToUse > loyaltyPoints.current_balance && (
                      <div className="flex items-center gap-1 text-sm text-red-600">
                        <AlertCircle className="h-4 w-4" />
                        Insufficient points available
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Gift Claims Section */}
        {canClaimGift(500) && !claimedGift && (
          <div className="space-y-3">
            <h4 className="font-semibold text-gray-800">Claim Gift (500 Points)</h4>
            <div className="grid grid-cols-1 gap-2">
              <Button
                variant="outline"
                onClick={() => handleClaimGift('free_delivery')}
                className="justify-start h-auto p-3 border-2 hover:border-emerald-300"
              >
                <div className="flex items-center gap-3">
                  <Truck className="h-5 w-5 text-emerald-600" />
                  <div className="text-left">
                    <div className="font-medium">Free Delivery</div>
                    <div className="text-sm text-gray-500">Save delivery charges</div>
                  </div>
                </div>
              </Button>
              
              <Button
                variant="outline"
                onClick={() => handleClaimGift('tea_cups')}
                className="justify-start h-auto p-3 border-2 hover:border-emerald-300"
              >
                <div className="flex items-center gap-3">
                  <Coffee className="h-5 w-5 text-emerald-600" />
                  <div className="text-left">
                    <div className="font-medium">30 Tea Cups</div>
                    <div className="text-sm text-gray-500">Premium tea cups set</div>
                  </div>
                </div>
              </Button>
            </div>
          </div>
        )}

        {/* Claimed Gift Display */}
        {claimedGift && (
          <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <Gift className="h-5 w-5 text-blue-600" />
            <span className="text-blue-800 font-medium">
              Gift claimed: {claimedGift === 'free_delivery' ? 'Free Delivery' : '30 Tea Cups'}
            </span>
          </div>
        )}

        {/* Points Earning Info */}
        <div className="text-xs text-gray-500 p-2 bg-gray-50 rounded">
          💡 Earn 20 points on orders above ₹5000 when delivered
        </div>

        {/* Balance Warning */}
        {loyaltyPoints.current_balance === 0 && (
          <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <AlertCircle className="h-4 w-4 text-amber-600" />
            <span className="text-amber-800 text-sm">
              No loyalty points available. Place orders above ₹5000 to earn points!
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default LoyaltyCheckout;
