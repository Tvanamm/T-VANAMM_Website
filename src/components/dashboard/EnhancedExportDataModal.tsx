
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  Download, 
  FileText, 
  FileSpreadsheet,
  Calendar,
  Filter,
  Database
} from 'lucide-react';

interface EnhancedExportDataModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const EnhancedExportDataModal: React.FC<EnhancedExportDataModalProps> = ({
  isOpen,
  onClose
}) => {
  const { toast } = useToast();
  const [exportType, setExportType] = useState<string>('');
  const [format, setFormat] = useState<string>('');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [franchiseFilter, setFranchiseFilter] = useState<string>('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const generateExport = async () => {
    if (!exportType || !format) {
      toast({
        title: "Missing Information",
        description: "Please select export type and format",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      let data: any[] = [];
      let filename = '';

      if (exportType === 'orders') {
        const { data: ordersData, error } = await supabase.rpc('export_orders_data', {
          start_date: startDate || null,
          end_date: endDate || null,
          status_filter: statusFilter === 'all' ? null : statusFilter,
          franchise_filter: franchiseFilter || null
        });

        if (error) throw error;
        data = ordersData || [];
        filename = `orders-export-${new Date().toISOString().split('T')[0]}`;
      } else if (exportType === 'forms') {
        const { data: formsData, error } = await supabase.rpc('export_forms_data', {
          start_date: startDate || null,
          end_date: endDate || null,
          form_type_filter: statusFilter === 'all' ? null : statusFilter
        });

        if (error) throw error;
        data = formsData || [];
        filename = `forms-export-${new Date().toISOString().split('T')[0]}`;
      }

      if (data.length === 0) {
        toast({
          title: "No Data Found",
          description: "No records match the selected criteria",
          variant: "destructive"
        });
        return;
      }

      if (format === 'excel') {
        await downloadAsExcel(data, filename);
      } else if (format === 'pdf') {
        await downloadAsPDF(data, filename, exportType);
      }

      toast({
        title: "Export Successful",
        description: `${data.length} records exported successfully`,
      });

      onClose();
    } catch (error: any) {
      console.error('Export error:', error);
      toast({
        title: "Export Failed",
        description: error.message || "Failed to export data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const downloadAsExcel = async (data: any[], filename: string) => {
    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map(row => 
        headers.map(header => {
          const value = row[header];
          const stringValue = value?.toString() || '';
          return stringValue.includes(',') ? `"${stringValue}"` : stringValue;
        }).join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${filename}.csv`;
    link.click();
    URL.revokeObjectURL(link.href);
  };

  const downloadAsPDF = async (data: any[], filename: string, type: string) => {
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>${type} Export</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 12px; }
          th, td { border: 1px solid #ddd; padding: 6px; text-align: left; }
          th { background-color: #f2f2f2; font-weight: bold; }
          .header { text-align: center; margin-bottom: 20px; }
          @media print { body { margin: 0; } }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>TVANAMM ${type.toUpperCase()} Export</h1>
          <p>Generated on: ${new Date().toLocaleDateString()}</p>
          <p>Total Records: ${data.length}</p>
        </div>
        <table>
          <thead>
            <tr>
              ${Object.keys(data[0] || {}).map(key => `<th>${key.replace(/_/g, ' ').toUpperCase()}</th>`).join('')}
            </tr>
          </thead>
          <tbody>
            ${data.map(row => `
              <tr>
                ${Object.values(row).map(value => `<td>${value || ''}</td>`).join('')}
              </tr>
            `).join('')}
          </tbody>
        </table>
      </body>
      </html>
    `;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(htmlContent);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 250);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-full max-w-2xl mx-4">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Enhanced Data Export
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="exportType">Export Type</Label>
              <Select value={exportType} onValueChange={setExportType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select data type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="orders">Franchise Orders</SelectItem>
                  <SelectItem value="forms">Form Submissions</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="format">Export Format</Label>
              <Select value={format} onValueChange={setFormat}>
                <SelectTrigger>
                  <SelectValue placeholder="Select format" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="excel">
                    <div className="flex items-center gap-2">
                      <FileSpreadsheet className="h-4 w-4" />
                      Excel (CSV)
                    </div>
                  </SelectItem>
                  <SelectItem value="pdf">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      PDF Report
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <Label>Date Range (Optional)</Label>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="startDate">Start Date</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="endDate">End Date</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              <Label>Filters (Optional)</Label>
            </div>
            
            {exportType === 'orders' && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="statusFilter">Order Status</Label>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="All statuses" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="confirmed">Confirmed</SelectItem>
                      <SelectItem value="paid">Paid</SelectItem>
                      <SelectItem value="packing">Packing</SelectItem>
                      <SelectItem value="packed">Packed</SelectItem>
                      <SelectItem value="shipped">Shipped</SelectItem>
                      <SelectItem value="delivered">Delivered</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="franchiseFilter">Franchise Name</Label>
                  <Input
                    id="franchiseFilter"
                    placeholder="Filter by franchise name"
                    value={franchiseFilter}
                    onChange={(e) => setFranchiseFilter(e.target.value)}
                  />
                </div>
              </div>
            )}

            {exportType === 'forms' && (
              <div>
                <Label htmlFor="statusFilter">Form Type</Label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="contact">Contact</SelectItem>
                    <SelectItem value="franchise">Franchise</SelectItem>
                    <SelectItem value="catalog">Catalog</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          <Alert>
            <Database className="h-4 w-4" />
            <AlertDescription>
              Export range is limited to 30 days for performance. Data is automatically cleaned up after 30 days for optimal performance.
            </AlertDescription>
          </Alert>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button onClick={generateExport} disabled={loading}>
              {loading ? 'Exporting...' : 'Export Data'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EnhancedExportDataModal;
