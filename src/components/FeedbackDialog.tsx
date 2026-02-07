import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { MessageSquarePlus, Loader2, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

type FeedbackType = 'bug' | 'suggestion' | 'compliment' | 'other';

const feedbackTypeOptions = [
  { value: 'bug', label: '🐛 Bug / Problema' },
  { value: 'suggestion', label: '💡 Sugestão de Melhoria' },
  { value: 'compliment', label: '⭐ Elogio' },
  { value: 'other', label: '📝 Outro' },
];

export function FeedbackDialog() {
  const { profile } = useAuth();
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  
  const [name, setName] = useState(profile?.full_name || '');
  const [email, setEmail] = useState(profile?.email || '');
  const [type, setType] = useState<FeedbackType>('suggestion');
  const [message, setMessage] = useState('');

  const resetForm = () => {
    setName(profile?.full_name || '');
    setEmail(profile?.email || '');
    setType('suggestion');
    setMessage('');
    setIsSuccess(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim() || !email.trim() || !message.trim()) {
      toast.error('Por favor, preencha todos os campos');
      return;
    }

    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('send-feedback', {
        body: { name, email, type, message },
      });

      if (error) {
        throw new Error(error.message);
      }

      setIsSuccess(true);
      toast.success('Feedback enviado com sucesso! Obrigado pela sua contribuição.');
      
      setTimeout(() => {
        setOpen(false);
        resetForm();
      }, 2000);
    } catch (error: any) {
      console.error('Error sending feedback:', error);
      toast.error('Erro ao enviar feedback. Tente novamente mais tarde.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      resetForm();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <MessageSquarePlus className="h-4 w-4" />
          <span className="hidden sm:inline">Feedback</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquarePlus className="h-5 w-5 text-primary" />
            Enviar Feedback
          </DialogTitle>
          <DialogDescription>
            Sua opinião é muito importante para melhorarmos a plataforma! 
            Conte-nos o que achou ou sugira melhorias.
          </DialogDescription>
        </DialogHeader>

        {isSuccess ? (
          <div className="flex flex-col items-center justify-center py-8 gap-4">
            <div className="h-16 w-16 rounded-full bg-success/10 flex items-center justify-center">
              <CheckCircle2 className="h-8 w-8 text-success" />
            </div>
            <div className="text-center">
              <h3 className="font-semibold text-lg">Obrigado pelo feedback!</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Sua mensagem foi enviada com sucesso.
              </p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 mt-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="feedback-name">Nome</Label>
                <Input
                  id="feedback-name"
                  placeholder="Seu nome"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="feedback-email">Email</Label>
                <Input
                  id="feedback-email"
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="feedback-type">Tipo de Feedback</Label>
              <Select
                value={type}
                onValueChange={(value) => setType(value as FeedbackType)}
                disabled={isLoading}
              >
                <SelectTrigger id="feedback-type">
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  {feedbackTypeOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="feedback-message">Mensagem</Label>
              <Textarea
                id="feedback-message"
                placeholder="Descreva seu feedback, sugestão ou problema encontrado..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                disabled={isLoading}
                rows={4}
                className="resize-none"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => handleOpenChange(false)}
                disabled={isLoading}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  'Enviar Feedback'
                )}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
