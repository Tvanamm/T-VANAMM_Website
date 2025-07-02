
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Search, Plus, Minus, ShoppingCart, Package, CheckCircle } from 'lucide-react';

interface InventoryItem {
  id: number;
  name: string;
  category: string;
  price: number;
  unit: string;
  description?: string;
  status: 'In Stock' | 'Out of Stock' | 'Low Stock';
  gst_rate: number;
}

interface EnhancedInventoryDisplayProps {
  onAddToCart: (item: InventoryItem, quantity: number) => void;
  cartItems: Array<{ item_id: number; quantity: number }>;
}

const EnhancedInventoryDisplay: React.FC<EnhancedInventoryDisplayProps> = ({ 
  onAddToCart, 
  cartItems 
}) => {
  const { toast } = useToast();
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [quantities, setQuantities] = useState<{ [key: number]: number }>({});

  const fetchInventory = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('inventory')
        .select('*')
        .order('category', { ascending: true })
        .order('name', { ascending: true });

      if (error) throw error;
      
      // Hide stock numbers for franchise users, only show availability status
      const processedData = data?.map(item => ({
        ...item,
        // Show only status without actual numbers
        display_status: item.status === 'Out of Stock' ? 'Out of Stock' : 'In Stock'
      })) || [];
      
      setInventory(processedData);
    } catch (error) {
      console.error('Error fetching inventory:', error);
      toast({
        title: "Error",
        description: "Failed to load inventory items",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();

    // Real-time subscription for inventory updates
    const channel = supabase
      .channel('inventory_realtime')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'inventory'
      }, () => {
        console.log('Inventory updated via realtime');
        fetchInventory();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const categories = ['all', ...Array.from(new Set(inventory.map(item => item.category)))];

  const filteredInventory = inventory.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleQuantityChange = (itemId: number, change: number) => {
    setQuantities(prev => ({
      ...prev,
      [itemId]: Math.max(1, (prev[itemId] || 1) + change)
    }));
  };

  const handleAddToCart = (item: InventoryItem) => {
    const quantity = quantities[item.id] || 1;
    onAddToCart(item, quantity);
    
    // Reset quantity after adding
    setQuantities(prev => ({
      ...prev,
      [item.id]: 1
    }));
    
    toast({
      title: "Added to Cart",
      description: `${quantity} ${item.unit} of ${item.name} added to cart`,
    });
  };

  const getCartQuantity = (itemId: number) => {
    const cartItem = cartItems.find(item => item.item_id === itemId);
    return cartItem?.quantity || 0;
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <div className="w-6 h-6 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p>Loading inventory...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search and Filter Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Inventory Items
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search items..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              {categories.map(category => (
                <option key={category} value={category}>
                  {category === 'all' ? 'All Categories' : category}
                </option>
              ))}
            </select>
          </div>

          {/* Inventory Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredInventory.map((item) => {
              const cartQty = getCartQuantity(item.id);
              const currentQty = quantities[item.id] || 1;
              const isOutOfStock = item.status === 'Out of Stock';
              
              return (
                <Card key={item.id} className={`border-2 transition-all duration-200 ${
                  isOutOfStock ? 'border-red-200 bg-red-50' : 'border-gray-200 hover:border-emerald-300'
                }`}>
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      {/* Item Header */}
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 mb-1">{item.name}</h3>
                          <Badge className={`${
                            isOutOfStock ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                          }`}>
                            {isOutOfStock ? 'Out of Stock' : 'In Stock'}
                          </Badge>
                        </div>
                        {cartQty > 0 && (
                          <div className="flex items-center gap-1 bg-emerald-100 text-emerald-800 px-2 py-1 rounded-full text-xs">
                            <ShoppingCart className="h-3 w-3" />
                            {cartQty}
                          </div>
                        )}
                      </div>

                      {/* Item Details */}
                      <div className="space-y-2 text-sm text-gray-600">
                        <div>Category: {item.category}</div>
                        <div className="font-semibold text-lg text-emerald-600">
                          ₹{item.price.toLocaleString()} per {item.unit}
                        </div>
                        {item.description && (
                          <p className="text-xs text-gray-500">{item.description}</p>
                        )}
                        <div className="text-xs">GST: {item.gst_rate}%</div>
                      </div>

                      {/* Quantity Controls and Add Button */}
                      {!isOutOfStock && (
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">Quantity:</span>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleQuantityChange(item.id, -1)}
                                disabled={currentQty <= 1}
                                className="h-8 w-8 p-0"
                              >
                                <Minus className="h-4 w-4" />
                              </Button>
                              <span className="w-12 text-center font-medium">
                                {currentQty}
                              </span>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleQuantityChange(item.id, 1)}
                                className="h-8 w-8 p-0"
                              >
                                <Plus className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>

                          <Button
                            onClick={() => handleAddToCart(item)}
                            className="w-full bg-emerald-600 hover:bg-emerald-700"
                            size="sm"
                          >
                            <ShoppingCart className="h-4 w-4 mr-2" />
                            Add to Cart
                          </Button>
                        </div>
                      )}

                      {/* Out of Stock Message */}
                      {isOutOfStock && (
                        <div className="text-center py-3">
                          <p className="text-red-600 text-sm font-medium">
                            Currently unavailable
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            This item will be restocked soon
                          </p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {filteredInventory.length === 0 && (
            <div className="text-center py-8">
              <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No items found</p>
              <p className="text-sm text-gray-400">
                Try adjusting your search or filter criteria
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Information Card */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 text-blue-800">
            <CheckCircle className="h-5 w-5" />
            <span className="font-medium">Unlimited Ordering</span>
          </div>
          <p className="text-sm text-blue-700 mt-2">
            Order any quantity you need. Stock levels are managed in real-time to ensure availability.
            Items showing "Out of Stock" are temporarily unavailable but can be back-ordered.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default EnhancedInventoryDisplay;
