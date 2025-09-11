import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Target, 
  Zap, 
  TrendingUp, 
  Users, 
  Crown, 
  BarChart3,
  Play,
  Award
} from 'lucide-react';

export interface Strategy {
  id: string;
  name: string;
  description: string;
  type: 'straight_up' | 'neighbors' | 'sectors';
  numbers: number[];
  preview: string;
  successRate?: number;
  planRequired?: 'basico' | 'intermediario' | 'completo';
  icon: React.ReactNode;
  color: string;
}

interface StrategySelectionCardsProps {
  onStrategySelect: (strategy: Strategy) => void;
  userPlan?: string;
}

export default function StrategySelectionCards({ 
  onStrategySelect, 
  userPlan = 'basico' 
}: StrategySelectionCardsProps) {
  
  const strategies: Strategy[] = [
    {
      id: 'hot-numbers',
      name: 'Números Quentes',
      description: 'Analisa os 7 números mais frequentes nos últimos 100 giros',
      type: 'straight_up',
      numbers: [],
      preview: '7 números plenos baseados em frequência',
      successRate: 78.5,
      planRequired: 'basico',
      icon: <Target className="w-5 h-5" />,
      color: 'from-red-500 to-red-600'
    },
    {
      id: 'cold-recovery',
      name: 'Recuperação Fria',
      description: 'Identifica números que não saíram recentemente e estão "devendo"',
      type: 'straight_up',
      numbers: [],
      preview: '7 números com maior deficit estatístico',
      successRate: 72.3,
      planRequired: 'basico',
      icon: <Zap className="w-5 h-5" />,
      color: 'from-blue-500 to-blue-600'
    },
    {
      id: 'pattern-analysis',
      name: 'Análise de Padrões',
      description: 'Detecta padrões complexos de cores, dúzias e colunas',
      type: 'straight_up',
      numbers: [],
      preview: 'Números baseados em quebras de padrão',
      successRate: 81.2,
      planRequired: 'intermediario',
      icon: <BarChart3 className="w-5 h-5" />,
      color: 'from-purple-500 to-purple-600'
    },
    {
      id: 'neighbor-sectors',
      name: 'Setores Vizinhos',
      description: 'Estratégia baseada em vizinhança na roda física',
      type: 'neighbors',
      numbers: [],
      preview: 'Setores de 5 números + vizinhos',
      successRate: 75.8,
      planRequired: 'intermediario',
      icon: <Users className="w-5 h-5" />,
      color: 'from-emerald-500 to-emerald-600'
    },
    {
      id: 'ai-prediction',
      name: 'Predição IA',
      description: 'Algoritmo de IA treinado em milhões de resultados',
      type: 'straight_up',
      numbers: [],
      preview: 'Seleção inteligente via machine learning',
      successRate: 85.7,
      planRequired: 'completo',
      icon: <Crown className="w-5 h-5" />,
      color: 'from-yellow-500 to-yellow-600'
    },
    {
      id: 'momentum-strategy',
      name: 'Estratégia Momentum',
      description: 'Combina tendências de curto e longo prazo',
      type: 'sectors',
      numbers: [],
      preview: 'Análise de momentum multi-timeframe',
      successRate: 83.4,
      planRequired: 'completo',
      icon: <TrendingUp className="w-5 h-5" />,
      color: 'from-orange-500 to-orange-600'
    }
  ];

  const isStrategyAvailable = (strategy: Strategy) => {
    const planHierarchy = { basico: 1, intermediario: 2, completo: 3 };
    const userLevel = planHierarchy[userPlan as keyof typeof planHierarchy] || 1;
    const requiredLevel = planHierarchy[strategy.planRequired || 'basico'];
    return userLevel >= requiredLevel;
  };

  const getPlanBadgeColor = (plan?: string) => {
    switch (plan) {
      case 'basico': return 'bg-blue-500';
      case 'intermediario': return 'bg-purple-500';
      case 'completo': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-white mb-2">
          Escolha Sua Estratégia
        </h2>
        <p className="text-gray-400">
          Selecione uma estratégia para iniciar a análise em tempo real
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {strategies.map((strategy) => {
          const available = isStrategyAvailable(strategy);
          
          return (
            <Card 
              key={strategy.id} 
              className={`bg-gray-800 border-gray-700 transition-all duration-200 ${
                available 
                  ? 'hover:border-gray-600 hover:shadow-lg cursor-pointer' 
                  : 'opacity-50 cursor-not-allowed'
              }`}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className={`p-3 bg-gradient-to-r ${strategy.color} rounded-lg text-white`}>
                    {strategy.icon}
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <Badge className={`${getPlanBadgeColor(strategy.planRequired)} text-white text-xs`}>
                      {strategy.planRequired?.toUpperCase()}
                    </Badge>
                    {strategy.successRate && (
                      <div className="flex items-center gap-1">
                        <Award className="w-3 h-3 text-green-400" />
                        <span className="text-xs text-green-400 font-medium">
                          {strategy.successRate}%
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                
                <CardTitle className="text-white text-lg">
                  {strategy.name}
                </CardTitle>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <p className="text-gray-400 text-sm leading-relaxed">
                  {strategy.description}
                </p>
                
                <div className="space-y-2">
                  <div className="text-xs text-gray-500 uppercase tracking-wider">
                    Preview da Estratégia
                  </div>
                  <p className="text-gray-300 text-sm font-medium">
                    {strategy.preview}
                  </p>
                </div>

                <Button 
                  onClick={() => available && onStrategySelect(strategy)}
                  disabled={!available}
                  className={`w-full ${
                    available 
                      ? 'bg-roulette-green hover:bg-roulette-green/90' 
                      : 'bg-gray-600 cursor-not-allowed'
                  }`}
                >
                  <Play className="w-4 h-4 mr-2" />
                  {available ? 'Iniciar Análise' : 'Upgrade Necessário'}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Quick Start Options */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Zap className="w-5 h-5" />
            Início Rápido
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Button 
              variant="outline" 
              className="justify-start"
              onClick={() => onStrategySelect(strategies[0])}
            >
              <Target className="w-4 h-4 mr-2" />
              Última Estratégia Usada
            </Button>
            
            <Button 
              variant="outline" 
              className="justify-start"
              onClick={() => onStrategySelect(strategies[0])}
            >
              <BarChart3 className="w-4 h-4 mr-2" />
              Análise Sem Estratégia
            </Button>
          </div>
          
          <p className="text-xs text-gray-500 text-center">
            Ou clique em qualquer estratégia acima para começar
          </p>
        </CardContent>
      </Card>
    </div>
  );
}