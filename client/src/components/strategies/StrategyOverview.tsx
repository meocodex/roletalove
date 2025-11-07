import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useStrategyFloating } from '@/contexts/StrategyFloatingContext';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Lock, 
  CheckCircle, 
  Crown, 
  Target, 
  Zap, 
  Star,
  ArrowUp,
  Brain,
  TrendingUp,
  BarChart3,
  Play
} from "lucide-react";
import { 
  getAvailableStrategies, 
  getLockedStrategies, 
  PLAN_CONFIG,
  type StrategyType 
} from '@shared/strategy-permissions';

function getCategoryIcon(category: string) {
  switch (category) {
    case 'basic': return <Star className="w-4 h-4" />;
    case 'advanced': return <BarChart3 className="w-4 h-4" />;
    case 'ai': return <Brain className="w-4 h-4" />;
    case 'premium': return <Crown className="w-4 h-4" />;
    default: return <TrendingUp className="w-4 h-4" />;
  }
}

function getCategoryColor(category: string) {
  switch (category) {
    case 'basic': return 'text-blue-400 bg-blue-900/20 border-blue-600/30';
    case 'advanced': return 'text-purple-400 bg-purple-900/20 border-purple-600/30';
    case 'ai': return 'text-green-400 bg-green-900/20 border-green-600/30';
    case 'premium': return 'text-yellow-400 bg-yellow-900/20 border-yellow-600/30';
    default: return 'text-gray-400 bg-gray-900/20 border-gray-600/30';
  }
}

