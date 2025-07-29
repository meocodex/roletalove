import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, X } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { PlanType } from "@shared/schema";

interface PlanInfo {
  type: PlanType;
  name: string;
  price: string;
  features: string[];
  color: string;
  popular?: boolean;
}

const PLANS: PlanInfo[] = [
  {
    type: 'basico',
    name: 'Plano Básico',
    price: 'R$ 29/mês',
    color: 'bg-blue-500',
    features: [
      'Mesa de roleta visual',
      'Entrada manual de números',
      'Histórico de resultados',
      'Estatísticas básicas'
    ]
  },
  {
    type: 'intermediario',
    name: 'Plano Intermediário',
    price: 'R$ 59/mês',
    color: 'bg-purple-500',
    popular: true,
    features: [
      'Tudo do Plano Básico',
      'Análise de padrões avançada',
      'Estratégias tradicionais',
      'Machine Learning básico',
      'Gráficos interativos',
      'Sistema de alertas'
    ]
  },
  {
    type: 'completo',
    name: 'Plano Completo',
    price: 'R$ 99/mês',
    color: 'bg-gold-500',
    features: [
      'Tudo do Plano Intermediário',
      'IA Externa (ChatGPT + Claude)',
      'Estratégias combinadas',
      'Gráficos avançados',
      'Dashboard customizável',
      'Exportação de dados',
      'Histórico completo',
      'Suporte prioritário'
    ]
  }
];

export function PlanSelector() {
  const { user, login } = useAuth();

  const handlePlanChange = (planType: PlanType) => {
    if (user) {
      login({ ...user, planType });
    }
  };

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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {PLANS.map((plan) => {
            const isCurrentPlan = user?.planType === plan.type;
            
            return (
              <Card 
                key={plan.type}
                className={`relative bg-gray-800 border-gray-700 hover:border-gray-600 transition-all ${
                  isCurrentPlan ? 'ring-2 ring-roulette-green' : ''
                } ${plan.popular ? 'transform scale-105' : ''}`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-roulette-green text-white px-4 py-1">
                      Mais Popular
                    </Badge>
                  </div>
                )}

                <CardHeader className="text-center">
                  <div className={`w-16 h-16 ${plan.color} rounded-full mx-auto mb-4 flex items-center justify-center`}>
                    <span className="text-white font-bold text-2xl">
                      {plan.name.charAt(0)}
                    </span>
                  </div>
                  
                  <CardTitle className="text-xl text-white">
                    {plan.name}
                  </CardTitle>
                  
                  <div className="text-3xl font-bold text-roulette-green">
                    {plan.price}
                  </div>
                  
                  {isCurrentPlan && (
                    <Badge variant="secondary" className="bg-roulette-green text-white">
                      Plano Atual
                    </Badge>
                  )}
                </CardHeader>

                <CardContent>
                  <ul className="space-y-3 mb-6">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-center text-gray-300">
                        <Check className="w-4 h-4 text-roulette-green mr-3" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Button
                    onClick={() => handlePlanChange(plan.type)}
                    disabled={isCurrentPlan}
                    className={`w-full ${
                      isCurrentPlan 
                        ? 'bg-gray-600 text-gray-400 cursor-not-allowed' 
                        : 'bg-roulette-green hover:bg-green-600 text-white'
                    }`}
                  >
                    {isCurrentPlan ? 'Plano Ativo' : 'Selecionar Plano'}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="mt-8 text-center">
          <Button
            onClick={() => window.history.back()}
            variant="outline"
            className="bg-gray-800 border-gray-600 text-white hover:bg-gray-700"
          >
            Voltar ao Dashboard
          </Button>
        </div>

        {user && (
          <div className="mt-6 p-4 bg-gray-800 rounded-lg border border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-2">
              Usuário Atual: {user.name}
            </h3>
            <p className="text-gray-400">
              Email: {user.email} | Plano: <span className="text-roulette-green font-medium">
                {PLANS.find(p => p.type === user.planType)?.name}
              </span>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}