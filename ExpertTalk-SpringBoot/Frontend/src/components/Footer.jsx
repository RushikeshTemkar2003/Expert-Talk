import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white py-12 sm:py-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          <div className="sm:col-span-2 lg:col-span-1">
            <h3 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-yellow-400">ExpertTalk</h3>
            <p className="text-gray-400 leading-relaxed text-sm sm:text-base">Connect with verified experts for instant consultation and professional advice across multiple domains.</p>
          </div>
          
          <div>
            <h4 className="font-bold mb-4 sm:mb-6 text-base sm:text-lg">Services</h4>
            <ul className="space-y-2 sm:space-y-3 text-gray-400 text-sm sm:text-base">
              <li><Link to="/services" className="hover:text-white transition-colors block">Finance Consultation</Link></li>
              <li><Link to="/services" className="hover:text-white transition-colors block">Healthcare Advice</Link></li>
              <li><Link to="/services" className="hover:text-white transition-colors block">Technology Support</Link></li>
              <li><Link to="/services" className="hover:text-white transition-colors block">Legal Guidance</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-bold mb-4 sm:mb-6 text-base sm:text-lg">Company</h4>
            <ul className="space-y-2 sm:space-y-3 text-gray-400 text-sm sm:text-base">
              <li><Link to="/about" className="hover:text-white transition-colors block">About Us</Link></li>
              <li><Link to="/how-it-works" className="hover:text-white transition-colors block">How It Works</Link></li>
              <li><Link to="/privacy-policy" className="hover:text-white transition-colors block">Privacy Policy</Link></li>
              <li><Link to="/terms-of-service" className="hover:text-white transition-colors block">Terms of Service</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-bold mb-4 sm:mb-6 text-base sm:text-lg">Contact</h4>
            <div className="space-y-2 sm:space-y-3 text-gray-400 text-sm sm:text-base">
              <p className="break-all">📧 support@experttalk.com</p>
              <p>📞 +91 9876543210</p>
              <p>💬 24/7 Live Chat</p>
              <Link to="/contact" className="block hover:text-white transition-colors">Contact Us</Link>
            </div>
          </div>
        </div>
        
        <div className="border-t border-gray-800 mt-8 sm:mt-12 pt-6 sm:pt-8 text-center text-gray-400">
          <p className="text-sm sm:text-base">&copy; 2026 ExpertTalk. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;