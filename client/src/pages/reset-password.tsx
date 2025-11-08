import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Lock, Eye, EyeOff, Loader2, CheckCircle2, AlertTriangle } from 'lucide-react';
import { Link, useLocation } from 'wouter';

export function ResetPasswordPage() {
  const [, setLocation] = useLocation();
  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Extrair token da URL
    const params = new URLSearchParams(window.location.search);
    const tokenFromUrl = params.get('token');

    if (!tokenFromUrl) {
      setError('Token de reset não encontrado na URL');
    } else {
      setToken(tokenFromUrl);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validações
    if (newPassword.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('As senhas não coincidem');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          newPassword
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Erro ao resetar senha');
      }

      setSuccess(true);

      // Redirecionar para login após 3 segundos
      setTimeout(() => {
        setLocation('/login');
      }, 3000);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setIsLoading(false);
    }
  };

  if (!token && !success) {
    return (
      <div className="min-h-screen bg-dashboard-dark flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-gray-800 border-gray-700">
          <CardContent className="pt-6">
            <Alert variant="destructive" className="bg-red-500/10 border-red-500/20">
              <AlertTriangle className="h-4 w-4 text-red-500" />
              <AlertDescription className="text-red-400">
                <strong>Link inválido</strong>
                <br />
                Este link de reset de senha é inválido ou expirou.
              </AlertDescription>
            </Alert>

            <Link href="/forgot-password">
              <Button className="w-full mt-4 bg-roulette-green hover:bg-green-600">
                Solicitar novo link
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dashboard-dark flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-gray-800 border-gray-700">
        <CardHeader className="space-y-1">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-roulette-green/20 rounded-full">
              <Lock className="w-6 h-6 text-roulette-green" />
            </div>
            <div>
              <CardTitle className="text-2xl text-white">Nova Senha</CardTitle>
              <CardDescription className="text-gray-400">
                Digite sua nova senha para acessar sua conta
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {success ? (
            <div className="space-y-4">
              <Alert className="bg-green-500/10 border-green-500/20">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <AlertDescription className="text-green-400">
                  <strong>Senha alterada com sucesso!</strong>
                  <br />
                  Redirecionando para o login...
                </AlertDescription>
              </Alert>

              <Link href="/login">
                <Button className="w-full bg-gray-700 hover:bg-gray-600">
                  Ir para o Login
                </Button>
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Alert variant="destructive" className="bg-red-500/10 border-red-500/20">
                  <AlertDescription className="text-red-400">{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <label htmlFor="newPassword" className="text-sm font-medium text-gray-300">
                  Nova Senha
                </label>
                <div className="relative">
                  <Input
                    id="newPassword"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Mínimo 6 caracteres"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    disabled={isLoading}
                    className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-400 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="confirmPassword" className="text-sm font-medium text-gray-300">
                  Confirmar Senha
                </label>
                <Input
                  id="confirmPassword"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Digite novamente"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  disabled={isLoading}
                  className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-400"
                />
              </div>

              {newPassword && (
                <div className="space-y-1 text-xs">
                  <p className={newPassword.length >= 6 ? 'text-green-400' : 'text-gray-400'}>
                    {newPassword.length >= 6 ? '✓' : '○'} Mínimo 6 caracteres
                  </p>
                  <p className={confirmPassword && newPassword === confirmPassword ? 'text-green-400' : 'text-gray-400'}>
                    {confirmPassword && newPassword === confirmPassword ? '✓' : '○'} Senhas coincidem
                  </p>
                </div>
              )}

              <Button
                type="submit"
                className="w-full bg-roulette-green hover:bg-green-600"
                disabled={isLoading || !token}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4 mr-2" />
                    Redefinir Senha
                  </>
                )}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
