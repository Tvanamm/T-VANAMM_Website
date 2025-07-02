
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import FranchiseCart from './FranchiseCart';

interface FranchiseCartModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProceedToCheckout?: () => void;
}

const FranchiseCartModal: React.FC<FranchiseCartModalProps> = ({ 
  isOpen, 
  onClose, 
  onProceedToCheckout 
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Shopping Cart</DialogTitle>
        </DialogHeader>
        <FranchiseCart onClose={onClose} />
      </DialogContent>
    </Dialog>
  );
};

export default FranchiseCartModal;
