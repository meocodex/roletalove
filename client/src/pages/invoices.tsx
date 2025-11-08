import { useAuth } from '@/hooks/useAuth';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  CreditCard,
  FileText,
  CheckCircle,
  Clock,
  AlertCircle,
  Download,
  ArrowLeft
} from "lucide-react";
import { useLocation } from 'wouter';

interface Payment {
  id: string;
  subscriptionId: string;
  userId: string;
  amount: number;
  currency: string;
  status: 'pending' | 'paid' | 'failed' | 'refunded';
  paymentMethod: string;
  description?: string;
  createdAt: Date | string;
  paidAt?: Date | string;
}

export default function InvoicesPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const queryClient = useQueryClient();

  // Buscar faturas do usuário
  const { data: payments = [], isLoading } = useQuery<Payment[]>({
    queryKey: ['/api/payments/user', user?.id],
    queryFn: async () => {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`/api/payments/user/${user?.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Falha ao carregar faturas');
      }

      return response.json();
    },
    enabled: !!user?.id
  });

  // Mutation para processar pagamento
  const processPaymentMutation = useMutation({
    mutationFn: async (paymentId: string) => {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`/api/payments/${paymentId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          status: 'paid',
          paidAt: new Date()
        })
      });

      if (!response.ok) {
        throw new Error('Falha ao processar pagamento');
      }

      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Pagamento Confirmado!",
        description: "Seu acesso foi liberado. Redirecionando...",
      });

      queryClient.invalidateQueries({ queryKey: ['/api/payments/user'] });
      queryClient.invalidateQueries({ queryKey: ['/api/subscription/check-access'] });

      setTimeout(() => navigate('/app'), 2000);
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Erro no Pagamento",
        description: error.message
      });
    }
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <Badge variant="outline" className="border-yellow-500 text-yellow-400 bg-yellow-500/10">
            <Clock className="w-3 h-3 mr-1" />
            Pendente
          </Badge>
        );
      case 'paid':
        return (
          <Badge variant="outline" className="border-green-500 text-green-400 bg-green-500/10">
            <CheckCircle className="w-3 h-3 mr-1" />
            Pago
          </Badge>
        );
      case 'failed':
        return (
          <Badge variant="outline" className="border-red-500 text-red-400 bg-red-500/10">
            <AlertCircle className="w-3 h-3 mr-1" />
            Falhou
          </Badge>
        );
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const pendingPayments = payments.filter(p => p.status === 'pending');
  const paidPayments = payments.filter(p => p.status === 'paid');

  if (isLoading) {
    return (
      <div className="min-h-screen bg-dashboard-dark flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-roulette-green mx-auto mb-4"></div>
          <p className="text-gray-400">Carregando faturas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dashboard-dark p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Button
            onClick={() => navigate('/app')}
            variant="ghost"
            className="text-gray-400 hover:text-white mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar ao Dashboard
          </Button>

          <h1 className="text-3xl font-bold text-white mb-2">
            Minhas Faturas
          </h1>
          <p className="text-gray-400">
            Gerencie suas faturas e histórico de pagamentos
          </p>
        </div>

        {/* Faturas Pendentes */}
        {pendingPayments.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
              <AlertCircle className="w-5 h-5 mr-2 text-yellow-400" />
              Faturas Pendentes ({pendingPayments.length})
            </h2>

            <div className="space-y-4">
              {pendingPayments.map((payment) => (
                <Card key={payment.id} className="bg-gray-800/50 border-yellow-500/30">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <div className="w-12 h-12 bg-yellow-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                          <FileText className="w-6 h-6 text-yellow-400" />
                        </div>
                        <div>
                          <CardTitle className="text-lg text-white mb-1">
                            {payment.description || 'Fatura de Assinatura'}
                          </CardTitle>
                          <p className="text-sm text-gray-400">
                            Criada em {new Date(payment.createdAt).toLocaleDateString('pt-BR')}
                          </p>
                        </div>
                      </div>
                      {getStatusBadge(payment.status)}
                    </div>
                  </CardHeader>

                  <CardContent>
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <p className="text-2xl font-bold text-roulette-green">
                          R$ {payment.amount.toFixed(2).replace('.', ',')}
                        </p>
                        <p className="text-sm text-gray-400">
                          Método: {payment.paymentMethod}
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <Button
                        onClick={() => processPaymentMutation.mutate(payment.id)}
                        disabled={processPaymentMutation.isPending}
                        className="flex-1 bg-gradient-to-r from-roulette-green to-green-600 hover:from-green-600 hover:to-green-700 text-white"
                      >
                        <CreditCard className="w-4 h-4 mr-2" />
                        {processPaymentMutation.isPending ? 'Processando...' : 'Pagar Agora'}
                      </Button>

                      <Button
                        variant="outline"
                        className="bg-gray-700/50 border-gray-600 text-white hover:bg-gray-600"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Boleto
                      </Button>
                    </div>

                    <p className="text-xs text-gray-500 mt-3">
                      💡 Simule o pagamento clicando em "Pagar Agora" para liberar seu acesso
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Histórico de Pagamentos */}
        {paidPayments.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
              <CheckCircle className="w-5 h-5 mr-2 text-green-400" />
              Histórico de Pagamentos ({paidPayments.length})
            </h2>

            <div className="space-y-3">
              {paidPayments.map((payment) => (
                <Card key={payment.id} className="bg-gray-800/30 border-gray-700">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                          <CheckCircle className="w-5 h-5 text-green-400" />
                        </div>
                        <div>
                          <p className="text-white font-medium">
                            {payment.description || 'Fatura de Assinatura'}
                          </p>
                          <p className="text-sm text-gray-400">
                            Pago em {new Date(payment.paidAt || payment.createdAt).toLocaleDateString('pt-BR')}
                          </p>
                        </div>
                      </div>

                      <div className="text-right">
                        <p className="text-lg font-semibold text-green-400">
                          R$ {payment.amount.toFixed(2).replace('.', ',')}
                        </p>
                        {getStatusBadge(payment.status)}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Sem Faturas */}
        {payments.length === 0 && (
          <Card className="bg-gray-800/30 border-gray-700">
            <CardContent className="p-12 text-center">
              <FileText className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">
                Nenhuma fatura encontrada
              </h3>
              <p className="text-gray-400 mb-6">
                Você não possui faturas no momento
              </p>
              <Button
                onClick={() => navigate('/plans')}
                className="bg-roulette-green hover:bg-green-600"
              >
                Ver Planos Disponíveis
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
