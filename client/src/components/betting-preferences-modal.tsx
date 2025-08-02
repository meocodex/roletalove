import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Settings, Check } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface BettingPreference {
  id: string;
  type: string;
  enabled: boolean;
  priority: number;
  description: string;
}

export function BettingPreferencesModal() {
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: preferences = [], isLoading } = useQuery({
    queryKey: ['/api/betting-preferences'],
  });

  const updatePreferenceMutation = useMutation({
    mutationFn: async ({ id, enabled }: { id: string; enabled: boolean }) => {
      return apiRequest(`/api/betting-preferences/${id}`, 'PATCH', { enabled });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/betting-preferences'] });
      toast({
        title: "Preferência atualizada",
        description: "Suas preferências de apostas foram salvas.",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Não foi possível atualizar as preferências.",
        variant: "destructive",
      });
    },
  });

  const handleTogglePreference = (id: string, enabled: boolean) => {
    updatePreferenceMutation.mutate({ id, enabled });
  };

  const preferenceTypes = [
    { type: 'straight_up', label: 'Números Diretos', description: 'Apostas em números únicos (0-36)' },
    { type: 'neighbors', label: 'Vizinhos', description: 'Apostas em números adjacentes na roda' },
    { type: 'dozens', label: 'Dúzias', description: '1ª Dúzia (1-12), 2ª Dúzia (13-24), 3ª Dúzia (25-36)' },
    { type: 'columns', label: 'Colunas', description: 'Apostas nas três colunas da mesa' },
    { type: 'colors', label: 'Cores', description: 'Vermelho ou Preto' },
    { type: 'odd_even', label: 'Par/Ímpar', description: 'Números pares ou ímpares' },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="w-full justify-start bg-gray-800 border-gray-600 hover:bg-gray-700 text-white"
        >
          <Settings className="w-4 h-4 mr-2" />
          Preferências de Apostas
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto bg-gray-900 border-gray-700">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center">
            <Settings className="w-5 h-5 mr-2" />
            Configurar Preferências de Apostas
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {preferenceTypes.map((prefType) => {
            const preference = (preferences as BettingPreference[]).find((p) => p.type === prefType.type);
            const isEnabled = preference?.enabled ?? true;
            
            return (
              <Card key={prefType.type} className="bg-gray-800 border-gray-700">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-sm font-medium text-white">
                        {prefType.label}
                      </CardTitle>
                      <p className="text-xs text-gray-400 mt-1">
                        {prefType.description}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      {isEnabled && <Check className="w-4 h-4 text-green-500" />}
                      <Switch
                        checked={isEnabled}
                        onCheckedChange={(enabled) => 
                          preference && handleTogglePreference(preference.id, enabled)
                        }
                        disabled={isLoading || updatePreferenceMutation.isPending}
                      />
                    </div>
                  </div>
                </CardHeader>
              </Card>
            );
          })}

          <div className="pt-4 border-t border-gray-700">
            <p className="text-xs text-gray-400">
              * As preferências ativadas serão consideradas na geração de estratégias automáticas.
              Desative tipos de apostas que você não deseja usar.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}