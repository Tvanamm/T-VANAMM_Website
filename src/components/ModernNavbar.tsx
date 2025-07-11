import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Bell, LogOut, Menu, X, ShoppingCart, Sparkles } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useRealTimeNotifications } from '@/hooks/useRealTimeNotifications';
import { useFranchiseCart } from '@/contexts/FranchiseCartContext';
import { useToast } from '@/hooks/use-toast';
import LoadingSpinner from './LoadingSpinner';

const ModernNavbar = () => {
  const { user, logout } = useAuth();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useRealTimeNotifications();
  const { cartItems } = useFranchiseCart();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
      toast({
        title: "Logged out",
        description: "You have been successfully logged out.",
      });
      navigate('/login');
    } catch (error: any) {
      console.error("Logout failed:", error);
      toast({
        title: "Logout failed",
        description: error.message || "Something went wrong during logout.",
        variant: "destructive",
      });
    } finally {
      setIsLoggingOut(false);
    }
  };

  const getDashboardLink = () => {
    if (!user) return null;
    
    switch (user.role) {
      case 'owner':
        return { href: '/owner-dashboard', label: 'Dashboard' };
      case 'admin':
        return { href: '/admin-dashboard', label: 'Admin Panel' };
      case 'franchise':
        return { href: '/franchise-dashboard', label: 'My Dashboard' };
      default:
        return null;
    }
  };

  const dashboardLink = getDashboardLink();
  const cartItemCount = cartItems.length;

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled 
        ? 'bg-white/95 backdrop-blur-md shadow-lg border-b border-emerald-100/50' 
        : 'bg-gradient-to-r from-emerald-50/80 to-teal-50/80 backdrop-blur-sm'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-3 group">
              <div className="relative">
                <div className="w-11 h-11 bg-white rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105 p-1">
                  <img 
                    src="/lovable-uploads/a108b20f-3540-49a6-8274-0492273617cc.png" 
                    alt="T VANAMM Logo" 
                    className="w-full h-full object-contain"
                    width="100"
                    height="40"
                    loading="eager"
                    style={{ imageRendering: 'crisp-edges' }}
                  />
                </div>
              </div>
              <div className="flex flex-col">
                <span className="text-2xl font-bold text-[rgb(0,100,55)]">
                  T VANAMM
                </span>
                <span className="text-xs font-bold text-[rgb(0,100,55)] font-medium tracking-wide">A Taste of Purity</span>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation - Updated Order */}
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/" className="nav-link">
              Home
            </Link>
            <Link to="/about" className="nav-link">
              About
            </Link>
            <Link to="/blog" className="nav-link">
              Blog
            </Link>
            <Link to="/franchise" className="nav-link">
              Franchise
            </Link>
            <Link to="/order" className="nav-link">
              Order
            </Link>
            {dashboardLink && (
              <Link 
                to={dashboardLink.href} 
                className="nav-link flex items-center gap-2"
              >
                <Sparkles className="h-4 w-4" />
                {dashboardLink.label}
              </Link>
            )}
            
            {/* User Menu */}
            {user ? (
              <div className="flex items-center space-x-4">
                {/* Cart Icon for Franchise Users */}
                {user.role === 'franchise' && (
                  <Link to="/order" className="relative group">
                    <div className="p-2 rounded-full bg-emerald-100/50 group-hover:bg-emerald-100 transition-all duration-200 group-hover:scale-105">
                      <ShoppingCart className="h-5 w-5 text-emerald-600" />
                      {cartItemCount > 0 && (
                        <Badge 
                          variant="destructive" 
                          className="absolute -top-1 -right-1 h-5 w-5 text-xs flex items-center justify-center p-0 min-w-[20px] bg-gradient-to-r from-red-500 to-pink-500 border-0 animate-bounce"
                        >
                          {cartItemCount > 9 ? '9+' : cartItemCount}
                        </Badge>
                      )}
                    </div>
                  </Link>
                )}

                {/* Notifications */}
                <div className="relative">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowNotifications(!showNotifications)}
                    className="relative p-2 rounded-full bg-emerald-100/50 hover:bg-emerald-100 transition-all duration-200 hover:scale-105"
                  >
                    <Bell className="h-5 w-5 text-emerald-600" />
                    {unreadCount > 0 && (
                      <Badge 
                        variant="destructive" 
                        className="absolute -top-1 -right-1 h-5 w-5 text-xs flex items-center justify-center p-0 min-w-[20px] bg-gradient-to-r from-blue-500 to-purple-500 border-0 animate-pulse"
                      >
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </Badge>
                    )}
                  </Button>

                  {/* Notifications Dropdown */}
                  {showNotifications && (
                    <div className="absolute right-0 mt-2 w-80 bg-white/95 backdrop-blur-md rounded-xl shadow-2xl border border-emerald-100 z-50 max-h-96 overflow-hidden">
                      <div className="p-4 border-b border-emerald-100 flex justify-between items-center bg-gradient-to-r from-emerald-50 to-teal-50">
                        <h3 className="font-semibold text-gray-900">Notifications</h3>
                        {unreadCount > 0 && (
                          <Button
                            onClick={markAllAsRead}
                            variant="ghost"
                            size="sm"
                            className="text-xs text-emerald-600 hover:text-emerald-700"
                          >
                            Mark all read
                          </Button>
                        )}
                      </div>
                      <ScrollArea className="max-h-64">
                        <div className="p-2">
                          {notifications.length === 0 ? (
                            <p className="text-center text-gray-500 py-8 text-sm">No notifications</p>
                          ) : (
                            notifications.slice(0, 5).map((notification) => (
                              <div
                                key={notification.id}
                                className={`p-3 rounded-lg mb-2 cursor-pointer transition-all duration-200 ${
                                  notification.read 
                                    ? 'bg-gray-50 hover:bg-gray-100' 
                                    : 'bg-gradient-to-r from-emerald-50 to-teal-50 hover:from-emerald-100 hover:to-teal-100 border-l-4 border-emerald-500'
                                }`}
                                onClick={() => !notification.read && markAsRead(notification.id)}
                              >
                                <h4 className="font-medium text-sm text-gray-900">{notification.title}</h4>
                                <p className="text-xs text-gray-600 mt-1 line-clamp-2">{notification.message}</p>
                                <p className="text-xs text-gray-500 mt-1">
                                  {new Date(notification.created_at).toLocaleDateString()}
                                </p>
                              </div>
                            ))
                          )}
                        </div>
                      </ScrollArea>
                    </div>
                  )}
                </div>

                {/* User Info */}
                <div className="flex items-center space-x-3">
                  <div className="text-right hidden sm:block">
                    <p className="text-sm font-medium text-gray-900">{user.name}</p>
                    <Badge variant="outline" className="text-xs bg-gradient-to-r from-emerald-100 to-teal-100 text-emerald-700 border-emerald-200">
                      {user.role}
                    </Badge>
                  </div>
                  <Button
                    onClick={handleLogout}
                    variant="ghost"
                    size="sm"
                    className="text-gray-600 hover:text-red-600 transition-colors p-2 rounded-full hover:bg-red-50"
                    disabled={isLoggingOut}
                  >
                    {isLoggingOut ? (
                      <LoadingSpinner size="sm" variant="default" />
                    ) : (
                      <LogOut className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  to="/login"
                  className="text-emerald-600 hover:text-emerald-700 font-medium transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-6 py-2 rounded-full hover:from-emerald-700 hover:to-teal-700 transition-all duration-200 font-medium shadow-lg hover:shadow-xl hover:scale-105"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 rounded-full bg-emerald-100/50 hover:bg-emerald-100"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile menu - Updated Order */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white/95 backdrop-blur-md border-t border-emerald-100 rounded-b-xl">
              <Link
                to="/"
                className="block px-3 py-2 text-gray-700 hover:text-emerald-600 font-medium transition-colors rounded-lg hover:bg-emerald-50"
                onClick={() => setIsMenuOpen(false)}
              >
                Home
              </Link>
              <Link
                to="/about"
                className="block px-3 py-2 text-gray-700 hover:text-emerald-600 font-medium transition-colors rounded-lg hover:bg-emerald-50"
                onClick={() => setIsMenuOpen(false)}
              >
                About
              </Link>
              <Link
                to="/blog"
                className="block px-3 py-2 text-gray-700 hover:text-emerald-600 font-medium transition-colors rounded-lg hover:bg-emerald-50"
                onClick={() => setIsMenuOpen(false)}
              >
                Blog
              </Link>
              <Link
                to="/franchise"
                className="block px-3 py-2 text-gray-700 hover:text-emerald-600 font-medium transition-colors rounded-lg hover:bg-emerald-50"
                onClick={() => setIsMenuOpen(false)}
              >
                Franchise
              </Link>
              <Link
                to="/order"
                className="block px-3 py-2 text-gray-700 hover:text-emerald-600 font-medium transition-colors rounded-lg hover:bg-emerald-50"
                onClick={() => setIsMenuOpen(false)}
              >
                Order
              </Link>
              {dashboardLink && (
                <Link
                  to={dashboardLink.href}
                  className="block px-3 py-2 text-gray-700 hover:text-emerald-600 font-medium transition-colors rounded-lg hover:bg-emerald-50"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {dashboardLink.label}
                </Link>
              )}
              
              {user ? (
                <div className="border-t border-emerald-100 pt-3 mt-3">
                  <div className="px-3 py-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">{user.name}</p>
                        <Badge variant="outline" className="mt-1 bg-gradient-to-r from-emerald-100 to-teal-100">
                          {user.role}
                        </Badge>
                      </div>
                      <Button
                        onClick={handleLogout}
                        variant="ghost"
                        size="sm"
                        className="text-red-600 hover:bg-red-50"
                        disabled={isLoggingOut}
                      >
                        {isLoggingOut ? (
                          <LoadingSpinner size="sm" variant="default" />
                        ) : (
                          <LogOut className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="border-t border-emerald-100 pt-3 mt-3 space-y-2">
                  <Link
                    to="/login"
                    className="block px-3 py-2 text-emerald-600 hover:text-emerald-700 font-medium transition-colors rounded-lg hover:bg-emerald-50"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Login
                  </Link>
                  <Link
                    to="/signup"
                    className="block px-3 py-2 text-emerald-600 hover:text-emerald-700 font-medium transition-colors rounded-lg hover:bg-emerald-50"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <style>{`
        .nav-link {
          @apply text-gray-700 hover:text-emerald-600 font-medium transition-all duration-200 relative;
        }
        .nav-link:hover {
          @apply transform scale-105;
        }
        .nav-link::after {
          content: '';
          position: absolute;
          width: 0;
          height: 2px;
          bottom: -4px;
          left: 50%;
          background: linear-gradient(to right, #059669, #0d9488);
          transition: all 0.3s ease;
          transform: translateX(-50%);
        }
        .nav-link:hover::after {
          width: 100%;
        }
      `}</style>
    </nav>
  );
};

export default ModernNavbar;