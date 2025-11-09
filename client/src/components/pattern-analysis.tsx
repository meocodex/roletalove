import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Brain, TrendingUp } from 'lucide-react';
import { type PatternResult } from '@/lib/pattern-analyzer';

interface PatternAnalysisProps {
  patterns: PatternResult[];
  className?: string;
}

export function PatternAnalysis({ patterns, className }: PatternAnalysisProps) {
  const isLoading = false;

  const getPatternTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      'color_sequence': 'Sequência de Cores',
      'dozen_hot': 'Dúzia Quente',
      'hot_number': 'Número Quente',
      'parity_trend': 'Tendência Par/Ímpar',
      'exact': 'Sequência Exata',
      'mixed': 'Padrão Misto'
    };
    return labels[type] || type;
  };

  const getSeverityColor = (probability: number) => {
    if (probability >= 0.85) return 'bg-green-900/30 border-green-600';
    if (probability >= 0.75) return 'bg-yellow-900/30 border-yellow-600';
    return 'bg-gray-700 border-gray-600';
  };

  const getProbabilityColor = (probability: number) => {
    if (probability >= 0.85) return 'text-green-400';
    if (probability >= 0.75) return 'text-yellow-400';
    return 'text-gray-400';
  };

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center text-lg">
            <Brain className="text-roulette-green mr-2" size={20} />
            Análise de Padrões
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
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

  const topPatterns = patterns.slice(0, 3);

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center text-lg">
          <Brain className="text-roulette-green mr-2" size={20} />
          Análise de Padrões
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {topPatterns.length === 0 ? (
            <div className="bg-gray-700 rounded p-3 text-center">
              <p className="text-gray-400 text-sm">
                Aguardando dados suficientes para análise...
              </p>
            </div>
          ) : (
            topPatterns.map((pattern, index) => (
              <div
                key={pattern.id || `pattern-${index}`}
                className={`border rounded p-3 ${getSeverityColor(pattern.probability)}`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">
                    {getPatternTypeLabel(pattern.type)}
                  </span>
                  <Badge className={`text-xs font-bold ${getProbabilityColor(pattern.probability)}`}>
                    {Math.round(pattern.probability * 100)}%
                  </Badge>
                </div>
                
                <div className="text-xs text-gray-300 mb-2">
                  {pattern.type === 'color_sequence' && (
                    <>Sequência: {JSON.stringify(pattern.sequence)} → {pattern.outcomes ? String(pattern.outcomes) : 'N/A'}</>
                  )}
                  {pattern.type === 'dozen_hot' && (
                    <>Dúzia: {String(pattern.sequence)}</>
                  )}
                  {pattern.type === 'hot_number' && (
                    <>Número: {String(pattern.sequence)}</>
                  )}
                </div>
                
                <div className={`text-xs ${getProbabilityColor(pattern.probability)}`}>
                  {pattern.type === 'color_sequence' && 'Sugestão: Apostar na cor oposta'}
                  {pattern.type === 'dozen_hot' && `Sugestão: Apostar na ${String(pattern.sequence).replace('dozen_', '')}ª Dúzia`}
                  {pattern.type === 'hot_number' && `Sugestão: Considerar número ${String(pattern.sequence)}`}
                </div>
                
                <div className="mt-2 text-xs text-gray-500">
                  Ocorrências: {pattern.totalOccurrences ?? 0} | Acertos: {pattern.successCount ?? 0}
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
