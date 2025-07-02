
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, User, CreditCard, Building2, CheckCircle } from 'lucide-react';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface FranchiseMember {
  id: string;
  user_id: string | null;
  name: string;
  email: string;
  phone: string | null;
  franchise_location: string;
  position: string;
  status: string;
  tvanamm_id: bigint | null;
  profile_completion_percentage: number;
}

interface OnboardingData {
  userId: string;
  tvanammId: string;
  franchiseLocation: string;
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: User | null;
  existingMember: FranchiseMember | null;
  onComplete: (data: OnboardingData) => Promise<boolean>;
  loading: boolean;
}

const SmartFranchiseOnboardingModal = ({ 
  open, 
  onOpenChange, 
  user, 
  existingMember,
  onComplete, 
  loading 
}: Props) => {
  const [formData, setFormData] = useState<Partial<OnboardingData>>({
    tvanammId: '',
    franchiseLocation: ''
  });

  // Pre-populate form with existing data
  useEffect(() => {
    if (existingMember) {
      setFormData({
        tvanammId: existingMember.tvanamm_id?.toString() || '',
        franchiseLocation: existingMember.franchise_location || ''
      });
    } else {
      // Reset form when no existing member
      setFormData({
        tvanammId: '',
        franchiseLocation: ''
      });
    }
  }, [existingMember, open]);

  // Check if user is already fully onboarded
  const isFullyOnboarded = existingMember && 
    existingMember.status === 'verified' && 
    existingMember.tvanamm_id && 
    existingMember.franchise_location &&
    existingMember.profile_completion_percentage >= 100;

  const validateTvanammId = (value: string): boolean => {
    if (!value || value.trim() === '') return false;
    const num = parseInt(value);
    return !isNaN(num) && num > 0 && value.length >= 4;
  };

  const validateFranchiseLocation = (value: string): boolean => {
    return value && value.trim().length >= 3;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !formData.tvanammId || !formData.franchiseLocation) {
      console.log('Missing required data:', { user, formData });
      return;
    }

    if (!validateTvanammId(formData.tvanammId)) {
      console.log('Invalid TVANAMM ID:', formData.tvanammId);
      return;
    }

    if (!validateFranchiseLocation(formData.franchiseLocation)) {
      console.log('Invalid franchise location:', formData.franchiseLocation);
      return;
    }

    console.log('Submitting onboarding form with:', {
      userId: user.id,
      tvanammId: formData.tvanammId.trim(),
      franchiseLocation: formData.franchiseLocation.trim()
    });

    const success = await onComplete({
      userId: user.id,
      tvanammId: formData.tvanammId.trim(),
      franchiseLocation: formData.franchiseLocation.trim()
    });

    if (success) {
      onOpenChange(false);
      setFormData({
        tvanammId: '',
        franchiseLocation: ''
      });
    }
  };

  if (isFullyOnboarded) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              Franchise Already Onboarded
            </DialogTitle>
          </DialogHeader>

          <Card className="border-green-200 bg-green-50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-green-100 rounded-full">
                  <User className="h-5 w-5 text-green-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold">{existingMember.name}</h3>
                  <p className="text-sm text-gray-600">{existingMember.email}</p>
                  <Badge className="bg-green-100 text-green-800 mt-1">
                    {existingMember.status === 'verified' ? 'Fully Verified' : existingMember.status}
                  </Badge>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <CreditCard className="h-4 w-4 text-gray-500" />
                  <span className="font-medium">TVANAMM ID:</span>
                  <span>{existingMember.tvanamm_id?.toString()}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="h-4 w-4 text-gray-500" />
                  <span className="font-medium">Location:</span>
                  <span>{existingMember.franchise_location}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Building2 className="h-4 w-4 text-gray-500" />
                  <span className="font-medium">Position:</span>
                  <span>{existingMember.position}</span>
                </div>
              </div>

              <div className="mt-4 p-3 bg-green-100 border border-green-200 rounded-lg">
                <p className="text-sm text-green-800">
                  <strong>✅ Onboarding Complete!</strong> This franchise member is fully verified and has complete access to the dashboard.
                </p>
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-3 pt-4">
            <Button
              onClick={() => onOpenChange(false)}
              className="flex-1 bg-green-600 hover:bg-green-700"
            >
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-emerald-600" />
            {existingMember ? 'Complete Franchise Onboarding' : 'Franchise Onboarding'}
          </DialogTitle>
        </DialogHeader>

        {user && (
          <Card className="mb-4">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-full">
                  <User className="h-5 w-5 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold">{user.name}</h3>
                  <p className="text-sm text-gray-600">{user.email}</p>
                  <Badge variant="outline" className="mt-1">
                    {user.role}
                  </Badge>
                </div>
              </div>
              
              {existingMember && (
                <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    <strong>Partial Record Found:</strong> We found some existing information. Please complete or update the missing details below.
                  </p>
                </div>
              )}
              
              {!existingMember && (
                <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm text-green-800">
                    <strong>Note:</strong> We'll use your existing profile information (name, email, phone). 
                    You only need to provide your TVANAMM ID and franchise location.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* TVANAMM ID */}
          <div className="space-y-2">
            <Label htmlFor="tvanammId" className="flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              TVANAMM ID *
            </Label>
            <Input
              id="tvanammId"
              type="number"
              value={formData.tvanammId || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, tvanammId: e.target.value }))}
              placeholder="Enter your TVANAMM ID (e.g., 12345)"
              required
              min="1"
              className={!validateTvanammId(formData.tvanammId || '') && formData.tvanammId ? 'border-red-300' : ''}
            />
            {formData.tvanammId && !validateTvanammId(formData.tvanammId) && (
              <p className="text-sm text-red-600">Please enter a valid TVANAMM ID (minimum 4 digits)</p>
            )}
          </div>

          {/* Franchise Location */}
          <div className="space-y-2">
            <Label htmlFor="franchiseLocation" className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Franchise Location *
            </Label>
            <Input
              id="franchiseLocation"
              value={formData.franchiseLocation || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, franchiseLocation: e.target.value }))}
              placeholder="Enter your franchise location (e.g., Mumbai Central)"
              required
              minLength={3}
              className={!validateFranchiseLocation(formData.franchiseLocation || '') && formData.franchiseLocation ? 'border-red-300' : ''}
            />
            {formData.franchiseLocation && !validateFranchiseLocation(formData.franchiseLocation) && (
              <p className="text-sm text-red-600">Please enter a valid franchise location (minimum 3 characters)</p>
            )}
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading || !validateTvanammId(formData.tvanammId || '') || !validateFranchiseLocation(formData.franchiseLocation || '')}
              className="flex-1 bg-emerald-600 hover:bg-emerald-700"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Processing...
                </div>
              ) : (
                existingMember ? 'Update Onboarding' : 'Complete Onboarding'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default SmartFranchiseOnboardingModal;
