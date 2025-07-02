
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface FormSubmission {
  id: string;
  name: string;
  email: string;
  phone?: string;
  message?: string;
  type: string;
  status: string;
  franchise_location?: string;
  investment_amount?: number;
  experience_years?: number;
  catalog_requested?: boolean;
  franchise_inquiry_details?: any;
  additional_data?: any;
  created_at: string;
  updated_at: string;
}

export const useFormSubmissions = () => {
  const { user } = useAuth();
  const [formSubmissions, setFormSubmissions] = useState<FormSubmission[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchFormSubmissions = useCallback(async () => {
    if (!user || !['owner', 'admin'].includes(user.role)) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('form_submissions')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) {
        console.error('Error fetching form submissions:', error);
        return;
      }

      setFormSubmissions(data || []);
    } catch (error) {
      console.error('Error fetching form submissions:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const submitFranchiseForm = async (formData: {
    name: string;
    email: string;
    phone: string;
    city: string;
    state: string;
    experience: string;
    investment: string;
    message: string;
  }) => {
    try {
      const { data, error } = await supabase
        .from('form_submissions')
        .insert([{
          type: 'franchise',
          form_type: 'franchise',
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          message: formData.message,
          franchise_location: `${formData.city}, ${formData.state}`,
          experience_years: parseInt(formData.experience) || 0,
          investment_amount: parseFloat(formData.investment) || 0,
          status: 'pending',
          franchise_inquiry_details: {
            city: formData.city,
            state: formData.state,
            experience: formData.experience,
            investment: formData.investment
          }
        }]);

      if (error) {
        console.error('Error submitting franchise form:', error);
        return { success: false, error: error.message };
      }

      return { success: true, data };
    } catch (error) {
      console.error('Error submitting franchise form:', error);
      return { success: false, error: 'Submission failed' };
    }
  };

  const submitContactForm = async (formData: {
    name: string;
    email: string;
    phone?: string;
    message: string;
  }) => {
    try {
      const { data, error } = await supabase
        .from('form_submissions')
        .insert([{
          type: 'contact',
          form_type: 'contact',
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          message: formData.message,
          status: 'pending'
        }]);

      if (error) {
        console.error('Error submitting contact form:', error);
        return { success: false, error: error.message };
      }

      return { success: true, data };
    } catch (error) {
      console.error('Error submitting contact form:', error);
      return { success: false, error: 'Submission failed' };
    }
  };

  const submitCatalogRequest = async (formData: {
    name: string;
    email: string;
    phone?: string;
    message?: string;
  }) => {
    try {
      const { data, error } = await supabase
        .from('form_submissions')
        .insert([{
          type: 'catalog',
          form_type: 'catalog',
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          message: formData.message || 'Catalog download request',
          catalog_requested: true,
          status: 'pending'
        }]);

      if (error) {
        console.error('Error submitting catalog request:', error);
        return { success: false, error: error.message };
      }

      return { success: true, data };
    } catch (error) {
      console.error('Error submitting catalog request:', error);
      return { success: false, error: 'Submission failed' };
    }
  };

  useEffect(() => {
    if (user && ['owner', 'admin'].includes(user.role)) {
      fetchFormSubmissions();

      // Set up real-time subscription
      const channel = supabase
        .channel('form_submissions_realtime')
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'form_submissions'
        }, fetchFormSubmissions)
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user, fetchFormSubmissions]);

  const franchiseEnquiries = formSubmissions.filter(f => f.type === 'franchise');
  const catalogRequests = formSubmissions.filter(f => f.catalog_requested === true);
  const contactForms = formSubmissions.filter(f => f.type === 'contact');

  return { 
    formSubmissions, 
    franchiseEnquiries,
    catalogRequests,
    contactForms,
    loading, 
    refetch: fetchFormSubmissions,
    submitFranchiseForm,
    submitContactForm,
    submitCatalogRequest
  };
};
