import type { Quest } from '@/types/quest';

export interface QuestStats {
  total: number;
  concluidas: number;
  pendentes: number;
  xpTotal: number;
  xpGanho: number;
  progresso: number;
  partial: boolean;
}

export function computeStats(quests: Quest[], options: { partial?: boolean } = {}): QuestStats {
  const total = quests.length;
  const concluidas = quests.filter((q) => q.concluida).length;
  const pendentes = total - concluidas;
  const xpTotal = quests.reduce((sum, q) => sum + q.xp, 0);
  const xpGanho = quests.filter((q) => q.concluida).reduce((sum, q) => sum + q.xp, 0);
  const progresso = total > 0 ? Math.round((concluidas / total) * 100) : 0;

  return { total, concluidas, pendentes, xpTotal, xpGanho, progresso, partial: options.partial === true };
}

export type StatusFilter = 'todas' | 'concluidas' | 'pendentes';

export function filterQuests(
  quests: Quest[],
  search: string,
  status: StatusFilter
): Quest[] {
  const normalized = search.trim().toLowerCase();
  return quests.filter((q) => {
    const matchesSearch = normalized === '' || q.titulo.toLowerCase().includes(normalized);
    const matchesStatus =
      status === 'todas' ||
      (status === 'concluidas' && q.concluida) ||
      (status === 'pendentes' && !q.concluida);
    return matchesSearch && matchesStatus;
  });
}
