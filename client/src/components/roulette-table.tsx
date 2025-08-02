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
    // Layout Mobile - Compacto com Zero lateral
    return (
      <div className={cn("bg-gray-900 p-2 rounded-lg", className)}>
        {/* Layout Mobile - Zero + 3 colunas */}
        <div className="flex items-start gap-1">
          
          {/* Zero - Ocupando altura das 3 linhas principais */}
          <Button
            onClick={() => handleNumberClick(0)}
            className={cn(
              "w-8 h-32 bg-roulette-green text-white font-bold text-base flex items-center justify-center transition-all duration-200 rounded-sm",
              "hover:bg-green-600 active:scale-95 touch-manipulation",
              isHighlighted(0) && "ring-2 ring-yellow-400"
            )}
            data-number="0"
          >
            0
          </Button>

          {/* Grid Vertical Compacto - 3 colunas x 12 linhas */}
          <div className="grid grid-cols-3 gap-0.5 flex-1">
            
            {/* Coluna 1 */}
            <div className="grid grid-rows-12 gap-0.5">
              {mobileCol1.map((number) => {
                const color = getNumberColor(number);
                const colorClass = getColorClass(color);
                
                return (
                  <Button
                    key={number}
                    onClick={() => handleNumberClick(number)}
                    className={cn(
                      "w-full h-8 text-white font-bold text-xs transition-all duration-200 rounded-sm",
                      "active:scale-95 touch-manipulation",
                      colorClass,
                      isHighlighted(number) && "ring-2 ring-yellow-400"
                    )}
                    data-number={number}
                  >
                    {number}
                  </Button>
                );
              })}
            </div>

            {/* Coluna 2 */}
            <div className="grid grid-rows-12 gap-0.5">
              {mobileCol2.map((number) => {
                const color = getNumberColor(number);
                const colorClass = getColorClass(color);
                
                return (
                  <Button
                    key={number}
                    onClick={() => handleNumberClick(number)}
                    className={cn(
                      "w-full h-8 text-white font-bold text-xs transition-all duration-200 rounded-sm",
                      "active:scale-95 touch-manipulation",
                      colorClass,
                      isHighlighted(number) && "ring-2 ring-yellow-400"
                    )}
                    data-number={number}
                  >
                    {number}
                  </Button>
                );
              })}
            </div>

            {/* Coluna 3 */}
            <div className="grid grid-rows-12 gap-0.5">
              {mobileCol3.map((number) => {
                const color = getNumberColor(number);
                const colorClass = getColorClass(color);
                
                return (
                  <Button
                    key={number}
                    onClick={() => handleNumberClick(number)}
                    className={cn(
                      "w-full h-8 text-white font-bold text-xs transition-all duration-200 rounded-sm",
                      "active:scale-95 touch-manipulation",
                      colorClass,
                      isHighlighted(number) && "ring-2 ring-yellow-400"
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

  // Layout Desktop - Horizontal tradicional
  return (
    <div className={cn("bg-gray-900 p-2 rounded", className)}>
      {/* Layout Mesa Europeia - Zero + 3 linhas */}
      <div className="flex items-center justify-center gap-1">
        
        {/* Zero - Preenchendo as 3 linhas */}
        <Button
          onClick={() => handleNumberClick(0)}
          className={cn(
            "w-10 h-32 bg-roulette-green text-white font-bold text-lg flex items-center justify-center transition-all duration-200 rounded-sm",
            "hover:bg-green-600",
            isHighlighted(0) && "ring-2 ring-yellow-400"
          )}
          data-number="0"
        >
          0
        </Button>

        {/* Grid Principal - 3 linhas compactas */}
        <div className="grid grid-rows-3 gap-0.5">
          
          {/* Linha 1 */}
          <div className="grid grid-cols-12 gap-0.5">
            {row1.map((number) => {
              const color = getNumberColor(number);
              const colorClass = getColorClass(color);
              
              return (
                <Button
                  key={number}
                  onClick={() => handleNumberClick(number)}
                  className={cn(
                    "w-8 h-10 text-white font-bold text-xs transition-all duration-200 rounded-sm",
                    colorClass,
                    isHighlighted(number) && "ring-2 ring-yellow-400"
                  )}
                  data-number={number}
                >
                  {number}
                </Button>
              );
            })}
          </div>

          {/* Linha 2 */}
          <div className="grid grid-cols-12 gap-0.5">
            {row2.map((number) => {
              const color = getNumberColor(number);
              const colorClass = getColorClass(color);
              
              return (
                <Button
                  key={number}
                  onClick={() => handleNumberClick(number)}
                  className={cn(
                    "w-8 h-10 text-white font-bold text-xs transition-all duration-200 rounded-sm",
                    colorClass,
                    isHighlighted(number) && "ring-2 ring-yellow-400"
                  )}
                  data-number={number}
                >
                  {number}
                </Button>
              );
            })}
          </div>

          {/* Linha 3 */}
          <div className="grid grid-cols-12 gap-0.5">
            {row3.map((number) => {
              const color = getNumberColor(number);
              const colorClass = getColorClass(color);
              
              return (
                <Button
                  key={number}
                  onClick={() => handleNumberClick(number)}
                  className={cn(
                    "w-8 h-10 text-white font-bold text-xs transition-all duration-200 rounded-sm",
                    colorClass,
                    isHighlighted(number) && "ring-2 ring-yellow-400"
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