import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { GraduationCap, BookOpen, Calendar, CheckCircle2, ArrowRight, Users, Sparkles, Clock, Star, Zap, Target, Shield } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

function AnimatedCounter({ target, suffix = '' }: { target: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started) {
          setStarted(true);
        }
      },
      { threshold: 0.5 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [started]);

  useEffect(() => {
    if (!started) return;
    const duration = 1500;
    const steps = 40;
    const increment = target / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, duration / steps);
    return () => clearInterval(timer);
  }, [started, target]);

  return (
    <div ref={ref} className="text-4xl md:text-5xl font-bold text-primary">
      {count}
      {suffix}
    </div>
  );
}

function ScrollReveal({ children, className = '', delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setVisible(true);
      },
      { threshold: 0.15 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

export default function Index() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary">
              <GraduationCap className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold">Manual ETEC</span>
          </div>
          <div className="flex items-center gap-3">
            <Button asChild variant="ghost">
              <Link to="/auth">Entrar</Link>
            </Button>
            <Button asChild>
              <Link to="/auth">Criar Conta</Link>
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden py-20 md:py-32" style={{ background: 'var(--gradient-hero)' }}>
        <div className="container mx-auto px-4 text-center">
          <ScrollReveal>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-sm text-white/90 mb-6">
              <Sparkles className="h-4 w-4" />
              Plataforma educacional gratuita
            </div>
          </ScrollReveal>
          <ScrollReveal delay={100}>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
              Organize seus estudos.
              <br />
              <span className="text-white/80">Conquiste seus objetivos.</span>
            </h1>
          </ScrollReveal>
          <ScrollReveal delay={200}>
            <p className="text-lg md:text-xl text-white/70 max-w-2xl mx-auto mb-10">
              Acompanhe aulas, atividades e prazos em um só lugar. Feito por alunos da ETEC, para alunos da ETEC.
            </p>
          </ScrollReveal>
          <ScrollReveal delay={300}>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="text-lg px-8 shadow-lg">
                <Link to="/auth">
                  Começar Agora
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="text-lg px-8 bg-white/10 border-white/20 text-white hover:bg-white/20 hover:text-white">
                <a href="#como-funciona">Saiba Mais</a>
              </Button>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 border-b">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { target: 100, suffix: '+', label: 'Alunos ativos' },
              { target: 50, suffix: '+', label: 'Atividades' },
              { target: 15, suffix: '+', label: 'Matérias' },
              { target: 200, suffix: '+', label: 'Vídeos e PDFs' },
            ].map((stat) => (
              <div key={stat.label}>
                <AnimatedCounter target={stat.target} suffix={stat.suffix} />
                <p className="mt-2 text-sm text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 md:py-28">
        <div className="container mx-auto px-4">
          <ScrollReveal>
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Tudo que você precisa em um só lugar
              </h2>
              <p className="text-muted-foreground text-lg max-w-xl mx-auto">
                Ferramentas pensadas para facilitar sua rotina de estudos.
              </p>
            </div>
          </ScrollReveal>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: Calendar, title: 'Cronograma Semanal', desc: 'Visualize todas as suas aulas da semana em um formato claro e organizado.', color: 'bg-primary/10 text-primary' },
              { icon: BookOpen, title: 'Matérias Organizadas', desc: 'Acesse todas as suas matérias e seus conteúdos de forma rápida e intuitiva.', color: 'bg-secondary/20 text-secondary' },
              { icon: GraduationCap, title: 'Atividades com Vídeos', desc: 'Cada atividade pode incluir vídeos do YouTube e PDFs para facilitar seu aprendizado.', color: 'bg-accent/20 text-accent-foreground' },
              { icon: CheckCircle2, title: 'Controle de Progresso', desc: 'Marque atividades como concluídas e acompanhe seu desempenho ao longo do tempo.', color: 'bg-green-500/10 text-green-600' },
            ].map((feature, i) => (
              <ScrollReveal key={feature.title} delay={i * 100}>
                <div className="p-6 rounded-2xl bg-card border shadow-sm hover:shadow-lg transition-all hover:-translate-y-1 h-full">
                  <div className={`h-12 w-12 rounded-xl flex items-center justify-center mb-4 ${feature.color}`}>
                    <feature.icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.desc}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="como-funciona" className="py-20 md:py-28 bg-muted/40">
        <div className="container mx-auto px-4">
          <ScrollReveal>
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Como Funciona</h2>
              <p className="text-muted-foreground text-lg">Em 3 passos simples</p>
            </div>
          </ScrollReveal>
          <div className="grid gap-8 md:grid-cols-3 max-w-4xl mx-auto">
            {[
              { step: '1', icon: Users, title: 'Crie sua conta', desc: 'Cadastre-se gratuitamente com seu e-mail em menos de 1 minuto.' },
              { step: '2', icon: Target, title: 'Explore o conteúdo', desc: 'Acesse matérias, atividades, vídeos e materiais de estudo organizados.' },
              { step: '3', icon: Zap, title: 'Acompanhe seu progresso', desc: 'Marque atividades concluídas e nunca mais perca um prazo.' },
            ].map((item, i) => (
              <ScrollReveal key={item.step} delay={i * 150}>
                <div className="text-center p-6">
                  <div className="relative mx-auto mb-6">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 mx-auto">
                      <item.icon className="h-8 w-8 text-primary" />
                    </div>
                    <span className="absolute -top-2 -right-2 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold">
                      {item.step}
                    </span>
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                  <p className="text-muted-foreground">{item.desc}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 md:py-28">
        <div className="container mx-auto px-4">
          <ScrollReveal>
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">O que os alunos dizem</h2>
              <p className="text-muted-foreground text-lg">Depoimentos de quem já usa a plataforma</p>
            </div>
          </ScrollReveal>
          <div className="grid gap-6 md:grid-cols-3 max-w-5xl mx-auto">
            {[
              { name: 'Maria S.', role: 'Aluna do 2° ano', text: 'Nunca mais perdi um prazo de atividade. A plataforma é super intuitiva e me ajuda a organizar tudo!', stars: 5 },
              { name: 'João P.', role: 'Aluno do 3° ano', text: 'Os vídeos e PDFs de cada matéria são muito úteis. Consigo estudar para as provas de forma muito mais eficiente.', stars: 5 },
              { name: 'Ana L.', role: 'Aluna do 1° ano', text: 'O cronograma semanal me salva toda semana. Recomendo para todos os alunos da ETEC!', stars: 5 },
            ].map((t, i) => (
              <ScrollReveal key={t.name} delay={i * 100}>
                <div className="p-6 rounded-2xl bg-card border shadow-sm h-full flex flex-col">
                  <div className="flex gap-1 mb-4">
                    {Array.from({ length: t.stars }).map((_, j) => (
                      <Star key={j} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-muted-foreground flex-1 mb-4">"{t.text}"</p>
                  <div>
                    <p className="font-semibold">{t.name}</p>
                    <p className="text-sm text-muted-foreground">{t.role}</p>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 md:py-28" style={{ background: 'var(--gradient-primary)' }}>
        <div className="container mx-auto px-4 text-center">
          <ScrollReveal>
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
          </ScrollReveal>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card border-t py-12">
        <div className="container mx-auto px-4">
          <div className="grid gap-8 md:grid-cols-3 mb-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary">
                  <GraduationCap className="h-5 w-5 text-primary-foreground" />
                </div>
                <span className="text-lg font-bold">Manual ETEC</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Plataforma educacional feita por alunos, para alunos.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Links Rápidos</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link to="/auth" className="hover:text-foreground transition-colors">Entrar</Link></li>
                <li><Link to="/auth" className="hover:text-foreground transition-colors">Criar Conta</Link></li>
                <li><a href="#como-funciona" className="hover:text-foreground transition-colors">Como Funciona</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Recursos</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2"><Shield className="h-3 w-3" /> Seguro e confiável</li>
                <li className="flex items-center gap-2"><Clock className="h-3 w-3" /> Disponível 24/7</li>
                <li className="flex items-center gap-2"><Sparkles className="h-3 w-3" /> 100% gratuito</li>
              </ul>
            </div>
          </div>
          <div className="border-t pt-6 text-center text-sm text-muted-foreground">
            <p>&copy; {new Date().getFullYear()} Manual ETEC. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
