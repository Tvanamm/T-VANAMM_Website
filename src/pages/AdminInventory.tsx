import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Edit, Trash2, Plus, Package, Users, Settings, AlertTriangle, Truck, Clock, CheckCircle, Search, Tag } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useInventory } from '@/contexts/InventoryContext';
import { toast } from '@/hooks/use-toast';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const AdminInventory = () => {
  const { user } = useAuth();
  const { inventory, orders, updateStock, updateOrderStatus } = useInventory();
  const [editingItem, setEditingItem] = useState<number | null>(null);
  const [orderFilter, setOrderFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [newItem, setNewItem] = useState({
    name: '',
    category: '',
    stock: 0,
    price: 0,
    unit: 'piece',
    min_order: 1,
    description: ''
  });
  const [newCategory, setNewCategory] = useState('');

  // Mock categories - in a real app, this would come from the database
  const [categories, setCategories] = useState([
    'tea-blends',
    'green-tea',
    'black-tea',
    'herbal-tea',
    'tea-accessories',
    'premium-collection',
    'organic-tea'
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'In Stock': return 'bg-green-100 text-green-800';
      case 'Low Stock': return 'bg-yellow-100 text-yellow-800';
      case 'Critical': return 'bg-red-100 text-red-800';
      case 'Out of Stock': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getOrderStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'confirmed': return 'bg-blue-100 text-blue-800';
      case 'packed': return 'bg-purple-100 text-purple-800';
      case 'shipped': return 'bg-indigo-100 text-indigo-800';
      case 'out-for-delivery': return 'bg-orange-100 text-orange-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getOrderStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'confirmed': return <CheckCircle className="h-4 w-4" />;
      case 'packed': return <Package className="h-4 w-4" />;
      case 'shipped': return <Truck className="h-4 w-4" />;
      case 'out-for-delivery': return <Truck className="h-4 w-4" />;
      case 'delivered': return <CheckCircle className="h-4 w-4" />;
      case 'cancelled': return <AlertTriangle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const handleStockUpdate = (id: number, newStock: number) => {
    updateStock(id, newStock);
    toast({
      title: "Stock updated",
      description: "Inventory has been updated successfully.",
    });
    setEditingItem(null);
  };

  const handleOrderStatusUpdate = (orderId: string, newStatus: any, trackingNumber?: string) => {
    updateOrderStatus(orderId, newStatus, trackingNumber);
    toast({
      title: "Order status updated",
      description: `Order ${orderId} status updated to ${newStatus}.`,
    });
  };

  const handleAddItem = () => {
    // In a real app, this would save to the database
    const mockNewItem = {
      ...newItem,
      id: Math.max(...inventory.map(i => i.id)) + 1,
      status: newItem.stock > 15 ? 'In Stock' : newItem.stock > 5 ? 'Low Stock' : newItem.stock > 0 ? 'Critical' : 'Out of Stock',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    toast({
      title: "Item added",
      description: `${newItem.name} has been added to inventory.`,
    });
    
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
  };

  const handleEditItem = () => {
    // In a real app, this would update the database
    toast({
      title: "Item updated",
      description: `${selectedItem?.name} has been updated.`,
    });
    setIsEditDialogOpen(false);
    setSelectedItem(null);
  };

  const handleDeleteItem = (id: number, name: string) => {
    // In a real app, this would delete from the database
    toast({
      title: "Item deleted",
      description: `${name} has been removed from inventory.`,
      variant: "destructive",
    });
  };

  const handleAddCategory = () => {
    if (newCategory && !categories.includes(newCategory)) {
      setCategories([...categories, newCategory]);
      toast({
        title: "Category added",
        description: `${newCategory} category has been created.`,
      });
      setNewCategory('');
      setIsCategoryDialogOpen(false);
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesFilter = orderFilter === 'all' || order.status === orderFilter;
    const matchesSearch = order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         order.franchise_name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  // Check if user is admin/employee
  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
        <Navbar />
        <div className="pt-24 pb-12">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <div className="bg-red-50 border border-red-200 rounded-lg p-8">
              <AlertTriangle className="h-12 w-12 text-red-600 mx-auto mb-4" />
              <h2 className="text-2xl font-semibold text-red-800 mb-4">Access Restricted</h2>
              <p className="text-red-600 mb-6">
                This page is exclusively for Tvanamm management system users. 
                Please contact management if you need access to this system.
              </p>
              <Button onClick={() => window.history.back()}>
                Go Back
              </Button>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      <Navbar />
      
      <div className="pt-24 pb-12">
        {/* Header */}
        <div className="max-w-7xl mx-auto px-4 mb-8">
          <div className="bg-green-600 text-white rounded-lg p-6 mb-8">
            <div className="flex items-center gap-3 mb-2">
              <Settings className="h-6 w-6" />
              <Badge className="bg-green-800 text-white">MANAGEMENT SYSTEM</Badge>
            </div>
            <h1 className="text-3xl md:text-4xl font-serif mb-2">
              Management System Dashboard
            </h1>
            <p className="text-green-100">
              Manage inventory stock levels and franchise order deliveries
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <Card className="border-green-200">
              <CardContent className="p-4 text-center">
                <Package className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <h3 className="font-semibold text-green-800">Total Items</h3>
                <p className="text-2xl font-bold text-green-700">{inventory.length}</p>
              </CardContent>
            </Card>
            <Card className="border-green-200">
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
            <Card className="border-yellow-200">
              <CardContent className="p-4 text-center">
                <div className="h-8 w-8 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <span className="text-yellow-600 font-bold">!</span>
                </div>
                <h3 className="font-semibold text-yellow-800">Low Stock</h3>
                <p className="text-2xl font-bold text-yellow-700">
                  {inventory.filter(item => item.status === 'Low Stock').length}
                </p>
              </CardContent>
            </Card>
            <Card className="border-blue-200">
              <CardContent className="p-4 text-center">
                <Truck className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <h3 className="font-semibold text-blue-800">Active Orders</h3>
                <p className="text-2xl font-bold text-blue-700">
                  {orders.filter(order => !['delivered', 'cancelled'].includes(order.status)).length}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4">
          <Tabs defaultValue="inventory" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="inventory">Inventory Management</TabsTrigger>
              <TabsTrigger value="orders">Order Management</TabsTrigger>
            </TabsList>

            <TabsContent value="inventory" className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <CardTitle className="flex items-center gap-2">
                      <Package className="h-5 w-5" />
                      Product Inventory
                    </CardTitle>
                    <div className="flex gap-2">
                      <Dialog open={isCategoryDialogOpen} onOpenChange={setIsCategoryDialogOpen}>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            <Tag className="h-4 w-4 mr-2" />
                            Add Category
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Add New Category</DialogTitle>
                            <DialogDescription>
                              Create a new product category for inventory organization.
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div>
                              <Label htmlFor="categoryName">Category Name</Label>
                              <Input
                                id="categoryName"
                                value={newCategory}
                                onChange={(e) => setNewCategory(e.target.value)}
                                placeholder="e.g., specialty-teas"
                              />
                            </div>
                            <div className="flex justify-end gap-2">
                              <Button variant="outline" onClick={() => setIsCategoryDialogOpen(false)}>
                                Cancel
                              </Button>
                              <Button onClick={handleAddCategory}>
                                Add Category
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                        <DialogTrigger asChild>
                          <Button>
                            <Plus className="h-4 w-4 mr-2" />
                            Add Item
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-md">
                          <DialogHeader>
                            <DialogTitle>Add New Inventory Item</DialogTitle>
                            <DialogDescription>
                              Add a new product to your inventory system.
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div>
                              <Label htmlFor="itemName">Product Name</Label>
                              <Input
                                id="itemName"
                                value={newItem.name}
                                onChange={(e) => setNewItem({...newItem, name: e.target.value})}
                                placeholder="Product name"
                              />
                            </div>
                            <div>
                              <Label htmlFor="itemCategory">Category</Label>
                              <Select value={newItem.category} onValueChange={(value) => setNewItem({...newItem, category: value})}>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select category" />
                                </SelectTrigger>
                                <SelectContent>
                                  {categories.map((category) => (
                                    <SelectItem key={category} value={category}>
                                      {category.replace('-', ' ').toUpperCase()}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <Label htmlFor="itemStock">Stock</Label>
                                <Input
                                  id="itemStock"
                                  type="number"
                                  value={newItem.stock}
                                  onChange={(e) => setNewItem({...newItem, stock: parseInt(e.target.value)})}
                                />
                              </div>
                              <div>
                                <Label htmlFor="itemPrice">Price (₹)</Label>
                                <Input
                                  id="itemPrice"
                                  type="number"
                                  value={newItem.price}
                                  onChange={(e) => setNewItem({...newItem, price: parseFloat(e.target.value)})}
                                />
                              </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <Label htmlFor="itemUnit">Unit</Label>
                                <Select value={newItem.unit} onValueChange={(value) => setNewItem({...newItem, unit: value})}>
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="piece">Piece</SelectItem>
                                    <SelectItem value="kg">Kilogram</SelectItem>
                                    <SelectItem value="gram">Gram</SelectItem>
                                    <SelectItem value="packet">Packet</SelectItem>
                                    <SelectItem value="box">Box</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <div>
                                <Label htmlFor="itemMinOrder">Min Order</Label>
                                <Input
                                  id="itemMinOrder"
                                  type="number"
                                  value={newItem.min_order}
                                  onChange={(e) => setNewItem({...newItem, min_order: parseInt(e.target.value)})}
                                />
                              </div>
                            </div>
                            <div>
                              <Label htmlFor="itemDescription">Description</Label>
                              <Textarea
                                id="itemDescription"
                                value={newItem.description}
                                onChange={(e) => setNewItem({...newItem, description: e.target.value})}
                                placeholder="Product description"
                              />
                            </div>
                            <div className="flex justify-end gap-2">
                              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                                Cancel
                              </Button>
                              <Button onClick={handleAddItem}>
                                Add Item
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Product Name</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Stock Level</TableHead>
                        <TableHead>Price (₹)</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Last Updated</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {inventory.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell className="font-medium">{item.name}</TableCell>
                          <TableCell className="capitalize">{item.category.replace('-', ' ')}</TableCell>
                          <TableCell>
                            {editingItem === item.id ? (
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
                            <Badge className={getStatusColor(item.status)}>
                              {item.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm text-gray-600">
                            {new Date(item.updated_at).toLocaleString('en-IN')}
                          </TableCell>
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
                                variant="outline"
                                onClick={() => {
                                  setSelectedItem(item);
                                  setIsEditDialogOpen(true);
                                }}
                              >
                                Edit
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
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="orders" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Truck className="h-5 w-5" />
                    Franchise Order Management
                  </CardTitle>
                  <div className="flex flex-col sm:flex-row gap-4 mt-4">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Search orders or franchise..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                    <Select value={orderFilter} onValueChange={setOrderFilter}>
                      <SelectTrigger className="w-full sm:w-48">
                        <SelectValue placeholder="Filter by status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Orders</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="confirmed">Confirmed</SelectItem>
                        <SelectItem value="packed">Packed</SelectItem>
                        <SelectItem value="shipped">Shipped</SelectItem>
                        <SelectItem value="out-for-delivery">Out for Delivery</SelectItem>
                        <SelectItem value="delivered">Delivered</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {filteredOrders.map((order) => (
                      <Card key={order.id} className="border border-gray-200">
                        <CardContent className="p-6">
                          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-4">
                            <div>
                              <h3 className="font-semibold text-lg">{order.id}</h3>
                              <p className="text-gray-600">{order.franchise_name}</p>
                              <p className="text-sm text-gray-500">
                                Ordered: {new Date(order.created_at).toLocaleString('en-IN')}
                              </p>
                            </div>
                            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                              <div className="text-right">
                                <p className="font-semibold text-lg">₹{order.total_amount.toLocaleString()}</p>
                                {order.estimated_delivery && (
                                  <p className="text-sm text-gray-600">
                                    Est. Delivery: {new Date(order.estimated_delivery).toLocaleDateString('en-IN')}
                                  </p>
                                )}
                              </div>
                              <div className="flex items-center gap-2">
                                <Badge className={getOrderStatusColor(order.status)}>
                                  {getOrderStatusIcon(order.status)}
                                  {order.status.replace('-', ' ').toUpperCase()}
                                </Badge>
                              </div>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                              <h4 className="font-medium mb-2">Order Items ({order.items?.length || 0})</h4>
                              <div className="space-y-2 max-h-32 overflow-y-auto">
                                {order.items?.map((item, index) => (
                                  <div key={index} className="flex justify-between text-sm">
                                    <span>{item.item_name} (x{item.quantity})</span>
                                    <span>₹{item.total_price.toLocaleString()}</span>
                                  </div>
                                ))}
                              </div>
                            </div>

                            <div>
                              <h4 className="font-medium mb-2">Update Status</h4>
                              <div className="space-y-3">
                                <Select
                                  value={order.status}
                                  onValueChange={(value) => handleOrderStatusUpdate(order.id, value)}
                                >
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="pending">Pending</SelectItem>
                                    <SelectItem value="confirmed">Confirmed</SelectItem>
                                    <SelectItem value="packed">Packed</SelectItem>
                                    <SelectItem value="shipped">Shipped</SelectItem>
                                    <SelectItem value="out-for-delivery">Out for Delivery</SelectItem>
                                    <SelectItem value="delivered">Delivered</SelectItem>
                                    <SelectItem value="cancelled">Cancelled</SelectItem>
                                  </SelectContent>
                                </Select>
                                
                                {order.status === 'shipped' && (
                                  <div>
                                    <Input
                                      placeholder="Enter tracking number"
                                      defaultValue={order.tracking_number || ''}
                                      onBlur={(e) => {
                                        if (e.target.value) {
                                          handleOrderStatusUpdate(order.id, order.status, e.target.value);
                                        }
                                      }}
                                    />
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="mt-4 pt-4 border-t border-gray-200">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                              <div>
                                <span className="font-medium">Shipping Address:</span>
                                <p>{order.shipping_address}</p>
                              </div>
                              <div>
                                <span className="font-medium">Last Updated:</span>
                                <p>{new Date(order.updated_at).toLocaleString('en-IN')}</p>
                                {order.tracking_number && (
                                  <>
                                    <span className="font-medium">Tracking Number:</span>
                                    <p className="font-mono">{order.tracking_number}</p>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                    
                    {filteredOrders.length === 0 && (
                      <div className="text-center py-8 text-gray-500">
                        No orders found matching your criteria.
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Edit Item Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Inventory Item</DialogTitle>
            <DialogDescription>
              Update the details of this inventory item.
            </DialogDescription>
          </DialogHeader>
          {selectedItem && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="editName">Product Name</Label>
                <Input
                  id="editName"
                  defaultValue={selectedItem.name}
                  placeholder="Product name"
                />
              </div>
              <div>
                <Label htmlFor="editCategory">Category</Label>
                <Select defaultValue={selectedItem.category}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category.replace('-', ' ').toUpperCase()}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="editStock">Stock</Label>
                  <Input
                    id="editStock"
                    type="number"
                    defaultValue={selectedItem.stock}
                  />
                </div>
                <div>
                  <Label htmlFor="editPrice">Price (₹)</Label>
                  <Input
                    id="editPrice"
                    type="number"
                    defaultValue={selectedItem.price}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="editDescription">Description</Label>
                <Textarea
                  id="editDescription"
                  defaultValue={selectedItem.description}
                  placeholder="Product description"
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleEditItem}>
                  Update Item
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
};

export default AdminInventory;
