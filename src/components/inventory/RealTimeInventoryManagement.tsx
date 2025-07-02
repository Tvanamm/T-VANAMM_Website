
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Package, Plus, Edit, Trash2, AlertTriangle, TrendingDown, TrendingUp } from 'lucide-react';
import { useRealTimeInventory } from '@/hooks/useRealTimeInventory';
import { useToast } from '@/hooks/use-toast';

const RealTimeInventoryManagement = () => {
  const { inventory, loading, updateStock, addProduct, deleteProduct, generateInventoryReport } = useRealTimeInventory();
  const { toast } = useToast();
  const [addItemDialog, setAddItemDialog] = useState(false);
  const [editStock, setEditStock] = useState<{ id: number; stock: number } | null>(null);

  const [itemForm, setItemForm] = useState({
    name: '',
    category: '',
    price: '',
    stock: '',
    unit: 'piece',
    description: '',
    min_order: '1'
  });

  const handleAddItem = async () => {
    if (!itemForm.name || !itemForm.category || !itemForm.price || !itemForm.stock) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    const result = await addProduct({
      name: itemForm.name,
      category: itemForm.category,
      price: parseFloat(itemForm.price),
      stock: parseInt(itemForm.stock),
      unit: itemForm.unit,
      description: itemForm.description,
      min_order: parseInt(itemForm.min_order)
    });

    if (result.success) {
      setAddItemDialog(false);
      resetForm();
    }
  };

  const resetForm = () => {
    setItemForm({
      name: '',
      category: '',
      price: '',
      stock: '',
      unit: 'piece',
      description: '',
      min_order: '1'
    });
  };

  const handleDeleteProduct = async (id: number, name: string) => {
    if (confirm(`Are you sure you want to delete "${name}"? This action cannot be undone.`)) {
      await deleteProduct(id);
    }
  };

  const handleStockUpdate = async (id: number, newStock: number) => {
    await updateStock(id, newStock);
    setEditStock(null);
  };

  const getStatusColor = (stock: number) => {
    if (stock <= 0) return 'bg-red-100 text-red-800';
    if (stock <= 10) return 'bg-yellow-100 text-yellow-800';
    if (stock <= 20) return 'bg-orange-100 text-orange-800';
    return 'bg-green-100 text-green-800';
  };

  const getStatusText = (stock: number) => {
    if (stock <= 0) return 'Out of Stock';
    if (stock <= 10) return 'Critical';
    if (stock <= 20) return 'Low Stock';
    return 'In Stock';
  };

  const inventoryStats = {
    total: inventory.length,
    inStock: inventory.filter(item => item.stock > 20).length,
    lowStock: inventory.filter(item => item.stock <= 20 && item.stock > 0).length,
    outOfStock: inventory.filter(item => item.stock <= 0).length,
    totalValue: inventory.reduce((sum, item) => sum + (item.stock * item.price), 0)
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
      {/* Inventory Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <Package className="h-8 w-8 text-blue-600 mx-auto mb-2" />
            <h3 className="font-semibold text-blue-800">Total Items</h3>
            <p className="text-2xl font-bold text-blue-700">{inventoryStats.total}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <TrendingUp className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <h3 className="font-semibold text-green-800">In Stock</h3>
            <p className="text-2xl font-bold text-green-700">{inventoryStats.inStock}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <TrendingDown className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
            <h3 className="font-semibold text-yellow-800">Low Stock</h3>
            <p className="text-2xl font-bold text-yellow-700">{inventoryStats.lowStock}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <AlertTriangle className="h-8 w-8 text-red-600 mx-auto mb-2" />
            <h3 className="font-semibold text-red-800">Out of Stock</h3>
            <p className="text-2xl font-bold text-red-700">{inventoryStats.outOfStock}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <TrendingUp className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <h3 className="font-semibold text-green-800">Total Value</h3>
            <p className="text-2xl font-bold text-green-700">₹{inventoryStats.totalValue.toLocaleString()}</p>
          </CardContent>
        </Card>
      </div>

      {/* Inventory Management */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Real-Time Inventory Management
            </CardTitle>
            <div className="flex gap-2">
              <Button onClick={() => setAddItemDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Item
              </Button>
              <Button variant="outline" onClick={generateInventoryReport}>
                Generate Report
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {inventory.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{item.name}</div>
                        {item.description && (
                          <div className="text-sm text-gray-500">{item.description}</div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{item.category}</TableCell>
                    <TableCell>
                      {editStock?.id === item.id ? (
                        <div className="flex items-center gap-2">
                          <Input
                            type="number"
                            value={editStock.stock}
                            onChange={(e) => setEditStock(prev => prev ? { ...prev, stock: parseInt(e.target.value) } : null)}
                            className="w-20"
                          />
                          <Button 
                            size="sm" 
                            onClick={() => handleStockUpdate(item.id, editStock.stock)}
                          >
                            Save
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => setEditStock(null)}
                          >
                            Cancel
                          </Button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <span>{item.stock} {item.unit}</span>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setEditStock({ id: item.id, stock: item.stock })}
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                        </div>
                      )}
                    </TableCell>
                    <TableCell>₹{item.price}</TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(item.stock)}>
                        {getStatusText(item.stock)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleDeleteProduct(item.id, item.name)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {inventory.length === 0 && (
            <div className="text-center py-8">
              <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No inventory items found</p>
              <Button onClick={() => setAddItemDialog(true)} className="mt-4">
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Item
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Item Dialog */}
      <Dialog open={addItemDialog} onOpenChange={setAddItemDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Inventory Item</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Item Name *</Label>
                <Input
                  value={itemForm.name}
                  onChange={(e) => setItemForm(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>
              <div>
                <Label>Category *</Label>
                <Input
                  value={itemForm.category}
                  onChange={(e) => setItemForm(prev => ({ ...prev, category: e.target.value }))}
                />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label>Price (₹) *</Label>
                <Input
                  type="number"
                  value={itemForm.price}
                  onChange={(e) => setItemForm(prev => ({ ...prev, price: e.target.value }))}
                />
              </div>
              <div>
                <Label>Stock *</Label>
                <Input
                  type="number"
                  value={itemForm.stock}
                  onChange={(e) => setItemForm(prev => ({ ...prev, stock: e.target.value }))}
                />
              </div>
              <div>
                <Label>Unit</Label>
                <Select
                  value={itemForm.unit}
                  onValueChange={(value) => setItemForm(prev => ({ ...prev, unit: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="piece">Piece</SelectItem>
                    <SelectItem value="kg">Kilogram</SelectItem>
                    <SelectItem value="liter">Liter</SelectItem>
                    <SelectItem value="box">Box</SelectItem>
                    <SelectItem value="pack">Pack</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label>Description</Label>
              <Textarea
                value={itemForm.description}
                onChange={(e) => setItemForm(prev => ({ ...prev, description: e.target.value }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddItemDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddItem}>Add Item</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default RealTimeInventoryManagement;
