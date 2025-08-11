import React from 'react'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'
// import LandingPage from './components/LandingPage'
import LoginPage from './components/LoginPage'
//import PaymentPage from './components/PaymentPage'
import Header from './components/Header'
//import Mentors from './components/Mentors'
// import About from './components/About'
// import Contact from './components/Contact'
import AppointmentsPage from './components/AppointmentsPage'
import RevenuePage from './components/dashboard/RevenuePage'
import UnauthorizedPage from './components/UnauthorizedPage'
import ProtectedRoute from './components/ProtectedRoute'
import DashboardLayout from './components/dashboard/DashboardLayout'
import DashboardHome from './components/dashboard/DashboardHome'
import UserManagement from './components/dashboard/UserManagement'
import TenantsManagement from './components/dashboard/TenantsManagement'
import { AuthProvider, UserRole } from './contexts/AuthContext'
import LandingPage3 from './components/LandingPage3'
import UpdatePassword from './components/UpdatePassword'
import OAuthCallback from './components/OAuthCallback'
import PaymentCallback from './components/PaymentCallback';

const App: React.FC = () => {

  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gradient-to-br">
          {/* Only show header on non-dashboard routes */}
          <Routes>
            <Route path="/dashboard/*" element={null} />
            <Route path="*" element={<Header />} />
          </Routes>
          
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<LandingPage3 />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/update-password" element={<UpdatePassword />} />
            {/* <Route path="/mentors" element={<Mentors />} />
            <Route path="/about" element={<About/>} />
            <Route path="/contact" element={<Contact/>} /> */}
            <Route path="/unauthorized" element={<UnauthorizedPage />} />

            <Route path="/oauth-callback" element={<OAuthCallback />} />
            
            <Route path="/payment-callback" element={<PaymentCallback />} />

            {/* Dashboard routes with role-based protection */}
            <Route path="/dashboard" element={<DashboardLayout />}>
              {/* Dashboard home - accessible to all authenticated users */}
              <Route element={
                <ProtectedRoute 
                  requiredRoles={[
                    UserRole.SUPER_ADMIN, 
                    UserRole.BUSINESS_OWNER,
                    UserRole.BUSINESS_ADMIN,
                    UserRole.DOCTOR,
                    UserRole.EMPLOYEE
                  ]} 
                />
              }>
                <Route index element={<DashboardHome />} />
              </Route>

              {/* Appointments - accessible to all authenticated users */}
              <Route element={
                <ProtectedRoute 
                  requiredRoles={[
                    UserRole.SUPER_ADMIN, 
                    UserRole.BUSINESS_OWNER,
                    UserRole.BUSINESS_ADMIN,
                    UserRole.DOCTOR,
                    UserRole.EMPLOYEE
                  ]} 
                />
              }>
                <Route path="appointments" element={<AppointmentsPage />} />
              </Route>

              {/* Revenue - accessible to super admin and business owner only */}
              <Route element={
                <ProtectedRoute 
                  requiredRoles={[UserRole.SUPER_ADMIN, UserRole.BUSINESS_OWNER, UserRole.BUSINESS_ADMIN]} 
                />
              }>
                <Route path="revenue" element={<RevenuePage />} />
              </Route>

              {/* User Management - accessible to super admin and business owner only */}
              <Route element={
                <ProtectedRoute 
                  requiredRoles={[UserRole.SUPER_ADMIN, UserRole.BUSINESS_OWNER, UserRole.BUSINESS_ADMIN]} 
                />
              }>
                <Route path="user-management" element={<UserManagement />} />
              </Route>

              {/* Tenants Management - accessible to super admin only */}
              <Route element={
                <ProtectedRoute 
                  requiredRoles={[UserRole.SUPER_ADMIN]} 
                />
              }>
                <Route path="tenants" element={<TenantsManagement />} />
              </Route>

              {/* Analytics - accessible to super admin only */}
              <Route element={
                <ProtectedRoute 
                  requiredRoles={[UserRole.SUPER_ADMIN]} 
                />
              }>
                <Route path="analytics" element={<div>Analytics Dashboard (Coming Soon)</div>} />
              </Route>

              {/* Settings - accessible to super admin and business owner */}
              <Route element={
                <ProtectedRoute 
                  requiredRoles={[UserRole.SUPER_ADMIN, UserRole.BUSINESS_OWNER, UserRole.BUSINESS_ADMIN]} 
                />
              }>
                <Route path="settings" element={<div>Settings (Coming Soon)</div>} />
              </Route>
            </Route>

            {/* Fallback 404 route */}
            <Route path="*" element={<div>404 Page Not Found</div>} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
};

export default App