import { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface OnboardingStep {
  title: string;
  description: string;
  targetSelector?: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

const steps: OnboardingStep[] = [
  {
    title: 'Bem-vindo ao Manual ETEC! 🎓',
    description: 'Vamos fazer um tour rápido pelas funcionalidades principais da plataforma.',
  },
  {
    title: 'Dashboard',
    description: 'Aqui você acompanha seu progresso geral, atividades pendentes e atrasadas.',
    targetSelector: '[data-sidebar-item="Dashboard"]',
    position: 'right',
  },
  {
    title: 'Cronograma',
    description: 'Veja o cronograma semanal de aulas e matérias organizadas por período.',
    targetSelector: '[data-sidebar-item="Cronograma"]',
    position: 'right',
  },
  {
    title: 'Matérias e Atividades',
    description: 'Acesse suas matérias, visualize atividades e marque como concluídas.',
    targetSelector: '[data-sidebar-item="Matérias"]',
    position: 'right',
  },
  {
    title: 'Estudo',
    description: 'Encontre vídeos e materiais de estudo organizados por matéria.',
    targetSelector: '[data-sidebar-item="Estudo"]',
    position: 'right',
  },
  {
    title: 'Tudo pronto! 🚀',
    description: 'Agora você já conhece as principais ferramentas. Bons estudos!',
  },
];

const STORAGE_KEY = 'manual-etec-onboarding-completed';

export function Onboarding() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);

  useEffect(() => {
    const completed = localStorage.getItem(STORAGE_KEY);
    if (!completed) {
      // Small delay to let page render
      const timer = setTimeout(() => setIsVisible(true), 800);
      return () => clearTimeout(timer);
    }
  }, []);

  const updateTargetRect = useCallback(() => {
    const step = steps[currentStep];
    if (step.targetSelector) {
      const el = document.querySelector(step.targetSelector);
      if (el) {
        setTargetRect(el.getBoundingClientRect());
        return;
      }
    }
    setTargetRect(null);
  }, [currentStep]);

  useEffect(() => {
    updateTargetRect();
    window.addEventListener('resize', updateTargetRect);
    return () => window.removeEventListener('resize', updateTargetRect);
  }, [updateTargetRect]);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      handleClose();
    }
  };

  const handleClose = () => {
    setIsVisible(false);
    localStorage.setItem(STORAGE_KEY, 'true');
  };

  if (!isVisible) return null;

  const step = steps[currentStep];
  const isFirstOrLast = !step.targetSelector;

  // Calculate tooltip position
  let tooltipStyle: React.CSSProperties = {};
  if (targetRect && !isFirstOrLast) {
    tooltipStyle = {
      position: 'fixed',
      top: targetRect.top + targetRect.height / 2,
      left: targetRect.right + 16,
      transform: 'translateY(-50%)',
      zIndex: 10001,
    };
  }

  return createPortal(
    <AnimatePresence>
      {isVisible && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[10000]"
            style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}
            onClick={handleClose}
          />

          {/* Highlight target */}
          {targetRect && !isFirstOrLast && (
            <div
              className="fixed z-[10000] rounded-lg ring-4 ring-primary ring-offset-2"
              style={{
                top: targetRect.top - 4,
                left: targetRect.left - 4,
                width: targetRect.width + 8,
                height: targetRect.height + 8,
                backgroundColor: 'transparent',
                boxShadow: '0 0 0 9999px rgba(0,0,0,0.6)',
              }}
            />
          )}

          {/* Tooltip / Center card */}
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className={`z-[10001] bg-card border border-border rounded-xl shadow-2xl p-5 w-80 ${
              isFirstOrLast ? 'fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2' : 'fixed'
            }`}
            style={isFirstOrLast ? {} : tooltipStyle}
          >
            <button
              onClick={handleClose}
              className="absolute top-3 right-3 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="h-4 w-4" />
            </button>

            <h3 className="font-semibold text-lg mb-2">{step.title}</h3>
            <p className="text-sm text-muted-foreground mb-4">{step.description}</p>

            <div className="flex items-center justify-between">
              <div className="flex gap-1">
                {steps.map((_, i) => (
                  <div
                    key={i}
                    className={`h-1.5 rounded-full transition-all ${
                      i === currentStep ? 'w-6 bg-primary' : 'w-1.5 bg-muted-foreground/30'
                    }`}
                  />
                ))}
              </div>

              <div className="flex gap-2">
                <Button variant="ghost" size="sm" onClick={handleClose}>
                  Pular
                </Button>
                <Button size="sm" onClick={handleNext}>
                  {currentStep === steps.length - 1 ? 'Começar' : 'Próximo'}
                </Button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
}
