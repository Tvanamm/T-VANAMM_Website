
import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus } from 'lucide-react';

interface NewMember {
  name: string;
  email: string;
  phone: string;
  position: string;
  franchise_location: string;
  location_details: string;
  status: string;
}

interface AddMemberDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  newMember: NewMember;
  setNewMember: React.Dispatch<React.SetStateAction<NewMember>>;
  onAddMember: () => void;
}

export const AddMemberDialog = ({ 
  open, 
  onOpenChange, 
  newMember, 
  setNewMember, 
  onAddMember 
}: AddMemberDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button className="bg-emerald-600 hover:bg-emerald-700">
          <Plus className="h-4 w-4 mr-2" />
          Add Member
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Franchise Member</DialogTitle>
          <DialogDescription>
            Add a new staff member to a franchise location
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Name *</Label>
            <Input
              value={newMember.name}
              onChange={(e) => setNewMember(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Full name"
            />
          </div>
          <div>
            <Label>Email *</Label>
            <Input
              type="email"
              value={newMember.email}
              onChange={(e) => setNewMember(prev => ({ ...prev, email: e.target.value }))}
              placeholder="Email address"
            />
          </div>
          <div>
            <Label>Mobile Number</Label>
            <Input
              value={newMember.phone}
              onChange={(e) => setNewMember(prev => ({ ...prev, phone: e.target.value }))}
              placeholder="+91 98765 43210"
            />
          </div>
          <div>
            <Label>Position *</Label>
            <Input
              value={newMember.position}
              onChange={(e) => setNewMember(prev => ({ ...prev, position: e.target.value }))}
              placeholder="Manager, Assistant, Cashier, etc."
            />
          </div>
          <div>
            <Label>Franchise Location *</Label>
            <Input
              value={newMember.franchise_location}
              onChange={(e) => setNewMember(prev => ({ ...prev, franchise_location: e.target.value }))}
              placeholder="Enter franchise location"
            />
          </div>
          <div>
            <Label>Location Details</Label>
            <Textarea
              value={newMember.location_details}
              onChange={(e) => setNewMember(prev => ({ ...prev, location_details: e.target.value }))}
              placeholder="Complete address and location details"
              rows={3}
            />
          </div>
          <Button onClick={onAddMember} className="w-full">
            Add Member
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
