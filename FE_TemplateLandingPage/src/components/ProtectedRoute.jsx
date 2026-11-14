import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import LoadingSpinner from './LoadingSpinner';
import { locationToPath } from '../contexts/AuthContext';

export const ProtectedRoute = ({ children, requireAdmin = false }) => {
  const { user, isAuthenticated, loading, isAdmin } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoadingSpinner size="lg" message="Đang kiểm tra quyền truy cập..." />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: locationToPath(location) }} replace />;
  }

  if (requireAdmin && !isAdmin) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
