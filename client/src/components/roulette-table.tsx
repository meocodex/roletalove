import { useState } from 'react';
import { getNumberColor, getColorClass } from '@/lib/roulette-utils';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';

interface RouletteTableProps {
  onNumberClick: (number: number) => void;
  lastResult?: number | null;
  className?: string;
}

export function RouletteTable({ onNumberClick, lastResult, className }: RouletteTableProps) {
  const [highlightedNumber, setHighlightedNumber] = useState<number | null>(null);
  const isMobile = useIsMobile();

  const handleNumberClick = (number: number) => {
    setHighlightedNumber(number);
    onNumberClick(number);
    
    // Haptic feedback on mobile
    if (isMobile && 'vibrate' in navigator) {
      navigator.vibrate(50);
    }
    
    // Remove highlight after animation
    setTimeout(() => setHighlightedNumber(null), 300);
  };

  const isHighlighted = (number: number) => 
    highlightedNumber === number || lastResult === number;

  // Layout da roleta europeia: números organizados em 3 linhas
  const row1 = [3, 6, 9, 12, 15, 18, 21, 24, 27, 30, 33, 36];
  const row2 = [2, 5, 8, 11, 14, 17, 20, 23, 26, 29, 32, 35];
  const row3 = [1, 4, 7, 10, 13, 16, 19, 22, 25, 28, 31, 34];

  // Layout vertical para mobile: números organizados em colunas
  const mobileCol1 = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
  const mobileCol2 = [13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24];
  const mobileCol3 = [25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36];

  if (isMobile) {
    // Layout Mobile - Vertical com 3 colunas
    return (
      <div className={cn("bg-gray-900 p-2 rounded-lg w-full max-w-sm mx-auto", className)}>
        {/* Zero - Retângulo preenchendo as 3 colunas */}
        <div className="mb-2">
          <Button
            onClick={() => handleNumberClick(0)}
            className={cn(
              "w-full h-12 bg-roulette-green text-white font-bold text-xl flex items-center justify-center transition-all duration-200 rounded-lg",
              "hover:bg-green-600 active:scale-95 touch-manipulation shadow-lg",
              isHighlighted(0) && "ring-2 ring-yellow-400 ring-offset-1"
            )}
            data-number="0"
          >
            0
          </Button>
        </div>

        {/* Mesa Vertical - 3 colunas x 12 linhas */}
        <div className="grid grid-cols-3 gap-2 w-full">
          
          {/* Coluna 1: 1-12 */}
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((number) => {
            const color = getNumberColor(number);
            const colorClass = getColorClass(color);
            
            return (
              <Button
                key={number}
                onClick={() => handleNumberClick(number)}
                className={cn(
                  "aspect-square w-full text-white font-bold text-sm transition-all duration-200 rounded-lg shadow-sm",
                  "active:scale-95 touch-manipulation flex items-center justify-center",
                  colorClass,
                  isHighlighted(number) && "ring-2 ring-yellow-400 ring-offset-1"
                )}
                data-number={number}
              >
                {number}
              </Button>
            );
          })}

          {/* Coluna 2: 13-24 */}
          {[13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24].map((number) => {
            const color = getNumberColor(number);
            const colorClass = getColorClass(color);
            
            return (
              <Button
                key={number}
                onClick={() => handleNumberClick(number)}
                className={cn(
                  "aspect-square w-full text-white font-bold text-sm transition-all duration-200 rounded-lg shadow-sm",
                  "active:scale-95 touch-manipulation flex items-center justify-center",
                  colorClass,
                  isHighlighted(number) && "ring-2 ring-yellow-400 ring-offset-1"
                )}
                data-number={number}
              >
                {number}
              </Button>
            );
          })}

          {/* Coluna 3: 25-36 */}
          {[25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36].map((number) => {
            const color = getNumberColor(number);
            const colorClass = getColorClass(color);
            
            return (
              <Button
                key={number}
                onClick={() => handleNumberClick(number)}
                className={cn(
                  "aspect-square w-full text-white font-bold text-sm transition-all duration-200 rounded-lg shadow-sm",
                  "active:scale-95 touch-manipulation flex items-center justify-center",
                  colorClass,
                  isHighlighted(number) && "ring-2 ring-yellow-400 ring-offset-1"
                )}
                data-number={number}
              >
                {number}
              </Button>
            );
          })}

        </div>
      </div>
    );
  }

  // Layout Desktop - Horizontal harmonizado
  return (
    <div className={cn("bg-gray-900 p-3 rounded-lg w-full max-w-none", className)}>
      {/* Layout Mesa Europeia - Zero + 3 linhas harmonizado */}
      <div className="flex items-start justify-center gap-2 w-full">
        
        {/* Zero - Retângulo harmonizado ocupando as 3 linhas */}
        <Button
          onClick={() => handleNumberClick(0)}
          className={cn(
            "w-12 h-[calc(3*2.75rem+1rem)] bg-roulette-green text-white font-bold text-xl flex items-center justify-center transition-all duration-200 rounded-lg shadow-lg flex-shrink-0",
            "hover:bg-green-600 active:scale-95",
            isHighlighted(0) && "ring-2 ring-yellow-400 ring-offset-1"
          )}
          data-number="0"
        >
          0
        </Button>

        {/* Grid Principal - 3 linhas horizontais harmonizadas */}
        <div className="grid grid-rows-3 gap-2 flex-1 min-w-0">
          
          {/* Linha 1 */}
          <div className="grid grid-cols-12 gap-1 w-full">
            {row1.map((number) => {
              const color = getNumberColor(number);
              const colorClass = getColorClass(color);
              
              return (
                <Button
                  key={number}
                  onClick={() => handleNumberClick(number)}
                  className={cn(
                    "aspect-square w-full h-11 text-white font-bold text-sm transition-all duration-200 rounded-lg shadow-sm",
                    "hover:scale-105 active:scale-95 flex items-center justify-center",
                    colorClass,
                    isHighlighted(number) && "ring-2 ring-yellow-400 ring-offset-1"
                  )}
                  data-number={number}
                >
                  {number}
                </Button>
              );
            })}
          </div>

          {/* Linha 2 */}
          <div className="grid grid-cols-12 gap-1 w-full">
            {row2.map((number) => {
              const color = getNumberColor(number);
              const colorClass = getColorClass(color);
              
              return (
                <Button
                  key={number}
                  onClick={() => handleNumberClick(number)}
                  className={cn(
                    "aspect-square w-full h-11 text-white font-bold text-sm transition-all duration-200 rounded-lg shadow-sm",
                    "hover:scale-105 active:scale-95 flex items-center justify-center",
                    colorClass,
                    isHighlighted(number) && "ring-2 ring-yellow-400 ring-offset-1"
                  )}
                  data-number={number}
                >
                  {number}
                </Button>
              );
            })}
          </div>

          {/* Linha 3 */}
          <div className="grid grid-cols-12 gap-1 w-full">
            {row3.map((number) => {
              const color = getNumberColor(number);
              const colorClass = getColorClass(color);
              
              return (
                <Button
                  key={number}
                  onClick={() => handleNumberClick(number)}
                  className={cn(
                    "aspect-square w-full h-11 text-white font-bold text-sm transition-all duration-200 rounded-lg shadow-sm",
                    "hover:scale-105 active:scale-95 flex items-center justify-center",
                    colorClass,
                    isHighlighted(number) && "ring-2 ring-yellow-400 ring-offset-1"
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