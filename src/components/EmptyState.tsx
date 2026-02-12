import { ReactNode } from 'react';
import { motion } from 'framer-motion';

type EmptyVariant = 'activities' | 'subjects' | 'calendar' | 'study' | 'grades' | 'generic';

interface EmptyStateProps {
  variant?: EmptyVariant;
  title: string;
  description?: string;
  action?: ReactNode;
}

const illustrations: Record<EmptyVariant, ReactNode> = {
  activities: (
    <svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="60" cy="60" r="50" className="fill-muted/50" />
      <rect x="35" y="30" width="50" height="60" rx="6" className="fill-background stroke-muted-foreground/30" strokeWidth="2" />
      <rect x="45" y="42" width="30" height="3" rx="1.5" className="fill-muted-foreground/30" />
      <rect x="45" y="50" width="24" height="3" rx="1.5" className="fill-muted-foreground/20" />
      <rect x="45" y="58" width="28" height="3" rx="1.5" className="fill-muted-foreground/30" />
      <rect x="45" y="66" width="20" height="3" rx="1.5" className="fill-muted-foreground/20" />
      <circle cx="80" cy="78" r="16" className="fill-primary/20" />
      <path d="M74 78l4 4 8-8" className="stroke-primary" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  subjects: (
    <svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="60" cy="60" r="50" className="fill-muted/50" />
      <rect x="28" y="35" width="35" height="45" rx="4" className="fill-primary/20 stroke-primary/40" strokeWidth="1.5" />
      <rect x="33" y="40" width="25" height="3" rx="1.5" className="fill-primary/40" />
      <rect x="33" y="47" width="18" height="2" rx="1" className="fill-primary/25" />
      <rect x="50" y="40" width="35" height="45" rx="4" className="fill-secondary/20 stroke-secondary/40" strokeWidth="1.5" />
      <rect x="55" y="45" width="25" height="3" rx="1.5" className="fill-secondary/40" />
      <rect x="55" y="52" width="18" height="2" rx="1" className="fill-secondary/25" />
      <rect x="62" y="32" width="35" height="45" rx="4" className="fill-accent/20 stroke-accent/40" strokeWidth="1.5" />
      <rect x="67" y="37" width="25" height="3" rx="1.5" className="fill-accent/40" />
      <rect x="67" y="44" width="18" height="2" rx="1" className="fill-accent/25" />
    </svg>
  ),
  calendar: (
    <svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="60" cy="60" r="50" className="fill-muted/50" />
      <rect x="30" y="32" width="60" height="56" rx="6" className="fill-background stroke-muted-foreground/30" strokeWidth="2" />
      <rect x="30" y="32" width="60" height="16" rx="6" className="fill-primary/20" />
      <rect x="38" y="28" width="3" height="10" rx="1.5" className="fill-muted-foreground/40" />
      <rect x="79" y="28" width="3" height="10" rx="1.5" className="fill-muted-foreground/40" />
      <circle cx="45" cy="60" r="3" className="fill-muted-foreground/20" />
      <circle cx="60" cy="60" r="3" className="fill-primary/40" />
      <circle cx="75" cy="60" r="3" className="fill-muted-foreground/20" />
      <circle cx="45" cy="73" r="3" className="fill-muted-foreground/20" />
      <circle cx="60" cy="73" r="3" className="fill-muted-foreground/20" />
    </svg>
  ),
  study: (
    <svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="60" cy="60" r="50" className="fill-muted/50" />
      <path d="M60 30L90 45L60 60L30 45L60 30Z" className="fill-primary/20 stroke-primary/40" strokeWidth="1.5" />
      <path d="M30 45V65L60 80L90 65V45" className="stroke-primary/30" strokeWidth="1.5" fill="none" />
      <line x1="90" y1="45" x2="90" y2="72" className="stroke-primary/40" strokeWidth="1.5" />
      <circle cx="90" cy="74" r="3" className="fill-primary/40" />
    </svg>
  ),
  grades: (
    <svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="60" cy="60" r="50" className="fill-muted/50" />
      <rect x="35" y="35" width="50" height="50" rx="6" className="fill-background stroke-muted-foreground/30" strokeWidth="2" />
      <rect x="42" y="70" width="8" height="10" rx="2" className="fill-secondary/40" />
      <rect x="56" y="55" width="8" height="25" rx="2" className="fill-primary/40" />
      <rect x="70" y="45" width="8" height="35" rx="2" className="fill-accent/40" />
    </svg>
  ),
  generic: (
    <svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="60" cy="60" r="50" className="fill-muted/50" />
      <circle cx="60" cy="52" r="16" className="fill-muted-foreground/15" />
      <path d="M40 82c0-11 9-20 20-20s20 9 20 20" className="fill-muted-foreground/15" />
    </svg>
  ),
};

export function EmptyState({ variant = 'generic', title, description, action }: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col items-center justify-center py-12 px-4 text-center"
    >
      <div className="mb-4">{illustrations[variant]}</div>
      <p className="text-lg font-medium text-muted-foreground">{title}</p>
      {description && (
        <p className="text-sm text-muted-foreground/70 mt-1 max-w-sm">{description}</p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </motion.div>
  );
}
