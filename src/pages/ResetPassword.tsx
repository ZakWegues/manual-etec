import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { GraduationCap, Loader2, Lock, CheckCircle2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { z } from 'zod';

const passwordSchema = z.object({
  password: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Senhas não coincidem',
  path: ['confirmPassword'],
});

export default function ResetPassword() {
  const navigate = useNavigate();
  const { updatePassword, session } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<{ password?: string; confirmPassword?: string }>({});

  // Check if user arrived via password reset link
  useEffect(() => {
    // If no session, the user hasn't clicked the reset link yet
    if (!session) {
      // Wait a bit for the session to be established from the URL hash
      const timer = setTimeout(() => {
        if (!session) {
          toast.error('Link de redefinição inválido ou expirado');
          navigate('/auth');
        }
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [session, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const result = passwordSchema.safeParse({ password, confirmPassword });
    if (!result.success) {
      const newErrors: { password?: string; confirmPassword?: string } = {};
      result.error.errors.forEach((err) => {
        if (err.path[0] === 'password') newErrors.password = err.message;
        if (err.path[0] === 'confirmPassword') newErrors.confirmPassword = err.message;
      });
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);
    const { error } = await updatePassword(password);
    setIsLoading(false);

    if (error) {
      toast.error('Erro ao redefinir senha: ' + error.message);
    } else {
      setIsSuccess(true);
      toast.success('Senha redefinida com sucesso!');
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-3 sm:p-4" style={{ background: 'var(--gradient-hero)' }}>
      <div className="w-full max-w-md animate-fade-in">
        <div className="flex flex-col items-center mb-6 sm:mb-8">
          <div className="flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-2xl bg-primary shadow-lg mb-3 sm:mb-4">
            <GraduationCap className="h-8 w-8 sm:h-9 sm:w-9 text-primary-foreground" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">Manual ETEC</h1>
          <p className="text-white/70 mt-1 text-sm sm:text-base">Redefinir Senha</p>
        </div>

        <Card className="shadow-xl border-0">
          <CardHeader className="space-y-1 pb-4 px-4 sm:px-6">
            <CardTitle className="text-xl sm:text-2xl text-center">Nova Senha</CardTitle>
            <CardDescription className="text-center text-sm">
              Digite sua nova senha abaixo
            </CardDescription>
          </CardHeader>
          <CardContent className="px-4 sm:px-6">
            {isSuccess ? (
              <Alert className="bg-success/10 border-success">
                <CheckCircle2 className="h-5 w-5 text-success" />
                <AlertTitle className="text-success font-semibold">Senha redefinida!</AlertTitle>
                <AlertDescription className="mt-2 text-sm">
                  Sua senha foi alterada com sucesso. Você será redirecionado em instantes...
                </AlertDescription>
              </Alert>
            ) : !session ? (
              <div className="flex flex-col items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
                <p className="text-muted-foreground text-sm">Verificando link de redefinição...</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="password">Nova Senha</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  {errors.password && (
                    <p className="text-sm text-destructive">{errors.password}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirmar Nova Senha</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="confirmPassword"
                      type="password"
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  {errors.confirmPassword && (
                    <p className="text-sm text-destructive">{errors.confirmPassword}</p>
                  )}
                </div>

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Redefinindo...
                    </>
                  ) : (
                    'Redefinir Senha'
                  )}
                </Button>

                <Button
                  type="button"
                  variant="ghost"
                  className="w-full"
                  onClick={() => navigate('/auth')}
                >
                  Voltar para login
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
