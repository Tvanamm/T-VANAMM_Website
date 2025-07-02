
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Package, ArrowRight, ShoppingCart, User, Clock, Star, MapPin, Shield, Coffee, Phone, Mail } from 'lucide-react';
import ModernNavbar from '@/components/ModernNavbar';
import Footer from '@/components/Footer';
import UnifiedOrderManagement from '@/components/franchise/UnifiedOrderManagement';

const Order = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Show UnifiedOrderManagement for authenticated franchise users
  if (user && (user.role === 'franchise' || user.isFranchiseMember)) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-50">
        <ModernNavbar />
        
        <div className="pt-24 pb-16 px-4">
          <div className="max-w-7xl mx-auto">
            {/* Header Section */}
            <div className="text-center mb-12">
              <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
                Order from <span style={{color: 'rgb(0,100,55)'}}>T VANAMM</span>
              </h1>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Browse our inventory and place your orders seamlessly
              </p>
            </div>

            {/* Unified Order Management */}
            <UnifiedOrderManagement />
          </div>
        </div>
        
        <Footer />
      </div>
    );
  }

  // Show enhanced UI for unauthenticated users or non-franchise users
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-green-50">
      <style>
        {`
          @keyframes seamless-scroll-right {
            0% { transform: translateX(0); }
            100% { transform: translateX(-100%); }
          }
          
          @keyframes seamless-scroll-left {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(0); }
          }
          
          .seamless-scroll-right {
            animation: seamless-scroll-right 80s linear infinite;
          }
          
          .seamless-scroll-left {
            animation: seamless-scroll-left 80s linear infinite;
          }
          
          .seamless-scroll-right:hover,
          .seamless-scroll-left:hover {
            animation-play-state: paused;
          }
          
          .center-card-hover {
            transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
          }
          
          .center-card-hover:hover {
            transform: translateY(-8px) scale(1.05);
            box-shadow: 0 20px 40px rgba(0,0,0,0.15);
            z-index: 10;
            position: relative;
          }

          .carousel-container {
            overflow: hidden;
            position: relative;
            width: 100%;
            mask: linear-gradient(90deg, transparent, white 10%, white 90%, transparent);
            -webkit-mask: linear-gradient(90deg, transparent, white 10%, white 90%, transparent);
          }

          .carousel-track {
            display: flex;
            width: calc(320px * 8);
          }

          .carousel-item {
            flex: 0 0 300px;
            margin-right: 20px;
          }

          .features-carousel-track {
            display: flex;
            width: calc(320px * 10);
          }
        `}
      </style>
      
      <ModernNavbar />
      
      <div className="pt-24 pb-12">
        {/* Header Section */}
        <div className="max-w-7xl mx-auto px-4 mb-16 text-center">
          <Badge className="bg-emerald-100 text-emerald-800 mb-4 px-4 py-2">🚀 Order Online</Badge>
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">Order Tvanamm Tea & Coffee</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Experience the finest tea blends from the comfort of your home through our trusted delivery partners. Hot, fresh, and delivered with love!
          </p>
        </div>

        <div className="max-w-7xl mx-auto px-4">
          {/* Available On Section */}
          <div className="mb-20">
            <h2 className="text-4xl font-bold text-gray-900 text-center mb-4">Available On</h2>
            <p className="text-gray-600 text-center mb-12 text-lg">Choose your preferred delivery platform for quick and reliable service</p>
            
            <div className="carousel-container">
              <div className="carousel-track seamless-scroll-right">
                {[
                  { name: 'Swiggy', color: 'orange-500', emoji: '🟠', url: 'https://www.swiggy.com/restaurants/tvanamm-tea-coffee' },
                  { name: 'Zomato', color: 'red-500', emoji: '🔴', url: 'https://www.zomato.com/hyderabad/tvanamm-tea-coffee' },
                  { name: 'Mpin', color: 'blue-500', emoji: '🔵', url: 'https://www.example.com/mpin' },
                  { name: 'Food Panda', color: 'pink-500', emoji: '🟡', url: 'https://www.foodpanda.com/restaurant/tvanamm-tea-coffee' }
                ].concat([
                  { name: 'Swiggy', color: 'orange-500', emoji: '🟠', url: 'https://www.swiggy.com/restaurants/tvanamm-tea-coffee' },
                  { name: 'Zomato', color: 'red-500', emoji: '🔴', url: 'https://www.zomato.com/hyderabad/tvanamm-tea-coffee' },
                  { name: 'Mpin', color: 'blue-500', emoji: '🔵', url: 'https://www.example.com/mpin' },
                  { name: 'Food Panda', color: 'pink-500', emoji: '🟡', url: 'https://www.foodpanda.com/restaurant/tvanamm-tea-coffee' }
                ]).map((platform, index) => (
                  <div key={index} className="carousel-item">
                    <a href={platform.url} target="_blank" rel="noopener noreferrer">
                      <Card className="border-0 shadow-lg hover:shadow-2xl center-card-hover bg-white group h-48">
                        <CardContent className="p-8 text-center flex flex-col justify-center h-full">
                          <div className={`bg-${platform.color} w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300`}>
                            <span className="text-3xl">{platform.emoji}</span>
                          </div>
                          <h3 className="text-2xl font-bold text-gray-800 group-hover:text-emerald-600 transition-colors duration-300">
                            {platform.name}
                          </h3>
                        </CardContent>
                      </Card>
                    </a>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Why Choose Tvanamm Section */}
          <div className="mb-20">
            <h2 className="text-4xl font-bold text-gray-900 text-center mb-4">Why Choose Tvanamm?</h2>
            <p className="text-gray-600 text-center mb-12 text-lg">Experience the difference with every sip</p>
            
            <div className="carousel-container">
              <div className="features-carousel-track seamless-scroll-left">
                {[
                  { icon: Clock, title: 'Fresh & Fast', desc: 'Made with fresh ingredients and brewed in minutes — no shortcuts, just pure flavor.' },
                  { icon: Star, title: 'Premium Quality', desc: '100% organic ingredients and traditional recipes passed down through generations' },
                  { icon: MapPin, title: 'Wide Coverage', desc: 'Available across Hyderabad through multiple delivery platforms for your convenience' },
                  { icon: Shield, title: 'Assured Quality', desc: 'Every order is quality checked and packed with care to ensure freshness' },
                  { icon: Coffee, title: 'Scalable Business Model', desc: 'Easy to replicate, high-margin setup built for fast growth across locations' }
                ].concat([
                  { icon: Clock, title: 'Fresh & Fast', desc: 'Made with fresh ingredients and brewed in minutes — no shortcuts, just pure flavor.' },
                  { icon: Star, title: 'Premium Quality', desc: '100% organic ingredients and traditional recipes passed down through generations' },
                  { icon: MapPin, title: 'Wide Coverage', desc: 'Available across Hyderabad through multiple delivery platforms for your convenience' },
                  { icon: Shield, title: 'Assured Quality', desc: 'Every order is quality checked and packed with care to ensure freshness' },
                  { icon: Coffee, title: 'Scalable Business Model', desc: 'Easy to replicate, high-margin setup built for fast growth across locations' }
                ]).map((feature, index) => {
                  const IconComponent = feature.icon;
                  return (
                    <div key={index} className="carousel-item">
                      <Card className="border-0 shadow-lg hover:shadow-xl center-card-hover text-center bg-gradient-to-br from-emerald-50 to-green-50 h-56">
                        <CardContent className="p-6 flex flex-col justify-center h-full space-y-3">
                          <div className="flex justify-center">
                            <IconComponent className="h-10 w-10 text-emerald-600" />
                          </div>
                          <h3 className="text-xl font-semibold text-gray-900">{feature.title}</h3>
                          <p className="text-gray-600 text-sm leading-relaxed">{feature.desc}</p>
                        </CardContent>
                      </Card>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Menu Discovery Section */}
          <div className="mb-20">
            <Card className="bg-white shadow-xl rounded-2xl overflow-hidden">
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-0">
                <div className="lg:col-span-3 p-12 flex flex-col justify-center">
                  <div className="max-w-2xl">
                    <Badge className="bg-emerald-100 text-emerald-800 mb-6 px-4 py-2 text-sm font-medium">
                      ☕ Discover Our Collection
                    </Badge>
                    <h3 className="text-4xl font-bold text-gray-900 mb-6 leading-tight">
                      Discover Our Exquisite Menu
                    </h3>
                    <div className="space-y-4 mb-8 text-gray-600 text-lg leading-relaxed">
                      <p>
                        From traditional <span className="text-emerald-600 font-semibold">masala chai</span> to premium
                        <span className="text-emerald-600 font-semibold"> filter coffee</span>, explore our carefully curated selection of authentic Indian beverages that will transport you to the heart of India's rich tea culture.
                      </p>
                      <p>
                        Each recipe is crafted with the <span className="font-semibold">finest ingredients</span> and
                        <span className="font-semibold"> time-honored techniques</span> to deliver an unforgettable taste experience. Our master tea blenders have perfected each blend to ensure every sip tells a story of tradition, quality, and passion.
                      </p>
                      <div className="grid grid-cols-2 gap-4 mt-6">
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                          <span className="text-sm font-medium">30+ Premium Blends</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                          <span className="text-sm font-medium">100% Organic Ingredients</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                          <span className="text-sm font-medium">Traditional Recipes</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                          <span className="text-sm font-medium">Fresh Daily Preparation</span>
                        </div>
                      </div>
                    </div>
                    <Button 
                      className="bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white px-8 py-4 text-lg rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 font-semibold"
                      onClick={() => navigate('/')}
                    >
                      <Coffee className="mr-3 h-5 w-5" />
                      Explore Our Menu
                    </Button>
                  </div>
                </div>
                <div className="lg:col-span-2 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-emerald-100/50 to-green-100/50"></div>
                  <div className="relative h-full min-h-[400px] lg:min-h-[600px] flex items-center justify-center p-8">
                    <div className="w-full max-w-md">
                      <div className="relative group">
                        <div className="absolute -inset-4 bg-gradient-to-r from-emerald-200 to-green-200 rounded-2xl blur-xl opacity-30 group-hover:opacity-50 transition duration-300"></div>
                        <img 
                          src="/lovable-uploads/26e8f8ab-fd21-40a1-8b99-bbb169dbfdd3.png" 
                          alt="Menu Preview" 
                          className="relative w-full h-auto rounded-2xl shadow-2xl border-4 border-white/50 backdrop-blur-sm group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Contact Section */}
          <div className="text-center">
            <Card className="border-0 shadow-2xl max-w-4xl mx-auto bg-gradient-to-br from-emerald-50 to-green-50">
              <CardContent className="p-10">
                <h3 className="text-3xl font-bold text-gray-900 mb-8">Need Help with Your Order?</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div className="flex items-start gap-4">
                      <MapPin className="h-6 w-6 text-emerald-600 mt-1 flex-shrink-0" />
                      <div className="text-left">
                        <h4 className="font-semibold text-gray-900 mb-2">Visit Our Office</h4>
                        <span className="text-gray-700 leading-relaxed">
                          Plot No. 12, Rd Number 8, Gayatri Nagar, Vivekananda Nagar, Kukatpally, Hyderabad, Telangana 500072
                        </span>
                        <div className="mt-2">
                          <Button variant="outline" className="text-emerald-600 border-emerald-600 hover:bg-emerald-50">
                            <MapPin className="h-4 w-4 mr-2" />
                            View in Google Maps
                          </Button>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-start gap-4">
                      <Phone className="h-6 w-6 text-emerald-600 mt-1" />
                      <div className="text-left">
                        <h4 className="font-semibold text-gray-900 mb-2">Call Us</h4>
                        <div className="text-gray-700">
                          <div>+91 9000008479</div>
                          <div>+91 9390658544</div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-6">
                    <div className="flex items-start gap-4">
                      <Clock className="h-6 w-6 text-emerald-600 mt-1" />
                      <div className="text-left">
                        <h4 className="font-semibold text-gray-900 mb-2">Operating Hours</h4>
                        <span className="text-gray-700">7:00 AM - 11:00 PM, Daily</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="mt-8 p-6 bg-white rounded-xl shadow-lg">
                  <h4 className="font-semibold text-gray-900 mb-2">📞 Bulk Orders & Custom Requests</h4>
                  <p className="text-gray-600">
                    Call us directly for bulk orders, corporate catering, or special customizations. We're here to make your tea experience perfect!
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default Order;
