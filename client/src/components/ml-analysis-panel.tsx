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

  // Criar estratégias de vizinhos baseadas em ML
  const getNeighborsStrategy = () => {
    if (topPredictions.length === 0) return [];
    
    const mainNumber = topPredictions[0].number;
    
    // Mapeamento da roda física da roleta europeia
    const wheelOrder = [0,32,15,19,4,21,2,25,17,34,6,27,13,36,11,30,8,23,10,5,24,16,33,1,20,14,31,9,22,18,29,7,28,12,35,3,26];
    
    const mainIndex = wheelOrder.indexOf(mainNumber);
    if (mainIndex === -1) return [];
    
    // Pegar 2 vizinhos de cada lado (5 números total)
    const neighbors = [];
    for (let i = -2; i <= 2; i++) {
      const index = (mainIndex + i + wheelOrder.length) % wheelOrder.length;
      neighbors.push(wheelOrder[index]);
    }
    
    return neighbors;
  };

  const neighbors = getNeighborsStrategy();

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Números Plenos ML */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-purple-400 text-sm">
            <Target className="h-4 w-4" />
            Números Plenos ML
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-1">
            {topPredictions.slice(0, 7).map((prediction, index) => (
              <span
                key={prediction.number}
                className={`w-8 h-8 rounded-md flex items-center justify-center text-white font-bold text-sm ${
                  prediction.number === 0 
                    ? 'bg-green-600'
                    : [1,3,5,7,9,12,14,16,18,19,21,23,25,27,30,32,34,36].includes(prediction.number)
                    ? 'bg-red-600'
                    : 'bg-gray-700'
                } ${index === 0 ? 'ring-2 ring-purple-400' : ''}`}
                title={index === 0 ? 'Número principal ML' : `Número ${index + 1} ML`}
              >
                {prediction.number}
              </span>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Vizinhos ML */}
      {neighbors.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-purple-400 text-sm">
              <Brain className="h-4 w-4" />
              Vizinhos ML
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-1">
              {neighbors.map((number, index) => {
                const isMain = index === 2; // Número central
                return (
                  <span
                    key={number}
                    className={`w-8 h-8 rounded-md flex items-center justify-center text-white font-bold text-sm ${
                      number === 0 
                        ? 'bg-green-600'
                        : [1,3,5,7,9,12,14,16,18,19,21,23,25,27,30,32,34,36].includes(number)
                        ? 'bg-red-600'
                        : 'bg-gray-700'
                    } ${isMain ? 'ring-2 ring-purple-400' : ''}`}
                    title={isMain ? 'Número principal' : 'Vizinho'}
                  >
                    {number}
                  </span>
                );
              })}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Número principal destacado com anel roxo
            </p>
          </CardContent>
        </Card>
      )}

      {/* Análise Rápida */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-yellow-400 text-sm">
            <Zap className="h-4 w-4" />
            Análise Rápida
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-2 text-center">
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
                {topPredictions.length}
              </p>
              <p className="text-xs text-muted-foreground">Previsões</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}