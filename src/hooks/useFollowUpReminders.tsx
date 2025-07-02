
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface FollowUpReminder {
  id: string;
  form_submission_id: string;
  follow_up_type: string;
  scheduled_for: string;
  submission_name: string;
  submission_email: string;
  submission_type: string;
}

export const useFollowUpReminders = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [reminders, setReminders] = useState<FollowUpReminder[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPendingReminders = async () => {
    if (!user || user.role !== 'owner') {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase.rpc('get_pending_follow_ups');
      
      if (error) {
        console.error('Error fetching follow-ups:', error);
        return;
      }

      setReminders(data || []);
      
      // Show toast notification for urgent reminders
      const urgentReminders = data?.filter(reminder => 
        new Date(reminder.scheduled_for) <= new Date()
      ) || [];
      
      if (urgentReminders.length > 0) {
        toast({
          title: "Follow-up Reminders",
          description: `You have ${urgentReminders.length} pending follow-ups that need attention.`,
        });
      }
    } catch (error) {
      console.error('Error fetching pending reminders:', error);
    } finally {
      setLoading(false);
    }
  };

  const markReminderCompleted = async (reminderId: string) => {
    try {
      const { error } = await supabase
        .from('form_follow_ups')
        .update({ completed_at: new Date().toISOString() })
        .eq('id', reminderId);

      if (error) throw error;

      // Refresh reminders
      await fetchPendingReminders();
      
      toast({
        title: "Reminder Completed",
        description: "Follow-up reminder marked as completed.",
      });
    } catch (error) {
      console.error('Error marking reminder as completed:', error);
      toast({
        title: "Error",
        description: "Failed to update reminder. Please try again.",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    fetchPendingReminders();
    
    // Set up interval to check for reminders every 30 minutes
    const interval = setInterval(fetchPendingReminders, 30 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, [user]);

  return {
    reminders,
    loading,
    markReminderCompleted,
    refetch: fetchPendingReminders
  };
};
