
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useFranchiseCart } from '@/contexts/FranchiseCartContext';
import { ShoppingCart } from 'lucide-react';

interface FranchiseCartIconProps {
  onClick: () => void;
}

const FranchiseCartIcon: React.FC<FranchiseCartIconProps> = ({ onClick }) => {
  const { cartSummary } = useFranchiseCart();

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={onClick}
      className="relative"
    >
      <ShoppingCart className="h-4 w-4" />
      {cartSummary.itemCount > 0 && (
        <Badge
          variant="destructive"
          className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs animate-pulse"
        >
          {cartSummary.itemCount > 99 ? '99+' : cartSummary.itemCount}
        </Badge>
      )}
    </Button>
  );
};

export default FranchiseCartIcon;
