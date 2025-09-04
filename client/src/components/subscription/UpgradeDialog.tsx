import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, ArrowUp, ArrowDown, Check, X, CreditCard, Zap, Crown } from "lucide-react";
import { PlanType } from "@shared/schema";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

interface UpgradeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentPlan: string;
  currentPrice: number;
  userId: string;
}

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

const fetchPlans = async (): Promise<PlanInfo[]> => {
  const response = await fetch('/api/plans');
  if (!response.ok) {
    throw new Error('Falha ao carregar planos');
  }
  return response.json();
};

const createUpgrade = async (userId: string, newPlan: PlanType): Promise<any> => {
  const response = await fetch('/api/checkout/create-subscription', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, planType: newPlan, provider: 'stripe', isUpgrade: true })
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.details || 'Falha ao criar upgrade');
  }
  
  return response.json();
};

const cancelSubscription = async (subscriptionId: string): Promise<any> => {
  const response = await fetch('/api/checkout/cancel-subscription', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ subscriptionId, provider: 'stripe' })
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.details || 'Falha ao cancelar assinatura');
  }
  
  return response.json();
};

const getPlanIcon = (planId: string) => {
  switch (planId) {
    case 'basico': return <Zap className="w-5 h-5" />;
    case 'intermediario': return <CreditCard className="w-5 h-5" />;
    case 'completo': return <Crown className="w-5 h-5" />;
    default: return <Zap className="w-5 h-5" />;
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

const getUpgradeType = (currentPlan: string, targetPlan: string): 'upgrade' | 'downgrade' | 'same' => {
  const planOrder = { basico: 1, intermediario: 2, completo: 3 };
  const current = planOrder[currentPlan as keyof typeof planOrder] || 0;
  const target = planOrder[targetPlan as keyof typeof planOrder] || 0;
  
  if (target > current) return 'upgrade';
  if (target < current) return 'downgrade';
  return 'same';
};

export function UpgradeDialog({ open, onOpenChange, currentPlan, currentPrice, userId }: UpgradeDialogProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedPlan, setSelectedPlan] = useState<PlanInfo | null>(null);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  const { data: plans = [] } = useQuery({
    queryKey: ['/api/plans'],
    queryFn: fetchPlans,
    enabled: open
  });

  const upgradeMutation = useMutation({
    mutationFn: (planType: PlanType) => createUpgrade(userId, planType),
    onSuccess: (data) => {
      toast({
        title: "Upgrade iniciado!",
        description: "Redirecionando para pagamento...",
      });
      
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      }
      
      onOpenChange(false);
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Erro no upgrade",
        description: error.message
      });
    }
  });

  const cancelMutation = useMutation({
    mutationFn: () => {
      // TODO: Buscar subscription ID do usuário
      return cancelSubscription('subscription_id_placeholder');
    },
    onSuccess: () => {
      toast({
        title: "Assinatura cancelada",
        description: "Sua assinatura foi marcada para cancelamento ao final do período atual.",
      });
      
      queryClient.invalidateQueries({ queryKey: ['/api/subscriptions/user'] });
      onOpenChange(false);
      setShowCancelConfirm(false);
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Erro ao cancelar",
        description: error.message
      });
    }
  });

  const handlePlanSelect = (plan: PlanInfo) => {
    const upgradeType = getUpgradeType(currentPlan, plan.id);
    
    if (upgradeType === 'same') {
      toast({
        title: "Plano atual",
        description: "Você já está no plano selecionado."
      });
      return;
    }
    
    if (upgradeType === 'downgrade') {
      // Para downgrade, mostrar informações sobre como será processado
      toast({
        title: "Downgrade solicitado",
        description: "O downgrade será aplicado no próximo ciclo de cobrança."
      });
    }
    
    setSelectedPlan(plan);
  };

  const confirmChange = () => {
    if (!selectedPlan) return;
    
    upgradeMutation.mutate(selectedPlan.id as PlanType);
  };

  if (showCancelConfirm) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md bg-gray-800 border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-white text-xl">
              Cancelar Assinatura
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              Tem certeza que deseja cancelar sua assinatura?
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
              <h3 className="text-yellow-400 font-medium mb-2">O que acontece ao cancelar:</h3>
              <ul className="space-y-1 text-sm text-gray-300">
                <li>• Você manterá acesso até o final do período pago</li>
                <li>• Não haverá cobrança no próximo ciclo</li>
                <li>• Seus dados serão mantidos por 30 dias</li>
                <li>• Você pode reativar a qualquer momento</li>
              </ul>
            </div>

            <div className="flex space-x-3">
              <Button
                variant="outline"
                onClick={() => setShowCancelConfirm(false)}
                className="flex-1 bg-gray-700 border-gray-600 text-white hover:bg-gray-600"
                disabled={cancelMutation.isPending}
              >
                Manter Assinatura
              </Button>
              
              <Button
                onClick={() => cancelMutation.mutate()}
                disabled={cancelMutation.isPending}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white"
              >
                {cancelMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Cancelando...
                  </>
                ) : (
                  'Confirmar Cancelamento'
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl bg-gray-800 border-gray-700 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-white text-xl">
            {selectedPlan ? 'Confirmar Alteração' : 'Alterar Plano'}
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            {selectedPlan 
              ? `Confirme a alteração para o ${selectedPlan.name}`
              : 'Escolha um novo plano ou cancele sua assinatura atual'
            }
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {selectedPlan ? (
            // Confirmação de alteração
            <div className="space-y-4">
              {/* Comparação de planos */}
              <div className="grid grid-cols-2 gap-4">
                {/* Plano atual */}
                <Card className="bg-gray-900/50 border-gray-700">
                  <CardContent className="p-4">
                    <div className="text-center">
                      <h3 className="text-white font-medium mb-2">Plano Atual</h3>
                      <div className={`w-12 h-12 bg-gradient-to-br ${getPlanColor(currentPlan)} rounded-lg mx-auto mb-2 flex items-center justify-center`}>
                        {getPlanIcon(currentPlan)}
                      </div>
                      <p className="text-gray-400 text-sm">
                        {plans.find(p => p.id === currentPlan)?.name}
                      </p>
                      <p className="text-roulette-green font-bold">
                        R$ {currentPrice.toFixed(2).replace('.', ',')}/mês
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* Novo plano */}
                <Card className="bg-gray-900/50 border-gray-700 ring-2 ring-roulette-green/50">
                  <CardContent className="p-4">
                    <div className="text-center">
                      <h3 className="text-white font-medium mb-2">Novo Plano</h3>
                      <div className={`w-12 h-12 bg-gradient-to-br ${getPlanColor(selectedPlan.id)} rounded-lg mx-auto mb-2 flex items-center justify-center`}>
                        {getPlanIcon(selectedPlan.id)}
                      </div>
                      <p className="text-gray-400 text-sm">{selectedPlan.name}</p>
                      <p className="text-roulette-green font-bold">
                        R$ {selectedPlan.price.toFixed(2).replace('.', ',')}/mês
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Diferença de preço */}
              <div className="bg-gray-900/30 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Diferença mensal:</span>
                  <div className="flex items-center">
                    {selectedPlan.price > currentPrice ? (
                      <>
                        <ArrowUp className="w-4 h-4 text-red-400 mr-1" />
                        <span className="text-red-400 font-medium">
                          +R$ {(selectedPlan.price - currentPrice).toFixed(2).replace('.', ',')}
                        </span>
                      </>
                    ) : (
                      <>
                        <ArrowDown className="w-4 h-4 text-green-400 mr-1" />
                        <span className="text-green-400 font-medium">
                          -R$ {(currentPrice - selectedPlan.price).toFixed(2).replace('.', ',')}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Botões de confirmação */}
              <div className="flex space-x-3">
                <Button
                  variant="outline"
                  onClick={() => setSelectedPlan(null)}
                  className="flex-1 bg-gray-700 border-gray-600 text-white hover:bg-gray-600"
                  disabled={upgradeMutation.isPending}
                >
                  Voltar
                </Button>
                
                <Button
                  onClick={confirmChange}
                  disabled={upgradeMutation.isPending}
                  className="flex-1 bg-gradient-to-r from-roulette-green to-green-600 hover:from-green-600 hover:to-green-700 text-white"
                >
                  {upgradeMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      Processando...
                    </>
                  ) : (
                    'Confirmar Alteração'
                  )}
                </Button>
              </div>
            </div>
          ) : (
            // Seleção de planos
            <div className="space-y-4">
              {/* Lista de planos */}
              <div className="grid gap-3">
                {plans.filter(plan => plan.id !== currentPlan).map((plan) => {
                  const upgradeType = getUpgradeType(currentPlan, plan.id);
                  
                  return (
                    <Card 
                      key={plan.id} 
                      className="bg-gray-900/50 border-gray-700 hover:border-gray-600 cursor-pointer transition-all"
                      onClick={() => handlePlanSelect(plan)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className={`w-10 h-10 bg-gradient-to-br ${getPlanColor(plan.id)} rounded-lg flex items-center justify-center`}>
                              {getPlanIcon(plan.id)}
                            </div>
                            <div>
                              <h3 className="text-white font-medium">{plan.name}</h3>
                              <p className="text-gray-400 text-sm">
                                {plan.limits.sessionsPerMonth === -1 ? 'Ilimitado' : `${plan.limits.sessionsPerMonth} sessões/mês`}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-roulette-green font-bold">
                              R$ {plan.price.toFixed(2).replace('.', ',')}/mês
                            </p>
                            <Badge className={`mt-1 ${
                              upgradeType === 'upgrade' 
                                ? 'bg-blue-500/20 text-blue-400' 
                                : 'bg-purple-500/20 text-purple-400'
                            }`}>
                              {upgradeType === 'upgrade' ? (
                                <>
                                  <ArrowUp className="w-3 h-3 mr-1" />
                                  Upgrade
                                </>
                              ) : (
                                <>
                                  <ArrowDown className="w-3 h-3 mr-1" />
                                  Downgrade
                                </>
                              )}
                            </Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              {/* Opção de cancelamento */}
              <div className="pt-4 border-t border-gray-700">
                <Button
                  onClick={() => setShowCancelConfirm(true)}
                  variant="outline"
                  className="w-full bg-red-600/20 border-red-600/50 text-red-400 hover:bg-red-600/30"
                >
                  <X className="w-4 h-4 mr-2" />
                  Cancelar Assinatura
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}