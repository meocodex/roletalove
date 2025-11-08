import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Mail, ArrowLeft, Loader2, CheckCircle2 } from 'lucide-react';
import { Link } from 'wouter';

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/request-password-reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Erro ao solicitar reset de senha');
      }

      setSuccess(true);

      // Log link de desenvolvimento (remover em produção)
      if (data._dev_link) {
        console.log('🔗 Link de reset (DEV):', data._dev_link);
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-dashboard-dark flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-gray-800 border-gray-700">
        <CardHeader className="space-y-1">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-roulette-green/20 rounded-full">
              <Mail className="w-6 h-6 text-roulette-green" />
            </div>
            <div>
              <CardTitle className="text-2xl text-white">Esqueceu sua senha?</CardTitle>
              <CardDescription className="text-gray-400">
                Digite seu email para receber instruções de reset
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
                  <strong>Email enviado!</strong>
                  <br />
                  Verifique sua caixa de entrada e siga as instruções para resetar sua senha.
                  {process.env.NODE_ENV === 'development' && (
                    <p className="mt-2 text-xs text-gray-400">
                      (Em desenvolvimento - veja o console do navegador para o link)
                    </p>
                  )}
                </AlertDescription>
              </Alert>

              <Link href="/login">
                <Button className="w-full bg-gray-700 hover:bg-gray-600">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Voltar ao Login
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
                <label htmlFor="email" className="text-sm font-medium text-gray-300">
                  Email
                </label>
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                  className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-400"
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-roulette-green hover:bg-green-600"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  <>
                    <Mail className="w-4 h-4 mr-2" />
                    Enviar instruções
                  </>
                )}
              </Button>

              <Link href="/login">
                <Button
                  type="button"
                  variant="ghost"
                  className="w-full text-gray-400 hover:text-white hover:bg-gray-700"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Voltar ao Login
                </Button>
              </Link>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
