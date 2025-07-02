
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useFranchiseDeliverySettings } from '@/hooks/useFranchiseDeliverySettings';

interface CartItem {
  id: number;
  name: string;
  category: string;
  price: number;
  quantity: number;
  unit: string;
  gst_rate: number;
  description?: string;
}

interface CartSummary {
  itemCount: number;
  total: number;
  subtotal: number;
  gst: number;
  deliveryFee: number;
  loyaltyDiscount: number;
}

interface FranchiseCartContextType {
  items: CartItem[];
  cartCount: number;
  cartTotal: number;
  cartTotalWithGST: number;
  cartSummary: CartSummary;
  loyaltyPointsToRedeem: number;
  addItem: (item: Omit<CartItem, 'quantity'>, quantity?: number) => void;
  removeItem: (itemId: number) => void;
  updateQuantity: (itemId: number, quantity: number) => void;
  clearCart: () => void;
  isInCart: (itemId: number) => boolean;
  getItemQuantity: (itemId: number) => number;
  addToCart: (item: any, quantity?: number) => void;
  getCartQuantity: (itemId: number) => number;
  setLoyaltyPointsToRedeem: (points: number) => void;
  // Legacy properties for backward compatibility
  cartItems: CartItem[];
  getTotalPrice: () => number;
  deliveryFee: number;
  isCartValid: boolean;
  refreshCart: () => void;
}

const FranchiseCartContext = createContext<FranchiseCartContextType | undefined>(undefined);

export const useFranchiseCart = () => {
  const context = useContext(FranchiseCartContext);
  if (!context) {
    throw new Error('useFranchiseCart must be used within a FranchiseCartProvider');
  }
  return context;
};

