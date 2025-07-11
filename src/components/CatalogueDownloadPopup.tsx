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
        const link = document.createElement('a');
        link.href = '/catalog.pdf';
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
      {/* Increased width to max-w-sm (384px) */}
      <div className="bg-white rounded-lg max-w-sm w-full shadow-xl">
        <div className="relative">
          {/* Header with slightly increased padding */}
          <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white p-5 rounded-t-lg flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <FileText className="h-5 w-5 text-white" />
              <h2 className="text-lg font-semibold">Download Catalogue</h2>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-white/20 transition-colors"
              aria-label="Close popup"
            >
              <X className="h-4 w-4 text-white" />
            </button>
          </div>

          {/* Form with increased spacing and padding */}
          <div className="p-5">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name" className="text-sm font-medium text-gray-700">Name *</Label>
                <div className="relative mt-1.5">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="Your name"
                    className="pl-9 text-sm h-9 border-gray-300 rounded"
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="email" className="text-sm font-medium text-gray-700">Email *</Label>
                <div className="relative mt-1.5">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="your@email.com"
                    className="pl-9 text-sm h-9 border-gray-300 rounded"
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="phone" className="text-sm font-medium text-gray-700">Phone *</Label>
                <div className="relative mt-1.5">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    placeholder="+91 XXXXX XXXXX"
                    className="pl-9 text-sm h-9 border-gray-300 rounded"
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="location" className="text-sm font-medium text-gray-700">Location</Label>
                <div className="relative mt-1.5">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                    placeholder="City"
                    className="pl-9 text-sm h-9 border-gray-300 rounded"
                  />
                </div>
              </div>

              <Button 
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white h-10 text-sm font-medium rounded shadow hover:shadow-md transition-all"
              >
                {isSubmitting ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Processing...
                  </div>
                ) : (
                  <>
                    <Download className="mr-2 h-4 w-4" />
                    Download Now
                  </>
                )}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CatalogueDownloadPopup;