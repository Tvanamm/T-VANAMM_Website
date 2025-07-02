import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Mail, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import ModernNavbar from '@/components/ModernNavbar';
import LoadingSpinner from '@/components/LoadingSpinner';
import { LoginFormData } from '@/types/auth';

const Login = () => {
  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const { login, loginWithGoogle, user, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();

  // Redirect if already logged in
  useEffect(() => {
    if (user && !authLoading) {
      console.log('User authenticated, redirecting based on role:', user.role);
      
      // Redirect based on user role
      switch (user.role) {
        case 'owner':
          navigate('/owner-dashboard', { replace: true });
          break;
        case 'admin':
          navigate('/admin-dashboard', { replace: true });
          break;
        case 'franchise':
          navigate('/franchise-dashboard', { replace: true });
          break;
        default:
          navigate('/dashboard', { replace: true });
      }
    }
  }, [user, authLoading, navigate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isLoading || !formData.email || !formData.password) return;
    
    setIsLoading(true);

    try {
      console.log('Attempting login with:', formData.email);
      const result = await login(formData.email, formData.password);
      
      if (result.success) {
        toast({
          title: "Login successful!",
          description: "Welcome back to Tvanamm.",
        });
        // Navigation will be handled by useEffect when user state changes
      } else {
        console.error('Login failed:', result.error);
        toast({
          title: "Login failed",
          description: result.error || "Invalid credentials. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error('Login error:', error);
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    if (isGoogleLoading) return;
    
    setIsGoogleLoading(true);
    try {
      const result = await loginWithGoogle();
      if (result.success) {
        toast({
          title: "Login successful!",
          description: "Welcome to Tvanamm.",
        });
      } else {
        toast({
          title: "Google login failed",
          description: result.error || "Unable to login with Google. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Google login error:', error);
      toast({
        title: "Error",
        description: "Something went wrong with Google login.",
        variant: "destructive",
      });
    } finally {
      setIsGoogleLoading(false);
    }
  };

  // Show loading while auth is initializing
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center">
        <LoadingSpinner size="lg" variant="coffee" text="Initializing..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50">
      <ModernNavbar />
      
      <div className="relative pt-24 pb-12 px-4">
        <div className="max-w-lg mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-800 mb-2">Welcome Back</h1>
            <p className="text-gray-600 text-lg">Sign in to your Tvanamm account</p>
          </div>

          {/* Login Form */}
          <Card className="shadow-2xl border-0 backdrop-blur-sm bg-white/90 overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-green-500 to-green-600"></div>
            <CardHeader className="pb-6 pt-8">
              <CardTitle className="text-center text-2xl font-bold text-gray-800">Sign In</CardTitle>
            </CardHeader>
            <CardContent className="px-8 pb-8">
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-gray-700 font-semibold text-sm">
                    Email Address
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="your@email.com"
                      required
                      disabled={isLoading || isGoogleLoading}
                      className="pl-11 h-12 border-gray-200 focus:border-green-500 focus:ring-green-500 rounded-lg text-base"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-gray-700 font-semibold text-sm">
                    Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={handleInputChange}
                      placeholder="Enter your password"
                      required
                      disabled={isLoading || isGoogleLoading}
                      className="pr-11 h-12 border-gray-200 focus:border-green-500 focus:ring-green-500 rounded-lg text-base"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      disabled={isLoading || isGoogleLoading}
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <label className="flex items-center">
                    <input 
                      type="checkbox" 
                      className="rounded border-gray-300 focus:ring-green-500" 
                      disabled={isLoading || isGoogleLoading}
                    />
                    <span className="ml-2 text-sm text-gray-600">Remember me</span>
                  </label>
                  <Link 
                    to="/forgot-password" 
                    className="text-sm font-medium text-green-600 hover:text-green-700 transition-colors"
                  >
                    Forgot password?
                  </Link>
                </div>

                <Button 
                  type="submit" 
                  disabled={isLoading || isGoogleLoading || !formData.email || !formData.password}
                  className="w-full bg-green-600 hover:bg-green-700 text-white py-3 h-12 text-base font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {isLoading ? (
                    <LoadingSpinner size="sm" variant="default" text="Signing in..." />
                  ) : (
                    'Sign In'
                  )}
                </Button>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-gray-200" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white px-2 text-gray-500">Or continue with</span>
                  </div>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  onClick={handleGoogleLogin}
                  disabled={isLoading || isGoogleLoading}
                  className="w-full border-2 border-gray-200 hover:bg-gray-50 h-12 text-base font-semibold rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isGoogleLoading ? (
                    <LoadingSpinner size="sm" variant="default" text="Connecting..." />
                  ) : (
                    <>
                      <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                      </svg>
                      Continue with Google
                    </>
                  )}
                </Button>
              </form>

              <div className="mt-8 text-center">
                <p className="text-gray-600">
                  Don't have an account?{' '}
                  <Link to="/signup" className="font-semibold text-green-600 hover:text-green-700 transition-colors">
                    Sign up here
                  </Link>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Login;
