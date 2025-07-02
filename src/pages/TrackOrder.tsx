import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Search, Package, Truck, CheckCircle, Clock, MapPin, AlertTriangle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import ModernNavbar from '@/components/ModernNavbar';
import Footer from '@/components/Footer';

// Mock order data - replace with real API calls
const mockOrders = [
  {
    id: 'ORD-2024-001',
    status: 'delivered',
    orderDate: '2024-01-15',
    estimatedDelivery: '2024-01-20',
    actualDelivery: '2024-01-19',
    total: 2850,
    items: [
      { name: 'Premium Earl Grey Tea', quantity: 2, price: 450 },
      { name: 'Organic Green Tea Powder', quantity: 1, price: 650 },
      { name: 'Masala Chai Blend', quantity: 3, price: 550 }
    ],
    trackingSteps: [
      { status: 'Order Placed', date: '2024-01-15', completed: true },
      { status: 'Processing', date: '2024-01-16', completed: true },
      { status: 'Shipped', date: '2024-01-17', completed: true },
      { status: 'Out for Delivery', date: '2024-01-19', completed: true },
      { status: 'Delivered', date: '2024-01-19', completed: true }
    ],
    shippingAddress: '123 Tea Street, Mumbai, Maharashtra 400001'
  },
  {
    id: 'ORD-2024-002',
    status: 'shipped',
    orderDate: '2024-01-20',
    estimatedDelivery: '2024-01-25',
    total: 1200,
    items: [
      { name: 'Himalayan White Tea', quantity: 1, price: 1200 }
    ],
    trackingSteps: [
      { status: 'Order Placed', date: '2024-01-20', completed: true },
      { status: 'Processing', date: '2024-01-21', completed: true },
      { status: 'Shipped', date: '2024-01-22', completed: true },
      { status: 'Out for Delivery', date: '', completed: false },
      { status: 'Delivered', date: '', completed: false }
    ],
    shippingAddress: '456 Garden Lane, Delhi, Delhi 110001'
  }
];

const TrackOrder = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchedOrder, setSearchedOrder] = useState(null);
  const { user } = useAuth();

  // Check if user has access to track orders
  if (!user || (user.role !== 'franchise' && user.role !== 'admin')) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-white">
        <ModernNavbar />
        
        <div className="pt-20 pb-16">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <div className="bg-red-50 border border-red-200 rounded-lg p-8">
              <AlertTriangle className="h-16 w-16 text-red-600 mx-auto mb-4" />
              <h2 className="text-2xl font-semibold text-red-800 mb-4">Access Restricted</h2>
              <p className="text-red-600 mb-6">
                Order tracking is exclusively available for franchise partners and admin users. 
                Regular customers can track their orders through our delivery partners (Swiggy, Zomato).
              </p>
              <div className="space-y-4">
                <p className="text-gray-600">
                  If you're a franchise partner, please contact our team to get appropriate access.
                </p>
                <Button onClick={() => window.history.back()} className="bg-green-600 hover:bg-green-700">
                  Go Back
                </Button>
              </div>
            </div>
          </div>
        </div>

        <Footer />
      </div>
    );
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const order = mockOrders.find(o => o.id.toLowerCase() === searchQuery.toLowerCase());
    setSearchedOrder(order || null);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'shipped':
        return 'bg-blue-100 text-blue-800';
      case 'processing':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'delivered':
        return <CheckCircle className="h-4 w-4" />;
      case 'shipped':
        return <Truck className="h-4 w-4" />;
      case 'processing':
        return <Package className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-white">
      <ModernNavbar />
      
      <div className="pt-20 pb-16">
        <div className="max-w-4xl mx-auto px-4">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-2 mb-4">
              <h1 className="text-4xl font-bold text-green-800">Track Your Order</h1>
              <Badge className="bg-green-600 text-white">
                {user.role === 'admin' ? 'Admin' : 'Franchise'}
              </Badge>
            </div>
            <p className="text-lg text-gray-600">Enter your order ID to track your tea delivery</p>
          </div>

          {/* Search Section */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5" />
                Order Tracking
              </CardTitle>
              <CardDescription>
                Enter your order ID (e.g., ORD-2024-001) to view tracking details
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSearch} className="flex gap-4">
                <Input
                  type="text"
                  placeholder="Enter Order ID"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1"
                />
                <Button type="submit" className="bg-green-600 hover:bg-green-700">
                  Track Order
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Search Results */}
          {searchQuery && (
            <div className="mb-8">
              {searchedOrder ? (
                <OrderTrackingCard order={searchedOrder} />
              ) : (
                <Card>
                  <CardContent className="text-center py-8">
                    <p className="text-gray-600">No order found with ID: {searchQuery}</p>
                    <p className="text-sm text-gray-500 mt-2">Please check your order ID and try again</p>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {/* Recent Orders Demo */}
          {!searchQuery && (
            <div>
              <h2 className="text-2xl font-bold text-green-800 mb-6">Demo Orders</h2>
              <p className="text-gray-600 mb-6">Try searching for: ORD-2024-001 or ORD-2024-002</p>
              <div className="space-y-6">
                {mockOrders.map((order) => (
                  <OrderTrackingCard key={order.id} order={order} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
};

const OrderTrackingCard = ({ order }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'shipped':
        return 'bg-blue-100 text-blue-800';
      case 'processing':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'delivered':
        return <CheckCircle className="h-4 w-4" />;
      case 'shipped':
        return <Truck className="h-4 w-4" />;
      case 'processing':
        return <Package className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="flex items-center gap-2">
              Order {order.id}
              <Badge className={getStatusColor(order.status)}>
                {getStatusIcon(order.status)}
                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
              </Badge>
            </CardTitle>
            <CardDescription>
              Placed on {new Date(order.orderDate).toLocaleDateString('en-IN')}
            </CardDescription>
          </div>
          <div className="text-right">
            <p className="font-semibold">₹{order.total.toLocaleString()}</p>
            <p className="text-sm text-gray-600">
              {order.status === 'delivered' ? 'Delivered' : 'Est. Delivery'}: {' '}
              {new Date(order.actualDelivery || order.estimatedDelivery).toLocaleDateString('en-IN')}
            </p>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Tracking Timeline */}
        <div>
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Truck className="h-4 w-4" />
            Tracking Progress
          </h3>
          <div className="space-y-4">
            {order.trackingSteps.map((step, index) => (
              <div key={index} className="flex items-center gap-4">
                <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                  step.completed ? 'bg-green-500 border-green-500' : 'border-gray-300'
                }`}>
                  {step.completed && <CheckCircle className="h-3 w-3 text-white" />}
                </div>
                <div className="flex-1">
                  <p className={`font-medium ${step.completed ? 'text-green-800' : 'text-gray-500'}`}>
                    {step.status}
                  </p>
                  {step.date && (
                    <p className="text-sm text-gray-600">
                      {new Date(step.date).toLocaleDateString('en-IN')}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <Separator />

        {/* Shipping Address */}
        <div>
          <h3 className="font-semibold mb-2 flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            Shipping Address
          </h3>
          <p className="text-gray-600">{order.shippingAddress}</p>
        </div>

        <Separator />

        {/* Order Items */}
        <div>
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Package className="h-4 w-4" />
            Order Items ({order.items.length})
          </h3>
          <div className="space-y-3">
            {order.items.map((item, index) => (
              <div key={index} className="flex justify-between items-center">
                <div>
                  <p className="font-medium">{item.name}</p>
                  <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                </div>
                <p className="font-semibold">₹{(item.price * item.quantity).toLocaleString()}</p>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TrackOrder;
