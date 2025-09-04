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
  Database,
  ArrowUp,
  ArrowDown,
  MoreVertical,
  Search,
  Filter,
  Download,
  RefreshCw,
  Eye,
  Edit,
  Trash2,
  Plus
} from 'lucide-react';
import { Link } from 'wouter';

// Component para estatísticas do sistema - Design 2025
function SystemStats() {
  const statsData = [
    {
      title: 'Usuários Ativos',
      value: '1,247',
      change: '+12%',
      trend: 'up',
      icon: Users,
      bgGradient: 'from-blue-500/20 to-cyan-500/20',
      iconColor: 'text-blue-400',
      borderColor: 'border-blue-500/30'
    },
    {
      title: 'Receita Mensal',
      value: 'R$ 47,320',
      change: '+8%', 
      trend: 'up',
      icon: DollarSign,
      bgGradient: 'from-emerald-500/20 to-green-500/20',
      iconColor: 'text-emerald-400',
      borderColor: 'border-emerald-500/30'
    },
    {
      title: 'Sessões Hoje',
      value: '89',
      change: '+23%',
      trend: 'up',
      icon: Activity,
      bgGradient: 'from-purple-500/20 to-pink-500/20',
      iconColor: 'text-purple-400',
      borderColor: 'border-purple-500/30'
    },
    {
      title: 'Taxa Conversão',
      value: '12.5%',
      change: '+2.1%',
      trend: 'up',
      icon: TrendingUp,
      bgGradient: 'from-orange-500/20 to-yellow-500/20',
      iconColor: 'text-orange-400',
      borderColor: 'border-orange-500/30'
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

// Component para gestão de usuários - Design Moderno 2025
function UserManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  
  const mockUsers = [
    { 
      id: 1, 
      name: 'João Silva', 
      email: 'joao@email.com', 
      plan: 'completo', 
      status: 'active',
      lastLogin: '2h ago',
      joinDate: '15 Jan 2025',
      revenue: 'R$ 299'
    },
    { 
      id: 2, 
      name: 'Maria Santos', 
      email: 'maria@email.com', 
      plan: 'intermediario', 
      status: 'active',
      lastLogin: '1d ago',
      joinDate: '10 Jan 2025',
      revenue: 'R$ 199'
    },
    { 
      id: 3, 
      name: 'Pedro Costa', 
      email: 'pedro@email.com', 
      plan: 'basico', 
      status: 'inactive',
      lastLogin: '7d ago',
      joinDate: '05 Jan 2025',
      revenue: 'R$ 99'
    },
    { 
      id: 4, 
      name: 'Ana Oliveira', 
      email: 'ana@email.com', 
      plan: 'completo', 
      status: 'active',
      lastLogin: '30m ago',
      joinDate: '20 Jan 2025',
      revenue: 'R$ 299'
    },
  ];

  const filteredUsers = mockUsers.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || user.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const getStatusBadge = (status: string) => {
    return status === 'active' 
      ? 'bg-green-500/20 text-green-400 border-green-500/30'
      : 'bg-red-500/20 text-red-400 border-red-500/30';
  };

  const getPlanBadge = (plan: string) => {
    switch(plan) {
      case 'completo':
        return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      case 'intermediario':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'basico':
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  return (
    <Card className="bg-gray-800 border-gray-700">
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <CardTitle className="text-white flex items-center gap-2">
            <Users className="w-5 h-5" />
            Gestão de Usuários
          </CardTitle>
          
          <div className="flex items-center gap-2">
            <Button size="sm" className="bg-roulette-green hover:bg-green-600">
              <Plus className="w-4 h-4 mr-2" />
              Novo
            </Button>
            <Button size="sm" variant="outline">
              <Download className="w-4 h-4" />
            </Button>
          </div>
        </div>
        
        {/* Barra de busca e filtros - Simplificada */}
        <div className="flex flex-col sm:flex-row gap-3 mt-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar usuário..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-900 border border-gray-600 rounded text-white placeholder-gray-400 focus:border-roulette-green focus:outline-none"
            />
          </div>
          
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 bg-gray-900 border border-gray-600 rounded text-white focus:border-roulette-green focus:outline-none"
          >
            <option value="all">Todos</option>
            <option value="active">Ativos</option>
            <option value="inactive">Inativos</option>
          </select>
        </div>
      </CardHeader>
      
      <CardContent className="p-0">
        {/* Tabela responsiva moderna */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-700/50">
                <th className="text-left p-4 font-medium text-gray-300 text-sm">Usuário</th>
                <th className="text-left p-4 font-medium text-gray-300 text-sm hidden sm:table-cell">Plano</th>
                <th className="text-left p-4 font-medium text-gray-300 text-sm hidden md:table-cell">Último Login</th>
                <th className="text-left p-4 font-medium text-gray-300 text-sm hidden lg:table-cell">Receita</th>
                <th className="text-left p-4 font-medium text-gray-300 text-sm">Status</th>
                <th className="text-left p-4 font-medium text-gray-300 text-sm">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user, index) => (
                <tr 
                  key={user.id} 
                  className="border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors duration-200 group"
                >
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-roulette-green flex items-center justify-center text-white font-semibold text-sm">
                        {user.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <p className="font-medium text-white">{user.name}</p>
                        <p className="text-sm text-gray-400">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  
                  <td className="p-4 hidden sm:table-cell">
                    <Badge variant={user.plan === 'completo' ? 'default' : 'secondary'}>
                      {user.plan}
                    </Badge>
                  </td>
                  
                  <td className="p-4 hidden md:table-cell">
                    <span className="text-sm text-gray-300">{user.lastLogin}</span>
                  </td>
                  
                  <td className="p-4 hidden lg:table-cell">
                    <span className="text-sm font-medium text-green-400">{user.revenue}</span>
                  </td>
                  
                  <td className="p-4">
                    <Badge variant={user.status === 'active' ? 'default' : 'destructive'}>
                      {user.status === 'active' ? 'Ativo' : 'Inativo'}
                    </Badge>
                  </td>
                  
                  <td className="p-4">
                    <div className="flex items-center gap-1">
                      <Button size="sm" variant="ghost">
                        <Edit className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {filteredUsers.length === 0 && (
          <div className="text-center py-12">
            <Users className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 mb-2">Nenhum usuário encontrado</p>
            <p className="text-sm text-gray-500">Tente ajustar os filtros de busca</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Component para logs de atividade - Design Moderno
function ActivityLogs() {
  const mockLogs = [
    { 
      id: 1, 
      action: 'Login', 
      user: 'João Silva', 
      time: '10:30', 
      details: 'Login realizado com sucesso',
      type: 'success',
      ip: '192.168.1.100'
    },
    { 
      id: 2, 
      action: 'Upgrade', 
      user: 'Maria Santos', 
      time: '09:15', 
      details: 'Upgrade para plano completo',
      type: 'info',
      ip: '192.168.1.101'
    },
    { 
      id: 3, 
      action: 'Payment', 
      user: 'Pedro Costa', 
      time: '08:45', 
      details: 'Pagamento processado',
      type: 'success',
      ip: '192.168.1.102'
    },
    { 
      id: 4, 
      action: 'Failed Login', 
      user: 'Anônimo', 
      time: '08:12', 
      details: 'Tentativa de login falhada',
      type: 'error',
      ip: '10.0.0.1'
    },
    { 
      id: 5, 
      action: 'Data Export', 
      user: 'Ana Oliveira', 
      time: '07:55', 
      details: 'Exportação de dados de usuários',
      type: 'warning',
      ip: '192.168.1.103'
    },
  ];

  const getLogIcon = (type: string) => {
    switch(type) {
      case 'success': return { icon: '✓', color: 'text-green-400', bg: 'bg-green-500/20 border-green-500/30' };
      case 'error': return { icon: '✕', color: 'text-red-400', bg: 'bg-red-500/20 border-red-500/30' };
      case 'warning': return { icon: '⚠', color: 'text-yellow-400', bg: 'bg-yellow-500/20 border-yellow-500/30' };
      case 'info': return { icon: 'ℹ', color: 'text-blue-400', bg: 'bg-blue-500/20 border-blue-500/30' };
      default: return { icon: '•', color: 'text-gray-400', bg: 'bg-gray-500/20 border-gray-500/30' };
    }
  };

  return (
    <Card className="bg-gray-800 border-gray-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Activity className="w-5 h-5" />
          Logs de Atividade
        </CardTitle>
      </CardHeader>
      
      <CardContent className="p-0">
        <div className="max-h-96 overflow-y-auto">
          {mockLogs.map((log, index) => {
            const logStyle = getLogIcon(log.type);
            return (
              <div key={log.id} className="flex items-center justify-between p-3 bg-gray-900 rounded">
                <div>
                  <p className="text-white text-sm">
                    <span className="font-medium">{log.action}</span> - {log.user}
                  </p>
                  <p className="text-gray-400 text-xs">{log.details}</p>
                </div>
                <span className="text-gray-400 text-xs">{log.time}</span>
              </div>
            );
          })}
        </div>
        
      </CardContent>
    </Card>
  );
}

export default function AdminDashboard() {
  const { user, isAdmin, isSuperAdmin } = useAuth();

  return (
    <AdminGuard requiredRole="admin">
      <div className="min-h-screen bg-dashboard-dark text-white font-casino">
        {/* Header Simples - Padrão do Sistema */}
        <header className="bg-gray-900 border-b border-gray-700 px-3 sm:px-4 py-2 sm:py-3 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className="w-6 h-6 sm:w-8 sm:h-8 bg-roulette-green rounded-full flex items-center justify-center">
                <Shield className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
              </div>
              <div>
                <h1 className="text-sm sm:text-lg font-bold text-white">
                  Painel Administrativo
                </h1>
                <p className="text-xs text-gray-400 hidden sm:block">Gestão do sistema</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2 sm:space-x-3">
              {/* User Info - Padrão do sistema */}
              {user && (
                <div className="text-right hidden sm:block">
                  <div className="text-xs text-gray-400">{user.name || 'Admin'}</div>
                  <div className="text-xs text-roulette-green font-medium">
                    {user?.userRole?.replace('_', ' ')}
                  </div>
                </div>
              )}
              
              <Link href="/">
                <Button variant="ghost" size="sm" className="text-xs hover:bg-gray-800">
                  <ArrowUp className="w-3 h-3 mr-1 rotate-[-45deg]" />
                  Dashboard
                </Button>
              </Link>
              
              <AdminOnly role="super_admin">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-xs hover:bg-gray-800 text-roulette-green hover:text-green-400"
                >
                  <Settings className="w-3 h-3 mr-1" />
                  Config
                </Button>
              </AdminOnly>
            </div>
          </div>
        </header>
        
        <div className="max-w-7xl mx-auto p-3 sm:p-4">

          {/* Stats Cards */}
          <SystemStats />

          {/* Tabs - Padrão do Sistema */}
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