import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RouletteTable } from '@/components/roulette-table';
import { Play } from 'lucide-react';
import { type RouletteResult } from '@shared/schema';

interface RouletteTableSectionProps {
  sessionActive: boolean;
  onToggleSession: () => void;
  lastResult: number | null;
  onNumberClick: (number: number) => void;
  results: RouletteResult[];
  clientPatterns: any[];
  compact?: boolean;
  getNumberColor: (num: number) => 'red' | 'black' | 'green';
  getColorClass: (color: 'red' | 'black' | 'green') => string;
}

export function RouletteTableSection({
  sessionActive,
  onToggleSession,
  lastResult,
  onNumberClick,
  results,
  clientPatterns,
  compact = false,
  getNumberColor,
  getColorClass
}: RouletteTableSectionProps) {
  const maxResults = compact ? 10 : 15;
  const cardPadding = compact ? 'p-3' : 'p-4';

  return (
    <Card>
      <CardHeader className={compact ? 'pb-2' : undefined}>
        <div className="flex items-center justify-between">
          <CardTitle className={compact ? 'text-sm font-medium' : 'text-xl'}>
            Mesa de Roleta Europeia
          </CardTitle>
          <div className="flex items-center space-x-3">
            <Button
              onClick={onToggleSession}
              size={compact ? 'sm' : 'default'}
              className={`${
                sessionActive
                  ? 'bg-red-600 hover:bg-red-700'
                  : 'bg-roulette-green hover:bg-green-600'
              } font-medium transition-colors ${compact ? 'text-xs px-2 py-1 h-7' : ''}`}
            >
              <Play className={compact ? 'mr-1' : 'mr-2'} size={compact ? 10 : 16} />
              {sessionActive ? (compact ? 'Pausar' : 'Pausar Sessão') : (compact ? 'Iniciar' : 'Iniciar Sessão')}
            </Button>
            {lastResult !== null && (
              <div className="text-xs text-gray-400">
                {!compact && 'Último resultado: '}
                <span
                  className={`font-bold ${compact ? 'text-sm' : 'text-lg'} ${
                    getNumberColor(lastResult) === 'red'
                      ? 'text-roulette-red'
                      : getNumberColor(lastResult) === 'black'
                      ? 'text-white'
                      : 'text-roulette-green'
                  }`}
                >
                  {lastResult}
                </span>
              </div>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className={cardPadding}>
        <RouletteTable onNumberClick={onNumberClick} lastResult={lastResult} />

        {/* Recent Results */}
        <div className={compact ? 'mt-1' : 'mt-3'}>
          <h3 className={`${compact ? 'text-xs' : 'text-sm'} font-medium mb-2`}>
            {compact ? 'Últimos' : 'Últimos Resultados'}
          </h3>
          <div className={`flex flex-wrap gap-${compact ? '1' : '2'}`}>
            {results.slice(0, maxResults).map((result, index) => {
              const color = getNumberColor(result.number);
              const isHighlighted = index === 0;

              return (
                <div
                  key={result.id}
                  className={`${compact ? 'w-6 h-6' : 'w-10 h-10'} ${
                    getColorClass(color).split(' ')[0]
                  } ${compact ? 'rounded-sm' : 'rounded-full'} flex items-center justify-center text-white font-bold ${
                    compact ? 'text-xs' : 'text-sm'
                  } border${compact ? '' : '-2'} ${
                    isHighlighted ? 'border-casino-gold' : 'border-transparent'
                  } transition-all duration-300`}
                  title={`${result.number} - ${new Date(result.timestamp).toLocaleTimeString()}`}
                >
                  {result.number}
                </div>
              );
            })}
            {results.length === 0 && (
              <div className={`text-gray-400 ${compact ? 'text-xs' : 'text-sm'}`}>
                Nenhum resultado ainda...
              </div>
            )}
          </div>
        </div>

        {/* Client-side pattern preview */}
        {clientPatterns.length > 0 && (
          <div
            className={`${
              compact ? 'mt-1 p-2' : 'mt-4 p-3'
            } bg-blue-900/20 border border-blue-600/30 rounded-${compact ? 'md' : 'lg'}`}
          >
            <h4 className={`${compact ? 'text-xs' : 'text-sm'} font-medium text-blue-400 mb-${compact ? '1' : '2'}`}>
              {compact ? 'Análise Instantânea:' : 'Análise em Tempo Real:'}
            </h4>
            <div className="text-xs text-blue-300">
              {clientPatterns[0].description} - {Math.round(clientPatterns[0].probability * 100)}%
            </div>
            {!compact && (
              <div className="text-xs text-blue-200 mt-1">{clientPatterns[0].suggestion}</div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
