import { Button } from '@/components/ui/button';
import { Play, Wifi, WifiOff, Layout, Grid, Shield } from 'lucide-react';
import { Link } from 'wouter';
import { FeatureGuard } from '@/components/auth/FeatureGuard';
import { AdminOnly } from '@/components/auth/AdminGuard';

interface RouletteHeaderProps {
  sessionActive: boolean;
  onToggleSession: () => void;
  lastResult: number | null;
  isConnected: boolean;
  isMobile: boolean;
  userName?: string;
  userPlan?: string;
  dashboardMode: 'standard' | 'custom';
  onToggleDashboardMode: () => void;
  getNumberColor: (num: number) => 'red' | 'black' | 'green';
}

export function RouletteHeader({
  sessionActive,
  onToggleSession,
  lastResult,
  isConnected,
  isMobile,
  userName,
  userPlan,
  dashboardMode,
  onToggleDashboardMode,
  getNumberColor
}: RouletteHeaderProps) {
  return (
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
          {userName && !isMobile && (
            <div className="text-right">
              <div className="text-xs text-gray-400">{userName}</div>
              <div className="text-xs text-roulette-green font-medium">
                {userPlan === 'basico' ? 'Básico' :
                 userPlan === 'intermediario' ? 'Intermediário' :
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
                onClick={onToggleDashboardMode}
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

          {/* Admin Panel Link */}
          <AdminOnly role="admin">
            <Link href="/admin">
              <Button
                variant="ghost"
                size="sm"
                className="text-xs hover:bg-gray-800 text-roulette-green hover:text-green-400"
                title="Painel Administrativo"
              >
                <Shield className="w-3 h-3 mr-1" />
                {!isMobile && 'Admin'}
              </Button>
            </Link>
          </AdminOnly>

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
  );
}
