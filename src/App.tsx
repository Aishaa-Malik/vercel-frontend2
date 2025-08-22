import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth, UserRole } from './contexts/AuthContext';
import './App.css';

// Components
import Header from './components/Header';
import LandingPage3 from './components/LandingPage3';
import LoginPage from './components/LoginPage';
import DashboardLayout from './components/dashboard/DashboardLayout';
import DashboardHome from './components/dashboard/DashboardHome';
import RevenuePage from './components/dashboard/RevenuePage';
import TenantsManagement from './components/dashboard/TenantsManagement';
import UserManagement from './components/dashboard/UserManagement';
import SettingsPage from './components/dashboard/SettingsPage';
import AppointmentsPage from './components/AppointmentsPage';
import SchedulePage from './components/SchedulePage';
import OAuthCallback from './components/OAuthCallback';
import PaymentCallback from './components/PaymentCallback';
import ProtectedRoute from './components/ProtectedRoute';
import UnauthorizedPage from './components/UnauthorizedPage';
import UpdatePassword from './components/UpdatePassword';
import OnboardingForm from './components/OnboardingForm';


// Turf owner components
import TurfDashboardLayout from './components/turf/TurfDashboardLayout';
import TurfDashboardHome from './components/turf/TurfDashboardHome';
import TurfRevenuePage from './components/turf/TurfRevenuePage';
import TurfUserManagement from './components/turf/TurfUserManagement';
import TurfAppointmentsPage from './components/turf/TurfAppointmentsPage';
import TurfEmployeeDashboard from './components/turf/TurfEmployeeDashboard';
import TurfEmployeeDashboardLayout from './components/turf/TurfEmployeeDashboardLayout';
import TurfSettingsPage from './components/turf/TurfSettingsPage';

// Check if user needs onboarding
const OnboardingCheck = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  const [needsOnboarding, setNeedsOnboarding] = useState<boolean | null>(true);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkOnboardingStatus = async () => {
      if (!user?.id) return;
      
      try {
        console.log("Fetching onboarding status for user:", user.id);
        const response = await fetch(`http://localhost:5001/api/check-onboarding?email=${user.email}&userId=${user.id}`);

        console.log("Onboarding check response:", response);
        console.log("Onboarding check response status:", response.status);
        const { data, error } = await response.json();
        console.log("data", data);
        
        if (error) throw error;
        setNeedsOnboarding(data?.needsOnboarding || false);
        console.log("data", data);
        console.log("needsOnboarding", data?.needsOnboarding);
      } catch (err) {
        console.error('Error checking onboarding status:', err);
        // Default to not needing onboarding if there's an error
        setNeedsOnboarding(false);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkOnboardingStatus();
    console.log("needsOnboarding", needsOnboarding);
    // Add a more visible log to track when the check is performed
    console.log("========= ONBOARDING CHECK PERFORMED =========");
  }, [user?.id]);
  
  if (isLoading) return <div>Loading...</div>;
  
  if (needsOnboarding) {
    console.log("needsOnboarding", needsOnboarding);
    return <Navigate to="/onboarding" replace />;
  }
  
  return <>{children}</>;
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="App">
          <Routes>
            <Route path="/" element={<LandingPage3 />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/oauth/callback" element={<OAuthCallback/>} />
            <Route path="/payment-callback" element={<PaymentCallback />} />
            <Route path="/unauthorized" element={<UnauthorizedPage />} />
            <Route path="/update-password" element={<UpdatePassword />} />
            
            {/* Onboarding Route */}
            <Route 
              path="/onboarding" 
              element={
                <ProtectedRoute requiredRoles={[UserRole.BUSINESS_OWNER]}>
                  <OnboardingForm />
                </ProtectedRoute>
              } 
            />

            {/* Doctor Dashboard Routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute requiredRoles={[UserRole.BUSINESS_OWNER, UserRole.DOCTOR, UserRole.EMPLOYEE]}>
                  <OnboardingCheck>
                    <DashboardLayout />
                  </OnboardingCheck>
                </ProtectedRoute>
              }
            >
              <Route index element={<DashboardHome />} />
              <Route path="appointments" element={<AppointmentsPage />} />
              <Route path="schedule" element={<SchedulePage />} />
              <Route path="revenue" element={<RevenuePage />} />
              <Route path="tenants" element={<TenantsManagement />} />
              <Route path="users" element={<UserManagement />} />
              <Route path="settings" element={<SettingsPage />} />
            </Route>

            {/* Direct routes for Revenue and User Management */}
            <Route path="/revenue" element={
              <ProtectedRoute requiredRoles={[UserRole.BUSINESS_OWNER, UserRole.DOCTOR]}>
                <OnboardingCheck>
                  <DashboardLayout />
                </OnboardingCheck>
              </ProtectedRoute>
            }>
              <Route index element={<RevenuePage />} />
            </Route>
            
            <Route path="/UserManagement" element={
              <ProtectedRoute requiredRoles={[UserRole.BUSINESS_OWNER, UserRole.DOCTOR]}>
                <OnboardingCheck>
                  <DashboardLayout />
                </OnboardingCheck>
              </ProtectedRoute>
            }>
              <Route index element={<UserManagement />} />
            </Route>
            
            {/* Additional route for /users */}
            <Route path="/users" element={
              <ProtectedRoute requiredRoles={[UserRole.BUSINESS_OWNER, UserRole.DOCTOR]}>
                <OnboardingCheck>
                  <DashboardLayout />
                </OnboardingCheck>
              </ProtectedRoute>
            }>
              <Route index element={<UserManagement />} />
            </Route>

            {/* Turf Owner Dashboard Routes */}
            <Route
              path="/turf-dashboard"
              element={
                <ProtectedRoute requiredRoles={[UserRole.BUSINESS_OWNER]}>
                  <OnboardingCheck>
                    <TurfDashboardLayout />
                  </OnboardingCheck>
                </ProtectedRoute>
              }
            >
              <Route index element={<TurfDashboardHome />} />
              <Route path="revenue" element={<TurfRevenuePage/>} />
              <Route path="bookings" element={<TurfAppointmentsPage/>} />
              <Route path="schedule" element={<SchedulePage />} />
              <Route path="users" element={<TurfUserManagement />} />
              <Route path="settings" element={<TurfSettingsPage />} />
            </Route>
            
            {/* Turf Employee Dashboard Routes */}
            <Route
              path="/turf-dashboard/employee"
              element={
                <ProtectedRoute requiredRoles={[UserRole.BUSINESS_OWNER, UserRole.EMPLOYEE]}>
                  <OnboardingCheck>
                    <TurfEmployeeDashboardLayout />
                  </OnboardingCheck>
                </ProtectedRoute>
              }
            >
              <Route index element={<TurfEmployeeDashboard />} />
              <Route path="bookings" element={<TurfAppointmentsPage/>} />
              <Route path="schedule" element={<SchedulePage />} />
              {/* <Route path="revenue" element={<TurfRevenuePage/>} /> */}
              <Route path="users" element={<TurfUserManagement />} />
            </Route>
          </Routes>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;