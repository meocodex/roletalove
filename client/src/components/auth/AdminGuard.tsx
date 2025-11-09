import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShieldAlert, Home } from "lucide-react";
import { Link } from "wouter";

interface AdminGuardProps {
  children: React.ReactNode;
  requiredRole?: 'admin' | 'super_admin';
  feature?: string;
  fallback?: React.ReactNode;
}

function AccessDenied({ requiredRole }: { requiredRole?: string }) {
  const { user } = useAuth();
  
  return (
    <div className="min-h-screen bg-dashboard-dark flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-gray-800 border-gray-700">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-red-500/20 rounded-full mx-auto mb-4 flex items-center justify-center">
            <ShieldAlert className="w-8 h-8 text-red-400" />
          </div>
          <CardTitle className="text-xl text-white">
            Acesso Negado
          </CardTitle>
        </CardHeader>
        
        <CardContent className="text-center space-y-4">
          <p className="text-gray-400">
            Você não tem permissões administrativas para acessar esta área.
          </p>
          
          <div className="text-sm text-gray-500 bg-gray-900 p-3 rounded">
            <p><strong>Seu perfil:</strong> {user?.user_role || 'Não identificado'}</p>
            {requiredRole && (
              <p><strong>Necessário:</strong> {requiredRole}</p>
            )}
          </div>
          
          <Link href="/">
            <Button className="w-full bg-roulette-green hover:bg-green-600">
              <Home className="w-4 h-4 mr-2" />
              Voltar ao Dashboard
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}

export function AdminGuard({ 
  children, 
  requiredRole = 'admin', 
  feature,
  fallback 
}: AdminGuardProps) {
  const { user, isAdmin, isSuperAdmin, hasAdminFeature, isLoading } = useAuth();
  
  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-dashboard-dark flex items-center justify-center">
        <div className="text-roulette-green">Verificando autenticação...</div>
      </div>
    );
  }
  
  // If no user, redirect to login instead of showing access denied
  if (!user) {
    // Use dynamic import to avoid circular dependency with Router
    window.location.href = '/login?redirect=/admin';
    return null;
  }
  
  // Check if user is active
  if (user.is_active === false) {
    return fallback || <AccessDenied requiredRole={requiredRole} />;
  }
  
  // Check role-based access
  if (requiredRole === 'super_admin' && !isSuperAdmin()) {
    return fallback || <AccessDenied requiredRole={requiredRole} />;
  }
  
  if (requiredRole === 'admin' && !isAdmin()) {
    return fallback || <AccessDenied requiredRole={requiredRole} />;
  }
  
  // Check specific feature access
  if (feature && !hasAdminFeature(feature)) {
    return fallback || <AccessDenied requiredRole={requiredRole} />;
  }
  
  return <>{children}</>;
}

// Helper component for inline admin content
export function AdminOnly({ children, role = 'admin' }: { 
  children: React.ReactNode; 
  role?: 'admin' | 'super_admin' 
}) {
  const { isAdmin, isSuperAdmin } = useAuth();
  
  if (role === 'super_admin' && !isSuperAdmin()) {
    return null;
  }
  
  if (role === 'admin' && !isAdmin()) {
    return null;
  }
  
  return <>{children}</>;
}