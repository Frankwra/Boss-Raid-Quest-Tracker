'use client';

import type { StatusFilter } from '@/lib/stats';

interface QuestFiltersProps {
  search: string;
  status: StatusFilter;
  onSearchChange: (value: string) => void;
  onStatusChange: (value: StatusFilter) => void;
}

export function QuestFilters({ search, status, onSearchChange, onStatusChange }: QuestFiltersProps) {
  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
      <input
        type="search"
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        placeholder="Buscar por título..."
        className="flex-1 rounded border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder:text-zinc-500"
      />
      <select
        value={status}
        onChange={(e) => onStatusChange(e.target.value as StatusFilter)}
        className="rounded border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
      >
        <option value="todas">Todas</option>
        <option value="concluidas">Concluídas</option>
        <option value="pendentes">Pendentes</option>
      </select>
    </div>
  );
}
