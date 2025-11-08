import { useSubscriptionAccess, useSubscriptionMessage } from '@/hooks/useSubscriptionAccess';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, Clock, CreditCard, Lock, CheckCircle } from "lucide-react";
import { useLocation } from 'wouter';

interface AccessGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  showMessage?: boolean;
}

/**
 * Componente que protege conteúdo baseado no status da assinatura
 * Bloqueia acesso se trial expirou e não há pagamento
 */
export function AccessGuard({ children, fallback, showMessage = true }: AccessGuardProps) {
  const { hasAccess, isLoading, isAdmin } = useSubscriptionAccess();
  const { message, type, showUpgrade } = useSubscriptionMessage();
  const [, navigate] = useLocation();

  // Admin sempre tem acesso
  if (isAdmin) {
    return <>{children}</>;
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-roulette-green mx-auto mb-4"></div>
          <p className="text-gray-400">Verificando acesso...</p>
        </div>
      </div>
    );
  }

  // Tem acesso - mostra conteúdo
  if (hasAccess) {
    return <>{children}</>;
  }

  // Sem acesso - mostra fallback ou tela padrão
  if (fallback) {
    return <>{fallback}</>;
  }

  if (!showMessage) {
    return null;
  }

  // Tela padrão de bloqueio
  return (
    <div className="min-h-screen bg-dashboard-dark flex items-center justify-center p-4">
      <Card className="max-w-2xl w-full bg-gray-800/50 border-gray-700">
        <CardHeader className="text-center pb-4">
          <div className="w-20 h-20 bg-red-500/20 rounded-full mx-auto mb-4 flex items-center justify-center">
            <Lock className="w-10 h-10 text-red-400" />
          </div>
          <CardTitle className="text-2xl text-white mb-2">
            Acesso Bloqueado
          </CardTitle>
          <Badge
            variant="outline"
            className={`mt-2 ${
              type === 'error' ? 'border-red-500 text-red-400' :
              type === 'warning' ? 'border-yellow-500 text-yellow-400' :
              'border-gray-500 text-gray-400'
            }`}
          >
            {type === 'error' && <AlertCircle className="w-4 h-4 mr-1" />}
            {type === 'warning' && <Clock className="w-4 h-4 mr-1" />}
            {message}
          </Badge>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="bg-gray-900/30 rounded-lg p-6 border border-gray-700/50">
            <h3 className="text-white font-medium mb-3 flex items-center">
              <CreditCard className="w-5 h-5 mr-2 text-roulette-green" />
              O que aconteceu?
            </h3>
            <ul className="space-y-2 text-gray-300 text-sm">
              <li className="flex items-start">
                <CheckCircle className="w-4 h-4 mr-2 mt-0.5 text-green-400 flex-shrink-0" />
                <span>Você teve 7 dias de teste gratuito ao se cadastrar</span>
              </li>
              <li className="flex items-start">
                <AlertCircle className="w-4 h-4 mr-2 mt-0.5 text-yellow-400 flex-shrink-0" />
                <span>O período de trial expirou e uma fatura foi gerada</span>
              </li>
              <li className="flex items-start">
                <Lock className="w-4 h-4 mr-2 mt-0.5 text-red-400 flex-shrink-0" />
                <span>Seu acesso foi bloqueado até a quitação da fatura</span>
              </li>
            </ul>
          </div>

          <div className="bg-gray-900/30 rounded-lg p-6 border border-gray-700/50">
            <h3 className="text-white font-medium mb-3">Como recuperar o acesso?</h3>
            <p className="text-gray-300 text-sm mb-4">
              Escolha um plano e realize o pagamento. Seu acesso será liberado imediatamente após a confirmação!
            </p>

            <div className="flex gap-3">
              {showUpgrade && (
                <Button
                  onClick={() => navigate('/plans')}
                  className="flex-1 bg-gradient-to-r from-roulette-green to-green-600 hover:from-green-600 hover:to-green-700 text-white font-medium"
                >
                  <CreditCard className="w-4 h-4 mr-2" />
                  Ver Planos e Pagar
                </Button>
              )}

              <Button
                onClick={() => navigate('/')}
                variant="outline"
                className="bg-gray-800/50 border-gray-600 text-white hover:bg-gray-700"
              >
                Voltar ao Início
              </Button>
            </div>
          </div>

          <div className="text-center">
            <p className="text-sm text-gray-500">
              Precisa de ajuda? Entre em contato conosco
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

/**
 * Componente para mostrar banner de trial em andamento
 */
export function TrialBanner() {
  const { trialActive, daysLeft, hasAccess, isAdmin } = useSubscriptionAccess();
  const [, navigate] = useLocation();

  // Não mostrar para admin ou se não tem acesso
  if (isAdmin || !hasAccess || !trialActive || daysLeft <= 0) {
    return null;
  }

  return (
    <div className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 border-b border-blue-500/30 px-4 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Clock className="w-5 h-5 text-blue-400" />
          <p className="text-white text-sm">
            <span className="font-medium">Trial Gratuito:</span> Você tem{' '}
            <span className="font-bold text-blue-400">{daysLeft} {daysLeft === 1 ? 'dia' : 'dias'}</span>{' '}
            restantes para aproveitar!
          </p>
        </div>

        <Button
          onClick={() => navigate('/plans')}
          size="sm"
          variant="outline"
          className="bg-blue-500/10 border-blue-500/30 text-blue-300 hover:bg-blue-500/20"
        >
          Ver Planos
        </Button>
      </div>
    </div>
  );
}
