
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  ShoppingCart, 
  Plus, 
  Minus, 
  Trash2, 
  MapPin, 
  CreditCard,
  Package,
  Truck,
  ArrowLeft,
  AlertCircle
} from 'lucide-react';
import { useFranchiseCart } from '@/contexts/FranchiseCartContext';
import { useRealFranchiseProfile } from '@/hooks/useRealFranchiseProfile';
import { useToast } from '@/hooks/use-toast';

interface FranchiseCartProps {
  onClose: () => void;
  onBrowseInventory?: () => void;
}

const FranchiseCart: React.FC<FranchiseCartProps> = ({ onClose, onBrowseInventory }) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { 
    items, 
    updateQuantity, 
    removeItem, 
    clearCart, 
    cartSummary,
    isCartValid,
    refreshCart
  } = useFranchiseCart();
  
  const { franchiseProfile } = useRealFranchiseProfile();
  const [isProcessing, setIsProcessing] = useState(false);

  // Refresh cart on mount to ensure consistency
  useEffect(() => {
    refreshCart();
  }, [refreshCart]);

  console.log('FranchiseCart - items:', items, 'cartSummary:', cartSummary, 'isCartValid:', isCartValid);

  const handleQuantityChange = (itemId: number, newQuantity: number) => {
    if (newQuantity < 1) {
      removeItem(itemId);
      toast({
        title: "Item Removed",
        description: "Item has been removed from your cart"
      });
    } else {
      updateQuantity(itemId, newQuantity);
    }
  };

  const handleRemoveItem = (itemId: number) => {
    removeItem(itemId);
    toast({
      title: "Item Removed",
      description: "Item has been removed from your cart"
    });
  };

  const handleProceedToCheckout = () => {
    console.log('Proceeding to checkout - Cart validation:', { 
      itemsLength: items.length, 
      isCartValid, 
      cartSummary 
    });

    if (!items || items.length === 0) {
      toast({
        title: "Empty Cart",
        description: "Please add items to your cart before proceeding",
        variant: "destructive"
      });
      return;
    }

    if (!franchiseProfile) {
      toast({
        title: "Profile Required",
        description: "Please complete your franchise profile first",
        variant: "destructive"
      });
      return;
    }

    if (cartSummary.total <= 0) {
      toast({
        title: "Invalid Cart Total",
        description: "Your cart total must be greater than zero",
        variant: "destructive"
      });
      return;
    }

    // Close the cart modal and navigate to checkout
    onClose();
    navigate('/franchise-checkout');
  };

  const handleBrowseInventory = () => {
    if (onBrowseInventory) {
      onBrowseInventory();
    } else {
      onClose();
      // Trigger the browse tab switch
      setTimeout(() => {
        const browseTab = document.querySelector('[value="browse"]') as HTMLElement;
        browseTab?.click();
      }, 100);
    }
  };

  const handleClearCart = () => {
    clearCart();
    toast({
      title: "Cart Cleared",
      description: "All items have been removed from your cart"
    });
  };

  const shippingAddress = franchiseProfile ? [
    franchiseProfile.franchise_location,
    franchiseProfile.location_details,
    franchiseProfile.city,
    franchiseProfile.state,
    franchiseProfile.pincode
  ].filter(Boolean).join(', ') : 'Address not available';

  // Show empty cart state
  if (!items || items.length === 0) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="text-center">
          <ShoppingCart className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-600 mb-2">Your cart is empty</h3>
          <p className="text-gray-500 mb-6">Add some items from the inventory to get started</p>
          <div className="flex gap-3 justify-center">
            <Button onClick={handleBrowseInventory} className="bg-emerald-600 hover:bg-emerald-700">
              Browse Inventory
            </Button>
            <Button onClick={onClose} variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Go Back
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Cart Items */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Cart Items ({items.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {items.map((item) => (
              <div key={item.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <h4 className="font-medium">{item.name}</h4>
                  <p className="text-sm text-gray-600">
                    ₹{item.price.toLocaleString()} per {item.unit}
                  </p>
                  <Badge variant="outline" className="mt-1">
                    {item.category}
                  </Badge>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                    >
                      <Minus className="h-3 w-3" />
                    </Button>
                    <span className="w-8 text-center font-medium">{item.quantity}</span>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                  
                  <div className="text-right min-w-[80px]">
                    <p className="font-semibold">₹{(item.price * item.quantity).toLocaleString()}</p>
                  </div>
                  
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleRemoveItem(item.id)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Delivery Address */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Delivery Address
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="p-3 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">{shippingAddress}</p>
          </div>
        </CardContent>
      </Card>

      {/* Order Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Order Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span>Subtotal ({items.length} items):</span>
              <span>₹{cartSummary.subtotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span>GST:</span>
              <span>₹{cartSummary.gst.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="flex items-center gap-1">
                <Truck className="h-4 w-4" />
                Delivery Fee:
              </span>
              <span className={cartSummary.deliveryFee === 0 ? 'text-green-600 font-semibold' : ''}>
                {cartSummary.deliveryFee === 0 ? 'FREE' : `₹${cartSummary.deliveryFee.toLocaleString()}`}
              </span>
            </div>
            {cartSummary.loyaltyDiscount > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Loyalty Discount:</span>
                <span>-₹{cartSummary.loyaltyDiscount.toLocaleString()}</span>
              </div>
            )}
            <Separator />
            <div className="flex justify-between font-bold text-lg">
              <span>Total:</span>
              <span>₹{cartSummary.total.toLocaleString()}</span>
            </div>
            
            {cartSummary.deliveryFee === 0 && cartSummary.subtotal < 2000 && (
              <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 p-2 rounded">
                <AlertCircle className="h-4 w-4" />
                <span>You've qualified for free delivery!</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <Button
          variant="outline"
          onClick={handleClearCart}
          className="flex-1"
        >
          Clear Cart
        </Button>
        <Button
          onClick={handleProceedToCheckout}
          disabled={isProcessing}
          className="flex-1 bg-emerald-600 hover:bg-emerald-700"
        >
          <CreditCard className="h-4 w-4 mr-2" />
          {isProcessing ? 'Processing...' : 'Proceed to Checkout'}
        </Button>
      </div>
    </div>
  );
};

export default FranchiseCart;
