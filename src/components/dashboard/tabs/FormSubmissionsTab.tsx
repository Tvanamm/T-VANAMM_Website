
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useEnhancedFormSubmissions } from '@/hooks/useEnhancedFormSubmissions';
import { 
  MessageSquare, 
  Phone, 
  Mail, 
  CheckCircle, 
  Clock, 
  TrendingUp,
  FileText,
  Calendar,
  MapPin,
  DollarSign,
  Download
} from 'lucide-react';
import EnhancedExportDataModal from '../EnhancedExportDataModal';

const FormSubmissionsTab = () => {
  const { 
    submissions, 
    loading, 
    updating, 
    markAsContacted, 
    markAsConverted, 
    addFollowUp,
    getSubmissionStats 
  } = useEnhancedFormSubmissions();
  
  const [selectedSubmission, setSelectedSubmission] = useState<any>(null);
  const [contactNotes, setContactNotes] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showExportModal, setShowExportModal] = useState(false);

  const stats = getSubmissionStats();

  const filteredSubmissions = submissions.filter(submission => {
    const matchesSearch = submission.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         submission.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || submission.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'converted':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" />Converted</Badge>;
      case 'contacted':
        return <Badge className="bg-blue-100 text-blue-800"><Phone className="h-3 w-3 mr-1" />Contacted</Badge>;
      default:
        return <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
    }
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'franchise':
        return <Badge variant="outline" className="bg-purple-50 text-purple-700">Franchise</Badge>;
      case 'catalog':
        return <Badge variant="outline" className="bg-orange-50 text-orange-700">Catalog</Badge>;
      default:
        return <Badge variant="outline">Contact</Badge>;
    }
  };

  const handleMarkAsContacted = async () => {
    if (!selectedSubmission) return;
    
    const success = await markAsContacted(selectedSubmission.id, contactNotes);
    if (success) {
      setSelectedSubmission(null);
      setContactNotes('');
    }
  };

  const handleMarkAsConverted = async () => {
    if (!selectedSubmission) return;
    
    const success = await markAsConverted(selectedSubmission.id, contactNotes);
    if (success) {
      setSelectedSubmission(null);
      setContactNotes('');
    }
  };

  return (
    <div className="space-y-6">
      {/* Form Submission Stats */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <MessageSquare className="h-8 w-8 text-blue-600 mx-auto mb-2" />
            <h3 className="font-semibold text-blue-800">Total</h3>
            <p className="text-2xl font-bold text-blue-700">{stats.total}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <Clock className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
            <h3 className="font-semibold text-yellow-800">Pending</h3>
            <p className="text-2xl font-bold text-yellow-700">{stats.pending}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <Phone className="h-8 w-8 text-blue-600 mx-auto mb-2" />
            <h3 className="font-semibold text-blue-800">Contacted</h3>
            <p className="text-2xl font-bold text-blue-700">{stats.contacted}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <h3 className="font-semibold text-green-800">Converted</h3>
            <p className="text-2xl font-bold text-green-700">{stats.converted}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <FileText className="h-8 w-8 text-purple-600 mx-auto mb-2" />
            <h3 className="font-semibold text-purple-800">Franchise</h3>
            <p className="text-2xl font-bold text-purple-700">{stats.franchiseInquiries}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <TrendingUp className="h-8 w-8 text-emerald-600 mx-auto mb-2" />
            <h3 className="font-semibold text-emerald-800">Conv. Rate</h3>
            <p className="text-2xl font-bold text-emerald-700">{stats.conversionRate}%</p>
          </CardContent>
        </Card>
      </div>

      {/* Form Submissions Management */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Form Submissions
              <Badge variant="outline" className="ml-2">
                {filteredSubmissions.length} Submissions
              </Badge>
            </CardTitle>
            <Button 
              variant="outline" 
              onClick={() => setShowExportModal(true)}
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Export Data
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <Input
              placeholder="Search submissions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1"
            />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="contacted">Contacted</option>
              <option value="converted">Converted</option>
            </select>
          </div>

          {/* Submissions Table */}
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Contact Details</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Message</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      <div className="w-6 h-6 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                      Loading submissions...
                    </TableCell>
                  </TableRow>
                ) : filteredSubmissions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500">No form submissions found</p>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredSubmissions.map((submission) => (
                    <TableRow key={submission.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{submission.name}</div>
                          <div className="text-sm text-gray-600 flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            {submission.email}
                          </div>
                          {submission.phone && (
                            <div className="text-sm text-gray-600 flex items-center gap-1">
                              <Phone className="h-3 w-3" />
                              {submission.phone}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          {getTypeBadge(submission.type)}
                          {submission.catalog_requested && (
                            <Badge variant="outline" className="bg-orange-50 text-orange-600 text-xs">
                              Catalog
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="max-w-xs">
                          {submission.message && (
                            <p className="text-sm text-gray-600 truncate" title={submission.message}>
                              {submission.message}
                            </p>
                          )}
                          {submission.franchise_location && (
                            <div className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                              <MapPin className="h-3 w-3" />
                              {submission.franchise_location}
                            </div>
                          )}
                          {submission.investment_amount && (
                            <div className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                              <DollarSign className="h-3 w-3" />
                              ₹{submission.investment_amount.toLocaleString()}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(submission.status)}</TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>{new Date(submission.created_at).toLocaleDateString()}</div>
                          {submission.contacted_at && (
                            <div className="text-xs text-green-600">
                              Contacted: {new Date(submission.contacted_at).toLocaleDateString()}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {submission.status === 'pending' && (
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => setSelectedSubmission(submission)}
                                  disabled={updating.has(submission.id)}
                                >
                                  <Phone className="h-4 w-4 mr-1" />
                                  Contact
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Mark as Contacted</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4">
                                  <div>
                                    <p className="font-medium">{submission.name}</p>
                                    <p className="text-sm text-gray-600">{submission.email}</p>
                                  </div>
                                  <Textarea
                                    placeholder="Add contact notes..."
                                    value={contactNotes}
                                    onChange={(e) => setContactNotes(e.target.value)}
                                  />
                                  <div className="flex gap-2">
                                    <Button onClick={handleMarkAsContacted} className="flex-1">
                                      Mark as Contacted
                                    </Button>
                                  </div>
                                </div>
                              </DialogContent>
                            </Dialog>
                          )}
                          
                          {submission.status === 'contacted' && (
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => setSelectedSubmission(submission)}
                                  disabled={updating.has(submission.id)}
                                  className="bg-green-50 hover:bg-green-100 text-green-700"
                                >
                                  <CheckCircle className="h-4 w-4 mr-1" />
                                  Convert
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Mark as Converted</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4">
                                  <div>
                                    <p className="font-medium">{submission.name}</p>
                                    <p className="text-sm text-gray-600">{submission.email}</p>
                                  </div>
                                  <Textarea
                                    placeholder="Add conversion notes..."
                                    value={contactNotes}
                                    onChange={(e) => setContactNotes(e.target.value)}
                                  />
                                  <div className="flex gap-2">
                                    <Button onClick={handleMarkAsConverted} className="flex-1 bg-green-600 hover:bg-green-700">
                                      Mark as Converted
                                    </Button>
                                  </div>
                                </div>
                              </DialogContent>
                            </Dialog>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <EnhancedExportDataModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
      />
    </div>
  );
};

export default FormSubmissionsTab;
