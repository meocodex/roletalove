import { createContext, useState, useEffect } from 'react';
import { PlanType, UserRole, PLAN_FEATURES, ADMIN_FEATURES } from '@shared/schema';

interface User {
  id: string;
  email: string;
  name: string;
  planType: PlanType;
  userRole: UserRole;
  isActive?: boolean;
  lastLoginAt?: Date | null;
}

interface AuthContextType {
  user: User | null;
  login: (userData: User, token?: string) => void;
  logout: () => void;
  hasFeature: (feature: string) => boolean;
  hasAdminFeature: (feature: string) => boolean;
  isAdmin: () => boolean;
  isSuperAdmin: () => boolean;
  isLoading: boolean;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  login: () => {},
  logout: () => {},
  hasFeature: () => false,
  hasAdminFeature: () => false,
  isAdmin: () => false,
  isSuperAdmin: () => false,
  isLoading: false
});

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Verificar se há token válido e restaurar usuário
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('auth_token');
      
      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch('/api/auth/me', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const data = await response.json();
          setUser(data.user);
        } else {
          // Token inválido ou expirado
          localStorage.removeItem('auth_token');
          localStorage.removeItem('user');
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user');
      }

      setIsLoading(false);
    };

    checkAuth();
  }, []);

  const login = (userData: User, token?: string) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
    
    if (token) {
      localStorage.setItem('auth_token', token);
    }
  };

  const logout = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      
      if (token) {
        // Notificar o servidor sobre logout (opcional)
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
      }
    } catch (error) {
      console.error('Logout request failed:', error);
    } finally {
      // Limpar dados locais independente do resultado da requisição
      setUser(null);
      localStorage.removeItem('user');
      localStorage.removeItem('auth_token');
    }
  };

  const hasFeature = (feature: string): boolean => {
    if (!user) return false;
    return PLAN_FEATURES[user.planType]?.includes(feature as any) || false;
  };

  const hasAdminFeature = (feature: string): boolean => {
    if (!user) return false;
    return ADMIN_FEATURES[user.userRole as keyof typeof ADMIN_FEATURES]?.includes(feature as any) || false;
  };

  const isAdmin = (): boolean => {
    return user?.userRole === 'admin' || user?.userRole === 'super_admin';
  };

  const isSuperAdmin = (): boolean => {
    return user?.userRole === 'super_admin';
  };

  const contextValue: AuthContextType = {
    user,
    login,
    logout,
    hasFeature,
    hasAdminFeature,
    isAdmin,
    isSuperAdmin,
    isLoading
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}