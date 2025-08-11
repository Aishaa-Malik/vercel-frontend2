import React, { useState } from 'react';
import { Link, useLocation, Outlet } from 'react-router-dom';
import { useAuth, UserRole } from '../../contexts/AuthContext';

const DashboardLayout: React.FC = () => {
  const { user, tenant, logout } = useAuth();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  // Define navigation items based on user role
  const getNavigationItems = () => {
    if (!user) return [];

    const commonItems = [
      { name: 'Dashboard', path: '/dashboard', icon: 'home' },
      { name: 'Appointments', path: '/dashboard/appointments', icon: 'calendar' },
    ];

    switch (user.role) {
      case UserRole.SUPER_ADMIN:
        return [
          ...commonItems,
          { name: 'Tenants', path: '/dashboard/tenants', icon: 'building' },
          { name: 'Users', path: '/dashboard/users', icon: 'users' },
          { name: 'Analytics', path: '/dashboard/analytics', icon: 'chart-bar' },
          { name: 'Settings', path: '/dashboard/settings', icon: 'cog' },
          { name: 'Billing', path: '/dashboard/billing', icon: 'credit-card' },
        ];
      case UserRole.BUSINESS_OWNER:
        return [
          ...commonItems,
          { name: 'Revenue', path: '/dashboard/revenue', icon: 'cash-register' },
          { name: 'User Management', path: '/dashboard/users', icon: 'users' },
          { name: 'Settings', path: '/dashboard/settings', icon: 'cog' },
        ];
      case UserRole.DOCTOR:
        return [
          ...commonItems,
          { name: 'Patients', path: '/dashboard/patients', icon: 'user-md' },
        ];
      case UserRole.EMPLOYEE:
        return commonItems;
      default:
        return commonItems;
    }
  };

  const navItems = getNavigationItems();

  // Icon component (placeholder - in a real app, you would use an icon library)
  const Icon = ({ name }: { name: string }) => {
    return <span className="w-5 h-5 mr-3">📊</span>;
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div
        className={`${
          isSidebarOpen ? 'w-64' : 'w-20'
        } bg-white shadow-lg transition-all duration-300 ease-in-out flex flex-col`}
      >
        {/* Sidebar header */}
        <div className="flex items-center justify-between h-16 px-4 border-b">
          {isSidebarOpen ? (
            <div className="flex items-center">
              <span className="text-xl font-semibold">Dashboard</span>
            </div>
          ) : (
            <div className="w-full flex justify-center">
              <span className="text-xl font-semibold">D</span>
            </div>
          )}
          <button
            onClick={toggleSidebar}
            className="p-2 rounded-md hover:bg-gray-100"
          >
            {isSidebarOpen ? '◀' : '▶'}
          </button>
        </div>

        {/* Tenant info */}
        {tenant && (
          <div className={`px-4 py-3 border-b ${!isSidebarOpen && 'text-center'}`}>
            {isSidebarOpen ? (
              <div>
                <p className="font-medium text-sm">{tenant.name}</p>
                <p className="text-xs text-gray-500">
                  {user?.role.replace('_', ' ')}
                </p>
              </div>
            ) : (
              <div className="text-center">
                <p className="font-medium text-sm">{tenant.name.charAt(0)}</p>
              </div>
            )}
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4">
          <ul className="space-y-2 px-2">
            {navItems.map((item) => (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`flex items-center px-4 py-3 rounded-md transition-colors duration-200 ${
                    location.pathname === item.path
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Icon name={item.icon} />
                  {isSidebarOpen && <span>{item.name}</span>}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* User section */}
        <div className="border-t p-4">
          {isSidebarOpen ? (
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-sm">{user?.name}</p>
                <p className="text-xs text-gray-500">{user?.email}</p>
              </div>
              <button
                onClick={logout}
                className="p-2 text-gray-500 hover:text-red-500"
              >
                🚪
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center mb-2">
                {user?.name?.charAt(0) || 'U'}
              </div>
              <button
                onClick={logout}
                className="p-1 text-gray-500 hover:text-red-500"
              >
                🚪
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-x-hidden overflow-y-auto">
        {/* Top header */}
        <header className="bg-white shadow-sm h-16 flex items-center px-6">
          <div className="flex-1">
            <h1 className="text-xl font-semibold text-gray-800">
              {navItems.find((item) => item.path === location.pathname)?.name || 'Dashboard'}
            </h1>
          </div>
          <div className="flex items-center space-x-4">
            {/* Notification bell */}
            <button className="p-2 rounded-full hover:bg-gray-100">
              🔔
            </button>
            {/* User menu (mobile only) */}
            <div className="md:hidden">
              <button className="p-2 rounded-full hover:bg-gray-100">
                👤
              </button>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout; 