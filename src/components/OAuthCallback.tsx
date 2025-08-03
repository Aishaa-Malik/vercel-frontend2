// src/components/OAuthCallback.tsx
import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabaseService';
import { useAuth } from '../contexts/AuthContext';

const OAuthCallback: React.FC = () => {
  const navigate = useNavigate();
  const { loginFromSession } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<string[]>([]);
  const [email, setEmail] = useState('');
  const hasProcessed = useRef(false);

  const logWithDebug = (message: string) => {
    console.log(message);
    setDebugInfo(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  // Manual user setup function
  const manualUserSetup = async (userId: string, userEmail: string, userMetadata: any) => {
    try {
      logWithDebug('Starting manual user setup...');

      // Step 1: Check if user exists in approved_users
      const { data: approvedUser, error: approvalError } = await supabase
        .from('approved_users')
        .select('email, role, tenant_id, activated_at')
        .eq('email', userEmail)
        .maybeSingle();

      if (approvalError) {
        throw new Error(`Error checking approved users: ${approvalError.message}`);
      }

      if (!approvedUser) {
        throw new Error('You are not on the approved users list. Please contact your administrator.');
      }

      if (approvedUser.activated_at) {
        logWithDebug('User already activated, checking existing records...');
      } else {
        logWithDebug('Found approved user, proceeding with setup...');
      }

      // Step 2: Create user profile
      logWithDebug('Creating user profile...');
      const { error: profileError } = await supabase
        .from('user_profiles')
        .insert({
          id: userId,
          email: userEmail,
          full_name: userMetadata?.full_name || userEmail.split('@')[0],
          phone_number: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (profileError && profileError.code !== '23505') { // Ignore unique violation
        throw new Error(`Profile creation failed: ${profileError.message}`);
      }
      logWithDebug('✅ User profile created/verified');

      // Step 3: Create user role
      logWithDebug('Assigning user role...');
      const { error: roleError } = await supabase
        .from('user_roles')
        .insert({
          user_id: userId,
          role: approvedUser.role
        })
        .select()
        .single();

      if (roleError && roleError.code !== '23505') { // Ignore unique violation
        throw new Error(`Role assignment failed: ${roleError.message}`);
      }
      logWithDebug(`✅ Role assigned: ${approvedUser.role}`);

      // Step 4: Create tenant assignment (if tenant_id exists)
      if (approvedUser.tenant_id) {
        logWithDebug('Assigning tenant...');
        const { error: tenantError } = await supabase
          .from('user_tenants')
          .insert({
            user_id: userId,
            tenant_id: approvedUser.tenant_id
          });

        if (tenantError && tenantError.code !== '23505') { // Ignore unique violation
          throw new Error(`Tenant assignment failed: ${tenantError.message}`);
        }
        logWithDebug('✅ Tenant assigned');
      }

      // Step 5: Mark approved user as activated
      if (!approvedUser.activated_at) {
        logWithDebug('Marking user as activated...');
        const { error: activationError } = await supabase
          .from('approved_users')
          .update({
            activated_at: new Date().toISOString(),
            user_id: userId
          })
          .eq('email', userEmail);

        if (activationError) {
          console.warn('Warning: Could not mark user as activated:', activationError.message);
        } else {
          logWithDebug('✅ User marked as activated');
        }
      }

      logWithDebug('✅ Manual user setup completed successfully');
      return { role: approvedUser.role };

    } catch (error: any) {
      logWithDebug(`❌ Manual setup failed: ${error.message}`);
      throw error;
    }
  };

  // Check if user setup is complete
  const checkUserSetup = async (userId: string) => {
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('id')
      .eq('id', userId)
      .maybeSingle();

    const { data: roleData } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .maybeSingle();

    return {
      profileExists: !!profile,
      roleExists: !!roleData,
      role: roleData?.role
    };
  };

  // Main OAuth processing function
  useEffect(() => {
    if (hasProcessed.current) return;

    const processOAuthCallback = async () => {
      hasProcessed.current = true;

      try {
        logWithDebug('Starting OAuth callback processing');

        // Extract tokens from URL
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const accessToken = hashParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token');

        if (accessToken && refreshToken) {
          logWithDebug('Setting session with tokens from URL');
          const { error: setSessionError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken
          });

          if (setSessionError) {
            throw new Error(`Error setting session: ${setSessionError.message}`);
          }
        }

        // Get current session
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();

        if (sessionError || !sessionData.session) {
          throw new Error('No active session found');
        }

        const session = sessionData.session;
        logWithDebug(`Session confirmed for: ${session.user.email} (${session.user.id})`);

        // Check if user setup is already complete
        const setupStatus = await checkUserSetup(session.user.id);
        logWithDebug(`Setup status - Profile: ${setupStatus.profileExists}, Role: ${setupStatus.roleExists}`);

        let userRole;

        if (setupStatus.profileExists && setupStatus.roleExists) {
          logWithDebug('User setup already complete');
          userRole = setupStatus.role;
        } else {
          logWithDebug('User setup incomplete, starting manual setup...');
          
          // Perform manual user setup
          const setupResult = await manualUserSetup(
            session.user.id,
            session.user.email!,
            session.user.user_metadata
          );
          
          userRole = setupResult.role;
        }

        // Complete authentication
        logWithDebug(`Completing authentication with role: ${userRole}`);
        await loginFromSession(session, userRole);

        // Clear URL hash
        if (window.location.hash) {
          window.history.replaceState(null, '', window.location.pathname);
        }

        logWithDebug('Redirecting to dashboard...');
        navigate('/dashboard', { replace: true });

      } catch (err: any) {
        console.error('OAuth callback error:', err);
        logWithDebug(`Error: ${err.message}`);
        setError(err.message || 'Authentication failed');
      }
    };

    processOAuthCallback();
  }, []);

  // Manual login fallback
  const handleManualLogin = async () => {
    if (!email) {
      alert("Please enter your email");
      return;
    }

    try {
      const { data: approvedUser, error: approvalError } = await supabase
        .from('approved_users')
        .select('email, role')
        .eq('email', email)
        .maybeSingle();

      if (approvalError) {
        throw new Error(`Error checking approval: ${approvalError.message}`);
      }

      if (!approvedUser) {
        throw new Error('You are not on the approved users list. Please contact your administrator.');
      }

      logWithDebug(`User ${email} is approved with role: ${approvedUser.role}`);

      const { error: magicLinkError } = await supabase.auth.signInWithOtp({
        email: email,
        options: {
          shouldCreateUser: true,
          emailRedirectTo: `${window.location.origin}/oauth-callback`
        }
      });

      if (magicLinkError) {
        throw new Error(`Error sending magic link: ${magicLinkError.message}`);
      }

      setError(null);
      logWithDebug(`Magic link sent to ${email}. Please check your email.`);
    } catch (err: any) {
      console.error('Manual login error:', err);
      setError(err.message);
    }
  };

  if (error) {
    return (
      <div className="p-4 text-center">
        <h2 className="text-xl font-bold text-red-600">Authentication Error</h2>
        <p className="mt-2">{error}</p>

        <div className="mt-8 max-w-md mx-auto">
          <h3 className="text-lg font-medium mb-2">Try signing in directly:</h3>
          <div className="flex items-center gap-2">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your approved email"
              className="flex-1 p-2 border rounded"
            />
            <button
              onClick={handleManualLogin}
              className="bg-blue-500 text-white px-4 py-2 rounded"
            >
              Send Link
            </button>
          </div>
        </div>

        <div className="mt-4 p-4 bg-gray-100 text-left rounded text-sm overflow-auto max-h-64">
          <h3 className="font-bold mb-2">Debug Information:</h3>
          {debugInfo.map((line, i) => (
            <div key={i} className="mb-1">{line}</div>
          ))}
        </div>

        <button
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
          onClick={() => navigate('/login')}
        >
          Return to Login
        </button>
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center h-screen">
      <div className="text-center">
        <h2 className="text-xl mb-4">Completing sign in...</h2>
        <div className="w-16 h-16 border-t-4 border-blue-500 border-solid rounded-full animate-spin mx-auto"></div>

        <div className="mt-8 p-4 bg-gray-100 text-left rounded text-sm overflow-auto max-h-64 max-w-lg">
          <h3 className="font-bold mb-2">Status:</h3>
          {debugInfo.map((line, i) => (
            <div key={i} className="mb-1 text-xs">{line}</div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default OAuthCallback;
