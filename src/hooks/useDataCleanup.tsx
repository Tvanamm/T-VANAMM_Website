
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useDataCleanup = () => {
  const { toast } = useToast();
  const [cleanupLogs, setCleanupLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCleanupLogs = async () => {
    try {
      const { data, error } = await supabase
        .from('cleanup_logs')
        .select('*')
        .order('cleanup_date', { ascending: false })
        .limit(10);

      if (error) throw error;
      setCleanupLogs(data || []);
    } catch (error) {
      console.error('Error fetching cleanup logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const runManualCleanup = async () => {
    try {
      toast({
        title: "Starting Data Cleanup...",
        description: "This may take a few moments",
      });

      const { data, error } = await supabase.functions.invoke('cleanup-old-data');

      if (error) throw error;

      toast({
        title: "Cleanup Completed! 🧹",
        description: data.message || "Data cleanup completed successfully",
      });

      // Refresh logs
      await fetchCleanupLogs();
      
      return data;
    } catch (error) {
      console.error('Manual cleanup error:', error);
      toast({
        title: "Cleanup Failed",
        description: error.message || "Failed to run data cleanup",
        variant: "destructive"
      });
      throw error;
    }
  };

  useEffect(() => {
    fetchCleanupLogs();
  }, []);

  return {
    cleanupLogs,
    loading,
    runManualCleanup,
    refetch: fetchCleanupLogs
  };
};
