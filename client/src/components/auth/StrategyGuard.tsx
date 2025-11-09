import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Lock, ArrowUp, Crown, Target, Zap, Star } from "lucide-react";
import { 
  hasStrategyAccess, 
  getRequiredPlanForStrategy, 
  STRATEGY_DEFINITIONS,
  type StrategyType 
} from '@shared/strategy-permissions';

interface StrategyGuardProps {
  strategyId: StrategyType;
  children: React.ReactNode;
  fallback?: React.ReactNode;
  showUpgrade?: boolean;
}

interface StrategyUpgradePromptProps {
  strategyId: StrategyType;
}

function getPlanIcon(plan: string) {
  switch (plan) {
    case 'basico': return <Zap className="w-5 h-5" />;
    case 'intermediario': return <Target className="w-5 h-5" />;
    case 'completo': return <Crown className="w-5 h-5" />;
    default: return <Star className="w-5 h-5" />;
  }
}

function getPlanColor(plan: string) {
  switch (plan) {
    case 'basico': return 'from-blue-500 to-blue-600';
    case 'intermediario': return 'from-purple-500 to-purple-600';
    case 'completo': return 'from-yellow-500 to-yellow-600';
    default: return 'from-gray-500 to-gray-600';
  }
}

function getPlanName(plan: string) {
  switch (plan) {
    case 'basico': return 'Básico';
    case 'intermediario': return 'Intermediário';
    case 'completo': return 'Completo';
    default: return plan;
  }
}

function StrategyUpgradePrompt({ strategyId }: StrategyUpgradePromptProps) {
  const { user } = useAuth();
  const strategy = STRATEGY_DEFINITIONS[strategyId];
  const requiredPlan = getRequiredPlanForStrategy(strategyId);
  
  if (!strategy) return null;
  
  return (
    <Card className="bg-gray-800/50 border-gray-700 hover:border-roulette-green/50 transition-colors">
      <CardHeader className="text-center pb-4">
        <div className="w-16 h-16 bg-gray-700/50 rounded-full mx-auto mb-4 flex items-center justify-center">
          <Lock className="w-8 h-8 text-gray-400" />
        </div>
        <CardTitle className="text-lg text-white">
          {strategy.name}
        </CardTitle>
        <Badge 
          className={`mt-2 bg-gradient-to-r ${getPlanColor(requiredPlan)} text-white border-0`}
        >
          {getPlanIcon(requiredPlan)}
          <span className="ml-1">Requer {getPlanName(requiredPlan)}</span>
        </Badge>
      </CardHeader>
      
      <CardContent className="text-center pt-0">
        <p className="text-gray-300 mb-4 text-sm">
          {strategy.description}
        </p>
        
        <div className="flex items-center justify-center gap-2 mb-4">
          <Badge variant="outline" className="text-xs border-gray-600 text-gray-400">
            Complexidade {strategy.complexity}/5
          </Badge>
          <Badge 
            variant="outline" 
            className={`text-xs border-gray-600 ${
              strategy.category === 'ai' ? 'text-purple-400' :
              strategy.category === 'premium' ? 'text-yellow-400' :
              strategy.category === 'advanced' ? 'text-blue-400' :
              'text-gray-400'
            }`}
          >
            {strategy.category.toUpperCase()}
          </Badge>
        </div>
        
        <p className="text-sm text-gray-500 mb-6">
          Seu plano atual: <span className="text-white font-medium">{getPlanName(user?.plan_type || 'basico')}</span>
        </p>
        
        <Button 
          className="w-full bg-gradient-to-r from-roulette-green to-green-600 hover:from-green-600 hover:to-green-700 text-white font-medium"
          onClick={() => window.location.href = '/register'}
        >
          <ArrowUp className="w-4 h-4 mr-2" />
          Fazer Upgrade para {getPlanName(requiredPlan)}
        </Button>
      </CardContent>
    </Card>
  );
}

export function StrategyGuard({ strategyId, children, fallback, showUpgrade = true }: StrategyGuardProps) {
  const { user } = useAuth();
  const userPlan = user?.plan_type || 'basico';
  const userRole = user?.user_role || 'user';

  if (hasStrategyAccess(userPlan, strategyId, userRole)) {
    return <>{children}</>;
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  if (showUpgrade) {
    return <StrategyUpgradePrompt strategyId={strategyId} />;
  }

  return null;
}

// Hook para verificar acesso a múltiplas estratégias
export function useStrategyAccess() {
  const { user } = useAuth();
  const userPlan = user?.plan_type || 'basico';
  const userRole = user?.user_role || 'user';

  return {
    hasStrategyAccess: (strategyId: StrategyType) => hasStrategyAccess(userPlan, strategyId, userRole),
    getRequiredPlan: (strategyId: StrategyType) => getRequiredPlanForStrategy(strategyId),
    userPlan,
    userRole
  };
}