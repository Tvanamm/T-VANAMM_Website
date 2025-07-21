
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
import { usePaymentTransactions } from '@/hooks/usePaymentTransactions';
import { useInvoiceManagement } from '@/hooks/useInvoiceManagement';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import ShippingDetailsViewer from './ShippingDetailsViewer';
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
  Shield,
  Eye,
  ChevronDown,
  ChevronUp,
  MapPin,
  User,
  Calendar,
  Download,
  FileText
} from 'lucide-react';

const UnifiedOrderManagement = () => {
  const { cartItems, clearCart, getTotalPrice } = useFranchiseCart();
  const { orders, loading: ordersLoading, refetch: refetchOrders } = useFranchiseOrders();
  const { hasPendingPayment, pendingOrders } = usePendingOrders();
  const { franchiseProfile } = useRealFranchiseProfile();
  const { franchiseMembers } = useFranchiseMembers();
  const { getPaymentStatus } = usePaymentTransactions();
  const { generateInvoice, getAvailableInvoice, downloadInvoice, canGenerateInvoice } = useInvoiceManagement();
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [showNavMenu, setShowNavMenu] = useState(false);
  const [expandedOrders, setExpandedOrders] = useState<Set<string>>(new Set());
  const [shippingViewerOpen, setShippingViewerOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);

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
    // Check if order is already paid
    const paymentStatus = getPaymentStatus(orderId);
    if (paymentStatus === 'completed') {
      toast({
        title: "Already Paid",
        description: "This order has already been paid for.",
        variant: "destructive"
      });
      return;
    }

    navigate('/payment', {
      state: { orderId }
    });
  };

  const handleDownloadInvoice = async (orderId: string) => {
    try {
      const availableInvoice = getAvailableInvoice(orderId);
      
      if (availableInvoice) {
        await downloadInvoice(availableInvoice);
      } else {
        // Generate new invoice
        await generateInvoice(orderId);
      }
    } catch (error) {
      console.error('Invoice download failed:', error);
    }
  };

  const toggleOrderExpansion = (orderId: string) => {
    const newExpanded = new Set(expandedOrders);
    if (newExpanded.has(orderId)) {
      newExpanded.delete(orderId);
    } else {
      newExpanded.add(orderId);
    }
    setExpandedOrders(newExpanded);
  };

  const handleViewShippingDetails = (order: any) => {
    setSelectedOrder(order);
    setShippingViewerOpen(true);
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
                    {orders.map((order) => {
                      const isExpanded = expandedOrders.has(order.id);
                      const hasShippingDetails = (order as any).shipping_details && 
                        (order.status === 'shipped' || order.status === 'delivered');
                      
                      return (
                        <div key={order.id} className="border rounded-lg overflow-hidden">
                          <div className="p-4 hover:bg-gray-50 transition-colors">
                            <div className="flex items-center justify-between">
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
                                     {(order as any).tracking_number && (
                                       <p className="text-xs text-blue-600 font-mono">
                                         Track: {(order as any).tracking_number}
                                       </p>
                                     )}
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
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
                                   {order.status === 'confirmed' && getPaymentStatus(order.id) !== 'completed' && (
                                     <Button
                                       onClick={() => handlePayNow(order.id)}
                                       size="sm"
                                       className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                                     >
                                       <CreditCard className="h-4 w-4 mr-1" />
                                       Pay Now
                                     </Button>
                                   )}
                                   {canGenerateInvoice(order.status, getPaymentStatus(order.id)) && (
                                     <Button
                                       onClick={() => handleDownloadInvoice(order.id)}
                                       size="sm"
                                       variant="outline"
                                       className="border-green-200 text-green-600 hover:bg-green-50"
                                     >
                                       <Download className="h-4 w-4 mr-1" />
                                       Invoice
                                     </Button>
                                   )}
                                   {hasShippingDetails && (
                                     <Button
                                       onClick={() => handleViewShippingDetails(order)}
                                       size="sm"
                                       variant="outline"
                                       className="border-blue-200 text-blue-600 hover:bg-blue-50"
                                     >
                                       <Eye className="h-4 w-4 mr-1" />
                                       View Shipping
                                     </Button>
                                   )}
                                   <Button
                                     onClick={() => toggleOrderExpansion(order.id)}
                                     size="sm"
                                     variant="ghost"
                                   >
                                     {isExpanded ? (
                                       <ChevronUp className="h-4 w-4" />
                                     ) : (
                                       <ChevronDown className="h-4 w-4" />
                                     )}
                                   </Button>
                                 </div>
                              </div>
                            </div>
                          </div>

                          {/* Expanded Order Details */}
                          {isExpanded && (
                            <div className="border-t bg-gray-50 p-4">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Order Details */}
                                <div className="space-y-3">
                                  <h4 className="font-medium text-gray-800 flex items-center gap-2">
                                    <Package className="h-4 w-4" />
                                    Order Details
                                  </h4>
                                  <div className="bg-white p-3 rounded-lg border">
                                    <div className="space-y-2 text-sm">
                                      <div className="flex justify-between">
                                        <span className="text-gray-600">Franchise:</span>
                                        <span className="font-medium">{order.franchise_name}</span>
                                      </div>
                                       <div className="flex justify-between">
                                         <span className="text-gray-600">TVANAMM ID:</span>
                                         <span className="font-medium">{(order as any).tvanamm_id || 'N/A'}</span>
                                       </div>
                                       <div className="flex justify-between">
                                         <span className="text-gray-600">Total Amount:</span>
                                         <span className="font-bold text-emerald-600">
                                           ₹{order.total_amount.toLocaleString()}
                                         </span>
                                       </div>
                                       {(order as any).loyalty_points_used > 0 && (
                                         <div className="flex justify-between">
                                           <span className="text-gray-600">Loyalty Points Used:</span>
                                           <span className="font-medium text-purple-600">
                                             {(order as any).loyalty_points_used} points
                                           </span>
                                         </div>
                                       )}
                                    </div>
                                  </div>
                                </div>

                                 {/* Shipping Information */}
                                 {hasShippingDetails && (order as any).shipping_details && (
                                   <div className="space-y-3">
                                     <h4 className="font-medium text-gray-800 flex items-center gap-2">
                                       <Truck className="h-4 w-4" />
                                       Quick Shipping Info
                                     </h4>
                                     <div className="bg-white p-3 rounded-lg border">
                                       <div className="space-y-2 text-sm">
                                         {(order as any).shipping_details.vehicleNumber && (
                                           <div className="flex items-center gap-2">
                                             <Truck className="h-3 w-3 text-blue-600" />
                                             <span className="font-medium">
                                               {(order as any).shipping_details.vehicleNumber}
                                             </span>
                                           </div>
                                         )}
                                         {(order as any).shipping_details.driverName && (
                                           <div className="flex items-center gap-2">
                                             <User className="h-3 w-3 text-green-600" />
                                             <span>{(order as any).shipping_details.driverName}</span>
                                           </div>
                                         )}
                                         {(order as any).shipping_details.estimatedDelivery && (
                                           <div className="flex items-center gap-2">
                                             <Calendar className="h-3 w-3 text-purple-600" />
                                             <span>
                                               {new Date((order as any).shipping_details.estimatedDelivery).toLocaleDateString()}
                                             </span>
                                           </div>
                                         )}
                                         <Button
                                           onClick={() => handleViewShippingDetails(order)}
                                           size="sm"
                                           variant="outline"
                                           className="w-full mt-2 border-blue-200 text-blue-600 hover:bg-blue-50"
                                         >
                                           <Eye className="h-4 w-4 mr-1" />
                                           View Full Details
                                         </Button>
                                       </div>
                                     </div>
                                   </div>
                                 )}

                                {/* Delivery Address */}
                                <div className="space-y-3 md:col-span-2">
                                  <h4 className="font-medium text-gray-800 flex items-center gap-2">
                                    <MapPin className="h-4 w-4" />
                                    Delivery Address
                                  </h4>
                                  <div className="bg-white p-3 rounded-lg border">
                                    <p className="text-sm">{order.shipping_address}</p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Shipping Details Viewer Modal */}
        {selectedOrder && (
          <ShippingDetailsViewer
            isOpen={shippingViewerOpen}
            onClose={() => {
              setShippingViewerOpen(false);
              setSelectedOrder(null);
            }}
            order={selectedOrder}
          />
        )}
      </div>
    </>
  );
};

export default UnifiedOrderManagement;
