import { useState } from 'react';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { AdaptiveRouletteTable } from './AdaptiveRouletteTable';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { getNumberColor } from '@/lib/roulette-utils';
import { 
  CheckCircle, 
  XCircle, 
  RotateCcw,
  Activity,
  TrendingUp,
  Target,
  BarChart3,
  Clock,
  Zap
} from 'lucide-react';
import { type RouletteResult } from '@shared/schema';

interface ExpandedViewProps {
  strategy: {
    id: string;
    name: string;
    numbers: number[];
    attempts: number;
    maxAttempts: number;
    successRate: number;
  };
}

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  color?: string;
  trend?: 'up' | 'down' | 'neutral';
}

function StatCard({ icon, label, value, color = 'text-gray-300', trend }: StatCardProps) {
  return (
    <div className="flex items-center gap-2 p-2 bg-gray-800/50 rounded border border-gray-700">
      <div className="text-gray-400">{icon}</div>
      <div className="flex-1">
        <div className="text-xs text-gray-400">{label}</div>
        <div className={`text-sm font-medium ${color}`}>
          {value}
          {trend && (
            <span className={`ml-1 text-xs ${
              trend === 'up' ? 'text-green-400' : 
              trend === 'down' ? 'text-red-400' : 'text-gray-400'
            }`}>
              {trend === 'up' ? '↗' : trend === 'down' ? '↘' : '→'}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export function ExpandedView({ strategy }: ExpandedViewProps) {
  const [lastResult, setLastResult] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sessionStats, setSessionStats] = useState({
    hits: 0,
    misses: 0,
    streak: 0,
    bestStreak: 0
  });
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get recent results
  const { data: results = [] } = useQuery<RouletteResult[]>({
    queryKey: ['/api/results'],
    refetchInterval: 5000
  });

  // Add result mutation
  const addResultMutation = useMutation({
    mutationFn: async (number: number) => {
      return apiRequest('/api/results', 'POST', { 
        number,
        source: 'strategy_panel',
        sessionId: 'current'
      });
    },
    onSuccess: (newResult) => {
      queryClient.invalidateQueries({ queryKey: ['/api/results'] });
      queryClient.invalidateQueries({ queryKey: ['/api/patterns'] });
      
      setLastResult(newResult.number);
      
      // Update session stats
      const isHit = strategy.numbers.includes(newResult.number);
      setSessionStats(prev => ({
        hits: prev.hits + (isHit ? 1 : 0),
        misses: prev.misses + (isHit ? 0 : 1),
        streak: isHit ? prev.streak + 1 : 0,
        bestStreak: isHit ? Math.max(prev.bestStreak, prev.streak + 1) : prev.bestStreak
      }));
      
      const color = getNumberColor(newResult.number);
      const colorText = color === 'red' ? 'Vermelho' : color === 'black' ? 'Preto' : 'Verde';
      
      toast({
        title: isHit ? "🎯 Acertou!" : "❌ Errou",
        description: `Número ${newResult.number} (${colorText})`,
        variant: isHit ? "default" : "destructive"
      });
      
      setTimeout(() => setLastResult(null), 3000);
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Falha ao adicionar resultado",
        variant: "destructive"
      });
    },
    onSettled: () => {
      setIsSubmitting(false);
    }
  });

  const handleNumberClick = (number: number) => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    addResultMutation.mutate(number);
  };

  const resetSession = () => {
    setSessionStats({
      hits: 0,
      misses: 0,
      streak: 0,
      bestStreak: 0
    });
    setLastResult(null);
    toast({
      title: "Sessão Resetada",
      description: "Estatísticas da sessão foram zeradas",
    });
  };

  const recentResults = results.slice(0, 10);
  const sessionTotal = sessionStats.hits + sessionStats.misses;
  const sessionSuccessRate = sessionTotal > 0 ? (sessionStats.hits / sessionTotal) * 100 : 0;

  const getStatusColor = () => {
    if (strategy.attempts >= strategy.maxAttempts) return 'text-red-400';
    if (strategy.attempts >= strategy.maxAttempts * 0.8) return 'text-yellow-400';
    return 'text-roulette-green';
  };

  return (
    <div className="flex h-full">
      {/* Left Side - Roulette Table */}
      <div className="flex-1 p-4">
        <AdaptiveRouletteTable
          size="expanded"
          recommendedNumbers={strategy.numbers}
          onNumberClick={handleNumberClick}
          lastResult={lastResult}
          disabled={isSubmitting}
        />
      </div>

      {/* Right Side - Stats and Controls */}
      <div className="w-80 border-l border-gray-700 p-4 space-y-4 overflow-y-auto">
        
        {/* Strategy Info */}
        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Target className="w-4 h-4 text-roulette-green" />
              Estratégia Ativa
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <StatCard
                icon={<Activity className="w-3 h-3" />}
                label="Tentativas"
                value={`${strategy.attempts}/${strategy.maxAttempts}`}
                color={getStatusColor()}
              />
              <StatCard
                icon={<TrendingUp className="w-3 h-3" />}
                label="Taxa Global"
                value={`${Math.round(strategy.successRate * 100)}%`}
                color={strategy.successRate >= 0.3 ? 'text-green-400' : 'text-yellow-400'}
              />
            </div>
            
            <div className="pt-2">
              <div className="text-xs text-gray-400 mb-1">
                Números Recomendados ({strategy.numbers.length}):
              </div>
              <div className="flex flex-wrap gap-1">
                {strategy.numbers.map(num => (
                  <Badge key={num} variant="outline" className="text-xs">
                    {num}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Session Stats */}
        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-blue-400" />
              Sessão Atual
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <StatCard
                icon={<CheckCircle className="w-3 h-3" />}
                label="Acertos"
                value={sessionStats.hits.toString()}
                color="text-green-400"
              />
              <StatCard
                icon={<XCircle className="w-3 h-3" />}
                label="Erros"
                value={sessionStats.misses.toString()}
                color="text-red-400"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-2">
              <StatCard
                icon={<Zap className="w-3 h-3" />}
                label="Sequência"
                value={sessionStats.streak.toString()}
                color="text-yellow-400"
              />
              <StatCard
                icon={<TrendingUp className="w-3 h-3" />}
                label="Taxa Sessão"
                value={`${sessionSuccessRate.toFixed(1)}%`}
                color={sessionSuccessRate >= 30 ? 'text-green-400' : 'text-yellow-400'}
              />
            </div>
          </CardContent>
        </Card>

        {/* Recent Results */}
        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Clock className="w-4 h-4 text-purple-400" />
              Últimos Resultados
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recentResults.length > 0 ? (
              <div className="grid grid-cols-5 gap-1">
                {recentResults.map((result, index) => {
                  const color = getNumberColor(result.number);
                  const isHit = strategy.numbers.includes(result.number);
                  
                  return (
                    <div
                      key={`${result.id}-${index}`}
                      className="relative flex items-center justify-center"
                    >
                      <Badge
                        variant="outline"
                        className={`
                          text-xs w-8 h-8 p-0 border rounded-lg flex items-center justify-center
                          ${color === 'red' ? 'bg-red-600/20 border-red-500 text-red-300' : ''}
                          ${color === 'black' ? 'bg-gray-800/20 border-gray-600 text-gray-300' : ''}
                          ${color === 'green' ? 'bg-green-600/20 border-green-500 text-green-300' : ''}
                        `}
                      >
                        {result.number}
                      </Badge>
                      
                      {isHit && (
                        <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-400 rounded-full" />
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center text-gray-400 text-xs py-4">
                Nenhum resultado ainda
              </div>
            )}
          </CardContent>
        </Card>

        {/* Controls */}
        <div className="space-y-2">
          <Button
            variant="outline"
            onClick={resetSession}
            className="w-full"
            disabled={sessionTotal === 0}
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset Sessão
          </Button>
          
          <div className="text-xs text-center text-gray-400 px-2">
            Clique nos números da mesa para registrar resultados
          </div>
        </div>

      </div>
    </div>
  );
}