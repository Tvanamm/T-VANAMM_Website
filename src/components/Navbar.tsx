
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { useNotifications } from '@/hooks/useNotifications';
import { 
  Menu, 
  X, 
  Bell, 
  User, 
  LogOut, 
  Settings,
  ChevronDown
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const { user, logout } = useAuth();
  const { notifications, unreadCount, markAsRead } = useNotifications();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const handleNotificationClick = (notification: any) => {
    markAsRead(notification.id);
    setShowNotifications(false);
    
    // Navigate based on notification type
    if (notification.type === 'new_franchise_order') {
      navigate('/admin-dashboard');
    } else if (notification.type === 'order_confirmed') {
      navigate('/franchise-dashboard');
    }
  };

  return (
    <nav className="bg-white shadow-lg fixed w-full top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-3">
              <img 
                src="/lovable-uploads/1c685642-4ebe-4af6-a614-bded8340dfa2.png" 
                alt="T Vanamm Logo" 
                className="h-10 w-auto hover:scale-105 transition-transform duration-200"
              />
              <span className="text-2xl font-bold" style={{color: 'rgb(0,100,55)'}}>
                T VANAMM
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/" className="text-gray-700 hover:text-green-700 transition-colors">
              Home
            </Link>
            <Link to="/franchise" className="text-gray-700 hover:text-green-700 transition-colors">
              Franchise
            </Link>
            <Link to="/order" className="text-gray-700 hover:text-green-700 transition-colors">
              Order
            </Link>
            <Link to="/contact" className="text-gray-700 hover:text-green-700 transition-colors">
              Contact
            </Link>

            {user ? (
              <div className="flex items-center space-x-4">
                {/* Notifications */}
                {(user.role === 'owner' || user.role === 'admin' || user.role === 'franchise') && (
                  <div className="relative">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowNotifications(!showNotifications)}
                      className="relative"
                    >
                      <Bell className="h-5 w-5" />
                      {unreadCount > 0 && (
                        <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs bg-red-500 hover:bg-red-600">
                          {unreadCount}
                        </Badge>
                      )}
                    </Button>

                    {showNotifications && (
                      <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg border border-gray-200 z-50">
                        <div className="p-3 border-b border-gray-200">
                          <h3 className="font-semibold text-gray-900">Notifications</h3>
                        </div>
                        <div className="max-h-64 overflow-y-auto">
                          {notifications.length > 0 ? (
                            notifications.slice(0, 5).map((notification) => (
                              <div
                                key={notification.id}
                                onClick={() => handleNotificationClick(notification)}
                                className={`p-3 border-b border-gray-100 cursor-pointer hover:bg-gray-50 ${
                                  !notification.read ? 'bg-blue-50' : ''
                                }`}
                              >
                                <p className="font-medium text-sm text-gray-900">
                                  {notification.title}
                                </p>
                                <p className="text-xs text-gray-600 mt-1">
                                  {notification.message}
                                </p>
                                <p className="text-xs text-gray-400 mt-1">
                                  {new Date(notification.created_at).toLocaleDateString()}
                                </p>
                              </div>
                            ))
                          ) : (
                            <div className="p-4 text-center text-gray-500 text-sm">
                              No notifications
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* User Menu */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="flex items-center space-x-2">
                      <User className="h-5 w-5" />
                      <span className="hidden lg:block">{user.name || user.email}</span>
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuItem onClick={() => navigate('/profile')}>
                      <User className="mr-2 h-4 w-4" />
                      Profile
                    </DropdownMenuItem>
                    
                    {user.role === 'owner' && (
                      <DropdownMenuItem onClick={() => navigate('/owner-dashboard')}>
                        <Settings className="mr-2 h-4 w-4" />
                        Owner Dashboard
                      </DropdownMenuItem>
                    )}
                    
                    {user.role === 'admin' && (
                      <DropdownMenuItem onClick={() => navigate('/admin-dashboard')}>
                        <Settings className="mr-2 h-4 w-4" />
                        Admin Dashboard
                      </DropdownMenuItem>
                    )}
                    
                    {(user.role === 'franchise' || user.isFranchiseMember) && (
                      <DropdownMenuItem onClick={() => navigate('/franchise-dashboard')}>
                        <Settings className="mr-2 h-4 w-4" />
                        Franchise Dashboard
                      </DropdownMenuItem>
                    )}
                    
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout}>
                      <LogOut className="mr-2 h-4 w-4" />
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Button 
                  variant="outline" 
                  onClick={() => navigate('/login')}
                  className="border-green-700 text-green-700 hover:bg-green-50"
                >
                  Login
                </Button>
                <Button 
                  onClick={() => navigate('/register')}
                  className="bg-green-700 hover:bg-green-800 text-white"
                >
                  Register
                </Button>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-700 hover:text-green-700 focus:outline-none focus:text-green-700"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t">
              <Link
                to="/"
                className="block px-3 py-2 text-gray-700 hover:text-green-700 transition-colors"
                onClick={() => setIsOpen(false)}
              >
                Home
              </Link>
              <Link
                to="/franchise"
                className="block px-3 py-2 text-gray-700 hover:text-green-700 transition-colors"
                onClick={() => setIsOpen(false)}
              >
                Franchise
              </Link>
              <Link
                to="/order"
                className="block px-3 py-2 text-gray-700 hover:text-green-700 transition-colors"
                onClick={() => setIsOpen(false)}
              >
                Order
              </Link>
              <Link
                to="/contact"
                className="block px-3 py-2 text-gray-700 hover:text-green-700 transition-colors"
                onClick={() => setIsOpen(false)}
              >
                Contact
              </Link>

              {user ? (
                <div className="pt-4 pb-3 border-t border-gray-200">
                  <div className="flex items-center px-5">
                    <div className="flex-shrink-0">
                      <User className="h-6 w-6 text-gray-400" />
                    </div>
                    <div className="ml-3">
                      <div className="text-base font-medium text-gray-800">
                        {user.name || user.email}
                      </div>
                      <div className="text-sm font-medium text-gray-500">
                        {user.role}
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 px-2 space-y-1">
                    <button
                      onClick={() => {
                        navigate('/profile');
                        setIsOpen(false);
                      }}
                      className="block px-3 py-2 text-gray-700 hover:text-green-700 transition-colors w-full text-left"
                    >
                      Profile
                    </button>
                    <button
                      onClick={handleLogout}
                      className="block px-3 py-2 text-gray-700 hover:text-green-700 transition-colors w-full text-left"
                    >
                      Logout
                    </button>
                  </div>
                </div>
              ) : (
                <div className="pt-4 pb-3 border-t border-gray-200 space-y-2 px-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      navigate('/login');
                      setIsOpen(false);
                    }}
                    className="w-full border-green-700 text-green-700 hover:bg-green-50"
                  >
                    Login
                  </Button>
                  <Button
                    onClick={() => {
                      navigate('/register');
                      setIsOpen(false);
                    }}
                    className="w-full bg-green-700 hover:bg-green-800 text-white"
                  >
                    Register
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
