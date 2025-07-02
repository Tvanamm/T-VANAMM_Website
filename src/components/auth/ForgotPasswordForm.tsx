
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft } from 'lucide-react';

const ForgotPasswordForm = () => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEmailSent, setIsEmailSent] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast({
        title: "Email Required",
        description: "Please enter your email address",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Simulate password reset request
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setIsEmailSent(true);
      toast({
        title: "Reset Link Sent",
        description: "Check your email for password reset instructions",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send reset link. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isEmailSent) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <div className="p-3 bg-green-100 rounded-full w-fit mx-auto mb-4">
            <Mail className="h-8 w-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Check Your Email
          </h2>
          <p className="text-gray-600 mb-6">
            We've sent a password reset link to <strong>{email}</strong>
          </p>
          <div className="space-y-3">
            <Button
              onClick={() => {
                setIsEmailSent(false);
                setEmail('');
              }}
              variant="outline"
              className="w-full"
            >
              Try Different Email
            </Button>
            <Link to="/login" className="block">
              <Button variant="ghost" className="w-full">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Login
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email address"
              required
            />
          </div>

          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-emerald-600 hover:bg-emerald-700"
          >
            {isSubmitting ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Sending Reset Link...
              </div>
            ) : (
              'Send Reset Link'
            )}
          </Button>

          <div className="text-center">
            <Link to="/login" className="text-sm text-emerald-600 hover:underline">
              <ArrowLeft className="h-4 w-4 inline mr-1" />
              Back to Login
            </Link>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default ForgotPasswordForm;
