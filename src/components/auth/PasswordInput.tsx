
import React from 'react';
import { Eye, EyeOff, Lock } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface PasswordInputProps {
  id: string;
  name: string;
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder: string;
  showPassword: boolean;
  onTogglePassword: () => void;
  required?: boolean;
}

const PasswordInput: React.FC<PasswordInputProps> = ({
  id,
  name,
  label,
  value,
  onChange,
  placeholder,
  showPassword,
  onTogglePassword,
  required = true
}) => {
  return (
    <div className="space-y-2">
      <Label htmlFor={id} className="text-gray-700 font-semibold text-sm">
        {label}
      </Label>
      <div className="relative">
        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
        <Input
          id={id}
          name={name}
          type={showPassword ? 'text' : 'password'}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          className="pl-11 pr-11 h-12 border-gray-200 focus:border-emerald-500 focus:ring-emerald-500 rounded-lg text-base"
        />
        <button
          type="button"
          onClick={onTogglePassword}
          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
        >
          {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
        </button>
      </div>
    </div>
  );
};

export default PasswordInput;
