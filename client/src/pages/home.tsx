import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Link } from 'wouter';
import { useAuth } from '@/hooks/useAuth';
import { 
  BarChart3, 
  TrendingUp, 
  Target, 
  Shield, 
  Zap, 
  Crown,
  Star,
  ArrowRight,
  CheckCircle,
  Users,
  Award,
  DollarSign,
  Activity
} from 'lucide-react';

// Hero Section
function HeroSection() {
  const { user } = useAuth();

  return (
    <section className="relative bg-gradient-to-br from-dashboard-dark via-gray-900 to-black text-white py-20 overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-20 w-72 h-72 bg-roulette-green rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-roulette-red rounded-full blur-3xl"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 text-center">
        <Badge className="bg-roulette-green/20 text-roulette-green border-roulette-green/30 mb-6 text-sm">
          Sistema de Análise Profissional
        </Badge>

        <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-white via-gray-100 to-gray-300 bg-clip-text text-transparent">
          Domine os Padrões
          <br />da <span className="text-roulette-green">Roleta</span>
        </h1>

        <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto">
          Sistema avançado de análise de padrões em tempo real. Identifique tendências, 
          gere estratégias automáticas e maximize seus resultados com inteligência artificial.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          {user ? (
            <Link href="/app">
              <Button size="lg" className="bg-roulette-green hover:bg-roulette-green/90 text-white px-8 py-4 text-lg">
                <Activity className="w-5 h-5 mr-2" />
                Ir para o Sistema
              </Button>
            </Link>
          ) : (
            <>
              <Link href="/plans">
                <Button size="lg" className="bg-roulette-green hover:bg-roulette-green/90 text-white px-8 py-4 text-lg">
                  <Zap className="w-5 h-5 mr-2" />
                  Começar Agora
                </Button>
              </Link>
              <Button 
                size="lg" 
                variant="outline" 
                className="border-gray-600 text-gray-300 hover:bg-gray-800 px-8 py-4 text-lg"
                onClick={() => {
                  document.getElementById('demo')?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                Ver Demonstração
              </Button>
            </>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16 max-w-3xl mx-auto">
          <div className="text-center">
            <div className="text-3xl font-bold text-roulette-green mb-2">98.7%</div>
            <div className="text-gray-400">Precisão na Análise</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-roulette-green mb-2">15+</div>
            <div className="text-gray-400">Estratégias Diferentes</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-roulette-green mb-2">24/7</div>
            <div className="text-gray-400">Análise Contínua</div>
          </div>
        </div>
      </div>
    </section>
  );
}

// Features Section
function FeaturesSection() {
  const features = [
    {
      icon: <BarChart3 className="w-8 h-8" />,
      title: "Análise em Tempo Real",
      description: "Acompanhe padrões de cores, dúzias e sequências instantaneamente com algoritmos avançados.",
      gradient: "from-blue-500 to-cyan-500"
    },
    {
      icon: <TrendingUp className="w-8 h-8" />,
      title: "Estratégias Automáticas",
      description: "Geração inteligente de estratégias baseadas no histórico e padrões identificados.",
      gradient: "from-emerald-500 to-green-500"
    },
    {
      icon: <Target className="w-8 h-8" />,
      title: "Alertas Personalizados",
      description: "Receba notificações quando padrões específicos forem detectados no jogo.",
      gradient: "from-purple-500 to-pink-500"
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: "Interface Profissional",
      description: "Mesa visual idêntica à roleta europeia com controles otimizados para análise.",
      gradient: "from-orange-500 to-red-500"
    }
  ];

  return (
    <section id="features" className="py-20 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-16">
          <Badge className="mb-4">Funcionalidades</Badge>
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Tecnologia de Ponta para Análise
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Ferramentas profissionais desenvolvidas especificamente para maximizar 
            seus resultados na roleta através de análise científica.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {features.map((feature, index) => (
            <Card key={index} className="border-0 bg-white dark:bg-gray-800 shadow-xl hover:shadow-2xl transition-all duration-300">
              <CardContent className="p-8">
                <div className={`w-16 h-16 rounded-lg bg-gradient-to-r ${feature.gradient} flex items-center justify-center text-white mb-6`}>
                  {feature.icon}
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  {feature.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-lg leading-relaxed">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

// Demo Section  
function DemoSection() {
  return (
    <section id="demo" className="py-20 bg-gradient-to-br from-gray-900 via-dashboard-dark to-black text-white">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-16">
          <Badge className="bg-roulette-green/20 text-roulette-green border-roulette-green/30 mb-4">
            Demonstração
          </Badge>
          <h2 className="text-4xl font-bold mb-4">
            Veja o Sistema em Ação
          </h2>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Interface intuitiva e poderosa, desenvolvida para profissionais que levam a sério a análise de padrões.
          </p>
        </div>

        <div className="bg-gray-800/50 rounded-2xl p-8 backdrop-blur-sm border border-gray-700">
          <div className="aspect-video bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl flex items-center justify-center border border-gray-600">
            <div className="text-center">
              <Activity className="w-16 h-16 text-roulette-green mx-auto mb-4" />
              <h3 className="text-2xl font-bold mb-2">Sistema de Análise Avançada</h3>
              <p className="text-gray-400 mb-6">Mesa interativa com análise em tempo real</p>
              <Link href="/plans">
                <Button className="bg-roulette-green hover:bg-roulette-green/90">
                  <Zap className="w-4 h-4 mr-2" />
                  Experimentar Sistema
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// Pricing Section
function PricingSection() {
  const plans = [
    {
      name: "Básico",
      price: "29,90",
      period: "mês",
      icon: <Zap className="w-6 h-6" />,
      gradient: "from-blue-500 to-blue-600",
      features: [
        "Análise de padrões básica",
        "Mesa de roleta interativa", 
        "Histórico de 100 resultados",
        "Estratégias automáticas",
        "Suporte por email"
      ],
      recommended: false
    },
    {
      name: "Intermediário", 
      price: "59,90",
      period: "mês",
      icon: <Target className="w-6 h-6" />,
      gradient: "from-purple-500 to-purple-600",
      features: [
        "Análise avançada de padrões",
        "Histórico ilimitado",
        "Alertas personalizados",
        "15+ tipos de estratégias",
        "Relatórios detalhados",
        "Suporte prioritário"
      ],
      recommended: true
    },
    {
      name: "Completo",
      price: "99,90", 
      period: "mês",
      icon: <Crown className="w-6 h-6" />,
      gradient: "from-yellow-500 to-yellow-600",
      features: [
        "Análise com IA avançada",
        "Múltiplas mesas simultâneas",
        "Estratégias personalizadas",
        "API para integração",
        "Relatórios personalizados",
        "Suporte 24/7 dedicado",
        "Análise preditiva"
      ],
      recommended: false
    }
  ];

  return (
    <section id="pricing" className="py-20 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-16">
          <Badge className="mb-4">Planos</Badge>
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Escolha Seu Plano
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Investimento que se paga com os primeiros resultados
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan, index) => (
            <Card key={index} className={`relative ${plan.recommended ? 'ring-2 ring-roulette-green shadow-2xl scale-105' : 'shadow-lg'} hover:shadow-xl transition-all duration-300`}>
              {plan.recommended && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-roulette-green text-white">Mais Popular</Badge>
                </div>
              )}
              
              <CardHeader className="text-center pb-8">
                <div className={`w-16 h-16 mx-auto rounded-full bg-gradient-to-r ${plan.gradient} flex items-center justify-center text-white mb-4`}>
                  {plan.icon}
                </div>
                <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">
                  {plan.name}
                </CardTitle>
                <div className="mt-4">
                  <span className="text-4xl font-bold text-gray-900 dark:text-white">R$ {plan.price}</span>
                  <span className="text-gray-600 dark:text-gray-300">/{plan.period}</span>
                </div>
              </CardHeader>

              <CardContent>
                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center">
                      <CheckCircle className="w-5 h-5 text-roulette-green mr-3 flex-shrink-0" />
                      <span className="text-gray-700 dark:text-gray-300">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Link href="/plans">
                  <Button 
                    className={`w-full ${plan.recommended ? 'bg-roulette-green hover:bg-roulette-green/90' : 'bg-gray-800 hover:bg-gray-700'} text-white`}
                    size="lg"
                  >
                    Escolher {plan.name}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

// Testimonials Section
function TestimonialsSection() {
  const testimonials = [
    {
      name: "Carlos Silva",
      role: "Jogador Profissional",
      avatar: "CS",
      content: "Com este sistema consegui identificar padrões que nunca havia percebido antes. Meus resultados melhoraram significativamente.",
      rating: 5
    },
    {
      name: "Marina Santos", 
      role: "Analista de Dados",
      avatar: "MS",
      content: "A precisão das análises é impressionante. As estratégias automáticas economizam muito tempo e são muito eficazes.",
      rating: 5
    },
    {
      name: "Roberto Lima",
      role: "Empresário",
      avatar: "RL", 
      content: "Interface profissional e resultados consistentes. Recomendo para qualquer pessoa séria sobre análise de padrões.",
      rating: 5
    }
  ];

  return (
    <section className="py-20 bg-white dark:bg-dashboard-dark">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-16">
          <Badge className="mb-4">Depoimentos</Badge>
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            O que nossos usuários dizem
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardContent className="p-8">
                <div className="flex mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                
                <p className="text-gray-700 dark:text-gray-300 mb-6 italic text-lg leading-relaxed">
                  "{testimonial.content}"
                </p>
                
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-roulette-green rounded-full flex items-center justify-center text-white font-bold mr-4">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900 dark:text-white">{testimonial.name}</div>
                    <div className="text-gray-600 dark:text-gray-400">{testimonial.role}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

// CTA Section
function CTASection() {
  return (
    <section className="py-20 bg-gradient-to-r from-roulette-green to-green-600">
      <div className="max-w-4xl mx-auto text-center px-4">
        <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
          Comece a Dominar os Padrões Hoje
        </h2>
        <p className="text-xl text-green-100 mb-8">
          Junte-se a centenas de usuários que já estão obtendo resultados excepcionais
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/plans">
            <Button size="lg" className="bg-white text-roulette-green hover:bg-gray-100 px-8 py-4 text-lg font-semibold">
              <Crown className="w-5 h-5 mr-2" />
              Escolher Plano
            </Button>
          </Link>
          <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-roulette-green px-8 py-4 text-lg">
            Falar com Especialista
          </Button>
        </div>
      </div>
    </section>
  );
}

// Main Home Component
export default function HomePage() {
  return (
    <div className="min-h-screen">
      <HeroSection />
      <FeaturesSection />
      <DemoSection />
      <PricingSection />
      <TestimonialsSection />
      <CTASection />
    </div>
  );
}