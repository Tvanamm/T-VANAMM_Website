
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit, Pause, Play, Trash2 } from 'lucide-react';

interface FranchiseMember {
  id: string;
  name?: string;
  position: string;
  franchise_location: string;
  email?: string;
  phone?: string;
  location_details?: string;
  status: string;
}

interface FranchiseMembersListProps {
  members: FranchiseMember[];
  onMemberAction: (memberId: string, action: string) => void;
}

export const FranchiseMembersList = ({ members, onMemberAction }: FranchiseMembersListProps) => {
  return (
    <CardContent>
      <div className="space-y-4">
        {members.length === 0 ? (
          <p className="text-center text-gray-500 py-8">No franchise members found. Add some to get started!</p>
        ) : (
          members.map((member) => (
            <div key={member.id} className="flex items-center justify-between p-4 border rounded-lg bg-gray-50">
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <h4 className="font-semibold">{member.name || 'Franchise Member'}</h4>
                  <Badge variant={member.status === 'active' ? 'default' : 'secondary'}>
                    {member.status}
                  </Badge>
                </div>
                <p className="text-sm text-gray-600">{member.position} at {member.franchise_location}</p>
                <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
                  <span>{member.email || 'No email'}</span>
                  <span>{member.phone || 'No phone'}</span>
                </div>
                {member.location_details && (
                  <p className="text-xs text-gray-500 mt-1">{member.location_details}</p>
                )}
              </div>
              <div className="flex gap-2">
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => onMemberAction(member.id, 'edit')}
                >
                  <Edit className="h-3 w-3" />
                </Button>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => onMemberAction(member.id, 'toggle-status')}
                >
                  {member.status === 'active' ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
                </Button>
                <Button 
                  size="sm" 
                  variant="destructive"
                  onClick={() => onMemberAction(member.id, 'delete')}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
    </CardContent>
  );
};
