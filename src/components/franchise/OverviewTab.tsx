
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { useRealFranchiseProfile } from '@/hooks/useRealFranchiseProfile';
import { usePendingOrders } from '@/hooks/usePendingOrders';
import StickyPaymentReminder from './StickyPaymentReminder';
import { 
  TrendingUp, 
  Package, 
  Clock, 
  CheckCircle,
  AlertCircle,
  User,
  MapPin,
  Phone,
  Mail
} from 'lucide-react';

const OverviewTab = () => {
  const { user } = useAuth();
  const { franchiseProfile, loading: profileLoading } = useRealFranchiseProfile();
  const { pendingOrders, loading: ordersLoading, hasPendingPayment } = usePendingOrders();

  if (profileLoading || ordersLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center py-8">
          <div className="w-6 h-6 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin mr-2"></div>
          <span>Loading overview...</span>
        </div>
      </div>
    );
  }

  if (!franchiseProfile) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="p-6 text-center">
            <AlertCircle className="h-12 w-12 text-amber-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Profile Setup Required</h3>
            <p className="text-gray-600">Please complete your franchise profile to access the overview.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Sticky Payment Reminder */}
      {hasPendingPayment && <StickyPaymentReminder />}

      {/* Profile Completion Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Profile Overview
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Profile Completion</span>
            <Badge variant={franchiseProfile.profile_completion_percentage >= 80 ? "default" : "secondary"}>
              {franchiseProfile.profile_completion_percentage?.toFixed(0) || 0}%
            </Badge>
          </div>
          
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-emerald-600 h-2 rounded-full transition-all duration-500"
              style={{ width: `${franchiseProfile.profile_completion_percentage || 0}%` }}
            ></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <User className="h-4 w-4 text-gray-500" />
                <span className="font-medium">Name:</span>
                <span>{franchiseProfile.name || 'Not provided'}</span>
              </div>
              
              <div className="flex items-center gap-2 text-sm">
                <Mail className="h-4 w-4 text-gray-500" />
                <span className="font-medium">Email:</span>
                <span>{franchiseProfile.email || 'Not provided'}</span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <Phone className="h-4 w-4 text-gray-500" />
                <span className="font-medium">Phone:</span>
                <span>{franchiseProfile.phone || 'Not provided'}</span>
              </div>
              
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="h-4 w-4 text-gray-500" />
                <span className="font-medium">Location:</span>
                <span>{franchiseProfile.franchise_location || 'Not provided'}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <TrendingUp className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">
              ₹{(franchiseProfile as any).revenue_generated?.toLocaleString() || '0'}
            </div>
            <p className="text-xs text-gray-600 mt-1">
              Lifetime earnings
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Orders</CardTitle>
            <Clock className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">
              {pendingOrders.length}
            </div>
            <p className="text-xs text-gray-600 mt-1">
              Awaiting payment
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Membership Status</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-sm font-semibold">
              <Badge 
                variant={franchiseProfile.status === 'approved' ? "default" : "secondary"}
                className={franchiseProfile.status === 'approved' ? "bg-green-100 text-green-800" : ""}
              >
                {franchiseProfile.status === 'approved' ? 'Active' : 
                 franchiseProfile.status === 'pending' ? 'Pending' : 'Inactive'}
              </Badge>
            </div>
            <p className="text-xs text-gray-600 mt-1">
              Franchise status
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Orders */}
      {pendingOrders.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Recent Orders
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {pendingOrders.slice(0, 3).map((order) => (
                <div key={order.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">Order #{order.id.slice(0, 8)}</p>
                    <p className="text-sm text-gray-600">
                      {new Date(order.created_at).toLocaleDateString()} • ₹{order.total_amount.toLocaleString()}
                    </p>
                  </div>
                  <Badge 
                    variant={order.status === 'confirmed' ? "default" : "secondary"}
                    className={order.status === 'confirmed' ? "bg-amber-100 text-amber-800" : ""}
                  >
                    {order.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Account Information */}
      <Card>
        <CardHeader>
          <CardTitle>Account Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-600">Tvanamm ID</label>
              <p className="text-sm font-mono bg-gray-100 p-2 rounded">
                {franchiseProfile.tvanamm_id || 'Not assigned'}
              </p>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-600">Position</label>
              <p className="text-sm bg-gray-100 p-2 rounded">
                {franchiseProfile.position || 'Not specified'}
              </p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-600">Area</label>
              <p className="text-sm bg-gray-100 p-2 rounded">
                {franchiseProfile.area || 'Not specified'}
              </p>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-600">State</label>
              <p className="text-sm bg-gray-100 p-2 rounded">
                {franchiseProfile.state || 'Not specified'}
              </p>
            </div>
          </div>

          {franchiseProfile.transportation_fee && (
            <div className="mt-4">
              <label className="text-sm font-medium text-gray-600">Transportation Fee</label>
              <p className="text-sm bg-emerald-50 text-emerald-700 p-2 rounded font-medium">
                ₹{franchiseProfile.transportation_fee}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default OverviewTab;
