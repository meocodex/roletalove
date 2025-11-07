import { useState } from 'react';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AdaptiveRouletteTable } from './AdaptiveRouletteTable';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { getNumberColor } from '@/lib/roulette-utils';
import { 
  CheckCircle, 
  XCircle, 
  RotateCcw,
  Activity
} from 'lucide-react';
import { type RouletteResult } from '@shared/schema';

interface CompactViewProps {
  strategy: {
    id: string;
    name: string;
    numbers: number[];
    attempts: number;
    maxAttempts: number;
    successRate: number;
  };
}

export function CompactView({ strategy }: CompactViewProps) {
  const [lastResult, setLastResult] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get recent results for context
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
      
      // Check if it's a hit
      const isHit = strategy.numbers.includes(newResult.number);
      const color = getNumberColor(newResult.number);
      const colorText = color === 'red' ? 'Vermelho' : color === 'black' ? 'Preto' : 'Verde';
      
      toast({
        title: isHit ? "🎯 Acertou!" : "❌ Errou",
        description: `Número ${newResult.number} (${colorText})`,
        variant: isHit ? "default" : "destructive"
      });
      
      // Clear highlight after 3 seconds
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

  const getStatusColor = () => {
    if (strategy.attempts >= strategy.maxAttempts) return 'text-red-400';
    if (strategy.attempts >= strategy.maxAttempts * 0.8) return 'text-yellow-400';
    return 'text-roulette-green';
  };

  const getSuccessRateColor = () => {
    if (strategy.successRate >= 0.3) return 'text-green-400';
    if (strategy.successRate >= 0.15) return 'text-yellow-400';
    return 'text-red-400';
  };

  const recentResults = results.slice(0, 5);

  return (
    <div className="flex flex-col h-full">
      {/* Quick Stats */}
      <div className="flex-shrink-0 px-3 py-2 bg-gray-800/50 border-b border-gray-700">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <Activity className="w-3 h-3 text-gray-400" />
            <span className="text-gray-400">Status:</span>
            <span className={getStatusColor()}>
              {strategy.attempts}/{strategy.maxAttempts}
            </span>
          </div>
          
          {strategy.successRate > 0 && (
            <div className="flex items-center gap-1">
              <span className="text-gray-400">Taxa:</span>
              <span className={getSuccessRateColor()}>
                {Math.round(strategy.successRate * 100)}%
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Roulette Table - Main Content */}
      <div className="flex-1 overflow-auto">
        <AdaptiveRouletteTable
          size="compact"
          recommendedNumbers={strategy.numbers}
          onNumberClick={handleNumberClick}
          lastResult={lastResult}
          disabled={isSubmitting}
        />
      </div>

      {/* Recent Results Strip */}
      {recentResults.length > 0 && (
        <div className="flex-shrink-0 px-3 py-2 border-t border-gray-700 bg-gray-800/30">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-400">Últimos:</span>
            <div className="flex gap-1">
              {recentResults.slice(0, 4).map((result, index) => {
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
                        text-xs w-5 h-5 p-0 border rounded-full flex items-center justify-center
                        ${color === 'red' ? 'bg-red-600/20 border-red-500 text-red-300' : ''}
                        ${color === 'black' ? 'bg-gray-800/20 border-gray-600 text-gray-300' : ''}
                        ${color === 'green' ? 'bg-green-600/20 border-green-500 text-green-300' : ''}
                      `}
                    >
                      {result.number}
                    </Badge>
                    
                    {/* Hit/Miss indicator */}
                    {isHit && (
                      <CheckCircle className="absolute -top-1 -right-1 w-2 h-2 text-green-400" />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="flex-shrink-0 px-3 py-2 border-t border-gray-700">
        <div className="flex items-center justify-between">
          <div className="text-xs text-gray-400 flex-1">
            Clique nos números
          </div>
          
          {results.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-5 px-2 text-xs"
              onClick={() => {
                setLastResult(null);
                toast({
                  title: "Limpo",
                  description: "Destaques removidos",
                });
              }}
            >
              <RotateCcw className="w-2 h-2 mr-1" />
              Limpar
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}