
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MapPin, User, Phone, Mail, Building, FileText, Send } from 'lucide-react';
import { useEnhancedFranchiseOnboarding } from '@/hooks/useEnhancedFranchiseOnboarding';

interface FranchiseRegistrationFormProps {
  onSuccess?: () => void;
}

const FranchiseRegistrationForm = ({ onSuccess }: FranchiseRegistrationFormProps) => {
  const { registerFranchiseMember } = useEnhancedFranchiseOnboarding();
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    franchise_location: '',
    position: '',
    location_details: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      await registerFranchiseMember(formData);
      
      // Reset form
      setFormData({
        name: '',
        email: '',
        phone: '',
        franchise_location: '',
        position: '',
        location_details: ''
      });
      
      onSuccess?.();
    } catch (error) {
      console.error('Error submitting franchise application:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const isFormValid = formData.name && formData.email && formData.phone && 
                     formData.franchise_location && formData.position;

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building className="h-5 w-5" />
          Franchise Application Form
        </CardTitle>
        <p className="text-sm text-gray-600">
          Submit your franchise application. Our team will review and contact you for verification.
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Personal Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
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
                  placeholder="Enter your full name"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="email">Email Address *</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="your.email@example.com"
                    className="pl-10"
                    required
                  />
                </div>
              </div>
            </div>

            <div>
              <Label htmlFor="phone">Phone Number *</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder="+91 XXXXX XXXXX"
                  className="pl-10"
                  required
                />
              </div>
            </div>
          </div>

          {/* Franchise Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Franchise Information
            </h3>
            
            <div>
              <Label htmlFor="franchise_location">Preferred Franchise Location *</Label>
              <Input
                id="franchise_location"
                value={formData.franchise_location}
                onChange={(e) => handleInputChange('franchise_location', e.target.value)}
                placeholder="e.g., Mumbai Central Mall, Delhi South Extension"
                required
              />
            </div>

            <div>
              <Label htmlFor="position">Desired Position *</Label>
              <Select 
                value={formData.position} 
                onValueChange={(value) => handleInputChange('position', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select your desired position" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Franchise Owner">Franchise Owner</SelectItem>
                  <SelectItem value="Franchise Manager">Franchise Manager</SelectItem>
                  <SelectItem value="Assistant Manager">Assistant Manager</SelectItem>
                  <SelectItem value="Store Manager">Store Manager</SelectItem>
                  <SelectItem value="Sales Executive">Sales Executive</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="location_details">Location Details (Optional)</Label>
              <div className="relative">
                <FileText className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Textarea
                  id="location_details"
                  value={formData.location_details}
                  onChange={(e) => handleInputChange('location_details', e.target.value)}
                  placeholder="Provide additional details about the location, accessibility, nearby landmarks, etc."
                  className="pl-10 min-h-20"
                />
              </div>
            </div>
          </div>

          {/* Information Notice */}
          <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
            <h4 className="font-semibold text-blue-800 mb-2">What happens next?</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Your application will be reviewed by our team</li>
              <li>• You'll receive an approval notification within 24-48 hours</li>
              <li>• Upon approval, you'll need to complete Aadhar verification</li>
              <li>• Government OTP will be sent for secure identity verification</li>
              <li>• Once verified, you'll get full access to the franchise dashboard</li>
            </ul>
          </div>

          {/* Submit Button */}
          <Button 
            type="submit" 
            disabled={!isFormValid || submitting}
            className="w-full bg-emerald-600 hover:bg-emerald-700"
          >
            {submitting ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Submitting Application...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Send className="h-4 w-4" />
                Submit Franchise Application
              </div>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default FranchiseRegistrationForm;
