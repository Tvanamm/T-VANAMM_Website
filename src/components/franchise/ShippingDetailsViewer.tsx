import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Truck, 
  User, 
  Phone, 
  Calendar, 
  MapPin, 
  Building,
  FileText,
  Package
} from 'lucide-react';

interface ShippingDetailsViewerProps {
  isOpen: boolean;
  onClose: () => void;
  order: any;
}

const ShippingDetailsViewer: React.FC<ShippingDetailsViewerProps> = ({
  isOpen,
  onClose,
  order
}) => {
  const shippingDetails = order.shipping_details;
  
  if (!shippingDetails) {
    return null;
  }

  const formatEstimatedDelivery = (date: string) => {
    if (!date) return 'Not specified';
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const calculateDeliveryCountdown = (estimatedDate: string) => {
    if (!estimatedDate) return null;
    
    const now = new Date();
    const delivery = new Date(estimatedDate);
    const diffTime = delivery.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return 'Delivery date passed';
    if (diffDays === 0) return 'Delivery expected today';
    if (diffDays === 1) return 'Delivery expected tomorrow';
    return `${diffDays} days until delivery`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Truck className="h-5 w-5 text-blue-600" />
            Shipping Details - Order #{order.id.slice(-8)}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Order Status */}
          <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Package className="h-8 w-8 text-blue-600" />
                  <div>
                    <h3 className="font-semibold text-blue-900">Order Status</h3>
                    <Badge className="bg-blue-100 text-blue-800 border-blue-300">
                      {order.status.toUpperCase()}
                    </Badge>
                  </div>
                </div>
                {order.tracking_number && (
                  <div className="text-right">
                    <p className="text-sm text-blue-700">Tracking Number</p>
                    <p className="font-mono font-semibold text-blue-900">
                      {order.tracking_number}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Transport Information */}
          <Card>
            <CardContent className="p-4">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Truck className="h-5 w-5 text-green-600" />
                Transport Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <Truck className="h-4 w-4 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Vehicle Number</p>
                      <p className="font-semibold text-lg">
                        {shippingDetails.vehicleNumber || 'Not specified'}
                      </p>
                    </div>
                  </div>
                  
                  {shippingDetails.transportCompany && (
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <Building className="h-4 w-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Transport Company</p>
                        <p className="font-semibold">
                          {shippingDetails.transportCompany}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                      <User className="h-4 w-4 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Driver Name</p>
                      <p className="font-semibold">
                        {shippingDetails.driverName || 'Not specified'}
                      </p>
                    </div>
                  </div>
                  
                  {shippingDetails.driverPhone && (
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                        <Phone className="h-4 w-4 text-orange-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Driver Contact</p>
                        <p className="font-semibold">
                          {shippingDetails.driverPhone}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Delivery Information */}
          <Card>
            <CardContent className="p-4">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Calendar className="h-5 w-5 text-indigo-600" />
                Delivery Information
              </h3>
              
              <div className="space-y-4">
                <div className="flex items-start gap-3 p-4 bg-indigo-50 rounded-lg border border-indigo-200">
                  <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                    <Calendar className="h-4 w-4 text-indigo-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-indigo-700 mb-1">Estimated Delivery</p>
                    <p className="font-semibold text-indigo-900">
                      {formatEstimatedDelivery(shippingDetails.estimatedDelivery)}
                    </p>
                    {shippingDetails.estimatedDelivery && (
                      <p className="text-sm text-indigo-600 mt-1">
                        {calculateDeliveryCountdown(shippingDetails.estimatedDelivery)}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <MapPin className="h-4 w-4 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-600 mb-1">Delivery Address</p>
                    <p className="font-medium">
                      {order.shipping_address}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Additional Notes */}
          {shippingDetails.notes && (
            <Card>
              <CardContent className="p-4">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <FileText className="h-5 w-5 text-gray-600" />
                  Additional Notes
                </h3>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="text-gray-700 whitespace-pre-wrap">
                    {shippingDetails.notes}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Timeline */}
          <Card>
            <CardContent className="p-4">
              <h3 className="font-semibold mb-4">Shipping Timeline</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <div>
                    <p className="font-medium text-green-800">Order Shipped</p>
                    <p className="text-sm text-green-600">
                      {order.shipped_at ? new Date(order.shipped_at).toLocaleDateString('en-US', {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      }) : 'Recently'}
                    </p>
                  </div>
                </div>
                
                {order.status === 'delivered' && (
                  <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <div>
                      <p className="font-medium text-blue-800">Order Delivered</p>
                      <p className="text-sm text-blue-600">Completed</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ShippingDetailsViewer;