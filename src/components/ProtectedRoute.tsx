import React, { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
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
  const { isAuthenticated, isLoading, hasPermission } = useAuth();

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
    return <Navigate to={redirectPath} replace />;
  }

  // Check if user has required role
  if (!hasPermission(requiredRoles)) {
    // Redirect to unauthorized page or dashboard based on user role
    return <Navigate to="/unauthorized" replace />;
  }

  // User is authenticated and has the required role, render the children
  return <>{children}</>;
};

export default ProtectedRoute;