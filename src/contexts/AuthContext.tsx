
import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AuthUser {
  id: string;
  role: string;
  name?: string;
  email?: string;
  phone?: string;
  email_verified?: boolean;
  avatar_url?: string;
  franchiseMemberId?: string;
  isFranchiseMember?: boolean;
}

interface AuthContextType {
  user: AuthUser | null;
  session: Session | null;
  isLoading: boolean;
  signOut: () => Promise<void>;
  logout: () => Promise<void>;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  loginWithGoogle: () => Promise<{ success: boolean; error?: string }>;
  signup: (userData: { email: string; password: string; name: string; phone?: string }) => Promise<{ success: boolean; error?: string }>;
  resetPassword: (email: string) => Promise<{ success: boolean; error?: string }>;
  resendVerification: () => Promise<{ success: boolean; error?: string }>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchUserProfile = async (userId: string): Promise<AuthUser | null> => {
    try {
      console.log(`AuthContext: Fetching user profile for ${userId}`);
      
      // First try to get profile from profiles table
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      console.log('AuthContext: Profile query result:', { 
        profile: profile ? `Found: ${profile.role}` : 'Not found', 
        profileError: profileError?.message 
      });

      // Also check if user is a franchise member
      const { data: franchiseMember, error: franchiseError } = await supabase
        .from('franchise_members')
        .select('id, name, email, status')
        .eq('user_id', userId)
        .maybeSingle();

      console.log('AuthContext: Franchise member query result:', { 
        franchiseMember: franchiseMember ? 'Found' : 'Not found', 
        franchiseError: franchiseError?.message 
      });

      if (profile && !profileError && profile.role) {
        // User has a profile with a valid role
        return {
          id: userId,
          email: profile.email || '',
          name: profile.name || '',
          phone: profile.phone,
          role: profile.role,
          email_verified: profile.email_verified || false,
          avatar_url: profile.avatar_url,
          isFranchiseMember: !!franchiseMember && !franchiseError,
          franchiseMemberId: franchiseMember?.id
        };
      } else if (franchiseMember && !franchiseError) {
        // User doesn't have profile but is franchise member
        console.log('AuthContext: User is franchise member, setting role to franchise');
        return {
          id: userId,
          email: franchiseMember.email || '',
          name: franchiseMember.name || '',
          role: 'franchise',
          email_verified: true,
          isFranchiseMember: true,
          franchiseMemberId: franchiseMember.id
        };
      }

      // No valid profile or role found - return null
      console.log('AuthContext: No valid profile or role found, user needs role assignment');
      return null;
    } catch (error: any) {
      console.error('AuthContext: Error fetching user profile:', error);
      return null;
    }
  };

  useEffect(() => {
    console.log('AuthContext: Setting up auth state listener');
    
    let mounted = true;

    const initializeAuth = async () => {
      try {
        // Get initial session
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('AuthContext: Error getting session:', error);
          if (mounted) {
            setSession(null);
            setUser(null);
            setIsLoading(false);
          }
          return;
        }

        console.log('AuthContext: Initial session check:', session ? 'has session' : 'no session');
        
        if (!mounted) return;
        
        setSession(session);
        
        if (session?.user) {
          // Defer profile fetching to prevent deadlock
          setTimeout(async () => {
            if (!mounted) return;
            try {
              const userProfile = await fetchUserProfile(session.user.id);
              if (mounted) {
                setUser(userProfile);
              }
            } catch (error) {
              console.error('AuthContext: Error loading user profile:', error);
              if (mounted) {
                setUser(null);
              }
            }
          }, 0);
        } else {
          setUser(null);
        }
        
        if (mounted) {
          setIsLoading(false);
        }
      } catch (error) {
        console.error('AuthContext: Error initializing auth:', error);
        if (mounted) {
          setSession(null);
          setUser(null);
          setIsLoading(false);
        }
      }
    };

    // Set up auth state listener - NO ASYNC CALLS HERE
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('AuthContext: Auth state change:', event, session ? 'has session' : 'no session');
        
        if (!mounted) return;
        
        // Only synchronous state updates here
        setSession(session);
        
        if (session?.user) {
          // Defer profile fetching to prevent deadlock
          setTimeout(async () => {
            if (!mounted) return;
            try {
              const userProfile = await fetchUserProfile(session.user.id);
              if (mounted) {
                setUser(userProfile);
                setIsLoading(false);
              }
            } catch (error) {
              console.error('AuthContext: Error loading user profile:', error);
              if (mounted) {
                setUser(null);
                setIsLoading(false);
              }
            }
          }, 0);
        } else {
          if (mounted) {
            setUser(null);
            setIsLoading(false);
          }
        }
      }
    );

    // Initialize
    initializeAuth();

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    try {
      setIsLoading(true);
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive"
        });
        return;
      }

      setUser(null);
      setSession(null);
      
      toast({
        title: "Success",
        description: "Logged out successfully"
      });
      
      window.location.href = '/';
    } catch (error: any) {
      console.error('Logout error:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred during logout",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const logout = signOut;

  const login = async (email: string, password: string) => {
    console.log('AuthContext: Starting login for:', email);
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('AuthContext: Login error:', error);
        return { success: false, error: error.message };
      }

      console.log('AuthContext: Login successful');
      return { success: true };
    } catch (error: any) {
      console.error('AuthContext: Login exception:', error);
      return { success: false, error: 'Login failed' };
    }
  };

  const loginWithGoogle = async () => {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin
        }
      });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  };

  const signup = async (userData: { email: string; password: string; name: string; phone?: string }) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          data: {
            name: userData.name,
            phone: userData.phone,
          },
          emailRedirectTo: window.location.origin
        }
      });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  };

  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`
      });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  };

  const resendVerification = async () => {
    try {
      if (!user?.email) {
        return { success: false, error: 'No email found' };
      }

      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: user.email,
        options: {
          emailRedirectTo: window.location.origin
        }
      });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  };

  const refreshUser = async () => {
    if (session?.user) {
      const profile = await fetchUserProfile(session.user.id);
      if (profile) {
        setUser(profile);
      }
    }
  };

  const value = {
    user,
    session,
    isLoading,
    signOut,
    logout,
    login,
    loginWithGoogle,
    signup,
    resetPassword,
    resendVerification,
    refreshUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
