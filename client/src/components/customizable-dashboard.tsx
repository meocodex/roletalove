/**
 * Dashboard Customizável
 * Permite reorganizar e redimensionar painéis
 */

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Settings, Layout, Eye, EyeOff, RotateCcw } from "lucide-react";

// Componentes dos painéis
import MLAnalysisPanel from './ml-analysis-panel';
import CombinedStrategiesPanel from './combined-strategies-panel';
import { PatternAnalysis } from './pattern-analysis';
import { StrategyPanel } from './strategy-panel';

import { AlertsPanel } from './alerts-panel';
import AdvancedCharts from './advanced-charts';

interface DashboardPanel {
  id: string;
  name: string;
  component: React.ComponentType<any>;
  category: 'analysis' | 'strategy' | 'stats' | 'visualization';
  defaultVisible: boolean;
  size: 'small' | 'medium' | 'large';
}

interface LayoutConfig {
  name: string;
  description: string;
  panels: string[];
  columns: number;
}

const AVAILABLE_PANELS: DashboardPanel[] = [
  {
    id: 'ml-analysis',
    name: 'Análise ML',
    component: MLAnalysisPanel,
    category: 'analysis',
    defaultVisible: true,
    size: 'medium'
  },
  {
    id: 'combined-strategies',
    name: 'Estratégias Combinadas',
    component: CombinedStrategiesPanel,
    category: 'strategy',
    defaultVisible: true,
    size: 'large'
  },
  {
    id: 'pattern-analysis',
    name: 'Análise de Padrões',
    component: PatternAnalysis,
    category: 'analysis',
    defaultVisible: true,
    size: 'medium'
  },
  {
    id: 'strategy-panel',
    name: 'Estratégias Tradicionais',
    component: StrategyPanel,
    category: 'strategy',
    defaultVisible: true,
    size: 'medium'
  },

  {
    id: 'alerts-panel',
    name: 'Alertas',
    component: AlertsPanel,
    category: 'stats',
    defaultVisible: true,
    size: 'small'
  },
  {
    id: 'advanced-charts',
    name: 'Gráficos Avançados',
    component: AdvancedCharts,
    category: 'visualization',
    defaultVisible: false,
    size: 'large'
  }
];

const PRESET_LAYOUTS: LayoutConfig[] = [
  {
    name: 'Iniciante',
    description: 'Layout simples com informações básicas',
    panels: ['pattern-analysis', 'alerts-panel'],
    columns: 2
  },
  {
    name: 'Avançado',
    description: 'Todas as funcionalidades de análise',
    panels: ['ml-analysis', 'combined-strategies', 'pattern-analysis', 'strategy-panel'],
    columns: 2
  },
  {
    name: 'Analista',
    description: 'Foco em visualizações e métricas',
    panels: ['advanced-charts', 'ml-analysis', 'alerts-panel'],
    columns: 2
  },
  {
    name: 'Estrategista',
    description: 'Estratégias e otimizações',
    panels: ['combined-strategies', 'strategy-panel', 'ml-analysis'],
    columns: 1
  }
];

interface CustomizableDashboardProps {
  className?: string;
  onLayoutChange?: (panels: string[]) => void;
}

