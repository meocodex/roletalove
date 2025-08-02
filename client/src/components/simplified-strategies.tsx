import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Zap, Target, RefreshCw } from 'lucide-react';
import { UnifiedPatternAnalyzer } from '@/lib/pattern-analyzer';
import { type RouletteResult } from '@shared/schema';
import { getNumberColor, getColorClass } from '@/lib/roulette-utils';

interface SimplifiedStrategiesProps {
  results: RouletteResult[];
  className?: string;
}

export function SimplifiedStrategies({ results, className }: SimplifiedStrategiesProps) {
  const [currentStrategy, setCurrentStrategy] = useState<number[]>([]);
  const [strategyType, setStrategyType] = useState<'straight-up' | 'neighbors'>('straight-up');
  
  const generateStrategy = () => {
    if (strategyType === 'straight-up') {
      const numbers = UnifiedPatternAnalyzer.generateStraightUpStrategy(results);
      setCurrentStrategy(numbers);
    } else {
      // Neighbors strategy - pick one number and its neighbors
      const hotNumbers = results.slice(0, 20)
        .reduce((acc: { [key: number]: number }, result) => {
          if (result.number !== 0) {
            acc[result.number] = (acc[result.number] || 0) + 1;
          }
          return acc;
        }, {});
      
      const mainNumber = Object.entries(hotNumbers)
        .sort(([,a], [,b]) => b - a)[0]?.[0] || '17';
      
      const mainNum = parseInt(mainNumber);
      const neighbors = getNeighbors(mainNum);
      setCurrentStrategy([mainNum, ...neighbors]);
    }
  };

  const getNeighbors = (number: number): number[] => {
    // Simplified neighbor calculation for European roulette wheel
    const wheel = [0,32,15,19,4,21,2,25,17,34,6,27,13,36,11,30,8,23,10,5,24,16,33,1,20,14,31,9,22,18,29,7,28,12,35,3,26];
    const index = wheel.indexOf(number);
    if (index === -1) return [];
    
    const neighbors = [];
    for (let i = 1; i <= 2; i++) {
      const leftIndex = (index - i + wheel.length) % wheel.length;
      const rightIndex = (index + i) % wheel.length;
      neighbors.push(wheel[leftIndex], wheel[rightIndex]);
    }
    
    return neighbors.filter(n => n !== 0).slice(0, 4);
  };

  const clearStrategy = () => {
    setCurrentStrategy([]);
  };

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center">
          <Target className="mr-2 text-casino-gold" size={20} />
          Estratégias Automáticas
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Strategy Type Selection */}
        <div className="flex space-x-2">
          <Button
            variant={strategyType === 'straight-up' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setStrategyType('straight-up')}
            className="flex-1"
          >
            <Zap className="mr-1" size={14} />
            Plenos
          </Button>
          <Button
            variant={strategyType === 'neighbors' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setStrategyType('neighbors')}
            className="flex-1"
          >
            <Target className="mr-1" size={14} />
            Vizinhos
          </Button>
        </div>

        {/* Generate Strategy Button */}
        <Button
          onClick={generateStrategy}
          disabled={results.length < 10}
          className="w-full bg-casino-gold hover:bg-casino-gold/80 text-black font-medium"
        >
          <RefreshCw className="mr-2" size={16} />
          Gerar Estratégia {strategyType === 'straight-up' ? '(7 números)' : '(5 números)'}
        </Button>

        {/* Current Strategy Display */}
        {currentStrategy.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium text-green-400">
                Estratégia {strategyType === 'straight-up' ? 'Números Plenos' : 'Vizinhos'}:
              </h4>
              <Button
                variant="outline"
                size="sm"
                onClick={clearStrategy}
                className="text-xs px-2 py-1 h-auto"
              >
                Limpar
              </Button>
            </div>
            
            <div className="grid grid-cols-7 gap-1">
              {currentStrategy.slice(0, 7).map((number, index) => {
                const color = getNumberColor(number);
                return (
                  <div
                    key={index}
                    className={`h-8 w-8 ${getColorClass(color).split(' ')[0]} rounded-md flex items-center justify-center text-white font-bold text-xs border border-gray-600`}
                    title={`Número ${number}`}
                  >
                    {number}
                  </div>
                );
              })}
            </div>

            <div className="text-xs text-gray-400 space-y-1">
              <div>• Total de números: {currentStrategy.length}</div>
              <div>• Baseado nos últimos {Math.min(results.length, 20)} resultados</div>
              {strategyType === 'straight-up' && (
                <div>• Pagamento: 35:1 por acerto</div>
              )}
              {strategyType === 'neighbors' && (
                <div>• Cobertura da mesa: ~{Math.round((currentStrategy.length / 37) * 100)}%</div>
              )}
            </div>
          </div>
        )}

        {/* No Data Message */}
        {results.length < 10 && (
          <div className="text-center text-gray-400 text-sm py-4">
            Pelo menos 10 resultados são necessários para gerar estratégias
          </div>
        )}
      </CardContent>
    </Card>
  );
}