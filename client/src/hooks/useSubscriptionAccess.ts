import { useQuery } from '@tanstack/react-query';
import { useAuth } from './useAuth';

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
 * Hook para verificar acesso do usuário ao sistema
 * Verifica se o trial está ativo OU se a assinatura está paga
 */
export function useSubscriptionAccess() {
  const { user } = useAuth();

  const {
    data,
    isLoading,
    error,
    refetch
  } = useQuery<SubscriptionAccessData>({
    queryKey: ['/api/subscription/check-access', user?.id],
    queryFn: async () => {
      const token = localStorage.getItem('auth_token');

      const response = await fetch('/api/subscription/check-access', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        if (response.status === 404) {
          // Usuário sem assinatura
          return {
            hasAccess: false,
            daysLeft: 0,
            trialActive: false,
            status: 'no_subscription' as const,
            message: 'Nenhuma assinatura encontrada'
          };
        }
        throw new Error('Falha ao verificar acesso');
      }

      return response.json();
    },
    enabled: !!user?.id, // Só busca se tiver usuário logado
    staleTime: 1000 * 60 * 5, // Cache de 5 minutos
    refetchInterval: 1000 * 60 * 10 // Re-fetch a cada 10 minutos
  });

  // Admin sempre tem acesso total
  if (user?.user_role === 'admin' || user?.user_role === 'super_admin') {
    return {
      hasAccess: true,
      daysLeft: -1, // Ilimitado
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
 * Hook auxiliar para obter mensagens de status
 */
export function useSubscriptionMessage() {
  const { hasAccess, daysLeft, trialActive, status, isAdmin } = useSubscriptionAccess();

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
