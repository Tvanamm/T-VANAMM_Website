import React, { useState, useCallback, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useRealTimeRevenue } from '@/hooks/useRealTimeRevenue';
import { supabase } from '@/integrations/supabase/client';
import OrderWorkflowCard from './OrderWorkflowCard';
import EnhancedExportDataModal from '@/components/dashboard/EnhancedExportDataModal';
import { 
  Package, 
  TrendingUp, 
  CheckCircle, 
  XCircle, 
  Search,
  Clock,
  Download
} from 'lucide-react';

const EnhancedOrderManagement = () => {
  const { revenueData, loading } = useRealTimeRevenue();
  const [searchTerm, setSearchTerm] = useState('');
  const [orders, setOrders] = useState<any[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [showExportModal, setShowExportModal] = useState(false);

  const fetchOrders = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('franchise_orders')
        .select(`
          id,
          franchise_name,
          total_amount,
          status,
          created_at,
          updated_at,
          tracking_number,
          shipping_address,
          tvanamm_id,
          franchise_members!inner(name, tvanamm_id, phone, email, user_id),
          order_items(id, item_name, quantity, unit_price, total_price)
        `)
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      setOrders(data || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setOrdersLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchOrders();

    const channel = supabase
      .channel('orders_management_enhanced')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'franchise_orders'
      }, () => {
        fetchOrders();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchOrders]);

  const filteredOrders = useMemo(() => {
    if (!searchTerm) return orders;
    const search = searchTerm.toLowerCase();
    return orders.filter(order =>
      order.franchise_name?.toLowerCase().includes(search) ||
      order.franchise_members?.name?.toLowerCase().includes(search) ||
      order.franchise_members?.tvanamm_id?.toString().includes(search) ||
      order.tracking_number?.toLowerCase().includes(search)
    );
  }, [orders, searchTerm]);

  const ordersByStatus = useMemo(() => ({
    pending: filteredOrders.filter(o => o.status === 'pending'),
    confirmed: filteredOrders.filter(o => o.status === 'confirmed'),
    paid: filteredOrders.filter(o => o.status === 'paid'),
    packing: filteredOrders.filter(o => o.status === 'packing'),
    packed: filteredOrders.filter(o => o.status === 'packed'),
    shipped: filteredOrders.filter(o => o.status === 'shipped'),
    delivered: filteredOrders.filter(o => o.status === 'delivered'),
    cancelled: filteredOrders.filter(o => o.status === 'cancelled')
  }), [filteredOrders]);

  if (loading || ordersLoading) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <div className="w-6 h-6 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p>Loading orders...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <Package className="h-8 w-8 text-blue-600 mx-auto mb-2" />
            <h3 className="font-semibold text-blue-800">Total Orders</h3>
            <p className="text-2xl font-bold text-blue-700">{revenueData.totalOrders}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <TrendingUp className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <h3 className="font-semibold text-green-800">Total Revenue</h3>
            <p className="text-2xl font-bold text-green-700">₹{revenueData.totalRevenue.toLocaleString()}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <Clock className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
            <h3 className="font-semibold text-yellow-800">Pending</h3>
            <p className="text-2xl font-bold text-yellow-700">
              {ordersByStatus.pending.length}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <CheckCircle className="h-8 w-8 text-emerald-600 mx-auto mb-2" />
            <h3 className="font-semibold text-emerald-800">In Progress</h3>
            <p className="text-2xl font-bold text-emerald-700">
              {ordersByStatus.confirmed.length + ordersByStatus.paid.length + ordersByStatus.packing.length + ordersByStatus.packed.length}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Orders Management */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Order Management & Workflow</CardTitle>
            <div className="flex items-center gap-4">
              <Button 
                variant="outline" 
                onClick={() => setShowExportModal(true)}
                className="flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                Export Data
              </Button>
              <div className="flex items-center gap-2">
                <Search className="h-4 w-4 text-gray-500" />
                <Input
                  placeholder="Search orders, TVANAMM ID, or franchise..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-64"
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Pending Orders - Priority */}
          {ordersByStatus.pending.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-yellow-800 mb-3 flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Pending Orders ({ordersByStatus.pending.length})
              </h3>
              <div className="space-y-3">
                {ordersByStatus.pending.map((order) => (
                  <OrderWorkflowCard
                    key={order.id}
                    order={order}
                    onOrderUpdated={fetchOrders}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Confirmed Orders - Awaiting Payment */}
          {ordersByStatus.confirmed.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-blue-800 mb-3 flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                Confirmed Orders - Awaiting Payment ({ordersByStatus.confirmed.length})
              </h3>
              <div className="space-y-3">
                {ordersByStatus.confirmed.map((order) => (
                  <OrderWorkflowCard
                    key={order.id}
                    order={order}
                    onOrderUpdated={fetchOrders}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Paid Orders - Ready for Packing */}
          {ordersByStatus.paid.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-green-800 mb-3 flex items-center gap-2">
                <Package className="h-5 w-5" />
                Paid Orders - Ready for Packing ({ordersByStatus.paid.length})
              </h3>
              <div className="space-y-3">
                {ordersByStatus.paid.map((order) => (
                  <OrderWorkflowCard
                    key={order.id}
                    order={order}
                    onOrderUpdated={fetchOrders}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Packing Orders */}
          {(ordersByStatus.packing.length > 0 || ordersByStatus.packed.length > 0) && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-purple-800 mb-3 flex items-center gap-2">
                <Package className="h-5 w-5" />
                Packing Orders ({ordersByStatus.packing.length + ordersByStatus.packed.length})
              </h3>
              <div className="space-y-3">
                {[...ordersByStatus.packing, ...ordersByStatus.packed].map((order) => (
                  <OrderWorkflowCard
                    key={order.id}
                    order={order}
                    onOrderUpdated={fetchOrders}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Shipped Orders */}
          {ordersByStatus.shipped.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-blue-800 mb-3 flex items-center gap-2">
                <Package className="h-5 w-5" />
                Shipped Orders ({ordersByStatus.shipped.length})
              </h3>
              <div className="space-y-3">
                {ordersByStatus.shipped.map((order) => (
                  <OrderWorkflowCard
                    key={order.id}
                    order={order}
                    onOrderUpdated={fetchOrders}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Other Orders */}
          {(ordersByStatus.delivered.length > 0 || ordersByStatus.cancelled.length > 0) && (
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-3">
                Completed Orders ({ordersByStatus.delivered.length + ordersByStatus.cancelled.length})
              </h3>
              <div className="space-y-3">
                {[...ordersByStatus.delivered, ...ordersByStatus.cancelled].map((order) => (
                  <OrderWorkflowCard
                    key={order.id}
                    order={order}
                    onOrderUpdated={fetchOrders}
                  />
                ))}
              </div>
            </div>
          )}

          {filteredOrders.length === 0 && (
            <div className="text-center py-8">
              <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No orders found</p>
              <p className="text-sm text-gray-400">
                {searchTerm ? 'Try adjusting your search terms' : 'Orders will appear here once placed'}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <EnhancedExportDataModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
      />
    </div>
  );
};

export default EnhancedOrderManagement;
