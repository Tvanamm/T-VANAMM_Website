
import { User, Session } from '@supabase/supabase-js';

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  phone?: string;
  role: 'customer' | 'franchise' | 'admin' | 'owner';
  email_verified?: boolean;
  provider?: string;
  avatar_url?: string;
}

export interface AuthContextType {
  user: UserProfile | null;
  session: Session | null;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  loginWithGoogle: () => Promise<{ success: boolean; error?: string }>;
  signup: (userData: { email: string; password: string; name: string; phone?: string }) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  verifyOTP: (otp: string) => Promise<boolean>;
  resetPassword: (email: string) => Promise<boolean>;
  resendVerification: () => Promise<boolean>;
  isLoading: boolean;
}

export interface LoginFormData {
  email: string;
  password: string;
}

export interface SignupFormData {
  name: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
}
