import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRealFranchiseProfile } from '@/hooks/useRealFranchiseProfile';
import { useFranchiseOrders } from '@/hooks/useFranchiseOrders';
import { useFranchiseMembers } from '@/hooks/useFranchiseMembers';
import { useOptimizedNotifications } from '@/hooks/useOptimizedNotifications';
import { FranchiseCartProvider } from '@/contexts/FranchiseCartContext';
import ModernNavbar from '@/components/ModernNavbar';
import UnifiedOrderManagement from '@/components/franchise/UnifiedOrderManagement';
import FranchiseCartModal from '@/components/franchise/FranchiseCartModal';
import FloatingCartIcon from '@/components/franchise/FloatingCartIcon';
import ContactAdminModal from '@/components/franchise/ContactAdminModal';
import FranchiseVerificationCheck from '@/components/franchise/FranchiseVerificationCheck';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { 
  AlertCircle,
  User,
  Bell,
  Package,
  MessageSquare,
  Clock,
  MapPin,
  Award,
  Shield,
  Phone,
  Mail,
  Building,
  Star
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import LoyaltyPointsCard from '@/components/franchise/LoyaltyPointsCard';

const FranchiseDashboard = () => {
  const { user, isLoading: authLoading } = useAuth();
  const { franchiseProfile, loading: profileLoading, error: profileError } = useRealFranchiseProfile();
  const { orders, loading: ordersLoading, error: ordersError } = useFranchiseOrders();
  const { franchiseMembers, loading: membersLoading } = useFranchiseMembers();
  const { notifications, unreadCount, createNotification, markAsRead } = useOptimizedNotifications();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState("overview");
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [loadingTimeout, setLoadingTimeout] = useState(false);

  // Set up loading timeout to prevent infinite loading
  useEffect(() => {
    const timer = setTimeout(() => {
      if (authLoading || profileLoading || membersLoading) {
        console.log('FranchiseDashboard: Loading timeout reached');
        setLoadingTimeout(true);
      }
    }, 15000); // 15 second timeout

    return () => clearTimeout(timer);
  }, [authLoading, profileLoading, membersLoading]);

  // Check if user has franchise access
  const hasFranchiseAccess = user && (user.role === 'franchise' || user.isFranchiseMember);

  // Find current user's franchise member record
  const currentMember = franchiseMembers.find(member => 
    member.email === user?.email
  );

  // Check if user has verified access (active or verified status)
  const hasVerifiedAccess = currentMember && (currentMember.status === 'active' || currentMember.status === 'verified');

  console.log('FranchiseDashboard: Current state', {
    authLoading,
    profileLoading,
    membersLoading,
    user: user ? { id: user.id, role: user.role, email: user.email } : null,
    hasFranchiseAccess,
    currentMember: currentMember ? { status: currentMember.status, email: currentMember.email } : null,
    hasVerifiedAccess,
    loadingTimeout
  });

  // Redirect if not franchise and not loading
  useEffect(() => {
    if (!authLoading && user && !hasFranchiseAccess && !loadingTimeout) {
      console.log('FranchiseDashboard: Redirecting non-franchise user');
      navigate('/');
      toast({
        title: "Access Denied",
        description: "You don't have permission to access the franchise dashboard.",
        variant: "destructive"
      });
    }
  }, [user, authLoading, hasFranchiseAccess, navigate, toast, loadingTimeout]);

  const handleSendMessage = async (subject: string, message: string): Promise<boolean> => {
    const subjectLabels: { [key: string]: string } = {
      'order_inquiry': 'Order Inquiry',
      'inventory_request': 'Inventory Request',
      'technical_support': 'Technical Support',
      'billing_question': 'Billing Question',
      'general_inquiry': 'General Inquiry',
      'complaint': 'Complaint',
      'suggestion': 'Suggestion'
    };

    const success = await createNotification(
      'franchise_message',
      `${subjectLabels[subject]} from Franchise`,
      `${user?.name || 'Franchise member'} has sent a message about ${subjectLabels[subject].toLowerCase()}: ${message}`,
      undefined,
      {
        sender_name: user?.name || 'Franchise member',
        sender_email: user?.email,
        subject: subject,
        message: message,
        target_role: 'admin'
      }
    );

    if (success) {
      toast({
        title: "Message Sent",
        description: "Your message has been sent to the admin team"
      });
    } else {
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive"
      });
    }

    return success;
  };

  // Show loading state while checking authentication with timeout handling
  if ((authLoading || profileLoading || membersLoading) && !loadingTimeout) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="p-6 text-center">
            <div className="w-8 h-8 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Loading...</h2>
            <p className="text-gray-600">Please wait while we verify your access.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show timeout error if loading takes too long
  if (loadingTimeout) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="p-6 text-center">
            <AlertCircle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Loading Timeout</h2>
            <p className="text-gray-600 mb-4">
              The page is taking longer than expected to load. This might be due to network issues.
            </p>
            <div className="space-y-2">
              <Button onClick={() => window.location.reload()} className="w-full">
                Refresh Page
              </Button>
              <Button 
                onClick={() => setIsContactModalOpen(true)} 
                variant="outline" 
                className="w-full"
              >
                Contact Support
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show access denied for non-franchise users
  if (!user || !hasFranchiseAccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50">
        <ModernNavbar />
        <div className="pt-20 px-3 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <Card className="max-w-md w-full">
            <CardContent className="p-6 text-center">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-800 mb-2">Access Denied</h2>
              <p className="text-gray-600 mb-4">You need franchise permissions to access this dashboard.</p>
              <div className="space-y-2">
                <Button onClick={() => navigate('/')} variant="outline" className="w-full">
                  Go Home
                </Button>
                <Button onClick={() => navigate('/login')} className="w-full">
                  Login with Different Account
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <ContactAdminModal
          isOpen={isContactModalOpen}
          onClose={() => setIsContactModalOpen(false)}
          onSendMessage={handleSendMessage}
        />
      </div>
    );
  }

  // Show verification check if user doesn't have verified access
  if (!hasVerifiedAccess) {
    return <FranchiseVerificationCheck />;
  }

  // Show profile error state
  if (profileError && !profileLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50">
        <ModernNavbar />
        <div className="pt-20 px-3 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <Card className="max-w-2xl mx-auto">
            <CardContent className="p-6 text-center">
              <AlertCircle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-800 mb-2">Profile Loading Error</h2>
              <p className="text-gray-600 mb-4">{profileError}</p>
              <div className="space-y-2">
                <Button onClick={() => window.location.reload()} className="w-full">
                  Retry
                </Button>
                <Button 
                  onClick={() => setIsContactModalOpen(true)} 
                  variant="outline" 
                  className="w-full"
                >
                  Contact Support
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <ContactAdminModal
          isOpen={isContactModalOpen}
          onClose={() => setIsContactModalOpen(false)}
          onSendMessage={handleSendMessage}
        />
      </div>
    );
  }

  // Show error state if orders failed to load
  if (ordersError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50">
        <ModernNavbar />
        <div className="pt-20 px-3 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <Card className="max-w-2xl mx-auto">
            <CardContent className="p-6 text-center">
              <AlertCircle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-800 mb-2">Setup Required</h2>
              <p className="text-gray-600 mb-4">{ordersError}</p>
              <div className="space-y-2">
                <Button onClick={() => window.location.reload()} className="w-full">
                  Retry
                </Button>
                <Button 
                  onClick={() => setIsContactModalOpen(true)} 
                  variant="outline" 
                  className="w-full"
                >
                  Contact Support
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <ContactAdminModal
          isOpen={isContactModalOpen}
          onClose={() => setIsContactModalOpen(false)}
          onSendMessage={handleSendMessage}
        />
      </div>
    );
  }

  // Calculate order statistics
  const orderStats = {
    total: orders.length,
    pending: orders.filter(o => o.status === 'pending').length,
    confirmed: orders.filter(o => o.status === 'confirmed').length,
    delivered: orders.filter(o => o.status === 'delivered').length
  };

  return (
    <FranchiseCartProvider>
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50">
        <ModernNavbar />
        
        <div className="pt-20 px-3 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          {/* Enhanced Header */}
          <div className="mb-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl text-white">
                  <Building className="h-8 w-8" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">Franchise Dashboard</h1>
                  <p className="text-gray-600 mt-1">
                    {user?.name ? `Welcome back, ${user.name}` : 'Welcome to your dashboard'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {unreadCount > 0 && (
                  <Badge variant="destructive" className="animate-pulse">
                    <Bell className="h-3 w-3 mr-1" />
                    {unreadCount} New
                  </Badge>
                )}
                <Button onClick={() => setIsContactModalOpen(true)} size="sm" className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Contact Admin
                </Button>
              </div>
            </div>
          </div>

          {/* Enhanced Status Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-100 text-sm">Profile Status</p>
                    <p className="text-2xl font-bold">
                      {currentMember?.status || 'Active'}
                    </p>
                    <div className="flex items-center gap-1 mt-1">
                      <Shield className="h-3 w-3 text-blue-100" />
                      <p className="text-xs text-blue-100">Verified Access</p>
                    </div>
                  </div>
                  <div className="p-3 bg-white/20 rounded-lg">
                    <User className="h-8 w-8 text-blue-100" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-emerald-100 text-sm">Total Orders</p>
                    <p className="text-2xl font-bold">{orderStats.total}</p>
                    <div className="flex items-center gap-1 mt-1">
                      <Package className="h-3 w-3 text-emerald-100" />
                      <p className="text-xs text-emerald-100">All time</p>
                    </div>
                  </div>
                  <div className="p-3 bg-white/20 rounded-lg">
                    <Package className="h-8 w-8 text-emerald-100" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-100 text-sm">Pending Orders</p>
                    <p className="text-2xl font-bold">{orderStats.pending}</p>
                    <p className="text-xs text-purple-100 mt-1">Awaiting confirmation</p>
                  </div>
                  <div className="p-3 bg-white/20 rounded-lg">
                    <Clock className="h-8 w-8 text-purple-100" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
            <TabsList className="grid w-full grid-cols-3 mb-6 bg-white shadow-sm">
              <TabsTrigger value="overview" className="data-[state=active]:bg-emerald-500 data-[state=active]:text-white">
                Overview
              </TabsTrigger>
              <TabsTrigger value="orders" className="data-[state=active]:bg-emerald-500 data-[state=active]:text-white">
                Orders
              </TabsTrigger>
              <TabsTrigger value="messages" className="data-[state=active]:bg-emerald-500 data-[state=active]:text-white">
                Messages
                {unreadCount > 0 && (
                  <Badge variant="destructive" className="ml-1 h-4 w-4 p-0 text-xs">
                    {unreadCount}
                  </Badge>
                )}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <LoyaltyPointsCard />
                <Card className="bg-gradient-to-br from-white to-blue-50/50 border-blue-200/50 shadow-lg">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="p-3 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl text-white">
                        <User className="h-6 w-6" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-800">Profile Overview</h3>
                        <p className="text-sm text-gray-600">Your franchise information</p>
                      </div>
                    </div>
                    
                    {profileLoading ? (
                      <div className="text-center py-8">
                        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                        <p className="text-gray-600">Loading profile...</p>
                      </div>
                    ) : franchiseProfile ? (
                      <div className="space-y-4">
                        <div className="flex items-center gap-3 p-4 bg-white rounded-xl border border-blue-100/50 shadow-sm">
                          <div className="p-2 bg-blue-100 rounded-lg">
                            <User className="h-4 w-4 text-blue-600" />
                          </div>
                          <div className="flex-1">
                            <p className="text-xs text-gray-500 uppercase tracking-wide">Name</p>
                            <p className="font-semibold text-gray-800">{franchiseProfile.name}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-3 p-4 bg-white rounded-xl border border-blue-100/50 shadow-sm">
                          <div className="p-2 bg-blue-100 rounded-lg">
                            <Mail className="h-4 w-4 text-blue-600" />
                          </div>
                          <div className="flex-1">
                            <p className="text-xs text-gray-500 uppercase tracking-wide">Email</p>
                            <p className="font-semibold text-gray-800">{franchiseProfile.email}</p>
                          </div>
                        </div>
                        
                        {franchiseProfile.phone && (
                          <div className="flex items-center gap-3 p-4 bg-white rounded-xl border border-blue-100/50 shadow-sm">
                            <div className="p-2 bg-blue-100 rounded-lg">
                              <Phone className="h-4 w-4 text-blue-600" />
                            </div>
                            <div className="flex-1">
                              <p className="text-xs text-gray-500 uppercase tracking-wide">Phone</p>
                              <p className="font-semibold text-gray-800">{franchiseProfile.phone}</p>
                            </div>
                          </div>
                        )}
                        
                        <div className="flex items-center gap-3 p-4 bg-white rounded-xl border border-blue-100/50 shadow-sm">
                          <div className="p-2 bg-blue-100 rounded-lg">
                            <MapPin className="h-4 w-4 text-blue-600" />
                          </div>
                          <div className="flex-1">
                            <p className="text-xs text-gray-500 uppercase tracking-wide">Location</p>
                            <p className="font-semibold text-gray-800">{franchiseProfile.franchise_location}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-3 p-4 bg-white rounded-xl border border-blue-100/50 shadow-sm">
                          <div className="p-2 bg-blue-100 rounded-lg">
                            <Building className="h-4 w-4 text-blue-600" />
                          </div>
                          <div className="flex-1">
                            <p className="text-xs text-gray-500 uppercase tracking-wide">Position</p>
                            <p className="font-semibold text-gray-800">{franchiseProfile.position}</p>
                          </div>
                        </div>
                        
                        {franchiseProfile.tvanamm_id && (
                          <div className="flex items-center gap-3 p-4 bg-white rounded-xl border border-blue-100/50 shadow-sm">
                            <div className="p-2 bg-blue-100 rounded-lg">
                              <Award className="h-4 w-4 text-blue-600" />
                            </div>
                            <div className="flex-1">
                              <p className="text-xs text-gray-500 uppercase tracking-wide">TVANAMM ID</p>
                              <p className="font-semibold text-gray-800">{franchiseProfile.tvanamm_id}</p>
                            </div>
                          </div>
                        )}
                        
                        <div className="flex items-center gap-3 p-4 bg-white rounded-xl border border-blue-100/50 shadow-sm">
                          <div className="p-2 bg-blue-100 rounded-lg">
                            <Shield className="h-4 w-4 text-blue-600" />
                          </div>
                          <div className="flex-1">
                            <p className="text-xs text-gray-500 uppercase tracking-wide">Status</p>
                            <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                              <Star className="h-3 w-3 mr-1" />
                              {currentMember?.status || 'active'}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500 mb-2">Profile information</p>
                        <div className="space-y-2 text-sm">
                          <p className="text-gray-600">Name: {user.name}</p>
                          <p className="text-gray-600">Email: {user.email}</p>
                          <p className="text-gray-600">Role: Franchise Member</p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-white to-emerald-50/50 border-emerald-200/50 shadow-lg">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="p-3 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-xl text-white">
                        <Package className="h-6 w-6" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-800">Recent Orders</h3>
                        <p className="text-sm text-gray-600">Your latest order activity</p>
                      </div>
                    </div>
                    
                    {ordersLoading ? (
                      <div className="text-center py-8">
                        <div className="w-8 h-8 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                        <p className="text-gray-600">Loading orders...</p>
                      </div>
                    ) : orders.length > 0 ? (
                      <div className="space-y-3">
                        {orders.slice(0, 5).map((order) => (
                          <div key={order.id} className="flex justify-between items-center p-4 bg-white rounded-xl border border-emerald-100/50 shadow-sm hover:shadow-md transition-all duration-200">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <p className="font-semibold text-gray-800">{order.franchise_name}</p>
                                <Badge className={
                                  order.status === 'delivered' 
                                    ? 'bg-green-100 text-green-800 hover:bg-green-100' 
                                    : order.status === 'pending'
                                    ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100'
                                    : 'bg-blue-100 text-blue-800 hover:bg-blue-100'
                                }>
                                  {order.status}
                                </Badge>
                              </div>
                              <p className="text-sm text-gray-600">
                                {new Date(order.created_at).toLocaleDateString('en-US', {
                                  year: 'numeric',
                                  month: 'short',
                                  day: 'numeric'
                                })}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-emerald-600 text-lg">₹{order.total_amount.toLocaleString()}</p>
                            </div>
                          </div>
                        ))}
                        <div className="text-center pt-4 border-t border-emerald-100">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => setActiveTab('orders')}
                            className="text-emerald-600 border-emerald-300 hover:bg-emerald-50"
                          >
                            View All Orders
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500 mb-2">No orders yet</p>
                        <p className="text-sm text-gray-400 mb-4">Start browsing our inventory to place your first order</p>
                        <Button 
                          size="sm" 
                          className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700"
                          onClick={() => setActiveTab('orders')}
                        >
                          Browse Inventory
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="orders">
              <UnifiedOrderManagement />
            </TabsContent>

            <TabsContent value="messages">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Bell className="h-5 w-5" />
                    <h3 className="font-semibold">Messages & Notifications</h3>
                  </div>
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="text-center py-8">
                        <Bell className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500">No messages yet</p>
                        <p className="text-sm text-gray-400">
                          You'll receive updates and communications from the admin team here.
                        </p>
                      </div>
                    ) : (
                      notifications.map((notification) => (
                        <div
                          key={notification.id}
                          className={`p-4 rounded-lg border cursor-pointer transition-all ${
                            notification.read ? 'bg-gray-50' : 'bg-emerald-50 border-emerald-200'
                          }`}
                          onClick={() => !notification.read && markAsRead(notification.id)}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h4 className="font-semibold text-sm mb-1">{notification.title}</h4>
                              <p className="text-sm text-gray-600 mb-2">{notification.message}</p>
                              <p className="text-xs text-gray-500">
                                {new Date(notification.created_at).toLocaleString()}
                              </p>
                            </div>
                            {!notification.read && (
                              <div className="w-2 h-2 bg-emerald-500 rounded-full ml-2 mt-1"></div>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Floating Cart Icon */}
        <FloatingCartIcon onClick={() => setIsCartOpen(true)} />

        {/* Cart Modal */}
        <FranchiseCartModal isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />

        {/* Contact Admin Modal */}
        <ContactAdminModal
          isOpen={isContactModalOpen}
          onClose={() => setIsContactModalOpen(false)}
          onSendMessage={handleSendMessage}
        />
      </div>
    </FranchiseCartProvider>
  );
};

export default FranchiseDashboard;
