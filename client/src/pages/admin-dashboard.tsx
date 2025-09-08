import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { AdminGuard, AdminOnly } from '@/components/auth/AdminGuard';
import { useAuth } from '@/hooks/useAuth';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
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
  Plus,
  Ban
} from 'lucide-react';
import { Link } from 'wouter';
import { BillingManagement } from '@/components/admin/BillingManagement';
import { EditUserModal } from '@/components/admin/EditUserModal';
import { CreateUserModal } from '@/components/admin/CreateUserModal';

// Component para estatísticas do sistema - Design 2025
function SystemStats() {
  // Buscar estatísticas reais do backend
  const { data: stats, isLoading: statsLoading, error: statsError } = useQuery({
    queryKey: ['/api/admin/stats'],
    refetchInterval: 60000, // refresh cada 1 minuto
  });

  // Loading state
  if (statsLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[1, 2, 3, 4].map(i => (
          <Card key={i} className="bg-gray-800 border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-center h-20">
                <RefreshCw className="w-6 h-6 animate-spin text-roulette-green" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  // Error state
  if (statsError || !stats) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card className="bg-gray-800 border-gray-700 col-span-full">
          <CardContent className="p-6">
            <p className="text-red-400 text-center">Erro ao carregar estatísticas</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const statsData = [
    {
      title: 'Usuários Ativos',
      value: stats.activeUsers?.value?.toLocaleString() || '0',
      change: stats.activeUsers?.change || '+0%',
      trend: stats.activeUsers?.trend || 'up',
      icon: Users,
      bgGradient: 'from-blue-500/20 to-cyan-500/20',
      iconColor: 'text-blue-400',
      borderColor: 'border-blue-500/30'
    },
    {
      title: 'Receita Mensal',
      value: `R$ ${stats.monthlyRevenue?.value?.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) || '0,00'}`,
      change: stats.monthlyRevenue?.change || '+0%', 
      trend: stats.monthlyRevenue?.trend || 'up',
      icon: DollarSign,
      bgGradient: 'from-emerald-500/20 to-green-500/20',
      iconColor: 'text-emerald-400',
      borderColor: 'border-emerald-500/30'
    },
    {
      title: 'Sessões Hoje',
      value: stats.sessionsToday?.value?.toString() || '0',
      change: stats.sessionsToday?.change || '+0%',
      trend: stats.sessionsToday?.trend || 'up',
      icon: Activity,
      bgGradient: 'from-purple-500/20 to-pink-500/20',
      iconColor: 'text-purple-400',
      borderColor: 'border-purple-500/30'
    },
    {
      title: 'Taxa Conversão',
      value: `${stats.conversionRate?.value?.toFixed(1) || '0'}%`,
      change: stats.conversionRate?.change || '+0%',
      trend: stats.conversionRate?.trend || 'up',
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
  const [deleteUserId, setDeleteUserId] = useState<string | null>(null);
  const [editUser, setEditUser] = useState<any>(null);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Buscar usuários reais do backend
  const { data: users = [], isLoading: usersLoading, error: usersError } = useQuery({
    queryKey: ['/api/users'],
    refetchInterval: 30000, // refresh cada 30s
  });

  // Mutation para deletar usuário
  const deleteMutation = useMutation({
    mutationFn: async (userId: string) => {
      return apiRequest(`/api/users/${userId}`, 'DELETE');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/users'] });
      toast({
        title: "Usuário removido",
        description: "Usuário foi removido com sucesso.",
      });
      setDeleteUserId(null);
    },
    onError: (error) => {
      toast({
        title: "Erro ao remover usuário",
        description: "Não foi possível remover o usuário.",
        variant: "destructive",
      });
    },
  });

  // Mutation para atualizar status do usuário
  const updateStatusMutation = useMutation({
    mutationFn: async ({ userId, isActive }: { userId: string; isActive: boolean }) => {
      return apiRequest(`/api/users/${userId}`, 'PUT', { isActive });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/users'] });
      toast({
        title: "Status atualizado",
        description: "Status do usuário foi atualizado.",
      });
    },
  });

  // Event Handlers
  const handleDeleteUser = (userId: string) => {
    setDeleteUserId(userId);
  };

  const confirmDelete = () => {
    if (deleteUserId) {
      deleteMutation.mutate(deleteUserId);
    }
  };

  const handleToggleStatus = (userId: string, currentStatus: boolean) => {
    updateStatusMutation.mutate({ userId, isActive: !currentStatus });
  };

  const handleEditUser = (user: any) => {
    setEditUser(user);
  };

  const handleCreateUser = () => {
    setCreateModalOpen(true);
  };

  // Filtrar usuários
  const filteredUsers = users.filter((user: any) => {
    const matchesSearch = user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || 
                        (filterStatus === 'active' && user.isActive === true) ||
                        (filterStatus === 'inactive' && user.isActive === false);
    return matchesSearch && matchesFilter;
  });

  // Loading state
  if (usersLoading) {
    return (
      <Card className="bg-gray-800 border-gray-700">
        <CardContent className="p-8">
          <div className="flex items-center justify-center">
            <RefreshCw className="w-6 h-6 animate-spin text-roulette-green mr-2" />
            <span className="text-white">Carregando usuários...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Error state
  if (usersError) {
    return (
      <Card className="bg-gray-800 border-gray-700">
        <CardContent className="p-8">
          <div className="text-center">
            <p className="text-red-400 mb-2">Erro ao carregar usuários</p>
            <Button onClick={() => queryClient.invalidateQueries({ queryKey: ['/api/users'] })}>
              Tentar novamente
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
    <Card className="bg-gray-800 border-gray-700">
      <CardHeader className="pb-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-roulette-green/20">
              <Users className="w-5 h-5 text-roulette-green" />
            </div>
            <div>
              <CardTitle className="text-white text-lg">Gestão de Usuários</CardTitle>
              <p className="text-sm text-gray-400">Gerenciar usuários e permissões</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Button 
              size="sm" 
              className="bg-roulette-green hover:bg-green-600"
              onClick={handleCreateUser}
            >
              <Plus className="w-4 h-4 mr-1" />
              Novo
            </Button>
            <Button size="sm" variant="outline">
              <Download className="w-4 h-4 mr-1" />
            </Button>
          </div>
        </div>
        
        {/* Filtros e busca */}
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
                        {user.name?.split(' ').map(n => n[0]).join('') || '?'}
                      </div>
                      <div>
                        <p className="font-medium text-white">{user.name}</p>
                        <p className="text-sm text-gray-400">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  
                  <td className="p-4 hidden sm:table-cell">
                    <Badge variant={user.planType === 'completo' ? 'default' : 'secondary'}>
                      {user.planType}
                    </Badge>
                  </td>
                  
                  <td className="p-4 hidden md:table-cell">
                    <span className="text-sm text-gray-300">
                      {user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleDateString('pt-BR') : 'Nunca'}
                    </span>
                  </td>
                  
                  <td className="p-4 hidden lg:table-cell">
                    <span className="text-sm font-medium text-green-400">
                      {user.planType === 'completo' ? 'R$ 299' : user.planType === 'intermediario' ? 'R$ 199' : 'R$ 99'}
                    </span>
                  </td>
                  
                  <td className="p-4">
                    <Badge 
                      variant={user.isActive ? 'default' : 'destructive'}
                      className="cursor-pointer"
                      onClick={() => handleToggleStatus(user.id, user.isActive)}
                    >
                      {user.isActive ? 'Ativo' : 'Inativo'}
                    </Badge>
                  </td>
                  
                  <td className="p-4">
                    <div className="flex items-center gap-1">
                      <Button 
                        size="sm" 
                        variant="ghost"
                        onClick={() => handleEditUser(user)}
                        title="Editar usuário"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="ghost"
                        onClick={() => handleToggleStatus(user.id, user.isActive)}
                        disabled={updateStatusMutation.isPending}
                        title={user.isActive ? 'Desativar usuário' : 'Ativar usuário'}
                      >
                        {user.isActive ? <Eye className="w-4 h-4" /> : <Ban className="w-4 h-4" />}
                      </Button>
                      <Button 
                        size="sm" 
                        variant="ghost"
                        onClick={() => handleDeleteUser(user.id)}
                        disabled={deleteMutation.isPending}
                        className="text-red-400 hover:text-red-300"
                        title="Remover usuário"
                      >
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
    
    {/* AlertDialog para confirmar deleção */}
    <AlertDialog open={!!deleteUserId} onOpenChange={() => setDeleteUserId(null)}>
      <AlertDialogContent className="bg-gray-800 border-gray-700">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-white">Confirmar remoção</AlertDialogTitle>
          <AlertDialogDescription className="text-gray-300">
            Tem certeza que deseja remover este usuário? Esta ação não pode ser desfeita.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel 
            onClick={() => setDeleteUserId(null)}
            className="bg-gray-700 text-white border-gray-600 hover:bg-gray-600"
          >
            Cancelar
          </AlertDialogCancel>
          <AlertDialogAction 
            onClick={confirmDelete}
            disabled={deleteMutation.isPending}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            {deleteMutation.isPending ? 'Removendo...' : 'Remover'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>

    {/* Modais de CRUD */}
    <EditUserModal 
      user={editUser}
      open={!!editUser}
      onOpenChange={(open) => !open && setEditUser(null)}
    />
    
    <CreateUserModal 
      open={createModalOpen}
      onOpenChange={setCreateModalOpen}
    />
    </>
  );
}

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
      action: 'Error', 
      user: 'Pedro Costa', 
      time: '08:45', 
      details: 'Falha no pagamento',
      type: 'error',
      ip: '192.168.1.102'
    },
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
        <div className="space-y-4">
          {mockLogs.map(log => (
            <div key={log.id} className="flex items-center justify-between p-3 bg-gray-900/50 rounded-lg">
              <div>
                <p className="font-medium text-white">{log.action}</p>
                <p className="text-sm text-gray-400">{log.details}</p>
              </div>
              <div className="text-sm text-gray-400">
                {log.time}
              </div>
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
      <div className="min-h-screen bg-dashboard-dark text-white font-casino">
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
                    <Badge variant={user.planType === 'completo' ? 'default' : 'secondary'}>
                      {user.planType}
                    </Badge>
                  </td>
                  
                  <td className="p-4 hidden md:table-cell">
                    <span className="text-sm text-gray-300">
                      {user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleDateString('pt-BR') : 'Nunca'}
                    </span>
                  </td>
                  
                  <td className="p-4 hidden lg:table-cell">
                    <span className="text-sm font-medium text-green-400">
                      {user.planType === 'completo' ? 'R$ 299' : user.planType === 'intermediario' ? 'R$ 199' : 'R$ 99'}
                    </span>
                  </td>
                  
                  <td className="p-4">
                    <Badge 
                      variant={user.isActive ? 'default' : 'destructive'}
                      className="cursor-pointer"
                      onClick={() => handleToggleStatus(user.id, user.isActive)}
                    >
                      {user.isActive ? 'Ativo' : 'Inativo'}
                    </Badge>
                  </td>
                  
                  <td className="p-4">
                    <div className="flex items-center gap-1">
                      <Button 
                        size="sm" 
                        variant="ghost"
                        onClick={() => handleEditUser(user)}
                        title="Editar usuário"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="ghost"
                        onClick={() => handleToggleStatus(user.id, user.isActive)}
                        disabled={updateStatusMutation.isPending}
                        title={user.isActive ? 'Desativar usuário' : 'Ativar usuário'}
                      >
                        {user.isActive ? <Eye className="w-4 h-4" /> : <Ban className="w-4 h-4" />}
                      </Button>
                      <Button 
                        size="sm" 
                        variant="ghost"
                        onClick={() => handleDeleteUser(user.id)}
                        disabled={deleteMutation.isPending}
                        className="text-red-400 hover:text-red-300"
                        title="Remover usuário"
                      >
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
    
    {/* AlertDialog para confirmar deleção */}
    <AlertDialog open={!!deleteUserId} onOpenChange={() => setDeleteUserId(null)}>
      <AlertDialogContent className="bg-gray-800 border-gray-700">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-white">Confirmar remoção</AlertDialogTitle>
          <AlertDialogDescription className="text-gray-300">
            Tem certeza que deseja remover este usuário? Esta ação não pode ser desfeita.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel 
            onClick={() => setDeleteUserId(null)}
            className="bg-gray-700 text-white border-gray-600 hover:bg-gray-600"
          >
            Cancelar
          </AlertDialogCancel>
          <AlertDialogAction 
            onClick={confirmDelete}
            disabled={deleteMutation.isPending}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            {deleteMutation.isPending ? 'Removendo...' : 'Remover'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
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
              <AdminOnly role="admin">
                <TabsTrigger value="billing" className="data-[state=active]:bg-roulette-green">
                  <DollarSign className="w-4 h-4 mr-2" />
                  Cobrança
                </TabsTrigger>
              </AdminOnly>
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

            <AdminOnly role="admin">
              <TabsContent value="billing" className="space-y-4">
                <BillingManagement />
              </TabsContent>
            </AdminOnly>

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