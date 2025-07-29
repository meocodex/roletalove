import { useState } from 'react';
import { getNumberColor, getColorClass, ROULETTE_LAYOUT } from '@/lib/roulette-utils';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface RouletteTableProps {
  onNumberClick: (number: number) => void;
  lastResult?: number | null;
  className?: string;
}

export function RouletteTable({ onNumberClick, lastResult, className }: RouletteTableProps) {
  const [highlightedNumber, setHighlightedNumber] = useState<number | null>(null);

  const handleNumberClick = (number: number) => {
    setHighlightedNumber(number);
    onNumberClick(number);
    
    // Remove highlight after animation
    setTimeout(() => setHighlightedNumber(null), 300);
  };

  const isHighlighted = (number: number) => 
    highlightedNumber === number || lastResult === number;

  // Estrutura da roleta europeia original: números organizados em 3 linhas com 0 à esquerda
  const getNumbersInRows = () => {
    const row1 = [3, 6, 9, 12, 15, 18, 21, 24, 27, 30, 33, 36];
    const row2 = [2, 5, 8, 11, 14, 17, 20, 23, 26, 29, 32, 35];
    const row3 = [1, 4, 7, 10, 13, 16, 19, 22, 25, 28, 31, 34];
    return [row1, row2, row3];
  };

  const rows = getNumbersInRows();

  return (
    <div className={cn("bg-roulette-green p-6 rounded-lg border-2 border-casino-gold", className)}>
      
      {/* Layout da Mesa Europeia Original */}
      <div className="flex items-center justify-center gap-2">
        
        {/* Zero - Preenchendo as 3 linhas completas */}
        <div className="flex">
          <Button
            onClick={() => handleNumberClick(0)}
            className={cn(
              "w-16 h-36 bg-roulette-green border-2 border-white text-white font-bold text-2xl flex items-center justify-center transition-all duration-300",
              "hover:bg-green-600",
              isHighlighted(0) && "ring-4 ring-casino-gold scale-105"
            )}
            data-number="0"
          >
            0
          </Button>
        </div>

        {/* Grid Principal - 3 linhas de números */}
        <div className="grid grid-rows-3 gap-1">
          
          {/* Linha 1: 3, 6, 9, 12, 15, 18, 21, 24, 27, 30, 33, 36 */}
          <div className="grid grid-cols-12 gap-1">
            {rows[0].map((number) => {
              const color = getNumberColor(number);
              const colorClass = getColorClass(color);
              
              return (
                <Button
                  key={number}
                  onClick={() => handleNumberClick(number)}
                  className={cn(
                    "w-12 h-11 border border-white text-white font-bold text-sm transition-all duration-300",
                    colorClass,
                    isHighlighted(number) && "ring-4 ring-casino-gold scale-105"
                  )}
                  data-number={number}
                >
                  {number}
                </Button>
              );
            })}
          </div>

          {/* Linha 2: 2, 5, 8, 11, 14, 17, 20, 23, 26, 29, 32, 35 */}
          <div className="grid grid-cols-12 gap-1">
            {rows[1].map((number) => {
              const color = getNumberColor(number);
              const colorClass = getColorClass(color);
              
              return (
                <Button
                  key={number}
                  onClick={() => handleNumberClick(number)}
                  className={cn(
                    "w-12 h-11 border border-white text-white font-bold text-sm transition-all duration-300",
                    colorClass,
                    isHighlighted(number) && "ring-4 ring-casino-gold scale-105"
                  )}
                  data-number={number}
                >
                  {number}
                </Button>
              );
            })}
          </div>

          {/* Linha 3: 1, 4, 7, 10, 13, 16, 19, 22, 25, 28, 31, 34 */}
          <div className="grid grid-cols-12 gap-1">
            {rows[2].map((number) => {
              const color = getNumberColor(number);
              const colorClass = getColorClass(color);
              
              return (
                <Button
                  key={number}
                  onClick={() => handleNumberClick(number)}
                  className={cn(
                    "w-12 h-11 border border-white text-white font-bold text-sm transition-all duration-300",
                    colorClass,
                    isHighlighted(number) && "ring-4 ring-casino-gold scale-105"
                  )}
                  data-number={number}
                >
                  {number}
                </Button>
              );
            })}
          </div>

        </div>

      </div>
      
    </div>
  );
}
