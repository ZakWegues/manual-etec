import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Mail, Calendar, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function Profile() {
  const { profile, user, isAdmin } = useAuth();
  const navigate = useNavigate();

  const getInitials = (name: string | null) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="container max-w-2xl py-8">
      <Button
        variant="ghost"
        onClick={() => navigate(-1)}
        className="mb-6"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Voltar
      </Button>

      <Card>
        <CardHeader className="text-center pb-2">
          <div className="flex justify-center mb-4">
            <Avatar className="h-24 w-24 border-4 border-primary/20">
              <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
                {getInitials(profile?.full_name)}
              </AvatarFallback>
            </Avatar>
          </div>
          <CardTitle className="text-2xl">{profile?.full_name || 'Usuário'}</CardTitle>
          <CardDescription className="flex items-center justify-center gap-2">
            <Badge variant={isAdmin ? 'default' : 'secondary'}>
              <Shield className="mr-1 h-3 w-3" />
              {isAdmin ? 'Administrador' : 'Aluno'}
            </Badge>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4">
            <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/50">
              <Mail className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">E-mail</p>
                <p className="font-medium">{user?.email || profile?.email || 'Não informado'}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/50">
              <Calendar className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Membro desde</p>
                <p className="font-medium">
                  {profile?.created_at
                    ? format(new Date(profile.created_at), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })
                    : 'Não disponível'}
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2 pt-4">
            <Button variant="outline" onClick={() => navigate('/change-password')}>
              Alterar Senha
            </Button>
            <Button variant="outline" onClick={() => navigate('/settings')}>
              Configurações
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
