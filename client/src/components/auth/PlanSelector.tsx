import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, CreditCard, Crown, Zap, ArrowRight, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { PlanType } from "@shared/schema";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { CheckoutDialog } from "@/components/checkout/CheckoutDialog";

interface PlanInfo {
  id: string;
  name: string;
  price: number;
  features: string[];
  limits: {
    sessionsPerMonth: number;
    resultsPerSession: number;
  };
}

interface CheckoutSession {
  subscription?: any;
  clientSecret?: string;
  subscriptionId?: string;
}

// Função para buscar planos disponíveis
const fetchPlans = async (): Promise<PlanInfo[]> => {
  const response = await fetch('/api/plans');
  if (!response.ok) {
    throw new Error('Falha ao carregar planos');
  }
  return response.json();
};

// Função para buscar assinatura do usuário
const fetchUserSubscription = async (userId: string) => {
  const response = await fetch(`/api/subscriptions/user/${userId}`);
  if (response.status === 404) {
    return null; // Usuário sem assinatura
  }
  if (!response.ok) {
    throw new Error('Falha ao carregar assinatura');
  }
  return response.json();
};

// Função para criar checkout
const createCheckout = async (userId: string, planType: PlanType): Promise<CheckoutSession> => {
  const response = await fetch('/api/checkout/create-subscription', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, planType, provider: 'stripe' })
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.details || 'Falha ao criar checkout');
  }
  
  return response.json();
};

const getPlanIcon = (planId: string) => {
  switch (planId) {
    case 'basico': return <Zap className="w-8 h-8" />;
    case 'intermediario': return <CreditCard className="w-8 h-8" />;
    case 'completo': return <Crown className="w-8 h-8" />;
    default: return <Zap className="w-8 h-8" />;
  }
};

const getPlanColor = (planId: string) => {
  switch (planId) {
    case 'basico': return 'from-blue-500 to-blue-600';
    case 'intermediario': return 'from-purple-500 to-purple-600';
    case 'completo': return 'from-yellow-500 to-yellow-600';
    default: return 'from-gray-500 to-gray-600';
  }
};

