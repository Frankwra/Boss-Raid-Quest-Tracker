import type { QuestStats } from '@/lib/stats';

interface StatsCardsProps {
  stats: QuestStats;
}

interface Card {
  label: string;
  value: string | number;
  hint?: string;
  accent: string;
}

export function StatsCards({ stats }: StatsCardsProps) {
  const cards: Card[] = [
    { label: 'Total de quests', value: stats.total, accent: 'bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100' },
    { label: 'Concluídas', value: stats.concluidas, accent: 'bg-green-100 text-green-900 dark:bg-green-800/40 dark:text-green-100' },
    { label: 'Pendentes', value: stats.pendentes, accent: 'bg-amber-100 text-amber-900 dark:bg-amber-800/40 dark:text-amber-100' },
    { label: 'XP total', value: stats.xpTotal, accent: 'bg-purple-100 text-purple-900 dark:bg-purple-800/40 dark:text-purple-100' },
    { label: 'XP ganho', value: stats.xpGanho, hint: 'de quests concluídas', accent: 'bg-blue-100 text-blue-900 dark:bg-blue-800/40 dark:text-blue-100' },
    { label: 'Progresso', value: `${stats.progresso}%`, accent: 'bg-rose-100 text-rose-900 dark:bg-rose-800/40 dark:text-rose-100' },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
      {cards.map((card) => (
        <div
          key={card.label}
          className={`rounded-lg p-3 ${card.accent}`}
        >
          <p className="text-xs font-medium uppercase tracking-wide opacity-80">{card.label}</p>
          <p className="mt-1 text-2xl font-bold">{card.value}</p>
          {card.hint && <p className="mt-0.5 text-xs opacity-70">{card.hint}</p>}
        </div>
      ))}
    </div>
  );
}
