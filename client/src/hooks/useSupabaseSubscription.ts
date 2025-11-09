import { useQuery } from '@tanstack/react-query';
import { useAuth } from './useAuth';
import { checkSubscriptionAccess, getUserSubscription } from '@/lib/supabase-queries';
import { supabase } from '@/integrations/supabase/client';

interface SubscriptionAccessData {
  hasAccess: boolean;
  daysLeft: number;
  trialActive: boolean;
  status: 'active' | 'trialing' | 'past_due' | 'canceled' | 'unpaid' | 'no_subscription';
  planType?: string;
  nextBillingDate?: Date | string;
  message?: string;
}

/**
 * Hook para verificar acesso do usuário ao sistema via Supabase
 * Verifica se o trial está ativo OU se a assinatura está paga
 */
export function useSupabaseSubscription() {
  const { user } = useAuth();

  const {
    data,
    isLoading,
    error,
    refetch
  } = useQuery<SubscriptionAccessData>({
    queryKey: ['subscription-access', user?.id],
    queryFn: async () => {
      if (!user?.id) {
        throw new Error('User not authenticated');
      }

      // Get user_id from users table
      const { data: userData } = await supabase
        .from('users')
        .select('id')
        .eq('auth_user_id', user.id)
        .single();

      if (!userData) {
        throw new Error('User not found');
      }

      return checkSubscriptionAccess(userData.id);
    },
    enabled: !!user?.id,
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchInterval: 1000 * 60 * 10 // 10 minutes
  });

  // Admin sempre tem acesso total
  if (user?.roles?.includes('admin') || user?.roles?.includes('super_admin')) {
    return {
      hasAccess: true,
      daysLeft: -1,
      trialActive: false,
      status: 'active' as const,
      planType: user.plan_type,
      isAdmin: true,
      isLoading: false,
      error: null,
      refetch
    };
  }

  return {
    hasAccess: data?.hasAccess ?? false,
    daysLeft: data?.daysLeft ?? 0,
    trialActive: data?.trialActive ?? false,
    status: data?.status ?? 'no_subscription',
    planType: data?.planType,
    nextBillingDate: data?.nextBillingDate,
    message: data?.message,
    isAdmin: false,
    isLoading,
    error,
    refetch
  };
}

/**
 * Hook para obter detalhes completos da assinatura
 */
export function useUserSubscription() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['user-subscription', user?.id],
    queryFn: async () => {
      if (!user?.id) {
        throw new Error('User not authenticated');
      }

      // Get user_id from users table
      const { data: userData } = await supabase
        .from('users')
        .select('id')
        .eq('auth_user_id', user.id)
        .single();

      if (!userData) {
        throw new Error('User not found');
      }

      return getUserSubscription(userData.id);
    },
    enabled: !!user?.id,
    staleTime: 1000 * 60 * 5
  });
}

/**
 * Hook auxiliar para obter mensagens de status
 */
export function useSubscriptionMessage() {
  const { hasAccess, daysLeft, trialActive, status, isAdmin } = useSupabaseSubscription();

  if (isAdmin) {
    return {
      message: 'Acesso total como administrador',
      type: 'success' as const,
      showUpgrade: false
    };
  }

  if (!hasAccess) {
    if (status === 'no_subscription') {
      return {
        message: 'Você ainda não possui uma assinatura. Escolha um plano para começar!',
        type: 'warning' as const,
        showUpgrade: true
      };
    }

    if (status === 'unpaid' || status === 'past_due') {
      return {
        message: 'Seu trial expirou e há uma fatura pendente. Realize o pagamento para continuar.',
        type: 'error' as const,
        showUpgrade: true
      };
    }

    return {
      message: 'Seu acesso expirou. Renove sua assinatura para continuar.',
      type: 'error' as const,
      showUpgrade: true
    };
  }

  if (trialActive && daysLeft > 0) {
    return {
      message: `Você tem ${daysLeft} ${daysLeft === 1 ? 'dia' : 'dias'} restantes no seu período de teste gratuito.`,
      type: 'info' as const,
      showUpgrade: false
    };
  }

  if (status === 'active') {
    return {
      message: 'Assinatura ativa',
      type: 'success' as const,
      showUpgrade: false
    };
  }

  return {
    message: 'Status da assinatura',
    type: 'info' as const,
    showUpgrade: false
  };
}
