import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DeleteQuestButton } from '@/components/delete-quest-button';
import { renderWithProviders } from '@/test/utils';
import * as apiModule from '@/lib/api';

vi.mock('@/lib/api', () => ({
  questsApi: {
    findAll: vi.fn(),
    findById: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
  ApiError: class ApiError extends Error {
    constructor(public status: number, message: string) {
      super(message);
      this.name = 'ApiError';
    }
  },
}));

const mockedApi = vi.mocked(apiModule.questsApi);

describe('<DeleteQuestButton />', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(window, 'confirm').mockReturnValue(false);
  });

  it('renderiza botao "Deletar"', () => {
    renderWithProviders(<DeleteQuestButton id="q-1" titulo="Quest X" />);
    expect(screen.getByRole('button', { name: /deletar/i })).toBeInTheDocument();
  });

  it('NAO chama delete se usuario cancela o confirm', async () => {
    const user = userEvent.setup();
    vi.spyOn(window, 'confirm').mockReturnValue(false);

    renderWithProviders(<DeleteQuestButton id="q-1" titulo="Quest X" />);

    await user.click(screen.getByRole('button', { name: /deletar/i }));

    expect(mockedApi.delete).not.toHaveBeenCalled();
  });

  it('chama delete se usuario confirma', async () => {
    const user = userEvent.setup();
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    mockedApi.delete.mockResolvedValue(undefined);

    renderWithProviders(<DeleteQuestButton id="q-1" titulo="Quest X" />);

    await user.click(screen.getByRole('button', { name: /deletar/i }));

    expect(mockedApi.delete).toHaveBeenCalledWith('q-1');
  });

  it('mostra "Deletando..." durante a requisicao', async () => {
    const user = userEvent.setup();
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    let resolveDelete: (() => void) | undefined;
    mockedApi.delete.mockImplementation(
      () => new Promise<void>((resolve) => { resolveDelete = resolve; })
    );

    renderWithProviders(<DeleteQuestButton id="q-1" titulo="Quest X" />);

    await user.click(screen.getByRole('button', { name: /deletar/i }));

    expect(screen.getByRole('button', { name: /deletando/i })).toBeInTheDocument();
    expect(screen.getByRole('button')).toBeDisabled();

    resolveDelete?.();
  });

  it('mostra toast de sucesso apos deletar', async () => {
    const user = userEvent.setup();
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    mockedApi.delete.mockResolvedValue(undefined);

    renderWithProviders(<DeleteQuestButton id="q-1" titulo="Quest X" />);

    await user.click(screen.getByRole('button', { name: /deletar/i }));

    expect(await screen.findByText(/"Quest X" deletada/i)).toBeInTheDocument();
  });
});
