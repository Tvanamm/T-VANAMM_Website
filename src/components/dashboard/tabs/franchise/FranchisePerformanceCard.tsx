
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { MapPin, Calendar, Phone, Mail, Send } from 'lucide-react';

interface FranchisePerformance {
  id: string;
  name: string;
  ordersFromUs: number;
  totalSupplyValue: number;
  status: string;
  manager: string;
  phone: string;
  email: string;
  location: string;
  joinDate: string;
  monthlyGrowth: number;
  topProducts: string[];
  lastOrderDate: string;
  memberCount: number;
}

interface FranchisePerformanceCardProps {
  branch: FranchisePerformance;
  branchMessage: string;
  selectedBranch: string;
  setBranchMessage: (message: string) => void;
  setSelectedBranch: (branchId: string) => void;
  onSendMessage: (branch: FranchisePerformance) => void;
}

export const FranchisePerformanceCard = ({ 
  branch, 
  branchMessage, 
  selectedBranch, 
  setBranchMessage, 
  setSelectedBranch, 
  onSendMessage 
}: FranchisePerformanceCardProps) => {
  return (
    <Card key={branch.id} className="border-l-4 border-l-emerald-500 bg-gradient-to-r from-emerald-50/30 to-transparent">
      <CardContent className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Branch Info */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-2 mb-3">
              <h3 className="font-bold text-lg text-gray-800">{branch.name}</h3>
              <Badge className="bg-green-100 text-green-800">
                🟢 Active
              </Badge>
            </div>
            
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-gray-500" />
                <span>{branch.location}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-gray-500" />
                <span>Joined: {new Date(branch.joinDate).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-gray-500" />
                <span>{branch.phone}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-gray-500" />
                <span>{branch.email}</span>
              </div>
            </div>
          </div>

          {/* Real-time Performance Metrics */}
          <div className="lg:col-span-1">
            <h4 className="font-semibold mb-3 text-gray-700">Real-time Metrics</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="bg-white p-3 rounded-lg border">
                <span className="text-gray-600">Supply Orders</span>
                <p className="font-bold text-purple-600 text-lg">{branch.ordersFromUs}</p>
                <p className="text-xs text-green-500">Live data</p>
              </div>
              
              <div className="bg-white p-3 rounded-lg border">
                <span className="text-gray-600">Supply Value</span>
                <p className="font-bold text-orange-600 text-lg">₹{(branch.totalSupplyValue / 1000).toFixed(0)}K</p>
                <p className="text-xs text-green-500">Real-time</p>
              </div>

              <div className="bg-white p-3 rounded-lg border">
                <span className="text-gray-600">Staff Members</span>
                <p className="font-bold text-emerald-600 text-lg">{branch.memberCount}</p>
                <p className="text-xs text-green-500">Active</p>
              </div>

              <div className="bg-white p-3 rounded-lg border">
                <span className="text-gray-600">Last Order</span>
                <p className="font-bold text-blue-600 text-sm">{new Date(branch.lastOrderDate).toLocaleDateString()}</p>
                <p className="text-xs text-green-500">Updated</p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="lg:col-span-1">
            <h4 className="font-semibold mb-3 text-gray-700">Quick Actions</h4>
            
            <div className="space-y-3 mb-4">
              <Dialog>
                <DialogTrigger asChild>
                  <Button size="sm" variant="outline" className="w-full">
                    <Send className="h-3 w-3 mr-2" />
                    Send Message
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Send Message to {branch.name}</DialogTitle>
                    <DialogDescription>
                      Send a message to all members of this franchise
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <Textarea
                      placeholder="Type your message to the franchise members..."
                      value={selectedBranch === branch.id ? branchMessage : ''}
                      onChange={(e) => {
                        setBranchMessage(e.target.value);
                        setSelectedBranch(branch.id);
                      }}
                    />
                    <Button 
                      onClick={() => onSendMessage(branch)}
                      className="w-full"
                      disabled={!branchMessage.trim()}
                    >
                      Send Message
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <div className="bg-gray-50 p-3 rounded-lg">
              <h5 className="font-medium text-sm mb-2">Recent Activity</h5>
              <div className="space-y-1">
                <div className="text-xs text-gray-600">
                  • {branch.ordersFromUs} total orders placed
                </div>
                <div className="text-xs text-gray-600">
                  • ₹{branch.totalSupplyValue.toLocaleString()} total purchases
                </div>
                <div className="text-xs text-gray-600">
                  • {branch.memberCount} active staff members
                </div>
              </div>
              <div className="mt-2 pt-2 border-t text-xs text-gray-500">
                Last Updated: {new Date().toLocaleString()}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
