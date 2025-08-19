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

        const { data: turf_approved_users, error: turf_approvalError } = await supabase
        .from('turf_approved_users')
        .select('email, role, tenant_id, activated_at')
        .eq('email', userEmail)
        .maybeSingle();

      if (approvalError || turf_approvalError) {
        throw new Error(`Error checking approved users: ${approvalError?.message || turf_approvalError?.message}`);
      }

      if (!approvedUser && !turf_approved_users) {
        throw new Error('You are not on the approved users list. Please contact your administrator.');
      }

      // Use the first non-null approved user record (from either table)
      const userRecord = approvedUser ?? turf_approved_users;
      
      if (!userRecord) {
        throw new Error('User record not found in either approved_users or turf_approved_users tables.');
      }

      if (userRecord && userRecord.activated_at) {
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
          role: userRecord?.role ?? null
        })
        .select()
        .single();

      if (roleError && roleError.code !== '23505') { // Ignore unique violation
        throw new Error(`Role assignment failed: ${roleError.message}`);
      }
      logWithDebug(`✅ Role assigned: ${userRecord?.role || 'unknown'}`);

      // Step 4: Create tenant assignment (if tenant_id exists)
      if (userRecord?.tenant_id) {
        logWithDebug('Assigning tenant...');
        const { error: tenantError } = await supabase
          .from('user_tenants')
          .insert({
            user_id: userId,
            tenant_id: userRecord.tenant_id
          });

        if (tenantError && tenantError.code !== '23505') { // Ignore unique violation
          throw new Error(`Tenant assignment failed: ${tenantError.message}`);
        }
        logWithDebug('✅ Tenant assigned');
      }

      // Step 5: Mark approved user as activated in the appropriate table
      if (userRecord && !userRecord.activated_at) {
        logWithDebug('Marking user as activated...');
        
        // Determine which table to update based on which record was found
        const tableName = approvedUser ? 'approved_users' : 'turf_approved_users';
        
        const { error: activationError } = await supabase
          .from(tableName)
          .update({
            activated_at: new Date().toISOString(),
            user_id: userId
          })
          .eq('email', userEmail);

        if (activationError) {
          console.warn(`Warning: Could not mark user as activated in ${tableName}:`, activationError.message);
        } else {
          logWithDebug(`✅ User marked as activated in ${tableName}`);
        }
      }

      logWithDebug('✅ Manual user setup completed successfully');
      return { role: userRecord.role };

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

  // Add this function after the checkUserSetup function
const checkBusinessProfile = async (userId: string) => {
  try {
    logWithDebug('Checking business profile...');
    
    // Get user's tenant_id from user_tenants table
    const { data: userTenant, error: tenantError } = await supabase
      .from('user_tenants')
      .select('tenant_id')
      .eq('user_id', userId)
      .maybeSingle();

    if (tenantError) {
      throw new Error(`Error fetching user tenant: ${tenantError.message}`);
    }

    if (!userTenant?.tenant_id) {
      logWithDebug('No tenant found for user');
      return { businessType: null };
    }

    // Get business profile using tenant_id
    const { data: businessProfile, error: businessError } = await supabase
      .from('business_profiles')
      .select('business_type')
      .eq('tenant_id', userTenant.tenant_id)
      .maybeSingle();

    if (businessError) {
      throw new Error(`Error fetching business profile: ${businessError.message}`);
    }

    logWithDebug(`Business type found: ${businessProfile?.business_type || 'none'}`);
    return { businessType: businessProfile?.business_type || null };

  } catch (error: any) {
    logWithDebug(`Error checking business profile: ${error.message}`);
    return { businessType: null };
  }
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

        // logWithDebug('Redirecting to dashboard...');
        // navigate('/dashboard', { replace: true });

        // Complete authentication
        logWithDebug(`Completing authentication with role: ${userRole}`);
        await loginFromSession(session, userRole);

        // Clear URL hash
        if (window.location.hash) {
          window.history.replaceState(null, '', window.location.pathname);
        }

        // Check business profile to determine redirect route
        const { businessType } = await checkBusinessProfile(session.user.id);
        console.log('businessType', businessType);

        // Get user role from user_roles table
        const { data: userRoleData } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', session.user.id)
          .maybeSingle();

        const userRoleValue = userRoleData?.role;
        console.log('userRole', userRoleValue);

        if (businessType === 'turf') {
          // For turf business type
          if (userRoleValue === 'BUSINESS_OWNER') {
            logWithDebug('Redirecting to turf owner dashboard...');
            navigate('/turf-dashboard', { replace: true });
          } else if (userRoleValue === 'EMPLOYEE') {
            logWithDebug('Redirecting to turf employee dashboard...');
            navigate('/turf-dashboard/employee', { replace: true });
          } else {
            logWithDebug('Redirecting to default turf dashboard...');
            navigate('/turf-dashboard', { replace: true });
          }
        } else {
          // For non-turf business types (doctor, etc.)
          logWithDebug('Redirecting to default dashboard...');
          navigate('/dashboard', { replace: true });
        }
        
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

    const { data: turfApprovedUser, error: turfApprovalError } = await supabase
        .from('turf_approved_users')
        .select('email, role')
        .eq('email', email)
        .maybeSingle();

      if (approvalError || turfApprovalError) {
        throw new Error(`Error checking approval: ${approvalError?.message || turfApprovalError?.message}`);
      }

      if (!approvedUser && !turfApprovedUser) {
        throw new Error('You are not on the approved users list. Please contact your administrator.');
      }
      
      // Use the first non-null approved user record
      const userRecord = approvedUser ?? turfApprovedUser;
      
      if (!userRecord) {
        throw new Error('User record not found in either approved_users or turf_approved_users tables.');
      }

      logWithDebug(`User ${email} is approved with role: ${userRecord.role}`);

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
