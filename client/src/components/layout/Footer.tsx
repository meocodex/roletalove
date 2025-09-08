import { Button } from '@/components/ui/button';
import { Link } from 'wouter';
import { BarChart3, Mail, Phone, MapPin } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo and Description */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-roulette-green rounded-full flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold">RouletteAI</span>
            </div>
            <p className="text-gray-400 mb-6 max-w-md">
              Sistema avançado de análise de padrões de roleta com inteligência artificial. 
              Maximize seus resultados com análises precisas e estratégias automáticas.
            </p>
            <div className="flex space-x-4">
              <Button variant="outline" size="sm" className="border-gray-600 text-gray-400 hover:text-white hover:border-gray-400">
                <Mail className="w-4 h-4 mr-2" />
                Contato
              </Button>
              <Button variant="outline" size="sm" className="border-gray-600 text-gray-400 hover:text-white hover:border-gray-400">
                <Phone className="w-4 h-4 mr-2" />
                Suporte
              </Button>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold mb-4">Links Rápidos</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/">
                  <Button variant="link" className="text-gray-400 hover:text-white p-0 h-auto">
                    Início
                  </Button>
                </Link>
              </li>
              <li>
                <Link href="/plans">
                  <Button variant="link" className="text-gray-400 hover:text-white p-0 h-auto">
                    Planos e Preços
                  </Button>
                </Link>
              </li>
              <li>
                <Button variant="link" className="text-gray-400 hover:text-white p-0 h-auto" disabled>
                  Como Funciona
                </Button>
              </li>
              <li>
                <Button variant="link" className="text-gray-400 hover:text-white p-0 h-auto" disabled>
                  Depoimentos
                </Button>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="font-semibold mb-4">Recursos</h3>
            <ul className="space-y-2">
              <li>
                <Button variant="link" className="text-gray-400 hover:text-white p-0 h-auto" disabled>
                  Documentação
                </Button>
              </li>
              <li>
                <Button variant="link" className="text-gray-400 hover:text-white p-0 h-auto" disabled>
                  Tutoriais
                </Button>
              </li>
              <li>
                <Button variant="link" className="text-gray-400 hover:text-white p-0 h-auto" disabled>
                  Blog
                </Button>
              </li>
              <li>
                <Button variant="link" className="text-gray-400 hover:text-white p-0 h-auto" disabled>
                  FAQ
                </Button>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-800 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-sm text-gray-400 mb-4 md:mb-0">
              © {new Date().getFullYear()} RouletteAI. Todos os direitos reservados.
            </div>
            <div className="flex space-x-6 text-sm">
              <Button variant="link" className="text-gray-400 hover:text-white p-0 h-auto" disabled>
                Política de Privacidade
              </Button>
              <Button variant="link" className="text-gray-400 hover:text-white p-0 h-auto" disabled>
                Termos de Uso
              </Button>
              <Button variant="link" className="text-gray-400 hover:text-white p-0 h-auto" disabled>
                Cookies
              </Button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}