import { useEffect, useRef } from 'react';
import { useSubscriptionAccess } from '@/hooks/useSubscriptionAccess';
import { useToast } from '@/hooks/use-toast';
import { Clock, AlertCircle, CreditCard } from 'lucide-react';

/**
 * Componente que mostra notificações automáticas sobre o status do trial
 * Deve ser incluído uma vez no App.tsx
 */
export function TrialNotifications() {
  const { trialActive, daysLeft, status, isAdmin, isLoading } = useSubscriptionAccess();
  const { toast } = useToast();
  const hasShownNotification = useRef<Record<string, boolean>>({});

  useEffect(() => {
    // Não mostrar para admin ou durante loading
    if (isAdmin || isLoading || !trialActive) {
      return;
    }

    // Notificação 3 dias antes do fim
    if (daysLeft === 3 && !hasShownNotification.current['3days']) {
      toast({
        title: "⏰ Trial acabando em breve!",
        description: "Você tem apenas 3 dias restantes no seu período gratuito. Escolha um plano para continuar.",
        duration: 10000,
        action: (
          <button
            onClick={() => window.location.href = '/plans'}
            className="bg-roulette-green text-white px-3 py-1 rounded text-sm hover:bg-green-600"
          >
            Ver Planos
          </button>
        ),
      });
      hasShownNotification.current['3days'] = true;
    }

    // Notificação 1 dia antes do fim
    if (daysLeft === 1 && !hasShownNotification.current['1day']) {
      toast({
        title: "🚨 Último dia de trial!",
        description: "Seu trial expira amanhã. Assine agora para não perder o acesso!",
        duration: 15000,
        variant: "destructive",
        action: (
          <button
            onClick={() => window.location.href = '/plans'}
            className="bg-white text-red-600 px-3 py-1 rounded text-sm hover:bg-gray-100 font-medium"
          >
            Assinar Agora
          </button>
        ),
      });
      hasShownNotification.current['1day'] = true;
    }

    // Notificação quando trial expira
    if (daysLeft === 0 && !hasShownNotification.current['expired']) {
      toast({
        title: "❌ Trial expirado",
        description: "Seu período gratuito acabou. Uma fatura foi gerada e está aguardando pagamento.",
        duration: 20000,
        variant: "destructive",
        action: (
          <button
            onClick={() => window.location.href = '/invoices'}
            className="bg-white text-red-600 px-3 py-1 rounded text-sm hover:bg-gray-100 font-medium"
          >
            Pagar Agora
          </button>
        ),
      });
      hasShownNotification.current['expired'] = true;
    }
  }, [daysLeft, trialActive, isAdmin, isLoading, toast]);

  // Notificação quando acesso é bloqueado
  useEffect(() => {
    if (isAdmin || isLoading) return;

    if (status === 'unpaid' && !hasShownNotification.current['unpaid']) {
      toast({
        title: "💳 Fatura pendente",
        description: "Você tem uma fatura em aberto. Pague para recuperar o acesso ao sistema.",
        duration: 20000,
        variant: "destructive",
        action: (
          <button
            onClick={() => window.location.href = '/invoices'}
            className="bg-white text-red-600 px-3 py-1 rounded text-sm hover:bg-gray-100 font-medium"
          >
            Ver Fatura
          </button>
        ),
      });
      hasShownNotification.current['unpaid'] = true;
    }
  }, [status, isAdmin, isLoading, toast]);

  return null; // Este componente não renderiza nada visível
}
