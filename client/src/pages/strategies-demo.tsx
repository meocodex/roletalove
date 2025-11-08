import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from '@/hooks/useAuth';
import { StrategyGuard } from '@/components/auth/StrategyGuard';
import StrategyOverview from '@/components/strategies/StrategyOverview';
import { 
  Brain, 
  Target, 
  TrendingUp, 
  BarChart3,
  Zap,
  Crown,
  ArrowLeft
} from "lucide-react";
import { Link } from 'wouter';
import type { StrategyType } from '@shared/strategy-permissions';

// Componentes de demonstração para cada estratégia
function BasicPatternsDemo() {
  return (
    <Card className="bg-gradient-to-br from-blue-900/20 to-blue-800/10 border-blue-600/30">
      <CardHeader>
        <CardTitle className="text-blue-400 flex items-center gap-2">
          <TrendingUp className="w-5 h-5" />
          Padrões Básicos - ATIVO
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-blue-300 mb-4">
          Detectando sequências simples de cores e identificando tendências básicas...
        </p>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <strong className="text-white">Última Sequência:</strong>
            <div className="flex gap-1 mt-1">
              <div className="w-6 h-6 bg-red-600 rounded text-center text-white text-xs leading-6">V</div>
              <div className="w-6 h-6 bg-black rounded text-center text-white text-xs leading-6">P</div>
              <div className="w-6 h-6 bg-red-600 rounded text-center text-white text-xs leading-6">V</div>
            </div>
          </div>
          <div>
            <strong className="text-white">Tendência:</strong>
            <p className="text-blue-300">Alternância V/P detectada</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function MLPredictionsDemo() {
  return (
    <Card className="bg-gradient-to-br from-purple-900/20 to-purple-800/10 border-purple-600/30">
      <CardHeader>
        <CardTitle className="text-purple-400 flex items-center gap-2">
          <Brain className="w-5 h-5" />
          ML Predictions - ATIVO
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-purple-300 mb-4">
          Modelo de machine learning analisando padrões complexos...
        </p>
        <div className="space-y-3">
          <div>
            <strong className="text-white">Próximos números mais prováveis:</strong>
            <div className="flex gap-2 mt-1">
              <Badge className="bg-purple-600">17 (23.4%)</Badge>
              <Badge className="bg-purple-600">32 (19.8%)</Badge>
              <Badge className="bg-purple-600">5 (17.2%)</Badge>
            </div>
          </div>
          <div className="text-xs text-purple-400">
            Confiança do modelo: 76.3% | Última atualização: agora
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function AIExternalDemo() {
  return (
    <Card className="bg-gradient-to-br from-green-900/20 to-green-800/10 border-green-600/30">
      <CardHeader>
        <CardTitle className="text-green-400 flex items-center gap-2">
          <Brain className="w-5 h-5" />
          IA Externa GPT-4 - PREMIUM
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-green-300 mb-4">
          Análise avançada com inteligência artificial externa...
        </p>
        <div className="bg-gray-900/50 rounded p-3 text-sm">
          <strong className="text-white">Análise GPT-4:</strong>
          <p className="text-green-300 mt-1">
            "Baseado nos últimos 50 resultados, identifiquei um padrão estatisticamente significativo 
            na distribuição de números pares nas últimas 15 jogadas. Recomendo focar em apostas 
            conservadoras nos números 2, 14, 26, 32."
          </p>
        </div>
        <div className="text-xs text-green-400 mt-2">
          Análise gerada em 3.2s | Custo: 0.12 tokens
        </div>
      </CardContent>
    </Card>
  );
}

export default function StrategiesDemoPage() {
  const { user } = useAuth();
  const [selectedDemo, setSelectedDemo] = useState<StrategyType>('basic_patterns');

  // Lista de estratégias para demonstrar
  const demoStrategies: { id: StrategyType; name: string; component: () => JSX.Element }[] = [
    { id: 'basic_patterns', name: 'Padrões Básicos', component: BasicPatternsDemo },
    { id: 'ml_predictions', name: 'ML Predictions', component: MLPredictionsDemo },
    { id: 'ai_external_gpt', name: 'IA Externa GPT-4', component: AIExternalDemo },
  ];

  const currentDemo = demoStrategies.find(d => d.id === selectedDemo);

  return (
    <div className="min-h-screen bg-dashboard-dark text-white p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <Link href="/app">
              <Button variant="ghost" className="hover:bg-gray-800 mb-4">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar ao Sistema
              </Button>
            </Link>
            <h1 className="text-3xl font-bold text-white">
              Sistema de Estratégias - Demonstração
            </h1>
            <p className="text-gray-300 mt-2">
              Demonstração do novo sistema baseado em funcionalidades ao invés de limites numéricos
            </p>
          </div>

          <div className="text-right">
            <Badge className="bg-roulette-green text-white">
              Plano Atual: {user?.planType || 'Básico'}
            </Badge>
            <p className="text-sm text-gray-400 mt-1">
              {user?.name || 'Usuário Teste'}
            </p>
          </div>
        </div>

        {/* Demonstração Interativa */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Seletor de Estratégia */}
          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Target className="w-5 h-5" />
                Testar Estratégias
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm text-gray-300 mb-2 block">
                  Selecione uma estratégia para testar:
                </label>
                <Select value={selectedDemo} onValueChange={(value) => setSelectedDemo(value as StrategyType)}>
                  <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-700">
                    {demoStrategies.map(strategy => (
                      <SelectItem 
                        key={strategy.id} 
                        value={strategy.id}
                        className="text-white hover:bg-gray-700"
                      >
                        {strategy.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium text-white">Controles:</h4>
                <div className="space-y-1">
                  <Button 
                    size="sm" 
                    className="w-full bg-roulette-green hover:bg-green-600"
                  >
                    <Zap className="w-4 h-4 mr-2" />
                    Ativar Estratégia
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="w-full border-gray-600 hover:bg-gray-700"
                  >
                    <BarChart3 className="w-4 h-4 mr-2" />
                    Ver Estatísticas
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="w-full border-gray-600 hover:bg-gray-700"
                  >
                    <Crown className="w-4 h-4 mr-2" />
                    Configurar
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Demonstração da Estratégia */}
          <div className="lg:col-span-2">
            <StrategyGuard 
              strategyId={selectedDemo}
              showUpgrade={true}
            >
              {currentDemo && <currentDemo.component />}
            </StrategyGuard>
          </div>
        </div>

        {/* Overview Completo */}
        <StrategyOverview />

        {/* Informações do Sistema */}
        <Card className="bg-gradient-to-r from-gray-800 to-gray-900 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Novo Sistema de Limitações</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="bg-blue-900/20 p-4 rounded border border-blue-600/30">
                <h4 className="font-medium text-blue-400 mb-2">✅ CORRIGIDO</h4>
                <p className="text-blue-300">
                  <strong>Antes:</strong> Limitações por sessão/resultados (10/100, 50/500)
                </p>
                <p className="text-blue-200 mt-1">
                  <strong>Agora:</strong> Limitações por tipo de estratégia e funcionalidades
                </p>
              </div>
              
              <div className="bg-green-900/20 p-4 rounded border border-green-600/30">
                <h4 className="font-medium text-green-400 mb-2">✅ IMPLEMENTADO</h4>
                <p className="text-green-300">
                  Sistema baseado em acesso a estratégias específicas
                </p>
                <p className="text-green-200 mt-1">
                  Básico: 3 estratégias | Intermediário: 9 | Completo: Todas
                </p>
              </div>
              
              <div className="bg-purple-900/20 p-4 rounded border border-purple-600/30">
                <h4 className="font-medium text-purple-400 mb-2">✅ FUNCIONAL</h4>
                <p className="text-purple-300">
                  StrategyGuard protege funcionalidades premium
                </p>
                <p className="text-purple-200 mt-1">
                  Interface clara para upgrades
                </p>
              </div>
            </div>

            <div className="bg-roulette-green/10 p-4 rounded border border-roulette-green/30">
              <h4 className="font-medium text-roulette-green mb-2">🚀 RESULTADO</h4>
              <p className="text-gray-300">
                Sistema agora limita corretamente por <strong className="text-white">acesso às estratégias</strong> ao invés de limites numéricos irrelevantes. 
                Cada plano oferece funcionalidades específicas que realmente agregam valor ao usuário.
              </p>
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}