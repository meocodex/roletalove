import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CreditCard, Crown, Calendar, AlertTriangle, Settings, ExternalLink } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Link } from "wouter";
import { UpgradeDialog } from "./UpgradeDialog";
import { CancelSubscriptionDialog } from "./CancelSubscriptionDialog";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

interface Subscription {
  id: string;
  userId: string;
  planType: string;
  status: 'active' | 'trialing' | 'cancelled' | 'past_due';
  priceMonthly: number;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  nextBillingDate?: string;
  trialEnd?: string;
  stripeSubscriptionId?: string;
  metadata?: any;
}

const fetchUserSubscription = async (userId: string): Promise<Subscription | null> => {
  const response = await fetch(`/api/subscriptions/user/${userId}`);
  if (response.status === 404) {
    return null;
  }
  if (!response.ok) {
    throw new Error('Falha ao carregar assinatura');
  }
  return response.json();
};

const getPlanName = (planType: string) => {
  switch (planType) {
    case 'basico': return 'Plano Básico';
    case 'intermediario': return 'Plano Intermediário';
    case 'completo': return 'Plano Completo';
    default: return 'Plano Desconhecido';
  }
};

const getStatusBadge = (status: string, trialEnd?: string) => {
  const isInTrial = trialEnd && new Date(trialEnd) > new Date();
  
  if (isInTrial) {
    return <Badge className="bg-blue-500/20 text-blue-400">🎯 Trial Ativo</Badge>;
  }
  
  switch (status) {
    case 'active':
      return <Badge className="bg-green-500/20 text-green-400">✅ Ativa</Badge>;
    case 'trialing':
      return <Badge className="bg-blue-500/20 text-blue-400">🎯 Trial</Badge>;
    case 'cancelled':
      return <Badge className="bg-red-500/20 text-red-400">❌ Cancelada</Badge>;
    case 'past_due':
      return <Badge className="bg-yellow-500/20 text-yellow-400">⚠️ Pendente</Badge>;
    default:
      return <Badge className="bg-gray-500/20 text-gray-400">? Desconhecido</Badge>;
  }
};

