
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface FormSubmission {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  message: string | null;
  type: string;
  status: string;
  franchise_location: string | null;
  investment_amount: number | null;
  catalog_requested: boolean;
  created_at: string;
  updated_at: string;
  contacted_at: string | null;
  contact_notes: string | null;
  converted_at: string | null;
}

interface FormFollowUp {
  id: string;
  form_submission_id: string;
  follow_up_type: string;
  notes: string | null;
  scheduled_date: string | null;
  completed_at: string | null;
  created_by: string | null;
  created_at: string;
}

export const useEnhancedFormSubmissions = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [submissions, setSubmissions] = useState<FormSubmission[]>([]);
  const [followUps, setFollowUps] = useState<FormFollowUp[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<Set<string>>(new Set());

  const fetchSubmissions = useCallback(async () => {
    if (!user || !['owner', 'admin'].includes(user.role)) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('form_submissions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSubmissions(data || []);
    } catch (error) {
      console.error('Error fetching form submissions:', error);
      toast({
        title: "Error",
        description: "Failed to load form submissions",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [user, toast]);

  const fetchFollowUps = useCallback(async () => {
    if (!user || !['owner', 'admin'].includes(user.role)) return;

    try {
      const { data, error } = await supabase
        .from('form_follow_ups')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setFollowUps(data || []);
    } catch (error) {
      console.error('Error fetching follow ups:', error);
    }
  }, [user]);

  const markAsContacted = async (submissionId: string, notes?: string) => {
    if (!user || !['owner', 'admin'].includes(user.role)) {
      toast({
        title: "Permission Denied",
        description: "Only owners and admins can update form submissions",
        variant: "destructive"
      });
      return false;
    }

    setUpdating(prev => new Set(prev).add(submissionId));

    try {
      const now = new Date().toISOString();
      
      const { error } = await supabase
        .from('form_submissions')
        .update({
          status: 'contacted',
          contacted_at: now,
          contact_notes: notes || null,
          updated_at: now
        })
        .eq('id', submissionId);

      if (error) throw error;

      // Add follow-up record
      if (notes) {
        await supabase
          .from('form_follow_ups')
          .insert({
            form_submission_id: submissionId,
            follow_up_type: 'call',
            notes: notes,
            created_by: user.id,
            completed_at: now
          });
      }

      toast({
        title: "Success",
        description: "Form marked as contacted successfully",
      });

      await fetchSubmissions();
      await fetchFollowUps();
      return true;
    } catch (error: any) {
      console.error('Error marking as contacted:', error);
      toast({
        title: "Error",
        description: `Failed to update: ${error.message}`,
        variant: "destructive"
      });
      return false;
    } finally {
      setUpdating(prev => {
        const newSet = new Set(prev);
        newSet.delete(submissionId);
        return newSet;
      });
    }
  };

  const markAsConverted = async (submissionId: string, notes?: string) => {
    if (!user || !['owner', 'admin'].includes(user.role)) {
      toast({
        title: "Permission Denied",
        description: "Only owners and admins can update form submissions",
        variant: "destructive"
      });
      return false;
    }

    setUpdating(prev => new Set(prev).add(submissionId));

    try {
      const now = new Date().toISOString();
      
      const { error } = await supabase
        .from('form_submissions')
        .update({
          status: 'converted',
          converted_at: now,
          contact_notes: notes || null,
          updated_at: now
        })
        .eq('id', submissionId);

      if (error) throw error;

      // Add follow-up record
      if (notes) {
        await supabase
          .from('form_follow_ups')
          .insert({
            form_submission_id: submissionId,
            follow_up_type: 'conversion',
            notes: notes,
            created_by: user.id,
            completed_at: now
          });
      }

      toast({
        title: "Success",
        description: "Form marked as converted successfully",
      });

      await fetchSubmissions();
      await fetchFollowUps();
      return true;
    } catch (error: any) {
      console.error('Error marking as converted:', error);
      toast({
        title: "Error",
        description: `Failed to update: ${error.message}`,
        variant: "destructive"
      });
      return false;
    } finally {
      setUpdating(prev => {
        const newSet = new Set(prev);
        newSet.delete(submissionId);
        return newSet;
      });
    }
  };

  const addFollowUp = async (submissionId: string, followUpData: {
    type: string;
    notes: string;
    scheduledDate?: string;
  }) => {
    if (!user || !['owner', 'admin'].includes(user.role)) {
      toast({
        title: "Permission Denied",
        description: "Only owners and admins can add follow-ups",
        variant: "destructive"
      });
      return false;
    }

    try {
      const { error } = await supabase
        .from('form_follow_ups')
        .insert({
          form_submission_id: submissionId,
          follow_up_type: followUpData.type,
          notes: followUpData.notes,
          scheduled_date: followUpData.scheduledDate || null,
          created_by: user.id
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Follow-up added successfully",
      });

      await fetchFollowUps();
      return true;
    } catch (error: any) {
      console.error('Error adding follow-up:', error);
      toast({
        title: "Error",
        description: `Failed to add follow-up: ${error.message}`,
        variant: "destructive"
      });
      return false;
    }
  };

  const getSubmissionStats = () => {
    const total = submissions.length;
    const pending = submissions.filter(s => s.status === 'pending').length;
    const contacted = submissions.filter(s => s.status === 'contacted').length;
    const converted = submissions.filter(s => s.status === 'converted').length;
    const franchiseInquiries = submissions.filter(s => s.type === 'franchise').length;
    const catalogRequests = submissions.filter(s => s.catalog_requested).length;

    return {
      total,
      pending,
      contacted,
      converted,
      franchiseInquiries,
      catalogRequests,
      conversionRate: total > 0 ? Math.round((converted / total) * 100) : 0
    };
  };

  useEffect(() => {
    if (user && ['owner', 'admin'].includes(user.role)) {
      fetchSubmissions();
      fetchFollowUps();

      // Set up real-time subscription
      const channel = supabase
        .channel('form_submissions_enhanced')
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'form_submissions'
        }, () => {
          fetchSubmissions();
        })
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'form_follow_ups'
        }, () => {
          fetchFollowUps();
        })
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user, fetchSubmissions, fetchFollowUps]);

  return {
    submissions,
    followUps,
    loading,
    updating,
    markAsContacted,
    markAsConverted,
    addFollowUp,
    getSubmissionStats,
    refetch: fetchSubmissions
  };
};
