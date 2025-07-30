import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Brain, Copy, Loader, Sparkles, Target } from "lucide-react";
import { ExternalAIInsight } from "@/lib/external-ai-analyzer";
import { useToast } from "@/hooks/use-toast";

interface ExternalAIPanelProps {
  insights: ExternalAIInsight[];
  isLoading: boolean;
  onRefresh: () => void;
}

export function ExternalAIPanel({ insights, isLoading, onRefresh }: ExternalAIPanelProps) {
  const { toast } = useToast();

  const copyNumbers = (numbers: number[], source: string) => {
    navigator.clipboard.writeText(numbers.join(', '));
    toast({
      title: "Números copiados!",
      description: `${source}: ${numbers.join(', ')}`,
    });
  };

  const getProviderIcon = (provider: 'openai' | 'anthropic') => {
    return provider === 'openai' ? '🤖' : '🧠';
  };

  const getProviderName = (provider: 'openai' | 'anthropic') => {
    return provider === 'openai' ? 'ChatGPT' : 'Claude';
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'bg-green-500';
    if (confidence >= 0.6) return 'bg-yellow-500'; 
    return 'bg-red-500';
  };

  if (isLoading) {
    return (
      <Card className="bg-gradient-to-br from-violet-950/50 to-purple-900/30 border-violet-600/30">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-medium text-violet-300 flex items-center gap-2">
            <Brain className="h-4 w-4" />
            🚀 IA Externa
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-4">
            <Loader className="h-5 w-5 animate-spin text-violet-400" />
            <span className="ml-2 text-gray-300 text-sm">Consultando ChatGPT e Claude...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (insights.length === 0) {
    return (
      <Card className="bg-gradient-to-br from-violet-950/50 to-purple-900/30 border-violet-600/30">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-medium text-violet-300 flex items-center gap-2">
            <Brain className="h-4 w-4" />
            🚀 IA Externa
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <p className="text-gray-400 mb-3 text-sm">
              Análise disponível após 15+ números
            </p>
            <Button 
              onClick={onRefresh}
              variant="outline" 
              size="sm"
              className="border-violet-600/50 hover:bg-violet-600/20"
            >
              <Sparkles className="h-4 w-4 mr-1" />
              Analisar com IA
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-to-br from-violet-950/50 to-purple-900/30 border-violet-600/30">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-medium text-violet-300 flex items-center gap-2">
            <Brain className="h-4 w-4" />
            🚀 IA Externa
          </CardTitle>
          <Button 
            onClick={onRefresh}
            variant="outline" 
            size="sm"
            className="border-violet-600/50 hover:bg-violet-600/20"
          >
            <Sparkles className="h-4 w-4 mr-1" />
            Atualizar
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {insights.map((insight, index) => (
          <div key={index} className="space-y-3">
            {/* Header da IA */}
            <div className="flex items-center gap-2">
              <span className="text-lg">{getProviderIcon(insight.provider)}</span>
              <span className="text-sm font-semibold text-violet-300">
                {getProviderName(insight.provider)}
              </span>
            </div>

            {/* Números Plenos - sempre 7 números (limite: 5 tentativas) */}
            <div>
              <p className="text-xs text-gray-400 mb-2">Números Plenos (Limite: 5 tentativas):</p>
              <div className="flex flex-wrap gap-1">
                {insight.recommendations.slice(0, 7).map((num) => (
                  <span
                    key={num}
                    className={`w-8 h-8 rounded-md flex items-center justify-center text-white font-bold text-sm ${
                      num === 0 
                        ? 'bg-green-600'
                        : [1,3,5,7,9,12,14,16,18,19,21,23,25,27,30,32,34,36].includes(num)
                        ? 'bg-red-600'
                        : 'bg-gray-700'
                    }`}
                  >
                    {num}
                  </span>
                ))}
              </div>
            </div>

            {/* Vizinhos - 6 números principais (limite: 2 tentativas) */}
            <div>
              <p className="text-xs text-gray-400 mb-2">Vizinhos (Limite: 2 tentativas):</p>
              <div className="space-y-2">
                {insight.recommendations.slice(0, 6).map((mainNumber, idx) => {
                  // Mapeamento da roda física da roleta europeia
                  const wheelOrder = [0,32,15,19,4,21,2,25,17,34,6,27,13,36,11,30,8,23,10,5,24,16,33,1,20,14,31,9,22,18,29,7,28,12,35,3,26];
                  const mainIndex = wheelOrder.indexOf(mainNumber);
                  
                  if (mainIndex === -1) return null;
                  
                  // Pegar 2 vizinhos de cada lado (5 números total)
                  const neighbors = [];
                  for (let i = -2; i <= 2; i++) {
                    const index = (mainIndex + i + wheelOrder.length) % wheelOrder.length;
                    neighbors.push(wheelOrder[index]);
                  }
                  
                  return (
                    <div key={mainNumber} className="text-xs">
                      <span className="text-muted-foreground">#{idx + 1}: </span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {neighbors.map((number, neighborIdx) => {
                          const isMain = neighborIdx === 2; // Número central
                          return (
                            <span
                              key={number}
                              className={`w-6 h-6 rounded-md flex items-center justify-center text-white font-bold text-xs ${
                                number === 0 
                                  ? 'bg-green-600'
                                  : [1,3,5,7,9,12,14,16,18,19,21,23,25,27,30,32,34,36].includes(number)
                                  ? 'bg-red-600'
                                  : 'bg-gray-700'
                              } ${isMain ? 'ring-1 ring-violet-400' : ''}`}
                            >
                              {number}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {index < insights.length - 1 && (
              <Separator className="bg-violet-600/20" />
            )}
          </div>
        ))}

        {/* Resumo consensual se houver múltiplas análises */}
        {insights.length > 1 && (
          <div className="mt-4 p-3 bg-gradient-to-r from-violet-800/30 to-purple-800/30 rounded-lg border border-violet-500/30">
            <p className="text-sm font-medium text-violet-300 mb-2">
              🤝 Consenso entre IAs:
            </p>
            <div className="text-xs text-gray-300">
              <p className="mb-1">
                <strong>Confiança média:</strong> {(insights.reduce((sum, i) => sum + i.confidence, 0) / insights.length * 100).toFixed(1)}%
              </p>
              <p>
                <strong>Análises ativas:</strong> {insights.map(i => getProviderName(i.provider)).join(' + ')}
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}