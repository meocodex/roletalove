import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Eye, EyeOff, Mail, Lock, User, UserPlus, Check, Phone } from 'lucide-react';
import { Link, useLocation } from 'wouter';
import { PlanType } from '@shared/schema';

const PLANS = {
  basico: {
    name: 'Básico',
    price: 29.90,
    features: ['Mesa de roleta', 'Entrada manual', 'Histórico básico', 'Estatísticas básicas']
  },
  intermediario: {
    name: 'Intermediário', 
    price: 59.90,
    features: ['Tudo do Básico', 'Análise de padrões', 'ML Analyzer', '15+ estratégias']
  },
  completo: {
    name: 'Completo',
    price: 99.90, 
    features: ['Tudo do Intermediário', 'IA Externa', 'Dashboard customizável', 'Histórico ilimitado']
  }
};

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<PlanType>('intermediario');
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const { login } = useAuth();
  const { toast } = useToast();
  const [, navigate] = useLocation();

  // Máscaras para campos brasileiros
  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 10) {
      return numbers.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
    } else {
      return numbers.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    }
  };

  // Extrair plano da URL se fornecido
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const planParam = urlParams.get('plan') as PlanType;
    if (planParam && PLANS[planParam]) {
      setSelectedPlan(planParam);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validações client-side
      if (formData.password !== formData.confirmPassword) {
        throw new Error('As senhas não coincidem');
      }

      if (formData.password.length < 6) {
        throw new Error('A senha deve ter pelo menos 6 caracteres');
      }

      if (!formData.name || !formData.email) {
        throw new Error('Nome e email são obrigatórios');
      }

      // Chamada para API real
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          phone: formData.phone,
          email: formData.email,
          password: formData.password,
          planType: selectedPlan,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Erro no cadastro');
      }

      // Registro bem-sucedido
      login(data.user, data.token);
      
      toast({
        title: "Conta criada com sucesso!",
        description: `Bem-vindo ao plano ${PLANS[selectedPlan].name}!`,
      });
      
      // Na implementação real da Fase 3, redirecionaria para checkout de pagamento
      // Por ora, vai direto para dashboard
      setTimeout(() => navigate('/dashboard'), 1000);
      
    } catch (error: any) {
      toast({
        title: "Erro no cadastro",
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
    <div className="min-h-screen bg-gradient-to-br from-dashboard-dark via-gray-900 to-black p-4">
      <div className="max-w-4xl mx-auto py-8">
        
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            Criar Conta RouletteAI
          </h1>
          <p className="text-gray-300">
            Escolha seu plano e comece a dominar os padrões da roleta
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          
          {/* Seleção de Planos */}
          <div className="md:col-span-2">
            <h2 className="text-xl font-semibold text-white mb-4">
              Escolha seu plano
            </h2>
            
            <div className="grid gap-4">
              {(Object.entries(PLANS) as [PlanType, typeof PLANS[PlanType]][]).map(([planId, plan]) => (
                <Card 
                  key={planId}
                  className={`cursor-pointer transition-all duration-200 border-2 ${
                    selectedPlan === planId 
                      ? 'border-roulette-green bg-green-900/20' 
                      : 'border-gray-600 hover:border-gray-500 bg-gray-800/50'
                  }`}
                  onClick={() => setSelectedPlan(planId)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <h3 className="font-semibold text-white">
                            {plan.name}
                          </h3>
                          {planId === 'intermediario' && (
                            <Badge className="bg-roulette-green text-white">
                              Mais Popular
                            </Badge>
                          )}
                        </div>
                        <p className="text-2xl font-bold text-roulette-green">
                          R$ {plan.price.toFixed(2)}<span className="text-sm font-normal text-gray-400">/mês</span>
                        </p>
                        <div className="mt-2 flex flex-wrap gap-1">
                          {plan.features.map((feature, index) => (
                            <div key={index} className="flex items-center gap-1 text-sm text-gray-300">
                              <Check className="w-3 h-3 text-roulette-green" />
                              {feature}
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className={`w-4 h-4 rounded-full border-2 ${
                        selectedPlan === planId 
                          ? 'bg-roulette-green border-roulette-green' 
                          : 'border-gray-400'
                      }`}>
                        {selectedPlan === planId && (
                          <div className="w-full h-full rounded-full bg-white scale-50" />
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Formulário de Cadastro */}
          <div>
            <Card className="shadow-2xl border-gray-700 bg-gray-800/50 backdrop-blur-sm">
              <CardHeader>
                <div className="w-12 h-12 mx-auto mb-4 bg-roulette-green rounded-full flex items-center justify-center">
                  <UserPlus className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-xl font-bold text-white text-center">
                  Dados da Conta
                </CardTitle>
                <CardDescription className="text-gray-300 text-center">
                  Preencha suas informações
                </CardDescription>
              </CardHeader>

              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-gray-300">Nome Completo</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        id="name"
                        name="name"
                        type="text"
                        placeholder="Seu nome completo"
                        value={formData.name}
                        onChange={handleChange}
                        className="pl-10 bg-gray-700/50 border-gray-600 text-white placeholder-gray-400 focus:border-roulette-green"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-gray-300">Telefone</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        id="phone"
                        name="phone"
                        type="tel"
                        placeholder="(11) 99999-9999"
                        value={formData.phone}
                        onChange={(e) => {
                          const formatted = formatPhone(e.target.value);
                          setFormData(prev => ({ ...prev, phone: formatted }));
                        }}
                        className="pl-10 bg-gray-700/50 border-gray-600 text-white placeholder-gray-400 focus:border-roulette-green"
                        maxLength={15}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-gray-300">Email</Label>
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
                    <Label htmlFor="password" className="text-gray-300">Senha</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        id="password"
                        name="password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Mínimo 6 caracteres"
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

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword" className="text-gray-300">Confirmar Senha</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        id="confirmPassword"
                        name="confirmPassword"
                        type="password"
                        placeholder="Repita a senha"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        className="pl-10 bg-gray-700/50 border-gray-600 text-white placeholder-gray-400 focus:border-roulette-green"
                        required
                      />
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
                      <UserPlus className="w-4 h-4 mr-2" />
                    )}
                    {loading ? 'Criando conta...' : `Criar conta - ${PLANS[selectedPlan].name}`}
                  </Button>

                </form>

                <div className="mt-4 text-center">
                  <p className="text-gray-400 text-sm">
                    Já tem uma conta?{' '}
                    <Link href="/login">
                      <span className="text-roulette-green hover:text-green-400 font-medium cursor-pointer">
                        Fazer login
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
      </div>
    </div>
  );
}