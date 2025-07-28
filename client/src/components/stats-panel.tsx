import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3 } from 'lucide-react';

interface SessionStats {
  session: {
    id: string;
    name: string;
    totalSpins: number;
  };
  totalSpins: number;
  patternsDetected: number;
  lastZero: number | null;
  colorDistribution: Record<string, number>;
  successRate: number;
}

interface StatsPanelProps {
  className?: string;
}

export function StatsPanel({ className }: StatsPanelProps) {
  const { data: stats, isLoading } = useQuery<SessionStats>({
    queryKey: ['/api/session/stats'],
  });

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center text-lg">
            <BarChart3 className="text-green-500 mr-2" size={20} />
            Estatísticas da Sessão
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex justify-between animate-pulse">
                <div className="h-4 bg-gray-600 rounded w-1/2"></div>
                <div className="h-4 bg-gray-600 rounded w-1/4"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!stats) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center text-lg">
            <BarChart3 className="text-green-500 mr-2" size={20} />
            Estatísticas da Sessão
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-400 text-sm">Erro ao carregar estatísticas</p>
        </CardContent>
      </Card>
    );
  }

  const getHotSector = () => {
    const { colorDistribution } = stats;
    if (!colorDistribution) return 'N/A';
    
    const total = Object.values(colorDistribution).reduce((sum, count) => sum + count, 0);
    if (total === 0) return 'N/A';
    
    const redPercentage = (colorDistribution.red || 0) / total;
    const blackPercentage = (colorDistribution.black || 0) / total;
    
    if (redPercentage > 0.6) return 'Vermelho';
    if (blackPercentage > 0.6) return 'Preto';
    return 'Balanceado';
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center text-lg">
          <BarChart3 className="text-green-500 mr-2" size={20} />
          Estatísticas da Sessão
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-sm text-gray-300">Total de Giros:</span>
            <span className="text-sm font-medium">{stats.totalSpins}</span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-sm text-gray-300">Padrões Detectados:</span>
            <span className="text-sm font-medium text-green-400">{stats.patternsDetected}</span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-sm text-gray-300">Taxa de Acerto:</span>
            <span className="text-sm font-medium text-green-400">
              {stats.successRate.toFixed(1)}%
            </span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-sm text-gray-300">Último Zero:</span>
            <span className="text-sm font-medium">
              {stats.lastZero !== null ? `${stats.lastZero} giros atrás` : 'Não registrado'}
            </span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-sm text-gray-300">Setor Quente:</span>
            <span className="text-sm font-medium text-yellow-400">{getHotSector()}</span>
          </div>
          
          {/* Color Distribution */}
          {stats.colorDistribution && Object.keys(stats.colorDistribution).length > 0 && (
            <div className="mt-4 pt-3 border-t border-gray-600">
              <div className="text-xs text-gray-400 mb-2">Distribuição de Cores (últimos 20):</div>
              <div className="space-y-1">
                {Object.entries(stats.colorDistribution).map(([color, count]) => (
                  <div key={color} className="flex justify-between text-xs">
                    <span className={`capitalize ${
                      color === 'red' ? 'text-red-400' : 
                      color === 'black' ? 'text-gray-300' : 
                      'text-green-400'
                    }`}>
                      {color === 'red' ? 'Vermelho' : color === 'black' ? 'Preto' : 'Verde'}:
                    </span>
                    <span>{count}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
