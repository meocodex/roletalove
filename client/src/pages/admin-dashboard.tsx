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

// Component para estatísticas do sistema
function SystemStats() {
  const { data: stats, isLoading: statsLoading, error: statsError } = useQuery({
    queryKey: ['/api/admin/stats'],
    refetchInterval: 60000,
  });

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
      {statsData.map((stat, index) => {
        const IconComponent = stat.icon;
        const isPositive = stat.trend === 'up';
        
        return (
          <Card key={index} className={`bg-gradient-to-br ${stat.bgGradient} border ${stat.borderColor} hover:shadow-lg transition-all duration-300`}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-400 mb-1">{stat.title}</p>
                  <p className="text-2xl font-bold text-white">{stat.value}</p>
                  <div className="flex items-center mt-2">
                    {isPositive ? (
                      <ArrowUp className="w-4 h-4 text-green-400 mr-1" />
                    ) : (
                      <ArrowDown className="w-4 h-4 text-red-400 mr-1" />
                    )}
                    <span className={`text-sm font-medium ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
                      {stat.change}
                    </span>
                  </div>
                </div>
                <div className={`p-3 rounded-full bg-gray-800/50 ${stat.iconColor}`}>
                  <IconComponent className="w-6 h-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

// Component para gerenciamento de usuários
function UserManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [deleteUserId, setDeleteUserId] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch users
  const { data: users = [], isLoading } = useQuery({
    queryKey: ['/api/users'],
    refetchInterval: 30000,
  });

  // Delete user mutation
  const deleteMutation = useMutation({
    mutationFn: async (userId: string) => {
      return apiRequest(`/api/users/${userId}`, 'DELETE');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/users'] });
      toast({
        title: "Usuário removido",
        description: "Usuário removido com sucesso",
      });
      setDeleteUserId(null);
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: "Falha ao remover usuário",
        variant: "destructive"
      });
    }
  });

  // Update user status mutation
  const updateStatusMutation = useMutation({
    mutationFn: async ({ userId, isActive }: { userId: string; isActive: boolean }) => {
      return apiRequest(`/api/users/${userId}`, 'PUT', { isActive });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/users'] });
      toast({
        title: "Status atualizado",
        description: "Status do usuário atualizado com sucesso",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: "Falha ao atualizar status do usuário",
        variant: "destructive"
      });
    }
  });

  const filteredUsers = users.filter((user: any) => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || 
                         (filterStatus === 'active' && user.isActive) ||
                         (filterStatus === 'inactive' && !user.isActive);
    return matchesSearch && matchesStatus;
  });

  const handleEditUser = (user: any) => {
    setSelectedUser(user);
  };

  const handleToggleStatus = (userId: string, currentStatus: boolean) => {
    updateStatusMutation.mutate({ userId, isActive: !currentStatus });
  };

  const handleDeleteUser = (userId: string) => {
    setDeleteUserId(userId);
  };

  const confirmDelete = () => {
    if (deleteUserId) {
      deleteMutation.mutate(deleteUserId);
    }
  };

  if (isLoading) {
    return (
      <Card className="bg-gray-800 border-gray-700">
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-32">
            <RefreshCw className="w-6 h-6 animate-spin text-roulette-green" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gray-800 border-gray-700">
      <CardHeader>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <CardTitle className="text-xl text-white flex items-center gap-2">
            <Users className="w-5 h-5" />
            Gestão de Usuários
          </CardTitle>
          <div className="flex gap-2">
            <Button 
              size="sm" 
              className="bg-roulette-green hover:bg-green-600"
              onClick={() => setShowCreateModal(true)}
            >
              <Plus className="w-4 h-4 mr-2" />
              Novo
            </Button>
          </div>
        </div>
        
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
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-700/50">
                <th className="text-left p-4 font-medium text-gray-300 text-sm">Usuário</th>
                <th className="text-left p-4 font-medium text-gray-300 text-sm hidden sm:table-cell">Plano</th>
                <th className="text-left p-4 font-medium text-gray-300 text-sm hidden md:table-cell">Último Login</th>
                <th className="text-left p-4 font-medium text-gray-300 text-sm">Status</th>
                <th className="text-left p-4 font-medium text-gray-300 text-sm">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user: any) => (
                <tr 
                  key={user.id} 
                  className="border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors duration-200"
                >
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-roulette-green flex items-center justify-center text-white font-semibold text-sm">
                        {user.name.split(' ').map((n: string) => n[0]).join('')}
                      </div>
                      <div>
                        <p className="font-medium text-white">{user.name}</p>
                        <p className="text-sm text-gray-400">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 hidden sm:table-cell">
                    <Badge variant={user.planType === 'completo' ? 'default' : 'secondary'}>
                      {user.planType === 'basico' ? 'Básico' : 
                       user.planType === 'intermediario' ? 'Intermediário' : 'Completo'}
                    </Badge>
                  </td>
                  <td className="p-4 text-sm text-gray-400 hidden md:table-cell">
                    {user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleDateString('pt-BR') : 'Nunca'}
                  </td>
                  <td className="p-4">
                    <Badge 
                      variant={user.isActive ? 'default' : 'secondary'}
                      className={user.isActive ? 'bg-green-600' : 'bg-red-600'}
                    >
                      {user.isActive ? 'Ativo' : 'Inativo'}
                    </Badge>
                  </td>
                  <td className="p-4">
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleEditUser(user)}
                        className="text-blue-400 hover:text-blue-300 hover:bg-blue-900/20"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleToggleStatus(user.id, user.isActive)}
                        disabled={updateStatusMutation.isPending}
                        className="text-yellow-400 hover:text-yellow-300 hover:bg-yellow-900/20"
                      >
                        <Ban className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDeleteUser(user.id)}
                        disabled={deleteMutation.isPending}
                        className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {filteredUsers.length === 0 && (
            <div className="text-center py-8 text-gray-400">
              <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Nenhum usuário encontrado</p>
            </div>
          )}
        </div>
      </CardContent>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteUserId} onOpenChange={() => setDeleteUserId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este usuário? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} disabled={deleteMutation.isPending}>
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Edit User Modal */}
      {selectedUser && (
        <EditUserModal 
          user={selectedUser} 
          onClose={() => setSelectedUser(null)} 
        />
      )}

      {/* Create User Modal */}
      {showCreateModal && (
        <CreateUserModal 
          onClose={() => setShowCreateModal(false)} 
        />
      )}
    </Card>
  );
}

// Component de logs de atividade
function ActivityLogs() {
  const mockLogs = [
    {
      id: 1,
      action: 'Novo usuário cadastrado',
      details: 'João Silva se cadastrou no plano Básico',
      time: '10 min atrás'
    },
    {
      id: 2,
      action: 'Pagamento processado',
      details: 'Maria Santos - Plano Intermediário - R$ 59,90',
      time: '25 min atrás'
    },
    {
      id: 3,
      action: 'Usuário atualizado',
      details: 'Carlos Oliveira mudou para plano Completo',
      time: '1 hora atrás'
    }
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
        {/* Header */}
        <header className="bg-gray-900 border-b border-gray-700 px-4 py-4 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-roulette-green rounded-full flex items-center justify-center">
                <Shield className="w-4 h-4 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-white">Painel Administrativo</h1>
                <p className="text-xs text-gray-400">Gestão do Sistema</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="text-right">
                <div className="text-xs text-gray-400">{user?.name || 'Admin'}</div>
                <div className="text-xs text-roulette-green font-medium">
                  {isSuperAdmin ? 'Super Admin' : 'Admin'}
                </div>
              </div>
              <Link href="/">
                <Button variant="ghost" size="sm" className="hover:bg-gray-800">
                  Voltar ao Sistema
                </Button>
              </Link>
            </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto p-4">
          {/* System Statistics */}
          <SystemStats />

          {/* Main Content Tabs */}
          <Tabs defaultValue="users" className="space-y-4">
            <TabsList className="bg-gray-800 border-gray-700">
              <TabsTrigger value="users" className="data-[state=active]:bg-roulette-green">
                <Users className="w-4 h-4 mr-2" />
                Usuários
              </TabsTrigger>
              <TabsTrigger value="billing" className="data-[state=active]:bg-roulette-green">
                <DollarSign className="w-4 h-4 mr-2" />
                Cobrança
              </TabsTrigger>
              <TabsTrigger value="logs" className="data-[state=active]:bg-roulette-green">
                <Activity className="w-4 h-4 mr-2" />
                Logs
              </TabsTrigger>
              <TabsTrigger value="settings" className="data-[state=active]:bg-roulette-green">
                <Settings className="w-4 h-4 mr-2" />
                Configurações
              </TabsTrigger>
            </TabsList>

            <TabsContent value="users" className="space-y-4">
              <UserManagement />
            </TabsContent>

            <TabsContent value="billing" className="space-y-4">
              <BillingManagement />
            </TabsContent>

            <TabsContent value="logs" className="space-y-4">
              <ActivityLogs />
            </TabsContent>

            <TabsContent value="settings" className="space-y-4">
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Settings className="w-5 h-5" />
                    Configurações do Sistema
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-400">Configurações em desenvolvimento...</p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </AdminGuard>
  );
}