import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { AdminGuard, AdminOnly } from '@/components/auth/AdminGuard';
import { useAuth } from '@/hooks/useAuth';
import { 
  Users, 
  BarChart3, 
  Settings, 
  Activity, 
  DollarSign,
  TrendingUp,
  Shield,
  Database
} from 'lucide-react';
import { Link } from 'wouter';

// Component para estatísticas do sistema
function SystemStats() {
  const statsData = [
    {
      title: 'Usuários Ativos',
      value: '1,247',
      change: '+12%',
      trend: 'up',
      icon: Users
    },
    {
      title: 'Receita Mensal',
      value: 'R$ 47,320',
      change: '+8%', 
      trend: 'up',
      icon: DollarSign
    },
    {
      title: 'Sessões Hoje',
      value: '89',
      change: '+23%',
      trend: 'up',
      icon: Activity
    },
    {
      title: 'Taxa Conversão',
      value: '12.5%',
      change: '+2.1%',
      trend: 'up',
      icon: TrendingUp
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {statsData.map((stat, index) => (
        <Card key={index} className="bg-gray-800 border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">{stat.title}</p>
                <p className="text-2xl font-bold text-white">{stat.value}</p>
                <div className="flex items-center mt-1">
                  <Badge 
                    variant={stat.trend === 'up' ? 'default' : 'destructive'}
                    className="text-xs"
                  >
                    {stat.change}
                  </Badge>
                </div>
              </div>
              <stat.icon className="w-8 h-8 text-roulette-green" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// Component para gestão de usuários
function UserManagement() {
  const mockUsers = [
    { id: 1, name: 'João Silva', email: 'joao@email.com', plan: 'completo', status: 'active' },
    { id: 2, name: 'Maria Santos', email: 'maria@email.com', plan: 'intermediario', status: 'active' },
    { id: 3, name: 'Pedro Costa', email: 'pedro@email.com', plan: 'basico', status: 'inactive' },
  ];

  return (
    <Card className="bg-gray-800 border-gray-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Users className="w-5 h-5" />
          Gestão de Usuários
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {mockUsers.map((user) => (
            <div key={user.id} className="flex items-center justify-between p-4 bg-gray-900 rounded-lg">
              <div>
                <p className="text-white font-medium">{user.name}</p>
                <p className="text-gray-400 text-sm">{user.email}</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={user.plan === 'completo' ? 'default' : 'secondary'}>
                  {user.plan}
                </Badge>
                <Badge variant={user.status === 'active' ? 'default' : 'destructive'}>
                  {user.status}
                </Badge>
                <Button size="sm" variant="outline">
                  Editar
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// Component para logs de atividade
function ActivityLogs() {
  const mockLogs = [
    { id: 1, action: 'Login', user: 'João Silva', time: '10:30', details: 'Login realizado com sucesso' },
    { id: 2, action: 'Upgrade', user: 'Maria Santos', time: '09:15', details: 'Upgrade para plano completo' },
    { id: 3, action: 'Payment', user: 'Pedro Costa', time: '08:45', details: 'Pagamento processado' },
  ];

  return (
    <Card className="bg-gray-800 border-gray-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Activity className="w-5 h-5" />
          Logs de Atividade
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {mockLogs.map((log) => (
            <div key={log.id} className="flex items-center justify-between p-3 bg-gray-900 rounded">
              <div>
                <p className="text-white text-sm">
                  <span className="font-medium">{log.action}</span> - {log.user}
                </p>
                <p className="text-gray-400 text-xs">{log.details}</p>
              </div>
              <span className="text-gray-400 text-xs">{log.time}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export default function AdminDashboard() {
  const { user, isAdmin, isSuperAdmin } = useAuth();

  return (
    <AdminGuard requiredRole="admin">
      <div className="min-h-screen bg-dashboard-dark">
        <div className="container mx-auto p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-white">
                Painel Administrativo
              </h1>
              <p className="text-gray-400 mt-1">
                Bem-vindo, {user?.name} ({user?.userRole})
              </p>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/">
                <Button variant="outline">
                  Voltar ao Dashboard
                </Button>
              </Link>
              <AdminOnly role="super_admin">
                <Button className="bg-roulette-green hover:bg-green-600">
                  <Settings className="w-4 h-4 mr-2" />
                  Configurações do Sistema
                </Button>
              </AdminOnly>
            </div>
          </div>

          {/* Stats Cards */}
          <SystemStats />

          {/* Tabs for different admin sections */}
          <Tabs defaultValue="users" className="space-y-4">
            <TabsList className="bg-gray-800">
              <TabsTrigger value="users" className="data-[state=active]:bg-roulette-green">
                <Users className="w-4 h-4 mr-2" />
                Usuários
              </TabsTrigger>
              <TabsTrigger value="analytics" className="data-[state=active]:bg-roulette-green">
                <BarChart3 className="w-4 h-4 mr-2" />
                Relatórios
              </TabsTrigger>
              <TabsTrigger value="logs" className="data-[state=active]:bg-roulette-green">
                <Activity className="w-4 h-4 mr-2" />
                Logs
              </TabsTrigger>
              <AdminOnly role="super_admin">
                <TabsTrigger value="system" className="data-[state=active]:bg-roulette-green">
                  <Shield className="w-4 h-4 mr-2" />
                  Sistema
                </TabsTrigger>
              </AdminOnly>
            </TabsList>

            <TabsContent value="users" className="space-y-4">
              <UserManagement />
            </TabsContent>

            <TabsContent value="analytics" className="space-y-4">
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white">Relatórios e Analytics</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-400">
                    Gráficos e relatórios detalhados serão implementados aqui.
                  </p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="logs" className="space-y-4">
              <ActivityLogs />
            </TabsContent>

            <AdminOnly role="super_admin">
              <TabsContent value="system" className="space-y-4">
                <Card className="bg-gray-800 border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Database className="w-5 h-5" />
                      Configurações do Sistema
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-400 mb-4">
                      Configurações avançadas disponíveis apenas para super administradores.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Button variant="outline" className="justify-start">
                        <Database className="w-4 h-4 mr-2" />
                        Backup do Banco
                      </Button>
                      <Button variant="outline" className="justify-start">
                        <Settings className="w-4 h-4 mr-2" />
                        Configurações API
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </AdminOnly>
          </Tabs>
        </div>
      </div>
    </AdminGuard>
  );
}