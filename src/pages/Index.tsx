import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { GraduationCap, BookOpen, Calendar, CheckCircle2, ArrowRight } from 'lucide-react';

export default function Index() {
  return (
    <div className="min-h-screen" style={{ background: 'var(--gradient-hero)' }}>
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16 md:py-24">
        <div className="flex flex-col items-center text-center animate-fade-in">
          <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-primary shadow-lg mb-6">
            <GraduationCap className="h-12 w-12 text-primary-foreground" />
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
            Manual ETEC
          </h1>
          
          <p className="text-xl md:text-2xl text-white/80 max-w-2xl mb-8">
            Sua plataforma de apoio educacional. Organize suas aulas, acompanhe atividades e nunca mais perca um prazo.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <Button asChild size="lg" className="text-lg px-8">
              <Link to="/auth">
                Começar Agora
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-background py-16 md:py-24">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            Tudo que você precisa em um só lugar
          </h2>
          
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            <div className="p-6 rounded-2xl bg-card border shadow-sm hover:shadow-lg transition-shadow animate-fade-in">
              <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                <Calendar className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Cronograma Semanal</h3>
              <p className="text-muted-foreground">
                Visualize todas as suas aulas da semana em um formato claro e organizado.
              </p>
            </div>
            
            <div className="p-6 rounded-2xl bg-card border shadow-sm hover:shadow-lg transition-shadow animate-fade-in" style={{ animationDelay: '0.1s' }}>
              <div className="h-12 w-12 rounded-xl bg-secondary/20 flex items-center justify-center mb-4">
                <BookOpen className="h-6 w-6 text-secondary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Matérias Organizadas</h3>
              <p className="text-muted-foreground">
                Acesse todas as suas matérias e seus conteúdos de forma rápida e intuitiva.
              </p>
            </div>
            
            <div className="p-6 rounded-2xl bg-card border shadow-sm hover:shadow-lg transition-shadow animate-fade-in" style={{ animationDelay: '0.2s' }}>
              <div className="h-12 w-12 rounded-xl bg-accent/20 flex items-center justify-center mb-4">
                <GraduationCap className="h-6 w-6 text-accent" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Atividades com Vídeos</h3>
              <p className="text-muted-foreground">
                Cada atividade pode incluir vídeos do YouTube para facilitar seu aprendizado.
              </p>
            </div>
            
            <div className="p-6 rounded-2xl bg-card border shadow-sm hover:shadow-lg transition-shadow animate-fade-in" style={{ animationDelay: '0.3s' }}>
              <div className="h-12 w-12 rounded-xl bg-success/20 flex items-center justify-center mb-4">
                <CheckCircle2 className="h-6 w-6 text-success" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Controle de Progresso</h3>
              <p className="text-muted-foreground">
                Marque atividades como concluídas e acompanhe seu desempenho ao longo do tempo.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-16 md:py-24" style={{ background: 'var(--gradient-primary)' }}>
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Pronto para começar?
          </h2>
          <p className="text-xl text-white/80 mb-8 max-w-xl mx-auto">
            Crie sua conta gratuitamente e comece a organizar seus estudos hoje mesmo.
          </p>
          <Button asChild size="lg" variant="secondary" className="text-lg px-8">
            <Link to="/auth">
              Criar Conta Grátis
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-card border-t py-8">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} Manual ETEC. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );
}