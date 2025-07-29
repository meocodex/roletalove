/**
 * Painel de Recomendações de Apostas
 * Mostra claramente o que o usuário deve jogar baseado nas análises
 */

import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Target, Zap, TrendingUp, Brain, AlertCircle, Copy } from "lucide-react";
import { MLAnalyzer } from "@/lib/ml-analyzer";
import { CombinedStrategiesEngine } from "@/lib/combined-strategies";
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

  // Análises das duas lógicas
  const mlPredictions = MLAnalyzer.analyzePredictions(results);
  const combinedStrategy = CombinedStrategiesEngine.generateOptimalStrategy(results);
  
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
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-casino-gold" />
            RECOMENDAÇÕES DE APOSTAS
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-yellow-400 border border-yellow-600/30 rounded-lg bg-yellow-900/20">
            <AlertCircle className="h-12 w-12 mx-auto mb-4" />
            <p className="font-semibold">Sistema Aguardando Dados</p>
            <p className="text-sm">Precisa de {10 - results.length} resultados para ativar</p>
            <p className="text-xs mt-2 text-gray-400">
              As recomendações aparecerão aqui após inserir os números
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`${className} border-casino-gold/50`}>
      <CardHeader className="bg-casino-gold/10 border-b border-casino-gold/30">
        <CardTitle className="flex items-center gap-2 text-casino-gold">
          <Target className="h-6 w-6" />
          🎯 RECOMENDAÇÕES DE APOSTAS
        </CardTitle>
        <p className="text-sm text-gray-300">
          O que você deve jogar agora baseado nas análises do sistema
        </p>
      </CardHeader>
      <CardContent className="space-y-6 pt-6">
        
        {/* 1. Estratégias Tradicionais Ativas */}
        {activeStrategies.length > 0 && (
          <div className="space-y-3">
            <h3 className="font-semibold flex items-center gap-2 text-blue-400">
              <Zap className="h-4 w-4" />
              1. Estratégias Tradicionais (Lógica Inicial)
            </h3>
            {activeStrategies.map((strategy) => (
              <div key={strategy.id} className="p-4 bg-blue-900/20 border border-blue-600/30 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">{strategy.name}</span>
                  <Badge variant="outline" className="text-blue-400 border-blue-400">
                    Tentativa {(strategy.currentAttempts || 0) + 1}/{strategy.maxAttempts || 5}
                  </Badge>
                </div>
                
                <div className="flex flex-wrap gap-2 mb-3">
                  {Array.isArray(strategy.numbers) && strategy.numbers.slice(0, 10).map((number) => (
                    <span
                      key={number}
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm ${
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
                  {Array.isArray(strategy.numbers) && strategy.numbers.length > 10 && (
                    <span className="text-sm text-gray-400 self-center">
                      +{strategy.numbers.length - 10} mais
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">
                    {Array.isArray(strategy.numbers) ? strategy.numbers.length : 0} números total
                  </span>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => copyNumbers(Array.isArray(strategy.numbers) ? strategy.numbers : [], strategy.name)}
                    className="text-xs"
                  >
                    <Copy className="h-3 w-3 mr-1" />
                    Copiar
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 2. Recomendações ML */}
        {results.length >= 20 && mlPredictions.length > 0 && (
          <div className="space-y-3">
            <h3 className="font-semibold flex items-center gap-2 text-purple-400">
              <Brain className="h-4 w-4" />
              2. Previsões de IA (Lógica ML Avançada)
            </h3>
            <div className="p-4 bg-purple-900/20 border border-purple-600/30 rounded-lg">
              <p className="text-sm text-gray-300 mb-3">
                Top 10 números mais prováveis baseados em Machine Learning:
              </p>
              
              <div className="flex flex-wrap gap-2 mb-3">
                {mlPredictions.slice(0, 10).map((pred, index) => (
                  <div key={pred.number} className="flex flex-col items-center">
                    <span
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm ${
                        pred.number === 0 
                          ? 'bg-green-600'
                          : [1,3,5,7,9,12,14,16,18,19,21,23,25,27,30,32,34,36].includes(pred.number)
                          ? 'bg-red-600'
                          : 'bg-gray-800'
                      }`}
                    >
                      {pred.number}
                    </span>
                    <span className="text-xs text-gray-400 mt-1">
                      {(pred.probability * 100).toFixed(0)}%
                    </span>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">
                  Baseado em análise ML de {results.length} resultados
                </span>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => copyNumbers(mlPredictions.slice(0, 10).map(p => p.number), "Top ML")}
                  className="text-xs"
                >
                  <Copy className="h-3 w-3 mr-1" />
                  Copiar Top 10
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* 3. Estratégias Combinadas */}
        {results.length >= 25 && combinedStrategy && (
          <div className="space-y-3">
            <h3 className="font-semibold flex items-center gap-2 text-green-400">
              <TrendingUp className="h-4 w-4" />
              3. Estratégia Combinada Otimizada
            </h3>
            <div className="p-4 bg-green-900/20 border border-green-600/30 rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <span className="font-medium">{combinedStrategy.name}</span>
                <div className="flex gap-2">
                  <Badge variant="outline" className="text-green-400 border-green-400">
                    {(combinedStrategy.expectedReturn * 100).toFixed(1)}% retorno
                  </Badge>
                  <Badge variant="outline" className="text-green-400 border-green-400">
                    {(combinedStrategy.confidence * 100).toFixed(0)}% confiança
                  </Badge>
                </div>
              </div>

              <p className="text-sm text-gray-300 mb-4">{combinedStrategy.description}</p>

              {combinedStrategy.allocations.map((allocation, index) => (
                <div key={index} className="mb-4 last:mb-0">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">
                      {allocation.type === 'straight_up' ? 'Números Plenos' :
                       allocation.type === 'neighbors' ? 'Vizinhos' :
                       allocation.type === 'dozens' ? 'Dúzias' : allocation.type} ({allocation.percentage}%)
                    </span>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => copyNumbers(allocation.numbers, `${allocation.type} (${allocation.percentage}%)`)}
                      className="text-xs"
                    >
                      <Copy className="h-3 w-3 mr-1" />
                      Copiar
                    </Button>
                  </div>
                  
                  <div className="flex flex-wrap gap-1 mb-2">
                    {allocation.numbers.slice(0, 15).map((number) => (
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
                    {allocation.numbers.length > 15 && (
                      <span className="text-xs text-gray-400 self-center">
                        +{allocation.numbers.length - 15}
                      </span>
                    )}
                  </div>
                  
                  <p className="text-xs text-gray-400 italic">{allocation.reasoning}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Resumo Final */}
        <div className="p-4 bg-casino-gold/10 border border-casino-gold/30 rounded-lg">
          <h4 className="font-semibold text-casino-gold mb-2">💡 Como Usar as Recomendações:</h4>
          <ul className="text-sm text-gray-300 space-y-1">
            <li>• <strong>Estratégias Tradicionais</strong>: Números baseados em padrões históricos</li>
            <li>• <strong>Previsões de IA</strong>: Números com maior probabilidade segundo ML</li>
            <li>• <strong>Estratégia Combinada</strong>: Mistura otimizada de diferentes tipos</li>
            <li>• Use o botão <strong>"Copiar"</strong> para facilitar suas apostas</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}