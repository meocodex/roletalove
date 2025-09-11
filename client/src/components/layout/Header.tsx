import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/hooks/useAuth';
import { Link, useLocation } from 'wouter';
import {
  User,
  Settings,
  LogOut,
  BarChart3,
  Menu,
  X,
  Home,
  Crown,
  Activity,
  LogIn
} from 'lucide-react';

interface HeaderProps {
  transparent?: boolean;
}

export function Header({ transparent = false }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const [location] = useLocation();

  const navigation = [
    { name: 'Início', href: '/', icon: <Home className="w-4 h-4" /> },
    { name: 'Planos', href: '/plans', icon: <Crown className="w-4 h-4" /> },
  ];

  const userNavigation = [
    { name: 'Dashboard', href: '/dashboard', icon: <User className="w-4 h-4" /> },
    { name: 'Sistema', href: '/app', icon: <BarChart3 className="w-4 h-4" /> },
  ];

  const handleLogout = () => {
    logout();
    setMobileMenuOpen(false);
  };

  return (
    <header className={`sticky top-0 z-50 ${transparent ? 'bg-transparent' : 'bg-gray-900'} ${!transparent && 'shadow-sm border-b border-gray-700'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/">
              <div className="flex items-center space-x-2 cursor-pointer">
                <div className="w-8 h-8 bg-roulette-green rounded-full flex items-center justify-center">
                  <BarChart3 className="w-5 h-5 text-white" />
                </div>
                <span className={`text-xl font-bold ${transparent ? 'text-white' : 'text-white'}`}>
                  RouletteAI
                </span>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navigation.map((item) => (
              <Link key={item.name} href={item.href}>
                <Button 
                  variant="ghost" 
                  className={`${transparent ? 'text-white hover:text-gray-200 hover:bg-white/10' : 'text-gray-300 hover:text-white hover:bg-gray-800'} ${location === item.href ? 'bg-gray-800' : ''}`}
                >
                  {item.icon}
                  <span className="ml-2">{item.name}</span>
                </Button>
              </Link>
            ))}

            {user && userNavigation.map((item) => (
              <Link key={item.name} href={item.href}>
                <Button 
                  variant="ghost" 
                  className={`${transparent ? 'text-white hover:text-gray-200 hover:bg-white/10' : 'text-gray-300 hover:text-white hover:bg-gray-800'} ${location === item.href ? 'bg-gray-800' : ''}`}
                >
                  {item.icon}
                  <span className="ml-2">{item.name}</span>
                </Button>
              </Link>
            ))}
          </div>

          {/* User Menu or Auth Buttons */}
          <div className="flex items-center space-x-4">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-roulette-green text-white">
                        {user.name?.charAt(0) || 'U'}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end">
                  <div className="flex items-center justify-start gap-2 p-2">
                    <div className="flex flex-col space-y-1 leading-none">
                      <p className="font-medium">{user.name}</p>
                      <p className="w-[200px] truncate text-sm text-muted-foreground">
                        {user.email}
                      </p>
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  <Link href="/dashboard">
                    <DropdownMenuItem>
                      <User className="mr-2 h-4 w-4" />
                      Dashboard
                    </DropdownMenuItem>
                  </Link>
                  <Link href="/app">
                    <DropdownMenuItem>
                      <Activity className="mr-2 h-4 w-4" />
                      Sistema de Análise
                    </DropdownMenuItem>
                  </Link>
                  <DropdownMenuItem disabled>
                    <Settings className="mr-2 h-4 w-4" />
                    Configurações
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Sair
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center space-x-2">
                <Link href="/login">
                  <Button 
                    variant="ghost"
                    className={transparent ? 'text-white hover:bg-white/10' : 'text-gray-300 hover:text-white hover:bg-gray-800'}
                  >
                    Entrar
                  </Button>
                </Link>
                <Link href="/register">
                  <Button 
                    variant={transparent ? "outline" : "default"}
                    className={transparent ? 'border-white text-white hover:bg-white hover:text-gray-900' : 'bg-roulette-green hover:bg-roulette-green/90'}
                  >
                    Começar Agora
                  </Button>
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <div className="md:hidden">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className={transparent ? 'text-white hover:text-gray-200' : ''}
              >
                {mobileMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
              {navigation.map((item) => (
                <Link key={item.name} href={item.href}>
                  <Button 
                    variant="ghost" 
                    className={`w-full justify-start ${location === item.href ? 'bg-gray-100 dark:bg-gray-800' : ''}`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {item.icon}
                    <span className="ml-2">{item.name}</span>
                  </Button>
                </Link>
              ))}

              {user ? (
                <>
                  {userNavigation.map((item) => (
                    <Link key={item.name} href={item.href}>
                      <Button 
                        variant="ghost" 
                        className={`w-full justify-start ${location === item.href ? 'bg-gray-100 dark:bg-gray-800' : ''}`}
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        {item.icon}
                        <span className="ml-2">{item.name}</span>
                      </Button>
                    </Link>
                  ))}
                  
                  <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-4">
                    <div className="flex items-center px-3 py-2">
                      <Avatar className="h-8 w-8 mr-3">
                        <AvatarFallback className="bg-roulette-green text-white">
                          {user.name?.charAt(0) || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{user.name}</p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">{user.email}</p>
                      </div>
                    </div>
                    
                    <Button 
                      variant="ghost" 
                      className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
                      onClick={handleLogout}
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Sair
                    </Button>
                  </div>
                </>
              ) : (
                <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-4 space-y-2">
                  <Link href="/login">
                    <Button variant="ghost" className="w-full justify-start">
                      <LogIn className="w-4 h-4 mr-2" />
                      Entrar
                    </Button>
                  </Link>
                  <Link href="/register">
                    <Button className="w-full bg-roulette-green hover:bg-roulette-green/90">
                      Começar Agora
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}