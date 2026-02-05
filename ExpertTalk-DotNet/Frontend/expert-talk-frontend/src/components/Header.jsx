import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Header = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getDashboardLink = () => {
    if (!user) return '/';
    
    switch (user.userType) {
      case 1: return '/user-dashboard';
      case 2: return '/expert-dashboard';
      case 3: return '/admin-dashboard';
      default: return '/';
    }
  };

  const getUserTypeLabel = () => {
    if (!user) return '';
    
    switch (user.userType) {
      case 1: return (
        <div className="flex items-center">
          <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
          </svg>
          User
        </div>
      );
      case 2: return (
        <div className="flex items-center">
          <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 1H5C3.89 1 3 1.89 3 3V21C3 22.11 3.89 23 5 23H19C20.11 23 21 22.11 21 21V9M19 21H5V3H13V9H19Z"/>
          </svg>
          Expert
        </div>
      );
      case 3: return (
        <div className="flex items-center">
          <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 24 24">
            <path d="M5 16L3 5l5.5-3L12 4.5 15.5 2 21 5l-2 11H5z"/>
          </svg>
          Admin
        </div>
      );
      default: return '';
    }
  };

  return (
    <header className="bg-white shadow-lg border-b border-gray-200 sticky top-0 z-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-14 sm:h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm sm:text-lg">E</span>
            </div>
            <span className="text-lg sm:text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              ExpertTalk
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            {!user && (
              <>
                <Link 
                  to="/" 
                  className="text-gray-700 hover:text-purple-600 font-medium transition-colors duration-200"
                >
                  Home
                </Link>
                <Link 
                  to="/services" 
                  className="text-gray-700 hover:text-purple-600 font-medium transition-colors duration-200"
                >
                  Services
                </Link>
                <Link 
                  to="/how-it-works" 
                  className="text-gray-700 hover:text-purple-600 font-medium transition-colors duration-200"
                >
                  How It Works
                </Link>
                <Link 
                  to="/about" 
                  className="text-gray-700 hover:text-purple-600 font-medium transition-colors duration-200"
                >
                  About
                </Link>
                <Link 
                  to="/contact" 
                  className="text-gray-700 hover:text-purple-600 font-medium transition-colors duration-200"
                >
                  Contact
                </Link>
              </>
            )}
          </nav>

          {/* Desktop User Actions */}
          <div className="hidden md:flex items-center space-x-3 lg:space-x-4">
            {user ? (
              <>
                <div className="flex items-center space-x-2 lg:space-x-3">
                  <div className="w-7 h-7 lg:w-8 lg:h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-semibold text-xs lg:text-sm">
                      {user.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="text-left hidden lg:block">
                    <div className="text-sm font-semibold text-gray-900 truncate max-w-32">{user.name}</div>
                    <div className="text-xs text-gray-500">{getUserTypeLabel()}</div>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="bg-gradient-to-r from-red-500 to-red-600 text-white px-3 lg:px-4 py-1.5 lg:py-2 rounded-lg font-medium text-sm hover:from-red-600 hover:to-red-700 transition-all duration-200"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-gray-700 hover:text-purple-600 font-medium transition-colors duration-200 text-sm lg:text-base"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 lg:px-6 py-1.5 lg:py-2 rounded-lg font-medium text-sm hover:from-purple-700 hover:to-blue-700 transition-all duration-200"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button 
            className="md:hidden p-2"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-gray-200 py-3">
            <div className="space-y-3">
              {user ? (
                <>
                  <div className="flex items-center space-x-3 px-2 py-2">
                    <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-semibold">
                        {user.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">{user.name}</div>
                      <div className="text-sm text-gray-500">{getUserTypeLabel()}</div>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsMenuOpen(false);
                    }}
                    className="w-full text-left px-2 py-2 text-red-600 font-medium"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link 
                    to="/" 
                    className="block px-2 py-2 text-gray-700 hover:text-purple-600 font-medium"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Home
                  </Link>
                  <Link 
                    to="/services" 
                    className="block px-2 py-2 text-gray-700 hover:text-purple-600 font-medium"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Services
                  </Link>
                  <Link 
                    to="/how-it-works" 
                    className="block px-2 py-2 text-gray-700 hover:text-purple-600 font-medium"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    How It Works
                  </Link>
                  <Link 
                    to="/about" 
                    className="block px-2 py-2 text-gray-700 hover:text-purple-600 font-medium"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    About
                  </Link>
                  <Link 
                    to="/contact" 
                    className="block px-2 py-2 text-gray-700 hover:text-purple-600 font-medium"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Contact
                  </Link>
                  <div className="px-2 py-2 space-y-2">
                    <Link
                      to="/login"
                      className="block w-full text-center py-2 text-gray-700 hover:text-purple-600 font-medium border border-gray-300 rounded-lg"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Sign In
                    </Link>
                    <Link
                      to="/register"
                      className="block w-full text-center py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-medium"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Get Started
                    </Link>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;