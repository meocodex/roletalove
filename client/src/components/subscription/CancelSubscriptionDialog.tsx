import { useState } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { AlertTriangle, Loader2 } from 'lucide-react';

interface CancelSubscriptionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => Promise<void>;
  planName: string;
  nextBillingDate?: string;
}

export function CancelSubscriptionDialog({
  open,
  onOpenChange,
  onConfirm,
  planName,
  nextBillingDate
}: CancelSubscriptionDialogProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleConfirm = async () => {
    setIsLoading(true);
    try {
      await onConfirm();
      onOpenChange(false);
    } catch (error) {
      console.error('Erro ao cancelar:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="bg-gray-800 border-gray-700 text-white max-w-md">
        <AlertDialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-red-500/20 rounded-full">
              <AlertTriangle className="w-6 h-6 text-red-400" />
            </div>
            <AlertDialogTitle className="text-xl text-white">
              Cancelar Assinatura?
            </AlertDialogTitle>
          </div>

          <AlertDialogDescription className="text-gray-300 space-y-4 pt-4">
            <p>
              Você está prestes a cancelar sua assinatura do <strong className="text-white">{planName}</strong>.
            </p>

            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
              <h4 className="font-medium text-yellow-400 mb-2">⚠️ O que acontecerá:</h4>
              <ul className="text-sm text-gray-300 space-y-2">
                <li>• Você continuará tendo acesso até {nextBillingDate ? new Date(nextBillingDate).toLocaleDateString('pt-BR') : 'o fim do período'}</li>
                <li>• Não haverá mais cobranças após essa data</li>
                <li>• Seus dados serão mantidos por 30 dias</li>
                <li>• Você pode reativar a qualquer momento</li>
              </ul>
            </div>

            <p className="text-sm text-gray-400">
              Tem certeza que deseja cancelar? Esta ação não pode ser desfeita facilmente.
            </p>
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter className="gap-2 sm:gap-2">
          <AlertDialogCancel
            disabled={isLoading}
            className="bg-gray-700 border-gray-600 text-white hover:bg-gray-600"
          >
            Manter Assinatura
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              handleConfirm();
            }}
            disabled={isLoading}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Cancelando...
              </>
            ) : (
              'Sim, Cancelar'
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
