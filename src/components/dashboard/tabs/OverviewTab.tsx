
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TrendingUp, Package, Users, DollarSign, Activity, Download, Settings } from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer
} from 'recharts';
import QuickStats from '@/components/dashboard/QuickStats';
import EnhancedSendNotificationModal from '@/components/dashboard/EnhancedSendNotificationModal';
import RealTimeAnalyticsCards from '@/components/analytics/RealTimeAnalyticsCards';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import jsPDF from 'jspdf';

interface OverviewTabProps {
  chartData: any;
  analytics: any;
  onQuickAction: (action: string) => void;
}

const OverviewTab: React.FC<OverviewTabProps> = ({ chartData, analytics, onQuickAction }) => {
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [generatingReport, setGeneratingReport] = useState(false);
  const { toast } = useToast();

  const handleQuickAction = (action: string) => {
    if (action === 'send-notifications') {
      setShowNotificationModal(true);
    } else if (action === 'generate-report') {
      generatePDFReport();
    } else if (action === 'system-settings') {
      handleSystemSettings();
    } else {
      onQuickAction(action);
    }
  };

  const generatePDFReport = async () => {
    setGeneratingReport(true);
    try {
      // Fetch latest data for report
      const [inventoryData, ordersData, usersData, visitsData] = await Promise.allSettled([
        supabase.from('inventory').select('*'),
        supabase.from('franchise_orders').select('*'),
        supabase.from('profiles').select('*'),
        supabase.from('website_visits').select('*', { count: 'exact', head: true })
      ]);

      const inventory = inventoryData.status === 'fulfilled' ? inventoryData.value.data || [] : [];
      const orders = ordersData.status === 'fulfilled' ? ordersData.value.data || [] : [];
      const users = usersData.status === 'fulfilled' ? usersData.value.data || [] : [];
      const visits = visitsData.status === 'fulfilled' ? visitsData.value.count || 0 : 0;

      // Create PDF
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.width;
      
      // Header
      doc.setFontSize(20);
      doc.setFont('helvetica', 'bold');
      doc.text('Business Analytics Report', pageWidth / 2, 20, { align: 'center' });
      
      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      doc.text(`Generated on: ${new Date().toLocaleDateString()}`, pageWidth / 2, 30, { align: 'center' });
      
      // Summary Statistics
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('Executive Summary', 20, 50);
      
      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      
      const confirmedOrders = orders.filter(order => ['confirmed', 'completed', 'delivered'].includes(order.status));
      const totalRevenue = confirmedOrders.reduce((sum, order) => sum + (order.total_amount || 0), 0);
      
      const summaryData = [
        `Total Website Visits: ${visits}`,
        `Total Users: ${users.length}`,
        `Total Inventory Items: ${inventory.length}`,
        `Total Orders: ${orders.length}`,
        `Confirmed Orders: ${confirmedOrders.length}`,
        `Total Revenue: ₹${totalRevenue.toLocaleString()}`,
        `Inventory Value: ₹${inventory.reduce((sum, item) => sum + (item.stock * item.price), 0).toLocaleString()}`
      ];
      
      summaryData.forEach((item, index) => {
        doc.text(item, 20, 65 + (index * 8));
      });
      
      // Save PDF
      doc.save(`business-report-${new Date().toISOString().split('T')[0]}.pdf`);
      
      toast({
        title: "Success",
        description: "Real-time business report downloaded successfully",
      });
      
    } catch (error) {
      console.error('Error generating report:', error);
      toast({
        title: "Error",
        description: "Failed to generate report",
        variant: "destructive"
      });
    } finally {
      setGeneratingReport(false);
    }
  };

  const handleSystemSettings = () => {
    toast({
      title: "System Settings",
      description: "Opening system configuration panel...",
    });
  };

  return (
    <div className="space-y-6">
      {/* Real-time Analytics Cards */}
      <RealTimeAnalyticsCards />

      {/* Quick Actions Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Quick Actions
          </CardTitle>
          <CardDescription>Manage your business efficiently with real-time data</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Button variant="outline" onClick={() => handleQuickAction('send-notifications')} className="h-16 flex-col">
            <TrendingUp className="h-4 w-4 mb-2" />
            Send Notifications
          </Button>
          <Button variant="outline" onClick={() => handleQuickAction('add-product')} className="h-16 flex-col">
            <Package className="h-4 w-4 mb-2" />
            Add Product
          </Button>
          <Button 
            variant="outline" 
            onClick={() => handleQuickAction('generate-report')} 
            className="h-16 flex-col"
            disabled={generatingReport}
          >
            <Download className="h-4 w-4 mb-2" />
            {generatingReport ? 'Generating...' : 'Generate Report'}
          </Button>
          <Button variant="outline" onClick={() => handleQuickAction('system-settings')} className="h-16 flex-col">
            <Settings className="h-4 w-4 mb-2" />
            System Settings
          </Button>
        </CardContent>
      </Card>

      

      <EnhancedSendNotificationModal 
        open={showNotificationModal}
        onOpenChange={setShowNotificationModal}
      />
    </div>
  );
};

export default OverviewTab;
