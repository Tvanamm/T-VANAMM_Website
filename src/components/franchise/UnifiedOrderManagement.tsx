
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import FranchiseInventoryBrowser from './FranchiseInventoryBrowser';
import StickyPaymentReminder from './StickyPaymentReminder';
import { useFranchiseCart } from '@/contexts/FranchiseCartContext';
import { useFranchiseOrders } from '@/hooks/useFranchiseOrders';
import { usePendingOrders } from '@/hooks/usePendingOrders';
import { useRealFranchiseProfile } from '@/hooks/useRealFranchiseProfile';
import { useFranchiseMembers } from '@/hooks/useFranchiseMembers';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { 
  ShoppingCart, 
  Package, 
  Clock, 
  CheckCircle, 
  Truck,
  AlertCircle,
  History,
  ArrowLeft,
  Menu,
  CreditCard,
  Shield
} from 'lucide-react';

const UnifiedOrderManagement = () => {
  const { cartItems, clearCart, getTotalPrice } = useFranchiseCart();
  const { orders, loading: ordersLoading, refetch: refetchOrders } = useFranchiseOrders();
  const { hasPendingPayment, pendingOrders } = usePendingOrders();
  const { franchiseProfile } = useRealFranchiseProfile();
  const { franchiseMembers } = useFranchiseMembers();
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [showNavMenu, setShowNavMenu] = useState(false);

  // Find current user's franchise member record
  const currentMember = franchiseMembers.find(member => 
    member.email === user?.email
  );

  // Check if user has verified access
  const hasVerifiedAccess = currentMember && (currentMember.status === 'active' || currentMember.status === 'verified');

  // Show access denied if user doesn't have verified access
  if (!hasVerifiedAccess) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardContent className="p-8 text-center">
          <Shield className="h-16 w-16 text-red-500 mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Order Access Restricted</h2>
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-6">
            <div className="flex items-start gap-4">
              <AlertCircle className="h-6 w-6 text-red-600 flex-shrink-0 mt-0.5" />
              <div className="text-left">
                <h3 className="font-semibold text-red-800 mb-2">Verification Required</h3>
                <p className="text-red-700 mb-4">
                  Your account must be verified before you can place orders. Please wait for the administrator to verify your franchise membership.
                </p>
                <div className="bg-white rounded-lg p-4 border border-red-200">
                  <h4 className="font-medium text-red-800 mb-2">Current Status:</h4>
                  <div className="flex items-center gap-2">
                    <Badge className={
                      currentMember?.status === 'pending' 
                        ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100' 
                        : currentMember?.status === 'approved'
                        ? 'bg-blue-100 text-blue-800 hover:bg-blue-100'
                        : 'bg-red-100 text-red-800 hover:bg-red-100'
                    }>
                      {currentMember?.status || 'Unknown'}
                    </Badge>
                    <span className="text-sm text-red-700">
                      {currentMember?.status === 'pending' && 'Awaiting admin review'}
                      {currentMember?.status === 'approved' && 'Approved, awaiting final verification'}
                      {currentMember?.status === 'rejected' && 'Application rejected'}
                      {!currentMember?.status && 'Status unknown'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="text-sm text-gray-600 mb-6">
            <p><strong>Account:</strong> {user?.name}</p>
            <p><strong>Email:</strong> {user?.email}</p>
            {currentMember && (
              <>
                <p><strong>Location:</strong> {currentMember.franchise_location}</p>
                <p><strong>Position:</strong> {currentMember.position}</p>
              </>
            )}
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h4 className="font-semibold text-blue-800 mb-2">What happens after verification?</h4>
            <ul className="text-sm text-blue-700 space-y-1 text-left">
              <li>• Access to browse and order inventory</li>
              <li>• Ability to track orders and payments</li>
              <li>• Loyalty points and rewards system</li>
              <li>• Dedicated support and assistance</li>
            </ul>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button 
              onClick={() => navigate('/franchise-dashboard')}
              variant="outline"
              className="w-full sm:w-auto"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
            <Button 
              onClick={() => navigate('/')}
              className="w-full sm:w-auto bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700"
            >
              Go to Home
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const handleProceedToCheckout = () => {
    // Check for pending payments first
    if (hasPendingPayment) {
      toast({
        title: "Payment Required",
        description: "You have pending orders that require payment. Please complete payment before placing new orders.",
        variant: "destructive"
      });
      return;
    }

    if (cartItems.length === 0) {
      toast({
        title: "Cart Empty",
        description: "Please add items to your cart before proceeding",
        variant: "destructive"
      });
      return;
    }
    
    // Navigate to the enhanced checkout page
    navigate('/franchise-checkout');
  };

  const handlePayNow = (orderId: string) => {
    navigate('/payment', {
      state: { orderId }
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'confirmed': return <CheckCircle className="h-4 w-4" />;
      case 'paid': return <CheckCircle className="h-4 w-4" />;
      case 'packing': return <Package className="h-4 w-4" />;
      case 'shipped': return <Truck className="h-4 w-4" />;
      case 'delivered': return <CheckCircle className="h-4 w-4" />;
      case 'cancelled': return <AlertCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'confirmed': return 'bg-blue-100 text-blue-800';
      case 'paid': return 'bg-green-100 text-green-800';
      case 'packing': return 'bg-purple-100 text-purple-800';
      case 'shipped': return 'bg-indigo-100 text-indigo-800';
      case 'delivered': return 'bg-emerald-100 text-emerald-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <>
      {/* Sticky Payment Reminder */}
      <StickyPaymentReminder />
      
      <div className="space-y-6">
        {/* Navigation Header */}
        <div className="flex items-center justify-between bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowNavMenu(!showNavMenu)}
              className="lg:hidden"
            >
              <Menu className="h-5 w-5" />
            </Button>
            <h1 className="text-xl font-semibold">Order Management</h1>
          </div>
          
          <div className={`${showNavMenu ? 'block' : 'hidden'} lg:flex items-center gap-4`}>
            <Button variant="ghost" size="sm" onClick={() => navigate('/')}>
              Home
            </Button>
            <Button variant="ghost" size="sm" onClick={() => navigate('/franchise-dashboard')}>
              Dashboard
            </Button>
          </div>
        </div>

        {/* Pending Payment Alert */}
        {hasPendingPayment && (
          <Alert className="border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              <strong>Payment Required:</strong> You have {pendingOrders.length} order(s) awaiting payment. 
              Complete payment to place new orders.
            </AlertDescription>
          </Alert>
        )}

        <Tabs defaultValue="browse" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="browse" className="flex items-center gap-2">
              <ShoppingCart className="h-4 w-4" />
              Browse & Order
              {cartItems.length > 0 && (
                <Badge className="ml-1 bg-emerald-600">{cartItems.length}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2">
              <History className="h-4 w-4" />
              Order History
            </TabsTrigger>
          </TabsList>

          <TabsContent value="browse" className="space-y-6">
            {/* Cart Summary */}
            {cartItems.length > 0 && (
              <Card className={`border-2 ${hasPendingPayment ? 'border-red-200 bg-red-50' : 'border-emerald-200 bg-emerald-50'}`}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <ShoppingCart className={`h-5 w-5 ${hasPendingPayment ? 'text-red-600' : 'text-emerald-600'}`} />
                      <span className="font-medium">
                        {cartItems.length} items in cart
                      </span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className={`text-lg font-bold ${hasPendingPayment ? 'text-red-700' : 'text-emerald-700'}`}>
                        ₹{getTotalPrice().toLocaleString()}
                      </span>
                      <Button
                        onClick={handleProceedToCheckout}
                        disabled={hasPendingPayment}
                        className={`${hasPendingPayment ? 'bg-gray-400' : 'bg-emerald-600 hover:bg-emerald-700'}`}
                      >
                        {hasPendingPayment ? 'Payment Required' : 'Proceed to Checkout'}
                      </Button>
                    </div>
                  </div>
                  {hasPendingPayment && (
                    <p className="text-sm text-red-600 mt-2">
                      Complete pending payments to place new orders
                    </p>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Inventory Browser */}
            <FranchiseInventoryBrowser />
          </TabsContent>

          <TabsContent value="history" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <History className="h-5 w-5" />
                  Order History
                </CardTitle>
              </CardHeader>
              <CardContent>
                {ordersLoading ? (
                  <div className="text-center py-8">
                    <div className="w-6 h-6 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p>Loading orders...</p>
                  </div>
                ) : orders.length === 0 ? (
                  <div className="text-center py-8">
                    <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-600 mb-2">No orders yet</h3>
                    <p className="text-gray-500">Start browsing our inventory to place your first order</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {orders.map((order) => (
                      <div key={order.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2">
                            {getStatusIcon(order.status)}
                            <div>
                              <p className="font-semibold">Order #{order.id.slice(0, 8)}</p>
                              <p className="text-sm text-gray-600">
                                {new Date(order.created_at).toLocaleDateString('en-US', {
                                  year: 'numeric',
                                  month: 'short',
                                  day: 'numeric'
                                })}
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className="font-bold text-emerald-600">
                              ₹{order.total_amount.toLocaleString()}
                            </p>
                            {order.delivery_fee_override && (
                              <p className="text-xs text-gray-600">
                                + ₹{order.delivery_fee_override} delivery
                              </p>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge className={`${getStatusColor(order.status)} border-0`}>
                              {order.status}
                            </Badge>
                            {order.status === 'confirmed' && (
                              <Button
                                onClick={() => handlePayNow(order.id)}
                                size="sm"
                                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                              >
                                <CreditCard className="h-4 w-4 mr-1" />
                                Pay Now
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
};

export default UnifiedOrderManagement;
