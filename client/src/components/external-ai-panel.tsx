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
          <div key={index} className="p-3 bg-violet-800/20 rounded-lg border border-violet-600/20">
            {/* Header da IA */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-lg">{getProviderIcon(insight.provider)}</span>
                <span className="text-sm font-semibold text-violet-300">
                  {getProviderName(insight.provider)}
                </span>
                <Badge 
                  className={`${getConfidenceColor(insight.confidence)} text-white text-xs`}
                >
                  {(insight.confidence * 100).toFixed(0)}% confiança
                </Badge>
              </div>
            </div>

            {/* Recomendações de números */}
            <div className="mb-3">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-gray-300">
                  <Target className="h-4 w-4 inline mr-1" />
                  Top Recomendações:
                </p>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => copyNumbers(insight.recommendations, getProviderName(insight.provider))}
                  className="text-xs h-6 px-2"
                >
                  <Copy className="h-3 w-3 mr-1" />
                  Copiar
                </Button>
              </div>
              
              <div className="flex flex-wrap gap-1 mb-2">
                {insight.recommendations.map((number) => (
                  <span
                    key={number}
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold ${
                      number === 0 
                        ? 'bg-green-600'
                        : [1,3,5,7,9,12,14,16,18,19,21,23,25,27,30,32,34,36].includes(number)
                        ? 'bg-red-600'
                        : 'bg-gray-800'
                    } ring-2 ring-violet-400/50`}
                  >
                    {number}
                  </span>
                ))}
              </div>
            </div>

            {/* Padrões detectados */}
            {insight.patterns_detected.length > 0 && (
              <div className="mb-3">
                <p className="text-sm font-medium text-gray-300 mb-1">
                  🔍 Padrões Detectados:
                </p>
                <div className="flex flex-wrap gap-1">
                  {insight.patterns_detected.map((pattern, idx) => (
                    <Badge key={idx} variant="secondary" className="text-xs">
                      {pattern}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Próximos números prováveis */}
            {insight.next_probable_numbers.length > 0 && (
              <div className="mb-3">
                <p className="text-sm font-medium text-gray-300 mb-2">
                  📈 Próximos Mais Prováveis:
                </p>
                <div className="space-y-1">
                  {insight.next_probable_numbers.slice(0, 5).map((prediction, idx) => (
                    <div key={idx} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span
                          className={`w-5 h-5 rounded-full flex items-center justify-center text-white font-bold ${
                            prediction.number === 0 
                              ? 'bg-green-600'
                              : [1,3,5,7,9,12,14,16,18,19,21,23,25,27,30,32,34,36].includes(prediction.number)
                              ? 'bg-red-600'
                              : 'bg-gray-800'
                          }`}
                        >
                          {prediction.number}
                        </span>
                        <span className="text-gray-300 truncate max-w-[120px]">
                          {prediction.reasoning}
                        </span>
                      </div>
                      <span className="text-violet-300 font-mono">
                        {(prediction.probability * 100).toFixed(1)}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Análise detalhada */}
            <Separator className="my-2 bg-violet-600/20" />
            <details className="group">
              <summary className="text-sm font-medium text-gray-300 cursor-pointer hover:text-violet-300 transition-colors">
                💡 Análise Detalhada {getProviderIcon(insight.provider)}
              </summary>
              <div className="mt-2 p-2 bg-violet-900/20 rounded text-xs text-gray-300 leading-relaxed">
                <p className="mb-2"><strong>Análise:</strong> {insight.analysis}</p>
                <p><strong>Raciocínio:</strong> {insight.reasoning}</p>
              </div>
            </details>
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