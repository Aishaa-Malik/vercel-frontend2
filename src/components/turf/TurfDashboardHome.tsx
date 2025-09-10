import React from 'react';
import { useAuth, UserRole } from '../../contexts/AuthContext';

// Business Owner Dashboard
import { useState, useEffect } from 'react';
import { supabase } from '../../services/supabaseService';

const TurfDashboardHome: React.FC = () => {
  const { user, tenant } = useAuth();

  // Render different dashboard content based on user role
  const renderDashboardContent = () => {
    if (!user) return null;

    switch (user.role) {
      case UserRole.SUPER_ADMIN:
        return <SuperAdminDashboard />;
      case UserRole.BUSINESS_OWNER:
        return <BusinessOwnerDashboard />;
      // case UserRole.DOCTOR:
      //   return <DoctorDashboard />;
      case UserRole.EMPLOYEE:
        return <EmployeeDashboard />;
      default:
        return <TenantDashboard />;
    }
  };

  return (
    <div className="h-full w-full p-6 flex flex-col items-center justify-center">
      <div className="w-full max-w-4xl mx-auto flex justify-between items-center mb-6 px-4">
        <div className="flex flex-col">
          <div className="text-sm text-gray-300 opacity-70">Welcome back</div>
          <div className="flex items-center">
            <h1 className="text-2xl font-bold text-white">{user?.name || 'Johnson'}</h1>
            <span className="text-2xl ml-2">👋</span>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <div className="bg-black bg-opacity-70 backdrop-blur-md rounded-full px-4 py-2 text-white text-sm">
            Home
          </div>
          <div className="bg-black bg-opacity-70 backdrop-blur-md rounded-full px-4 py-2 text-white text-sm">
            Page 1
          </div>
          <div className="bg-black bg-opacity-70 backdrop-blur-md rounded-full px-4 py-2 text-white text-sm flex items-center">
            Select date
            <svg className="w-4 h-4 ml-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </div>
        </div>
      </div>
      
      <div className="w-full max-w-4xl mx-auto bg-black bg-opacity-30 backdrop-blur-md rounded-2xl p-6 overflow-hidden">
        {renderDashboardContent()}
      </div>
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


const BusinessOwnerDashboard: React.FC = () => {
  const { user, tenant } = useAuth();
  const [totalAppointments, setTotalAppointments] = useState<number>(0);
  const [todayAppointments, setTodayAppointments] = useState<number>(0);
  const [totalRevenue, setTotalRevenue] = useState<number>(0);
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
          .from('TurfAppointments')
          .select('*', { count: 'exact', head: true })
          .eq('tenant_id', user.tenantId);
        
        if (totalError) throw totalError;
        
        // Fetch today's appointments
        const { count: todayCount, error: todayError } = await supabase
          .from('TurfAppointments')
          .select('*', { count: 'exact', head: true })
          .eq('tenant_id', user.tenantId)
          .eq('appointment_date', today);
        
        if (todayError) throw todayError;
        
        // Fetch total revenue
        const { data: revenueData, error: revenueError } = await supabase
          .from('TurfAppointments')
          .select('amount')
          .eq('tenant_id', user.tenantId);
        
        if (revenueError) throw revenueError;
        
        // Calculate total revenue
        const revenue = revenueData.reduce((sum, appointment) => {
          return sum + (appointment.amount || 0);
        }, 0);
        
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
  }, [user?.tenantId])

  return (
    <div className="grid grid-cols-12 gap-6">
      {/* Stats cards */}
      <div className="col-span-12 sm:col-span-6 md:col-span-3 h-40 bg-white bg-opacity-10 backdrop-blur-md rounded-xl p-4 flex flex-col">
        <div className="flex items-center justify-between mb-2">
          <div className="text-lg font-medium text-white">Total Appointments</div>
          <div className="bg-white bg-opacity-10 px-2 py-1 rounded-full text-xs text-gray-300">All time</div>
        </div>
        <div className="mt-auto mb-2">
          <div className="text-4xl font-bold text-white">
            {isLoading ? (
              <div className="animate-pulse h-8 w-16 bg-gray-700 rounded"></div>
            ) : (
              totalAppointments
            )}
          </div>
        </div>
      </div>
      
      <div className="col-span-12 sm:col-span-6 md:col-span-3 h-40 bg-white bg-opacity-10 backdrop-blur-md rounded-xl p-4 flex flex-col">
        <div className="flex items-center justify-between mb-2">
          <div className="text-lg font-medium text-white">Today's Appointments</div>
          <div className="bg-white bg-opacity-10 px-2 py-1 rounded-full text-xs text-gray-300">Today</div>
        </div>
        <div className="mt-auto mb-2">
          <div className="text-4xl font-bold text-white">
            {isLoading ? (
              <div className="animate-pulse h-8 w-16 bg-gray-700 rounded"></div>
            ) : (
              todayAppointments
            )}
          </div>
        </div>
      </div>
      
      <div className="col-span-12 sm:col-span-6 md:col-span-3 h-40 bg-white bg-opacity-10 backdrop-blur-md rounded-xl p-4 flex flex-col">
        <div className="flex items-center justify-between mb-2">
          <div className="text-lg font-medium text-white">Revenue</div>
          <div className="bg-white bg-opacity-10 px-2 py-1 rounded-full text-xs text-gray-300">Total earnings</div>
        </div>
        <div className="mt-auto mb-2">
          <div className="text-4xl font-bold text-white">
            {isLoading ? (
              <div className="animate-pulse h-8 w-24 bg-gray-700 rounded"></div>
            ) : (
              `₹${totalRevenue.toLocaleString()}`
            )}
          </div>
        </div>
      </div>
      
      <div className="col-span-12 sm:col-span-6 md:col-span-3 h-40 bg-white bg-opacity-10 backdrop-blur-md rounded-xl p-4 flex items-center justify-center cursor-pointer hover:bg-white hover:bg-opacity-20 transition-all">
        <div className="text-7xl font-bold text-white">+</div>
      </div>

      {/* Recent Transactions */}
      <div className="col-span-6">
        <div className="bg-black bg-opacity-40 backdrop-blur-md rounded-xl p-4 h-full">
          <div className="flex justify-between items-center mb-4">
            <div className="text-sm font-medium text-white">Recent Transactions</div>
            <div className="text-xs text-gray-400">View All</div>
          </div>
          <div className="space-y-3">
            {isLoading ? (
              [...Array(3)].map((_, i) => (
                <div key={i} className="animate-pulse flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="h-8 w-8 rounded-full bg-gray-700 mr-3"></div>
                    <div>
                      <div className="h-4 w-24 bg-gray-700 rounded mb-2"></div>
                      <div className="h-3 w-16 bg-gray-700 rounded"></div>
                    </div>
                  </div>
                  <div className="h-4 w-16 bg-gray-700 rounded"></div>
                </div>
              ))
            ) : (
              [...Array(3)].map((_, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="h-8 w-8 rounded-full bg-gray-700 flex items-center justify-center text-white text-xs mr-3">
                      {String.fromCharCode(65 + i)}
                    </div>
                    <div>
                      <div className="text-sm text-white">Patient {i+1}</div>
                      <div className="text-xs text-gray-400">{new Date().toLocaleDateString()}</div>
                    </div>
                  </div>
                  <div className="text-sm text-white">₹{500 * (i+1)}</div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Appointments */}
      <div className="col-span-6">
        <div className="bg-black bg-opacity-40 backdrop-blur-md rounded-xl p-4 h-full">
          <div className="flex justify-between items-center mb-4">
            <div className="text-sm font-medium text-white">Upcoming Appointments</div>
            <div className="text-xs text-gray-400">View All</div>
          </div>
          <div className="h-[calc(100%-2rem)] flex items-center justify-center">
            <div className="text-gray-500 text-sm">No appointments scheduled</div>
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

// Tenant Dashboard
const TenantDashboard: React.FC = () => {
  return (
    <div className="grid grid-cols-12 gap-6">
      {/* Stats cards */}
      <div className="col-span-12 sm:col-span-6 md:col-span-3 h-48 bg-gray-300 bg-opacity-20 backdrop-blur-md rounded-xl p-4 flex flex-col">
        <div className="flex items-center justify-between mb-2">
          <div className="text-lg font-medium text-white">Earnings</div>
          <div className="bg-white bg-opacity-10 px-2 py-1 rounded-full text-xs text-gray-300">27 aug 23</div>
        </div>
        <div className="mt-auto mb-2">
          <div className="text-5xl font-bold text-white">2.5k</div>
        </div>
      </div>
      <div className="col-span-12 sm:col-span-6 md:col-span-3 h-48 bg-black bg-opacity-40 backdrop-blur-md rounded-xl p-4 flex flex-col">
        <div className="flex items-center justify-between mb-2">
          <div className="text-lg font-medium text-white">Bookings</div>
          <div className="bg-white bg-opacity-10 px-2 py-1 rounded-full text-xs text-gray-300">27 aug 23</div>
        </div>
        <div className="mt-auto mb-2">
          <div className="text-5xl font-bold text-white">17</div>
        </div>
      </div>
      <div className="col-span-12 sm:col-span-6 md:col-span-3 h-48 bg-black bg-opacity-40 backdrop-blur-md rounded-xl p-4 flex flex-col">
        <div className="flex items-center justify-between mb-2">
          <div className="text-lg font-medium text-white">Staff</div>
          <div className="bg-white bg-opacity-10 px-2 py-1 rounded-full text-xs text-gray-300">27 aug 23</div>
        </div>
        <div className="mt-auto mb-2">
          <div className="text-5xl font-bold text-white">2</div>
        </div>
      </div>
      <div className="col-span-12 sm:col-span-6 md:col-span-3 h-48 bg-black bg-opacity-40 backdrop-blur-md rounded-xl p-4 flex items-center justify-center cursor-pointer hover:bg-white hover:bg-opacity-20 transition-all">
        <div className="text-8xl font-thin text-white">+</div>
      </div>

      {/* Recent Transactions */}
      <div className="col-span-6">
        <div className="bg-black bg-opacity-40 backdrop-blur-md rounded-xl p-4 h-full">
          <div className="flex justify-between items-center mb-4">
            <div className="text-sm font-medium text-white">Recent Transactions</div>
            <div className="text-xs text-gray-400">View All</div>
          </div>
          <div className="space-y-3">
            {[1, 2, 3].map((transaction) => (
              <div key={transaction} className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="h-8 w-8 rounded-full bg-gray-700 flex items-center justify-center text-white text-xs mr-3">
                    {String.fromCharCode(64 + transaction)}
                  </div>
                  <div>
                    <div className="text-sm text-white">Customer {transaction}</div>
                    <div className="text-xs text-gray-400">{new Date().toLocaleDateString()}</div>
                  </div>
                </div>
                <div className="text-sm text-white">₹{500 * transaction}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Appointments */}
      <div className="col-span-6">
        <div className="bg-black bg-opacity-40 backdrop-blur-md rounded-xl p-4 h-full">
          <div className="flex justify-between items-center mb-4">
            <div className="text-sm font-medium text-white">Appointments</div>
            <div className="text-xs text-gray-400">View All</div>
          </div>
          <div className="h-[calc(100%-2rem)] flex items-center justify-center">
            <div className="text-gray-500 text-sm">No appointments scheduled</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TurfDashboardHome;