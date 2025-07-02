
import React, { useState } from 'react';
import { X, Download, FileText, User, Phone, Mail, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { useFormSubmissions } from '@/hooks/useFormSubmissions';

interface CatalogueDownloadPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

const CatalogueDownloadPopup: React.FC<CatalogueDownloadPopupProps> = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    location: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { submitCatalogRequest } = useFormSubmissions();

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.phone) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields to download the catalogue.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await submitCatalogRequest({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        message: `Catalog request from ${formData.location || 'Unknown location'}`
      });

      if (result.success) {
        // Simulate PDF download
        const link = document.createElement('a');
        link.href = '/catalog.pdf'; // Replace with actual PDF URL
        link.download = 'Tvanamm-Master-Catalogue-2025.pdf';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        toast({
          title: "Download Started! 🎉",
          description: "Your catalogue is downloading. Our team will contact you within 24 hours.",
        });

        onClose();
        setFormData({ name: '', email: '', phone: '', location: '' });
      } else {
        throw new Error(result.error || 'Submission failed');
      }
    } catch (error: any) {
      toast({
        title: "Download Failed",
        description: error.message || "Unable to download catalogue. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl animate-scale-in">
        <div className="relative">
          {/* Header */}
          <div className="bg-gradient-to-br from-emerald-600 to-teal-600 text-white p-6 rounded-t-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -translate-y-12 translate-x-12"></div>
            
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors p-1 hover:bg-white/10 rounded-full"
            >
              <X className="h-5 w-5" />
            </button>
            
            <div className="text-center relative z-10">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-white/20 rounded-xl backdrop-blur-sm mb-3">
                <FileText className="h-6 w-6 text-white" />
              </div>
              <h2 className="text-xl font-bold mb-1">Download Free Catalogue</h2>
              <p className="text-emerald-100 text-sm">
                Get instant access to our complete product guide
              </p>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name" className="text-sm font-medium text-gray-700">Full Name *</Label>
                <div className="relative mt-1">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="Enter your name"
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
                <Label htmlFor="location" className="text-sm font-medium text-gray-700">Location (Optional)</Label>
                <div className="relative mt-1">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                    placeholder="City, State"
                    className="pl-10 border-gray-200 focus:border-emerald-500 focus:ring-emerald-500 rounded-lg h-11"
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
                    Processing...
                  </div>
                ) : (
                  <>
                    <Download className="mr-2 h-5 w-5" />
                    Download Catalogue Now
                  </>
                )}
              </Button>
              
              <p className="text-sm text-gray-600 text-center">
                * No registration required. Instant PDF download.
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CatalogueDownloadPopup;
