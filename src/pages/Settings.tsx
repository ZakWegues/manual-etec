import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Bell, Moon, Globe, Palette } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { toast } from 'sonner';
import { useTheme } from 'next-themes';
import { useAccentColor, accentColors, type AccentColor } from '@/hooks/useAccentColor';
import { cn } from '@/lib/utils';

const colorSwatches: { key: AccentColor; hsl: string }[] = [
  { key: 'blue', hsl: 'hsl(217, 91%, 45%)' },
  { key: 'green', hsl: 'hsl(142, 71%, 40%)' },
  { key: 'purple', hsl: 'hsl(262, 83%, 50%)' },
  { key: 'orange', hsl: 'hsl(25, 95%, 48%)' },
  { key: 'pink', hsl: 'hsl(330, 80%, 50%)' },
];

export default function Settings() {
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const { accent, setAccent } = useAccentColor();
  const [notifications, setNotifications] = useState(true);

  const handleSave = () => {
    toast.success('Configurações salvas com sucesso!');
  };

  return (
    <div className="container max-w-2xl py-8">
      <Button variant="ghost" onClick={() => navigate(-1)} className="mb-6">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Voltar
      </Button>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Configurações</CardTitle>
            <CardDescription>Gerencie suas preferências de conta</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Bell className="h-5 w-5 text-muted-foreground" />
                <div>
                  <Label htmlFor="notifications" className="text-base">Notificações</Label>
                  <p className="text-sm text-muted-foreground">Receber notificações sobre atividades e prazos</p>
                </div>
              </div>
              <Switch id="notifications" checked={notifications} onCheckedChange={setNotifications} />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Moon className="h-5 w-5 text-muted-foreground" />
                <div>
                  <Label htmlFor="darkMode" className="text-base">Modo Escuro</Label>
                  <p className="text-sm text-muted-foreground">Alternar entre tema claro e escuro</p>
                </div>
              </div>
              <Switch
                id="darkMode"
                checked={theme === 'dark'}
                onCheckedChange={(checked) => setTheme(checked ? 'dark' : 'light')}
              />
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Palette className="h-5 w-5 text-muted-foreground" />
                <div>
                  <Label className="text-base">Cor de Destaque</Label>
                  <p className="text-sm text-muted-foreground">Escolha a cor principal da interface</p>
                </div>
              </div>
              <div className="flex gap-3 ml-8">
                {colorSwatches.map((swatch) => (
                  <button
                    key={swatch.key}
                    onClick={() => setAccent(swatch.key)}
                    className={cn(
                      'h-8 w-8 rounded-full ring-2 ring-offset-2 ring-offset-background transition-all hover:scale-110',
                      accent === swatch.key ? 'ring-foreground scale-110' : 'ring-transparent'
                    )}
                    style={{ backgroundColor: swatch.hsl }}
                    title={accentColors[swatch.key].label}
                  />
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Globe className="h-5 w-5 text-muted-foreground" />
                <div>
                  <Label className="text-base">Idioma</Label>
                  <p className="text-sm text-muted-foreground">Português (Brasil)</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Sobre</CardTitle>
            <CardDescription>Informações sobre a plataforma</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Versão</span>
              <span className="font-medium">1.0.0</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Desenvolvido por</span>
              <span className="font-medium">Equipe Manual ETEC</span>
            </div>
          </CardContent>
        </Card>

        <Button onClick={handleSave} className="w-full">
          Salvar Configurações
        </Button>
      </div>
    </div>
  );
}
