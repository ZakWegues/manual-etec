import { useState, useEffect } from 'react';

export type AccentColor = 'blue' | 'green' | 'purple' | 'orange' | 'pink';

interface AccentTheme {
  label: string;
  primary: string;
  primaryDark: string;
  ring: string;
  ringDark: string;
}

export const accentColors: Record<AccentColor, AccentTheme> = {
  blue: {
    label: 'Azul',
    primary: '217 91% 45%',
    primaryDark: '217 91% 60%',
    ring: '217 91% 45%',
    ringDark: '217 91% 60%',
  },
  green: {
    label: 'Verde',
    primary: '142 71% 40%',
    primaryDark: '142 71% 50%',
    ring: '142 71% 40%',
    ringDark: '142 71% 50%',
  },
  purple: {
    label: 'Roxo',
    primary: '262 83% 50%',
    primaryDark: '262 83% 62%',
    ring: '262 83% 50%',
    ringDark: '262 83% 62%',
  },
  orange: {
    label: 'Laranja',
    primary: '25 95% 48%',
    primaryDark: '25 95% 58%',
    ring: '25 95% 48%',
    ringDark: '25 95% 58%',
  },
  pink: {
    label: 'Rosa',
    primary: '330 80% 50%',
    primaryDark: '330 80% 62%',
    ring: '330 80% 50%',
    ringDark: '330 80% 62%',
  },
};

const STORAGE_KEY = 'manual-etec-accent-color';

export function useAccentColor() {
  const [accent, setAccentState] = useState<AccentColor>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return (saved as AccentColor) || 'blue';
  });

  useEffect(() => {
    const theme = accentColors[accent];
    const root = document.documentElement;
    const isDark = root.classList.contains('dark');

    root.style.setProperty('--primary', isDark ? theme.primaryDark : theme.primary);
    root.style.setProperty('--ring', isDark ? theme.ringDark : theme.ring);
    root.style.setProperty('--sidebar-primary', isDark ? theme.primaryDark : theme.primary);
    root.style.setProperty('--sidebar-ring', isDark ? theme.ringDark : theme.ring);
  }, [accent]);

  // Listen for theme changes to re-apply
  useEffect(() => {
    const observer = new MutationObserver(() => {
      const theme = accentColors[accent];
      const isDark = document.documentElement.classList.contains('dark');
      document.documentElement.style.setProperty('--primary', isDark ? theme.primaryDark : theme.primary);
      document.documentElement.style.setProperty('--ring', isDark ? theme.ringDark : theme.ring);
      document.documentElement.style.setProperty('--sidebar-primary', isDark ? theme.primaryDark : theme.primary);
      document.documentElement.style.setProperty('--sidebar-ring', isDark ? theme.ringDark : theme.ring);
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, [accent]);

  const setAccent = (color: AccentColor) => {
    setAccentState(color);
    localStorage.setItem(STORAGE_KEY, color);
  };

  return { accent, setAccent };
}
