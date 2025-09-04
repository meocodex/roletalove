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
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
      {statsData.map((stat, index) => (
        <Card 
          key={index} 
          className={`relative overflow-hidden bg-gradient-to-br ${stat.bgGradient} bg-gray-900/50 backdrop-blur-sm border ${stat.borderColor} hover:border-opacity-60 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-black/20 group cursor-pointer`}
        >
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-gray-300 tracking-wide">{stat.title}</p>
                  <div className={`p-1 rounded-full bg-gradient-to-r ${stat.bgGradient} opacity-60`}>
                    <div className="w-1 h-1 rounded-full bg-white" />
                  </div>
                </div>
                <p className="text-3xl font-bold text-white tracking-tight">{stat.value}</p>
                <div className="flex items-center gap-2">
                  <div className={`flex items-center gap-1 px-2 py-1 rounded-full ${
                    stat.trend === 'up' 
                      ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                      : 'bg-red-500/20 text-red-400 border border-red-500/30'
                  }`}>
                    {stat.trend === 'up' ? (
                      <ArrowUp className="w-3 h-3" />
                    ) : (
                      <ArrowDown className="w-3 h-3" />
                    )}
                    <span className="text-xs font-semibold">{stat.change}</span>
                  </div>
                  <span className="text-xs text-gray-500">vs último mês</span>
                </div>
              </div>
              <div className={`p-3 rounded-xl bg-gradient-to-r ${stat.bgGradient} group-hover:scale-110 transition-transform duration-300`}>
                <stat.icon className={`w-6 h-6 ${stat.iconColor}`} />
              </div>
            </div>
            
            {/* Elemento decorativo */}
            <div className="absolute top-0 right-0 w-32 h-32 -translate-y-16 translate-x-16 opacity-10">
              <stat.icon className="w-full h-full" />
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
    <Card className="bg-gray-900/50 backdrop-blur-sm border-gray-700/50 hover:border-gray-600/50 transition-all duration-300">
      <CardHeader className="border-b border-gray-700/50">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-500/20 border border-blue-500/30">
              <Users className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <CardTitle className="text-xl text-white">Gestão de Usuários</CardTitle>
              <p className="text-sm text-gray-400 mt-1">{mockUsers.length} usuários cadastrados</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Button size="sm" className="bg-roulette-green hover:bg-green-600">
              <Plus className="w-4 h-4 mr-2" />
              Novo Usuário
            </Button>
            <Button size="sm" variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Exportar
            </Button>
          </div>
        </div>
        
        {/* Barra de busca e filtros */}
        <div className="flex flex-col sm:flex-row gap-3 mt-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por nome ou email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-800/50 border border-gray-600/50 rounded-lg text-white placeholder-gray-400 focus:border-roulette-green focus:ring-1 focus:ring-roulette-green transition-colors"
            />
          </div>
          
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 bg-gray-800/50 border border-gray-600/50 rounded-lg text-white focus:border-roulette-green focus:ring-1 focus:ring-roulette-green transition-colors"
            >
              <option value="all">Todos</option>
              <option value="active">Ativos</option>
              <option value="inactive">Inativos</option>
            </select>
          </div>
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
                      <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold text-sm">
                        {user.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <p className="font-medium text-white group-hover:text-roulette-green transition-colors">{user.name}</p>
                        <p className="text-sm text-gray-400">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  
                  <td className="p-4 hidden sm:table-cell">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${getPlanBadge(user.plan)}`}>
                      {user.plan.charAt(0).toUpperCase() + user.plan.slice(1)}
                    </span>
                  </td>
                  
                  <td className="p-4 hidden md:table-cell">
                    <span className="text-sm text-gray-300">{user.lastLogin}</span>
                  </td>
                  
                  <td className="p-4 hidden lg:table-cell">
                    <span className="text-sm font-medium text-green-400">{user.revenue}</span>
                  </td>
                  
                  <td className="p-4">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusBadge(user.status)}`}>
                      <div className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                        user.status === 'active' ? 'bg-green-400' : 'bg-red-400'
                      }`} />
                      {user.status === 'active' ? 'Ativo' : 'Inativo'}
                    </span>
                  </td>
                  
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <Button size="sm" variant="ghost" className="hover:bg-blue-500/20 hover:text-blue-400">
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="ghost" className="hover:bg-yellow-500/20 hover:text-yellow-400">
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="ghost" className="hover:bg-red-500/20 hover:text-red-400">
                        <Trash2 className="w-4 h-4" />
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
    <Card className="bg-gray-900/50 backdrop-blur-sm border-gray-700/50 hover:border-gray-600/50 transition-all duration-300">
      <CardHeader className="border-b border-gray-700/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-orange-500/20 border border-orange-500/30">
              <Activity className="w-5 h-5 text-orange-400" />
            </div>
            <div>
              <CardTitle className="text-xl text-white">Logs de Atividade</CardTitle>
              <p className="text-sm text-gray-400 mt-1">Atividades recentes do sistema</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" className="text-xs">
              <Download className="w-4 h-4 mr-1" />
              Exportar
            </Button>
            <Button size="sm" variant="ghost">
              <MoreVertical className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-0">
        <div className="max-h-96 overflow-y-auto">
          {mockLogs.map((log, index) => {
            const logStyle = getLogIcon(log.type);
            return (
              <div 
                key={log.id} 
                className="flex items-start gap-4 p-4 border-b border-gray-800/50 last:border-b-0 hover:bg-gray-800/30 transition-all duration-200 group"
              >
                <div className={`flex items-center justify-center w-8 h-8 rounded-full border ${logStyle.bg} ${logStyle.color} text-sm font-bold mt-1`}>
                  {logStyle.icon}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <p className="text-white text-sm font-medium group-hover:text-roulette-green transition-colors">
                        <span className="font-semibold">{log.action}</span> por {log.user}
                      </p>
                      <p className="text-gray-400 text-sm mt-1">{log.details}</p>
                      <div className="flex items-center gap-3 mt-2">
                        <span className="text-xs text-gray-500">IP: {log.ip}</span>
                        <span className="text-xs text-gray-500">•</span>
                        <span className="text-xs text-gray-500">Há {index + 1}h</span>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <span className="text-xs text-gray-400 font-mono">{log.time}</span>
                      <div className="mt-1">
                        <Button size="sm" variant="ghost" className="opacity-0 group-hover:opacity-100 transition-opacity p-1 h-6">
                          <Eye className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        
        <div className="p-4 border-t border-gray-700/50 bg-gray-800/30">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-400">Mostrando últimas 5 atividades</span>
            <Button size="sm" variant="ghost" className="text-roulette-green hover:text-green-400">
              Ver todos os logs
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function AdminDashboard() {
  const { user, isAdmin, isSuperAdmin } = useAuth();

  return (
    <AdminGuard requiredRole="admin">
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950">
        {/* Header Moderno com Gradiente */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-green-600/10" />
          <div className="relative container mx-auto px-6 py-8">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div className="space-y-3">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30">
                    <Shield className="w-8 h-8 text-blue-400" />
                  </div>
                  <div>
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-gray-100 to-gray-300 bg-clip-text text-transparent">
                      Painel Administrativo
                    </h1>
                    <p className="text-gray-400 mt-2 text-lg">
                      Bem-vindo de volta, <span className="text-roulette-green font-semibold">{user?.name}</span>
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                    <span className="text-sm text-gray-300">Sistema Online</span>
                  </div>
                  <div className="h-4 w-px bg-gray-600" />
                  <span className="text-sm text-gray-400">Perfil: </span>
                  <Badge className="bg-gradient-to-r from-purple-500/20 to-blue-500/20 text-purple-400 border-purple-500/30">
                    {user?.userRole?.replace('_', ' ').toUpperCase()}
                  </Badge>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <Button 
                  variant="ghost" 
                  className="bg-gray-800/50 hover:bg-gray-700/50 border border-gray-600/50 hover:border-gray-500/50 transition-all duration-300"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Atualizar
                </Button>
                
                <Link href="/">
                  <Button 
                    variant="outline"
                    className="bg-gray-800/30 border-gray-600/50 hover:bg-gray-700/50 hover:border-gray-500/50 text-white transition-all duration-300"
                  >
                    <ArrowUp className="w-4 h-4 mr-2 rotate-[-45deg]" />
                    Dashboard Principal
                  </Button>
                </Link>
                
                <AdminOnly role="super_admin">
                  <Button className="bg-gradient-to-r from-roulette-green to-green-600 hover:from-green-600 hover:to-green-700 shadow-lg hover:shadow-green-500/25 transition-all duration-300">
                    <Settings className="w-4 h-4 mr-2" />
                    Config. Sistema
                  </Button>
                </AdminOnly>
              </div>
            </div>
          </div>
        </div>
        
        <div className="container mx-auto px-6 pb-8">

          {/* Stats Cards */}
          <SystemStats />

          {/* Navegação por Tabs Moderna */}
          <Tabs defaultValue="users" className="space-y-6">
            <div className="relative">
              <TabsList className="grid w-full grid-cols-3 lg:grid-cols-4 bg-gray-900/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-1.5 gap-1">
                <TabsTrigger 
                  value="users" 
                  className="relative flex items-center gap-2 px-4 py-3 rounded-lg text-gray-400 hover:text-white transition-all duration-300 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500/20 data-[state=active]:to-cyan-500/20 data-[state=active]:text-blue-400 data-[state=active]:border data-[state=active]:border-blue-500/30 data-[state=active]:shadow-lg data-[state=active]:shadow-blue-500/10"
                >
                  <Users className="w-4 h-4" />
                  <span className="font-medium">Usuários</span>
                  {/* Indicador ativo */}
                  <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-12 h-0.5 bg-blue-400 rounded-full opacity-0 data-[state=active]:opacity-100 transition-opacity duration-300" />
                </TabsTrigger>
                
                <TabsTrigger 
                  value="analytics" 
                  className="relative flex items-center gap-2 px-4 py-3 rounded-lg text-gray-400 hover:text-white transition-all duration-300 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500/20 data-[state=active]:to-pink-500/20 data-[state=active]:text-purple-400 data-[state=active]:border data-[state=active]:border-purple-500/30 data-[state=active]:shadow-lg data-[state=active]:shadow-purple-500/10"
                >
                  <BarChart3 className="w-4 h-4" />
                  <span className="font-medium hidden sm:inline">Relatórios</span>
                  <span className="font-medium sm:hidden">Charts</span>
                  <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-12 h-0.5 bg-purple-400 rounded-full opacity-0 data-[state=active]:opacity-100 transition-opacity duration-300" />
                </TabsTrigger>
                
                <TabsTrigger 
                  value="logs" 
                  className="relative flex items-center gap-2 px-4 py-3 rounded-lg text-gray-400 hover:text-white transition-all duration-300 data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500/20 data-[state=active]:to-yellow-500/20 data-[state=active]:text-orange-400 data-[state=active]:border data-[state=active]:border-orange-500/30 data-[state=active]:shadow-lg data-[state=active]:shadow-orange-500/10"
                >
                  <Activity className="w-4 h-4" />
                  <span className="font-medium">Logs</span>
                  <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-12 h-0.5 bg-orange-400 rounded-full opacity-0 data-[state=active]:opacity-100 transition-opacity duration-300" />
                </TabsTrigger>
                
                <AdminOnly role="super_admin">
                  <TabsTrigger 
                    value="system" 
                    className="relative flex items-center gap-2 px-4 py-3 rounded-lg text-gray-400 hover:text-white transition-all duration-300 data-[state=active]:bg-gradient-to-r data-[state=active]:from-red-500/20 data-[state=active]:to-pink-500/20 data-[state=active]:text-red-400 data-[state=active]:border data-[state=active]:border-red-500/30 data-[state=active]:shadow-lg data-[state=active]:shadow-red-500/10"
                  >
                    <Shield className="w-4 h-4" />
                    <span className="font-medium hidden lg:inline">Sistema</span>
                    <span className="font-medium lg:hidden">Sys</span>
                    <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-12 h-0.5 bg-red-400 rounded-full opacity-0 data-[state=active]:opacity-100 transition-opacity duration-300" />
                  </TabsTrigger>
                </AdminOnly>
              </TabsList>
            </div>

            <TabsContent value="users" className="space-y-4">
              <UserManagement />
            </TabsContent>

            <TabsContent value="analytics" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="bg-gray-900/50 backdrop-blur-sm border-gray-700/50 hover:border-gray-600/50 transition-all duration-300">
                  <CardHeader className="border-b border-gray-700/50">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-purple-500/20 border border-purple-500/30">
                        <BarChart3 className="w-5 h-5 text-purple-400" />
                      </div>
                      <CardTitle className="text-xl text-white">Relatórios Financeiros</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <div className="h-32 bg-gradient-to-r from-purple-500/10 to-blue-500/10 rounded-lg border border-purple-500/20 flex items-center justify-center">
                        <p className="text-gray-400 text-center">
                          <BarChart3 className="w-8 h-8 mx-auto mb-2 text-purple-400" />
                          Gráfico de receita mensal será exibido aqui
                        </p>
                      </div>
                      <Button className="w-full bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 border border-purple-500/30">
                        Gerar Relatório
                      </Button>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="bg-gray-900/50 backdrop-blur-sm border-gray-700/50 hover:border-gray-600/50 transition-all duration-300">
                  <CardHeader className="border-b border-gray-700/50">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-blue-500/20 border border-blue-500/30">
                        <TrendingUp className="w-5 h-5 text-blue-400" />
                      </div>
                      <CardTitle className="text-xl text-white">Analytics de Uso</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <div className="h-32 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 rounded-lg border border-blue-500/20 flex items-center justify-center">
                        <p className="text-gray-400 text-center">
                          <TrendingUp className="w-8 h-8 mx-auto mb-2 text-blue-400" />
                          Métricas de engajamento serão exibidas aqui
                        </p>
                      </div>
                      <Button className="w-full bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 border border-blue-500/30">
                        Ver Métricas
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="logs" className="space-y-4">
              <ActivityLogs />
            </TabsContent>

            <AdminOnly role="super_admin">
              <TabsContent value="system" className="space-y-6">
                <Card className="bg-gradient-to-br from-red-500/5 via-gray-900/50 to-pink-500/5 backdrop-blur-sm border-red-500/30 hover:border-red-500/50 transition-all duration-300">
                  <CardHeader className="border-b border-red-500/20">
                    <div className="flex items-center gap-3">
                      <div className="p-3 rounded-xl bg-gradient-to-r from-red-500/20 to-pink-500/20 border border-red-500/30">
                        <Database className="w-6 h-6 text-red-400" />
                      </div>
                      <div>
                        <CardTitle className="text-xl text-white flex items-center gap-2">
                          Configurações do Sistema
                          <Badge className="bg-red-500/20 text-red-400 border-red-500/30 text-xs">
                            SUPER ADMIN
                          </Badge>
                        </CardTitle>
                        <p className="text-gray-400 mt-1">Acesso exclusivo para super administradores</p>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <Button 
                        variant="outline" 
                        className="h-20 flex-col bg-gray-800/30 hover:bg-red-500/10 border-gray-600/50 hover:border-red-500/30 transition-all duration-300 group"
                      >
                        <Database className="w-6 h-6 mb-2 text-gray-400 group-hover:text-red-400 transition-colors" />
                        <span className="text-sm font-medium">Backup do Banco</span>
                      </Button>
                      
                      <Button 
                        variant="outline" 
                        className="h-20 flex-col bg-gray-800/30 hover:bg-red-500/10 border-gray-600/50 hover:border-red-500/30 transition-all duration-300 group"
                      >
                        <Settings className="w-6 h-6 mb-2 text-gray-400 group-hover:text-red-400 transition-colors" />
                        <span className="text-sm font-medium">Config. API</span>
                      </Button>
                      
                      <Button 
                        variant="outline" 
                        className="h-20 flex-col bg-gray-800/30 hover:bg-red-500/10 border-gray-600/50 hover:border-red-500/30 transition-all duration-300 group"
                      >
                        <Shield className="w-6 h-6 mb-2 text-gray-400 group-hover:text-red-400 transition-colors" />
                        <span className="text-sm font-medium">Segurança</span>
                      </Button>
                    </div>
                    
                    <div className="mt-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                      <div className="flex items-start gap-3">
                        <div className="p-1 rounded-full bg-red-500/20">
                          <span className="text-red-400 text-xs font-bold">!</span>
                        </div>
                        <div>
                          <p className="text-red-400 text-sm font-medium">Zona de Perigo</p>
                          <p className="text-gray-400 text-xs mt-1">
                            Ações aqui podem afetar todo o sistema. Proceda com cautela.
                          </p>
                        </div>
                      </div>
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