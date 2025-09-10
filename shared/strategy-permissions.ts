import { PLAN_CONFIG, type PlanType } from './schema';

// Re-export PLAN_CONFIG for convenience
export { PLAN_CONFIG };

export type StrategyType = 
  | 'basic_patterns'
  | 'color_analysis'
  | 'simple_recommendations'
  | 'dozen_patterns'
  | 'column_patterns'
  | 'hot_cold_numbers'
  | 'neighbor_strategies'
  | 'ml_predictions'
  | 'pattern_alerts'
  | 'ai_external_gpt'
  | 'ai_external_claude'
  | 'combined_strategies'
  | 'custom_algorithms'
  | 'advanced_predictions'
  | 'multi_table_analysis'
  | 'probability_engine';

export interface StrategyInfo {
  id: StrategyType;
  name: string;
  description: string;
  requiredPlan: PlanType;
  category: 'basic' | 'advanced' | 'ai' | 'premium';
  complexity: 1 | 2 | 3 | 4 | 5;
}

export const STRATEGY_DEFINITIONS: Record<StrategyType, StrategyInfo> = {
  // BÁSICO - 3 estratégias
  basic_patterns: {
    id: 'basic_patterns',
    name: 'Padrões Básicos',
    description: 'Análise de sequências simples de cores e números',
    requiredPlan: 'basico',
    category: 'basic',
    complexity: 1
  },
  color_analysis: {
    id: 'color_analysis',
    name: 'Análise de Cores',
    description: 'Detecção de tendências de vermelho/preto',
    requiredPlan: 'basico',
    category: 'basic',
    complexity: 1
  },
  simple_recommendations: {
    id: 'simple_recommendations',
    name: 'Recomendações Simples',
    description: 'Sugestões básicas de apostas baseadas em histórico',
    requiredPlan: 'basico',
    category: 'basic',
    complexity: 1
  },

  // INTERMEDIÁRIO - 6 estratégias adicionais (9 total)
  dozen_patterns: {
    id: 'dozen_patterns',
    name: 'Análise de Dúzias',
    description: 'Padrões nas dúzias (1-12, 13-24, 25-36)',
    requiredPlan: 'intermediario',
    category: 'advanced',
    complexity: 2
  },
  column_patterns: {
    id: 'column_patterns',
    name: 'Análise de Colunas',
    description: 'Tendências nas três colunas verticais',
    requiredPlan: 'intermediario',
    category: 'advanced',
    complexity: 2
  },
  hot_cold_numbers: {
    id: 'hot_cold_numbers',
    name: 'Números Quentes/Frios',
    description: 'Identificação de números com alta/baixa frequência',
    requiredPlan: 'intermediario',
    category: 'advanced',
    complexity: 2
  },
  neighbor_strategies: {
    id: 'neighbor_strategies',
    name: 'Estratégias de Vizinhos',
    description: 'Apostas em números vizinhos na roda da roleta',
    requiredPlan: 'intermediario',
    category: 'advanced',
    complexity: 3
  },
  ml_predictions: {
    id: 'ml_predictions',
    name: 'Predições ML',
    description: 'Algoritmos de machine learning para predições',
    requiredPlan: 'intermediario',
    category: 'advanced',
    complexity: 3
  },
  pattern_alerts: {
    id: 'pattern_alerts',
    name: 'Alertas de Padrões',
    description: 'Notificações quando padrões específicos são detectados',
    requiredPlan: 'intermediario',
    category: 'advanced',
    complexity: 2
  },

  // COMPLETO - 7 estratégias premium adicionais (16 total)
  ai_external_gpt: {
    id: 'ai_external_gpt',
    name: 'IA Externa GPT-4',
    description: 'Análises avançadas usando GPT-4 da OpenAI',
    requiredPlan: 'completo',
    category: 'ai',
    complexity: 4
  },
  ai_external_claude: {
    id: 'ai_external_claude',
    name: 'IA Externa Claude-4',
    description: 'Análises avançadas usando Claude-4 da Anthropic',
    requiredPlan: 'completo',
    category: 'ai',
    complexity: 4
  },
  combined_strategies: {
    id: 'combined_strategies',
    name: 'Estratégias Combinadas',
    description: 'Combinação inteligente de múltiplas estratégias',
    requiredPlan: 'completo',
    category: 'premium',
    complexity: 4
  },
  custom_algorithms: {
    id: 'custom_algorithms',
    name: 'Algoritmos Personalizados',
    description: 'Criação de algoritmos customizados pelo usuário',
    requiredPlan: 'completo',
    category: 'premium',
    complexity: 5
  },
  advanced_predictions: {
    id: 'advanced_predictions',
    name: 'Predições Avançadas',
    description: 'Modelos preditivos de alta complexidade',
    requiredPlan: 'completo',
    category: 'premium',
    complexity: 5
  },
  multi_table_analysis: {
    id: 'multi_table_analysis',
    name: 'Análise Multi-Mesa',
    description: 'Análise simultânea de múltiplas mesas de roleta',
    requiredPlan: 'completo',
    category: 'premium',
    complexity: 4
  },
  probability_engine: {
    id: 'probability_engine',
    name: 'Engine de Probabilidades',
    description: 'Cálculos avançados de probabilidade em tempo real',
    requiredPlan: 'completo',
    category: 'premium',
    complexity: 5
  }
};

