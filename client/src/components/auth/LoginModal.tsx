import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Eye, EyeOff, Mail, Lock, User } from 'lucide-react';
import { Link } from 'wouter';

interface LoginModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function LoginModal({ open, onOpenChange }: LoginModalProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });

  const { login } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Simulação de autenticação - em produção seria uma chamada real para API
      await new Promise(resolve => setTimeout(resolve, 1000));

      if (isLogin) {
        // Login simulation
        if (formData.email && formData.password) {
          const userData = {
            id: 'user-001',
            email: formData.email,
            name: formData.name || 'Usuário',
            planType: 'basico' as const,
            userRole: 'user' as const
          };
          
          login(userData);
          
          toast({
            title: "Login realizado com sucesso!",
            description: "Bem-vindo ao sistema de análise de roleta.",
          });
          
          onOpenChange(false);
        } else {
          throw new Error('Email e senha são obrigatórios');
        }
      } else {
        // Register simulation
        if (formData.name && formData.email && formData.password) {
          const userData = {
            id: 'user-' + Date.now(),
            email: formData.email,
            name: formData.name,
            planType: 'basico' as const,
            userRole: 'user' as const
          };
          
          login(userData);
          
          toast({
            title: "Conta criada com sucesso!",
            description: "Sua conta foi criada e você já está logado.",
          });
          
          onOpenChange(false);
        } else {
          throw new Error('Todos os campos são obrigatórios');
        }
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Falha na autenticação",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setFormData({ name: '', email: '', password: '' });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isLogin ? 'Fazer Login' : 'Criar Conta'}
          </DialogTitle>
          <DialogDescription>
            {isLogin 
              ? 'Entre com suas credenciais para acessar o sistema'
              : 'Crie sua conta para começar a usar o sistema de análise'
            }
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div className="space-y-2">
              <Label htmlFor="name">Nome completo</Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="name"
                  type="text"
                  placeholder="Seu nome completo"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="pl-10"
                  required={!isLogin}
                />
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className="pl-10"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Senha</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Sua senha"
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                className="pl-10 pr-10"
                required
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-2 top-2 h-7 w-7 p-0"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4 text-gray-400" />
                ) : (
                  <Eye className="h-4 w-4 text-gray-400" />
                )}
              </Button>
            </div>
          </div>

          <Button 
            type="submit" 
            className="w-full bg-roulette-green hover:bg-roulette-green/90"
            disabled={loading}
          >
            {loading ? 'Processando...' : isLogin ? 'Fazer Login' : 'Criar Conta'}
          </Button>
        </form>

        <div className="text-center space-y-4">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">ou</span>
            </div>
          </div>

          <Button
            type="button"
            variant="ghost"
            onClick={toggleMode}
            className="text-roulette-green hover:text-roulette-green/90"
          >
            {isLogin 
              ? 'Não tem conta? Criar conta'
              : 'Já tem conta? Fazer login'
            }
          </Button>

          <div className="text-xs text-muted-foreground">
            {isLogin ? (
              <Link href="/plans">
                <Button variant="link" className="p-0 h-auto text-xs">
                  Ver planos disponíveis
                </Button>
              </Link>
            ) : (
              <p>
                Ao criar uma conta, você concorda com nossos{' '}
                <Button variant="link" className="p-0 h-auto text-xs">
                  Termos de Uso
                </Button>
              </p>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}