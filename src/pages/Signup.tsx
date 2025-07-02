
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Mail, User, Phone, Coffee, CheckCircle, Shield } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import ModernNavbar from '@/components/ModernNavbar';
import AuthBackground from '@/components/auth/AuthBackground';
import AuthHeader from '@/components/auth/AuthHeader';
import PasswordInput from '@/components/auth/PasswordInput';
import { SignupFormData } from '@/types/auth';

const Signup = () => {
  const [formData, setFormData] = useState<SignupFormData>({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { signup, user } = useAuth();
  const navigate = useNavigate();

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Password mismatch",
        description: "Passwords do not match. Please try again.",
        variant: "destructive",
      });
      return;
    }

    if (formData.password.length < 6) {
      toast({
        title: "Weak password",
        description: "Password must be at least 6 characters long.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const result = await signup({
        email: formData.email,
        password: formData.password,
        name: formData.name,
        phone: formData.phone
      });

      if (result.success) {
        toast({
          title: "Account created successfully!",
          description: "Please check your email to verify your account.",
        });
        navigate('/login');
      } else {
        toast({
          title: "Signup failed",
          description: result.error || "Unable to create account. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const benefits = [
    { icon: Coffee, text: "Premium tea collections" },
    { icon: CheckCircle, text: "Exclusive member rewards" },
    { icon: Shield, text: "Secure & protected account" }
  ];

  return (
    <AuthBackground>
      <ModernNavbar />
      
      <div className="relative pt-24 pb-12 px-4">
        <div className="max-w-md mx-auto">
          <AuthHeader 
            title="Join Tvanamm"
            subtitle="Create your account and start your premium tea journey"
            logoRotation="-rotate-3"
          />

          {/* Benefits */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            {benefits.map((benefit, index) => (
              <div key={index} className="text-center p-3 bg-white/60 backdrop-blur-sm rounded-lg">
                <benefit.icon className="h-6 w-6 text-emerald-600 mx-auto mb-2" />
                <p className="text-xs text-gray-600 font-medium">{benefit.text}</p>
              </div>
            ))}
          </div>

          {/* Signup Card */}
          <Card className="shadow-2xl border-0 backdrop-blur-sm bg-white/90 overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-500"></div>
            <CardHeader className="pb-6 pt-8">
              <CardTitle className="text-center text-2xl font-bold text-gray-800">Create Account</CardTitle>
            </CardHeader>
            <CardContent className="px-8 pb-8">
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-gray-700 font-semibold text-sm">
                    Full Name
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input
                      id="name"
                      name="name"
                      type="text"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="Enter your full name"
                      required
                      className="pl-11 h-12 border-gray-200 focus:border-emerald-500 focus:ring-emerald-500 rounded-lg text-base"
                    />
                  </div>
                </div>

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
                      className="pl-11 h-12 border-gray-200 focus:border-emerald-500 focus:ring-emerald-500 rounded-lg text-base"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-gray-700 font-semibold text-sm">
                    Phone Number
                  </Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="+91 98765 43210"
                      className="pl-11 h-12 border-gray-200 focus:border-emerald-500 focus:ring-emerald-500 rounded-lg text-base"
                    />
                  </div>
                </div>

                <PasswordInput
                  id="password"
                  name="password"
                  label="Password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Create a strong password"
                  showPassword={showPassword}
                  onTogglePassword={() => setShowPassword(!showPassword)}
                />

                <PasswordInput
                  id="confirmPassword"
                  name="confirmPassword"
                  label="Confirm Password"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  placeholder="Confirm your password"
                  showPassword={showConfirmPassword}
                  onTogglePassword={() => setShowConfirmPassword(!showConfirmPassword)}
                />

                <div className="flex items-start space-x-3 text-sm pt-2">
                  <input 
                    type="checkbox" 
                    required 
                    className="mt-1 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500" 
                  />
                  <span className="text-gray-600 leading-relaxed">
                    I agree to the{' '}
                    <Link to="/terms" className="text-emerald-600 hover:text-emerald-700 font-medium">
                      Terms of Service
                    </Link>{' '}
                    and{' '}
                    <Link to="/privacy" className="text-emerald-600 hover:text-emerald-700 font-medium">
                      Privacy Policy
                    </Link>
                  </span>
                </div>

                <Button 
                  type="submit" 
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white py-3 h-12 text-base font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5"
                >
                  {isLoading ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Creating Account...</span>
                    </div>
                  ) : (
                    'Create Account'
                  )}
                </Button>
              </form>

              <div className="mt-8 text-center">
                <p className="text-gray-600">
                  Already have an account?{' '}
                  <Link to="/login" className="text-emerald-600 hover:text-emerald-700 font-semibold transition-colors">
                    Sign in here
                  </Link>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AuthBackground>
  );
};

export default Signup;
