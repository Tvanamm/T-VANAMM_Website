
import React from 'react';
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';

interface StepProps {
  title: string;
  description?: string;
  completed?: boolean;
  current?: boolean;
  stepNumber?: number;
}

interface StepsProps {
  current: number;
  children: React.ReactElement<StepProps>[];
}

const Step: React.FC<StepProps> = ({ title, description, completed, current, stepNumber }) => {
  return (
    <div className={cn(
      "flex items-center",
      current && "text-primary",
      completed && "text-green-600"
    )}>
      <div className={cn(
        "flex items-center justify-center w-8 h-8 rounded-full border-2 mr-3",
        current && "border-primary bg-primary text-white",
        completed && "border-green-600 bg-green-600 text-white",
        !current && !completed && "border-gray-300"
      )}>
        {completed ? (
          <Check className="w-4 h-4" />
        ) : (
          <span className="text-sm font-medium">
            {stepNumber}
          </span>
        )}
      </div>
      <div>
        <h3 className={cn(
          "text-sm font-medium",
          current && "text-primary",
          completed && "text-green-600"
        )}>
          {title}
        </h3>
        {description && (
          <p className="text-xs text-gray-500">{description}</p>
        )}
      </div>
    </div>
  );
};

const Steps: React.FC<StepsProps> = ({ current, children }) => {
  return (
    <div className="flex justify-between items-center mb-8">
      {React.Children.map(children, (child, index) => {
        const stepNumber = index + 1;
        const isCompleted = stepNumber < current;
        const isCurrent = stepNumber === current;
        
        return React.cloneElement(child, {
          completed: isCompleted,
          current: isCurrent,
          stepNumber: stepNumber,
        });
      })}
    </div>
  );
};

export { Steps, Step };
