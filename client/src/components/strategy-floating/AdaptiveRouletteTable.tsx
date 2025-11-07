import { memo } from 'react';
import { Badge } from '@/components/ui/badge';
import { getNumberColor, getColorClass } from '@/lib/roulette-utils';
import { cn } from '@/lib/utils';

interface AdaptiveRouletteTableProps {
  size: 'compact' | 'expanded';
  recommendedNumbers: number[];
  onNumberClick: (number: number) => void;
  lastResult?: number | null;
  disabled?: boolean;
  className?: string;
}

const ROULETTE_LAYOUT = {
  // European roulette layout - 3 columns, 12 rows
  grid: [
    [3, 6, 9, 12, 15, 18, 21, 24, 27, 30, 33, 36],
    [2, 5, 8, 11, 14, 17, 20, 23, 26, 29, 32, 35],
    [1, 4, 7, 10, 13, 16, 19, 22, 25, 28, 31, 34]
  ]
};

interface NumberButtonProps {
  number: number;
  isRecommended: boolean;
  isLastResult: boolean;
  size: 'compact' | 'expanded';
  onClick: () => void;
  disabled?: boolean;
}

const NumberButton = memo(({ 
  number, 
  isRecommended, 
  isLastResult, 
  size, 
  onClick, 
  disabled 
}: NumberButtonProps) => {
  const color = getNumberColor(number);
  const baseColorClass = getColorClass(color);
  
  const sizeClasses = {
    compact: "w-6 h-6 text-xs",
    expanded: "w-8 h-8 text-sm"
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "relative font-medium rounded transition-all duration-200 border",
        sizeClasses[size],
        
        // Base colors
        color === 'red' && "bg-red-600 text-white border-red-500",
        color === 'black' && "bg-gray-900 text-white border-gray-700",
        color === 'green' && "bg-green-600 text-white border-green-500",
        
        // States
        !disabled && "hover:scale-105 hover:shadow-lg cursor-pointer",
        disabled && "opacity-50 cursor-not-allowed",
        
        // Recommended highlight
        isRecommended && [
          "ring-2 ring-yellow-400 ring-offset-2 ring-offset-gray-800",
          "shadow-lg shadow-yellow-400/50",
          "animate-pulse"
        ],
        
        // Last result highlight  
        isLastResult && [
          "ring-2 ring-roulette-green ring-offset-2 ring-offset-gray-800",
          "shadow-lg shadow-green-400/50"
        ]
      )}
    >
      {number}
      
      {/* Recommended indicator */}
      {isRecommended && (
        <div className="absolute -top-1 -right-1 w-2 h-2 bg-yellow-400 rounded-full animate-ping" />
      )}
      
      {/* Last result indicator */}
      {isLastResult && (
        <div className="absolute -top-1 -left-1 w-2 h-2 bg-roulette-green rounded-full" />
      )}
    </button>
  );
});

NumberButton.displayName = 'NumberButton';

export const AdaptiveRouletteTable = memo(({ 
  size, 
  recommendedNumbers = [], 
  onNumberClick, 
  lastResult = null,
  disabled = false,
  className 
}: AdaptiveRouletteTableProps) => {
  
  const handleNumberClick = (number: number) => {
    if (!disabled) {
      onNumberClick(number);
    }
  };

  const isRecommended = (num: number) => recommendedNumbers.includes(num);
  const isLastResult = (num: number) => lastResult === num;

  const containerClasses = {
    compact: "p-3 space-y-2",
    expanded: "p-4 space-y-3"
  };

  return (
    <div className={cn(containerClasses[size], className)}>
      {/* Zero */}
      <div className="flex justify-center mb-3">
        <NumberButton
          number={0}
          isRecommended={isRecommended(0)}
          isLastResult={isLastResult(0)}
          size={size}
          onClick={() => handleNumberClick(0)}
          disabled={disabled}
        />
      </div>

      {/* Main grid */}
      <div className="space-y-1">
        {ROULETTE_LAYOUT.grid.map((row, rowIndex) => (
          <div key={rowIndex} className="flex justify-center gap-1">
            {row.map((number) => (
              <NumberButton
                key={number}
                number={number}
                isRecommended={isRecommended(number)}
                isLastResult={isLastResult(number)}
                size={size}
                onClick={() => handleNumberClick(number)}
                disabled={disabled}
              />
            ))}
          </div>
        ))}
      </div>

      {/* Legend */}
      {recommendedNumbers.length > 0 && (
        <div className="flex items-center justify-center gap-2 mt-3 pt-2 border-t border-gray-700">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-yellow-400 rounded-full animate-ping" />
            <span className="text-xs text-gray-400">Recomendado</span>
          </div>
          <Badge variant="outline" className="text-xs">
            {recommendedNumbers.length} números
          </Badge>
        </div>
      )}
    </div>
  );
});

AdaptiveRouletteTable.displayName = 'AdaptiveRouletteTable';