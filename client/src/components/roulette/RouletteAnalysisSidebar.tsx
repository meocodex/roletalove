import { BettingRecommendations } from '@/components/betting-recommendations';
import { BettingPreferencesModal } from '@/components/betting-preferences-modal';
import { SessionStatsModal } from '@/components/session-stats-modal';
import { SimplifiedStrategies } from '@/components/simplified-strategies';
import { ExternalAIPanel } from '@/components/external-ai-panel';
import MLAnalysisPanel from '@/components/ml-analysis-panel';
import { PatternAnalysis } from '@/components/pattern-analysis';
import { StrategyPanel } from '@/components/strategy-panel';
import AdvancedCharts from '@/components/advanced-charts';
import { AlertsPanel } from '@/components/alerts-panel';
import { SubscriptionCard } from '@/components/subscription/SubscriptionCard';
import { FeatureGuard } from '@/components/auth/FeatureGuard';
import { type RouletteResult } from '@shared/schema';
import { type ExternalAIInsight } from '@/lib/external-ai-analyzer';

interface RouletteAnalysisSidebarProps {
  results: RouletteResult[];
  clientPatterns: any[];
  aiInsights: ExternalAIInsight[];
  aiLoading: boolean;
  onRefreshAI: () => void;
}

export function RouletteAnalysisSidebar({
  results,
  clientPatterns,
  aiInsights,
  aiLoading,
  onRefreshAI
}: RouletteAnalysisSidebarProps) {
  return (
    <div className="space-y-3">
      {/* Recomendações de Apostas - DESTAQUE PRINCIPAL */}
      <BettingRecommendations />

      {/* Preferências e Estatísticas */}
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
            onRefresh={onRefreshAI}
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

      {/* Assinatura Card */}
      <SubscriptionCard />

      {/* Alertas Panel - Final da sidebar */}
      <AlertsPanel />
    </div>
  );
}
