import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../services/supabaseService';

const TurfSettingsPage: React.FC = () => {
  const { user, tenant } = useAuth();
  const [showUsageLimit, setShowUsageLimit] = useState(false);
  const [bookingUsage, setBookingUsage] = useState({ used: 0, total: 0 });
  const [planName, setPlanName] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isGoogleCalendarConnected, setIsGoogleCalendarConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectError, setConnectError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBookingUsage = async () => {
      if (!user?.id) return;
      
      try {
        setIsLoading(true);
        
        // Check if tenant ID exists
        if (!tenant?.id) {
          console.log('No tenant ID available, using default values');
          setPlanName('Basic');
          setBookingUsage({
            used: 0,
            total: 25
          });
          setIsLoading(false);
          return;
        }
        
        // Fetch subscription data
        const { data: subscription, error: subError } = await supabase
          .from('subscriptions')
          .select(`
            id,
            status,
            billing_cycle_start,
            billing_cycle_end,
            plans!inner (
              name,
              appointment_limit
            )
          `)
          .eq('tenant_id', tenant.id)
          .eq('status', 'active')
          .order('created_at', { ascending: false })
          .limit(1)
          .single();
        
        if (subError) {
          console.error('Error fetching subscription:', subError);
        } else if (subscription) {
          // Handle plans data which could be in different formats
          let planName = 'Free Plan';
          let totalLimit = 25; // Default limit
          
          if (subscription.plans) {
            // Use type assertion to handle the plans object
            const plansObj = subscription.plans as any;
            totalLimit = plansObj.appointment_limit || 25;
            planName = plansObj.name || 'Free Plan';
          }
          
          setPlanName(planName);
          
          // Fetch booking usage
          const { data: usageData } = await supabase
            .from('TurfAppointments')
            .select('id')
            .gte('appointment_date', subscription.billing_cycle_start)
            .lt('appointment_date', subscription.billing_cycle_end)
            .eq('tenant_id', tenant?.id);
          
          const usedBookings = usageData?.length || 0;
          
          setBookingUsage({
            used: usedBookings,
            total: totalLimit
          });
        } else {
          // Fallback to fetch from plans table directly
          const { data: plansData } = await supabase
            .from('plans')
            .select('name')
            .eq('id', 'efa453b6-ff8b-43cf-83b0-15ce8765dc03') // Basic plan ID from the screenshot
            .single();
            
          if (plansData) {
            setPlanName(plansData.name || 'Basic');
            // Set default usage values
            setBookingUsage({
              used: 0,
              total: 25 // Default for Basic plan
            });
          }
        }
        
        // Check if Google Calendar is connected
        if (tenant?.id) {
          const { data: calendarData, error: calendarError } = await supabase
            .from('tenant_integrations')
            .select('is_connected')
            .eq('tenant_id', tenant.id)
            .eq('integration_type', 'google_calendar')
            .maybeSingle();
          
          if (calendarError) {
            console.error('Error fetching calendar integration status:', calendarError);
          } else {
            setIsGoogleCalendarConnected(!!calendarData?.is_connected);
          }
        } else {
          console.log('No tenant ID available, cannot check calendar integration');
          setIsGoogleCalendarConnected(false);
        }
      } catch (error) {
        console.error('Error in fetching settings data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBookingUsage();
  }, [user?.id, tenant?.id]);

  // Success message state
  const [connectSuccess, setConnectSuccess] = useState<string | null>(null);

  // Check for OAuth callback parameters
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const connected = urlParams.get('connected');
    const error = urlParams.get('error');

    if (connected === 'true') {
      setIsGoogleCalendarConnected(true);
      // Show success message
      setConnectSuccess('Google Calendar connected successfully!');

      // Clean URL
      window.history.replaceState({}, '', '/turf-dashboard/settings');
    }

    if (error) {
      const errorMessages = {
        'oauth_failed': 'Google OAuth authentication failed.',
        'token_exchange_failed': 'Failed to exchange token with Google.',
        'missing_params': 'Required parameters missing for Google Calendar connection.',
        'unknown': 'An unknown error occurred while connecting to Google Calendar.'
      };
      
      setConnectError(errorMessages[error as keyof typeof errorMessages] || 'Failed to connect Google Calendar. Please try again.');
      // Clean URL
      window.history.replaceState({}, '', '/turf-dashboard/settings');
    }
  }, []);

  const handleConnectGoogleCalendar = async () => {
    try {
      setIsConnecting(true);
      setConnectError(null);
      
      // Construct Google OAuth URL
      const googleAuthUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
      googleAuthUrl.searchParams.set('client_id', '942527714249-cdbhr135tk3icfqse2edotf1idttem55.apps.googleusercontent.com'); // Google client ID
      googleAuthUrl.searchParams.set('redirect_uri', 'http://localhost:3000/oauth/callback');
      googleAuthUrl.searchParams.set('scope', 'https://www.googleapis.com/auth/calendar');
      googleAuthUrl.searchParams.set('response_type', 'code');
      googleAuthUrl.searchParams.set('access_type', 'offline');
      googleAuthUrl.searchParams.set('prompt', 'consent'); // Forces refresh_token
      
      // Ensure user_id is included and tenant_id if available
      const stateObj = {
        user_id: user?.id || ''
      };
      
      // Only add tenant_id if it exists
      if (tenant?.id) {
        Object.assign(stateObj, { tenant_id: tenant.id });
      } else {
        console.log('No tenant ID available for Google Calendar integration');
      }
      
      console.log('OAuth state object:', stateObj);
      googleAuthUrl.searchParams.set('state', JSON.stringify(stateObj));
      
      // Redirect to Google OAuth
      window.location.href = googleAuthUrl.toString();
      
    } catch (error) {
      setConnectError('Failed to initiate Google OAuth');
      setIsConnecting(false);
    }
  };
  

  const toggleUsageLimit = () => {
    setShowUsageLimit(!showUsageLimit);
  };

  if (isLoading) {
    return <div className="p-6">Loading settings...</div>;
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6 dark:text-white">Settings</h1>
      
      <div className="bg-black bg-opacity-80 rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4 dark:text-white">Subscription Details</h2>
        <div className="mb-4 p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
          <p className="text-gray-700 dark:text-gray-300 mb-1">Current Plan</p>
          <p className="text-2xl font-medium dark:text-white flex items-center">
            <span className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-3 py-1 rounded-full mr-2">{planName}</span>
            <span className="text-green-600 dark:text-green-400 text-sm">Active</span>
          </p>
        </div>
        
        <button 
          onClick={toggleUsageLimit}
          className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded transition-colors duration-300 flex items-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
          </svg>
          Check Bookings Usage Limit
        </button>
        
        {showUsageLimit && (
          <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-md p-4 mt-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200">
                  Monthly Booking Usage
                </h3>
                <p className="text-sm text-blue-600 dark:text-blue-300">
                  {bookingUsage.used} / {bookingUsage.total} Bookings used this month
                </p>
              </div>
              <div className="text-right">
                <div className={`text-lg font-bold ${(bookingUsage.total - bookingUsage.used) > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                  {bookingUsage.total - bookingUsage.used} remaining
                </div>
              </div>
            </div>
            <div className="mt-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div 
                className="bg-blue-600 dark:bg-blue-500 h-2 rounded-full" 
                style={{ width: `${Math.min((bookingUsage.used / Math.max(bookingUsage.total, 1)) * 100, 100)}%` }}
              ></div>
            </div>
            {bookingUsage.used >= bookingUsage.total && (
              <p className="text-sm text-red-600 dark:text-red-400 mt-2 p-2 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 rounded">
                <span className="font-medium">Limit reached:</span> You've reached your monthly booking limit. Please upgrade your plan to book more bookings.
              </p>
            )}
          </div>
        )}
      </div>
      
      <div className="bg-black bg-opacity-80 rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4 dark:text-white">Integrations</h2>
        
        <div className="mb-4 p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
          <h3 className="font-medium mb-2 dark:text-white flex items-center">
            <svg className="w-5 h-5 mr-2 text-blue-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
            </svg>
            Google Calendar
          </h3>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            Connect your Google Calendar to automatically sync your bookings with your calendar.
          </p>
          
          {isGoogleCalendarConnected ? (
            <div>
              <div className="flex items-center">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200">
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Connected
                </span>
                <button 
                  className="ml-4 text-sm text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 transition-colors duration-200"
                  onClick={() => {
                    // Logic to disconnect Google Calendar would go here
                    alert('This would disconnect your Google Calendar');
                  }}
                >
                  Disconnect
                </button>
              </div>
              {connectSuccess && (
                <p className="text-sm text-green-600 dark:text-green-400 mt-2 font-medium">{connectSuccess}</p>
              )}
            </div>
          ) : (
            <div>
              <button 
                onClick={handleConnectGoogleCalendar}
                disabled={isConnecting}
                className="inline-flex items-center bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 px-4 py-2 rounded shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
              >
                {isConnecting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-gray-700 dark:text-gray-300" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Connecting...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M6 16.5V7.5C6 6.67157 6.67157 6 7.5 6H16.5C17.3284 6 18 6.67157 18 7.5V16.5C18 17.3284 17.3284 18 16.5 18H7.5C6.67157 18 6 17.3284 6 16.5Z" fill="#34A853" />
                      <path d="M14 10L12 12M12 12L10 14M12 12L10 10M12 12L14 14" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                    Connect with Google Calendar
                  </>
                )}
              </button>
              {connectError && (
                <p className="text-sm text-red-600 dark:text-red-400 mt-2">{connectError}</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TurfSettingsPage;