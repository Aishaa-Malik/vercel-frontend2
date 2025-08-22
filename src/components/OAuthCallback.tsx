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
        // Check if we have a session from the OAuth redirect
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (session) {
          console.log('Session found after OAuth redirect');
          // Store the auth token in localStorage
          localStorage.setItem('authToken', session.access_token);
          // Update auth context with the new session
          await loginFromSession(session.access_token, session.user);
        }
        
        const code = searchParams.get('code');
        const state = searchParams.get('state');
        console.log('Hie Code:', code);
        console.log('Hie State:', state); 
        const error = searchParams.get('error') || sessionError?.message;

        if (error) {
          console.error('OAuth error:', error);
          setStatus('error');
          setMessage('Authentication failed.');
          // Figure out if we need to go to turf dashboard or regular dashboard
          const isForTurf = window.location.href.includes('turf');
          const redirectPath = isForTurf ? '/turf-dashboard/settings' : '/dashboard/settings';
          navigate(`${redirectPath}?error=oauth_failed`, { replace: true });
          return;
        }

        if (code && state) {
          try {
            // Parse state to get tenant_id and user_id
            console.log('Raw state from Google:', state);
            let stateData;
            try {
              stateData = JSON.parse(state);
              console.log('Parsed state data:', stateData);
            } catch (parseError) {
              console.error('Failed to parse state JSON:', parseError);
              throw new Error('Invalid state parameter');
            }
            
            if (!stateData.user_id) {
              console.error('Missing user_id in state');
              throw new Error('Missing user_id in state');
            }
            
            // Call Supabase Edge Function to handle token exchange
            console.log('Calling Edge Function with code and state data');

           // console.log('Code:', code);
            console.log('hello doston - State Data:', stateData.tenant_id);
            const { data, error } = await supabase.functions.invoke('handle-google-oauth', {
              body: {
                code,
                tenant_id: stateData.tenant_id || null, // Handle missing tenant_id
                user_id: stateData.user_id
              }
            });
            
            console.log('Edge Function response:', data || 'No data', error || 'No error');

            if (error) throw error;

            console.log('Calendar integration successful:', data);
            setStatus('success');
            setMessage('Calendar connected successfully!');
            
            // Redirect back to settings with success
            const isForTurf = window.location.pathname.includes('turf');
            const redirectPath = isForTurf ? '/turf-dashboard/settings' : '/dashboard/settings';
            navigate(`${redirectPath}?connected=true`, { replace: true });
          } catch (error) {
            console.error('Token exchange failed:', error);
            setStatus('error');
            setMessage('Failed to connect your calendar.');
            // Figure out if we need to go to turf dashboard or regular dashboard
            const isForTurfError = window.location.href.includes('turf');
            const redirectPathError = isForTurfError ? '/turf-dashboard/settings' : '/dashboard/settings';
            navigate(`${redirectPathError}?error=token_exchange_failed`, { replace: true });
          }
        } else {
          setStatus('error');
          setMessage('Missing required parameters.');
          // Determine which dashboard to redirect to
          const redirectToTurf = window.location.href.includes('turf');
          const settingsPath = redirectToTurf ? '/turf-dashboard/settings' : '/dashboard/settings';
          navigate(`${settingsPath}?error=missing_params`, { replace: true });
        }
      } catch (error) {
        console.error('OAuth callback error:', error);
        setStatus('error');
        setMessage('An unexpected error occurred.');
        // Determine which dashboard to redirect to in case of error
        const goToTurf = window.location.href.includes('turf');
        const errorPath = goToTurf ? '/turf-dashboard/settings' : '/dashboard/settings';
        navigate(`${errorPath}?error=unknown`, { replace: true });
      }
    };

    handleCallback();
  }, [searchParams, navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <p className="mt-4">{message}</p>
        {status === 'error' && (
          <button 
            onClick={() => {
              const toTurf = window.location.href.includes('turf');
              navigate(toTurf ? '/turf-dashboard/settings' : '/dashboard/settings');
            }}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
          >
            Return to Settings
          </button>
        )}
      </div>
    </div>
  );
};

export default OAuthCallback;