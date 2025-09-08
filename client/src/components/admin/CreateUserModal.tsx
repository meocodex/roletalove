import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { PlanType } from '@shared/schema';

interface CreateUserModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const initialFormData = {
  name: '',
  email: '',
  planType: 'basico' as PlanType,
  isActive: true,
  userRole: 'user' as 'user' | 'admin' | 'super_admin'
};

export function CreateUserModal({ open, onOpenChange }: CreateUserModalProps) {
  const [formData, setFormData] = useState(initialFormData);

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Mutation para criar usuário
  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      return apiRequest('/api/users', 'POST', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/users'] });
      toast({
        title: "Usuário criado",
        description: "Novo usuário foi criado com sucesso.",
      });
      // Reset form e fecha modal
      setFormData(initialFormData);
      onOpenChange(false);
    },
    onError: (error) => {
      toast({
        title: "Erro ao criar usuário",
        description: error instanceof Error ? error.message : "Não foi possível criar o usuário.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validações básicas
    if (!formData.name.trim()) {
      toast({
        title: "Nome obrigatório",
        description: "O nome do usuário é obrigatório.",
        variant: "destructive",
      });
      return;
    }

    if (!formData.email.trim()) {
      toast({
        title: "Email obrigatório",
        description: "O email do usuário é obrigatório.",
        variant: "destructive",
      });
      return;
    }

    if (!formData.email.includes('@') || !formData.email.includes('.')) {
      toast({
        title: "Email inválido",
        description: "Digite um email válido (ex: usuario@exemplo.com).",
        variant: "destructive",
      });
      return;
    }

    // Validação de nome mínimo
    if (formData.name.trim().length < 2) {
      toast({
        title: "Nome muito curto",
        description: "O nome deve ter pelo menos 2 caracteres.",
        variant: "destructive",
      });
      return;
    }

    createMutation.mutate(formData);
  };

  const handleInputChange = (field: keyof typeof formData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleCancel = () => {
    setFormData(initialFormData);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-gray-800 border-gray-700 text-white sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Criar Novo Usuário</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Nome */}
          <div className="space-y-2">
            <Label htmlFor="create-name">Nome *</Label>
            <Input
              id="create-name"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="Nome completo do usuário"
              className="bg-gray-900 border-gray-600 text-white"
              required
            />
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="create-email">Email *</Label>
            <Input
              id="create-email"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              placeholder="email@exemplo.com"
              className="bg-gray-900 border-gray-600 text-white"
              required
            />
          </div>

          {/* Plano */}
          <div className="space-y-2">
            <Label>Plano Inicial</Label>
            <Select 
              value={formData.planType} 
              onValueChange={(value) => handleInputChange('planType', value as PlanType)}
            >
              <SelectTrigger className="bg-gray-900 border-gray-600 text-white">
                <SelectValue placeholder="Selecione o plano" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-600">
                <SelectItem value="basico">Básico (R$ 29,90)</SelectItem>
                <SelectItem value="intermediario">Intermediário (R$ 59,90)</SelectItem>
                <SelectItem value="completo">Completo (R$ 99,90)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Role */}
          <div className="space-y-2">
            <Label>Função</Label>
            <Select 
              value={formData.userRole} 
              onValueChange={(value) => handleInputChange('userRole', value)}
            >
              <SelectTrigger className="bg-gray-900 border-gray-600 text-white">
                <SelectValue placeholder="Selecione a função" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-600">
                <SelectItem value="user">Usuário</SelectItem>
                <SelectItem value="admin">Administrador</SelectItem>
                <SelectItem value="super_admin">Super Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Status Ativo */}
          <div className="flex items-center space-x-2">
            <Switch
              id="create-isActive"
              checked={formData.isActive}
              onCheckedChange={(checked) => handleInputChange('isActive', checked)}
            />
            <Label htmlFor="create-isActive">Conta ativa</Label>
          </div>

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={createMutation.isPending}
              className="bg-gray-700 border-gray-600 text-white hover:bg-gray-600"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={createMutation.isPending}
              className="bg-roulette-green hover:bg-green-600 text-white"
            >
              {createMutation.isPending ? 'Criando...' : 'Criar Usuário'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}