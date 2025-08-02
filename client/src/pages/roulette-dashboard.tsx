import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RouletteTable } from '@/components/roulette-table';
import { PatternAnalysis } from '@/components/pattern-analysis';
import { SimplifiedStrategies } from '@/components/simplified-strategies';
import { StrategyPanel } from '@/components/strategy-panel';
import { AlertsPanel } from '@/components/alerts-panel';
import { BettingRecommendations } from '@/components/betting-recommendations';
import MLAnalysisPanel from '@/components/ml-analysis-panel';
import CombinedStrategiesPanel from '@/components/combined-strategies-panel';
import { ExternalAIPanel } from '@/components/external-ai-panel';
import { ExternalAIAnalyzer, type ExternalAIInsight } from '@/lib/external-ai-analyzer';
import CustomizableDashboard from '@/components/customizable-dashboard';
import AdvancedCharts from '@/components/advanced-charts';
import { useWebSocket } from '@/hooks/use-websocket';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { FeatureGuard } from '@/components/auth/FeatureGuard';
import { apiRequest } from '@/lib/queryClient';
import { getNumberColor, getColorClass } from '@/lib/roulette-utils';
import { UnifiedPatternAnalyzer } from '@/lib/pattern-analyzer';
import { type RouletteResult } from '@shared/schema';
import { Play, Wifi, WifiOff, Layout, Grid, Smartphone } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { BettingPreferencesModal } from '@/components/betting-preferences-modal';
import { SessionStatsModal } from '@/components/session-stats-modal';

