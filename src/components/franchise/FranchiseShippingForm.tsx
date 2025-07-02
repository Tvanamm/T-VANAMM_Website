
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useRealFranchiseProfile } from '@/hooks/useRealFranchiseProfile';
import { MapPin, User, Phone, Hash, Building } from 'lucide-react';

interface ShippingFormData {
  name: string;
  tvanamm_id: string;
  mobile: string;
  address1: string;
  address2: string;
  pincode: string;
  state: string;
  city: string;
  landmark: string;
}

interface FranchiseShippingFormProps {
  formData: ShippingFormData;
  onFormChange: (data: ShippingFormData) => void;
  errors: {[key: string]: string};
}

const FranchiseShippingForm: React.FC<FranchiseShippingFormProps> = ({
  formData,
  onFormChange,
  errors
}) => {
  const { franchiseProfile } = useRealFranchiseProfile();

  const handleInputChange = (field: keyof ShippingFormData, value: string) => {
    // For numeric fields, allow only numbers
    if (['mobile', 'pincode'].includes(field)) {
      if (value && !/^\d*$/.test(value)) return;
    }

    onFormChange({
      ...formData,
      [field]: value
    });
  };

  // Auto-populate from franchise profile
  React.useEffect(() => {
    if (franchiseProfile && !formData.name) {
      onFormChange({
        ...formData,
        name: franchiseProfile.name || '',
        tvanamm_id: franchiseProfile.tvanamm_id || '',
        mobile: franchiseProfile.phone || '',
        // Use franchise_location for city if available, otherwise empty
        city: franchiseProfile.franchise_location || '',
        // These fields don't exist in the profile so leave empty
        state: '',
        pincode: ''
      });
    }
  }, [franchiseProfile]);

  const formatFullAddress = () => {
    const parts = [
      formData.address1,
      formData.address2,
      formData.landmark && `Near ${formData.landmark}`,
      formData.city,
      formData.state,
      formData.pincode
    ].filter(Boolean);
    
    return parts.join(', ');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          Shipping Details
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Personal Information */}
        <div className="space-y-4">
          <h3 className="font-semibold text-gray-800 flex items-center gap-2">
            <User className="h-4 w-4" />
            Personal Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Full Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className={errors.name ? 'border-red-500' : ''}
                placeholder="Enter your full name"
              />
              {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
            </div>

            <div>
              <Label htmlFor="tvanamm_id" className="flex items-center gap-1">
                <Hash className="h-3 w-3" />
                TVANAMM ID *
              </Label>
              <Input
                id="tvanamm_id"
                value={formData.tvanamm_id}
                onChange={(e) => handleInputChange('tvanamm_id', e.target.value)}
                className={errors.tvanamm_id ? 'border-red-500' : ''}
                placeholder="Your TVANAMM ID"
              />
              {errors.tvanamm_id && <p className="text-xs text-red-500 mt-1">{errors.tvanamm_id}</p>}
            </div>

            <div>
              <Label htmlFor="mobile" className="flex items-center gap-1">
                <Phone className="h-3 w-3" />
                Mobile Number *
              </Label>
              <Input
                id="mobile"
                value={formData.mobile}
                onChange={(e) => handleInputChange('mobile', e.target.value)}
                placeholder="10-digit mobile number"
                maxLength={10}
                className={errors.mobile ? 'border-red-500' : ''}
              />
              {errors.mobile && <p className="text-xs text-red-500 mt-1">{errors.mobile}</p>}
            </div>

            <div>
              <Label htmlFor="pincode">Pincode *</Label>
              <Input
                id="pincode"
                value={formData.pincode}
                onChange={(e) => handleInputChange('pincode', e.target.value)}
                placeholder="6-digit pincode"
                maxLength={6}
                className={errors.pincode ? 'border-red-500' : ''}
              />
              {errors.pincode && <p className="text-xs text-red-500 mt-1">{errors.pincode}</p>}
            </div>
          </div>
        </div>

        {/* Address Information */}
        <div className="space-y-4">
          <h3 className="font-semibold text-gray-800 flex items-center gap-2">
            <Building className="h-4 w-4" />
            Address Information
          </h3>
          
          <div>
            <Label htmlFor="address1">House/Flat Number & Building Name *</Label>
            <Input
              id="address1"
              value={formData.address1}
              onChange={(e) => handleInputChange('address1', e.target.value)}
              placeholder="e.g., Flat 2B, Sunshine Apartments"
              className={errors.address1 ? 'border-red-500' : ''}
            />
            {errors.address1 && <p className="text-xs text-red-500 mt-1">{errors.address1}</p>}
          </div>

          <div>
            <Label htmlFor="address2">Street & Area/Locality *</Label>
            <Input
              id="address2"
              value={formData.address2}
              onChange={(e) => handleInputChange('address2', e.target.value)}
              placeholder="e.g., MG Road, Koramangala"
              className={errors.address2 ? 'border-red-500' : ''}
            />
            {errors.address2 && <p className="text-xs text-red-500 mt-1">{errors.address2}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="city">City *</Label>
              <Input
                id="city"
                value={formData.city}
                onChange={(e) => handleInputChange('city', e.target.value)}
                placeholder="e.g., Bangalore"
                className={errors.city ? 'border-red-500' : ''}
              />
              {errors.city && <p className="text-xs text-red-500 mt-1">{errors.city}</p>}
            </div>

            <div>
              <Label htmlFor="state">State *</Label>
              <Input
                id="state"
                value={formData.state}
                onChange={(e) => handleInputChange('state', e.target.value)}
                placeholder="e.g., Karnataka"
                className={errors.state ? 'border-red-500' : ''}
              />
              {errors.state && <p className="text-xs text-red-500 mt-1">{errors.state}</p>}
            </div>
          </div>

          <div>
            <Label htmlFor="landmark">Landmark (Optional)</Label>
            <Input
              id="landmark"
              value={formData.landmark}
              onChange={(e) => handleInputChange('landmark', e.target.value)}
              placeholder="e.g., Near City Mall, Opposite Bus Stop"
            />
          </div>
        </div>

        {/* Address Preview */}
        {(formData.address1 || formData.address2 || formData.city) && (
          <div className="bg-gray-50 p-4 rounded-lg">
            <Label className="font-semibold text-gray-700">Complete Address Preview:</Label>
            <div className="mt-2 p-3 bg-white border rounded text-sm text-gray-800">
              <div className="font-medium">{formData.name}</div>
              <div>{formatFullAddress()}</div>
              {formData.mobile && <div>Mobile: {formData.mobile}</div>}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default FranchiseShippingForm;
export type { ShippingFormData };
