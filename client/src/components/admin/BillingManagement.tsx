import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { 
  CreditCard, 
  DollarSign, 
  Users, 
  TrendingUp, 
  Calendar, 
  AlertTriangle,
  Search,
  Download,
  RefreshCcw,
  Eye,
  Ban,
  CheckCircle,
  XCircle,
  Clock
} from "lucide-react";

interface User {
  id: string;
  name: string;
  email: string;
  planType: string;
  createdAt: string;
}

interface Subscription {
  id: string;
  userId: string;
  planType: string;
  status: 'active' | 'trialing' | 'cancelled' | 'past_due';
  priceMonthly: number;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  nextBillingDate?: string;
  trialEnd?: string;
  user?: User;
}

interface Payment {
  id: string;
  userId: string;
  subscriptionId?: string;
  amount: number;
  currency: string;
  status: 'pending' | 'succeeded' | 'failed' | 'cancelled';
  paymentMethod: string;
  paidAt?: string;
  createdAt: string;
  user?: User;
}

interface BillingEvent {
  id: string;
  userId: string;
  subscriptionId?: string;
  eventType: string;
  amount?: number;
  metadata?: any;
  processed: boolean;
  createdAt: string;
  user?: User;
}

// API Functions
const fetchSubscriptions = async (): Promise<Subscription[]> => {
  const response = await fetch('/api/subscriptions');
  if (!response.ok) throw new Error('Erro ao carregar assinaturas');
  return response.json();
};

const fetchPayments = async (): Promise<Payment[]> => {
  const response = await fetch('/api/payments');
  if (!response.ok) throw new Error('Erro ao carregar pagamentos');
  return response.json();
};

const fetchBillingEvents = async (): Promise<BillingEvent[]> => {
  const response = await fetch('/api/billing-events');
  if (!response.ok) throw new Error('Erro ao carregar eventos');
  return response.json();
};

const processEvent = async (eventId: string) => {
  const response = await fetch(`/api/billing-events/${eventId}/process`, {
    method: 'PUT'
  });
  if (!response.ok) throw new Error('Erro ao processar evento');
  return response.json();
};