export default function RouletteDashboard() {
  const [sessionActive, setSessionActive] = useState(false);

  const [lastResult, setLastResult] = useState<number | null>(null);
  const [clientPatterns, setClientPatterns] = useState<any[]>([]);
  const [dashboardMode, setDashboardMode] = useState<'standard' | 'custom'>('standard');
  const [aiInsights, setAiInsights] = useState<ExternalAIInsight[]>([]);
  const [aiLoading, setAiLoading] = useState(false);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { isConnected, lastMessage } = useWebSocket();
  const { user, hasFeature } = useAuth();
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
      
      // Show toast for result
      const color = getNumberColor(newResult.number);
      const colorText = color === 'red' ? 'Vermelho' : color === 'black' ? 'Preto' : 'Verde';
      
      toast({
        title: "Resultado Adicionado",
        description: `Número ${newResult.number} (${colorText})`,
      });
      
      // Clear last result highlight after 3 seconds
      setTimeout(() => setLastResult(null), 3000);
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: "Falha ao adicionar resultado",
        variant: "destructive"
      });
    }
  });

  // Handle WebSocket messages
  useEffect(() => {
    if (lastMessage) {
      if (lastMessage.type === 'new_result') {
        // Handle real-time result updates
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

  // Análise unificada de padrões
  useEffect(() => {
    if (results.length >= 4) {
      const colorPattern = UnifiedPatternAnalyzer.analyzeColorSequence(results);
      const dozenPattern = UnifiedPatternAnalyzer.analyzeDozens(results);
      
      const patterns = [colorPattern, dozenPattern].filter(Boolean);
      setClientPatterns(patterns);
    }
  }, [results]);

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

  // Função para buscar análises de IA externa 
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

  return (
    <div className="min-h-screen bg-dashboard-dark text-white font-casino">
      {/* Header Responsivo */}
      <header className="bg-gray-900 border-b border-gray-700 px-3 sm:px-4 py-2 sm:py-3 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2 sm:space-x-3">
            <div className="w-6 h-6 sm:w-8 sm:h-8 bg-roulette-green rounded-full flex items-center justify-center">
              <Play className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
            </div>
            <div>
              <h1 className="text-sm sm:text-lg font-bold text-white">
                {isMobile ? 'Roleta IA' : 'Sistema Roleta IA'}
              </h1>
              {!isMobile && <p className="text-xs text-gray-400">Análise em tempo real</p>}
            </div>
          </div>
          
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* User Info - Adaptado para mobile */}
            {user && (
              <div className="text-right hidden sm:block">
                <div className="text-xs text-gray-400">{user.name || 'Usuário'}</div>
                <div className="text-xs text-roulette-green font-medium">
                  {user.planType === 'basico' ? 'Básico' : 
                   user.planType === 'intermediario' ? 'Intermediário' : 
                   'Completo'}
                </div>
              </div>
            )}

            {/* Dashboard Mode Toggle - Só desktop */}
            {!isMobile && (
              <FeatureGuard feature="dashboard_customizavel" showUpgrade={false}>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setDashboardMode(dashboardMode === 'standard' ? 'custom' : 'standard')}
                  className="text-xs hover:bg-gray-800"
                >
                  {dashboardMode === 'standard' ? (
                    <>
                      <Grid className="w-3 h-3 mr-1" />
                      Custom
                    </>
                  ) : (
                    <>
                      <Layout className="w-3 h-3 mr-1" />
                      Padrão
                    </>
                  )}
                </Button>
              </FeatureGuard>
            )}
            
            {/* Status Connection */}
            <div className="flex items-center space-x-1">
              {isConnected ? (
                <Wifi className="w-3 h-3 sm:w-4 sm:h-4 text-green-500" />
              ) : (
                <WifiOff className="w-3 h-3 sm:w-4 sm:h-4 text-red-500" />
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-3 sm:p-4">
        {/* Mobile Layout - Sempre usar layout mobile adaptado em telas pequenas */}
        {isMobile ? (
          <div className="space-y-3">
            {/* Mesa de Roleta - Principal no mobile */}
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium">Mesa Europeia</CardTitle>
                  <div className="flex items-center space-x-2">
                    <Button 
                      onClick={toggleSession}
                      size="sm"
                      className={`${sessionActive ? 'bg-red-600 hover:bg-red-700' : 'bg-roulette-green hover:bg-green-600'} font-medium transition-colors text-xs px-2 py-1 h-7`}
                    >
                      <Play className="mr-1" size={10} />
                      {sessionActive ? 'Pausar' : 'Iniciar'}
                    </Button>
                    {lastResult !== null && (
                      <div className="text-xs text-gray-400">
                        <span className={`font-bold text-sm ${
                          getNumberColor(lastResult) === 'red' ? 'text-roulette-red' :
                          getNumberColor(lastResult) === 'black' ? 'text-white' :
                          'text-roulette-green'
                        }`}>{lastResult}</span>
                      </div>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pb-2">
                <RouletteTable 
                  onNumberClick={handleNumberClick}
                  lastResult={lastResult}
                />

                {/* Recent Results - Mobile ultra compacto */}
                <div className="mt-2">
                  <h3 className="text-xs font-medium mb-1">Últimos</h3>
                  <div className="flex flex-wrap gap-1">
                    {results.slice(0, 10).map((result, index) => {
                      const color = getNumberColor(result.number);
                      const isHighlighted = index === 0;
                      
                      return (
                        <div
                          key={result.id}
                          className={`w-6 h-6 ${getColorClass(color).split(' ')[0]} rounded-sm flex items-center justify-center text-white font-bold text-xs border ${
                            isHighlighted ? 'border-casino-gold' : 'border-transparent'
                          } transition-all duration-300`}
                        >
                          {result.number}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recomendações de Apostas - DESTAQUE PRINCIPAL */}
            <BettingRecommendations />

            {/* Preferências e Estatísticas - Botões Mobile */}
            <div className="grid grid-cols-2 gap-3">
              <BettingPreferencesModal />
              <SessionStatsModal />
            </div>

            {/* IA Externa - Terceira posição */}
            <FeatureGuard feature="ia_externa_chatgpt">
              <ExternalAIPanel 
                insights={aiInsights}
                isLoading={aiLoading}
                onRefresh={fetchAIAnalysis}
              />
            </FeatureGuard>

            {/* ML Analysis - Quarta posição */}
            <FeatureGuard feature="ml_analyzer">
              <MLAnalysisPanel />
            </FeatureGuard>

            {/* Pattern Analysis - Compacto */}
            <FeatureGuard feature="analise_padroes">
              <PatternAnalysis patterns={clientPatterns} />
            </FeatureGuard>
          </div>
        ) : dashboardMode === 'custom' ? (
          /* Dashboard Customizável */
          <div className="space-y-3">
            {/* Mesa de Roleta sempre no topo no modo customizável */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-medium">Mesa de Roleta Europeia</CardTitle>
                  <div className="flex items-center space-x-3">
                    <Button 
                      onClick={toggleSession}
                      size="sm"
                      className={`${sessionActive ? 'bg-red-600 hover:bg-red-700' : 'bg-roulette-green hover:bg-green-600'} font-medium transition-colors text-xs`}
                    >
                      <Play className="mr-1" size={14} />
                      {sessionActive ? 'Pausar' : 'Iniciar'}
                    </Button>
                    {lastResult !== null && (
                      <div className="text-xs text-gray-400">
                        Último: <span className={`font-bold text-sm ${
                          getNumberColor(lastResult) === 'red' ? 'text-roulette-red' :
                          getNumberColor(lastResult) === 'black' ? 'text-white' :
                          'text-roulette-green'
                        }`}>{lastResult}</span>
                      </div>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <RouletteTable 
                  onNumberClick={handleNumberClick}
                  lastResult={lastResult}
                />

                {/* Recent Results - Compacto */}
                <div className="mt-4">
                  <h3 className="text-sm font-medium mb-2">Últimos Resultados</h3>
                  <div className="flex flex-wrap gap-1">
                    {results.slice(0, 12).map((result, index) => {
                      const color = getNumberColor(result.number);
                      const isHighlighted = index === 0;
                      
                      return (
                        <div
                          key={result.id}
                          className={`w-8 h-8 ${getColorClass(color).split(' ')[0]} rounded-md flex items-center justify-center text-white font-bold text-xs border ${
                            isHighlighted ? 'border-casino-gold' : 'border-transparent'
                          } transition-all duration-300`}
                          title={`${result.number} - ${new Date(result.timestamp).toLocaleTimeString()}`}
                        >
                          {result.number}
                        </div>
                      );
                    })}
                    {results.length === 0 && (
                      <div className="text-gray-400 text-xs">Nenhum resultado ainda...</div>
                    )}
                  </div>
                </div>

                {/* Client-side pattern preview - Compacto */}
                {clientPatterns.length > 0 && (
                  <div className="mt-3 p-2 bg-blue-900/20 border border-blue-600/30 rounded-md">
                    <h4 className="text-xs font-medium text-blue-400 mb-1">Análise Instantânea:</h4>
                    <div className="text-xs text-blue-300">
                      {clientPatterns[0].description} - {Math.round(clientPatterns[0].probability * 100)}%
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Preferências e Estatísticas - Custom Mode */}
            <div className="grid grid-cols-2 gap-3">
              <BettingPreferencesModal />
              <SessionStatsModal />
            </div>

            {/* Dashboard Customizável */}
            <CustomizableDashboard />
          </div>
        ) : (
          /* Dashboard Padrão */
          <div className="grid grid-cols-1 xl:grid-cols-4 gap-3">
            
            {/* Main Roulette Table */}
            <div className="xl:col-span-3">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xl">Mesa de Roleta Europeia</CardTitle>
                    <div className="flex items-center space-x-4">
                      <Button 
                        onClick={toggleSession}
                        className={`${sessionActive ? 'bg-red-600 hover:bg-red-700' : 'bg-roulette-green hover:bg-green-600'} font-medium transition-colors`}
                      >
                        <Play className="mr-2" size={16} />
                        {sessionActive ? 'Pausar Sessão' : 'Iniciar Sessão'}
                      </Button>
                      {lastResult !== null && (
                        <div className="text-sm text-gray-400">
                          Último resultado: <span className={`font-bold text-lg ${
                            getNumberColor(lastResult) === 'red' ? 'text-roulette-red' :
                            getNumberColor(lastResult) === 'black' ? 'text-white' :
                            'text-roulette-green'
                          }`}>{lastResult}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <RouletteTable 
                    onNumberClick={handleNumberClick}
                    lastResult={lastResult}
                  />

                  {/* Recent Results */}
                  <div className="mt-6">
                    <h3 className="text-lg font-semibold mb-3">Últimos Resultados</h3>
                    <div className="flex flex-wrap gap-2">
                      {results.slice(0, 15).map((result, index) => {
                        const color = getNumberColor(result.number);
                        const isHighlighted = index === 0;
                        
                        return (
                          <div
                            key={result.id}
                            className={`w-10 h-10 ${getColorClass(color).split(' ')[0]} rounded-full flex items-center justify-center text-white font-bold text-sm border-2 ${
                              isHighlighted ? 'border-casino-gold' : 'border-transparent'
                            } transition-all duration-300`}
                            title={`${result.number} - ${new Date(result.timestamp).toLocaleTimeString()}`}
                          >
                            {result.number}
                          </div>
                        );
                      })}
                      {results.length === 0 && (
                        <div className="text-gray-400 text-sm">Nenhum resultado ainda...</div>
                      )}
                    </div>
                  </div>

                  {/* Client-side pattern preview */}
                  {clientPatterns.length > 0 && (
                    <div className="mt-4 p-3 bg-blue-900/20 border border-blue-600/30 rounded-lg">
                      <h4 className="text-sm font-medium text-blue-400 mb-2">Análise em Tempo Real:</h4>
                      <div className="text-xs text-blue-300">
                        {clientPatterns[0].description} - {Math.round(clientPatterns[0].probability * 100)}%
                      </div>
                      <div className="text-xs text-blue-200 mt-1">
                        {clientPatterns[0].suggestion}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Right Sidebar - Analysis Dashboard */}
            <div className="xl:col-span-1 space-y-3">
              
              {/* Recomendações de Apostas - DESTAQUE PRINCIPAL */}
              <BettingRecommendations />

              {/* Preferências e Estatísticas - Desktop Buttons */}
              <div className="grid grid-cols-2 gap-3">
                <BettingPreferencesModal />
                <SessionStatsModal />
              </div>

              {/* Estratégias Simplificadas */}
              <SimplifiedStrategies results={results} />
              
              {/* Seção de Análises Avançadas */}
              <div className="space-y-3">
                {/* External AI Analysis Panel - Only Complete Plan */}
                <FeatureGuard feature="ia_externa_chatgpt">
                  <ExternalAIPanel 
                    insights={aiInsights}
                    isLoading={aiLoading}
                    onRefresh={fetchAIAnalysis}
                  />
                </FeatureGuard>
                
                {/* ML Analysis Panel - Intermediate+ Plan */}
                <FeatureGuard feature="ml_analyzer">
                  <MLAnalysisPanel />
                </FeatureGuard>

                {/* Pattern Analysis - Intermediate+ Plan */}
                <FeatureGuard feature="analise_padroes">
                  <PatternAnalysis patterns={clientPatterns} />
                </FeatureGuard>

                {/* Strategy System - Intermediate+ Plan */}
                <FeatureGuard feature="estrategias_tradicionais">
                  <StrategyPanel />
                </FeatureGuard>

                {/* Advanced Charts - Complete Plan */}
                <FeatureGuard feature="graficos_avancados">
                  <AdvancedCharts />
                </FeatureGuard>
              </div>

              {/* Alertas Panel - Final da sidebar */}
              <AlertsPanel />
            </div>
          </div>
        )}
      </div>

      {/* WebSocket Connection Indicator */}
      <div className="fixed bottom-4 right-4">
        <div className={`border rounded-lg p-3 flex items-center space-x-2 ${
          isConnected ? 'bg-gray-800 border-gray-600' : 'bg-red-900/50 border-red-600'
        }`}>
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
