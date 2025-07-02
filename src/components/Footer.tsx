
import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Instagram, Twitter, MapPin, Phone, Mail, Clock } from 'lucide-react';

const Footer = () => {
  const handleVisitOffice = () => {
    window.open('https://g.co/kgs/y58Ek8D', '_blank');
  };

  return (
    <footer className="bg-gradient-to-r from-emerald-800 to-green-900 text-white py-12">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="col-span-1 md:col-span-1">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mr-3">
                <span className="text-emerald-800 font-bold text-xl">T</span>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Tvanamm</h2>
                <p className="text-emerald-200 text-sm">Premium Tea & Beverages</p>
              </div>
            </div>
            <p className="text-emerald-100 mb-4 leading-relaxed">
              Experience the finest blend of traditional tea culture with modern innovation. 
              From our tea gardens to your cup, we deliver excellence.
            </p>
            <div className="flex space-x-3">
              <a href="#" className="w-10 h-10 bg-emerald-600 rounded-full flex items-center justify-center hover:bg-emerald-500 transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="w-10 h-10 bg-emerald-600 rounded-full flex items-center justify-center hover:bg-emerald-500 transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="w-10 h-10 bg-emerald-600 rounded-full flex items-center justify-center hover:bg-emerald-500 transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li><Link to="/" className="text-emerald-100 hover:text-white transition-colors">Home</Link></li>
              <li><Link to="/about" className="text-emerald-100 hover:text-white transition-colors">About Us</Link></li>
              <li><Link to="/products" className="text-emerald-100 hover:text-white transition-colors">Our Teas</Link></li>
              <li><Link to="/franchise" className="text-emerald-100 hover:text-white transition-colors">Franchise</Link></li>
              <li><Link to="/contact" className="text-emerald-100 hover:text-white transition-colors">Contact</Link></li>
              <li><Link to="/order" className="text-emerald-100 hover:text-white transition-colors">Order Online</Link></li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Our Services</h3>
            <ul className="space-y-2">
              <li className="text-emerald-100">Premium Tea Blends</li>
              <li className="text-emerald-100">Franchise Opportunities</li>
              <li className="text-emerald-100">Bulk Orders</li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Contact Info</h3>
            <div className="space-y-3">
              <div className="flex items-start">
                <MapPin className="h-5 w-5 text-emerald-300 mt-1 mr-3 flex-shrink-0" />
                <div>
                  <span className="text-emerald-100 text-sm">
                    Plot No. 12, Rd Number 8, Gayatri Nagar, Vivekananda Nagar, Kukatpally, Hyderabad, Telangana 500072
                  </span>
                  <div className="mt-1">
                    <button
                      onClick={handleVisitOffice}
                      className="text-emerald-300 hover:text-white text-sm underline"
                    >
                      Visit Our Office
                    </button>
                  </div>
                </div>
              </div>
              <div className="flex items-center">
                <Phone className="h-5 w-5 text-emerald-300 mr-3" />
                <div className="text-emerald-100">
                  <div>+91 9000008479</div>
                  <div>+91 9390658544</div>
                </div>
              </div>
              <div className="flex items-center">
                <Mail className="h-5 w-5 text-emerald-300 mr-3" />
                <span className="text-emerald-100">info@tvanamm.com</span>
              </div>
              <div className="flex items-center">
                <Clock className="h-5 w-5 text-emerald-300 mr-3" />
                <span className="text-emerald-100">7:00 AM - 11:00 PM, Daily</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-emerald-700 mt-8 pt-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-emerald-200 text-sm">
              © 2025 Tvanamm. All rights reserved.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <Link to="/privacy" className="text-emerald-200 hover:text-white text-sm transition-colors">
                Privacy Policy
              </Link>
              <Link to="/terms" className="text-emerald-200 hover:text-white text-sm transition-colors">
                Terms of Service
              </Link>
              <Link to="/support" className="text-emerald-200 hover:text-white text-sm transition-colors">
                Support
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
