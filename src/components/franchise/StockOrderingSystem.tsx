import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useStockOrdering } from '@/hooks/useStockOrdering';
import { ShoppingCart, Package, Plus, Minus, Trash2, Send, Eye, CreditCard } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useNavigate } from 'react-router-dom';

const StockOrderingSystem = () => {
  const {
    stockItems,
    orders,
    cart,
    loading,
    addToCart,
    removeFromCart,
    updateCartQuantity,
    cartTotal,
    cartItemsCount
  } = useStockOrdering();

  const navigate = useNavigate();
  const [quantities, setQuantities] = useState<{[key: string]: number}>({});
  const [shippingAddress, setShippingAddress] = useState('');
  const [showOrderForm, setShowOrderForm] = useState(false);

  const handleQuantityChange = (itemId: string, value: number) => {
    setQuantities(prev => ({ ...prev, [itemId]: Math.max(1, value) }));
  };

  const handleAddToCart = (item: any) => {
    const quantity = quantities[item.id] || 1;
    addToCart(item, quantity);
    setQuantities(prev => ({ ...prev, [item.id]: 1 }));
  };

  const handleProceedToPayment = () => {
    if (!shippingAddress.trim()) {
      return;
    }

    // In a real implementation, you would integrate with Razorpay here
    // For now, we'll simulate a successful payment
    const paymentId = `pay_${Date.now()}`;
    const queryParams = new URLSearchParams({
      address: shippingAddress,
      payment_id: paymentId,
      amount: cartTotal.toString()
    });

    navigate(`/payment-success?${queryParams.toString()}`);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'confirmed': return 'bg-blue-100 text-blue-800';
      case 'packed': return 'bg-purple-100 text-purple-800';
      case 'shipped': return 'bg-indigo-100 text-indigo-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading && stockItems.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <div className="w-6 h-6 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p>Loading stock items...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="catalog" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="catalog">Stock Catalog</TabsTrigger>
          <TabsTrigger value="cart" className="relative">
            Shopping Cart
            {cartItemsCount > 0 && (
              <Badge className="absolute -top-2 -right-2 h-5 w-5 p-0 text-xs bg-red-500">
                {cartItemsCount}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="orders">My Orders</TabsTrigger>
        </TabsList>

        <TabsContent value="catalog">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Available Stock Items
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {stockItems.map((item) => (
                  <Card key={item.id} className="border">
                    <CardContent className="p-4">
                      <h3 className="font-semibold text-lg mb-2">{item.name}</h3>
                      {item.description && (
                        <p className="text-sm text-gray-600 mb-2">{item.description}</p>
                      )}
                      <div className="space-y-2 mb-4">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Category:</span>
                          <Badge variant="outline">{item.category}</Badge>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Price:</span>
                          <span className="font-semibold">₹{item.price}/{item.unit}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Available:</span>
                          <span className={`font-semibold ${item.stock < 10 ? 'text-red-600' : 'text-green-600'}`}>
                            {item.stock} {item.unit}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 mb-3">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleQuantityChange(item.id, (quantities[item.id] || 1) - 1)}
                          disabled={!quantities[item.id] || quantities[item.id] <= 1}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <Input
                          type="number"
                          min="1"
                          max={item.stock}
                          value={quantities[item.id] || 1}
                          onChange={(e) => handleQuantityChange(item.id, parseInt(e.target.value) || 1)}
                          className="w-20 text-center"
                        />
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleQuantityChange(item.id, (quantities[item.id] || 1) + 1)}
                          disabled={quantities[item.id] >= item.stock}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                      
                      <Button
                        onClick={() => handleAddToCart(item)}
                        className="w-full"
                        disabled={item.stock === 0}
                      >
                        <ShoppingCart className="h-4 w-4 mr-2" />
                        Add to Cart
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cart">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5" />
                Shopping Cart ({cartItemsCount} items)
              </CardTitle>
            </CardHeader>
            <CardContent>
              {cart.length === 0 ? (
                <div className="text-center py-8">
                  <ShoppingCart className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">Your cart is empty</p>
                  <p className="text-sm text-gray-400">Add items from the stock catalog</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {cart.map((cartItem) => (
                    <Card key={cartItem.item.id} className="border">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <h4 className="font-semibold">{cartItem.item.name}</h4>
                            <p className="text-sm text-gray-600">
                              ₹{cartItem.item.price}/{cartItem.item.unit}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateCartQuantity(cartItem.item.id, cartItem.quantity - 1)}
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <span className="w-12 text-center">{cartItem.quantity}</span>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateCartQuantity(cartItem.item.id, cartItem.quantity + 1)}
                              disabled={cartItem.quantity >= cartItem.item.stock}
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => removeFromCart(cartItem.item.id)}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                          <div className="ml-4 text-right">
                            <p className="font-semibold">
                              ₹{(cartItem.item.price * cartItem.quantity).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  
                  <Card className="bg-emerald-50 border-emerald-200">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-center mb-4">
                        <span className="text-lg font-semibold">Total Amount:</span>
                        <span className="text-2xl font-bold text-emerald-600">
                          ₹{cartTotal.toLocaleString()}
                        </span>
                      </div>
                      
                      <Dialog open={showOrderForm} onOpenChange={setShowOrderForm}>
                        <DialogTrigger asChild>
                          <Button className="w-full bg-emerald-600 hover:bg-emerald-700">
                            <CreditCard className="h-4 w-4 mr-2" />
                            Proceed to Payment
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Order & Payment Details</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div>
                              <label className="block text-sm font-medium mb-2">
                                Shipping Address *
                              </label>
                              <Textarea
                                value={shippingAddress}
                                onChange={(e) => setShippingAddress(e.target.value)}
                                placeholder="Enter complete shipping address..."
                                rows={4}
                                required
                              />
                            </div>
                            <div className="border-t pt-4">
                              <h4 className="font-semibold mb-2">Order Summary:</h4>
                              <div className="space-y-1 text-sm">
                                {cart.map((item) => (
                                  <div key={item.item.id} className="flex justify-between">
                                    <span>{item.item.name} x {item.quantity}</span>
                                    <span>₹{(item.item.price * item.quantity).toLocaleString()}</span>
                                  </div>
                                ))}
                                <div className="border-t pt-2 font-semibold flex justify-between">
                                  <span>Total:</span>
                                  <span>₹{cartTotal.toLocaleString()}</span>
                                </div>
                              </div>
                            </div>
                            <Button
                              onClick={handleProceedToPayment}
                              disabled={!shippingAddress.trim()}
                              className="w-full"
                            >
                              <CreditCard className="h-4 w-4 mr-2" />
                              Pay ₹{cartTotal.toLocaleString()}
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </CardContent>
                  </Card>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="orders">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                My Stock Orders
              </CardTitle>
            </CardHeader>
            <CardContent>
              {orders.length === 0 ? (
                <div className="text-center py-8">
                  <Package className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No orders found</p>
                  <p className="text-sm text-gray-400">Your stock orders will appear here</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.map((order) => (
                    <Card key={order.id} className="border">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h4 className="font-semibold text-lg">Order #{order.order_number}</h4>
                            <p className="text-sm text-gray-600">
                              Placed on {new Date(order.created_at).toLocaleDateString()}
                            </p>
                          </div>
                          <Badge className={getStatusColor(order.status)}>
                            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          <div>
                            <h5 className="font-medium text-sm text-gray-700 mb-1">Total Amount</h5>
                            <p className="text-lg font-semibold text-emerald-600">
                              ₹{order.total_amount.toLocaleString()}
                            </p>
                          </div>
                          
                          {order.tracking_number && (
                            <div>
                              <h5 className="font-medium text-sm text-gray-700 mb-1">Tracking Number</h5>
                              <p className="font-mono text-sm">{order.tracking_number}</p>
                            </div>
                          )}
                          
                          {order.estimated_delivery && (
                            <div>
                              <h5 className="font-medium text-sm text-gray-700 mb-1">Estimated Delivery</h5>
                              <p className="text-sm">
                                {new Date(order.estimated_delivery).toLocaleDateString()}
                              </p>
                            </div>
                          )}
                        </div>
                        
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm">
                              <Eye className="h-4 w-4 mr-2" />
                              View Items
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>Order Details - #{order.order_number}</DialogTitle>
                            </DialogHeader>
                            <ScrollArea className="max-h-96">
                              <div className="space-y-3">
                                {order.items.map((item) => (
                                  <div key={item.id} className="flex justify-between items-center p-3 border rounded">
                                    <div>
                                      <h4 className="font-medium">{item.item_name}</h4>
                                      <p className="text-sm text-gray-600">
                                        Quantity: {item.quantity} × ₹{item.unit_price}
                                      </p>
                                    </div>
                                    <span className="font-semibold">
                                      ₹{item.total_price.toLocaleString()}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </ScrollArea>
                          </DialogContent>
                        </Dialog>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default StockOrderingSystem;
