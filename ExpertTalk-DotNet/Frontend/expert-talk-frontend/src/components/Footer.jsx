import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white py-16">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-2xl font-bold mb-6 text-yellow-400">ExpertTalk</h3>
            <p className="text-gray-400 leading-relaxed">Connect with verified experts for instant consultation and professional advice across multiple domains.</p>
          </div>
          
          <div>
            <h4 className="font-bold mb-6 text-lg">Services</h4>
            <ul className="space-y-3 text-gray-400">
              <li><Link to="/services" className="hover:text-white transition-colors">Finance Consultation</Link></li>
              <li><Link to="/services" className="hover:text-white transition-colors">Healthcare Advice</Link></li>
              <li><Link to="/services" className="hover:text-white transition-colors">Technology Support</Link></li>
              <li><Link to="/services" className="hover:text-white transition-colors">Legal Guidance</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-bold mb-6 text-lg">Company</h4>
            <ul className="space-y-3 text-gray-400">
              <li><Link to="/about" className="hover:text-white transition-colors">About Us</Link></li>
              <li><Link to="/how-it-works" className="hover:text-white transition-colors">How It Works</Link></li>
              <li><Link to="/privacy-policy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
              <li><Link to="/terms-of-service" className="hover:text-white transition-colors">Terms of Service</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-bold mb-6 text-lg">Contact</h4>
            <div className="space-y-3 text-gray-400">
              <p>📧 support@experttalk.com</p>
              <p>📞 +91 9876543210</p>
              <p>💬 24/7 Live Chat</p>
              <Link to="/contact" className="block hover:text-white transition-colors">Contact Us</Link>
            </div>
          </div>
        </div>
        
        <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
          <p>&copy; 2024 ExpertTalk. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;