import { createContext, useState, useEffect } from 'react';
import { PlanType, PLAN_FEATURES } from '@shared/schema';

interface User {
  id: string;
  email: string;
  name: string;
  planType: PlanType;
}

interface AuthContextType {
  user: User | null;
  login: (userData: User) => void;
  logout: () => void;
  hasFeature: (feature: string) => boolean;
  isLoading: boolean;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  login: () => {},
  logout: () => {},
  hasFeature: () => false,
  isLoading: false
});

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simular carregamento do usuário
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        // Se falhar ao parsear, criar usuário demo
        const demoUser: User = {
          id: 'demo-user',
          email: 'demo@roleta.com',
          name: 'Usuário Demo',
          planType: 'completo'
        };
        setUser(demoUser);
        localStorage.setItem('user', JSON.stringify(demoUser));
      }
    } else {
      // Usuário demo para desenvolvimento
      const demoUser: User = {
        id: 'demo-user',
        email: 'demo@roleta.com', 
        name: 'Usuário Demo',
        planType: 'completo'
      };
      setUser(demoUser);
      localStorage.setItem('user', JSON.stringify(demoUser));
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

  const contextValue: AuthContextType = {
    user,
    login,
    logout,
    hasFeature,
    isLoading
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}