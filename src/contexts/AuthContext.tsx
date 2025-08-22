import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Define user roles
export enum UserRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  BUSINESS_OWNER = 'BUSINESS_OWNER',
  BUSINESS_ADMIN = 'BUSINESS_ADMIN',
  DOCTOR = 'DOCTOR',
  EMPLOYEE = 'EMPLOYEE'
}

// Define tenant (hospital/clinic) interface
export interface Tenant {
  id: string;
  name: string;
  // Add other tenant-specific properties as needed
}

// Define user interface
export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  tenantId?: string; // Optional for super admin who isn't tied to a specific tenant
  businessType?: 'doctor' | 'turf'; // Type of business the user belongs to
}

interface AuthContextType {
  user: User | null;
  tenant: Tenant | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  hasPermission: (requiredRoles: UserRole[]) => boolean;
  loginFromSession: (token: string, user: any) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Authentication method
  const login = async (email: string, password: string) => {
    console.log('Login attempt for:', email);
    setIsLoading(true);
    try {
      const { signIn, getCurrentSession, getUserRole, getUserTenant } = await import('../services/supabaseService');

      // Authenticate via Supabase
      console.log('Calling signIn method');
      const { session } = await signIn(email, password);
      console.log('Sign in result - session exists:', !!session);

      if (!session) {
        throw new Error('Invalid email or password');
      }

      // Fetch additional info
      const userId = session.user.id;
      console.log('User ID:', userId);
      
      console.log('Fetching user role');
      const role = await getUserRole(userId);
      console.log('User role:', role);
      
      if (!role) {
        console.warn('No role found for user, defaulting to EMPLOYEE');
      }
    
      console.log('Fetching user tenant');
      const tenantId = await getUserTenant(userId);
      console.log('User tenant ID:', tenantId);
      
      // Get the business type
      console.log('Fetching business type');
      const { getUserBusinessType } = await import('../services/supabaseService');
      const businessType = await getUserBusinessType(userId);
      console.log('User business type:', businessType);

      const userData: User = {
        id: userId,
        email: session.user.email ?? email,
        name: session.user.user_metadata?.full_name ?? email.split('@')[0],
        role: role ?? UserRole.EMPLOYEE,
        tenantId: tenantId ?? undefined,
        businessType: businessType as 'doctor' | 'turf'
      };

      console.log('User data constructed:', userData);

      // If user belongs to a tenant, fetch tenant details
      if (tenantId) {
        try {
          const { getTenantDetails } = await import('../services/supabaseService');
          const tenantData = await getTenantDetails(tenantId);
          console.log('Tenant data:', tenantData);
          setTenant(tenantData);
        } catch (tenantError) {
          console.error('Error fetching tenant details:', tenantError);
          // Continue login even if tenant fetch fails
        }
      }

      // Store the token in localStorage
      console.log('Storing auth token');
      localStorage.setItem('authToken', session.access_token);

      // Important: Set authenticated state
      setUser(userData);
      setIsAuthenticated(true);
      console.log('Login successful, auth state updated');
    } catch (error) {
      console.error('Login error:', error);
      // Clear any partial state in case of error
      localStorage.removeItem('authToken');
      setUser(null);
      setTenant(null);
      setIsAuthenticated(false);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const loginFromSession = async (token: string, user: any) => {
    setIsLoading(true);
    try {
      const { getUserTenant, getUserBusinessType, getUserRole } = await import('../services/supabaseService');

      // Get user ID from user object
      const userId = user.id;
      
      // Get tenant ID for the user
      const tenantId = await getUserTenant(userId);
      
      // Get user role
      const role = await getUserRole(userId);
      
      // Get business type
      const businessType = await getUserBusinessType(userId);
      console.log('User business type from session:', businessType);

      // Create user object
      const userData: User = {
        id: userId,
        email: user.email ?? '',
        name: user.user_metadata?.full_name ?? user.email?.split('@')[0] ?? 'User',
        role: role ?? UserRole.EMPLOYEE,
        tenantId: tenantId ?? undefined,
        businessType: businessType as 'doctor' | 'turf'
      };

      // Store token (already done in OAuthCallback)
      // localStorage.setItem('authToken', token);

      setUser(userData);
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Login from session error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      console.log('Logging out user');
      // Call Supabase signOut to clear the session
      const { signOut } = await import('../services/supabaseService');
      await signOut();
      console.log('Supabase session cleared');

      // Clear local state
      localStorage.removeItem('authToken');
      setUser(null);
      setTenant(null);
      setIsAuthenticated(false);
      console.log('Local auth state cleared');
    } catch (error) {
      console.error('Error during logout:', error);
      // Even if there's an error, clear local state
      localStorage.removeItem('authToken');
      setUser(null);
      setTenant(null);
      setIsAuthenticated(false);
    }
  };

  const hasPermission = (requiredRoles: UserRole[]): boolean => {
    if (!user) return false;
    return requiredRoles.includes(user.role);
  };

  useEffect(() => {
    const checkAuthStatus = async () => {
      setIsLoading(true);
      try {
        const token = localStorage.getItem('authToken');
        console.log('Checking auth status, token exists:', !!token);
        
        if (token) {
          // Validate token with Supabase
          const { getCurrentSession, getUserRole, getUserTenant } = await import('../services/supabaseService');
          
          const session = await getCurrentSession();
          console.log('Session check result:', !!session);
          
          if (session?.user) {
            console.log('User ID from session:', session.user.id);
            const userId = session.user.id;
            
            try {
              const role = await getUserRole(userId);
              console.log('User role from DB:', role);
              
              const tenantId = await getUserTenant(userId);
              console.log('User tenant from DB:', tenantId);
              
              // Get the business type
              const { getUserBusinessType } = await import('../services/supabaseService');
              const businessType = await getUserBusinessType(userId);
              console.log('User business type:', businessType);
              
              const userData: User = {
                id: userId,  // Real UUID from Supabase
                email: session.user.email ?? '',
                name: session.user.user_metadata?.full_name ?? session.user.email?.split('@')[0] ?? 'User',
                role: role ?? UserRole.EMPLOYEE,
                tenantId: tenantId, // Real UUID from database
                businessType: businessType as 'doctor' | 'turf'
              };
              
              console.log('User data constructed:', userData);
              
              // Fetch tenant data if tenantId exists
              if (tenantId) {
                try {
                  // Use getTenantDetails instead of getTenantById
                  const { getTenantDetails } = await import('../services/supabaseService');
                  const tenantData = await getTenantDetails(tenantId);
                  console.log('Tenant data fetched:', tenantData);
                  setTenant(tenantData);
                } catch (tenantError) {
                  console.error('Error fetching tenant details:', tenantError);
                  // Continue even if tenant details fail
                }
              }
              
              // Set user data and mark as authenticated even if tenant fetch fails
              setUser(userData);
              setIsAuthenticated(true);
              console.log('Auth status set to authenticated');
            } catch (userDataError) {
              console.error('Error fetching user data:', userDataError);
              throw userDataError;
            }
          } else {
            // Invalid session
            console.error('Session exists but no user found');
            throw new Error('Invalid session - no user found');
          }
        } else {
          console.log('No auth token found');
        }
      } catch (error) {
        console.error('Authentication error:', error);
        localStorage.removeItem('authToken');
        setUser(null);
        setTenant(null);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };
  
    checkAuthStatus();
  }, []);

  
  return (
    <AuthContext.Provider
      value={{
        user,
        tenant,
        isAuthenticated,
        isLoading,
        login,
        logout,
        hasPermission,
        loginFromSession
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};