function getPlanIcon(plan: string) {
  switch (plan) {
    case 'basico': return <Zap className="w-4 h-4" />;
    case 'intermediario': return <Target className="w-4 h-4" />;
    case 'completo': return <Crown className="w-4 h-4" />;
    default: return <Star className="w-4 h-4" />;
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

interface StrategyCardProps {
  strategy: any;
  isAvailable: boolean;
}

function StrategyCard({ strategy, isAvailable }: StrategyCardProps) {
  const { openPanel } = useStrategyFloating();

  const handlePlayStrategy = () => {
    if (!isAvailable) return;
    
    // Convert strategy to the format expected by floating panel
    const activeStrategy = {
      id: strategy.id,
      name: strategy.name,
      numbers: strategy.numbers || [1, 2, 3, 4, 5, 6, 7], // Default numbers if not provided
      type: strategy.type || 'straight_up',
      attempts: 0,
      maxAttempts: 5,
      successRate: 0
    };
    
    openPanel(activeStrategy);
  };
  return (
    <Card className={`${
      isAvailable 
        ? 'bg-gray-800/50 border-gray-700 hover:border-roulette-green/50' 
        : 'bg-gray-900/50 border-gray-800/50 opacity-75'
    } transition-all duration-200`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className={`text-base flex items-center gap-2 ${
            isAvailable ? 'text-white' : 'text-gray-400'
          }`}>
            {isAvailable ? (
              <CheckCircle className="w-4 h-4 text-roulette-green" />
            ) : (
              <Lock className="w-4 h-4 text-gray-500" />
            )}
            {strategy.name}
          </CardTitle>
          
          {!isAvailable && (
            <Badge 
              className={`bg-gradient-to-r ${getPlanColor(strategy.requiredPlan)} text-white border-0 text-xs`}
            >
              {getPlanIcon(strategy.requiredPlan)}
              <span className="ml-1">{getPlanName(strategy.requiredPlan)}</span>
            </Badge>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <p className={`text-sm mb-3 ${isAvailable ? 'text-gray-300' : 'text-gray-500'}`}>
          {strategy.description}
        </p>
        
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Badge 
              variant="outline" 
              className={`text-xs border-gray-600 ${getCategoryColor(strategy.category)}`}
            >
              {getCategoryIcon(strategy.category)}
              <span className="ml-1">{strategy.category.toUpperCase()}</span>
            </Badge>
            
            <Badge variant="outline" className="text-xs border-gray-600 text-gray-400">
              Nível {strategy.complexity}
            </Badge>
          </div>
          
          {/* Play Button */}
          {isAvailable && (
            <Button
              onClick={handlePlayStrategy}
              className="w-full bg-roulette-green hover:bg-green-600 text-white"
              size="sm"
            >
              <Play className="w-3 h-3 mr-2" />
              Jogar Estratégia
            </Button>
          )}
          
          {!isAvailable && (
            <Button
              variant="ghost"
              disabled
              className="w-full"
              size="sm"
            >
              <Lock className="w-3 h-3 mr-2" />
              Upgrade Necessário
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default function StrategyOverview() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('available');
  
  const userPlan = user?.planType || 'basico';
  const availableStrategies = getAvailableStrategies(userPlan);
  const lockedStrategies = getLockedStrategies(userPlan);
  const planConfig = PLAN_CONFIG[userPlan];

  return (
    <div className="space-y-6">
      {/* Cabeçalho do Plano Atual */}
      <Card className="bg-gradient-to-r from-gray-800 to-gray-900 border-gray-700">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-white mb-2">Seu Plano Atual</h2>
              <div className="flex items-center gap-3">
                <Badge 
                  className={`bg-gradient-to-r ${getPlanColor(userPlan)} text-white border-0`}
                >
                  {getPlanIcon(userPlan)}
                  <span className="ml-2">{planConfig.name}</span>
                </Badge>
                <span className="text-gray-300 text-sm">{planConfig.description}</span>
              </div>
              
              <div className="mt-3 flex items-center gap-4 text-sm text-gray-400">
                <span>
                  <strong className="text-roulette-green">{availableStrategies.length}</strong> estratégias ativas
                </span>
                <span>
                  Máximo simultâneo: <strong className="text-white">
                    {planConfig.maxStrategies === -1 ? 'Ilimitado' : planConfig.maxStrategies}
                  </strong>
                </span>
                <span>
                  IA Externa: <strong className={planConfig.aiAnalysis ? 'text-roulette-green' : 'text-red-400'}>
                    {planConfig.aiAnalysis ? 'Ativa' : 'Bloqueada'}
                  </strong>
                </span>
              </div>
            </div>
            
            {userPlan !== 'completo' && (
              <Button 
                className="bg-gradient-to-r from-roulette-green to-green-600 hover:from-green-600 hover:to-green-700"
                onClick={() => window.location.href = '/register'}
              >
                <ArrowUp className="w-4 h-4 mr-2" />
                Fazer Upgrade
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Lista de Estratégias */}
      <Card className="bg-gray-800/50 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Estratégias Disponíveis</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="bg-gray-700/50 border-gray-600">
              <TabsTrigger 
                value="available" 
                className="data-[state=active]:bg-roulette-green data-[state=active]:text-white"
              >
                Disponíveis ({availableStrategies.length})
              </TabsTrigger>
              <TabsTrigger 
                value="locked"
                className="data-[state=active]:bg-roulette-green data-[state=active]:text-white"
              >
                Bloqueadas ({lockedStrategies.length})
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="available" className="mt-6">
              {availableStrategies.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {availableStrategies.map(strategy => (
                    <StrategyCard 
                      key={strategy.id} 
                      strategy={strategy} 
                      isAvailable={true} 
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-400">
                  <Brain className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Nenhuma estratégia disponível no seu plano atual</p>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="locked" className="mt-6">
              {lockedStrategies.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {lockedStrategies.map(strategy => (
                    <StrategyCard 
                      key={strategy.id} 
                      strategy={strategy} 
                      isAvailable={false} 
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-400">
                  <Crown className="w-12 h-12 mx-auto mb-4 text-roulette-green" />
                  <p>Parabéns! Você tem acesso a todas as estratégias disponíveis</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}