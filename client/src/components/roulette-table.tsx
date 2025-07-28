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

  return (
    <div className={cn("bg-roulette-green p-4 rounded-lg border-2 border-casino-gold", className)}>
      
      {/* Zero Section */}
      <div className="flex justify-center mb-2">
        <Button
          onClick={() => handleNumberClick(0)}
          className={cn(
            "w-16 h-12 bg-roulette-green border-2 border-white text-white font-bold text-lg rounded transition-all duration-300",
            "hover:bg-green-600",
            isHighlighted(0) && "ring-4 ring-casino-gold scale-105"
          )}
          data-number="0"
        >
          0
        </Button>
      </div>

      {/* Main Number Grid */}
      <div className="grid grid-cols-12 gap-1 mb-4">
        {ROULETTE_LAYOUT.map((row, rowIndex) =>
          row.map((number) => {
            const color = getNumberColor(number);
            const colorClass = getColorClass(color);
            
            return (
              <Button
                key={number}
                onClick={() => handleNumberClick(number)}
                className={cn(
                  "w-12 h-10 border border-white text-white font-bold text-sm rounded transition-all duration-300",
                  colorClass,
                  isHighlighted(number) && "ring-4 ring-casino-gold scale-105"
                )}
                data-number={number}
              >
                {number}
              </Button>
            );
          })
        )}
      </div>

      {/* Outside Bets */}
      <div className="grid grid-cols-6 gap-2 mt-4">
        {/* First Row - Dozens and Columns */}
        <Button className="h-10 bg-gray-700 border border-white text-white font-medium text-sm rounded hover:bg-gray-600 transition-colors">
          1ª Dúzia<br />1-12
        </Button>
        <Button className="h-10 bg-gray-700 border border-white text-white font-medium text-sm rounded hover:bg-gray-600 transition-colors">
          2ª Dúzia<br />13-24
        </Button>
        <Button className="h-10 bg-gray-700 border border-white text-white font-medium text-sm rounded hover:bg-gray-600 transition-colors">
          3ª Dúzia<br />25-36
        </Button>
        <Button className="h-10 bg-gray-700 border border-white text-white font-medium text-sm rounded hover:bg-gray-600 transition-colors">
          1ª Coluna
        </Button>
        <Button className="h-10 bg-gray-700 border border-white text-white font-medium text-sm rounded hover:bg-gray-600 transition-colors">
          2ª Coluna
        </Button>
        <Button className="h-10 bg-gray-700 border border-white text-white font-medium text-sm rounded hover:bg-gray-600 transition-colors">
          3ª Coluna
        </Button>
        
        {/* Second Row - Colors and Even/Odd */}
        <Button className="h-10 bg-roulette-red border border-white text-white font-medium text-sm rounded hover:bg-red-600 transition-colors">
          Vermelho
        </Button>
        <Button className="h-10 bg-black border border-white text-white font-medium text-sm rounded hover:bg-gray-800 transition-colors">
          Preto
        </Button>
        <Button className="h-10 bg-gray-700 border border-white text-white font-medium text-sm rounded hover:bg-gray-600 transition-colors">
          Par
        </Button>
        <Button className="h-10 bg-gray-700 border border-white text-white font-medium text-sm rounded hover:bg-gray-600 transition-colors">
          Ímpar
        </Button>
        <Button className="h-10 bg-gray-700 border border-white text-white font-medium text-sm rounded hover:bg-gray-600 transition-colors">
          1-18
        </Button>
        <Button className="h-10 bg-gray-700 border border-white text-white font-medium text-sm rounded hover:bg-gray-600 transition-colors">
          19-36
        </Button>
      </div>
    </div>
  );
}
