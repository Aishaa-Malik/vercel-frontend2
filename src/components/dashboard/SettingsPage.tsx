import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../services/supabaseService';

const SettingsPage: React.FC = () => {
  const { user, tenant } = useAuth();
  const [showUsageLimit, setShowUsageLimit] = useState(false);
  const [appointmentUsage, setAppointmentUsage] = useState({ used: 0, total: 0 });
  const [planName, setPlanName] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isGoogleCalendarConnected, setIsGoogleCalendarConnected] = useState(false);

  useEffect(() => {
    const fetchAppointmentUsage = async () => {
      if (!user?.id) return;
      
      try {
        setIsLoading(true);
        // Fetch appointment usage data
        const { data: usageData, error: usageError } = await supabase
          .from('tenant_subscription_usage')
          .select('appointments_used, appointments_limit')
          .eq('tenant_id', tenant?.id)
          .single();
        
        if (usageError) {
          console.error('Error fetching appointment usage:', usageError);
        } else if (usageData) {
          setAppointmentUsage({
            used: usageData.appointments_used || 0,
            total: usageData.appointments_limit || 25 // Default to 25 if not set
          });
        }

        // Fetch subscription plan data
        const { data: planData, error: planError } = await supabase
          .from('tenant_subscriptions')
          .select('plan_name')
          .eq('tenant_id', tenant?.id)
          .single();
        
        if (planError) {
          console.error('Error fetching subscription plan:', planError);
        } else if (planData) {
          setPlanName(planData.plan_name || 'Free Plan');
        }

        // Check if Google Calendar is connected
        const { data: calendarData, error: calendarError } = await supabase
          .from('tenant_integrations')
          .select('is_connected')
          .eq('tenant_id', tenant?.id)
          .eq('integration_type', 'google_calendar')
          .maybeSingle();
        
        if (calendarError) {
          console.error('Error fetching calendar integration status:', calendarError);
        } else {
          setIsGoogleCalendarConnected(!!calendarData?.is_connected);
        }
      } catch (error) {
        console.error('Error in fetching settings data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAppointmentUsage();
  }, [user?.id, tenant?.id]);

  const handleConnectGoogleCalendar = () => {
    // Store current user info in localStorage for when they return from OAuth
    localStorage.setItem('calendarIntegrationTenantId', tenant?.id || '');
    localStorage.setItem('calendarIntegrationUserId', user?.id || '');
    
    // Redirect to Google OAuth
    window.location.href = 'https://aishaa01.app.n8n.cloud/webhook/integrate-google-calender';
  };

  const toggleUsageLimit = () => {
    setShowUsageLimit(!showUsageLimit);
  };

  if (isLoading) {
    return <div className="p-6">Loading settings...</div>;
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Settings</h1>
      
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Subscription Details</h2>
        <div className="mb-4">
          <p className="text-gray-600 mb-1">Current Plan</p>
          <p className="text-lg font-medium">{planName}</p>
        </div>
        
        <button 
          onClick={toggleUsageLimit}
          className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded transition-colors duration-300"
        >
          Check Appointments Usage Limit
        </button>
        
        {showUsageLimit && (
          <div className="mt-4">
            <div className="bg-blue-50 rounded-lg p-4">
              <h3 className="text-lg font-medium text-blue-800 mb-2">Monthly Appointment Usage</h3>
              <p className="text-blue-600 mb-2">{appointmentUsage.used} / {appointmentUsage.total} Appointments used this month</p>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div 
                  className="bg-blue-600 h-2.5 rounded-full" 
                  style={{ width: `${(appointmentUsage.used / appointmentUsage.total) * 100}%` }}
                ></div>
              </div>
              <p className="text-right text-green-600 mt-1">{appointmentUsage.total - appointmentUsage.used} remaining</p>
            </div>
          </div>
        )}
      </div>
      
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Integrations</h2>
        
        <div className="mb-4">
          <h3 className="font-medium mb-2">Google Calendar</h3>
          <p className="text-gray-600 mb-4">
            Connect your Google Calendar to automatically sync your appointments with your calendar.
          </p>
          
          {isGoogleCalendarConnected ? (
            <div className="flex items-center">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Connected
              </span>
              <button 
                className="ml-4 text-sm text-red-600 hover:text-red-800"
                onClick={() => {
                  // Logic to disconnect Google Calendar would go here
                  alert('This would disconnect your Google Calendar');
                }}
              >
                Disconnect
              </button>
            </div>
          ) : (
            <button 
              onClick={handleConnectGoogleCalendar}
              className="inline-flex items-center bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded shadow-sm"
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M6 16.5V7.5C6 6.67157 6.67157 6 7.5 6H16.5C17.3284 6 18 6.67157 18 7.5V16.5C18 17.3284 17.3284 18 16.5 18H7.5C6.67157 18 6 17.3284 6 16.5Z" fill="#34A853" />
                <path d="M14 10L12 12M12 12L10 14M12 12L10 10M12 12L14 14" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              Connect with Google Calendar
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
