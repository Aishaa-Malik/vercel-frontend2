import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../services/supabaseService';
import { useAuth } from '../contexts/AuthContext';

const OAuthCallback: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { loginFromSession } = useAuth();
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');
  const [message, setMessage] = useState('Processing your request...');

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const code = searchParams.get('code');
        const state = searchParams.get('state');
        const error = searchParams.get('error');
        
        console.log('OAuth callback params:', { code: code?.substring(0, 20), state, error });

        // Handle OAuth errors
        if (error) {
          console.error('OAuth error from Google:', error);
          setStatus('error');
          setMessage('Authentication failed.');
          setTimeout(() => {
            const redirectPath = window.location.href.includes('turf') ? '/turf-dashboard' : '/dashboard';
            navigate(`${redirectPath}?error=oauth_failed`, { replace: true });
          }, 2000);
          return;
        }

        // Handle Supabase auth session (for login flow)
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (session && !code) {
          console.log('Supabase auth session found, logging in user');
          localStorage.setItem('authToken', session.access_token);
          await loginFromSession(session.access_token, session.user);
          
          setTimeout(() => {
            navigate('/dashboard', { replace: true });
          }, 1000);
          return;
        }

        // Handle Google Calendar integration (when code is present)
        if (code && state) {
          try {
            console.log('Processing Google Calendar integration...');
            
            // Parse state data
            let stateData;
            try {
              stateData = JSON.parse(state);
              console.log('Parsed state data:', stateData);
            } catch (parseError) {
              console.error('Failed to parse state JSON:', parseError);
              throw new Error('Invalid state parameter from Google');
            }
            
            if (!stateData.user_id) {
              throw new Error('Missing user_id in OAuth state');
            }
            
            setMessage('Connecting your Google Calendar...');
            
            // Call edge function for token exchange
            console.log('Invoking handle-google-oauth edge function...');
            const { data, error: edgeError } = await supabase.functions.invoke('handle-google-oauth', {
              body: {
                code,
                tenant_id: stateData.tenant_id || null,
                user_id: stateData.user_id
              }
            });
            
            if (edgeError) {
              console.error('Edge function error:', {
                message: edgeError.message,
                details: edgeError.details || 'No additional details',
                status: edgeError.status || 'Unknown status'
              });
              throw new Error(edgeError.message || 'Failed to process calendar integration');
            }

            console.log('Calendar integration successful:', data);
            setStatus('success');
            setMessage('Google Calendar connected successfully! Redirecting...');
            
            // Redirect after success with delay
            setTimeout(() => {
              const redirectPath = window.location.href.includes('turf') ? '/turf-dashboard' : '/dashboard';
              navigate(`${redirectPath}?connected=google_calendar`, { replace: true });
            }, 1500);
            
          } catch (integrationError) {
            console.error('Calendar integration error:', integrationError);
            setStatus('error');
            setMessage('Failed to connect Google Calendar. Please try again.');
            
            setTimeout(() => {
              const redirectPath = window.location.href.includes('turf') ? '/turf-dashboard' : '/dashboard';
              navigate(`${redirectPath}?error=calendar_integration_failed`, { replace: true });
            }, 2000);
          }
        } else if (!session) {
          // No code, no session - invalid callback
          console.error('Invalid OAuth callback - missing code and session');
          setStatus('error');
          setMessage('Invalid authentication callback.');
          
          setTimeout(() => {
            navigate('/login?error=invalid_callback', { replace: true });
          }, 2000);
        }
      } catch (error) {
        console.error('OAuth callback handler error:', error);
        setStatus('error');
        setMessage('An unexpected error occurred during authentication.');
        
        setTimeout(() => {
          const redirectPath = window.location.href.includes('turf') ? '/turf-dashboard' : '/login';
          navigate(`${redirectPath}?error=callback_handler_failed`, { replace: true });
        }, 2000);
      }
    };

    handleCallback();
  }, [searchParams, navigate, loginFromSession]);

  // Show status UI
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        {status === 'processing' && (
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
        )}
        <p className="text-gray-600">{message}</p>
        {status === 'error' && (
          <p className="text-sm text-gray-500 mt-2">You will be redirected shortly...</p>
        )}
      </div>
    </div>
  );
};

export default OAuthCallback;
