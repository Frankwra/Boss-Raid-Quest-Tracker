'use client';

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import {
  type Theme,
  type ResolvedTheme,
  applyThemeClass,
  getStoredTheme,
  getSystemTheme,
  resolveTheme,
  setStoredTheme,
} from '@/lib/theme';

interface ThemeContextValue {
  theme: Theme;
  resolved: ResolvedTheme;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('system');
  const [resolved, setResolved] = useState<ResolvedTheme>('light');

  useEffect(() => {
    const stored = getStoredTheme() ?? 'system';
    setThemeState(stored);
    const initial = resolveTheme(stored);
    setResolved(initial);
    applyThemeClass(initial);
  }, []);

  useEffect(() => {
    if (theme !== 'system') return;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = () => {
      const next = getSystemTheme();
      setResolved(next);
      applyThemeClass(next);
    };
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, [theme]);

  const setTheme = (next: Theme) => {
    setThemeState(next);
    setStoredTheme(next);
    const r = resolveTheme(next);
    setResolved(r);
    applyThemeClass(r);
  };

  return (
    <ThemeContext.Provider value={{ theme, resolved, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme deve ser usado dentro de <ThemeProvider>');
  return ctx;
}
