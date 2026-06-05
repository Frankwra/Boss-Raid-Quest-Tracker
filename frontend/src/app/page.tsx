'use client';

import { useQuery } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import { ErrorState } from '@/components/error-state';
import { Pagination } from '@/components/pagination';
import { QuestFilters } from '@/components/quest-filters';
import { QuestList } from '@/components/quest-list';
import { QuestListSkeleton } from '@/components/quest-list-skeleton';
import { StatsCards } from '@/components/stats-cards';
import { questsApi } from '@/lib/api';
import { computeStats, filterQuests, type StatusFilter } from '@/lib/stats';

export default function HomePage() {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<StatusFilter>('todas');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['quests', page, limit],
    queryFn: () => questsApi.findAll({ page, limit }),
  });

  const quests = data?.data ?? [];
  const pagination = data?.pagination;
  const stats = useMemo(() => computeStats(quests, { partial: true }), [quests]);
  const filtered = useMemo(() => filterQuests(quests, search, status), [quests, search, status]);

  function handleLimitChange(newLimit: number) {
    setLimit(newLimit);
    setPage(1);
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-10">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">Boss Raid Quest Tracker</h1>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          Gerencie as quests do seu raid
        </p>
      </div>

      {isLoading ? (
        <>
          <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="h-20 animate-pulse rounded-lg bg-zinc-200 dark:bg-zinc-800"
              />
            ))}
          </div>
          <QuestListSkeleton />
        </>
      ) : isError ? (
        <ErrorState message={error.message} onRetry={() => refetch()} />
      ) : (
        <>
          <section className="mb-8">
            <StatsCards stats={stats} />
            {stats.partial && (
              <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
                Estatisticas da pagina atual. Para totais globais, navegue pelas paginas.
              </p>
            )}
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
              {quests.length === 0 && pagination?.total === 0
                ? 'Nenhuma quest cadastrada. Crie a primeira!'
                : 'Nenhuma quest corresponde aos filtros.'}
            </p>
          ) : (
            <QuestList quests={filtered} />
          )}

          {pagination && pagination.total > 0 && (
            <div className="mt-6">
              <Pagination
                pagination={pagination}
                onPageChange={setPage}
                onLimitChange={handleLimitChange}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}
