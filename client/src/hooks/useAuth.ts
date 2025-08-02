import { useState, useEffect, createContext, useContext } from 'react';
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

const AuthContext = createContext<AuthContextType | null>(null);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function useAuthProvider() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Simular carregamento do usuário (em produção viria da API)
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    } else {
      // Usuário demo para desenvolvimento
      const demoUser: User = {
        id: 'demo-user',
        email: 'demo@roleta.com',
        name: 'Usuário Demo',
        planType: 'basico' // Pode ser alterado para testar diferentes planos
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
    return PLAN_FEATURES[user.planType].includes(feature as any);
  };

  return {
    user,
    login,
    logout,
    hasFeature,
    isLoading
  };
}

export { AuthContext };