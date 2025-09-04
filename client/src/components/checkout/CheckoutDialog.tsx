import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, CreditCard, Smartphone, Shield, Check, X } from "lucide-react";
import { PlanType } from "@shared/schema";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

interface CheckoutDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  planType: PlanType;
  planName: string;
  planPrice: number;
  userId: string;
}

interface CheckoutSession {
  subscription?: any;
  clientSecret?: string;
  subscriptionId?: string;
  checkoutUrl?: string;
}

const createCheckout = async (userId: string, planType: PlanType): Promise<CheckoutSession> => {
  const response = await fetch('/api/checkout/create-subscription', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, planType, provider: 'stripe' })
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.details || 'Falha ao criar checkout');
  }
  
  return response.json();
};

export function CheckoutDialog({ open, onOpenChange, planType, planName, planPrice, userId }: CheckoutDialogProps) {
  const { toast } = useToast();
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'pix'>('card');

  const createCheckoutMutation = useMutation({
    mutationFn: () => createCheckout(userId, planType),
    onSuccess: (data) => {
      toast({
        title: "Checkout criado!",
        description: "Redirecionando para pagamento...",
      });
      
      // Redirecionar para checkout do Stripe
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      } else if (data.clientSecret) {
        window.location.href = `https://checkout.stripe.com/pay/${data.clientSecret}`;
      }
      
      onOpenChange(false);
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Erro no checkout",
        description: error.message
      });
    }
  });

  const handleCheckout = () => {
    createCheckoutMutation.mutate();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-gray-800 border-gray-700">
        <DialogHeader>
          <DialogTitle className="text-white text-xl">
            Finalizar Assinatura
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            Complete sua assinatura do {planName}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Resumo do Plano */}
          <Card className="bg-gray-900/50 border-gray-700">
            <CardContent className="p-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-white font-medium">{planName}</span>
                <Badge className="bg-roulette-green/20 text-roulette-green">
                  7 dias grátis
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Após trial:</span>
                <span className="text-2xl font-bold text-roulette-green">
                  R$ {planPrice.toFixed(2).replace('.', ',')}/mês
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Métodos de Pagamento */}
          <div className="space-y-3">
            <h3 className="text-white font-medium">Métodos de Pagamento</h3>
            
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setPaymentMethod('card')}
                className={`p-4 rounded-lg border-2 transition-all ${
                  paymentMethod === 'card' 
                    ? 'border-roulette-green bg-roulette-green/10' 
                    : 'border-gray-700 bg-gray-900/50 hover:border-gray-600'
                }`}
              >
                <CreditCard className={`w-6 h-6 mx-auto mb-2 ${
                  paymentMethod === 'card' ? 'text-roulette-green' : 'text-gray-400'
                }`} />
                <div className="text-sm text-white">Cartão</div>
              </button>
              
              <button
                onClick={() => setPaymentMethod('pix')}
                className={`p-4 rounded-lg border-2 transition-all ${
                  paymentMethod === 'pix' 
                    ? 'border-roulette-green bg-roulette-green/10' 
                    : 'border-gray-700 bg-gray-900/50 hover:border-gray-600'
                }`}
              >
                <Smartphone className={`w-6 h-6 mx-auto mb-2 ${
                  paymentMethod === 'pix' ? 'text-roulette-green' : 'text-gray-400'
                }`} />
                <div className="text-sm text-white">PIX</div>
              </button>
            </div>
          </div>

          {/* Benefícios */}
          <div className="space-y-2">
            <h3 className="text-white font-medium">O que está incluso:</h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-center text-gray-300">
                <Check className="w-4 h-4 text-roulette-green mr-2" />
                7 dias de trial gratuito
              </div>
              <div className="flex items-center text-gray-300">
                <Check className="w-4 h-4 text-roulette-green mr-2" />
                Cancele a qualquer momento
              </div>
              <div className="flex items-center text-gray-300">
                <Check className="w-4 h-4 text-roulette-green mr-2" />
                Acesso total às funcionalidades
              </div>
              <div className="flex items-center text-gray-300">
                <Shield className="w-4 h-4 text-roulette-green mr-2" />
                Pagamento seguro via Stripe
              </div>
            </div>
          </div>

          {/* Botões de Ação */}
          <div className="flex space-x-3">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1 bg-gray-700 border-gray-600 text-white hover:bg-gray-600"
              disabled={createCheckoutMutation.isPending}
            >
              Cancelar
            </Button>
            
            <Button
              onClick={handleCheckout}
              disabled={createCheckoutMutation.isPending}
              className="flex-1 bg-gradient-to-r from-roulette-green to-green-600 hover:from-green-600 hover:to-green-700 text-white"
            >
              {createCheckoutMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Criando...
                </>
              ) : (
                <>
                  Continuar com {paymentMethod === 'card' ? 'Cartão' : 'PIX'}
                </>
              )}
            </Button>
          </div>

          {/* Disclaimer */}
          <div className="text-xs text-gray-500 text-center">
            Ao continuar, você concorda com nossos termos de serviço.
            O trial de 7 dias é gratuito e pode ser cancelado a qualquer momento.
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}