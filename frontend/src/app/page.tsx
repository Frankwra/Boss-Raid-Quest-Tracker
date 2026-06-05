'use client';

import { useQuery } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import { QuestFilters } from '@/components/quest-filters';
import { QuestList } from '@/components/quest-list';
import { StatsCards } from '@/components/stats-cards';
import { questsApi } from '@/lib/api';
import { computeStats, filterQuests, type StatusFilter } from '@/lib/stats';

export default function HomePage() {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<StatusFilter>('todas');

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['quests'],
    queryFn: questsApi.findAll,
  });

  const quests = data ?? [];
  const stats = useMemo(() => computeStats(quests), [quests]);
  const filtered = useMemo(() => filterQuests(quests, search, status), [quests, search, status]);

  if (isLoading) return <p className="mx-auto max-w-6xl px-6 py-10 text-zinc-500">Carregando...</p>;
  if (isError)
    return <p className="mx-auto max-w-6xl px-6 py-10 text-red-600">Erro: {error.message}</p>;

  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-10">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Boss Raid Quest Tracker</h1>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          Gerencie as quests do seu raid
        </p>
      </div>

      <section className="mb-8">
        <StatsCards stats={stats} />
      </section>

      <section className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <QuestFilters
          search={search}
          status={status}
          onSearchChange={setSearch}
          onStatusChange={setStatus}
        />
        <a
          href="/nova"
          className="rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          + Nova quest
        </a>
      </section>

      {filtered.length === 0 ? (
        <p className="text-zinc-500">
          {quests.length === 0
            ? 'Nenhuma quest cadastrada. Crie a primeira!'
            : 'Nenhuma quest corresponde aos filtros.'}
        </p>
      ) : (
        <QuestList quests={filtered} />
      )}
    </div>
  );
}
