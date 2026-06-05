import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeToggle } from '@/components/theme-toggle';
import { ThemeProvider, useTheme } from '@/components/theme-provider';
import * as themeLib from '@/lib/theme';

function renderWithTheme(ui: React.ReactElement, initial: 'light' | 'dark' | 'system' = 'system') {
  if (initial !== 'system') {
    window.localStorage.setItem('theme', initial);
  }
  return render(<ThemeProvider>{ui}</ThemeProvider>);
}

describe('<ThemeToggle />', () => {
  beforeEach(() => {
    window.localStorage.clear();
    document.documentElement.classList.remove('dark');
  });

  it('renderiza 3 botoes (light, dark, system)', () => {
    renderWithTheme(<ThemeToggle />);

    expect(screen.getByRole('button', { name: /tema claro/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /tema escuro/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /tema do sistema/i })).toBeInTheDocument();
  });

  it('marca tema atual como aria-pressed', () => {
    renderWithTheme(<ThemeToggle />, 'dark');

    expect(screen.getByRole('button', { name: /tema claro/i })).toHaveAttribute('aria-pressed', 'false');
    expect(screen.getByRole('button', { name: /tema escuro/i })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: /tema do sistema/i })).toHaveAttribute('aria-pressed', 'false');
  });

  it('clicar em "claro" salva tema e aplica classe', () => {
    renderWithTheme(<ThemeToggle />, 'dark');

    fireEvent.click(screen.getByRole('button', { name: /tema claro/i }));

    expect(window.localStorage.getItem('theme')).toBe('light');
    expect(document.documentElement.classList.contains('dark')).toBe(false);
  });

  it('clicar em "escuro" aplica classe dark', () => {
    renderWithTheme(<ThemeToggle />, 'light');

    fireEvent.click(screen.getByRole('button', { name: /tema escuro/i }));

    expect(window.localStorage.getItem('theme')).toBe('dark');
    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });

  it('clicar em "sistema" remove preferencia e usa OS', () => {
    renderWithTheme(<ThemeToggle />, 'light');

    fireEvent.click(screen.getByRole('button', { name: /tema do sistema/i }));

    expect(window.localStorage.getItem('theme')).toBe('system');
  });

  it('atualiza aria-pressed apos clique', () => {
    renderWithTheme(<ThemeToggle />, 'light');

    fireEvent.click(screen.getByRole('button', { name: /tema escuro/i }));

    expect(screen.getByRole('button', { name: /tema escuro/i })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: /tema claro/i })).toHaveAttribute('aria-pressed', 'false');
  });

  it('tem role group e aria-label', () => {
    renderWithTheme(<ThemeToggle />);

    const group = screen.getByRole('group', { name: /selecionar tema/i });
    expect(group).toBeInTheDocument();
  });
});

describe('useTheme hook', () => {
  beforeEach(() => {
    window.localStorage.clear();
    document.documentElement.classList.remove('dark');
  });

  it('fora do ThemeProvider lanca erro', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    function BadComponent() {
      useTheme();
      return null;
    }

    expect(() => render(<BadComponent />)).toThrow(/ThemeProvider/);

    consoleSpy.mockRestore();
  });
});

describe('theme utilities', () => {
  beforeEach(() => {
    window.localStorage.clear();
    document.documentElement.classList.remove('dark');
  });

  it('getStoredTheme retorna null quando vazio', () => {
    expect(themeLib.getStoredTheme()).toBeNull();
  });

  it('getStoredTheme retorna valor valido', () => {
    window.localStorage.setItem('theme', 'dark');
    expect(themeLib.getStoredTheme()).toBe('dark');
  });

  it('getStoredTheme ignora valor invalido', () => {
    window.localStorage.setItem('theme', 'garbage');
    expect(themeLib.getStoredTheme()).toBeNull();
  });

  it('setStoredTheme persiste valor', () => {
    themeLib.setStoredTheme('light');
    expect(window.localStorage.getItem('theme')).toBe('light');
  });

  it('resolveTheme resolve system -> light/dark baseado no OS', () => {
    vi.stubGlobal('matchMedia', vi.fn().mockImplementation((q: string) => ({
      matches: q.includes('dark'),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })));
    expect(themeLib.resolveTheme('system')).toBe('dark');

    vi.stubGlobal('matchMedia', vi.fn().mockImplementation(() => ({
      matches: false,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })));
    expect(themeLib.resolveTheme('system')).toBe('light');

    vi.unstubAllGlobals();
  });

  it('resolveTheme retorna o tema se nao for system', () => {
    expect(themeLib.resolveTheme('light')).toBe('light');
    expect(themeLib.resolveTheme('dark')).toBe('dark');
  });

  it('applyThemeClass adiciona dark quando dark', () => {
    themeLib.applyThemeClass('dark');
    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });

  it('applyThemeClass remove dark quando light', () => {
    document.documentElement.classList.add('dark');
    themeLib.applyThemeClass('light');
    expect(document.documentElement.classList.contains('dark')).toBe(false);
  });
});
