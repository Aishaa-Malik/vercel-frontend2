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
}

interface AuthContextType {
  user: User | null;
  tenant: Tenant | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  hasPermission: (requiredRoles: UserRole[]) => boolean;
  loginFromSession: (session: any, role: string) => Promise<void>;
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

  // Simulated authentication for development
  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const { signIn, getCurrentSession, getUserRole, getUserTenant } = await import('../services/supabaseService');

      // Authenticate via Supabase
      const { session } = await signIn(email, password);

      if (!session) {
        throw new Error('Invalid email or password');
      }

      // Fetch additional info
      const userId = session.user.id;
      const role = await getUserRole(userId);
      if (!role) {
        throw new Error('Unable to determine user role. Please contact support.');
      }
    
      
      const tenantId = await getUserTenant(userId);

      const userData: User = {
        id: userId,
        email: session.user.email ?? email,
        name: session.user.user_metadata?.full_name ?? email.split('@')[0],
        role: role ?? UserRole.EMPLOYEE,
        tenantId: tenantId ?? undefined
      };

      // If user belongs to a tenant, you can fetch tenant details here if needed

      localStorage.setItem('authToken', session.access_token);

      setUser(userData);
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const loginFromSession = async (session: any, role: string) => {
    setIsLoading(true);
    try {
      const { getUserTenant } = await import('../services/supabaseService');

      // Get user ID from session
      const userId = session.user.id;
      
      // Get tenant ID for the user
      const tenantId = await getUserTenant(userId);

      // Create user object
      const userData: User = {
        id: userId,
        email: session.user.email ?? '',
        name: session.user.user_metadata?.full_name ?? session.user.email?.split('@')[0] ?? 'User',
        role: role as UserRole,
        tenantId: tenantId ?? undefined
      };

      // Store token
      localStorage.setItem('authToken', session.access_token);

      setUser(userData);
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Login from session error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    setUser(null);
    setTenant(null);
    setIsAuthenticated(false);
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
        
        if (token) {
          // Validate token with Supabase
          const { getCurrentSession, getUserRole, getUserTenant } = await import('../services/supabaseService');
          
          const session = await getCurrentSession();
          
          if (session?.user) {
            const userId = session.user.id;
            const role = await getUserRole(userId);
            const tenantId = await getUserTenant(userId);
            
            const userData: User = {
              id: userId,  // Real UUID from Supabase
              email: session.user.email ?? '',
              name: session.user.user_metadata?.full_name ?? session.user.email?.split('@')[0] ?? 'User',
              role: role ?? UserRole.EMPLOYEE,
              tenantId: tenantId // Real UUID from database
            };
            
            // Fetch tenant data if tenantId exists
            if (tenantId) {
              // Use getTenantDetails instead of getTenantById
              const { getTenantDetails } = await import('../services/supabaseService');
              const tenantData = await getTenantDetails(tenantId);
              setTenant(tenantData);
            }
            
            setUser(userData);
            setIsAuthenticated(true);
          } else {
            // Invalid session
            throw new Error('Invalid session');
          }
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