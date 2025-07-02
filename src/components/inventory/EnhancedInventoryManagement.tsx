
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useRealTimeInventory } from '@/hooks/useRealTimeInventory';
import { useToast } from '@/hooks/use-toast';
import { Plus, Edit, Package, AlertTriangle } from 'lucide-react';

const EnhancedInventoryManagement = () => {
  const { inventory, loading, addProduct, updateStock } = useRealTimeInventory();
  const { toast } = useToast();
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    stock: 0,
    price: 0,
    unit: 'piece',
    description: '',
    min_order: 1,
    gst_rate: 18
  });

  const handleAddProduct = async () => {
    const result = await addProduct(formData);
    if (result.success) {
      setShowAddDialog(false);
      setFormData({
        name: '',
        category: '',
        stock: 0,
        price: 0,
        unit: 'piece',
        description: '',
        min_order: 1,
        gst_rate: 18
      });
    }
  };

  const handleUpdateStock = async (id: number, newStock: number) => {
    const result = await updateStock(id, newStock);
    if (result.success) {
      toast({
        title: "Success",
        description: "Stock updated successfully",
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'In Stock': return 'bg-green-100 text-green-800';
      case 'Low Stock': return 'bg-yellow-100 text-yellow-800';
      case 'Out of Stock': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
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
      {/* Header with Add Button */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Inventory Management</h2>
          <p className="text-gray-600">Real-time inventory tracking and management</p>
        </div>
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button className="bg-emerald-600 hover:bg-emerald-700">
              <Plus className="h-4 w-4 mr-2" />
              Add Product
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Add New Product</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
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
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="stock">Stock Quantity</Label>
                  <Input
                    id="stock"
                    type="number"
                    value={formData.stock}
                    onChange={(e) => setFormData({...formData, stock: parseInt(e.target.value) || 0})}
                  />
                </div>
                <div>
                  <Label htmlFor="price">Price (₹)</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({...formData, price: parseFloat(e.target.value) || 0})}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="unit">Unit</Label>
                  <Input
                    id="unit"
                    value={formData.unit}
                    onChange={(e) => setFormData({...formData, unit: e.target.value})}
                    placeholder="e.g., piece, kg, liter"
                  />
                </div>
                <div>
                  <Label htmlFor="min_order">Min Order</Label>
                  <Input
                    id="min_order"
                    type="number"
                    value={formData.min_order}
                    onChange={(e) => setFormData({...formData, min_order: parseInt(e.target.value) || 1})}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="gst_rate">GST Rate (%)</Label>
                <Input
                  id="gst_rate"
                  type="number"
                  step="0.01"
                  value={formData.gst_rate}
                  onChange={(e) => setFormData({...formData, gst_rate: parseFloat(e.target.value) || 18})}
                  placeholder="Enter custom GST percentage"
                />
              </div>
              <div>
                <Label htmlFor="description">Description (Optional)</Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Product description"
                />
              </div>
              <Button onClick={handleAddProduct} className="w-full">
                Add Product
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Inventory Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {inventory.map((item) => (
          <Card key={item.id} className="relative">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{item.name}</CardTitle>
                <Badge className={getStatusColor(item.status)}>
                  {item.status}
                </Badge>
              </div>
              <p className="text-sm text-gray-600">{item.category}</p>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Stock:</span>
                  <p className="font-semibold">{item.stock} {item.unit}</p>
                </div>
                <div>
                  <span className="text-gray-500">Price:</span>
                  <p className="font-semibold">₹{item.price}</p>
                </div>
                <div>
                  <span className="text-gray-500">Min Order:</span>
                  <p className="font-semibold">{item.min_order}</p>
                </div>
                <div>
                  <span className="text-gray-500">GST:</span>
                  <p className="font-semibold">{item.gst_rate}%</p>
                </div>
              </div>
              
              {item.stock <= item.min_order && (
                <div className="flex items-center gap-2 p-2 bg-yellow-50 rounded border border-yellow-200">
                  <AlertTriangle className="h-4 w-4 text-yellow-600" />
                  <span className="text-sm text-yellow-800">Low stock alert!</span>
                </div>
              )}

              <div className="flex gap-2">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button size="sm" variant="outline" className="flex-1">
                      <Edit className="h-4 w-4 mr-1" />
                      Edit Stock
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-sm">
                    <DialogHeader>
                      <DialogTitle>Update Stock - {item.name}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label>Current Stock: {item.stock} {item.unit}</Label>
                        <Input
                          type="number"
                          placeholder="Enter new stock quantity"
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              const newStock = parseInt((e.target as HTMLInputElement).value);
                              if (!isNaN(newStock)) {
                                handleUpdateStock(item.id, newStock);
                              }
                            }
                          }}
                        />
                      </div>
                      <p className="text-sm text-gray-600">
                        Press Enter to update stock quantity
                      </p>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {inventory.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">No Products Yet</h3>
            <p className="text-gray-500 mb-4">Start by adding your first product to the inventory.</p>
            <Button onClick={() => setShowAddDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add First Product
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default EnhancedInventoryManagement;
