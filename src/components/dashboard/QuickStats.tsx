
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Target } from 'lucide-react';

interface QuickStatsProps {
  analytics: {
    conversionRate: number;
    formSubmissions: number;
    newsletterSignups: number;
    contactFormFills: number;
    avgSessionDuration: number;
  };
}

const QuickStats = ({ analytics }: QuickStatsProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5 text-orange-600" />
          Quick Business Stats
        </CardTitle>
        <CardDescription>Real-time business metrics</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Conversion Rate</span>
          <div className="flex items-center gap-2">
            <Progress value={analytics.conversionRate} className="w-20" />
            <span className="text-sm font-semibold">{analytics.conversionRate}%</span>
          </div>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Total Form Submissions</span>
          <span className="text-lg font-bold text-blue-600">{analytics.formSubmissions}</span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Contact Form Submissions</span>
          <span className="text-lg font-bold text-emerald-600">{analytics.contactFormFills}</span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Newsletter Signups</span>
          <span className="text-lg font-bold text-purple-600">{analytics.newsletterSignups}</span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Avg Session Duration</span>
          <span className="text-lg font-bold text-orange-600">{Math.round(analytics.avgSessionDuration)}s</span>
        </div>
      </CardContent>
    </Card>
  );
};

export default QuickStats;
