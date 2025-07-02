
import React, { useState } from 'react';
import { X, Store, User, Mail, Phone, MapPin, Briefcase, DollarSign, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { useFormSubmissions } from '@/hooks/useFormSubmissions';

interface FranchiseEnquiryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const FranchiseEnquiryModal: React.FC<FranchiseEnquiryModalProps> = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    city: '',
    state: '',
    experience: '',
    investment: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { submitFranchiseForm } = useFormSubmissions();

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.phone || !formData.city) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await submitFranchiseForm(formData);

      if (result.success) {
        toast({
          title: "Enquiry Submitted! 🎉",
          description: "Thank you for your interest. Our team will contact you within 24 hours.",
        });

        onClose();
        setFormData({
          name: '',
          email: '',
          phone: '',
          city: '',
          state: '',
          experience: '',
          investment: '',
          message: ''
        });
      } else {
        throw new Error(result.error || 'Submission failed');
      }
    } catch (error: any) {
      toast({
        title: "Submission Failed",
        description: error.message || "Unable to submit enquiry. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl animate-scale-in my-8">
        <div className="relative">
          {/* Header */}
          <div className="bg-gradient-to-br from-emerald-600 to-teal-600 text-white p-6 rounded-t-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
            
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors p-1 hover:bg-white/10 rounded-full"
            >
              <X className="h-5 w-5" />
            </button>
            
            <div className="text-center relative z-10">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-white/20 rounded-xl backdrop-blur-sm mb-3">
                <Store className="h-6 w-6 text-white" />
              </div>
              <h2 className="text-2xl font-bold mb-1">Franchise Enquiry</h2>
              <p className="text-emerald-100">
                Join the T VANAMM family and start your tea business journey
              </p>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name" className="text-sm font-medium text-gray-700">Full Name *</Label>
                  <div className="relative mt-1">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      placeholder="Enter your full name"
                      className="pl-10 border-gray-200 focus:border-emerald-500 focus:ring-emerald-500 rounded-lg h-11"
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="email" className="text-sm font-medium text-gray-700">Email Address *</Label>
                  <div className="relative mt-1">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      placeholder="your@email.com"
                      className="pl-10 border-gray-200 focus:border-emerald-500 focus:ring-emerald-500 rounded-lg h-11"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="phone" className="text-sm font-medium text-gray-700">Phone Number *</Label>
                  <div className="relative mt-1">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      placeholder="+91 XXXXX XXXXX"
                      className="pl-10 border-gray-200 focus:border-emerald-500 focus:ring-emerald-500 rounded-lg h-11"
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="city" className="text-sm font-medium text-gray-700">City *</Label>
                  <div className="relative mt-1">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="city"
                      value={formData.city}
                      onChange={(e) => handleInputChange('city', e.target.value)}
                      placeholder="Your city"
                      className="pl-10 border-gray-200 focus:border-emerald-500 focus:ring-emerald-500 rounded-lg h-11"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="state" className="text-sm font-medium text-gray-700">State</Label>
                  <Input
                    id="state"
                    value={formData.state}
                    onChange={(e) => handleInputChange('state', e.target.value)}
                    placeholder="Your state"
                    className="border-gray-200 focus:border-emerald-500 focus:ring-emerald-500 rounded-lg h-11"
                  />
                </div>

                <div>
                  <Label htmlFor="experience" className="text-sm font-medium text-gray-700">Business Experience (Years)</Label>
                  <div className="relative mt-1">
                    <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Select value={formData.experience} onValueChange={(value) => handleInputChange('experience', value)}>
                      <SelectTrigger className="pl-10 border-gray-200 focus:border-emerald-500 focus:ring-emerald-500 rounded-lg h-11">
                        <SelectValue placeholder="Select experience" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0-1">0-1 years</SelectItem>
                        <SelectItem value="2-5">2-5 years</SelectItem>
                        <SelectItem value="6-10">6-10 years</SelectItem>
                        <SelectItem value="10+">10+ years</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <div>
                <Label htmlFor="investment" className="text-sm font-medium text-gray-700">Investment Capacity</Label>
                <div className="relative mt-1">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Select value={formData.investment} onValueChange={(value) => handleInputChange('investment', value)}>
                    <SelectTrigger className="pl-10 border-gray-200 focus:border-emerald-500 focus:ring-emerald-500 rounded-lg h-11">
                      <SelectValue placeholder="Select investment range" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="50000-100000">₹50,000 - ₹1,00,000</SelectItem>
                      <SelectItem value="100000-300000">₹1,00,000 - ₹3,00,000</SelectItem>
                      <SelectItem value="300000-500000">₹3,00,000 - ₹5,00,000</SelectItem>
                      <SelectItem value="500000+">₹5,00,000+</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="message" className="text-sm font-medium text-gray-700">Additional Message</Label>
                <div className="relative mt-1">
                  <MessageSquare className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Textarea
                    id="message"
                    value={formData.message}
                    onChange={(e) => handleInputChange('message', e.target.value)}
                    placeholder="Tell us more about your franchise plans..."
                    className="pl-10 pt-3 border-gray-200 focus:border-emerald-500 focus:ring-emerald-500 rounded-lg min-h-[80px] resize-none"
                    rows={3}
                  />
                </div>
              </div>

              <Button 
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white h-12 text-base font-medium rounded-lg shadow-lg hover:shadow-xl transition-all duration-300"
              >
                {isSubmitting ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Submitting...
                  </div>
                ) : (
                  <>
                    <Store className="mr-2 h-5 w-5" />
                    Submit Franchise Enquiry
                  </>
                )}
              </Button>
              
              <p className="text-sm text-gray-600 text-center">
                Our franchise experts will contact you within 24 hours
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FranchiseEnquiryModal;
