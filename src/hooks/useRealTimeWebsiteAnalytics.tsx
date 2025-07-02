
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

export const useRealTimeWebsiteAnalytics = () => {
  const { user } = useAuth();
  const [websiteVisits, setWebsiteVisits] = useState(0);
  const [formSubmissions, setFormSubmissions] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = useCallback(async () => {
    if (!user || !['owner', 'admin'].includes(user.role)) {
      setLoading(false);
      return;
    }

    try {
      const [visitsResult, formsResult] = await Promise.allSettled([
        supabase.from('website_visits').select('*', { count: 'exact', head: true }),
        supabase.from('form_submissions').select('*', { count: 'exact', head: true })
      ]);

      if (visitsResult.status === 'fulfilled') {
        setWebsiteVisits(visitsResult.value.count || 0);
      }

      if (formsResult.status === 'fulfilled') {
        setFormSubmissions(formsResult.value.count || 0);
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Function to track a new website visit
  const trackVisit = useCallback(async (pageUrl: string) => {
    try {
      await supabase.rpc('track_website_visit', {
        page_url: pageUrl,
        visitor_ip: null,
        user_agent: navigator.userAgent,
        referrer: document.referrer || null
      });
    } catch (error) {
      console.error('Error tracking visit:', error);
    }
  }, []);

  useEffect(() => {
    fetchAnalytics();

    // Track current page visit
    trackVisit(window.location.pathname);

    if (user && ['owner', 'admin'].includes(user.role)) {
      // Set up real-time subscriptions
      const visitsChannel = supabase
        .channel('website_visits_analytics')
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'website_visits'
        }, fetchAnalytics)
        .subscribe();

      const formsChannel = supabase
        .channel('form_submissions_analytics')
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'form_submissions'
        }, fetchAnalytics)
        .subscribe();

      return () => {
        supabase.removeChannel(visitsChannel);
        supabase.removeChannel(formsChannel);
      };
    }
  }, [user, fetchAnalytics, trackVisit]);

  return {
    websiteVisits,
    formSubmissions,
    loading,
    refetch: fetchAnalytics,
    trackVisit
  };
};
