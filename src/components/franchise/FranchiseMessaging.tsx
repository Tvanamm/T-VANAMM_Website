
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { useRealTimeFranchiseManagement } from '@/hooks/useRealTimeFranchiseManagement';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Send, MessageCircle, User } from 'lucide-react';

const FranchiseMessaging = () => {
  const { franchiseMembers } = useRealTimeFranchiseManagement();
  const { toast } = useToast();
  const [selectedMember, setSelectedMember] = useState<string | null>(null);
  const [messageTitle, setMessageTitle] = useState('');
  const [messageContent, setMessageContent] = useState('');
  const [sending, setSending] = useState(false);

  const sendMessage = async () => {
    if (!selectedMember || !messageTitle.trim() || !messageContent.trim()) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive"
      });
      return;
    }

    setSending(true);
    try {
      const member = franchiseMembers.find(m => m.id === selectedMember);
      
      const { error } = await supabase
        .from('notifications')
        .insert({
          type: 'franchise_message',
          title: messageTitle,
          message: messageContent,
          user_id: member?.user_id,
          data: {
            from: 'management',
            franchise_member_id: selectedMember,
            franchise_name: member?.franchise_location,
            priority: 'normal'
          }
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: `Message sent to ${member?.name}`,
      });

      // Reset form
      setMessageTitle('');
      setMessageContent('');
      setSelectedMember(null);
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive"
      });
    } finally {
      setSending(false);
    }
  };

  const selectedMemberData = franchiseMembers.find(m => m.id === selectedMember);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageCircle className="h-5 w-5" />
          Send Message to Franchise Member
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="text-sm font-medium mb-2 block">Select Franchise Member</label>
          <div className="grid grid-cols-1 gap-2 max-h-40 overflow-y-auto">
            {franchiseMembers.map((member) => (
              <div
                key={member.id}
                className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                  selectedMember === member.id
                    ? 'border-emerald-500 bg-emerald-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setSelectedMember(member.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <User className="h-4 w-4 text-gray-500" />
                    <div>
                      <p className="font-medium">{member.name}</p>
                      <p className="text-sm text-gray-600">{member.franchise_location}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {member.tvanamm_id && (
                      <Badge variant="outline">ID: {member.tvanamm_id}</Badge>
                    )}
                    <Badge className={
                      member.status === 'verified' 
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }>
                      {member.status}
                    </Badge>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {selectedMember && (
          <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-emerald-600" />
              <span className="font-medium">Sending to: {selectedMemberData?.name}</span>
              <Badge variant="outline">{selectedMemberData?.franchise_location}</Badge>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Message Title</label>
              <Input
                value={messageTitle}
                onChange={(e) => setMessageTitle(e.target.value)}
                placeholder="Enter message title..."
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Message Content</label>
              <Textarea
                value={messageContent}
                onChange={(e) => setMessageContent(e.target.value)}
                placeholder="Enter your message..."
                rows={4}
              />
            </div>

            <div className="flex gap-2">
              <Button
                onClick={sendMessage}
                disabled={sending}
                className="flex-1"
              >
                {sending ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                ) : (
                  <Send className="h-4 w-4 mr-2" />
                )}
                Send Message
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setSelectedMember(null);
                  setMessageTitle('');
                  setMessageContent('');
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default FranchiseMessaging;
