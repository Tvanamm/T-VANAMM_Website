
import React from 'react';
import { Crown, Calendar } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface DashboardHeaderProps {
  selectedTimeframe: string;
  onTimeframeChange: (value: string) => void;
}

const DashboardHeader = ({ selectedTimeframe, onTimeframeChange }: DashboardHeaderProps) => {
  return (
    <div className="mb-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-emerald-800 flex items-center gap-2">
            <Crown className="h-6 w-6 sm:h-8 sm:w-8 text-amber-500" />
            Owner Dashboard
          </h1>
          <p className="text-emerald-600 text-sm sm:text-base">Complete business oversight and control</p>
        </div>
        
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-emerald-600" />
          <Select value={selectedTimeframe} onValueChange={onTimeframeChange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="quarter">This Quarter</SelectItem>
              <SelectItem value="year">This Year</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
};

export default DashboardHeader;
