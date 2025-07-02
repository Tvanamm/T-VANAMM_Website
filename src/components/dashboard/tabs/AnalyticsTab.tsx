
import React from 'react';
import EnhancedRealTimeAnalytics from '@/components/analytics/EnhancedRealTimeAnalytics';

interface AnalyticsTabProps {
  analytics?: any;
}

const AnalyticsTab: React.FC<AnalyticsTabProps> = ({ analytics }) => {
  return (
    <div className="space-y-6">
      <EnhancedRealTimeAnalytics />
    </div>
  );
};

export default AnalyticsTab;
