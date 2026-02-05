import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/login" />;
  }
  
  if (!allowedRoles.includes(user.userType)) {
    switch (user.userType) {
      case 1: return <Navigate to="/user-dashboard" />;
      case 2: return <Navigate to="/expert-dashboard" />;
      case 3: return <Navigate to="/admin-dashboard" />;
      default: return <Navigate to="/" />;
    }
  }
  
  return <>{children}</>;
};

export default ProtectedRoute;