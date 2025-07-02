
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useFranchiseCart } from '@/contexts/FranchiseCartContext';
import { ShoppingCart } from 'lucide-react';

interface FloatingCartIconProps {
  onClick: () => void;
}

const FloatingCartIcon: React.FC<FloatingCartIconProps> = ({ onClick }) => {
  const { cartSummary, items, isCartValid } = useFranchiseCart();

  console.log('FloatingCartIcon - cartSummary:', cartSummary, 'items:', items, 'isCartValid:', isCartValid);

  // Show the floating cart if there are valid items
  if (!items || items.length === 0 || !isCartValid || cartSummary.itemCount === 0) {
    return null;
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <Button
        onClick={onClick}
        size="lg"
        className="relative bg-emerald-600 hover:bg-emerald-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 w-16 h-16 group"
      >
        <ShoppingCart className="h-6 w-6" />
        <Badge
          variant="destructive"
          className="absolute -top-2 -right-2 h-6 w-6 flex items-center justify-center p-0 text-xs font-bold"
        >
          {cartSummary.itemCount > 99 ? '99+' : cartSummary.itemCount}
        </Badge>
      </Button>
      <div className="absolute -top-16 right-0 bg-black text-white px-3 py-1 rounded text-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
        ₹{cartSummary.total.toLocaleString()}
        {cartSummary.deliveryFee === 0 && (
          <div className="text-green-300 text-xs">Free Delivery!</div>
        )}
      </div>
    </div>
  );
};

export default FloatingCartIcon;
