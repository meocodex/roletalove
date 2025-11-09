import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from './useAuth';
import { getUserPayments, getPendingPayments } from '@/lib/supabase-queries';
import { supabase } from '@/integrations/supabase/client';

/**
 * Hook para obter todos os pagamentos do usuário
 */
export function useUserPayments() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['user-payments', user?.id],
    queryFn: async () => {
      if (!user?.id) {
        throw new Error('User not authenticated');
      }

      // Get user_id from users table
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id')
        .eq('auth_user_id', user.id)
        .single();

      if (userError || !userData) {
        throw new Error('User not found');
      }

      return getUserPayments(userData.id);
    },
    enabled: !!user?.id,
    staleTime: 1000 * 60 * 2 // 2 minutes
  });
}

/**
 * Hook para obter pagamentos pendentes do usuário
 */
export function usePendingPayments() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['pending-payments', user?.id],
    queryFn: async () => {
      if (!user?.id) {
        throw new Error('User not authenticated');
      }

      // Get user_id from users table
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id')
        .eq('auth_user_id', user.id)
        .single();

      if (userError || !userData) {
        throw new Error('User not found');
      }

      return getPendingPayments(userData.id);
    },
    enabled: !!user?.id,
    staleTime: 1000 * 60 * 1 // 1 minute
  });
}

/**
 * Hook para processar um pagamento
 * Note: In a real application, this would trigger a payment gateway
 * For now, it just updates the status
 */
export function useProcessPayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (paymentId: string) => {
      const { data, error } = await supabase
        .from('payments')
        .update({
          status: 'paid',
          paid_at: new Date().toISOString()
        })
        .eq('id', paymentId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['user-payments'] });
      queryClient.invalidateQueries({ queryKey: ['pending-payments'] });
      queryClient.invalidateQueries({ queryKey: ['subscription-access'] });
      queryClient.invalidateQueries({ queryKey: ['user-subscription'] });
    }
  });
}
