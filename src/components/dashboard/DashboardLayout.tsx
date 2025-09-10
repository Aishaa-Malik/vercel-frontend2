import React, { useState } from 'react';
import { Link, useLocation, Outlet } from 'react-router-dom';
import { useAuth, UserRole } from '../../contexts/AuthContext';
//import { ThemeProvider } from '../../contexts/ThemeContext';
import { useTheme } from '../../contexts/ThemeContext';
//import DarkModeToggle from '../common/DarkModeToggle';

interface NavItem {
  name: string;
  href: string;
  icon: string;
  disabled?: boolean;
}

const DashboardLayout: React.FC = () => {
  const { user, tenant, logout } = useAuth();
  const { darkMode } = useTheme();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };

  // Define navigation items based on user role
  let navItems: NavItem[] = [];
  
  if (user?.role === UserRole.SUPER_ADMIN) {
    navItems = [
      { name: 'Dashboard', href: '/dashboard', icon: 'home' },
      { name: 'Appointments', href: '/dashboard/appointments', icon: 'calendar' },
      { name: 'Schedule', href: '/dashboard/schedule', icon: 'clock' },
      { name: 'Tenants', href: '/dashboard/tenants', icon: 'building' },
      { name: 'Users', href: '/dashboard/users', icon: 'users' },
      { name: 'Analytics', href: '/dashboard/analytics', icon: 'chart-bar' },
      { name: 'Settings', href: '/dashboard/settings', icon: 'cog' },
      { name: 'Billing', href: '/dashboard/billing', icon: 'credit-card' }
    ];
  } else if (user?.role === UserRole.BUSINESS_OWNER) {
    navItems = [
      { name: 'Dashboard', href: '/dashboard', icon: 'home' },
      { name: 'Appointments', href: '/dashboard/appointments', icon: 'calendar' },
      { name: 'Schedule', href: '/dashboard/schedule', icon: 'clock' },
      // { name: 'Doctors', href: '/dashboard/doctors', icon: 'user-md' },
      { name: 'Employee Management', href: '/dashboard/employees', icon: 'users' },
      { name: 'Revenue', href: '/dashboard/revenue', icon: 'chart-bar' },
      { name: 'Settings', href: '/dashboard/settings', icon: 'cog' }
    ];
  } else if (user?.role === UserRole.DOCTOR) {
    navItems = [
      { name: 'Dashboard', href: '/dashboard', icon: 'home' },
      { name: 'Appointments', href: '/dashboard/appointments', icon: 'calendar' },
      { name: 'Schedule', href: '/dashboard/schedule', icon: 'clock' },
      { name: 'Patients', href: '/dashboard/patients', icon: 'user-md' },
      { name: 'Settings', href: '/dashboard/settings', icon: 'cog' }
    ];
  } else {
    navItems = [
      { name: 'Dashboard', href: '/dashboard', icon: 'home' },
      { name: 'Appointments', href: '/dashboard/appointments', icon: 'calendar' },
      { name: 'Schedule', href: '/dashboard/schedule', icon: 'clock' },
    ];
  }

  // Icon component with SVG icons
  const renderIcon = (iconName: string) => {
    switch (iconName) {
      case 'home':
        return (
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
        );
      case 'calendar':
        return (
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        );
      case 'clock':
        return (
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'chart-bar':
        return (
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        );
      case 'cog':
        return (
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        );
      case 'users':
        return (
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
        );
      case 'user-md':
        return (
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        );
      case 'building':
        return (
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
        );
      case 'credit-card':
        return (
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
          </svg>
        );
      default:
        return (
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
          </svg>
        );
    }
  };

  return (
    <div className={`min-h-screen relative ${darkMode ? 'dark bg-gray-900' : 'bg-gray-100'}`}>
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center z-0" 
        style={{
          backgroundImage: 'url(/toriateBack.png)',
          opacity: 0.4,
          pointerEvents: 'none' // Prevent blocking clicks
        }}
      ></div>
      
      {/* Mobile menu */}
      <div className="lg:hidden relative z-20">
        <div className="fixed inset-0 flex z-40">
          <div
            className={`fixed inset-0 bg-gray-600 bg-opacity-75 transition-opacity ease-linear duration-300 ${
              mobileMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
            }`}
            onClick={() => setMobileMenuOpen(false)}
          ></div>
          <div
            className={`relative flex-1 flex flex-col max-w-xs w-full bg-white transition ease-in-out duration-300 transform ${
              mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
            }`}
          >
            <div className="absolute top-0 right-0 -mr-12 pt-2">
              <button
                type="button"
                className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                onClick={() => setMobileMenuOpen(false)}
              >
                <span className="sr-only">Close sidebar</span>
                <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="flex-1 h-0 pt-5 pb-4 overflow-y-auto">
              <div className="flex-shrink-0 flex items-center px-4">
                <span className="text-xl font-bold text-blue-600">Doctor's Dashboard</span>
              </div>
              <nav className="mt-5 px-2 space-y-1">
                {navItems.map((item) => (
                  item.disabled ? (
                    <div
                      key={item.name}
                      className="group flex items-center px-2 py-2 text-base font-medium rounded-md text-gray-400 cursor-not-allowed"
                    >
                      <div className="mr-4 text-gray-300">
                        {renderIcon(item.icon)}
                      </div>
                      {item.name}
                    </div>
                  ) : (
                    <Link
                      key={item.name}
                      to={item.href}
                      className={`group flex items-center px-2 py-2 text-base font-medium rounded-md ${
                        isActive(item.href)
                          ? 'bg-blue-100 text-blue-900'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }`}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <div
                        className={`mr-4 ${
                          isActive(item.href) ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-500'
                        }`}
                      >
                        {renderIcon(item.icon)}
                      </div>
                      {item.name}
                    </Link>
                  )
                ))}
              </nav>
            </div>
            
            {/* Mobile User Profile Section */}
            <div className="flex-shrink-0 flex border-t border-gray-200 p-4">
              <div className="flex items-center">
                {/* User Avatar Circle */}
                <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-semibold text-lg">
                    {user?.name?.charAt(0).toUpperCase() || 'D'}
                  </span>
                </div>
                
                {/* User Info */}
                <div className="ml-3 min-w-0 flex-1">
                  <p className="text-base font-medium text-gray-800 truncate">
                    {user?.name || 'Doctor'}
                  </p>
                  <p className="text-sm text-gray-600 truncate">
                    {user?.email || 'doctor@example.com'}
                  </p>
                  <button
                    onClick={() => logout()}
                    className="text-sm font-medium text-gray-500 hover:text-gray-700"
                  >
                    Sign out
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Static sidebar for desktop */}
      <div className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0 z-20">
        <div className="flex-1 flex flex-col min-h-0 border-r border-gray-200 bg-white">
          <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
            <div className="flex items-center flex-shrink-0 px-4">
              <span className="text-xl font-bold text-blue-600">Doctor Dashboard</span>
            </div>
            <nav className="mt-5 flex-1 px-2 bg-white space-y-1">
              {navItems.map((item) => (
                item.disabled ? (
                  <div
                    key={item.name}
                    className="group flex items-center px-2 py-2 text-sm font-medium rounded-md text-gray-400 cursor-not-allowed"
                  >
                    <div className="mr-3 text-gray-300">
                      {renderIcon(item.icon)}
                    </div>
                    {item.name}
                  </div>
                ) : (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                      isActive(item.href)
                        ? 'bg-blue-100 text-blue-900'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <div
                      className={`mr-3 ${
                        isActive(item.href) ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-500'
                      }`}
                    >
                      {renderIcon(item.icon)}
                    </div>
                    {item.name}
                  </Link>
                )
              ))}
            </nav>
          </div>
          
          {/* Desktop User Profile Section */}
          <div className="flex-shrink-0 flex border-t border-gray-200 p-4">
            <div className="flex items-center w-full">
              {/* User Avatar Circle */}
              <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-white font-semibold text-lg">
                  {user?.name?.charAt(0).toUpperCase() || 'D'}
                </span>
              </div>
              
              {/* User Info */}
              <div className="ml-3 min-w-0 flex-1">
                <p className="text-sm font-medium text-gray-800 truncate">
                  {user?.name || 'Doctor'}
                </p>
                <p className="text-xs text-gray-600 truncate">
                  {user?.email || 'doctor@example.com'}
                </p>
                <button
                  onClick={() => logout()}
                  className="text-xs font-medium text-gray-500 hover:text-gray-700"
                >
                  Sign out
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64 flex flex-col flex-1 relative z-10">
        <div className={`sticky top-0 z-10 lg:hidden pl-1 pt-1 sm:pl-3 sm:pt-3 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
          <button
            type="button"
            className="-ml-0.5 -mt-0.5 h-12 w-12 inline-flex items-center justify-center rounded-md text-gray-500 hover:text-gray-900"
            onClick={() => setMobileMenuOpen(true)}
          >
            <span className="sr-only">Open sidebar</span>
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
        {/* <div className="flex items-center justify-end p-4">
          <DarkModeToggle />
        </div> */}
        <main className="flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;