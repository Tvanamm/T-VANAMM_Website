
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  Download,
  FileText,
  Table,
  Calendar,
  Filter
} from 'lucide-react';

interface ExportDataModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'forms' | 'orders';
  title: string;
}

const ExportDataModal: React.FC<ExportDataModalProps> = ({
  isOpen,
  onClose,
  type,
  title
}) => {
  const { toast } = useToast();
  const [step, setStep] = useState<'filters' | 'format'>('filters');
  const [isExporting, setIsExporting] = useState(false);
  const [exportConfig, setExportConfig] = useState({
    startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    formTypeFilter: type === 'forms' ? 'all' : undefined,
    statusFilter: type === 'orders' ? 'all' : undefined,
    franchiseFilter: type === 'orders' ? '' : undefined
  });
  const [selectedFormat, setSelectedFormat] = useState<'pdf' | 'excel'>('excel');

  const validateDateRange = () => {
    const start = new Date(exportConfig.startDate);
    const end = new Date(exportConfig.endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays > 30) {
      toast({
        title: "Invalid Date Range",
        description: "Date range cannot exceed 30 days",
        variant: "destructive"
      });
      return false;
    }
    
    if (start > end) {
      toast({
        title: "Invalid Date Range",
        description: "Start date cannot be after end date",
        variant: "destructive"
      });
      return false;
    }
    
    return true;
  };

  const handleNext = () => {
    if (!validateDateRange()) return;
    setStep('format');
  };

  const exportData = async () => {
    setIsExporting(true);
    
    try {
      let data;
      let filename;
      
      if (type === 'forms') {
        const { data: formsData, error } = await supabase.rpc('export_forms_data', {
          start_date: exportConfig.startDate,
          end_date: exportConfig.endDate,
          form_type_filter: exportConfig.formTypeFilter === 'all' ? null : exportConfig.formTypeFilter
        });
        
        if (error) throw error;
        data = formsData;
        filename = `forms_${exportConfig.startDate}_to_${exportConfig.endDate}`;
      } else {
        const { data: ordersData, error } = await supabase.rpc('export_orders_data', {
          start_date: exportConfig.startDate,
          end_date: exportConfig.endDate,
          status_filter: exportConfig.statusFilter === 'all' ? null : exportConfig.statusFilter,
          franchise_filter: exportConfig.franchiseFilter || null
        });
        
        if (error) throw error;
        data = ordersData;
        filename = `orders_${exportConfig.startDate}_to_${exportConfig.endDate}`;
      }
      
      if (!data || data.length === 0) {
        toast({
          title: "No Data Found",
          description: "No data available for the selected criteria",
          variant: "destructive"
        });
        return;
      }
      
      if (selectedFormat === 'excel') {
        await exportToExcel(data, filename);
      } else {
        await exportToPDF(data, filename, type);
      }
      
      // Log the export
      await supabase
        .from('export_logs')
        .insert([{
          user_id: (await supabase.auth.getUser()).data.user?.id,
          export_type: type,
          format: selectedFormat,
          date_range_start: exportConfig.startDate,
          date_range_end: exportConfig.endDate,
          filters: {
            formType: exportConfig.formTypeFilter === 'all' ? null : exportConfig.formTypeFilter,
            status: exportConfig.statusFilter === 'all' ? null : exportConfig.statusFilter,
            franchise: exportConfig.franchiseFilter
          },
          record_count: data.length
        }]);
      
      toast({
        title: "Export Successful! 📊",
        description: `${data.length} records exported successfully`
      });
      
      onClose();
      setStep('filters');
    } catch (error: any) {
      console.error('Export error:', error);
      toast({
        title: "Export Failed",
        description: error.message || "Failed to export data",
        variant: "destructive"
      });
    } finally {
      setIsExporting(false);
    }
  };

  const exportToExcel = async (data: any[], filename: string) => {
    if (data.length === 0) return;
    
    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map(row => 
        headers.map(header => {
          const value = row[header];
          if (value === null || value === undefined) return '';
          if (typeof value === 'object') return JSON.stringify(value);
          return `"${value.toString().replace(/"/g, '""')}"`;
        }).join(',')
      )
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportToPDF = async (data: any[], filename: string, type: string) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>${title} Export</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            h1 { color: #059669; margin-bottom: 20px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; font-size: 12px; }
            th { background-color: #f2f2f2; font-weight: bold; }
            tr:nth-child(even) { background-color: #f9f9f9; }
            .export-info { margin-bottom: 20px; font-size: 14px; color: #666; }
          </style>
        </head>
        <body>
          <h1>${title} Export Report</h1>
          <div class="export-info">
            <p><strong>Export Date:</strong> ${new Date().toLocaleDateString()}</p>
            <p><strong>Date Range:</strong> ${exportConfig.startDate} to ${exportConfig.endDate}</p>
            <p><strong>Total Records:</strong> ${data.length}</p>
          </div>
          <table>
            <thead>
              <tr>
                ${Object.keys(data[0]).map(key => `<th>${key.replace(/_/g, ' ').toUpperCase()}</th>`).join('')}
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
    
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 1000);
  };

  const handleClose = () => {
    onClose();
    setStep('filters');
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Export {title}
          </DialogTitle>
        </DialogHeader>

        {step === 'filters' && (
          <div className="space-y-4">
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Note:</strong> Maximum date range is 30 days for performance reasons.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="startDate">Start Date</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={exportConfig.startDate}
                  onChange={(e) => setExportConfig(prev => ({ ...prev, startDate: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="endDate">End Date</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={exportConfig.endDate}
                  onChange={(e) => setExportConfig(prev => ({ ...prev, endDate: e.target.value }))}
                />
              </div>
            </div>

            {type === 'forms' && (
              <div>
                <Label htmlFor="formType">Form Type Filter</Label>
                <Select
                  value={exportConfig.formTypeFilter}
                  onValueChange={(value) => setExportConfig(prev => ({ ...prev, formTypeFilter: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All form types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="franchise">Franchise Enquiries</SelectItem>
                    <SelectItem value="contact">Contact Forms</SelectItem>
                    <SelectItem value="catalog">Catalog Requests</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {type === 'orders' && (
              <>
                <div>
                  <Label htmlFor="statusFilter">Status Filter</Label>
                  <Select
                    value={exportConfig.statusFilter}
                    onValueChange={(value) => setExportConfig(prev => ({ ...prev, statusFilter: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All statuses" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="confirmed">Confirmed</SelectItem>
                      <SelectItem value="paid">Paid</SelectItem>
                      <SelectItem value="packing">Packing</SelectItem>
                      <SelectItem value="shipped">Shipped</SelectItem>
                      <SelectItem value="delivered">Delivered</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="franchiseFilter">Franchise Filter</Label>
                  <Input
                    id="franchiseFilter"
                    placeholder="Enter franchise name to filter"
                    value={exportConfig.franchiseFilter}
                    onChange={(e) => setExportConfig(prev => ({ ...prev, franchiseFilter: e.target.value }))}
                  />
                </div>
              </>
            )}

            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button onClick={handleNext} className="bg-emerald-600 hover:bg-emerald-700">
                Next: Choose Format
              </Button>
            </div>
          </div>
        )}

        {step === 'format' && (
          <div className="space-y-4">
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-4">Choose Export Format</h3>
              <div className="grid grid-cols-2 gap-4">
                <div
                  className={`border-2 rounded-lg p-4 cursor-pointer transition-colors ${
                    selectedFormat === 'excel' 
                      ? 'border-emerald-500 bg-emerald-50' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setSelectedFormat('excel')}
                >
                  <Table className="h-8 w-8 mx-auto mb-2 text-green-600" />
                  <p className="font-medium">Excel/CSV</p>
                  <p className="text-sm text-gray-500">Spreadsheet format</p>
                </div>
                <div
                  className={`border-2 rounded-lg p-4 cursor-pointer transition-colors ${
                    selectedFormat === 'pdf' 
                      ? 'border-emerald-500 bg-emerald-50' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setSelectedFormat('pdf')}
                >
                  <FileText className="h-8 w-8 mx-auto mb-2 text-red-600" />
                  <p className="font-medium">PDF Report</p>
                  <p className="text-sm text-gray-500">Printable document</p>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setStep('filters')}>
                Back
              </Button>
              <Button
                onClick={exportData}
                disabled={isExporting}
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                {isExporting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Exporting...
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4 mr-2" />
                    Export as {selectedFormat.toUpperCase()}
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ExportDataModal;
