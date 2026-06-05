'use client';

export function QuestListSkeleton() {
  return (
    <ul className="grid animate-pulse gap-4 sm:grid-cols-2 lg:grid-cols-3" aria-label="Carregando">
      {Array.from({ length: 6 }).map((_, i) => (
        <li
          key={i}
          className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900"
        >
          <div className="flex items-start justify-between gap-2">
            <div className="h-5 w-3/4 rounded bg-zinc-200 dark:bg-zinc-800" />
            <div className="h-5 w-12 rounded-full bg-zinc-200 dark:bg-zinc-800" />
          </div>
          <div className="mt-3 h-3 w-full rounded bg-zinc-200 dark:bg-zinc-800" />
          <div className="mt-1 h-3 w-2/3 rounded bg-zinc-200 dark:bg-zinc-800" />
          <div className="mt-4 flex gap-2">
            <div className="h-6 w-24 rounded bg-zinc-200 dark:bg-zinc-800" />
            <div className="h-6 w-16 rounded bg-zinc-200 dark:bg-zinc-800" />
            <div className="h-6 w-16 rounded bg-zinc-200 dark:bg-zinc-800" />
          </div>
        </li>
      ))}
    </ul>
  );
}
