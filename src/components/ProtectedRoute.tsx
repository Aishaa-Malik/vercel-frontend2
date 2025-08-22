import React, { ReactNode, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth, UserRole } from '../contexts/AuthContext';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRoles: UserRole[];
  redirectPath?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRoles,
  redirectPath = '/login',
}) => {
  const { isAuthenticated, isLoading, hasPermission, user } = useAuth();
  const location = useLocation();

  // Debug logging
  useEffect(() => {
    if (user) {
      console.log('ProtectedRoute - User business type:', user.businessType);
      console.log('ProtectedRoute - Current path:', location.pathname);
    }
  }, [user, location.pathname]);

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    console.log('User not authenticated, redirecting to login');
    return <Navigate to={redirectPath} replace />;
  }

  // Check if user has required role
  if (!hasPermission(requiredRoles)) {
    // Redirect to unauthorized page or dashboard based on user role
    return <Navigate to="/unauthorized" replace />;
  }
  
  // Business type routing check
  if (user && user.businessType === 'turf' && 
      location.pathname.startsWith('/dashboard') && 
      !location.pathname.includes('/oauth/') && 
      !location.pathname.includes('/onboarding')) {
    console.log('Turf user trying to access doctor dashboard, redirecting to turf dashboard');
    return <Navigate to="/turf-dashboard" replace />;
  }
  
  if (user && user.businessType === 'doctor' && 
      location.pathname.startsWith('/turf-dashboard') && 
      !location.pathname.includes('/oauth/') && 
      !location.pathname.includes('/onboarding')) {
    console.log('Doctor user trying to access turf dashboard, redirecting to doctor dashboard');
    return <Navigate to="/dashboard" replace />;
  }

  // User is authenticated and has the required role, render the children
  return <>{children}</>;
};

export default ProtectedRoute;