import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RouletteTable } from '@/components/roulette-table';
import { PatternAnalysis } from '@/components/pattern-analysis';
import { useWebSocket } from '@/hooks/use-websocket';
import { type Strategy } from './StrategySelectionCards';
import { 
  X, 
  Minimize2, 
  Maximize2, 
  Play, 
  Pause, 
  RotateCcw,
  Target,
  TrendingUp,
  BarChart3,
  Activity,
  Settings
} from 'lucide-react';

interface AnalysisSystemModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedStrategy?: Strategy;
  autoStart?: boolean;
}

export default function AnalysisSystemModal({ 
  isOpen, 
  onClose, 
  selectedStrategy,
  autoStart = false 
}: AnalysisSystemModalProps) {
  const [isMinimized, setIsMinimized] = useState(false);
  const [activeTab, setActiveTab] = useState('table');
  const [isAnalysisActive, setIsAnalysisActive] = useState(autoStart);
  
  // Mock data para desenvolvimento
  const [results, setResults] = useState<number[]>([]);
  const [patterns, setPatterns] = useState<any[]>([]);
  const [strategies, setStrategies] = useState<any[]>([]);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [gameStats, setGameStats] = useState<any>({ accuracy: 0 });

  const addResult = (number: number) => {
    setResults(prev => [...prev, number]);
  };

  const clearResults = () => {
    setResults([]);
  };

  const refreshAnalysis = () => {
    // Mock analysis refresh
  };

  // Auto-start analysis when modal opens with strategy
  useEffect(() => {
    if (isOpen && selectedStrategy && autoStart) {
      setIsAnalysisActive(true);
    }
  }, [isOpen, selectedStrategy, autoStart]);

  const handleNumberClick = (number: number) => {
    if (isAnalysisActive) {
      addResult(number);
      refreshAnalysis();
    }
  };

  const toggleAnalysis = () => {
    setIsAnalysisActive(!isAnalysisActive);
  };

  const resetSession = () => {
    clearResults();
    setIsAnalysisActive(false);
  };

  const getStrategyNumbers = () => {
    if (!selectedStrategy || strategies.length === 0) return [];
    return strategies[0]?.numbers || [];
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        className={`
          bg-gray-900 border-gray-700 text-white
          ${isMinimized 
            ? 'max-w-md h-auto' 
            : 'max-w-[95vw] max-h-[95vh] w-full h-full'
          }
          p-0 overflow-hidden
        `}
      >
        {/* Header */}
        <DialogHeader className="flex flex-row items-center justify-between p-4 border-b border-gray-700">
          <div className="flex items-center gap-3">
            <DialogTitle className="text-xl font-bold">
              Sistema de Análise
            </DialogTitle>
            {selectedStrategy && (
              <Badge className="bg-roulette-green text-white">
                {selectedStrategy.name}
              </Badge>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMinimized(!isMinimized)}
              className="text-gray-400 hover:text-white"
            >
              {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-gray-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </DialogHeader>

        {/* Minimized View */}
        {isMinimized && (
          <div className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${isAnalysisActive ? 'bg-green-400' : 'bg-red-400'}`} />
                <span className="text-sm font-medium">
                  {isAnalysisActive ? 'Análise Ativa' : 'Pausado'}
                </span>
              </div>
              <div className="text-sm text-gray-400">
                {results.length} resultados
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button
                size="sm"
                variant={isAnalysisActive ? "destructive" : "default"}
                onClick={toggleAnalysis}
                className="flex-1"
              >
                {isAnalysisActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setIsMinimized(false)}
                className="flex-1"
              >
                Expandir
              </Button>
            </div>
          </div>
        )}

        {/* Full View */}
        {!isMinimized && (
          <div className="flex flex-col h-full">
            {/* Control Panel */}
            <div className="p-4 border-b border-gray-700 bg-gray-800/50">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                  <Button
                    variant={isAnalysisActive ? "destructive" : "default"}
                    onClick={toggleAnalysis}
                    className="flex items-center gap-2"
                  >
                    {isAnalysisActive ? (
                      <>
                        <Pause className="w-4 h-4" />
                        Pausar Análise
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4" />
                        Iniciar Análise
                      </>
                    )}
                  </Button>
                  
                  <Button
                    variant="outline"
                    onClick={resetSession}
                    className="flex items-center gap-2"
                  >
                    <RotateCcw className="w-4 h-4" />
                    Reset
                  </Button>
                </div>

                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Activity className="w-4 h-4 text-blue-400" />
                    <span>{results.length} resultados</span>
                  </div>
                  {gameStats.accuracy && (
                    <div className="flex items-center gap-2">
                      <Target className="w-4 h-4 text-green-400" />
                      <span>{gameStats.accuracy.toFixed(1)}% acerto</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Strategy Numbers */}
              {selectedStrategy && getStrategyNumbers().length > 0 && (
                <div className="space-y-2">
                  <div className="text-sm font-medium text-gray-300">
                    Números Recomendados pela Estratégia:
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {getStrategyNumbers().slice(0, 7).map((num: number) => (
                      <Badge 
                        key={num} 
                        className="bg-roulette-green text-white px-3 py-1"
                      >
                        {num}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Main Content */}
            <div className="flex-1 overflow-hidden">
              {/* Mobile Layout */}
              <div className="md:hidden h-full">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
                  <TabsList className="w-full bg-gray-800 border-b border-gray-700 rounded-none">
                    <TabsTrigger value="table" className="flex-1">Mesa</TabsTrigger>
                    <TabsTrigger value="analysis" className="flex-1">Análise</TabsTrigger>
                    <TabsTrigger value="patterns" className="flex-1">Padrões</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="table" className="flex-1 p-4">
                    <RouletteTable
                      onNumberClick={handleNumberClick}
                      lastResult={results[results.length - 1] || null}
                    />
                  </TabsContent>
                  
                  <TabsContent value="analysis" className="flex-1 p-4 overflow-y-auto">
                    <PatternAnalysis
                      patterns={patterns}
                    />
                  </TabsContent>
                  
                  <TabsContent value="patterns" className="flex-1 p-4 overflow-y-auto">
                    <div className="space-y-4">
                      {patterns.map((pattern: any, index: number) => (
                        <Card key={index} className="bg-gray-800 border-gray-700">
                          <CardHeader className="pb-2">
                            <CardTitle className="text-sm flex items-center gap-2">
                              <BarChart3 className="w-4 h-4" />
                              {pattern.type}
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <p className="text-xs text-gray-400">{pattern.description}</p>
                            <div className="mt-2 flex items-center gap-2">
                              <Badge variant="outline" className="text-xs">
                                {pattern.confidence}% confiança
                              </Badge>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </TabsContent>
                </Tabs>
              </div>

              {/* Desktop Layout */}
              <div className="hidden md:flex h-full">
                {/* Left Panel - Roulette Table */}
                <div className="flex-1 p-6 flex items-center justify-center bg-gray-900">
                  <RouletteTable
                    onNumberClick={handleNumberClick}
                    lastResult={results[results.length - 1] || null}
                  />
                </div>

                {/* Right Panel - Analysis */}
                <div className="w-96 border-l border-gray-700 bg-gray-800/50">
                  <Tabs defaultValue="analysis" className="h-full flex flex-col">
                    <TabsList className="w-full bg-gray-800 rounded-none border-b border-gray-700">
                      <TabsTrigger value="analysis" className="flex-1">
                        <TrendingUp className="w-4 h-4 mr-2" />
                        Análise
                      </TabsTrigger>
                      <TabsTrigger value="settings" className="flex-1">
                        <Settings className="w-4 h-4 mr-2" />
                        Config
                      </TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="analysis" className="flex-1 p-4 overflow-y-auto">
                      <PatternAnalysis
                        patterns={patterns}
                      />
                    </TabsContent>
                    
                    <TabsContent value="settings" className="flex-1 p-4">
                      <div className="space-y-4">
                        <Card className="bg-gray-700 border-gray-600">
                          <CardHeader>
                            <CardTitle className="text-sm">Configurações da Análise</CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-3">
                            <div className="text-xs text-gray-400">
                              Configurações de análise em desenvolvimento
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    </TabsContent>
                  </Tabs>
                </div>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}