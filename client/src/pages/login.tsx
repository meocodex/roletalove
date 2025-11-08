import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Eye, EyeOff, Mail, Lock, LogIn } from 'lucide-react';
import { Link, useLocation } from 'wouter';

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const { login } = useAuth();
  const { toast } = useToast();
  const [, navigate] = useLocation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Erro no login');
      }

      // Login bem-sucedido
      login(data.user, data.token);
      
      toast({
        title: "Login realizado com sucesso!",
        description: `Bem-vindo, ${data.user.name}!`,
      });
      
      // Redirecionar para dashboard após login
      setTimeout(() => navigate('/dashboard'), 1000);

    } catch (error: any) {
      toast({
        title: "Erro no login",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-dashboard-dark via-gray-900 to-black flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="shadow-2xl border-gray-700 bg-gray-800/50 backdrop-blur-sm">
          <CardHeader className="text-center pb-8">
            <div className="w-16 h-16 mx-auto mb-4 bg-roulette-green rounded-full flex items-center justify-center">
              <LogIn className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold text-white">
              Entrar na Conta
            </CardTitle>
            <CardDescription className="text-gray-300">
              Acesse sua conta RouletteAI
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-300">
                  Email
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="seu@email.com"
                    value={formData.email}
                    onChange={handleChange}
                    className="pl-10 bg-gray-700/50 border-gray-600 text-white placeholder-gray-400 focus:border-roulette-green"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-gray-300">
                  Senha
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Sua senha"
                    value={formData.password}
                    onChange={handleChange}
                    className="pl-10 pr-10 bg-gray-700/50 border-gray-600 text-white placeholder-gray-400 focus:border-roulette-green"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 h-auto text-gray-400 hover:text-gray-200"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </Button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-roulette-green hover:bg-roulette-green/90 text-white font-semibold py-3"
                disabled={loading}
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                ) : (
                  <LogIn className="w-4 h-4 mr-2" />
                )}
                {loading ? 'Entrando...' : 'Entrar'}
              </Button>
            </form>

            <div className="mt-4 text-center">
              <Link href="/forgot-password">
                <span className="text-sm text-gray-400 hover:text-roulette-green cursor-pointer">
                  Esqueceu sua senha?
                </span>
              </Link>
            </div>

            <div className="mt-6 text-center">
              <p className="text-gray-400">
                Não tem uma conta?{' '}
                <Link href="/register">
                  <span className="text-roulette-green hover:text-green-400 font-medium cursor-pointer">
                    Criar conta
                  </span>
                </Link>
              </p>
            </div>

            <div className="mt-4 text-center">
              <Link href="/">
                <span className="text-gray-500 hover:text-gray-300 text-sm cursor-pointer">
                  ← Voltar ao início
                </span>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}