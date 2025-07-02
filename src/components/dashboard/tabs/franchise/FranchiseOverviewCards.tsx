
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { ShoppingCart, Target, Star, UserPlus } from 'lucide-react';

interface FranchiseOverviewCardsProps {
  supplyOrders: number;
  totalSupplyValue: number;
  franchiseCount: number;
  activeMembersCount: number;
}

export const FranchiseOverviewCards = ({ 
  supplyOrders, 
  totalSupplyValue, 
  franchiseCount, 
  activeMembersCount 
}: FranchiseOverviewCardsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-700">Supply Orders</p>
              <p className="text-2xl font-bold text-blue-800">{supplyOrders}</p>
              <p className="text-xs text-green-600">Real-time</p>
            </div>
            <ShoppingCart className="h-8 w-8 text-blue-600" />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-purple-700">Supply Value</p>
              <p className="text-2xl font-bold text-purple-800">
                ₹{(totalSupplyValue / 1000).toFixed(0)}K
              </p>
              <p className="text-xs text-green-600">Live data</p>
            </div>
            <Target className="h-8 w-8 text-purple-600" />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-orange-700">Active Franchises</p>
              <p className="text-2xl font-bold text-orange-800">
                {franchiseCount}
              </p>
              <p className="text-xs text-green-600">Real-time</p>
            </div>
            <Star className="h-8 w-8 text-orange-600" />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-emerald-700">Total Members</p>
              <p className="text-2xl font-bold text-emerald-800">
                {activeMembersCount}
              </p>
              <p className="text-xs text-green-600">Active</p>
            </div>
            <UserPlus className="h-8 w-8 text-emerald-600" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
