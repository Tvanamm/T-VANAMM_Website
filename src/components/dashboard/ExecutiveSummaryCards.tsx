
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, Package, Users, FileText } from 'lucide-react';
import { useFormSubmissions } from '@/hooks/useFormSubmissions';

interface ExecutiveSummaryCardsProps {
  currentData: {
    inventory: number;
    franchises: number;
    growth: number;
  };
  franchiseCount: number;
  websiteVisits?: number; // Made optional for backward compatibility
}

const ExecutiveSummaryCards = ({ currentData, franchiseCount }: ExecutiveSummaryCardsProps) => {
  const { franchiseEnquiries, loading } = useFormSubmissions();

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-6 mb-8">
      <Card className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white border-0 shadow-lg">
        <CardContent className="p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-emerald-100 text-xs sm:text-sm font-medium">Total Inventory</p>
              <p className="text-xl sm:text-2xl font-bold">{currentData.inventory}</p>
              <div className="flex items-center mt-2">
                <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                <span className="text-xs sm:text-sm">+{currentData.growth}% Live</span>
              </div>
            </div>
            <Package className="h-6 w-6 sm:h-8 sm:w-8 text-emerald-200" />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0 shadow-lg">
        <CardContent className="p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-xs sm:text-sm font-medium">Active Franchises</p>
              <p className="text-xl sm:text-2xl font-bold">{franchiseCount}</p>
              <div className="flex items-center mt-2">
                <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                <span className="text-xs sm:text-sm">Real-time</span>
              </div>
            </div>
            <Users className="h-6 w-6 sm:h-8 sm:w-8 text-purple-200" />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white border-0 shadow-lg">
        <CardContent className="p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-xs sm:text-sm font-medium">Franchise Enquiries</p>
              <p className="text-xl sm:text-2xl font-bold">
                {loading ? '...' : franchiseEnquiries.length}
              </p>
              <div className="flex items-center mt-2">
                <FileText className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                <span className="text-xs sm:text-sm">Real-time DB</span>
              </div>
            </div>
            <FileText className="h-6 w-6 sm:h-8 sm:w-8 text-orange-200" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ExecutiveSummaryCards;
