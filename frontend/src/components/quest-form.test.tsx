import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QuestForm } from '@/components/quest-form';
import { renderWithProviders, makeQuest } from '@/test/utils';
import * as apiModule from '@/lib/api';

const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush, refresh: vi.fn() }),
  useParams: () => ({}),
}));

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

describe('<QuestForm mode="create" />', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renderiza campos de titulo, descricao e XP', () => {
    renderWithProviders(<QuestForm mode="create" />);

    expect(screen.getByLabelText(/título/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/descriç/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^xp$/i)).toBeInTheDocument();
  });

  it('renderiza botao "Criar quest"', () => {
    renderWithProviders(<QuestForm mode="create" />);
    expect(screen.getByRole('button', { name: /criar quest/i })).toBeInTheDocument();
  });

  it('NAO renderiza checkbox de concluida no modo create', () => {
    renderWithProviders(<QuestForm mode="create" />);
    expect(screen.queryByLabelText(/concluíd/i)).not.toBeInTheDocument();
  });

  it('mostra erro de validacao quando titulo esta vazio', async () => {
    const user = userEvent.setup();
    renderWithProviders(<QuestForm mode="create" />);

    await user.clear(screen.getByLabelText(/título/i));
    await user.click(screen.getByRole('button', { name: /criar quest/i }));

    expect(await screen.findByText(/obrigat/i)).toBeInTheDocument();
    expect(mockedApi.create).not.toHaveBeenCalled();
  });

  it('submete com dados validos e navega para home', async () => {
    const user = userEvent.setup();
    mockedApi.create.mockResolvedValue(makeQuest());

    renderWithProviders(<QuestForm mode="create" />);

    await user.clear(screen.getByLabelText(/título/i));
    await user.type(screen.getByLabelText(/título/i), 'Nova quest');
    await user.clear(screen.getByLabelText(/^xp$/i));
    await user.type(screen.getByLabelText(/^xp$/i), '500');
    await user.click(screen.getByRole('button', { name: /criar quest/i }));

    await waitFor(() => {
      expect(mockedApi.create).toHaveBeenCalledWith({
        titulo: 'Nova quest',
        descricao: undefined,
        xp: 500,
      });
    });

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/');
    });
  });

  it('mostra toast de sucesso apos criar', async () => {
    const user = userEvent.setup();
    mockedApi.create.mockResolvedValue(makeQuest());

    renderWithProviders(<QuestForm mode="create" />);

    await user.clear(screen.getByLabelText(/título/i));
    await user.type(screen.getByLabelText(/título/i), 'Teste');
    await user.click(screen.getByRole('button', { name: /criar quest/i }));

    expect(await screen.findByText(/quest criada/i)).toBeInTheDocument();
  });

  it('botao de cancelar volta para home', async () => {
    const user = userEvent.setup();
    renderWithProviders(<QuestForm mode="create" />);

    await user.click(screen.getByRole('button', { name: /cancelar/i }));

    expect(mockPush).toHaveBeenCalledWith('/');
  });
});

describe('<QuestForm mode="edit" />', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('mostra "Carregando..." enquanto busca a quest', () => {
    mockedApi.findById.mockImplementation(
      () => new Promise(() => {}) // nunca resolve
    );

    renderWithProviders(<QuestForm mode="edit" questId="q-1" />);

    expect(screen.getByText(/carregando/i)).toBeInTheDocument();
  });

  it('preenche campos com dados da quest', async () => {
    mockedApi.findById.mockResolvedValue(
      makeQuest({ titulo: 'Existente', descricao: 'Desc', xp: 999, concluida: false })
    );

    renderWithProviders(<QuestForm mode="edit" questId="q-1" />);

    expect(await screen.findByDisplayValue('Existente')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Desc')).toBeInTheDocument();
    expect(screen.getByDisplayValue('999')).toBeInTheDocument();
  });

  it('renderiza checkbox de concluida no modo edit', async () => {
    mockedApi.findById.mockResolvedValue(makeQuest());

    renderWithProviders(<QuestForm mode="edit" questId="q-1" />);

    expect(await screen.findByLabelText(/concluíd/i)).toBeInTheDocument();
  });

  it('renderiza botao "Salvar alteracoes"', async () => {
    mockedApi.findById.mockResolvedValue(makeQuest());

    renderWithProviders(<QuestForm mode="edit" questId="q-1" />);

    expect(await screen.findByRole('button', { name: /salvar/i })).toBeInTheDocument();
  });

  it('chama update com novos dados', async () => {
    const user = userEvent.setup();
    mockedApi.findById.mockResolvedValue(makeQuest({ titulo: 'Original', xp: 100 }));
    mockedApi.update.mockResolvedValue(makeQuest({ titulo: 'Atualizado' }));

    renderWithProviders(<QuestForm mode="edit" questId="q-1" />);

    const tituloInput = await screen.findByDisplayValue('Original');
    await user.clear(tituloInput);
    await user.type(tituloInput, 'Atualizado');
    await user.click(screen.getByRole('button', { name: /salvar/i }));

    await waitFor(() => {
      expect(mockedApi.update).toHaveBeenCalledWith(
        'q-1',
        expect.objectContaining({ titulo: 'Atualizado' })
      );
    });
  });
});
