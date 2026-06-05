import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QuestList } from '@/components/quest-list';
import { renderWithProviders, makeQuest } from '@/test/utils';
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

describe('<QuestList />', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renderiza todas as quests', () => {
    const quests = [
      makeQuest({ id: 'q-1', titulo: 'Quest A' }),
      makeQuest({ id: 'q-2', titulo: 'Quest B' }),
      makeQuest({ id: 'q-3', titulo: 'Quest C' }),
    ];

    renderWithProviders(<QuestList quests={quests} />);

    expect(screen.getByText('Quest A')).toBeInTheDocument();
    expect(screen.getByText('Quest B')).toBeInTheDocument();
    expect(screen.getByText('Quest C')).toBeInTheDocument();
  });

  it('renderiza XP de cada quest', () => {
    const quests = [
      makeQuest({ id: 'q-1', xp: 1000 }),
      makeQuest({ id: 'q-2', xp: 2500 }),
    ];

    renderWithProviders(<QuestList quests={quests} />);

    expect(screen.getByText('1000 XP')).toBeInTheDocument();
    expect(screen.getByText('2500 XP')).toBeInTheDocument();
  });

  it('renderiza descricao quando presente', () => {
    const quests = [makeQuest({ descricao: 'Descricao importante' })];

    renderWithProviders(<QuestList quests={quests} />);

    expect(screen.getByText('Descricao importante')).toBeInTheDocument();
  });

  it('mostra "Concluida" para quests finalizadas', () => {
    const quests = [makeQuest({ concluida: true })];

    renderWithProviders(<QuestList quests={quests} />);

    expect(screen.getByText(/concluíd/i)).toBeInTheDocument();
  });

  it('mostra "Marcar concluida" para quests pendentes', () => {
    const quests = [makeQuest({ concluida: false })];

    renderWithProviders(<QuestList quests={quests} />);

    expect(screen.getByText(/marcar concluíd/i)).toBeInTheDocument();
  });

  it('chama update ao clicar em toggle de concluida', async () => {
    const user = userEvent.setup();
    mockedApi.update.mockResolvedValue(makeQuest({ concluida: true }));
    const quests = [makeQuest({ id: 'q-toggle', concluida: false })];

    renderWithProviders(<QuestList quests={quests} />);

    await user.click(screen.getByText(/marcar concluíd/i));

    expect(mockedApi.update).toHaveBeenCalledWith('q-toggle', { concluida: true });
  });

  it('renderiza botao de deletar para cada quest', () => {
    const quests = [makeQuest({ titulo: 'Para deletar' })];

    renderWithProviders(<QuestList quests={quests} />);

    expect(screen.getByRole('button', { name: /deletar/i })).toBeInTheDocument();
  });

  it('renderiza link de edicao para cada quest', () => {
    const quests = [makeQuest({ id: 'edit-123', titulo: 'Editavel' })];

    renderWithProviders(<QuestList quests={quests} />);

    const link = screen.getByRole('link', { name: /editar/i });
    expect(link).toHaveAttribute('href', '/quests/edit-123');
  });

  it('renderiza lista vazia sem itens', () => {
    const { container } = renderWithProviders(<QuestList quests={[]} />);
    const list = container.querySelector('ul');
    expect(list?.children).toHaveLength(0);
  });
});
