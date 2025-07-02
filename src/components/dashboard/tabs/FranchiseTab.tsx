import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import FranchiseVerificationPanel from '@/components/franchise/FranchiseVerificationPanel';
import FranchiseMessaging from '@/components/franchise/FranchiseMessaging';
import { MessageCircle, Users, Star } from 'lucide-react';
import AdminLoyaltyManagement from '@/components/admin/AdminLoyaltyManagement';

interface FranchiseTabProps {
  onBranchAction?: () => void;
}

const FranchiseTab: React.FC<FranchiseTabProps> = ({ onBranchAction }) => {
  return (
    <Tabs defaultValue="management" className="space-y-4">
      <TabsList>
        <TabsTrigger value="management" className="flex items-center gap-2">
          <Users className="h-4 w-4" />
          Franchise Management
        </TabsTrigger>
        <TabsTrigger value="messaging" className="flex items-center gap-2">
          <MessageCircle className="h-4 w-4" />
          Send Messages
        </TabsTrigger>
        <TabsTrigger value="loyalty" className="flex items-center gap-2">
          <Star className="h-4 w-4" />
          Loyalty Points
        </TabsTrigger>
      </TabsList>

      <TabsContent value="management">
        <FranchiseVerificationPanel />
      </TabsContent>

      <TabsContent value="messaging">
        <FranchiseMessaging />
      </TabsContent>

      <TabsContent value="loyalty">
        <AdminLoyaltyManagement />
      </TabsContent>
    </Tabs>
  );
};

export default FranchiseTab;
