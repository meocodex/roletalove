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

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between text-lg">
          <div className="flex items-center">
            <Zap className="text-yellow-500 mr-2" size={20} />
            Estratégias Automáticas
          </div>
          <Badge variant="outline" className="text-xs">
            {results.length} números
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Strategy Type Selection */}
        <div className="flex gap-2">
          <Button
            variant={strategyType === 'straight-up' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setStrategyType('straight-up')}
          >
            Números Plenos
          </Button>
          <Button
            variant={strategyType === 'neighbors' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setStrategyType('neighbors')}
          >
            Vizinhos
          </Button>
        </div>

        {/* Generate Strategy Button */}
        <Button 
          onClick={generateStrategy}
          className="w-full"
          disabled={results.length < 5}
        >
          <Target className="w-4 h-4 mr-2" />
          Gerar Estratégia {strategyType === 'straight-up' ? '(7 números)' : '(5 números)'}
        </Button>

        {/* Strategy Display */}
        {currentStrategy.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">
                Estratégia {strategyType === 'straight-up' ? 'Números Plenos' : 'Vizinhos'}:
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={generateStrategy}
              >
                <RefreshCw className="w-3 h-3" />
              </Button>
            </div>
            
            <div className="grid grid-cols-7 gap-2">
              {currentStrategy.map((number, index) => {
                const color = getNumberColor(number);
                const colorClass = getColorClass(color);
                
                return (
                  <div
                    key={index}
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold ${colorClass}`}
                  >
                    {number}
                  </div>
                );
              })}
            </div>

            <div className="text-xs text-gray-400">
              {strategyType === 'straight-up' 
                ? 'Baseado em números quentes e frios dos últimos 30 resultados'
                : 'Número principal com 4 vizinhos da roda'
              }
            </div>
          </div>
        )}

        {results.length < 5 && (
          <div className="text-center text-gray-500 text-sm py-4">
            Mínimo 5 números necessários para gerar estratégias
          </div>
        )}
      </CardContent>
    </Card>
  );
}