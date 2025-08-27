import React, { useState, useEffect } from 'react';
import { useAuth, UserRole } from '../../contexts/AuthContext';
import { supabase } from '../../services/supabaseService';

const DashboardHome: React.FC = () => {
  const { user, tenant } = useAuth();

  // Render different dashboard content based on user role
  const renderDashboardContent = () => {
    if (!user) return null;

    switch (user.role) {
      case UserRole.SUPER_ADMIN:
        return <SuperAdminDashboard />;
      case UserRole.BUSINESS_OWNER:
        return <BusinessOwnerDashboard />;
      case UserRole.DOCTOR:
        return <DoctorDashboard />;
      case UserRole.EMPLOYEE:
        return <EmployeeDashboard />;
      default:
        return <DefaultDashboard />;
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">
          Welcome back, {user?.name}
        </h2>
        {/* <p className="text-gray-600">
          {tenant ? `${tenant.name} Dashboard` : 'Dashboard'}
        </p> */}
      </div>

      {renderDashboardContent()}
    </div>
  );
};

// Super Admin Dashboard
const SuperAdminDashboard: React.FC = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {/* Platform Stats */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Platform Overview</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-blue-50 p-4 rounded-md">
            <p className="text-sm text-blue-500">Total Tenants</p>
            <p className="text-2xl font-bold">24</p>
          </div>
          <div className="bg-green-50 p-4 rounded-md">
            <p className="text-sm text-green-500">Active Users</p>
            <p className="text-2xl font-bold">142</p>
          </div>
          <div className="bg-purple-50 p-4 rounded-md">
            <p className="text-sm text-purple-500">Total Revenue</p>
            <p className="text-2xl font-bold">₹89,450</p>
          </div>
          <div className="bg-yellow-50 p-4 rounded-md">
            <p className="text-sm text-yellow-500">New Signups</p>
            <p className="text-2xl font-bold">7</p>
          </div>
        </div>
      </div>

      {/* Recent Tenants */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Recent Tenants</h3>
        <ul className="divide-y">
          {[1, 2, 3].map((i) => (
            <li key={i} className="py-3">
              <div className="flex justify-between">
                <div>
                  <p className="font-medium">Hospital {i}</p>
                  <p className="text-sm text-gray-500">Added 2 days ago</p>
                </div>
                <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full flex items-center">
                  Active
                </span>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* System Health */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">System Health</h3>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-sm font-medium">Server Load</span>
              <span className="text-sm text-gray-500">24%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-green-500 h-2 rounded-full" style={{ width: '24%' }}></div>
            </div>
          </div>
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-sm font-medium">Database</span>
              <span className="text-sm text-gray-500">62%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-yellow-500 h-2 rounded-full" style={{ width: '62%' }}></div>
            </div>
          </div>
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-sm font-medium">API Health</span>
              <span className="text-sm text-gray-500">98%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-green-500 h-2 rounded-full" style={{ width: '98%' }}></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Business Owner Dashboard
const BusinessOwnerDashboard: React.FC = () => {
  const { user, tenant } = useAuth();
  const [totalAppointments, setTotalAppointments] = useState<number>(0);
  const [todayAppointments, setTodayAppointments] = useState<number>(0);
  const [totalRevenue, setTotalRevenue] = useState<number>(0);
  const [activeStaff, setActiveStaff] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user?.tenantId) return;
      
      try {
        setIsLoading(true);
        
        // Get today's date in YYYY-MM-DD format
        const today = new Date().toISOString().split('T')[0];
        
        // Fetch total appointments
        const { count: totalCount, error: totalError } = await supabase
          .from('Appointments')
          .select('*', { count: 'exact', head: true })
          .eq('tenant_id', user.tenantId);
        
        if (totalError) throw totalError;
        
        // Fetch today's appointments
        const { count: todayCount, error: todayError } = await supabase
          .from('Appointments')
          .select('*', { count: 'exact', head: true })
          .eq('tenant_id', user.tenantId)
          .eq('appointment_date', today);
        
        if (todayError) throw todayError;
        
        // Fetch total revenue
        const { data: revenueData, error: revenueError } = await supabase
          .from('Appointments')
          .select('amount')
          .eq('tenant_id', user.tenantId);
        
        if (revenueError) throw revenueError;
        
        // Calculate total revenue
        const revenue = revenueData.reduce((sum, appointment) => {
          return sum + (appointment.amount || 0);
        }, 0);
        
        // Fetch active staff count
        const { count: staffCount, error: staffError } = await supabase
          .from('Users')
          .select('*', { count: 'exact', head: true })
          .eq('tenant_id', user.tenantId)
          .neq('role', 'BUSINESS_OWNER');
        
        if (staffError) throw staffError;
        
        setTotalAppointments(totalCount || 0);
        setTodayAppointments(todayCount || 0);
        setTotalRevenue(revenue);
        setActiveStaff(staffCount || 0);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchDashboardData();
  }, [user?.tenantId]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {/* Business Stats */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Business Overview</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-blue-50 p-4 rounded-md">
            <p className="text-sm text-blue-500">Total Appointments</p>
            {isLoading ? (
              <div className="animate-pulse h-8 w-16 bg-blue-200 rounded"></div>
            ) : (
              <p className="text-2xl font-bold">{totalAppointments}</p>
            )}
          </div>
          <div className="bg-green-50 p-4 rounded-md">
            <p className="text-sm text-green-500">Today's Appointments</p>
            {isLoading ? (
              <div className="animate-pulse h-8 w-16 bg-green-200 rounded"></div>
            ) : (
              <p className="text-2xl font-bold">{todayAppointments}</p>
            )}
          </div>
          <div className="bg-purple-50 p-4 rounded-md">
            <p className="text-sm text-purple-500">Total Revenue</p>
            {isLoading ? (
              <div className="animate-pulse h-8 w-24 bg-purple-200 rounded"></div>
            ) : (
              <p className="text-2xl font-bold">₹{totalRevenue.toLocaleString()}</p>
            )}
          </div>
          <div className="bg-yellow-50 p-4 rounded-md">
            <p className="text-sm text-yellow-500">Active Staff</p>
            {isLoading ? (
              <div className="animate-pulse h-8 w-16 bg-yellow-200 rounded"></div>
            ) : (
              <p className="text-2xl font-bold">{activeStaff}</p>
            )}
          </div>
        </div>
      </div>

      {/* Recent Appointments */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Recent Appointments</h3>
        <ul className="divide-y">
          {[1, 2, 3].map((i) => (
            <li key={i} className="py-3">
              <div className="flex justify-between">
                <div>
                  <p className="font-medium">Patient {i}</p>
                  <p className="text-sm text-gray-500">Today, 2:00 PM</p>
                </div>
                <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full flex items-center">
                  Confirmed
                </span>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
        <div className="space-y-3">
          <button className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded transition-colors duration-300">
            View Appointments
          </button>
          <button className="w-full bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded transition-colors duration-300">
            View Revenue
          </button>
          <button className="w-full bg-purple-500 hover:bg-purple-600 text-white py-2 px-4 rounded transition-colors duration-300">
            Manage Staff
          </button>
        </div>
      </div>
    </div>
  );
};

// Doctor Dashboard - Updated with dynamic data and matching turf design
const DoctorDashboard: React.FC = () => {
  const { user, tenant } = useAuth();
  const [totalAppointments, setTotalAppointments] = useState<number>(0);
  const [todayAppointments, setTodayAppointments] = useState<number>(0);
  const [totalRevenue, setTotalRevenue] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user?.tenantId || !user?.id) return;
      
      try {
        setIsLoading(true);
        
        // Get today's date in YYYY-MM-DD format
        const today = new Date().toISOString().split('T')[0];
        
        // Fetch total appointments for this doctor
        const { count: totalCount, error: totalError } = await supabase
          .from('Appointments')
          .select('*', { count: 'exact', head: true })
          .eq('tenant_id', user.tenantId)
          .eq('doctor_id', user.id);
        
        if (totalError) throw totalError;
        
        // Fetch today's appointments for this doctor
        const { count: todayCount, error: todayError } = await supabase
          .from('Appointments')
          .select('*', { count: 'exact', head: true })
          .eq('tenant_id', user.tenantId)
          .eq('doctor_id', user.id)
          .eq('appointment_date', today);
        
        if (todayError) throw todayError;
        
        // Fetch total revenue for this doctor
        const { data: revenueData, error: revenueError } = await supabase
          .from('Appointments')
          .select('amount')
          .eq('tenant_id', user.tenantId)
          .eq('doctor_id', user.id);
        
        if (revenueError) throw revenueError;
        
        // Calculate total revenue
        const revenue = revenueData?.reduce((sum, appointment) => {
          return sum + (appointment.amount || 0);
        }, 0) || 0;
        
        setTotalAppointments(totalCount || 0);
        setTodayAppointments(todayCount || 0);
        setTotalRevenue(revenue);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchDashboardData();
  }, [user?.tenantId, user?.id]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Business Stats - Full Width */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 md:col-span-3">
        <h3 className="text-lg font-semibold mb-4 dark:text-white">Business Overview</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Total Appointments Card - Blue */}
          <div className="bg-blue-500 p-6 rounded-lg flex flex-col items-center justify-center text-white">
            <p className="text-sm text-blue-100 mb-2">Total Appointments</p>
            {isLoading ? (
              <div className="animate-pulse h-8 w-16 bg-blue-400 rounded"></div>
            ) : (
              <p className="text-3xl font-bold">{totalAppointments}</p>
            )}
          </div>
          
          {/* Today's Appointments Card - Green */}
          <div className="bg-green-500 p-6 rounded-lg flex flex-col items-center justify-center text-white">
            <p className="text-sm text-green-100 mb-2">Today's Appointments</p>
            {isLoading ? (
              <div className="animate-pulse h-8 w-16 bg-green-400 rounded"></div>
            ) : (
              <p className="text-3xl font-bold">{todayAppointments}</p>
            )}
          </div>
          
          {/* Total Revenue Card - Purple */}
          <div className="bg-purple-500 p-6 rounded-lg flex flex-col items-center justify-center text-white">
            <p className="text-sm text-purple-100 mb-2">Total Revenue</p>
            {isLoading ? (
              <div className="animate-pulse h-8 w-24 bg-purple-400 rounded"></div>
            ) : (
              <p className="text-3xl font-bold">₹{totalRevenue.toLocaleString()}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Employee Dashboard
const EmployeeDashboard: React.FC = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Appointment Queue */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Appointment Queue</h3>
        <ul className="divide-y">
          {[1, 2, 3, 4].map((i) => (
            <li key={i} className="py-3">
              <div className="flex justify-between">
                <div>
                  <p className="font-medium">Patient {i}</p>
                  <p className="text-sm text-gray-500">Dr. Smith • {`${i + 8}:00 AM`}</p>
                </div>
                {i === 1 ? (
                  <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full flex items-center">
                    Checked In
                  </span>
                ) : (
                  <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full flex items-center">
                    Waiting
                  </span>
                )}
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
        <div className="space-y-3">
          <button className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded transition-colors duration-300">
            Check-in Patient
          </button>
          <button className="w-full bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded transition-colors duration-300">
            Schedule Appointment
          </button>
          <button className="w-full bg-purple-500 hover:bg-purple-600 text-white py-2 px-4 rounded transition-colors duration-300">
            Patient Records
          </button>
        </div>
      </div>
    </div>
  );
};

// Default Dashboard (fallback)
const DefaultDashboard: React.FC = () => {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold mb-4">Welcome to the Dashboard</h3>
      <p>Please contact your administrator to set up your dashboard access.</p>
    </div>
  );
};

export default DashboardHome;
