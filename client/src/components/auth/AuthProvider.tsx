import { createContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { User as SupabaseUser } from '@supabase/supabase-js';
import { PlanType, UserRole, PLAN_FEATURES, ADMIN_FEATURES } from '@shared/schema';

interface UserProfile {
  id: string;
  auth_user_id: string;
  email: string;
  name: string;
  phone: string;
  plan_type: PlanType;
  user_role: UserRole;
  is_active: boolean;
  last_login_at: string | null;
  created_at: string;
  updated_at: string;
}

interface AuthContextType {
  user: UserProfile | null;
  supabaseUser: SupabaseUser | null;
  signUp: (email: string, password: string, name: string, phone: string, planType?: PlanType) => Promise<{ error?: Error }>;
  signIn: (email: string, password: string) => Promise<{ error?: Error }>;
  signOut: () => Promise<void>;
  hasFeature: (feature: string) => boolean;
  hasAdminFeature: (feature: string) => boolean;
  isAdmin: () => boolean;
  isSuperAdmin: () => boolean;
  isLoading: boolean;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  supabaseUser: null,
  signUp: async () => ({ error: new Error('Not implemented') }),
  signIn: async () => ({ error: new Error('Not implemented') }),
  signOut: async () => {},
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
  const [user, setUser] = useState<UserProfile | null>(null);
  const [supabaseUser, setSupabaseUser] = useState<SupabaseUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Buscar perfil do usuário
  const fetchUserProfile = async (authUserId: string): Promise<UserProfile | null> => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('auth_user_id', authUserId)
        .single();

      if (error) {
        console.error('Error fetching user profile:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
  };

  // Verificar sessão inicial e configurar listener
  useEffect(() => {
    // Verificar sessão existente
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSupabaseUser(session?.user ?? null);
      
      if (session?.user) {
        fetchUserProfile(session.user.id).then(profile => {
          setUser(profile);
          setIsLoading(false);
        });
      } else {
        setIsLoading(false);
      }
    });

    // Listener para mudanças de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSupabaseUser(session?.user ?? null);
      
      if (session?.user) {
        fetchUserProfile(session.user.id).then(profile => {
          setUser(profile);
        });
      } else {
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (
    email: string,
    password: string,
    name: string,
    phone: string,
    planType: PlanType = 'basico'
  ) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            phone,
            planType
          }
        }
      });

      if (error) throw error;
      
      return { error: undefined };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;
      
      return { error: undefined };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSupabaseUser(null);
  };

  const hasFeature = (feature: string): boolean => {
    if (!user) return false;
    const features = PLAN_FEATURES[user.plan_type];
    return features ? (features as readonly string[]).includes(feature) : false;
  };

  const hasAdminFeature = (feature: string): boolean => {
    if (!user) return false;
    const features = ADMIN_FEATURES[user.user_role as keyof typeof ADMIN_FEATURES];
    return features ? (features as readonly string[]).includes(feature) : false;
  };

  const isAdmin = (): boolean => {
    return user?.user_role === 'admin' || user?.user_role === 'super_admin';
  };

  const isSuperAdmin = (): boolean => {
    return user?.user_role === 'super_admin';
  };

  const contextValue: AuthContextType = {
    user,
    supabaseUser,
    signUp,
    signIn,
    signOut,
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