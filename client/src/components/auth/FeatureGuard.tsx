import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Lock, ArrowUp } from "lucide-react";

interface FeatureGuardProps {
  feature: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
  showUpgrade?: boolean;
}

interface UpgradePromptProps {
  featureName: string;
  requiredPlan: string;
}

function UpgradePrompt({ featureName, requiredPlan }: UpgradePromptProps) {
  const { user } = useAuth();
  
  return (
    <Card className="bg-gray-800 border-gray-700">
      <CardHeader className="text-center">
        <div className="w-16 h-16 bg-gray-700 rounded-full mx-auto mb-4 flex items-center justify-center">
          <Lock className="w-8 h-8 text-gray-400" />
        </div>
        <CardTitle className="text-lg text-white">
          Funcionalidade Bloqueada
        </CardTitle>
      </CardHeader>
      
      <CardContent className="text-center">
        <p className="text-gray-400 mb-4">
          <strong className="text-white">{featureName}</strong> está disponível apenas no <strong className="text-roulette-green">{requiredPlan}</strong>.
        </p>
        
        <p className="text-sm text-gray-500 mb-6">
          Seu plano atual: <span className="text-white">{user?.planType}</span>
        </p>
        
        <Button 
          className="bg-roulette-green hover:bg-green-600 text-white"
          onClick={() => window.location.href = '/plans'}
        >
          <ArrowUp className="w-4 h-4 mr-2" />
          Fazer Upgrade
        </Button>
      </CardContent>
    </Card>
  );
}

const FEATURE_REQUIREMENTS = {
  'ia_externa_chatgpt': {
    name: 'Análise com ChatGPT',
    requiredPlan: 'Plano Completo'
  },
  'ia_externa_claude': {
    name: 'Análise com Claude',
    requiredPlan: 'Plano Completo'
  },
  'ml_analyzer': {
    name: 'Machine Learning Avançado',
    requiredPlan: 'Plano Intermediário+'
  },
  'estrategias_combinadas': {
    name: 'Estratégias Combinadas',
    requiredPlan: 'Plano Completo'
  },
  'graficos_avancados': {
    name: 'Gráficos Avançados',
    requiredPlan: 'Plano Completo'
  },
  'dashboard_customizavel': {
    name: 'Dashboard Customizável',
    requiredPlan: 'Plano Completo'
  },
  'analise_padroes': {
    name: 'Análise de Padrões',
    requiredPlan: 'Plano Intermediário+'
  },
  'estrategias_tradicionais': {
    name: 'Estratégias Tradicionais',
    requiredPlan: 'Plano Intermediário+'
  }
};

export function FeatureGuard({ feature, children, fallback, showUpgrade = true }: FeatureGuardProps) {
  const { hasFeature } = useAuth();
  
  if (hasFeature(feature)) {
    return <>{children}</>;
  }
  
  if (fallback) {
    return <>{fallback}</>;
  }
  
  if (showUpgrade) {
    const featureInfo = FEATURE_REQUIREMENTS[feature as keyof typeof FEATURE_REQUIREMENTS];
    if (featureInfo) {
      return <UpgradePrompt featureName={featureInfo.name} requiredPlan={featureInfo.requiredPlan} />;
    }
  }
  
  return null;
}