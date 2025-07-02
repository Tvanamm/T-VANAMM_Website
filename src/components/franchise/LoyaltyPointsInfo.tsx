
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { 
  Star, 
  Gift, 
  Truck, 
  Coffee, 
  Info, 
  Clock,
  Trophy,
  Target
} from 'lucide-react';

interface LoyaltyInfo {
  id: string;
  info_type: string;
  title: string;
  description: string;
  points_value?: number;
}

interface LoyaltyPointsInfoProps {
  currentBalance: number;
}

const LoyaltyPointsInfo: React.FC<LoyaltyPointsInfoProps> = ({ currentBalance }) => {
  const [loyaltyInfo, setLoyaltyInfo] = useState<LoyaltyInfo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLoyaltyInfo = async () => {
      try {
        const { data, error } = await supabase
          .from('loyalty_points_info')
          .select('*')
          .order('info_type', { ascending: true });

        if (error) throw error;
        setLoyaltyInfo(data || []);
      } catch (error) {
        console.error('Error fetching loyalty info:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLoyaltyInfo();
  }, []);

  const getIconForType = (type: string, title: string) => {
    if (type === 'earning') return <Star className="h-5 w-5 text-yellow-500" />;
    if (title.includes('Delivery')) return <Truck className="h-5 w-5 text-blue-500" />;
    if (title.includes('Tea Cups')) return <Coffee className="h-5 w-5 text-brown-500" />;
    if (title.includes('Validity')) return <Clock className="h-5 w-5 text-green-500" />;
    return <Info className="h-5 w-5 text-gray-500" />;
  };

  const getColorForType = (type: string) => {
    switch (type) {
      case 'earning': return 'bg-yellow-50 border-yellow-200';
      case 'redemption': return 'bg-blue-50 border-blue-200';
      case 'general': return 'bg-green-50 border-green-200';
      default: return 'bg-gray-50 border-gray-200';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-4 text-center">
          <div className="w-6 h-6 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          <p className="text-sm text-gray-600">Loading loyalty information...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Current Balance Card */}
      <Card className="bg-gradient-to-r from-emerald-50 to-green-50 border-2 border-emerald-200">
        <CardContent className="p-6 text-center">
          <div className="flex items-center justify-center gap-2 mb-3">
            <Trophy className="h-8 w-8 text-emerald-600" />
            <h3 className="text-2xl font-bold text-emerald-800">Your Points Balance</h3>
          </div>
          <div className="text-4xl font-bold text-emerald-600 mb-2">
            {currentBalance.toLocaleString()}
          </div>
          <p className="text-emerald-700 font-medium">Loyalty Points Available</p>
          
          {/* Progress to next milestone */}
          <div className="mt-4 space-y-2">
            <div className="flex justify-between text-sm text-emerald-700">
              <span>Progress to Free Gift (500 points)</span>
              <span>{Math.min(currentBalance, 500)}/500</span>
            </div>
            <div className="w-full bg-emerald-200 rounded-full h-2">
              <div 
                className="bg-emerald-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${Math.min((currentBalance / 500) * 100, 100)}%` }}
              ></div>
            </div>
            {currentBalance >= 500 && (
              <Badge className="bg-emerald-600 text-white mt-2">
                🎉 Free Gift Available!
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Loyalty Information Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {loyaltyInfo.map((info, index) => (
          <Card 
            key={info.id} 
            className={`${getColorForType(info.info_type)} border-2 hover:shadow-md transition-shadow`}
          >
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                {getIconForType(info.info_type, info.title)}
                {info.title}
                {info.points_value && (
                  <Badge className="ml-auto bg-emerald-600 text-white">
                    {info.points_value} pts
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-gray-700 leading-relaxed">
                {info.description}
              </p>
              {info.info_type === 'earning' && (
                <div className="mt-3 p-3 bg-yellow-100 border border-yellow-200 rounded-lg">
                  <div className="text-sm text-yellow-800">
                    <strong>Example:</strong> Order worth ₹6,000 = 20 points earned!
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Tips Card */}
      <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-purple-800">
            <Target className="h-5 w-5" />
            Quick Tips to Maximize Points
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <span>Place orders above ₹5,000 to earn points</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <span>Points are credited after delivery</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <span>Save 500 points for free gifts</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <span>Use points for instant discounts</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoyaltyPointsInfo;
