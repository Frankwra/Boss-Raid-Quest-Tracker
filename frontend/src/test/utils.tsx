import { render, type RenderOptions } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import type { ReactElement, ReactNode } from 'react';
import { ThemeProvider } from '@/components/theme-provider';
import type { Quest } from '@/types/quest';

export function makeQuest(overrides: Partial<Quest> = {}): Quest {
  return {
    id: '11111111-1111-4111-8111-111111111111',
    titulo: 'Derrotar dragão',
    descricao: 'Boss raid semanal',
    xp: 1000,
    concluida: false,
    criadoEm: '2026-06-01T10:00:00.000Z',
    atualizadoEm: '2026-06-01T10:00:00.000Z',
    deletadoEm: null,
    ...overrides,
  };
}

export function createTestQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0 },
      mutations: { retry: false },
    },
  });
}

interface ProvidersProps {
  children: ReactNode;
  client?: QueryClient;
}

export function TestProviders({ children, client }: ProvidersProps) {
  const queryClient = client ?? createTestQueryClient();
  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        {children}
        <Toaster />
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export function renderWithProviders(
  ui: ReactElement,
  options?: { client?: QueryClient } & Omit<RenderOptions, 'wrapper'>
) {
  const { client, ...rest } = options ?? {};
  return render(ui, {
    wrapper: ({ children }: { children: ReactNode }) => (
      <TestProviders client={client}>{children}</TestProviders>
    ),
    ...rest,
  });
}
