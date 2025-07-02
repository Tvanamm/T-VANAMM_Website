
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { TrendingUp, ShoppingCart, Users, DollarSign, Package, AlertTriangle, Download } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useRealTimeAnalytics } from '@/hooks/useRealTimeAnalytics';

const RealTimeAnalyticsCards = () => {
  const { analytics, loading } = useRealTimeAnalytics();

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/3"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6">
      {/* Total Inventory Card */}
      <Card className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-emerald-100">Total Inventory</p>
              <p className="text-2xl font-bold">{analytics.totalInventory}</p>
              <Badge variant="outline" className="mt-1 text-emerald-100 border-emerald-200">
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-emerald-200 rounded-full animate-pulse"></div>
                  Real-time
                </div>
              </Badge>
            </div>
            <Package className="h-12 w-12 text-emerald-200" />
          </div>
        </CardContent>
      </Card>

      {/* Low Stock Items Card */}
      <Card className={`bg-gradient-to-r ${analytics.lowStockItems > 0 ? 'from-yellow-500 to-yellow-600' : 'from-green-500 to-green-600'} text-white`}>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className={`${analytics.lowStockItems > 0 ? 'text-yellow-100' : 'text-green-100'}`}>Low Stock Items</p>
              <p className="text-2xl font-bold">{analytics.lowStockItems}</p>
              <Badge variant="outline" className={`mt-1 ${analytics.lowStockItems > 0 ? 'text-yellow-100 border-yellow-200' : 'text-green-100 border-green-200'}`}>
                <div className="flex items-center gap-1">
                  <div className={`w-2 h-2 ${analytics.lowStockItems > 0 ? 'bg-yellow-200' : 'bg-green-200'} rounded-full animate-pulse`}></div>
                  Real-time
                </div>
              </Badge>
            </div>
            <AlertTriangle className={`h-12 w-12 ${analytics.lowStockItems > 0 ? 'text-yellow-200' : 'text-green-200'}`} />
          </div>
        </CardContent>
      </Card>

      {/* Out of Stock Items Card */}
      <Card className={`bg-gradient-to-r ${analytics.outOfStockItems > 0 ? 'from-red-500 to-red-600' : 'from-green-500 to-green-600'} text-white`}>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className={`${analytics.outOfStockItems > 0 ? 'text-red-100' : 'text-green-100'}`}>Out of Stock</p>
              <p className="text-2xl font-bold">{analytics.outOfStockItems}</p>
              <Badge variant="outline" className={`mt-1 ${analytics.outOfStockItems > 0 ? 'text-red-100 border-red-200' : 'text-green-100 border-green-200'}`}>
                <div className="flex items-center gap-1">
                  <div className={`w-2 h-2 ${analytics.outOfStockItems > 0 ? 'bg-red-200' : 'bg-green-200'} rounded-full animate-pulse`}></div>
                  Real-time
                </div>
              </Badge>
            </div>
            <Package className={`h-12 w-12 ${analytics.outOfStockItems > 0 ? 'text-red-200' : 'text-green-200'}`} />
          </div>
        </CardContent>
      </Card>

      {/* Inventory Value Card */}
      <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100">Inventory Value</p>
              <p className="text-2xl font-bold">₹{analytics.inventoryValue.toLocaleString()}</p>
              <Badge variant="outline" className="mt-1 text-blue-100 border-blue-200">
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-blue-200 rounded-full animate-pulse"></div>
                  Real-time
                </div>
              </Badge>
            </div>
            <DollarSign className="h-12 w-12 text-blue-200" />
          </div>
        </CardContent>
      </Card>

      {/* Franchise Enquiries Card */}
      <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100">Franchise Enquiries</p>
              <p className="text-2xl font-bold">{analytics.franchiseEnquiries}</p>
              <Badge variant="outline" className="mt-1 text-purple-100 border-purple-200">
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-purple-200 rounded-full animate-pulse"></div>
                  Real-time
                </div>
              </Badge>
            </div>
            <Users className="h-12 w-12 text-purple-200" />
          </div>
        </CardContent>
      </Card>

      {/* Catalog Requests Card */}
      <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100">Catalog Requests</p>
              <p className="text-2xl font-bold">{analytics.catalogRequests}</p>
              <Badge variant="outline" className="mt-1 text-orange-100 border-orange-200">
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-orange-200 rounded-full animate-pulse"></div>
                  Real-time
                </div>
              </Badge>
            </div>
            <Download className="h-12 w-12 text-orange-200" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RealTimeAnalyticsCards;
