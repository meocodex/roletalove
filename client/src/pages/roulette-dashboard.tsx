import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RouletteTable } from '@/components/roulette-table';
import { PatternAnalysis } from '@/components/pattern-analysis';
import { StrategyPanel } from '@/components/strategy-panel';
import { StatsPanel } from '@/components/stats-panel';
import { AlertsPanel } from '@/components/alerts-panel';
import { BettingPreferences } from '@/components/betting-preferences';
import MLAnalysisPanel from '@/components/ml-analysis-panel';
import CombinedStrategiesPanel from '@/components/combined-strategies-panel';
import CustomizableDashboard from '@/components/customizable-dashboard';
import AdvancedCharts from '@/components/advanced-charts';
import { useWebSocket } from '@/hooks/use-websocket';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { getNumberColor, getColorClass } from '@/lib/roulette-utils';
import { ClientPatternAnalyzer } from '@/lib/pattern-analyzer';
import { type RouletteResult } from '@shared/schema';
import { Play, Plus, Wifi, WifiOff, Layout, Grid } from 'lucide-react';

export default function RouletteDashboard() {
  const [sessionActive, setSessionActive] = useState(false);
  const [manualInput, setManualInput] = useState('');
  const [lastResult, setLastResult] = useState<number | null>(null);
  const [clientPatterns, setClientPatterns] = useState<any[]>([]);
  const [dashboardMode, setDashboardMode] = useState<'standard' | 'custom'>('standard');
  
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { isConnected, lastMessage } = useWebSocket();

  // Queries
  const { data: results = [] } = useQuery<RouletteResult[]>({
    queryKey: ['/api/results'],
    refetchInterval: 5000
  });

  // Mutations
  const addResultMutation = useMutation({
    mutationFn: async (number: number) => {
      const response = await apiRequest('POST', '/api/results', { 
        number,
        source: 'manual',
        sessionId: 'current'
      });
      return response.json();
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

  // Client-side pattern analysis
  useEffect(() => {
    if (results.length > 0) {
      const patterns = ClientPatternAnalyzer.analyzeAll(results);
      setClientPatterns(patterns);
    }
  }, [results]);

  const handleNumberClick = (number: number) => {
    if (sessionActive) {
      addResultMutation.mutate(number);
    }
  };

  const handleManualAdd = () => {
    const number = parseInt(manualInput);
    if (number >= 0 && number <= 36 && sessionActive) {
      addResultMutation.mutate(number);
      setManualInput('');
    }
  };

  const toggleSession = () => {
    setSessionActive(!sessionActive);
    toast({
      title: sessionActive ? "Sessão Pausada" : "Sessão Iniciada",
      description: sessionActive ? "Entrada de dados pausada" : "Sistema pronto para receber resultados",
    });
  };

  return (
    <div className="min-h-screen bg-dashboard-dark text-white font-casino">
      {/* Header */}
      <header className="bg-gray-900 border-b border-gray-700 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 bg-roulette-green rounded-full flex items-center justify-center">
              <i className="fas fa-chart-line text-white text-lg"></i>
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Sistema de Análise de Roleta IA</h1>
              <p className="text-sm text-gray-400">Análise de padrões em tempo real</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            {/* Dashboard Mode Toggle */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setDashboardMode(dashboardMode === 'standard' ? 'custom' : 'standard')}
              className="bg-gray-800 border-gray-600 hover:bg-gray-700"
            >
              {dashboardMode === 'standard' ? (
                <>
                  <Grid className="w-4 h-4 mr-2" />
                  Dashboard Customizável
                </>
              ) : (
                <>
                  <Layout className="w-4 h-4 mr-2" />
                  Dashboard Padrão
                </>
              )}
            </Button>
            
            <div className="text-right">
              <div className="text-sm text-gray-400">Status do Sistema</div>
              <div className="flex items-center space-x-2">
                {isConnected ? (
                  <>
                    <Wifi className="w-4 h-4 text-green-500" />
                    <span className="text-green-500 font-medium">Online</span>
                  </>
                ) : (
                  <>
                    <WifiOff className="w-4 h-4 text-red-500" />
                    <span className="text-red-500 font-medium">Offline</span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-6">
        {dashboardMode === 'custom' ? (
          /* Dashboard Customizável */
          <div className="space-y-6">
            {/* Mesa de Roleta sempre no topo no modo customizável */}
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

            {/* Dashboard Customizável */}
            <CustomizableDashboard />
          </div>
        ) : (
          /* Dashboard Padrão */
          <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
            
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
            <div className="xl:col-span-1 space-y-6">
              
              {/* ML Analysis Panel - New Advanced Feature */}
              <MLAnalysisPanel />

              {/* Combined Strategies Panel - Phase 2 Implementation */}
              <CombinedStrategiesPanel />

              {/* Advanced Charts - Phase 3 */}
              <AdvancedCharts />

              {/* Pattern Analysis */}
              <PatternAnalysis />

              {/* Strategy System */}
              <StrategyPanel />

              {/* Betting Preferences */}
              <BettingPreferences />

              {/* Real-time Stats */}
              <StatsPanel />

              {/* Manual Input */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center text-lg">
                    <i className="fas fa-keyboard text-blue-500 mr-2"></i>
                    Entrada Manual
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Número Sorteado
                      </label>
                      <div className="flex space-x-2">
                        <Input
                          type="number"
                          min="0"
                          max="36"
                          value={manualInput}
                          onChange={(e) => setManualInput(e.target.value)}
                          className="flex-1 bg-gray-700 border-gray-600 text-white focus:border-roulette-green"
                          placeholder="0-36"
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              handleManualAdd();
                            }
                          }}
                        />
                        <Button
                          onClick={handleManualAdd}
                          disabled={!sessionActive || addResultMutation.isPending}
                          className="bg-roulette-green hover:bg-green-600 text-white transition-colors"
                        >
                          <Plus size={16} />
                        </Button>
                      </div>
                    </div>
                    
                    <div className="text-xs text-gray-400">
                      <i className="fas fa-info-circle mr-1"></i>
                      {sessionActive ? 'Clique nos números da mesa ou digite manualmente' : 'Inicie uma sessão para adicionar resultados'}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Alerts Panel */}
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
