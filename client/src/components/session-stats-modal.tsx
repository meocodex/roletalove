import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3, TrendingUp, TrendingDown, Activity, Clock, Target } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

export function SessionStatsModal() {
  const [isOpen, setIsOpen] = useState(false);

  const { data: stats, isLoading } = useQuery({
    queryKey: ['/api/session/stats'],
  }) as { data: any; isLoading: boolean };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    } else {
      return `${secs}s`;
    }
  };

  const formatStartTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR');
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="w-full justify-start bg-gray-800 border-gray-600 hover:bg-gray-700 text-white"
        >
          <BarChart3 className="w-4 h-4 mr-2" />
          Estatísticas da Sessão
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto bg-gray-900 border-gray-700">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center">
            <BarChart3 className="w-5 h-5 mr-2" />
            Estatísticas da Sessão Atual
          </DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-gray-400">Carregando estatísticas...</div>
          </div>
        ) : stats ? (
          <div className="space-y-6">
            
            {/* Informações Gerais da Sessão */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-300 flex items-center">
                    <Activity className="w-4 h-4 mr-2" />
                    Total de Giros
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white">
                    {stats.session?.totalSpins || 0}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-800 border-gray-700">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-300 flex items-center">
                    <Clock className="w-4 h-4 mr-2" />
                    Duração
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white">
                    {stats.session?.duration ? formatDuration(stats.session.duration) : '0s'}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-800 border-gray-700">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-300 flex items-center">
                    <Target className="w-4 h-4 mr-2" />
                    Precisão
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white">
                    {stats.performance?.accuracy ? `${Math.round(stats.performance.accuracy)}%` : '0%'}
                  </div>
                  <div className="text-xs text-gray-400">
                    {stats.performance?.correctPredictions || 0} de {stats.performance?.totalPredictions || 0}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Números Quentes e Frios */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-sm font-medium text-red-400 flex items-center">
                    <TrendingUp className="w-4 h-4 mr-2" />
                    Números Quentes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {stats?.patterns?.hotNumbers?.slice(0, 5).map((item: any) => (
                      <div key={item.number} className="flex justify-between items-center">
                        <span className="text-white font-medium">#{item.number}</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-16 bg-gray-700 rounded-full h-2">
                            <div 
                              className="bg-red-500 h-2 rounded-full" 
                              style={{ width: `${Math.min(100, (item.frequency / 10) * 100)}%` }}
                            />
                          </div>
                          <span className="text-xs text-gray-400 w-8 text-right">{item.frequency}x</span>
                        </div>
                      </div>
                    )) || <div className="text-gray-400 text-sm">Dados insuficientes</div>}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-sm font-medium text-blue-400 flex items-center">
                    <TrendingDown className="w-4 h-4 mr-2" />
                    Números Frios
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {stats?.patterns?.coldNumbers?.slice(0, 5).map((item: any) => (
                      <div key={item.number} className="flex justify-between items-center">
                        <span className="text-white font-medium">#{item.number}</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-16 bg-gray-700 rounded-full h-2">
                            <div 
                              className="bg-blue-500 h-2 rounded-full" 
                              style={{ width: `${item.frequency === 0 ? 100 : Math.max(10, 100 - (item.frequency * 10))}%` }}
                            />
                          </div>
                          <span className="text-xs text-gray-400 w-8 text-right">{item.frequency}x</span>
                        </div>
                      </div>
                    )) || <div className="text-gray-400 text-sm">Dados insuficientes</div>}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sequências */}
            {stats?.patterns?.streaks && (
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-sm font-medium text-white">
                    Sequências de Cores
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-lg font-bold text-red-500">
                        {stats.patterns.streaks.currentRedStreak || 0}
                      </div>
                      <div className="text-xs text-gray-400">Vermelhos Atuais</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-gray-300">
                        {stats.patterns.streaks.currentBlackStreak || 0}
                      </div>
                      <div className="text-xs text-gray-400">Pretos Atuais</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-red-400">
                        {stats.patterns.streaks.longestRedStreak || 0}
                      </div>
                      <div className="text-xs text-gray-400">Maior Seq. Vermelha</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-gray-200">
                        {stats.patterns.streaks.longestBlackStreak || 0}
                      </div>
                      <div className="text-xs text-gray-400">Maior Seq. Preta</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Informações da Sessão */}
            {stats?.session?.startTime && (
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-sm font-medium text-gray-300">
                    Detalhes da Sessão
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-gray-400">
                    Iniciada em: <span className="text-white">{formatStartTime(stats.session.startTime)}</span>
                  </div>
                  <div className="text-sm text-gray-400 mt-1">
                    ID da Sessão: <span className="text-white font-mono text-xs">{stats.session.id}</span>
                  </div>
                </CardContent>
              </Card>
            )}

          </div>
        ) : (
          <div className="text-center py-8 text-gray-400">
            Nenhuma estatística disponível para esta sessão.
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}