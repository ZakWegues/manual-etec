import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, Monitor, Smartphone, Share } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function Install() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handler);

    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') setIsInstalled(true);
    setDeferredPrompt(null);
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-2xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Instalar App</h1>
        <p className="text-muted-foreground mt-1">
          Instale o Manual ETEC no seu dispositivo para acesso rápido
        </p>
      </div>

      {isInstalled ? (
        <Card className="border-success">
          <CardContent className="flex items-center gap-3 py-6">
            <Download className="h-6 w-6 text-success" />
            <p className="font-medium">O app já está instalado no seu dispositivo!</p>
          </CardContent>
        </Card>
      ) : deferredPrompt ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-4 py-8">
            <Download className="h-12 w-12 text-primary" />
            <p className="text-lg font-medium">Pronto para instalar!</p>
            <Button size="lg" onClick={handleInstall}>
              <Download className="mr-2 h-5 w-5" />
              Instalar agora
            </Button>
          </CardContent>
        </Card>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Smartphone className="h-5 w-5" />
              iPhone / iPad
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <div className="flex items-start gap-2">
              <span className="font-bold text-foreground">1.</span>
              <p>Abra este site no <strong>Safari</strong></p>
            </div>
            <div className="flex items-start gap-2">
              <span className="font-bold text-foreground">2.</span>
              <p>Toque no botão <Share className="inline h-4 w-4" /> Compartilhar</p>
            </div>
            <div className="flex items-start gap-2">
              <span className="font-bold text-foreground">3.</span>
              <p>Selecione <strong>"Adicionar à Tela de Início"</strong></p>
            </div>
            <div className="flex items-start gap-2">
              <span className="font-bold text-foreground">4.</span>
              <p>Toque em <strong>"Adicionar"</strong></p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Monitor className="h-5 w-5" />
              Android / Desktop
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <div className="flex items-start gap-2">
              <span className="font-bold text-foreground">1.</span>
              <p>Abra este site no <strong>Chrome</strong></p>
            </div>
            <div className="flex items-start gap-2">
              <span className="font-bold text-foreground">2.</span>
              <p>Toque no menu <strong>⋮</strong> (três pontos)</p>
            </div>
            <div className="flex items-start gap-2">
              <span className="font-bold text-foreground">3.</span>
              <p>Selecione <strong>"Instalar aplicativo"</strong> ou <strong>"Adicionar à tela inicial"</strong></p>
            </div>
            <div className="flex items-start gap-2">
              <span className="font-bold text-foreground">4.</span>
              <p>Confirme a instalação</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