export const FranchiseCartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [loyaltyPointsToRedeem, setLoyaltyPointsToRedeem] = useState<number>(0);
  const [isInitialized, setIsInitialized] = useState(false);
  const { calculateDeliveryFee, deliverySettings, loading: deliveryLoading } = useFranchiseDeliverySettings();

  // Load cart from localStorage on mount
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem('franchise-cart');
      const savedLoyalty = localStorage.getItem('franchise-cart-loyalty');
      
      console.log('Loading cart from localStorage:', savedCart);
      
      if (savedCart) {
        const parsedCart = JSON.parse(savedCart);
        console.log('Parsed cart data:', parsedCart);
        
        if (Array.isArray(parsedCart) && parsedCart.length > 0) {
          // Validate cart items have required properties
          const validItems = parsedCart.filter(item => 
            item && item.id && item.name && typeof item.price === 'number' && typeof item.quantity === 'number'
          );
          
          if (validItems.length > 0) {
            setItems(validItems);
            console.log('Cart loaded successfully with', validItems.length, 'valid items');
          }
        }
      }
      
      if (savedLoyalty) {
        const parsedLoyalty = JSON.parse(savedLoyalty);
        if (typeof parsedLoyalty === 'number') {
          setLoyaltyPointsToRedeem(parsedLoyalty);
        }
      }
    } catch (error) {
      console.error('Error loading cart from localStorage:', error);
      localStorage.removeItem('franchise-cart');
      localStorage.removeItem('franchise-cart-loyalty');
    } finally {
      setIsInitialized(true);
    }
  }, []);

  // Save cart to localStorage whenever items change (but not on initial load)
  useEffect(() => {
    if (isInitialized && items.length >= 0) {
      console.log('Saving cart to localStorage:', items);
      try {
        localStorage.setItem('franchise-cart', JSON.stringify(items));
        console.log('Cart saved successfully. Current items:', items.length);
      } catch (error) {
        console.error('Error saving cart to localStorage:', error);
      }
    }
  }, [items, isInitialized]);

  // Save loyalty points to localStorage
  useEffect(() => {
    if (isInitialized) {
      try {
        localStorage.setItem('franchise-cart-loyalty', JSON.stringify(loyaltyPointsToRedeem));
      } catch (error) {
        console.error('Error saving loyalty points to localStorage:', error);
      }
    }
  }, [loyaltyPointsToRedeem, isInitialized]);

  const addItem = (item: Omit<CartItem, 'quantity'>, quantity: number = 1) => {
    console.log('Adding item to cart:', item, 'quantity:', quantity);
    
    if (!item || !item.id || !item.name || typeof item.price !== 'number') {
      console.error('Invalid item data:', item);
      return;
    }

    setItems(prevItems => {
      const existingItem = prevItems.find(cartItem => cartItem.id === item.id);
      
      if (existingItem) {
        console.log('Item already exists, updating quantity');
        return prevItems.map(cartItem =>
          cartItem.id === item.id
            ? { ...cartItem, quantity: Math.max(1, cartItem.quantity + quantity) }
            : cartItem
        );
      } else {
        console.log('Adding new item to cart');
        const newItem = { 
          ...item, 
          quantity: Math.max(1, quantity), 
          gst_rate: item.gst_rate || 18,
          description: item.description || ''
        };
        return [...prevItems, newItem];
      }
    });
  };

  const addToCart = (item: any, quantity: number = 1) => {
    console.log('addToCart called with:', item, 'quantity:', quantity);
    addItem(item, quantity);
  };

  const removeItem = (itemId: number) => {
    console.log('Removing item from cart:', itemId);
    setItems(prevItems => prevItems.filter(item => item.id !== itemId));
  };

  const updateQuantity = (itemId: number, quantity: number) => {
    console.log('Updating quantity for item:', itemId, 'to:', quantity);
    if (quantity <= 0) {
      removeItem(itemId);
      return;
    }

    setItems(prevItems =>
      prevItems.map(item =>
        item.id === itemId ? { ...item, quantity: Math.max(1, quantity) } : item
      )
    );
  };

  const clearCart = () => {
    console.log('Clearing cart');
    setItems([]);
    setLoyaltyPointsToRedeem(0);
    localStorage.removeItem('franchise-cart');
    localStorage.removeItem('franchise-cart-loyalty');
  };

  const refreshCart = () => {
    console.log('Refreshing cart state');
    // Force re-render by updating state
    setItems(prevItems => [...prevItems]);
  };

  const isInCart = (itemId: number) => {
    return items.some(item => item.id === itemId);
  };

  const getItemQuantity = (itemId: number) => {
    const item = items.find(item => item.id === itemId);
    return item ? item.quantity : 0;
  };

  const getCartQuantity = (itemId: number) => {
    return getItemQuantity(itemId);
  };

  const getTotalPrice = () => {
    return items.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const cartCount = items.reduce((total, item) => total + item.quantity, 0);
  
  const cartTotal = items.reduce((total, item) => {
    return total + (item.price * item.quantity);
  }, 0);

  // Calculate GST per item with their individual rates
  const gstAmount = items.reduce((total, item) => {
    const itemTotal = item.price * item.quantity;
    const itemGst = (itemTotal * item.gst_rate) / 100;
    console.log(`Item: ${item.name}, Total: ${itemTotal}, GST Rate: ${item.gst_rate}%, GST Amount: ${itemGst}`);
    return total + itemGst;
  }, 0);

  const cartTotalWithGST = cartTotal + gstAmount;

  // Set delivery fee to 0 during checkout - admin will set it during order confirmation
  const deliveryFee = 0;

  console.log('Cart calculation with per-item GST:', {
    cartTotal,
    gstAmount,
    cartTotalWithGST,
    deliveryFee,
    itemsCount: items.length,
    itemDetails: items.map(item => ({
      name: item.name,
      price: item.price,
      quantity: item.quantity,
      gstRate: item.gst_rate,
      itemTotal: item.price * item.quantity,
      itemGst: (item.price * item.quantity * item.gst_rate) / 100
    }))
  });

  const cartSummary: CartSummary = {
    itemCount: cartCount,
    subtotal: cartTotal,
    gst: Math.round(gstAmount * 100) / 100, // Round to 2 decimal places
    deliveryFee: deliveryFee,
    loyaltyDiscount: loyaltyPointsToRedeem,
    total: Math.round((cartTotalWithGST + deliveryFee - loyaltyPointsToRedeem) * 100) / 100
  };

  // Validate cart has items and all required data
  const isCartValid = items.length > 0 && items.every(item => 
    item.id && item.name && typeof item.price === 'number' && item.quantity > 0
  );

  console.log('Final cart summary:', cartSummary);

  return (
    <FranchiseCartContext.Provider
      value={{
        items,
        cartCount,
        cartTotal,
        cartTotalWithGST,
        cartSummary,
        loyaltyPointsToRedeem,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        isInCart,
        getItemQuantity,
        addToCart,
        getCartQuantity,
        setLoyaltyPointsToRedeem,
        refreshCart,
        isCartValid,
        // Legacy properties
        cartItems: items,
        getTotalPrice,
        deliveryFee
      }}
    >
      {children}
    </FranchiseCartContext.Provider>
  );
};
