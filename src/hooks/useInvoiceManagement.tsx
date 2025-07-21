import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Invoice {
  id: string;
  order_id: string;
  file_path: string;
  file_name: string;
  generated_at: string;
  expires_at: string;
  access_level: string;
  download_count: number;
}

export const useInvoiceManagement = (orderId?: string) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);

  const fetchInvoices = async () => {
    if (!user || !orderId) return;

    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('invoices')
        .select('*')
        .eq('order_id', orderId)
        .order('generated_at', { ascending: false });

      if (error) {
        console.error('Error fetching invoices:', error);
        return;
      }

      setInvoices(data || []);
    } catch (error) {
      console.error('Error fetching invoices:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateInvoice = async (orderId: string, isAdmin = false) => {
    try {
      setGenerating(true);
      
      const { data, error } = await supabase.functions.invoke('generate-invoice', {
        body: { 
          orderId, 
          generateForAdmin: isAdmin 
        }
      });

      if (error) {
        throw error;
      }

      if (data?.success) {
        toast({
          title: "Invoice Generated",
          description: "Invoice has been generated successfully.",
        });
        
        // Refresh invoices list
        await fetchInvoices();
        return data;
      } else {
        throw new Error(data?.error || 'Failed to generate invoice');
      }
    } catch (error) {
      console.error('Error generating invoice:', error);
      toast({
        title: "Generation Failed",
        description: "Failed to generate invoice. Please try again.",
        variant: "destructive",
      });
      throw error;
    } finally {
      setGenerating(false);
    }
  };

  const downloadInvoice = async (invoice: Invoice) => {
    try {
      const { data, error } = await supabase.storage
        .from('invoices')
        .download(invoice.file_path);

      if (error) {
        throw error;
      }

      // Create download link
      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = invoice.file_name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      // Update download count
      await supabase
        .from('invoices')
        .update({ download_count: invoice.download_count + 1 })
        .eq('id', invoice.id);

      toast({
        title: "Downloaded",
        description: "Invoice downloaded successfully.",
      });

    } catch (error) {
      console.error('Error downloading invoice:', error);
      toast({
        title: "Download Failed",
        description: "Failed to download invoice. Please try again.",
        variant: "destructive",
      });
    }
  };

  const getAvailableInvoice = (orderId: string): Invoice | null => {
    const orderInvoices = invoices.filter(inv => inv.order_id === orderId);
    if (orderInvoices.length === 0) return null;
    
    // Return the most recent non-expired invoice
    const validInvoices = orderInvoices.filter(inv => 
      new Date(inv.expires_at) > new Date()
    );
    
    return validInvoices.length > 0 ? validInvoices[0] : null;
  };

  const isInvoiceExpired = (invoice: Invoice): boolean => {
    return new Date(invoice.expires_at) <= new Date();
  };

  const canGenerateInvoice = (orderStatus: string, paymentStatus: string): boolean => {
    return orderStatus === 'delivered' || paymentStatus === 'completed';
  };

  useEffect(() => {
    if (orderId) {
      fetchInvoices();
    }
  }, [orderId, user?.id]);

  return {
    invoices,
    loading,
    generating,
    generateInvoice,
    downloadInvoice,
    getAvailableInvoice,
    isInvoiceExpired,
    canGenerateInvoice,
    refetch: fetchInvoices
  };
};