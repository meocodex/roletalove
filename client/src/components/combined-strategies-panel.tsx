/**
 * Painel de Estratégias Combinadas
 * Exibe estratégias que combinam múltiplos tipos de apostas
 */

import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, Target, PieChart, Zap } from "lucide-react";
import { CombinedStrategiesEngine, type CombinedStrategy } from "@/lib/combined-strategies";
import type { RouletteResult } from "../../../shared/schema";

interface CombinedStrategiesPanelProps {
  className?: string;
}

export default function CombinedStrategiesPanel({ className }: CombinedStrategiesPanelProps) {
  const { data: results = [] } = useQuery<RouletteResult[]>({
    queryKey: ['/api/results'],
    refetchInterval: 1000,
  });

  // Gerar estratégia combinada
  const combinedStrategy = CombinedStrategiesEngine.generateOptimalStrategy(results);

  if (results.length < 25) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PieChart className="h-5 w-5" />
            Estratégias Combinadas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6 text-muted-foreground">
            <PieChart className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Aguardando dados para estratégias combinadas</p>
            <p className="text-sm">Mínimo 25 resultados necessários</p>
            <Progress value={(results.length / 25) * 100} className="mt-4" />
            <p className="text-xs mt-2">{results.length}/25 resultados</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!combinedStrategy) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PieChart className="h-5 w-5" />
            Estratégias Combinadas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4 text-muted-foreground">
            <p>Gerando estratégia otimizada...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'low': return 'bg-green-500';
      case 'medium': return 'bg-yellow-500';
      case 'high': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getRiskText = (riskLevel: string) => {
    switch (riskLevel) {
      case 'low': return 'Baixo';
      case 'medium': return 'Médio';
      case 'high': return 'Alto';
      default: return 'Desconhecido';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'straight_up': return '🎯';
      case 'neighbors': return '🔄';
      case 'dozens': return '📊';
      case 'colors': return '🎨';
      case 'even_odd': return '⚖️';
      default: return '🎲';
    }
  };

  const getTypeName = (type: string) => {
    switch (type) {
      case 'straight_up': return 'Números Plenos';
      case 'neighbors': return 'Vizinhos';
      case 'dozens': return 'Dúzias';
      case 'colors': return 'Cores';
      case 'even_odd': return 'Par/Ímpar';
      default: return type;
    }
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <PieChart className="h-5 w-5" />
          Estratégia Combinada
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Header da Estratégia */}
        <div className="p-3 border rounded-lg bg-card/50">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold">{combinedStrategy.name}</h3>
            <Badge 
              variant="outline" 
              className={`${getRiskColor(combinedStrategy.riskLevel)} text-white`}
            >
              Risco {getRiskText(combinedStrategy.riskLevel)}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mb-3">
            {combinedStrategy.description}
          </p>
          
          {/* Métricas Principais */}
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <div className="text-lg font-bold text-green-500">
                {(combinedStrategy.expectedReturn * 100).toFixed(1)}%
              </div>
              <div className="text-xs text-muted-foreground">Retorno Esperado</div>
            </div>
            <div>
              <div className="text-lg font-bold text-blue-500">
                {(combinedStrategy.confidence * 100).toFixed(0)}%
              </div>
              <div className="text-xs text-muted-foreground">Confiança</div>
            </div>
          </div>
        </div>

        {/* Alocações por Tipo */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium flex items-center gap-2">
            <Target className="h-4 w-4" />
            Distribuição de Apostas
          </h4>
          
          {combinedStrategy.allocations.map((allocation, index) => (
            <div key={index} className="space-y-2">
              {/* Header da Alocação */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{getTypeIcon(allocation.type)}</span>
                  <span className="font-medium text-sm">
                    {getTypeName(allocation.type)}
                  </span>
                  <Badge variant="secondary" className="text-xs">
                    {allocation.percentage}%
                  </Badge>
                </div>
                <span className="text-xs text-muted-foreground">
                  {allocation.expectedPayout}:1
                </span>
              </div>

              {/* Números da Alocação */}
              <div className="flex flex-wrap gap-1">
                {allocation.numbers.slice(0, 12).map((number) => (
                  <span
                    key={number}
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold ${
                      number === 0 
                        ? 'bg-green-600'
                        : [1,3,5,7,9,12,14,16,18,19,21,23,25,27,30,32,34,36].includes(number)
                        ? 'bg-red-600'
                        : 'bg-gray-800'
                    }`}
                  >
                    {number}
                  </span>
                ))}
                {allocation.numbers.length > 12 && (
                  <span className="w-6 h-6 rounded-full flex items-center justify-center bg-muted text-xs">
                    +{allocation.numbers.length - 12}
                  </span>
                )}
              </div>

              {/* Explicação */}
              <p className="text-xs text-muted-foreground italic">
                {allocation.reasoning}
              </p>

              {/* Barra de Progresso da Alocação */}
              <Progress value={allocation.percentage} className="h-2" />
            </div>
          ))}
        </div>

        {/* Resumo de Performance */}
        <div className="p-3 bg-muted rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="h-4 w-4" />
            <span className="text-sm font-medium">Resumo da Estratégia</span>
          </div>
          <div className="grid grid-cols-3 gap-2 text-xs">
            <div className="text-center">
              <div className="font-semibold">{combinedStrategy.allocations.length}</div>
              <div className="text-muted-foreground">Tipos</div>
            </div>
            <div className="text-center">
              <div className="font-semibold">
                {combinedStrategy.allocations.reduce((sum, a) => sum + a.numbers.length, 0)}
              </div>
              <div className="text-muted-foreground">Números</div>
            </div>
            <div className="text-center">
              <div className="font-semibold">
                {((combinedStrategy.allocations.reduce((sum, a) => sum + a.numbers.length, 0) / 37) * 100).toFixed(0)}%
              </div>
              <div className="text-muted-foreground">Cobertura</div>
            </div>
          </div>
        </div>

        {/* Indicador de Atualização */}
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Estratégia gerada por IA</span>
          <div className="flex items-center gap-1">
            <Zap className="h-3 w-3" />
            <span>Auto-atualização ativa</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}