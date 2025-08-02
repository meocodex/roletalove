/**
 * Painel de Recomendações de Apostas - Versão Compacta e Harmônica
 * Interface responsiva e adaptativa para qualquer tipo de tela
 */

import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Target, Zap, Brain, AlertCircle, Copy } from "lucide-react";
import { MLAnalyzer } from "@/lib/ml-analyzer";
import type { RouletteResult, Strategy } from "../../../shared/schema";
import { useToast } from "@/hooks/use-toast";

interface BettingRecommendationsProps {
  className?: string;
}

export function BettingRecommendations({ className }: BettingRecommendationsProps) {
  const { toast } = useToast();
  
  const { data: results = [] } = useQuery<RouletteResult[]>({
    queryKey: ['/api/results'],
    refetchInterval: 1000,
  });

  const { data: strategies = [] } = useQuery<Strategy[]>({
    queryKey: ['/api/strategies'],
    refetchInterval: 1000,
  });

  // Análises ML
  const mlPredictions = MLAnalyzer.analyzePredictions(results);
  const mlNeighbors = MLAnalyzer.analyzeMLNeighbors(results);
  
  // Estratégias tradicionais ativas
  const activeStrategies = strategies.filter(s => s.isActive && results.length >= 10);

  const copyNumbers = (numbers: number[], type: string) => {
    const numberText = numbers.join(', ');
    navigator.clipboard.writeText(numberText);
    toast({
      title: "Números copiados!",
      description: `${type}: ${numberText}`,
    });
  };

  if (results.length < 10) {
    return (
      <Card className={className}>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-casino-gold text-base">
            <Target className="h-4 w-4" />
            🎯 RECOMENDAÇÕES
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="text-center py-6 text-yellow-400 border border-yellow-600/30 rounded-lg bg-yellow-900/20">
            <AlertCircle className="h-10 w-10 mx-auto mb-3" />
            <p className="font-medium text-sm">Sistema Aguardando Dados</p>
            <p className="text-xs">Precisa de {10 - results.length} resultados para ativar</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`${className} border-casino-gold/50`}>
      <CardHeader className="bg-casino-gold/10 border-b border-casino-gold/30 pb-2">
        <CardTitle className="flex items-center gap-2 text-casino-gold text-base">
          <Target className="h-4 w-4" />
          🎯 RECOMENDAÇÕES
        </CardTitle>
        <p className="text-xs text-gray-300 mt-1">
          O que você deve jogar agora baseado nas análises
        </p>
      </CardHeader>
      
      <CardContent className="space-y-3 pt-3">
        
        {/* 1. Estratégias Tradicionais */}
        {activeStrategies.length > 0 && (
          <div className="space-y-2">
            <h3 className="font-medium flex items-center gap-2 text-blue-400 text-sm">
              <Zap className="h-4 w-4" />
              1. Estratégias Tradicionais
            </h3>
            <div className="space-y-2">
              {activeStrategies.map((strategy) => (
                <div key={strategy.id} className="p-3 bg-blue-900/15 border border-blue-600/20 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-sm">{strategy.name}</span>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-blue-400 border-blue-400 text-xs px-2 py-0">
                        {(strategy.currentAttempts || 0) + 1}/{strategy.maxAttempts || 5}
                      </Badge>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => copyNumbers(Array.isArray(strategy.numbers) ? strategy.numbers : [], strategy.name)}
                        className="h-6 w-6 p-0 text-blue-400 hover:bg-blue-900/30"
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-8 sm:grid-cols-10 md:grid-cols-12 gap-1">
                    {Array.isArray(strategy.numbers) && strategy.numbers.slice(0, 12).map((number) => (
                      <span
                        key={number}
                        className={`w-6 h-6 rounded-md flex items-center justify-center text-white font-bold text-xs ${
                          number === 0 
                            ? 'bg-green-600'
                            : [1,3,5,7,9,12,14,16,18,19,21,23,25,27,30,32,34,36].includes(number)
                            ? 'bg-red-600'
                            : 'bg-gray-700'
                        }`}
                      >
                        {number}
                      </span>
                    ))}
                    {Array.isArray(strategy.numbers) && strategy.numbers.length > 12 && (
                      <span className="text-xs text-gray-400 self-center px-1">
                        +{strategy.numbers.length - 12}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 2. Previsões ML */}
        {results.length >= 20 && (
          <div className="space-y-2">
            <h3 className="font-medium flex items-center gap-2 text-purple-400 text-sm">
              <Brain className="h-4 w-4" />
              2. Previsões ML
              <span className="text-xs text-yellow-400 ml-1">
                ({mlPredictions.length})
              </span>
            </h3>
            <div className="p-3 bg-purple-900/15 border border-purple-600/20 rounded-lg">
              {mlPredictions.length > 0 ? (
                <div className="space-y-3">
                  <div className="grid grid-cols-5 sm:grid-cols-7 md:grid-cols-10 gap-1">
                    {mlPredictions.slice(0, 10).map((pred) => (
                      <div key={pred.number} className="flex flex-col items-center">
                        <span
                          className={`w-6 h-6 rounded-md flex items-center justify-center text-white font-bold text-xs ${
                            pred.number === 0 
                              ? 'bg-green-600'
                              : [1,3,5,7,9,12,14,16,18,19,21,23,25,27,30,32,34,36].includes(pred.number)
                              ? 'bg-red-600'
                              : 'bg-gray-700'
                          }`}
                        >
                          {pred.number}
                        </span>
                        <span className="text-xs text-gray-400 mt-0.5">
                          {(pred.probability * 100).toFixed(0)}%
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center justify-center">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => copyNumbers(mlPredictions.slice(0, 10).map(p => p.number), "Top ML")}
                      className="text-xs bg-purple-900/30 border-purple-400 text-purple-300 hover:bg-purple-900/50"
                    >
                      <Copy className="h-3 w-3 mr-1" />
                      Copiar Top 10
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-4 text-yellow-400">
                  <Brain className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Gerando previsões ML...</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Resumo Final - Compacto */}
        <div className="p-3 bg-casino-gold/10 border border-casino-gold/30 rounded-lg">
          <h4 className="font-medium text-casino-gold mb-2 text-sm">💡 Como Usar:</h4>
          <div className="text-xs text-gray-300 space-y-1">
            <p>• <strong>Tradicionais</strong>: Padrões históricos</p>
            <p>• <strong>ML</strong>: Maior probabilidade via IA</p>
            <p>• Use <strong>Copiar</strong> para suas apostas</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}