export default function CustomizableDashboard({ className, onLayoutChange }: CustomizableDashboardProps) {
  const [visiblePanels, setVisiblePanels] = useState<string[]>(
    AVAILABLE_PANELS.filter(p => p.defaultVisible).map(p => p.id)
  );
  const [currentLayout, setCurrentLayout] = useState<string>('Avançado');
  const [isCustomizing, setIsCustomizing] = useState(false);

  const handleLayoutChange = (layoutName: string) => {
    const layout = PRESET_LAYOUTS.find(l => l.name === layoutName);
    if (layout) {
      setVisiblePanels(layout.panels);
      setCurrentLayout(layoutName);
      onLayoutChange?.(layout.panels);
    }
  };

  const togglePanel = (panelId: string) => {
    if (visiblePanels.includes(panelId)) {
      setVisiblePanels(prev => prev.filter(id => id !== panelId));
    } else {
      setVisiblePanels(prev => [...prev, panelId]);
    }
  };

  const resetToDefault = () => {
    const defaultPanels = AVAILABLE_PANELS.filter(p => p.defaultVisible).map(p => p.id);
    setVisiblePanels(defaultPanels);
    setCurrentLayout('Avançado');
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'analysis': return '🧠';
      case 'strategy': return '🎯';
      case 'stats': return '📊';
      case 'visualization': return '📈';
      default: return '📋';
    }
  };

  const getCategoryName = (category: string) => {
    switch (category) {
      case 'analysis': return 'Análise';
      case 'strategy': return 'Estratégias';
      case 'stats': return 'Estatísticas';
      case 'visualization': return 'Visualização';
      default: return 'Outros';
    }
  };

  const renderPanel = (panelId: string) => {
    const panel = AVAILABLE_PANELS.find(p => p.id === panelId);
    if (!panel) return null;

    const Component = panel.component;
    return <Component key={panelId} />;
  };

  return (
    <div className={className}>
      {/* Painel de Customização */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Layout className="h-5 w-5" />
              Configuração do Dashboard
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsCustomizing(!isCustomizing)}
            >
              <Settings className="h-4 w-4 mr-2" />
              {isCustomizing ? 'Concluir' : 'Personalizar'}
            </Button>
          </div>
        </CardHeader>
        
        {isCustomizing && (
          <CardContent>
            <Tabs defaultValue="layouts" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="layouts">Layouts Prontos</TabsTrigger>
                <TabsTrigger value="custom">Personalizado</TabsTrigger>
              </TabsList>

              {/* Layouts Predefinidos */}
              <TabsContent value="layouts" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {PRESET_LAYOUTS.map(layout => (
                    <Card 
                      key={layout.name}
                      className={`cursor-pointer transition-colors ${
                        currentLayout === layout.name ? 'ring-2 ring-primary' : ''
                      }`}
                      onClick={() => handleLayoutChange(layout.name)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold">{layout.name}</h4>
                          <Badge variant={currentLayout === layout.name ? 'default' : 'outline'}>
                            {layout.panels.length} painéis
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">
                          {layout.description}
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {layout.panels.map(panelId => {
                            const panel = AVAILABLE_PANELS.find(p => p.id === panelId);
                            return panel ? (
                              <Badge key={panelId} variant="secondary" className="text-xs">
                                {panel.name}
                              </Badge>
                            ) : null;
                          })}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              {/* Customização Manual */}
              <TabsContent value="custom" className="space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="font-semibold">Selecionar Painéis</h4>
                  <Button variant="outline" size="sm" onClick={resetToDefault}>
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Restaurar Padrão
                  </Button>
                </div>

                {/* Painéis por Categoria */}
                {Object.entries(
                  AVAILABLE_PANELS.reduce((acc, panel) => {
                    if (!acc[panel.category]) acc[panel.category] = [];
                    acc[panel.category].push(panel);
                    return acc;
                  }, {} as Record<string, DashboardPanel[]>)
                ).map(([category, panels]) => (
                  <div key={category} className="space-y-2">
                    <h5 className="text-sm font-medium flex items-center gap-2">
                      <span className="text-lg">{getCategoryIcon(category)}</span>
                      {getCategoryName(category)}
                    </h5>
                    <div className="grid grid-cols-1 gap-2">
                      {panels.map(panel => (
                        <div
                          key={panel.id}
                          className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => togglePanel(panel.id)}
                              className="p-1"
                            >
                              {visiblePanels.includes(panel.id) ? (
                                <Eye className="h-4 w-4 text-green-500" />
                              ) : (
                                <EyeOff className="h-4 w-4 text-gray-400" />
                              )}
                            </Button>
                            <div>
                              <div className="font-medium text-sm">{panel.name}</div>
                              <div className="text-xs text-muted-foreground">
                                Tamanho: {panel.size}
                              </div>
                            </div>
                          </div>
                          <Badge 
                            variant={visiblePanels.includes(panel.id) ? 'default' : 'secondary'}
                          >
                            {visiblePanels.includes(panel.id) ? 'Visível' : 'Oculto'}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}

                {/* Resumo */}
                <div className="p-3 bg-muted rounded-lg">
                  <div className="text-sm font-medium mb-2">Resumo da Configuração</div>
                  <div className="text-xs text-muted-foreground">
                    {visiblePanels.length} painéis selecionados de {AVAILABLE_PANELS.length} disponíveis
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        )}
      </Card>

      {/* Dashboard Renderizado */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {visiblePanels.map(renderPanel)}
      </div>

      {/* Informações sobre o Layout Atual */}
      {!isCustomizing && (
        <div className="mt-6 text-center text-sm text-muted-foreground">
          Layout atual: <span className="font-medium">{currentLayout}</span> • 
          <span className="ml-1">{visiblePanels.length} painéis ativos</span>
        </div>
      )}
    </div>
  );
}