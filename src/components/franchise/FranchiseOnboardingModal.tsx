
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, User, CreditCard, Building2 } from 'lucide-react';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
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
  onComplete: (data: OnboardingData) => Promise<boolean>;
  loading: boolean;
}

const FranchiseOnboardingModal = ({ open, onOpenChange, user, onComplete, loading }: Props) => {
  const [formData, setFormData] = useState<Partial<OnboardingData>>({
    tvanammId: '',
    franchiseLocation: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !formData.tvanammId || !formData.franchiseLocation) {
      console.log('Missing required data:', { user, formData });
      return;
    }

    console.log('Submitting onboarding form with:', {
      userId: user.id,
      tvanammId: formData.tvanammId,
      franchiseLocation: formData.franchiseLocation
    });

    const success = await onComplete({
      userId: user.id,
      tvanammId: formData.tvanammId,
      franchiseLocation: formData.franchiseLocation
    });

    if (success) {
      onOpenChange(false);
      setFormData({
        tvanammId: '',
        franchiseLocation: ''
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-emerald-600" />
            Complete Franchise Onboarding
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
              <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm text-green-800">
                  <strong>Note:</strong> We'll use your existing profile information (name, email, phone). 
                  You only need to provide your TVANAMM ID and franchise location.
                </p>
              </div>
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
              value={formData.tvanammId || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, tvanammId: e.target.value }))}
              placeholder="Enter your TVANAMM ID"
              required
            />
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
              placeholder="Enter your franchise location"
              required
            />
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
              disabled={loading || !formData.tvanammId || !formData.franchiseLocation}
              className="flex-1 bg-emerald-600 hover:bg-emerald-700"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Processing...
                </div>
              ) : (
                'Complete Onboarding'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default FranchiseOnboardingModal;
