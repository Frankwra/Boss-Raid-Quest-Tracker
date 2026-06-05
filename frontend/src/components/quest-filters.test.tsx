import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QuestFilters } from '@/components/quest-filters';

describe('<QuestFilters />', () => {
  const onSearchChange = vi.fn();
  const onStatusChange = vi.fn();

  beforeEach(() => {
    onSearchChange.mockClear();
    onStatusChange.mockClear();
  });

  it('renderiza input de busca e select de status', () => {
    render(
      <QuestFilters
        search=""
        status="todas"
        onSearchChange={onSearchChange}
        onStatusChange={onStatusChange}
      />
    );

    expect(screen.getByPlaceholderText(/buscar por títul/i)).toBeInTheDocument();
    expect(screen.getByRole('combobox')).toBeInTheDocument();
  });

  it('chama onSearchChange ao digitar', () => {
    render(
      <QuestFilters
        search=""
        status="todas"
        onSearchChange={onSearchChange}
        onStatusChange={onStatusChange}
      />
    );

    const input = screen.getByPlaceholderText(/buscar por títul/i);
    fireEvent.change(input, { target: { value: 'drag' } });

    expect(onSearchChange).toHaveBeenCalledWith('drag');
  });

  it('chama onStatusChange ao mudar o select', () => {
    render(
      <QuestFilters
        search=""
        status="todas"
        onSearchChange={onSearchChange}
        onStatusChange={onStatusChange}
      />
    );

    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'concluidas' } });

    expect(onStatusChange).toHaveBeenCalledWith('concluidas');
  });

  it('reflete o valor atual de search e status', () => {
    render(
      <QuestFilters
        search="dragao"
        status="pendentes"
        onSearchChange={onSearchChange}
        onStatusChange={onStatusChange}
      />
    );

    expect(screen.getByDisplayValue('dragao')).toBeInTheDocument();
    expect(screen.getByRole('combobox')).toHaveValue('pendentes');
  });

  it('exibe todas as opcoes de status', () => {
    render(
      <QuestFilters
        search=""
        status="todas"
        onSearchChange={onSearchChange}
        onStatusChange={onStatusChange}
      />
    );

    expect(screen.getByRole('option', { name: 'Todas' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Concluídas' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Pendentes' })).toBeInTheDocument();
  });

  it('input e select tem cor explicita para dark mode', () => {
    render(
      <QuestFilters
        search=""
        status="todas"
        onSearchChange={onSearchChange}
        onStatusChange={onStatusChange}
      />
    );

    const input = screen.getByPlaceholderText(/buscar por títul/i);
    const select = screen.getByRole('combobox');
    expect(input.className).toMatch(/dark:text-/);
    expect(select.className).toMatch(/dark:text-/);
  });
});
