import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Settings, ChevronRight } from 'lucide-react';
import { type Strategy } from '@shared/schema';
import { apiRequest } from '@/lib/queryClient';

interface StrategyPanelProps {
  className?: string;
}

export function StrategyPanel({ className }: StrategyPanelProps) {
  const queryClient = useQueryClient();
  
  const { data: strategies = [], isLoading } = useQuery<Strategy[]>({
    queryKey: ['/api/strategies'],
  });

  const updateStrategyMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Strategy> }) => {
      const response = await apiRequest('PUT', `/api/strategies/${id}`, updates);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/strategies'] });
    }
  });

  const toggleStrategy = (strategy: Strategy) => {
    updateStrategyMutation.mutate({
      id: strategy.id,
      updates: { isActive: !strategy.isActive }
    });
  };

  const getStrategyStatusColor = (strategy: Strategy) => {
    if (!strategy.isActive) return 'text-gray-400';
    if (strategy.currentAttempts >= strategy.maxAttempts - 1) return 'text-red-400';
    return strategy.type === 'straight_up' ? 'text-blue-400' : 'text-purple-400';
  };

  const getStrategyStatusBg = (strategy: Strategy) => {
    if (!strategy.isActive) return 'bg-gray-900/30 border-gray-600';
    if (strategy.currentAttempts >= strategy.maxAttempts - 1) return 'bg-red-900/30 border-red-600';
    return strategy.type === 'straight_up' ? 'bg-blue-900/30 border-blue-600' : 'bg-purple-900/30 border-purple-600';
  };

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center text-lg">
            <Settings className="text-casino-gold mr-2" size={20} />
            Estratégias Ativas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div key={i} className="bg-gray-700 rounded p-3 animate-pulse">
                <div className="h-4 bg-gray-600 rounded mb-2"></div>
                <div className="h-3 bg-gray-600 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center text-lg">
          <Settings className="text-casino-gold mr-2" size={20} />
          Estratégias Ativas
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {strategies.map((strategy) => (
            <div
              key={strategy.id}
              className={`border rounded p-3 cursor-pointer transition-all hover:opacity-80 ${getStrategyStatusBg(strategy)}`}
              onClick={() => toggleStrategy(strategy)}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">{strategy.name}</span>
                <div className="flex items-center space-x-1">
                  <div className={`w-2 h-2 rounded-full ${strategy.isActive ? 'bg-green-500 animate-pulse' : 'bg-gray-500'}`}></div>
                  <span className={`text-xs ${getStrategyStatusColor(strategy)}`}>
                    {strategy.isActive ? 'Ativa' : 'Standby'}
                  </span>
                </div>
              </div>
              
              <div className="text-xs text-gray-300 mb-2">
                {strategy.type === 'straight_up' ? (
                  <>Números: {Array.isArray(strategy.numbers) ? strategy.numbers.slice(0, 5).join(', ') : 'N/A'}</>
                ) : (
                  <>{(Array.isArray(strategy.numbers) ? strategy.numbers.length : 0)} números cobertos</>
                )}
              </div>
              
              <div className={`text-xs ${getStrategyStatusColor(strategy)}`}>
                {strategy.isActive ? (
                  <>Tentativa {strategy.currentAttempts + 1}/{strategy.maxAttempts}</>
                ) : (
                  'Aguardando ativação'
                )}
              </div>
              
              {strategy.successRate > 0 && (
                <div className="mt-1 text-xs text-gray-500">
                  Taxa de acerto: {Math.round(strategy.successRate * 100)}%
                </div>
              )}
            </div>
          ))}
        </div>

        <Button className="w-full mt-4 bg-casino-gold hover:bg-yellow-500 text-black font-medium transition-colors">
          <Settings className="mr-2" size={16} />
          Configurar Estratégias
        </Button>
      </CardContent>
    </Card>
  );
}