export function SubscriptionCard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showUpgradeDialog, setShowUpgradeDialog] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);

  const { data: subscription, isLoading } = useQuery({
    queryKey: ['/api/subscriptions/user', user?.id],
    queryFn: () => user ? fetchUserSubscription(user.id) : null,
    enabled: !!user?.id,
    refetchInterval: 30000 // Atualizar a cada 30 segundos
  });

  // Mutation para cancelar assinatura
  const cancelMutation = useMutation({
    mutationFn: async (subscriptionId: string) => {
      const response = await fetch('/api/checkout/cancel-subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subscriptionId,
          provider: 'stripe'
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.details || 'Falha ao cancelar assinatura');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/subscriptions/user', user?.id] });
      toast({
        title: "Assinatura cancelada",
        description: "Sua assinatura foi cancelada com sucesso. Você continuará tendo acesso até o fim do período.",
      });
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Erro ao cancelar",
        description: error.message
      });
    }
  });

  const handleCancelSubscription = async () => {
    if (subscription?.stripeSubscriptionId) {
      await cancelMutation.mutateAsync(subscription.stripeSubscriptionId);
    }
  };

  if (isLoading) {
    return (
      <Card className="bg-gray-800/50 border-gray-700/50">
        <CardContent className="p-6">
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-gray-700 rounded w-1/3"></div>
            <div className="h-6 bg-gray-700 rounded w-1/2"></div>
            <div className="h-4 bg-gray-700 rounded w-3/4"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!subscription) {
    return (
      <Card className="bg-gray-800/50 border-gray-700/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-white flex items-center">
            <CreditCard className="w-5 h-5 mr-2" />
            Assinatura
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center py-4">
            <Crown className="w-12 h-12 text-gray-500 mx-auto mb-3" />
            <p className="text-gray-400 mb-4">
              Você ainda não tem uma assinatura ativa
            </p>
            <Link href="/plans">
              <Button className="bg-gradient-to-r from-roulette-green to-green-600 hover:from-green-600 hover:to-green-700 text-white">
                Ver Planos Disponíveis
                <ExternalLink className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    );
  }

  const isInTrial = subscription.trialEnd && new Date(subscription.trialEnd) > new Date();
  const trialDaysLeft = isInTrial 
    ? Math.ceil((new Date(subscription.trialEnd!).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    : 0;

  return (
    <Card className="bg-gray-800/50 border-gray-700/50">
      <CardHeader className="pb-3">
        <CardTitle className="text-white flex items-center justify-between">
          <div className="flex items-center">
            <CreditCard className="w-5 h-5 mr-2" />
            Minha Assinatura
          </div>
          {getStatusBadge(subscription.status, subscription.trialEnd)}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Informações do Plano */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-gray-400 text-sm">Plano atual</p>
            <p className="text-white font-medium">{getPlanName(subscription.planType)}</p>
          </div>
          <div>
            <p className="text-gray-400 text-sm">Valor mensal</p>
            <p className="text-roulette-green font-bold">
              R$ {subscription.priceMonthly.toFixed(2).replace('.', ',')}
            </p>
          </div>
        </div>

        {/* Trial Info */}
        {isInTrial && (
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
            <div className="flex items-center text-blue-400 mb-1">
              <Calendar className="w-4 h-4 mr-2" />
              <span className="font-medium">Trial ativo</span>
            </div>
            <p className="text-sm text-gray-300">
              {trialDaysLeft} dias restantes do seu período gratuito
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Sua primeira cobrança será em {new Date(subscription.trialEnd!).toLocaleDateString('pt-BR')}
            </p>
          </div>
        )}

        {/* Próxima Cobrança */}
        {subscription.nextBillingDate && !isInTrial && (
          <div className="bg-gray-900/30 rounded-lg p-3">
            <div className="flex items-center text-gray-300 mb-1">
              <Calendar className="w-4 h-4 mr-2" />
              <span className="font-medium">Próxima cobrança</span>
            </div>
            <p className="text-sm text-white">
              {new Date(subscription.nextBillingDate).toLocaleDateString('pt-BR')}
            </p>
          </div>
        )}

        {/* Status de Pagamento Pendente */}
        {subscription.status === 'past_due' && (
          <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3">
            <div className="flex items-center text-yellow-400 mb-1">
              <AlertTriangle className="w-4 h-4 mr-2" />
              <span className="font-medium">Pagamento pendente</span>
            </div>
            <p className="text-sm text-gray-300 mb-2">
              Há um pagamento em aberto. Atualize seu método de pagamento.
            </p>
            <Button size="sm" className="bg-yellow-600 hover:bg-yellow-700 text-white">
              Atualizar Pagamento
            </Button>
          </div>
        )}

        {/* Ações */}
        <div className="flex space-x-2 pt-2">
          <Button 
            variant="outline" 
            className="flex-1 bg-gray-700 border-gray-600 text-white hover:bg-gray-600"
            onClick={() => setShowUpgradeDialog(true)}
          >
            <Settings className="w-4 h-4 mr-2" />
            Alterar Plano
          </Button>
          
          {subscription.status === 'active' && (
            <Button
              variant="outline"
              className="bg-red-600/20 border-red-600/50 text-red-400 hover:bg-red-600/30"
              onClick={() => setShowCancelDialog(true)}
            >
              Cancelar
            </Button>
          )}
        </div>
      </CardContent>

      {/* Upgrade Dialog */}
      {subscription && user && (
        <UpgradeDialog
          open={showUpgradeDialog}
          onOpenChange={setShowUpgradeDialog}
          currentPlan={subscription.planType}
          currentPrice={subscription.priceMonthly}
          userId={user.id}
        />
      )}

      {/* Cancel Subscription Dialog */}
      {subscription && (
        <CancelSubscriptionDialog
          open={showCancelDialog}
          onOpenChange={setShowCancelDialog}
          onConfirm={handleCancelSubscription}
          planName={getPlanName(subscription.planType)}
          nextBillingDate={subscription.nextBillingDate}
        />
      )}
    </Card>
  );
}