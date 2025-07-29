/**
 * Painel de Análise ML - Versão Compacta e Harmônica
 * Interface responsiva e adaptativa para qualquer tipo de tela
 */

import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Brain, TrendingUp, Target, Activity, Zap } from "lucide-react";
import { MLAnalyzer, type MLPrediction } from "@/lib/ml-analyzer";
import type { RouletteResult } from "../../../shared/schema";

interface MLAnalysisPanelProps {
  className?: string;
}

export default function MLAnalysisPanel({ className }: MLAnalysisPanelProps) {
  const { data: results = [] } = useQuery<RouletteResult[]>({
    queryKey: ['/api/results'],
    refetchInterval: 1000,
  });

  // Análise ML em tempo real
  const mlPredictions = MLAnalyzer.analyzePredictions(results);
  const topPredictions = mlPredictions.slice(0, 6);
  const hotNumbers = mlPredictions.filter(p => p.category === 'hot').slice(0, 4);
  const coldNumbers = mlPredictions.filter(p => p.category === 'cold').slice(0, 4);

  if (results.length < 20) {
    return (
      <Card className={className}>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-purple-400 text-base">
            <Brain className="h-4 w-4" />
            Análise ML
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4 text-muted-foreground">
            <Brain className="h-8 w-8 mx-auto mb-3 opacity-50" />
            <p className="text-sm">Aguardando dados para ML</p>
            <p className="text-xs">Mínimo 20 resultados necessários</p>
            <Progress value={(results.length / 20) * 100} className="mt-3 h-2" />
            <p className="text-xs mt-2">{results.length}/20 resultados</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Painel Principal - Compacto */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-purple-400 text-base">
            <Brain className="h-4 w-4" />
            Previsões ML - Top {topPredictions.length}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2">
            {topPredictions.map((prediction, index) => (
              <div
                key={prediction.number}
                className="flex items-center justify-between p-2 rounded-lg border bg-card/30 hover:bg-card/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xs font-medium text-muted-foreground w-6">
                    #{index + 1}
                  </span>
                  <span
                    className={`w-7 h-7 rounded-md flex items-center justify-center text-white font-bold text-xs ${
                      prediction.number === 0 
                        ? 'bg-green-600'
                        : [1,3,5,7,9,12,14,16,18,19,21,23,25,27,30,32,34,36].includes(prediction.number)
                        ? 'bg-red-600'
                        : 'bg-gray-700'
                    }`}
                  >
                    {prediction.number}
                  </span>
                  <div className="flex flex-col min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">
                        {(prediction.probability * 100).toFixed(1)}%
                      </span>
                      <Badge 
                        variant={
                          prediction.category === 'hot' ? 'destructive' :
                          prediction.category === 'cold' ? 'secondary' : 'outline'
                        }
                        className="text-xs px-1.5 py-0"
                      >
                        {prediction.category === 'hot' ? 'Quente' :
                         prediction.category === 'cold' ? 'Frio' : 'Neutro'}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground truncate">
                      {prediction.reasoning[0]}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Progress 
                    value={prediction.confidence * 100} 
                    className="w-12 h-2"
                  />
                  <span className="text-xs text-muted-foreground w-8 text-right">
                    {(prediction.confidence * 100).toFixed(0)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Análise por Categorias - Grid Responsivo */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Números Quentes */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-red-400 text-sm">
              <TrendingUp className="h-4 w-4" />
              Quentes ({hotNumbers.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-2">
              {hotNumbers.slice(0, 4).map((prediction) => (
                <div key={prediction.number} className="text-center">
                  <span
                    className={`w-8 h-8 rounded-md flex items-center justify-center text-white font-bold text-sm mx-auto mb-1 ${
                      prediction.number === 0 
                        ? 'bg-green-600'
                        : [1,3,5,7,9,12,14,16,18,19,21,23,25,27,30,32,34,36].includes(prediction.number)
                        ? 'bg-red-600'
                        : 'bg-gray-700'
                    }`}
                  >
                    {prediction.number}
                  </span>
                  <p className="text-xs text-red-400 font-medium">
                    {(prediction.probability * 100).toFixed(0)}%
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Números Frios */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-blue-400 text-sm">
              <Activity className="h-4 w-4" />
              Frios ({coldNumbers.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-2">
              {coldNumbers.slice(0, 4).map((prediction) => (
                <div key={prediction.number} className="text-center">
                  <span
                    className={`w-8 h-8 rounded-md flex items-center justify-center text-white font-bold text-sm mx-auto mb-1 ${
                      prediction.number === 0 
                        ? 'bg-green-600'
                        : [1,3,5,7,9,12,14,16,18,19,21,23,25,27,30,32,34,36].includes(prediction.number)
                        ? 'bg-red-600'
                        : 'bg-gray-700'
                    }`}
                  >
                    {prediction.number}
                  </span>
                  <p className="text-xs text-blue-400 font-medium">
                    {(prediction.probability * 100).toFixed(0)}%
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Métricas Resumidas */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-yellow-400 text-sm">
            <Target className="h-4 w-4" />
            Métricas ML
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
            <div>
              <p className="text-lg font-bold text-green-400">
                {mlPredictions.length}
              </p>
              <p className="text-xs text-muted-foreground">Previsões</p>
            </div>
            <div>
              <p className="text-lg font-bold text-red-400">
                {hotNumbers.length}
              </p>
              <p className="text-xs text-muted-foreground">Quentes</p>
            </div>
            <div>
              <p className="text-lg font-bold text-blue-400">
                {coldNumbers.length}
              </p>
              <p className="text-xs text-muted-foreground">Frios</p>
            </div>
            <div>
              <p className="text-lg font-bold text-purple-400">
                {topPredictions.length > 0 ? (topPredictions[0].confidence * 100).toFixed(0) : 0}%
              </p>
              <p className="text-xs text-muted-foreground">Confiança</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}