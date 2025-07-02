
import { useWebsiteAnalytics } from './useWebsiteAnalytics';
import { useFormSubmissions } from './useFormSubmissions';
import { useRevenueAnalytics } from './useRevenueAnalytics';
import { useRealTimeAnalytics } from './useRealTimeAnalytics';
import { useToast } from './use-toast';

export const useReportGeneration = () => {
  const { websiteVisits, newsletterSignups, userEngagement } = useWebsiteAnalytics();
  const { formSubmissions } = useFormSubmissions();
  const { revenueTrends, totalRevenue, totalOrders } = useRevenueAnalytics();
  const { analytics } = useRealTimeAnalytics();
  const { toast } = useToast();

  const generateComprehensiveReport = () => {
    const reportData = {
      generated_at: new Date().toISOString(),
      report_type: 'comprehensive_analytics',
      summary: {
        total_website_visits: 0, // Removed websiteVisits reference
        total_form_submissions: analytics.formSubmissions,
        total_newsletter_signups: analytics.newsletterSignups,
        total_revenue: totalRevenue,
        total_orders: totalOrders,
        conversion_rate: analytics.conversionRate,
        bounce_rate: analytics.bounceRate,
        avg_session_duration: analytics.avgSessionDuration
      },
      detailed_data: {
        website_visits: websiteVisits,
        form_submissions: formSubmissions,
        newsletter_signups: newsletterSignups,
        revenue_trends: revenueTrends,
        user_engagement: userEngagement
      },
      analytics_metrics: analytics
    };

    try {
      const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `comprehensive-analytics-report-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: "Report Generated",
        description: "Comprehensive analytics report has been downloaded successfully.",
      });

      return true;
    } catch (error) {
      toast({
        title: "Report Generation Failed",
        description: "Failed to generate the analytics report.",
        variant: "destructive"
      });
      return false;
    }
  };

  const generateCSVReport = () => {
    try {
      // Create CSV content for form submissions
      const csvContent = [
        // Headers
        ['Name', 'Email', 'Phone', 'Type', 'Status', 'Location', 'Investment', 'Experience', 'Date'].join(','),
        // Data rows
        ...formSubmissions.map(submission => [
          submission.name || '',
          submission.email || '',
          submission.phone || '',
          submission.type || '',
          submission.status || '',
          submission.franchise_location || '',
          submission.investment_amount || '',
          submission.experience_years || '',
          new Date(submission.created_at).toLocaleDateString()
        ].join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `form-submissions-report-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: "CSV Report Generated",
        description: "Form submissions CSV report has been downloaded.",
      });

      return true;
    } catch (error) {
      toast({
        title: "CSV Generation Failed",
        description: "Failed to generate the CSV report.",
        variant: "destructive"
      });
      return false;
    }
  };

  return {
    generateComprehensiveReport,
    generateCSVReport
  };
};
