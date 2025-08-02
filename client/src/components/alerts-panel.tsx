import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Bell, CheckCircle, AlertTriangle, Info } from 'lucide-react';
import { type Alert } from '@shared/schema';
import { apiRequest } from '@/lib/queryClient';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface AlertsPanelProps {
  className?: string;
}

export function AlertsPanel({ className }: AlertsPanelProps) {
  const queryClient = useQueryClient();
  
  const { data: alerts = [], isLoading } = useQuery<Alert[]>({
    queryKey: ['/api/alerts'],
  });

  const markAsReadMutation = useMutation({
    mutationFn: async (alertId: string) => {
      await apiRequest('PUT', `/api/alerts/${alertId}`, { read: true });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/alerts'] });
    }
  });

  const getAlertIcon = (type: string, severity: string) => {
    switch (severity) {
      case 'success':
        return <CheckCircle className="text-green-500" size={16} />;
      case 'warning':
        return <AlertTriangle className="text-yellow-500" size={16} />;
      case 'error':
        return <AlertTriangle className="text-red-500" size={16} />;
      default:
        return <Info className="text-blue-500" size={16} />;
    }
  };

  const getAlertBgColor = (severity: string) => {
    switch (severity) {
      case 'success':
        return 'bg-green-900/30';
      case 'warning':
        return 'bg-yellow-900/30';
      case 'error':
        return 'bg-red-900/30';
      default:
        return 'bg-blue-900/30';
    }
  };

  const handleAlertClick = (alert: Alert) => {
    if (!alert.read) {
      markAsReadMutation.mutate(alert.id);
    }
  };

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center text-lg">
            <Bell className="text-yellow-500 mr-2" size={20} />
            Alertas Recentes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-start space-x-2 p-2 bg-gray-700 rounded animate-pulse">
                <div className="w-4 h-4 bg-gray-600 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-600 rounded mb-1"></div>
                  <div className="h-3 bg-gray-600 rounded w-2/3"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center text-lg">
          <Bell className="text-yellow-500 mr-2" size={20} />
          Alertas Recentes
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 text-xs max-h-64 overflow-y-auto">
          {alerts.length === 0 ? (
            <div className="text-center py-4 text-gray-400">
              Nenhum alerta recente
            </div>
          ) : (
            alerts.map((alert) => (
              <div
                key={alert.id}
                className={`flex items-start space-x-2 p-2 ${getAlertBgColor(alert.severity)} rounded cursor-pointer hover:opacity-80 transition-opacity ${alert.read ? 'opacity-70' : ''}`}
                onClick={() => handleAlertClick(alert)}
              >
                {getAlertIcon(alert.type, alert.severity)}
                <div className="flex-1 min-w-0">
                  <div className={`font-medium ${
                    alert.severity === 'success' ? 'text-green-400' :
                    alert.severity === 'warning' ? 'text-yellow-400' :
                    alert.severity === 'error' ? 'text-red-400' :
                    'text-blue-400'
                  }`}>
                    {alert.title}
                  </div>
                  <div className="text-gray-400 truncate">{alert.message}</div>
                  <div className="text-gray-500 mt-1">
                    há {formatDistanceToNow(new Date(alert.timestamp), { locale: ptBR })}
                  </div>
                  
                  {/* Additional data display */}
                  {alert.data && typeof alert.data === 'object' && (
                    <div className="text-gray-400 text-xs mt-1">
                      {alert.type === 'strategy_hit' && (alert.data as any)?.number && (
                        <span>Número: {(alert.data as any).number}</span>
                      )}
                      {alert.type === 'pattern_detected' && (alert.data as any)?.probability && (
                        <span>Probabilidade: {Math.round((alert.data as any).probability * 100)}%</span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
