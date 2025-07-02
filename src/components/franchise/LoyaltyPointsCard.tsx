
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useLoyaltyPoints } from '@/hooks/useLoyaltyPoints';
import { 
  Star, 
  Gift, 
  TrendingUp, 
  History,
  Award
} from 'lucide-react';

const LoyaltyPointsCard = () => {
  const { loyaltyPoints, transactions, gifts, loading } = useLoyaltyPoints();

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <div className="w-6 h-6 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p>Loading loyalty points...</p>
        </CardContent>
      </Card>
    );
  }

  if (!loyaltyPoints) {
    return (
      <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
        <CardContent className="p-6 text-center">
          <Star className="h-12 w-12 text-purple-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-purple-800 mb-2">Start Earning Loyalty Points!</h3>
          <p className="text-purple-600 text-sm">
            Complete orders above ₹5,000 to earn 20 loyalty points each time.
          </p>
        </CardContent>
      </Card>
    );
  }

  const canClaimGift = loyaltyPoints.current_balance >= 500;

  return (
    <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-purple-800">
          <Star className="h-5 w-5" />
          Loyalty Points
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Points Balance */}
        <div className="text-center">
          <div className="text-3xl font-bold text-purple-700">
            {loyaltyPoints.current_balance}
          </div>
          <p className="text-sm text-purple-600">Available Points</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-white rounded-lg border border-purple-200">
            <div className="flex items-center justify-center gap-1 mb-1">
              <TrendingUp className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium text-gray-700">Earned</span>
            </div>
            <div className="text-lg font-bold text-green-600">
              {loyaltyPoints.total_earned}
            </div>
          </div>
          <div className="text-center p-3 bg-white rounded-lg border border-purple-200">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Gift className="h-4 w-4 text-orange-600" />
              <span className="text-sm font-medium text-gray-700">Redeemed</span>
            </div>
            <div className="text-lg font-bold text-orange-600">
              {loyaltyPoints.total_redeemed}
            </div>
          </div>
        </div>

        {/* Gift Eligibility */}
        {canClaimGift && (
          <div className="p-3 bg-gradient-to-r from-gold-50 to-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Award className="h-5 w-5 text-yellow-600" />
              <span className="font-semibold text-yellow-800">Gift Available!</span>
            </div>
            <p className="text-sm text-yellow-700 mb-3">
              You have {loyaltyPoints.current_balance} points. Claim a gift for 500 points!
            </p>
            <Badge className="bg-yellow-500 text-white">
              Ready to Claim Gift
            </Badge>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Dialog>
            <DialogTrigger asChild>
              <Button size="sm" variant="outline" className="flex-1">
                <History className="h-4 w-4 mr-1" />
                History
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Loyalty Points History</DialogTitle>
              </DialogHeader>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {transactions.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">No transactions yet</p>
                ) : (
                  transactions.map((transaction) => (
                    <div key={transaction.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium">{transaction.description}</p>
                        <p className="text-sm text-gray-600">
                          {new Date(transaction.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <Badge className={
                        transaction.points > 0 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }>
                        {transaction.points > 0 ? '+' : ''}{transaction.points}
                      </Badge>
                    </div>
                  ))
                )}
              </div>
            </DialogContent>
          </Dialog>

          {gifts.length > 0 && (
            <Dialog>
              <DialogTrigger asChild>
                <Button size="sm" variant="outline" className="flex-1">
                  <Gift className="h-4 w-4 mr-1" />
                  Gifts
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Claimed Gifts</DialogTitle>
                </DialogHeader>
                <div className="space-y-3">
                  {gifts.map((gift) => (
                    <div key={gift.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium">
                          {gift.gift_type === 'free_delivery' ? 'Free Delivery' : '30 Tea Cups'}
                        </p>
                        <p className="text-sm text-gray-600">
                          {new Date(gift.claimed_at).toLocaleDateString()}
                        </p>
                      </div>
                      <Badge className="bg-purple-100 text-purple-800">
                        -{gift.points_used} points
                      </Badge>
                    </div>
                  ))}
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default LoyaltyPointsCard;