// Função para verificar se usuário tem acesso à estratégia
export function hasStrategyAccess(userPlan: PlanType, strategyId: StrategyType): boolean {
  const strategy = STRATEGY_DEFINITIONS[strategyId];
  const planConfig = PLAN_CONFIG[userPlan];
  
  return (planConfig.strategies as readonly StrategyType[]).includes(strategyId);
}

// Função para obter estratégias disponíveis por plano
export function getAvailableStrategies(userPlan: PlanType): StrategyInfo[] {
  const planConfig = PLAN_CONFIG[userPlan];
  
  return (planConfig.strategies as readonly StrategyType[]).map(strategyId => STRATEGY_DEFINITIONS[strategyId]);
}

// Função para obter estratégias bloqueadas (para upgrade)
export function getLockedStrategies(userPlan: PlanType): StrategyInfo[] {
  const allStrategies = Object.values(STRATEGY_DEFINITIONS);
  const availableStrategies = getAvailableStrategies(userPlan);
  const availableIds = availableStrategies.map(s => s.id);
  
  return allStrategies.filter(strategy => !availableIds.includes(strategy.id));
}

// Função para verificar limite de estratégias simultâneas
export function canActivateStrategy(userPlan: PlanType, currentActiveCount: number): boolean {
  const planConfig = PLAN_CONFIG[userPlan];
  
  if (planConfig.maxStrategies === -1) return true; // Ilimitado
  
  return currentActiveCount < planConfig.maxStrategies;
}

// Função para obter próximo plano que desbloqueia uma estratégia
export function getRequiredPlanForStrategy(strategyId: StrategyType): PlanType {
  return STRATEGY_DEFINITIONS[strategyId].requiredPlan;
}

// Função para sugerir upgrade baseado em estratégias desejadas
export function suggestPlanUpgrade(currentPlan: PlanType, desiredStrategies: StrategyType[]): PlanType | null {
  for (const strategyId of desiredStrategies) {
    const requiredPlan = getRequiredPlanForStrategy(strategyId);
    
    // Verificar hierarquia de planos
    if (currentPlan === 'basico' && (requiredPlan === 'intermediario' || requiredPlan === 'completo')) {
      return requiredPlan === 'completo' ? 'completo' : 'intermediario';
    }
    
    if (currentPlan === 'intermediario' && requiredPlan === 'completo') {
      return 'completo';
    }
  }
  
  return null; // Não precisa de upgrade
}