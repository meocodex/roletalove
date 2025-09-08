import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useAuth } from '@/hooks/useAuth';
import { Link } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import {
  User,
  Settings,
  BarChart3,
  Activity,
  TrendingUp,
  Clock,
  Target,
  Award,
  Zap,
  Crown,
  Calendar,
  DollarSign,
  ArrowRight,
  Play,
  PieChart
} from 'lucide-react';

// Quick Stats Component
function QuickStats() {
  const { user } = useAuth();

  // Mock data - em produção viria da API
  const stats = {
    sessionsThisWeek: 12,
    totalResults: 1547,
    accuracyRate: 84.2,
    bestStreak: 23,
    planType: user?.planType || 'basico'
  };

  const planIcons = {
    basico: <Zap className="w-5 h-5" />,
    intermediario: <Target className="w-5 h-5" />,
    completo: <Crown className="w-5 h-5" />
  };

  const planColors = {
    basico: 'from-blue-500 to-blue-600',
    intermediario: 'from-purple-500 to-purple-600', 
    completo: 'from-yellow-500 to-yellow-600'
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <Card className="bg-gray-800 border-gray-700">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-400">Sessões Esta Semana</p>
              <p className="text-2xl font-bold text-white">{stats.sessionsThisWeek}</p>
            </div>
            <div className="p-3 bg-blue-500/20 rounded-full">
              <Calendar className="w-6 h-6 text-blue-400" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gray-800 border-gray-700">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-400">Total de Resultados</p>
              <p className="text-2xl font-bold text-white">{stats.totalResults.toLocaleString()}</p>
            </div>
            <div className="p-3 bg-emerald-500/20 rounded-full">
              <BarChart3 className="w-6 h-6 text-emerald-400" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gray-800 border-gray-700">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-400">Taxa de Acerto</p>
              <p className="text-2xl font-bold text-white">{stats.accuracyRate}%</p>
            </div>
            <div className="p-3 bg-purple-500/20 rounded-full">
              <TrendingUp className="w-6 h-6 text-purple-400" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gray-800 border-gray-700">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-400">Plano Atual</p>
              <p className="text-lg font-bold text-white capitalize">{stats.planType}</p>
            </div>
            <div className={`p-3 bg-gradient-to-r ${planColors[stats.planType as keyof typeof planColors]} rounded-full text-white`}>
              {planIcons[stats.planType as keyof typeof planIcons]}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Recent Activity Component
function RecentActivity() {
  // Mock data - em produção viria da API
  const activities = [
    {
      id: 1,
      type: 'session',
      title: 'Nova sessão iniciada',
      description: 'Mesa Europeia - 47 resultados analisados',
      time: '2 horas atrás',
      icon: <Play className="w-4 h-4" />
    },
    {
      id: 2,
      type: 'pattern',
      title: 'Padrão detectado',
      description: 'Sequência de 8 vermelhos identificada',
      time: '4 horas atrás',
      icon: <Target className="w-4 h-4" />
    },
    {
      id: 3,
      type: 'strategy',
      title: 'Estratégia gerada',
      description: 'Números plenos baseados em análise de dúzias',
      time: '6 horas atrás',
      icon: <Award className="w-4 h-4" />
    },
    {
      id: 4,
      type: 'achievement',
      title: 'Meta alcançada',
      description: 'Taxa de acerto acima de 80% mantida por 7 dias',
      time: '1 dia atrás',
      icon: <TrendingUp className="w-4 h-4" />
    }
  ];

  return (
    <Card className="bg-gray-800 border-gray-700">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white">
          <Activity className="w-5 h-5" />
          Atividade Recente
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity) => (
            <div key={activity.id} className="flex items-start space-x-4 p-4 rounded-lg bg-gray-50 dark:bg-gray-800/50">
              <div className="p-2 bg-white dark:bg-gray-700 rounded-full shadow-sm">
                {activity.icon}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 dark:text-white">
                  {activity.title}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {activity.description}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                  {activity.time}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// Performance Chart Component
function PerformanceChart() {
  // Mock data - em produção seria um gráfico real
  return (
    <Card className="bg-gray-800 border-gray-700">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white">
          <PieChart className="w-5 h-5" />
          Performance dos Últimos 30 Dias
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="aspect-video bg-gray-50 dark:bg-gray-800 rounded-lg flex items-center justify-center">
          <div className="text-center">
            <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">Gráfico de Performance</p>
            <p className="text-sm text-gray-500">Implementação em desenvolvimento</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Profile Settings Component
function ProfileSettings() {
  const { user } = useAuth();

  return (
    <Card className="bg-gray-800 border-gray-700">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white">
          <User className="w-5 h-5" />
          Informações do Perfil
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center space-x-4">
          <Avatar className="w-20 h-20">
            <AvatarFallback className="bg-roulette-green text-white text-2xl font-bold">
              {user?.name?.charAt(0) || 'U'}
            </AvatarFallback>
          </Avatar>
          <div>
            <h3 className="text-xl font-semibold text-white">
              {user?.name || 'Usuário'}
            </h3>
            <p className="text-gray-400">{user?.email}</p>
            <Badge className="mt-2 capitalize">
              Plano {user?.planType || 'básico'}
            </Badge>
          </div>
        </div>

        <div className="pt-6 border-t border-gray-700">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-300">
                Membro desde
              </label>
              <p className="text-white">Janeiro 2025</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-300">
                Status da conta
              </label>
              <p className="text-roulette-green font-medium">Ativa</p>
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <Button variant="outline" className="flex-1">
            <Settings className="w-4 h-4 mr-2" />
            Configurações
          </Button>
          <Link href="/plans">
            <Button className="flex-1 bg-roulette-green hover:bg-roulette-green/90">
              <Crown className="w-4 h-4 mr-2" />
              Upgrade
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

// Quick Actions Component
function QuickActions() {
  return (
    <Card className="bg-gray-800 border-gray-700">
      <CardHeader>
        <CardTitle className="text-white">Ações Rápidas</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <Link href="/app">
          <Button className="w-full justify-start bg-roulette-green hover:bg-roulette-green/90">
            <Play className="w-4 h-4 mr-2" />
            Iniciar Nova Sessão
            <ArrowRight className="w-4 h-4 ml-auto" />
          </Button>
        </Link>
        
        <Button variant="outline" className="w-full justify-start" disabled>
          <BarChart3 className="w-4 h-4 mr-2" />
          Ver Relatórios
          <Badge variant="secondary" className="ml-auto">Em breve</Badge>
        </Button>
        
        <Button variant="outline" className="w-full justify-start" disabled>
          <Settings className="w-4 h-4 mr-2" />
          Configurar Alertas
          <Badge variant="secondary" className="ml-auto">Em breve</Badge>
        </Button>
      </CardContent>
    </Card>
  );
}

// Main Dashboard Component
export default function UserDashboard() {
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="min-h-screen bg-dashboard-dark font-casino flex items-center justify-center">
        <Card className="w-full max-w-md mx-4 bg-gray-800 border-gray-700">
          <CardContent className="p-8 text-center">
            <User className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h2 className="text-xl font-semibold text-white mb-2">
              Acesso Necessário
            </h2>
            <p className="text-gray-400 mb-6">
              Faça login para acessar seu dashboard
            </p>
            <Link href="/">
              <Button className="w-full">Ir para Home</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dashboard-dark font-casino">
      {/* Header */}
      <header className="bg-gray-900 shadow-sm border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white">
                Dashboard
              </h1>
              <p className="text-gray-400">
                Bem-vindo de volta, {user.name}
              </p>
            </div>
            
            <div className="flex items-center space-x-4">
              <Link href="/app">
                <Button className="bg-roulette-green hover:bg-roulette-green/90">
                  <Play className="w-4 h-4 mr-2" />
                  Sistema de Análise
                </Button>
              </Link>
              <Link href="/">
                <Button variant="outline">
                  Voltar ao Site
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Quick Stats */}
        <QuickStats />

        {/* Main Content Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="bg-gray-800 border border-gray-700">
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="activity">Atividade</TabsTrigger>
            <TabsTrigger value="profile">Perfil</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <PerformanceChart />
              </div>
              <div>
                <QuickActions />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="activity" className="space-y-6">
            <RecentActivity />
          </TabsContent>

          <TabsContent value="profile" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ProfileSettings />
              <div className="space-y-6">
                <QuickActions />
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}