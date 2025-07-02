
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useFranchiseProfile } from '@/hooks/useFranchiseProfile';
import { CheckCircle, AlertCircle, User, MapPin, Briefcase } from 'lucide-react';

const SimpleFranchiseProfile = () => {
  const { franchiseProfile, loading, updateProfile, submitForVerification } = useFranchiseProfile();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    name: franchiseProfile?.name || '',
    phone: franchiseProfile?.phone || '',
    franchise_location: franchiseProfile?.franchise_location || '',
    position: franchiseProfile?.position || '',
    location_details: franchiseProfile?.location_details || ''
  });
  
  const [isSaving, setIsSaving] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSaveProfile = async () => {
    try {
      setIsSaving(true);
      await updateProfile(formData);
      toast({
        title: "Profile Updated",
        description: "Your profile has been updated successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSubmitForVerification = async () => {
    try {
      setIsSubmitting(true);
      await submitForVerification();
      toast({
        title: "Submitted for Verification",
        description: "Your profile has been submitted for admin verification",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit for verification",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadge = () => {
    if (!franchiseProfile) return null;
    
    const { status } = franchiseProfile;
    
    if (status === 'verified') {
      return (
        <Badge variant="default" className="bg-green-600">
          <CheckCircle className="h-3 w-3 mr-1" />
          Verified
        </Badge>
      );
    } else if (status === 'pending_verification') {
      return (
        <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
          <AlertCircle className="h-3 w-3 mr-1" />
          Pending Verification
        </Badge>
      );
    } else {
      return (
        <Badge variant="outline" className="bg-gray-100 text-gray-800">
          <AlertCircle className="h-3 w-3 mr-1" />
          Profile Incomplete
        </Badge>
      );
    }
  };

  const isProfileComplete = formData.name && formData.franchise_location && formData.position;

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="w-6 h-6 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
        <span className="ml-2">Loading profile...</span>
      </div>
    );
  }

  if (!franchiseProfile) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <AlertCircle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Franchise Profile Found</h3>
          <p className="text-gray-600">
            It seems you haven't been assigned to a franchise yet. Please contact the administrator.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Status Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Verification Status</span>
            {getStatusBadge()}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-blue-500" />
              <span className="text-sm">Profile: {isProfileComplete ? 'Complete' : 'Incomplete'}</span>
            </div>
            <div className="flex items-center gap-2">
              <Briefcase className={`h-4 w-4 ${franchiseProfile.status === 'verified' ? 'text-green-500' : 'text-yellow-500'}`} />
              <span className="text-sm">Admin: {franchiseProfile.status === 'verified' ? 'Approved' : 'Pending'}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Basic Profile Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Franchise Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Enter your full name"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                placeholder="Enter your phone number"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="position">Position</Label>
              <Input
                id="position"
                value={formData.position}
                onChange={(e) => handleInputChange('position', e.target.value)}
                placeholder="e.g., Store Manager, Franchise Owner"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="franchise_location">Franchise Location</Label>
              <Input
                id="franchise_location"
                value={formData.franchise_location}
                onChange={(e) => handleInputChange('franchise_location', e.target.value)}
                placeholder="e.g., Mumbai Central, Delhi NCR"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="location_details">Location Details</Label>
            <Textarea
              id="location_details"
              value={formData.location_details}
              onChange={(e) => handleInputChange('location_details', e.target.value)}
              placeholder="Provide detailed address and location information"
              rows={3}
            />
          </div>
          
          <div className="flex gap-3">
            <Button 
              onClick={handleSaveProfile}
              disabled={isSaving}
              variant="outline"
            >
              {isSaving ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                  Saving...
                </div>
              ) : (
                'Save Profile'
              )}
            </Button>
            
            {isProfileComplete && franchiseProfile.status !== 'verified' && (
              <Button 
                onClick={handleSubmitForVerification}
                disabled={isSubmitting}
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                {isSubmitting ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Submitting...
                  </div>
                ) : (
                  'Submit for Verification'
                )}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {franchiseProfile.status === 'verified' && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-6 text-center">
            <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-green-800 mb-2">
              Franchise Profile Verified
            </h3>
            <p className="text-green-700">
              Your franchise profile has been approved by the administrator. You now have full access to franchise features.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SimpleFranchiseProfile;
