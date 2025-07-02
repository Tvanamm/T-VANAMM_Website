
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Mail, Gift, Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const Newsletter = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    
    // Simulate newsletter signup
    setTimeout(() => {
      setIsLoading(false);
      setEmail('');
      toast({
        title: "Success!",
        description: "You've been subscribed to our newsletter. Check your email for a special discount!",
      });
    }, 1000);
  };

  return (
    <section className="py-16 bg-gradient-to-r from-emerald-600 to-green-600 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-black/10"></div>
      <div className="absolute top-8 left-8 text-4xl opacity-20" aria-hidden="true">✨</div>
      <div className="absolute bottom-8 right-8 text-3xl opacity-20" aria-hidden="true">📧</div>
      <div className="absolute top-1/2 left-1/4 text-2xl opacity-10" aria-hidden="true">🎁</div>
      
      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20 shadow-2xl">
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-lg">
                <Mail className="h-8 w-8 text-emerald-600" />
              </div>
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-amber-400 rounded-full flex items-center justify-center">
                <Gift className="h-3 w-3 text-white" />
              </div>
            </div>
          </div>
          
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Join Our Tea Community
          </h2>
          
          <p className="text-lg text-white/90 mb-8 max-w-2xl mx-auto leading-relaxed">
            Subscribe to our newsletter and get exclusive updates on new tea blends, 
            special offers, and brewing tips delivered straight to your inbox.
          </p>
          
          <form onSubmit={handleSubmit} className="max-w-md mx-auto">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <Input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-12 bg-white/90 border-0 text-slate-800 placeholder:text-slate-500 focus:bg-white transition-colors"
                  required
                />
              </div>
              <Button 
                type="submit" 
                disabled={isLoading}
                className="h-12 bg-white text-emerald-700 hover:bg-gray-100 font-semibold px-8 shadow-lg disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin h-4 w-4 border-2 border-emerald-600 border-t-transparent rounded-full mr-2"></div>
                    Subscribing...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-5 w-5" />
                    Subscribe
                  </>
                )}
              </Button>
            </div>
          </form>
          
          <div className="flex items-center justify-center gap-2 mt-6 text-white/80">
            <Gift className="h-5 w-5 text-amber-300" />
            <span className="text-sm font-medium">Get 10% off your first order when you subscribe</span>
          </div>
          
          <p className="text-xs text-white/60 mt-4">
            We respect your privacy. Unsubscribe at any time.
          </p>
        </div>
      </div>
    </section>
  );
};

export default Newsletter;
