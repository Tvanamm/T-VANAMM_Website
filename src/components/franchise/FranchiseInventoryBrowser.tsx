
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useFranchiseCart } from '@/contexts/FranchiseCartContext';
import { supabase } from '@/integrations/supabase/client';
import { 
  Search, 
  Plus, 
  Minus, 
  Package, 
  ShoppingCart,
  Filter
} from 'lucide-react';

interface InventoryItem {
  id: number;
  name: string;
  category: string;
  price: number;
  stock: number;
  unit: string;
  description?: string;
  gst_rate: number;
  status: string;
}

const FranchiseInventoryBrowser: React.FC = () => {
  const { addToCart, cartItems, updateQuantity } = useFranchiseCart();
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [filteredInventory, setFilteredInventory] = useState<InventoryItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<string[]>([]);

  useEffect(() => {
    fetchInventory();
  }, []);

  useEffect(() => {
    filterInventory();
  }, [inventory, searchTerm, selectedCategory]);

  const fetchInventory = async () => {
    try {
      console.log('Fetching inventory...');
      const { data, error } = await supabase
        .from('inventory')
        .select('*')
        .gt('stock', 0)
        .order('name');

      if (error) {
        console.error('Error fetching inventory:', error);
        throw error;
      }

      console.log('Fetched inventory items:', data?.length);
      console.log('Inventory data:', data);
      
      setInventory(data || []);
      
      // Extract unique categories
      const uniqueCategories = [...new Set(data?.map(item => item.category) || [])];
      setCategories(uniqueCategories);
    } catch (error) {
      console.error('Error fetching inventory:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterInventory = () => {
    let filtered = inventory;

    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(item => item.category === selectedCategory);
    }

    console.log('Filtered inventory:', filtered.length, 'items');
    setFilteredInventory(filtered);
  };

  const getCartQuantity = (itemId: number) => {
    const cartItem = cartItems.find(item => item.id === itemId);
    return cartItem ? cartItem.quantity : 0;
  };

  const handleAddToCart = (item: InventoryItem) => {
    addToCart({
      id: item.id,
      name: item.name,
      price: item.price,
      category: item.category,
      unit: item.unit,
      gst_rate: item.gst_rate,
      quantity: 1
    });
  };

  const handleUpdateQuantity = (itemId: number, newQuantity: number) => {
    if (newQuantity <= 0) {
      updateQuantity(itemId, 0);
    } else {
      updateQuantity(itemId, newQuantity);
    }
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
      {/* Filters */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Browse Inventory ({inventory.length} items available)
            </CardTitle>
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              <div className="flex items-center gap-2 flex-1 sm:flex-initial">
                <Search className="h-4 w-4 text-gray-500" />
                <Input
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full sm:w-64"
                />
              </div>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-full sm:w-40">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map(category => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Inventory Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredInventory.map((item) => {
          const cartQuantity = getCartQuantity(item.id);
          
          return (
            <Card key={item.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-4">
                <div className="space-y-3">
                  <div>
                    <h3 className="font-semibold text-lg text-gray-800">{item.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="text-xs">
                        {item.category}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {item.unit}
                      </Badge>
                      <Badge 
                        variant="outline" 
                        className={`text-xs ${item.status === 'In Stock' ? 'bg-green-50 text-green-700' : 'bg-yellow-50 text-yellow-700'}`}
                      >
                        {item.status}
                      </Badge>
                    </div>
                  </div>

                  {item.description && (
                    <p className="text-sm text-gray-600">{item.description}</p>
                  )}

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-lg font-bold text-emerald-600">₹{item.price}</p>
                      <p className="text-sm text-gray-500">
                        Stock: {item.stock} {item.unit}
                      </p>
                    </div>
                    <div className="text-xs text-gray-500">
                      GST: {item.gst_rate}%
                    </div>
                  </div>

                  {cartQuantity > 0 ? (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleUpdateQuantity(item.id, cartQuantity - 1)}
                          className="h-8 w-8 p-0"
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="font-medium w-8 text-center">{cartQuantity}</span>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleUpdateQuantity(item.id, cartQuantity + 1)}
                          disabled={cartQuantity >= item.stock}
                          className="h-8 w-8 p-0"
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                      <Badge className="bg-emerald-100 text-emerald-800">
                        In Cart
                      </Badge>
                    </div>
                  ) : (
                    <Button
                      onClick={() => handleAddToCart(item)}
                      className="w-full bg-emerald-600 hover:bg-emerald-700"
                      disabled={item.stock === 0}
                    >
                      <ShoppingCart className="h-4 w-4 mr-2" />
                      Add to Cart
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredInventory.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">No products found</h3>
            <p className="text-gray-500">
              {searchTerm || selectedCategory !== 'all' 
                ? 'Try adjusting your search or filter criteria'
                : 'No inventory items are currently available'}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default FranchiseInventoryBrowser;