// Utility Functions
const getStatusBadge = (status: string) => {
  const statusConfig = {
    active: { color: 'bg-green-500/20 text-green-400', text: 'Ativa' },
    trialing: { color: 'bg-blue-500/20 text-blue-400', text: 'Trial' },
    cancelled: { color: 'bg-red-500/20 text-red-400', text: 'Cancelada' },
    past_due: { color: 'bg-yellow-500/20 text-yellow-400', text: 'Pendente' },
    succeeded: { color: 'bg-green-500/20 text-green-400', text: 'Pago' },
    failed: { color: 'bg-red-500/20 text-red-400', text: 'Falha' },
    pending: { color: 'bg-yellow-500/20 text-yellow-400', text: 'Pendente' }
  };
  
  const config = statusConfig[status as keyof typeof statusConfig] || 
    { color: 'bg-gray-500/20 text-gray-400', text: status };
  
  return <Badge className={config.color}>{config.text}</Badge>;
};

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(amount);
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export function BillingManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');

  // Queries
  const { data: subscriptions = [], isLoading: subscriptionsLoading } = useQuery({
    queryKey: ['/api/subscriptions'],
    queryFn: fetchSubscriptions,
    refetchInterval: 30000
  });

  const { data: payments = [], isLoading: paymentsLoading } = useQuery({
    queryKey: ['/api/payments'],
    queryFn: fetchPayments,
    refetchInterval: 30000
  });

  const { data: billingEvents = [], isLoading: eventsLoading } = useQuery({
    queryKey: ['/api/billing-events'],
    queryFn: fetchBillingEvents,
    refetchInterval: 10000
  });

  // Mutations
  const processEventMutation = useMutation({
    mutationFn: processEvent,
    onSuccess: () => {
      toast({
        title: "Sucesso",
        description: "Evento processado com sucesso"
      });
      queryClient.invalidateQueries({ queryKey: ['/api/billing-events'] });
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Erro",
        description: error.message
      });
    }
  });

  // Filtros
  const filteredSubscriptions = subscriptions.filter(sub => 
    sub.user?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sub.user?.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sub.planType.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredPayments = payments.filter(payment => 
    payment.user?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    payment.user?.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Estatísticas
  const stats = {
    totalRevenue: payments
      .filter(p => p.status === 'succeeded')
      .reduce((sum, p) => sum + p.amount, 0),
    activeSubscriptions: subscriptions.filter(s => s.status === 'active').length,
    trialUsers: subscriptions.filter(s => s.status === 'trialing').length,
    pendingPayments: payments.filter(p => p.status === 'pending').length
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white">Gestão de Cobrança</h2>
          <p className="text-gray-400">Gerencie assinaturas, pagamentos e eventos de cobrança</p>
        </div>
        <div className="flex space-x-2">
          <Button
            onClick={() => {
              queryClient.invalidateQueries({ queryKey: ['/api/subscriptions'] });
              queryClient.invalidateQueries({ queryKey: ['/api/payments'] });
              queryClient.invalidateQueries({ queryKey: ['/api/billing-events'] });
            }}
            variant="outline"
            className="bg-gray-700 border-gray-600"
          >
            <RefreshCcw className="w-4 h-4 mr-2" />
            Atualizar
          </Button>
          <Button className="bg-roulette-green hover:bg-green-600">
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-gray-800/50 border-gray-700/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Receita Total</p>
                <p className="text-2xl font-bold text-roulette-green">
                  {formatCurrency(stats.totalRevenue)}
                </p>
              </div>
              <DollarSign className="w-8 h-8 text-roulette-green" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800/50 border-gray-700/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Assinaturas Ativas</p>
                <p className="text-2xl font-bold text-white">{stats.activeSubscriptions}</p>
              </div>
              <Users className="w-8 h-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800/50 border-gray-700/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Usuários em Trial</p>
                <p className="text-2xl font-bold text-white">{stats.trialUsers}</p>
              </div>
              <Clock className="w-8 h-8 text-yellow-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800/50 border-gray-700/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Pagamentos Pendentes</p>
                <p className="text-2xl font-bold text-white">{stats.pendingPayments}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-red-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="flex space-x-4">
        <div className="flex-1 relative">
          <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
          <Input
            placeholder="Buscar por nome, email ou plano..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-gray-800 border-gray-600 text-white"
          />
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="subscriptions" className="space-y-6">
        <TabsList className="bg-gray-800 border-gray-700">
          <TabsTrigger value="subscriptions" className="text-gray-400 data-[state=active]:text-white">
            Assinaturas ({subscriptions.length})
          </TabsTrigger>
          <TabsTrigger value="payments" className="text-gray-400 data-[state=active]:text-white">
            Pagamentos ({payments.length})
          </TabsTrigger>
          <TabsTrigger value="events" className="text-gray-400 data-[state=active]:text-white">
            Eventos ({billingEvents.filter(e => !e.processed).length})
          </TabsTrigger>
        </TabsList>

        {/* Assinaturas Tab */}
        <TabsContent value="subscriptions">
          <Card className="bg-gray-800/50 border-gray-700/50">
            <CardHeader>
              <CardTitle className="text-white">Assinaturas</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow className="border-gray-700">
                    <TableHead className="text-gray-400">Usuário</TableHead>
                    <TableHead className="text-gray-400">Plano</TableHead>
                    <TableHead className="text-gray-400">Status</TableHead>
                    <TableHead className="text-gray-400">Valor</TableHead>
                    <TableHead className="text-gray-400">Próxima Cobrança</TableHead>
                    <TableHead className="text-gray-400">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSubscriptions.map((subscription) => (
                    <TableRow key={subscription.id} className="border-gray-700">
                      <TableCell>
                        <div>
                          <p className="text-white font-medium">{subscription.user?.name}</p>
                          <p className="text-gray-400 text-sm">{subscription.user?.email}</p>
                        </div>
                      </TableCell>
                      <TableCell className="text-white">{subscription.planType}</TableCell>
                      <TableCell>{getStatusBadge(subscription.status)}</TableCell>
                      <TableCell className="text-white">
                        {formatCurrency(subscription.priceMonthly)}
                      </TableCell>
                      <TableCell className="text-white">
                        {subscription.nextBillingDate 
                          ? formatDate(subscription.nextBillingDate)
                          : '-'
                        }
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button size="sm" variant="outline" className="bg-gray-700 border-gray-600">
                            <Eye className="w-3 h-3" />
                          </Button>
                          {subscription.status === 'active' && (
                            <Button size="sm" variant="outline" className="bg-red-600/20 border-red-600/50 text-red-400">
                              <Ban className="w-3 h-3" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Pagamentos Tab */}
        <TabsContent value="payments">
          <Card className="bg-gray-800/50 border-gray-700/50">
            <CardHeader>
              <CardTitle className="text-white">Histórico de Pagamentos</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow className="border-gray-700">
                    <TableHead className="text-gray-400">Usuário</TableHead>
                    <TableHead className="text-gray-400">Valor</TableHead>
                    <TableHead className="text-gray-400">Status</TableHead>
                    <TableHead className="text-gray-400">Método</TableHead>
                    <TableHead className="text-gray-400">Data</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPayments.map((payment) => (
                    <TableRow key={payment.id} className="border-gray-700">
                      <TableCell>
                        <div>
                          <p className="text-white font-medium">{payment.user?.name}</p>
                          <p className="text-gray-400 text-sm">{payment.user?.email}</p>
                        </div>
                      </TableCell>
                      <TableCell className="text-white">
                        {formatCurrency(payment.amount)}
                      </TableCell>
                      <TableCell>{getStatusBadge(payment.status)}</TableCell>
                      <TableCell className="text-white">{payment.paymentMethod}</TableCell>
                      <TableCell className="text-white">
                        {formatDate(payment.createdAt)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Eventos Tab */}
        <TabsContent value="events">
          <Card className="bg-gray-800/50 border-gray-700/50">
            <CardHeader>
              <CardTitle className="text-white">Eventos de Cobrança</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow className="border-gray-700">
                    <TableHead className="text-gray-400">Usuário</TableHead>
                    <TableHead className="text-gray-400">Evento</TableHead>
                    <TableHead className="text-gray-400">Valor</TableHead>
                    <TableHead className="text-gray-400">Status</TableHead>
                    <TableHead className="text-gray-400">Data</TableHead>
                    <TableHead className="text-gray-400">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {billingEvents.map((event) => (
                    <TableRow key={event.id} className="border-gray-700">
                      <TableCell>
                        <div>
                          <p className="text-white font-medium">{event.user?.name}</p>
                          <p className="text-gray-400 text-sm">{event.user?.email}</p>
                        </div>
                      </TableCell>
                      <TableCell className="text-white">{event.eventType}</TableCell>
                      <TableCell className="text-white">
                        {event.amount ? formatCurrency(event.amount) : '-'}
                      </TableCell>
                      <TableCell>
                        {event.processed ? (
                          <Badge className="bg-green-500/20 text-green-400">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Processado
                          </Badge>
                        ) : (
                          <Badge className="bg-yellow-500/20 text-yellow-400">
                            <Clock className="w-3 h-3 mr-1" />
                            Pendente
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-white">
                        {formatDate(event.createdAt)}
                      </TableCell>
                      <TableCell>
                        {!event.processed && (
                          <Button 
                            size="sm" 
                            onClick={() => processEventMutation.mutate(event.id)}
                            disabled={processEventMutation.isPending}
                            className="bg-roulette-green hover:bg-green-600"
                          >
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Processar
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}