import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StatsCards } from '@/components/stats-cards';
import type { QuestStats } from '@/lib/stats';

describe('<StatsCards />', () => {
  const stats: QuestStats = {
    total: 8,
    concluidas: 3,
    pendentes: 5,
    xpTotal: 16500,
    xpGanho: 2300,
    progresso: 38,
  };

  it('renderiza os 6 cards com labels', () => {
    render(<StatsCards stats={stats} />);

    expect(screen.getByText('Total de quests')).toBeInTheDocument();
    expect(screen.getByText('Concluídas')).toBeInTheDocument();
    expect(screen.getByText('Pendentes')).toBeInTheDocument();
    expect(screen.getByText('XP total')).toBeInTheDocument();
    expect(screen.getByText('XP ganho')).toBeInTheDocument();
    expect(screen.getByText('Progresso')).toBeInTheDocument();
  });

  it('renderiza os valores corretos', () => {
    render(<StatsCards stats={stats} />);

    expect(screen.getByText('8')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.getByText('16500')).toBeInTheDocument();
    expect(screen.getByText('2300')).toBeInTheDocument();
    expect(screen.getByText('38%')).toBeInTheDocument();
  });

  it('mostra hint no card de XP ganho', () => {
    render(<StatsCards stats={stats} />);
    expect(screen.getByText('de quests concluídas')).toBeInTheDocument();
  });

  it('formata progresso como percentual', () => {
    render(<StatsCards stats={{ ...stats, progresso: 50 }} />);
    expect(screen.getByText('50%')).toBeInTheDocument();
  });

  it('renderiza com valores zerados', () => {
    const empty: QuestStats = {
      total: 0,
      concluidas: 0,
      pendentes: 0,
      xpTotal: 0,
      xpGanho: 0,
      progresso: 0,
    };
    render(<StatsCards stats={empty} />);
    expect(screen.getAllByText('0')).toHaveLength(5);
    expect(screen.getByText('0%')).toBeInTheDocument();
  });

  it('cada card tem variante dark para texto', () => {
    render(<StatsCards stats={stats} />);
    const labels = ['Total de quests', 'Concluídas', 'Pendentes', 'XP total', 'XP ganho', 'Progresso'];
    for (const label of labels) {
      const card = screen.getByText(label).parentElement!;
      expect(card.className).toMatch(/dark:text-/);
    }
  });
});
