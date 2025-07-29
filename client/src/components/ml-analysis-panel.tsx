/**
 * Painel de Análise com Machine Learning
 * Integra algoritmos avançados de ML na interface
 */

import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Brain, TrendingUp, Target, Activity } from "lucide-react";
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
  const topPredictions = mlPredictions.slice(0, 10);
  const hotNumbers = mlPredictions.filter(p => p.category === 'hot');
  const coldNumbers = mlPredictions.filter(p => p.category === 'cold');

  if (results.length < 20) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            Análise ML Avançada
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Brain className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Aguardando dados para análise ML</p>
            <p className="text-sm">Mínimo 20 resultados necessários</p>
            <Progress value={(results.length / 20) * 100} className="mt-4" />
            <p className="text-xs mt-2">{results.length}/20 resultados</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Painel Principal de Previsões */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            Previsões ML - Top 10 Números
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3">
            {topPredictions.map((prediction, index) => (
              <div
                key={prediction.number}
                className="flex items-center justify-between p-3 rounded-lg border bg-card/50"
              >
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-muted-foreground">
                      #{index + 1}
                    </span>
                    <span
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm ${
                        prediction.number === 0 
                          ? 'bg-green-600'
                          : [1,3,5,7,9,12,14,16,18,19,21,23,25,27,30,32,34,36].includes(prediction.number)
                          ? 'bg-red-600'
                          : 'bg-gray-800'
                      }`}
                    >
                      {prediction.number}
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">
                        {(prediction.probability * 100).toFixed(1)}%
                      </span>
                      <Badge 
                        variant={
                          prediction.category === 'hot' ? 'destructive' :
                          prediction.category === 'cold' ? 'secondary' : 'outline'
                        }
                        className="text-xs"
                      >
                        {prediction.category === 'hot' ? 'Quente' :
                         prediction.category === 'cold' ? 'Frio' : 'Neutro'}
                      </Badge>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {prediction.reasoning[0]}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Progress 
                    value={prediction.confidence * 100} 
                    className="w-16"
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

      {/* Análise por Categorias */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Números Quentes */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm">
              <TrendingUp className="h-4 w-4 text-red-500" />
              Números Quentes ({hotNumbers.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {hotNumbers.slice(0, 8).map((prediction) => (
                <div
                  key={prediction.number}
                  className="flex items-center gap-1 px-2 py-1 rounded bg-red-100 dark:bg-red-900/20"
                >
                  <span
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold ${
                      prediction.number === 0 
                        ? 'bg-green-600'
                        : [1,3,5,7,9,12,14,16,18,19,21,23,25,27,30,32,34,36].includes(prediction.number)
                        ? 'bg-red-600'
                        : 'bg-gray-800'
                    }`}
                  >
                    {prediction.number}
                  </span>
                  <span className="text-xs font-medium">
                    {(prediction.probability * 100).toFixed(1)}%
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Números Frios */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm">
              <Activity className="h-4 w-4 text-blue-500" />
              Números Frios ({coldNumbers.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {coldNumbers.slice(0, 8).map((prediction) => (
                <div
                  key={prediction.number}
                  className="flex items-center gap-1 px-2 py-1 rounded bg-blue-100 dark:bg-blue-900/20"
                >
                  <span
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold ${
                      prediction.number === 0 
                        ? 'bg-green-600'
                        : [1,3,5,7,9,12,14,16,18,19,21,23,25,27,30,32,34,36].includes(prediction.number)
                        ? 'bg-red-600'
                        : 'bg-gray-800'
                    }`}
                  >
                    {prediction.number}
                  </span>
                  <span className="text-xs font-medium text-muted-foreground">
                    {(prediction.probability * 100).toFixed(1)}%
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Métricas Avançadas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm">
            <Target className="h-4 w-4" />
            Métricas do Sistema ML
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold">
                {topPredictions.length > 0 ? (topPredictions[0].probability * 100).toFixed(1) : '0'}%
              </div>
              <div className="text-xs text-muted-foreground">Melhor Previsão</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">
                {topPredictions.length > 0 ? (topPredictions.slice(0, 3).reduce((sum, p) => sum + p.confidence, 0) / 3 * 100).toFixed(0) : '0'}%
              </div>
              <div className="text-xs text-muted-foreground">Confiança Média</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-500">
                {hotNumbers.length}
              </div>
              <div className="text-xs text-muted-foreground">Números Quentes</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-500">
                {coldNumbers.length}
              </div>
              <div className="text-xs text-muted-foreground">Números Frios</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Explicações Detalhadas */}
      {topPredictions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">
              Análise Detalhada - Número {topPredictions[0].number}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {topPredictions[0].reasoning.map((reason, index) => (
                <div key={index} className="flex items-center gap-2 text-sm">
                  <div className="w-2 h-2 rounded-full bg-primary" />
                  <span>{reason}</span>
                </div>
              ))}
            </div>
            <div className="mt-4 p-3 bg-muted rounded-lg">
              <div className="text-xs font-medium mb-2">Algoritmos Utilizados:</div>
              <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                <div>• Cadeias de Markov (Ordem 3)</div>
                <div>• Probabilidades Bayesianas</div>
                <div>• Análise de Vizinhança Física</div>
                <div>• Ensemble Learning</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}