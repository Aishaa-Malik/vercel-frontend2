import React from 'react';
import { useAuth, UserRole } from '../../contexts/AuthContext';

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
        return <DefaultDashboard />;
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">
          Welcome back, {user?.name}
        </h2>
        <p className="text-gray-600">
          {tenant ? `${tenant.name} Dashboard` : 'Dashboard'}
        </p>
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
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {/* Business Stats */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Business Overview</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-blue-50 p-4 rounded-md">
            <p className="text-sm text-blue-500">Total Appointments</p>
            <p className="text-2xl font-bold">48</p>
          </div>
          <div className="bg-green-50 p-4 rounded-md">
            <p className="text-sm text-green-500">Today's Appointments</p>
            <p className="text-2xl font-bold">12</p>
          </div>
          <div className="bg-purple-50 p-4 rounded-md">
            <p className="text-sm text-purple-500">Total Revenue</p>
            <p className="text-2xl font-bold">₹24,500</p>
          </div>
          <div className="bg-yellow-50 p-4 rounded-md">
            <p className="text-sm text-yellow-500">Active Staff</p>
            <p className="text-2xl font-bold">8</p>
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

// Doctor Dashboard
const DoctorDashboard: React.FC = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Today's Schedule */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Today's Schedule</h3>
        <ul className="divide-y">
          {[1, 2, 3, 4].map((i) => (
            <li key={i} className="py-3">
              <div className="flex justify-between">
                <div>
                  <p className="font-medium">Patient {i}</p>
                  <p className="text-sm text-gray-500">{`${i + 8}:00 AM - ${i + 8}:30 AM`}</p>
                </div>
                <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full flex items-center">
                  Upcoming
                </span>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* Patient Notes */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Recent Patient Notes</h3>
        <ul className="divide-y">
          {[1, 2, 3].map((i) => (
            <li key={i} className="py-3">
              <div>
                <div className="flex justify-between">
                  <p className="font-medium">Patient {i}</p>
                  <p className="text-xs text-gray-500">Yesterday</p>
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  Follow-up appointment scheduled. Patient reported improvement in symptoms.
                </p>
              </div>
            </li>
          ))}
        </ul>
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

export default TurfDashboardHome; 