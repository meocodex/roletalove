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
  login: (userData: User) => void;
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

  useEffect(() => {
    // Sistema de autenticação simplificado para desenvolvimento
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        // Fallback para usuário padrão
        const defaultUser: User = {
          id: 'user-001',
          email: 'usuario@roleta.app',
          name: 'Analista Roleta',
          planType: 'completo',
          userRole: 'admin'
        };
        setUser(defaultUser);
        localStorage.setItem('user', JSON.stringify(defaultUser));
      }
    } else {
      // Usuário padrão com acesso completo
      const defaultUser: User = {
        id: 'user-001',
        email: 'usuario@roleta.app', 
        name: 'Analista Roleta',
        planType: 'completo',
        userRole: 'admin'
      };
      setUser(defaultUser);
      localStorage.setItem('user', JSON.stringify(defaultUser));
    }
    setIsLoading(false);
  }, []);

  const login = (userData: User) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
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