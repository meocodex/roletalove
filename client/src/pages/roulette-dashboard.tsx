import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { RouletteHeader } from '@/components/roulette/RouletteHeader';
import { RouletteTableSection } from '@/components/roulette/RouletteTableSection';
import { RouletteAnalysisSidebar } from '@/components/roulette/RouletteAnalysisSidebar';
import { BettingRecommendations } from '@/components/betting-recommendations';
import { BettingPreferencesModal } from '@/components/betting-preferences-modal';
import { SessionStatsModal } from '@/components/session-stats-modal';
import CustomizableDashboard from '@/components/customizable-dashboard';
import { SubscriptionCard } from '@/components/subscription/SubscriptionCard';
import { FeatureGuard } from '@/components/auth/FeatureGuard';
import { useWebSocket } from '@/hooks/use-websocket';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useIsMobile } from '@/hooks/use-mobile';
import { apiRequest } from '@/lib/queryClient';
import { getNumberColor, getColorClass } from '@/lib/roulette-utils';
import { UnifiedPatternAnalyzer } from '@/lib/pattern-analyzer';
import { ExternalAIAnalyzer, type ExternalAIInsight } from '@/lib/external-ai-analyzer';
import { type RouletteResult } from '@shared/schema';

export default function RouletteDashboard() {
  // Estados
  const [sessionActive, setSessionActive] = useState(false);
  const [lastResult, setLastResult] = useState<number | null>(null);
  const [clientPatterns, setClientPatterns] = useState<any[]>([]);
  const [dashboardMode, setDashboardMode] = useState<'standard' | 'custom'>('standard');
  const [aiInsights, setAiInsights] = useState<ExternalAIInsight[]>([]);
  const [aiLoading, setAiLoading] = useState(false);

  // Hooks
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { isConnected, lastMessage } = useWebSocket();
  const { user } = useAuth();
  const isMobile = useIsMobile();

  // Queries
  const { data: results = [] } = useQuery<RouletteResult[]>({
    queryKey: ['/api/results'],
    refetchInterval: 5000
  });

  // Mutations
  const addResultMutation = useMutation({
    mutationFn: async (number: number) => {
      return apiRequest('/api/results', 'POST', {
        number,
        source: 'manual',
        sessionId: 'current'
      });
    },
    onSuccess: (newResult) => {
      queryClient.invalidateQueries({ queryKey: ['/api/results'] });
      queryClient.invalidateQueries({ queryKey: ['/api/patterns'] });
      queryClient.invalidateQueries({ queryKey: ['/api/session/stats'] });
      queryClient.invalidateQueries({ queryKey: ['/api/alerts'] });

      setLastResult(newResult.number);

      const color = getNumberColor(newResult.number);
      const colorText = color === 'red' ? 'Vermelho' : color === 'black' ? 'Preto' : 'Verde';

      toast({
        title: "Resultado Adicionado",
        description: `Número ${newResult.number} (${colorText})`,
      });

      setTimeout(() => setLastResult(null), 3000);
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Falha ao adicionar resultado",
        variant: "destructive"
      });
    }
  });

  // WebSocket handler
  useEffect(() => {
    if (lastMessage) {
      if (lastMessage.type === 'new_result') {
        queryClient.invalidateQueries({ queryKey: ['/api/results'] });
        queryClient.invalidateQueries({ queryKey: ['/api/patterns'] });

        if (lastMessage.data?.result) {
          setLastResult(lastMessage.data.result.number);
          setTimeout(() => setLastResult(null), 3000);
        }
      } else if (lastMessage.type === 'strategy_updated') {
        queryClient.invalidateQueries({ queryKey: ['/api/strategies'] });
      }
    }
  }, [lastMessage, queryClient]);

  // Pattern analysis
  useEffect(() => {
    if (results.length >= 4) {
      const colorPattern = UnifiedPatternAnalyzer.analyzeColorSequence(results);
      const dozenPattern = UnifiedPatternAnalyzer.analyzeDozens(results);
      setClientPatterns([colorPattern, dozenPattern].filter(Boolean));
    }
  }, [results]);

  // Handlers
  const handleNumberClick = (number: number) => {
    if (sessionActive) {
      addResultMutation.mutate(number);
    }
  };

  const toggleSession = () => {
    setSessionActive(!sessionActive);
    toast({
      title: sessionActive ? "Sessão Pausada" : "Sessão Iniciada",
      description: sessionActive ? "Entrada de dados pausada" : "Sistema pronto para receber resultados",
    });
  };

  const fetchAIAnalysis = async () => {
    if (results.length < 15) {
      toast({
        title: "Dados insuficientes",
        description: "Análise com IA externa requer 15+ números",
        variant: "destructive"
      });
      return;
    }

    setAiLoading(true);
    try {
      const insights = await ExternalAIAnalyzer.analyzeWithExternalAI(results);
      setAiInsights(insights);

      if (insights.length > 0) {
        toast({
          title: "Análise IA concluída!",
          description: `${insights.length} análise(s) de IA externa recebida(s)`,
        });
      } else {
        toast({
          title: "Erro na análise",
          description: "Não foi possível obter análises de IA externa",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('AI Analysis Error:', error);
      toast({
        title: "Erro na análise IA",
        description: "Falha ao consultar IA externa",
        variant: "destructive"
      });
    } finally {
      setAiLoading(false);
    }
  };

  const toggleDashboardMode = () => {
    setDashboardMode(dashboardMode === 'standard' ? 'custom' : 'standard');
  };

  return (
    <div className="min-h-screen bg-dashboard-dark text-white font-casino">
      {/* Header */}
      <RouletteHeader
        sessionActive={sessionActive}
        onToggleSession={toggleSession}
        lastResult={lastResult}
        isConnected={isConnected}
        isMobile={isMobile}
        userName={user?.name}
        userPlan={user?.plan_type}
        dashboardMode={dashboardMode}
        onToggleDashboardMode={toggleDashboardMode}
        getNumberColor={getNumberColor}
      />

      <div className="max-w-7xl mx-auto p-3 sm:p-4">
        {/* Mobile Layout */}
        {isMobile ? (
          <div className="space-y-3">
            <RouletteTableSection
              sessionActive={sessionActive}
              onToggleSession={toggleSession}
              lastResult={lastResult}
              onNumberClick={handleNumberClick}
              results={results}
              clientPatterns={clientPatterns}
              compact={true}
              getNumberColor={getNumberColor}
              getColorClass={getColorClass}
            />

            <BettingRecommendations />
            <SubscriptionCard />

            <div className="grid grid-cols-2 gap-3">
              <BettingPreferencesModal />
              <SessionStatsModal />
            </div>

            <RouletteAnalysisSidebar
              results={results}
              clientPatterns={clientPatterns}
              aiInsights={aiInsights}
              aiLoading={aiLoading}
              onRefreshAI={fetchAIAnalysis}
            />
          </div>
        ) : dashboardMode === 'custom' ? (
          /* Dashboard Customizável */
          <div className="space-y-3">
            <RouletteTableSection
              sessionActive={sessionActive}
              onToggleSession={toggleSession}
              lastResult={lastResult}
              onNumberClick={handleNumberClick}
              results={results}
              clientPatterns={clientPatterns}
              getNumberColor={getNumberColor}
              getColorClass={getColorClass}
            />

            <div className="grid grid-cols-2 gap-3">
              <BettingPreferencesModal />
              <SessionStatsModal />
            </div>

            <CustomizableDashboard />
          </div>
        ) : (
          /* Dashboard Padrão */
          <div className="grid grid-cols-1 xl:grid-cols-4 gap-3">
            <div className="xl:col-span-3">
              <RouletteTableSection
                sessionActive={sessionActive}
                onToggleSession={toggleSession}
                lastResult={lastResult}
                onNumberClick={handleNumberClick}
                results={results}
                clientPatterns={clientPatterns}
                getNumberColor={getNumberColor}
                getColorClass={getColorClass}
              />
            </div>

            <div className="xl:col-span-1">
              <RouletteAnalysisSidebar
                results={results}
                clientPatterns={clientPatterns}
                aiInsights={aiInsights}
                aiLoading={aiLoading}
                onRefreshAI={fetchAIAnalysis}
              />
            </div>
          </div>
        )}
      </div>

      {/* WebSocket Connection Indicator */}
      <div className="fixed bottom-4 right-4">
        <div
          className={`border rounded-lg p-3 flex items-center space-x-2 ${
            isConnected ? 'bg-gray-800 border-gray-600' : 'bg-red-900/50 border-red-600'
          }`}
        >
          {isConnected ? (
            <>
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-gray-300">Conectado ao sistema</span>
            </>
          ) : (
            <>
              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              <span className="text-sm text-red-300">Desconectado</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