export function PlanSelector() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [checkoutPlan, setCheckoutPlan] = useState<PlanInfo | null>(null);

  // Buscar planos disponíveis
  const { data: plans = [], isLoading: plansLoading } = useQuery({
    queryKey: ['/api/plans'],
    queryFn: fetchPlans
  });

  // Buscar assinatura atual do usuário
  const { data: currentSubscription, isLoading: subscriptionLoading } = useQuery({
    queryKey: ['/api/subscriptions/user', user?.id],
    queryFn: () => user ? fetchUserSubscription(user.id) : null,
    enabled: !!user?.id
  });

  // Mutation para criar checkout
  const createCheckoutMutation = useMutation({
    mutationFn: ({ userId, planType }: { userId: string; planType: PlanType }) => 
      createCheckout(userId, planType),
    onSuccess: (data) => {
      toast({
        title: "Checkout criado!",
        description: "Redirecionando para pagamento...",
      });
      
      // Se tiver clientSecret, redirecionar para Stripe Checkout
      if (data.clientSecret) {
        window.location.href = `https://checkout.stripe.com/pay/${data.clientSecret}`;
      }
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Erro no checkout",
        description: error.message
      });
    },
    onSettled: () => {
      setLoadingPlan(null);
    }
  });

  const handlePlanSelect = (plan: PlanInfo) => {
    if (!user) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Usuário não encontrado"
      });
      return;
    }

    setCheckoutPlan(plan);
  };

  if (plansLoading || subscriptionLoading) {
    return (
      <div className="p-6 bg-dashboard-dark min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-roulette-green mx-auto mb-4" />
          <p className="text-white">Carregando planos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-dashboard-dark min-h-screen">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            Escolha seu Plano de Análise
          </h1>
          <p className="text-gray-400">
            Selecione o plano que melhor atende suas necessidades de análise de roleta
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan) => {
            const isCurrentPlan = currentSubscription?.planType === plan.id;
            const isPremium = plan.id === 'completo';
            const isPopular = plan.id === 'intermediario';
            const isLoading = loadingPlan === plan.id;
            
            return (
              <Card 
                key={plan.id}
                className={`relative bg-gray-800/50 backdrop-blur border-gray-700/50 hover:border-gray-600/50 transition-all duration-300 ${
                  isCurrentPlan ? 'ring-2 ring-roulette-green ring-opacity-50' : ''
                } ${isPopular ? 'transform scale-105 border-purple-500/30' : ''} ${
                  isPremium ? 'border-yellow-500/30' : ''
                }`}
              >
                {isPopular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
                    <Badge className="bg-gradient-to-r from-purple-500 to-purple-600 text-white px-4 py-1 shadow-lg">
                      💎 Mais Popular
                    </Badge>
                  </div>
                )}
                
                {isPremium && (
                  <div className="absolute -top-4 right-4 z-10">
                    <Badge className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white px-3 py-1 shadow-lg">
                      👑 Premium
                    </Badge>
                  </div>
                )}

                <CardHeader className="text-center pb-4">
                  <div className={`w-20 h-20 bg-gradient-to-br ${getPlanColor(plan.id)} rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-lg`}>
                    <div className="text-white">
                      {getPlanIcon(plan.id)}
                    </div>
                  </div>
                  
                  <CardTitle className="text-2xl text-white mb-2">
                    {plan.name}
                  </CardTitle>
                  
                  <div className="text-4xl font-bold text-roulette-green mb-1">
                    R$ {plan.price.toFixed(2).replace('.', ',')}
                  </div>
                  <p className="text-gray-400 text-sm">por mês</p>
                  
                  {isCurrentPlan && (
                    <Badge className="bg-roulette-green/20 border border-roulette-green/30 text-roulette-green mt-2">
                      ✓ Plano Ativo
                    </Badge>
                  )}
                </CardHeader>

                <CardContent className="space-y-6">
                  {/* Limites do plano */}
                  <div className="bg-gray-900/30 rounded-lg p-4 border border-gray-700/50">
                    <h4 className="text-white font-medium mb-2">Limites mensais:</h4>
                    <div className="space-y-1 text-sm text-gray-300">
                      <div className="flex justify-between">
                        <span>Sessões:</span>
                        <span className="text-roulette-green font-medium">
                          {plan.limits.sessionsPerMonth === -1 ? 'Ilimitadas' : plan.limits.sessionsPerMonth}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Resultados por sessão:</span>
                        <span className="text-roulette-green font-medium">
                          {plan.limits.resultsPerSession === -1 ? 'Ilimitados' : plan.limits.resultsPerSession}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Features do plano */}
                  <div className="space-y-3">
                    <h4 className="text-white font-medium">Recursos inclusos:</h4>
                    <ul className="space-y-2">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-start text-gray-300">
                          <Check className="w-4 h-4 text-roulette-green mr-3 mt-0.5 flex-shrink-0" />
                          <span className="text-sm leading-relaxed">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <Button
                    onClick={() => handlePlanSelect(plan)}
                    disabled={isCurrentPlan}
                    className={`w-full h-12 text-base font-medium transition-all duration-200 ${
                      isCurrentPlan 
                        ? 'bg-gray-600/50 text-gray-400 cursor-not-allowed border border-gray-600' 
                        : 'bg-gradient-to-r from-roulette-green to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105'
                    }`}
                  >
                    {isCurrentPlan ? (
                      'Plano Ativo'
                    ) : (
                      <>
                        Assinar Agora
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="mt-12 text-center">
          <Button
            onClick={() => window.history.back()}
            variant="outline"
            className="bg-gray-800/50 border-gray-600 text-white hover:bg-gray-700 px-8 py-3"
          >
            ← Voltar ao Dashboard
          </Button>
        </div>

        {/* Informações do usuário e assinatura */}
        {user && (
          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="bg-gray-800/50 border-gray-700/50">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <CreditCard className="w-5 h-5 mr-2" />
                  Informações da Conta
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-400">Nome:</span>
                  <span className="text-white font-medium">{user.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Email:</span>
                  <span className="text-white font-medium">{user.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Plano Atual:</span>
                  <span className="text-roulette-green font-medium">
                    {plans.find(p => p.id === currentSubscription?.planType)?.name || 'Nenhum'}
                  </span>
                </div>
              </CardContent>
            </Card>
            
            {currentSubscription && (
              <Card className="bg-gray-800/50 border-gray-700/50">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <Check className="w-5 h-5 mr-2" />
                    Status da Assinatura
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Status:</span>
                    <Badge className={`${
                      currentSubscription.status === 'active' ? 'bg-green-500/20 text-green-400' :
                      currentSubscription.status === 'trialing' ? 'bg-blue-500/20 text-blue-400' :
                      'bg-red-500/20 text-red-400'
                    }`}>
                      {currentSubscription.status === 'active' ? 'Ativa' :
                       currentSubscription.status === 'trialing' ? 'Trial' :
                       'Inativa'}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Valor:</span>
                    <span className="text-white font-medium">
                      R$ {currentSubscription.priceMonthly.toFixed(2).replace('.', ',')}/mês
                    </span>
                  </div>
                  {currentSubscription.nextBillingDate && (
                    <div className="flex justify-between">
                      <span className="text-gray-400">Próxima cobrança:</span>
                      <span className="text-white font-medium">
                        {new Date(currentSubscription.nextBillingDate).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        )}
        
        {/* Trial banner */}
        {!currentSubscription && (
          <div className="mt-8 p-6 bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-lg">
            <div className="text-center">
              <h3 className="text-xl font-bold text-white mb-2">
                🚀 Experimente grátis por 7 dias!
              </h3>
              <p className="text-gray-300 mb-4">
                Todos os planos incluem trial gratuito de 7 dias. Cancele a qualquer momento.
              </p>
              <p className="text-sm text-gray-400">
                Pagamento seguro processado pela Stripe • Aceita cartão e PIX
              </p>
            </div>
          </div>
        )}

        {/* Dialog de Checkout */}
        {checkoutPlan && user && (
          <CheckoutDialog
            open={!!checkoutPlan}
            onOpenChange={(open) => !open && setCheckoutPlan(null)}
            planType={checkoutPlan.id as PlanType}
            planName={checkoutPlan.name}
            planPrice={checkoutPlan.price}
            userId={user.id}
          />
        )}
      </div>
    </div>
  );
}