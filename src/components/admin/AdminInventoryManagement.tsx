
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Package, Plus, Edit, Trash2, AlertTriangle, Search } from 'lucide-react';

interface InventoryItem {
  id: number;
  name: string;
  category: string;
  unit: string;
  description: string | null;
  stock: number;
  price: number;
  min_order: number;
  status: string;
  gst_rate: number;
  created_at: string;
  updated_at: string;
}

const AdminInventoryManagement = () => {
  const { toast } = useToast();
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    description: '',
    stock: 0,
    price: 0,
    unit: 'piece',
    min_order: 1,
    gst_rate: 18
  });

  const fetchInventory = async () => {
    try {
      const { data, error } = await supabase
        .from('inventory')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setInventory(data || []);
    } catch (error) {
      console.error('Error fetching inventory:', error);
      toast({
        title: "Error",
        description: "Failed to fetch inventory",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();

    // Real-time subscription
    const channel = supabase
      .channel('inventory_realtime')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'inventory'
      }, () => {
        fetchInventory();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleAddProduct = async () => {
    try {
      const { error } = await supabase
        .from('inventory')
        .insert([{
          ...formData,
          status: formData.stock === 0 ? 'Out of Stock' : formData.stock <= formData.min_order ? 'Low Stock' : 'In Stock'
        }]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Product added successfully"
      });

      setIsAddModalOpen(false);
      resetForm();
    } catch (error) {
      console.error('Error adding product:', error);
      toast({
        title: "Error",
        description: "Failed to add product",
        variant: "destructive"
      });
    }
  };

  const handleEditProduct = async () => {
    if (!editingItem) return;

    try {
      const { error } = await supabase
        .from('inventory')
        .update({
          ...formData,
          status: formData.stock === 0 ? 'Out of Stock' : formData.stock <= formData.min_order ? 'Low Stock' : 'In Stock'
        })
        .eq('id', editingItem.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Product updated successfully"
      });

      setIsEditModalOpen(false);
      setEditingItem(null);
      resetForm();
    } catch (error) {
      console.error('Error updating product:', error);
      toast({
        title: "Error",
        description: "Failed to update product",
        variant: "destructive"
      });
    }
  };

  const handleDeleteProduct = async (id: number) => {
    if (!confirm('Are you sure you want to delete this product?')) return;

    try {
      const { error } = await supabase
        .from('inventory')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Product deleted successfully"
      });
    } catch (error) {
      console.error('Error deleting product:', error);
      toast({
        title: "Error",
        description: "Failed to delete product",
        variant: "destructive"
      });
    }
  };

  const openEditModal = (item: InventoryItem) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      category: item.category,
      description: item.description || '',
      stock: item.stock,
      price: item.price,
      unit: item.unit,
      min_order: item.min_order,
      gst_rate: item.gst_rate
    });
    setIsEditModalOpen(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      category: '',
      description: '',
      stock: 0,
      price: 0,
      unit: 'piece',
      min_order: 1,
      gst_rate: 18
    });
  };

  const filteredInventory = inventory.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status: string, stock: number) => {
    if (stock === 0) {
      return <Badge variant="destructive">Out of Stock</Badge>;
    } else if (status === 'Low Stock') {
      return <Badge variant="outline" className="border-yellow-500 text-yellow-700">Low Stock</Badge>;
    } else {
      return <Badge variant="secondary" className="bg-green-100 text-green-800">In Stock</Badge>;
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
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Inventory Management
            </CardTitle>
            <Button onClick={() => setIsAddModalOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Product
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-6">
            <div className="flex items-center gap-2 flex-1">
              <Search className="h-4 w-4 text-gray-500" />
              <Input
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3">Product</th>
                  <th className="text-left p-3">Category</th>
                  <th className="text-left p-3">Stock</th>
                  <th className="text-left p-3">Price</th>
                  <th className="text-left p-3">GST Rate</th>
                  <th className="text-left p-3">Status</th>
                  <th className="text-left p-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredInventory.map((item) => (
                  <tr key={item.id} className="border-b hover:bg-gray-50">
                    <td className="p-3">
                      <div>
                        <p className="font-medium">{item.name}</p>
                        {item.description && (
                          <p className="text-sm text-gray-600">{item.description}</p>
                        )}
                      </div>
                    </td>
                    <td className="p-3">{item.category}</td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        {item.stock <= item.min_order && item.stock > 0 && (
                          <AlertTriangle className="h-4 w-4 text-yellow-500" />
                        )}
                        <span>{item.stock} {item.unit}</span>
                      </div>
                    </td>
                    <td className="p-3">₹{item.price.toLocaleString()}</td>
                    <td className="p-3">{item.gst_rate}%</td>
                    <td className="p-3">{getStatusBadge(item.status, item.stock)}</td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openEditModal(item)}
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDeleteProduct(item.id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredInventory.length === 0 && (
            <div className="text-center py-8">
              <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No products found</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Product Modal */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add New Product</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Product Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="Enter product name"
                />
              </div>
              <div>
                <Label htmlFor="category">Category</Label>
                <Input
                  id="category"
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                  placeholder="Enter category"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                placeholder="Enter description (optional)"
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="stock">Stock Quantity</Label>
                <Input
                  id="stock"
                  type="number"
                  min="0"
                  value={formData.stock}
                  onChange={(e) => setFormData({...formData, stock: parseInt(e.target.value) || 0})}
                />
              </div>
              <div>
                <Label htmlFor="price">Price (₹)</Label>
                <Input
                  id="price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({...formData, price: parseFloat(e.target.value) || 0})}
                />
              </div>
              <div>
                <Label htmlFor="unit">Unit</Label>
                <Select value={formData.unit} onValueChange={(value) => setFormData({...formData, unit: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="piece">Piece</SelectItem>
                    <SelectItem value="kg">Kilogram</SelectItem>
                    <SelectItem value="liter">Liter</SelectItem>
                    <SelectItem value="box">Box</SelectItem>
                    <SelectItem value="packet">Packet</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="min_order">Minimum Order</Label>
                <Input
                  id="min_order"
                  type="number"
                  min="1"
                  value={formData.min_order}
                  onChange={(e) => setFormData({...formData, min_order: parseInt(e.target.value) || 1})}
                />
              </div>
              <div>
                <Label htmlFor="gst_rate">GST Rate (%)</Label>
                <Input
                  id="gst_rate"
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  value={formData.gst_rate}
                  onChange={(e) => setFormData({...formData, gst_rate: parseFloat(e.target.value) || 18})}
                />
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button variant="outline" onClick={() => setIsAddModalOpen(false)} className="flex-1">
                Cancel
              </Button>
              <Button onClick={handleAddProduct} className="flex-1">
                Add Product
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Product Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Product</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit_name">Product Name</Label>
                <Input
                  id="edit_name"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="Enter product name"
                />
              </div>
              <div>
                <Label htmlFor="edit_category">Category</Label>
                <Input
                  id="edit_category"
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                  placeholder="Enter category"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="edit_description">Description</Label>
              <Input
                id="edit_description"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                placeholder="Enter description (optional)"
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="edit_stock">Stock Quantity</Label>
                <Input
                  id="edit_stock"
                  type="number"
                  min="0"
                  value={formData.stock}
                  onChange={(e) => setFormData({...formData, stock: parseInt(e.target.value) || 0})}
                />
              </div>
              <div>
                <Label htmlFor="edit_price">Price (₹)</Label>
                <Input
                  id="edit_price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({...formData, price: parseFloat(e.target.value) || 0})}
                />
              </div>
              <div>
                <Label htmlFor="edit_unit">Unit</Label>
                <Select value={formData.unit} onValueChange={(value) => setFormData({...formData, unit: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="piece">Piece</SelectItem>
                    <SelectItem value="kg">Kilogram</SelectItem>
                    <SelectItem value="liter">Liter</SelectItem>
                    <SelectItem value="box">Box</SelectItem>
                    <SelectItem value="packet">Packet</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit_min_order">Minimum Order</Label>
                <Input
                  id="edit_min_order"
                  type="number"
                  min="1"
                  value={formData.min_order}
                  onChange={(e) => setFormData({...formData, min_order: parseInt(e.target.value) || 1})}
                />
              </div>
              <div>
                <Label htmlFor="edit_gst_rate">GST Rate (%)</Label>
                <Input
                  id="edit_gst_rate"
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  value={formData.gst_rate}
                  onChange={(e) => setFormData({...formData, gst_rate: parseFloat(e.target.value) || 18})}
                />
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button variant="outline" onClick={() => setIsEditModalOpen(false)} className="flex-1">
                Cancel
              </Button>
              <Button onClick={handleEditProduct} className="flex-1">
                Update Product
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminInventoryManagement;
