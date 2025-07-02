
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Edit, Trash2, Plus, Package, AlertTriangle, TrendingUp } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useRealTimeInventory } from '@/hooks/useRealTimeInventory';
import { toast } from '@/hooks/use-toast';

const InventoryManagement = () => {
  const { user } = useAuth();
  const { inventory, updateStock, addProduct, generateInventoryReport, loading } = useRealTimeInventory();
  const [editingItem, setEditingItem] = useState<number | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newItem, setNewItem] = useState({
    name: '',
    category: '',
    stock: 0,
    price: 0,
    unit: 'piece',
    min_order: 1,
    description: ''
  });

  const canModifyInventory = user?.role === 'admin' || user?.role === 'owner';

  const handleStockUpdate = async (id: number, newStock: number) => {
    if (!canModifyInventory) {
      toast({
        title: "Access Denied",
        description: "Only admin and owner can modify inventory.",
        variant: "destructive"
      });
      return;
    }
    
    await updateStock(id, newStock);
    setEditingItem(null);
  };

  const handleAddItem = async () => {
    if (!canModifyInventory) return;
    
    const result = await addProduct(newItem);
    if (result.success) {
      setNewItem({
        name: '',
        category: '',
        stock: 0,
        price: 0,
        unit: 'piece',
        min_order: 1,
        description: ''
      });
      setIsAddDialogOpen(false);
    }
  };

  const handleDeleteItem = (id: number, name: string) => {
    if (!canModifyInventory) {
      toast({
        title: "Access Denied",
        description: "Only admin and owner can delete inventory items.",
        variant: "destructive"
      });
      return;
    }
    
    // In a real app, this would call a delete function
    toast({
      title: "Item deleted",
      description: `${name} has been removed from inventory.`,
      variant: "destructive",
    });
  };

  const getStockStatusColor = (status: string) => {
    switch (status) {
      case 'In Stock': return 'bg-green-100 text-green-800';
      case 'Low Stock': return 'bg-yellow-100 text-yellow-800';
      case 'Critical': return 'bg-red-100 text-red-800';
      case 'Out of Stock': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <div className="w-6 h-6 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p>Loading real-time inventory...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Real-time Inventory Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <Package className="h-8 w-8 text-emerald-600 mx-auto mb-2" />
            <h3 className="font-semibold text-emerald-800">Total Items</h3>
            <p className="text-2xl font-bold text-emerald-700">{inventory.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <span className="text-green-600 font-bold">✓</span>
            </div>
            <h3 className="font-semibold text-green-800">In Stock</h3>
            <p className="text-2xl font-bold text-green-700">
              {inventory.filter(item => item.status === 'In Stock').length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <AlertTriangle className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
            <h3 className="font-semibold text-yellow-800">Low Stock</h3>
            <p className="text-2xl font-bold text-yellow-700">
              {inventory.filter(item => item.status === 'Low Stock' || item.status === 'Critical').length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <TrendingUp className="h-8 w-8 text-blue-600 mx-auto mb-2" />
            <h3 className="font-semibold text-blue-800">Total Value</h3>
            <p className="text-2xl font-bold text-blue-700">
              ₹{inventory.reduce((sum, item) => sum + (item.stock * item.price), 0).toLocaleString()}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Inventory Table */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Real-time Inventory Management
              <Badge variant="outline" className="text-emerald-600">Live Data</Badge>
            </CardTitle>
            <div className="flex gap-2">
              {canModifyInventory && (
                <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-emerald-600 hover:bg-emerald-700">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Product
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add New Product</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label>Product Name</Label>
                        <Input
                          value={newItem.name}
                          onChange={(e) => setNewItem({...newItem, name: e.target.value})}
                        />
                      </div>
                      <div>
                        <Label>Category</Label>
                        <Select value={newItem.category} onValueChange={(value) => setNewItem({...newItem, category: value})}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="tea-powder">Tea Powder</SelectItem>
                            <SelectItem value="supplies">Supplies</SelectItem>
                            <SelectItem value="equipment">Equipment</SelectItem>
                            <SelectItem value="packaging">Packaging</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Stock</Label>
                          <Input
                            type="number"
                            value={newItem.stock}
                            onChange={(e) => setNewItem({...newItem, stock: parseInt(e.target.value) || 0})}
                          />
                        </div>
                        <div>
                          <Label>Price (₹)</Label>
                          <Input
                            type="number"
                            value={newItem.price}
                            onChange={(e) => setNewItem({...newItem, price: parseFloat(e.target.value) || 0})}
                          />
                        </div>
                      </div>
                      <div>
                        <Label>Description</Label>
                        <Textarea
                          value={newItem.description}
                          onChange={(e) => setNewItem({...newItem, description: e.target.value})}
                        />
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                          Cancel
                        </Button>
                        <Button onClick={handleAddItem}>Add Product</Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              )}
              <Button variant="outline" onClick={generateInventoryReport}>
                Generate Report
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Updated</TableHead>
                {canModifyInventory && <TableHead>Actions</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {inventory.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.name}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{item.category}</Badge>
                  </TableCell>
                  <TableCell>
                    {editingItem === item.id && canModifyInventory ? (
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          defaultValue={item.stock}
                          className="w-20"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              handleStockUpdate(item.id, parseInt(e.currentTarget.value));
                            }
                          }}
                        />
                        <Button
                          size="sm"
                          onClick={(e) => {
                            const input = e.currentTarget.parentElement?.querySelector('input');
                            if (input) {
                              handleStockUpdate(item.id, parseInt(input.value));
                            }
                          }}
                        >
                          Save
                        </Button>
                      </div>
                    ) : (
                      <span className="font-semibold">{item.stock}</span>
                    )}
                  </TableCell>
                  <TableCell>₹{item.price}</TableCell>
                  <TableCell>
                    <Badge className={getStockStatusColor(item.status)}>
                      {item.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-gray-600">
                    {new Date(item.updated_at || '').toLocaleString('en-IN')}
                  </TableCell>
                  {canModifyInventory && (
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setEditingItem(editingItem === item.id ? null : item.id)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDeleteItem(item.id, item.name)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default InventoryManagement;
