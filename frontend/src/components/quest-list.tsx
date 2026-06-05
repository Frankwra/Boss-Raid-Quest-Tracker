'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import type { Quest } from '@/types/quest';
import { questsApi } from '@/lib/api';
import { DeleteQuestButton } from './delete-quest-button';

interface QuestListProps {
  quests: Quest[];
}

export function QuestList({ quests }: QuestListProps) {
  const queryClient = useQueryClient();

  const toggleMutation = useMutation({
    mutationFn: ({ id, concluida }: { id: string; concluida: boolean }) =>
      questsApi.update(id, { concluida }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['quests'] }),
  });

  return (
    <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {quests.map((quest) => (
        <li
          key={quest.id}
          className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
        >
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">{quest.titulo}</h3>
            <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
              {quest.xp} XP
            </span>
          </div>
          {quest.descricao && (
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">{quest.descricao}</p>
          )}
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => toggleMutation.mutate({ id: quest.id, concluida: !quest.concluida })}
              disabled={toggleMutation.isPending}
              className={`rounded px-3 py-1 text-xs font-medium transition-colors ${
                quest.concluida
                  ? 'bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-300'
                  : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300'
              }`}
            >
              {quest.concluida ? '✓ Concluída' : 'Marcar concluída'}
            </button>
            <Link
              href={`/quests/${quest.id}`}
              className="rounded bg-blue-100 px-3 py-1 text-xs font-medium text-blue-800 hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-300"
            >
              Editar
            </Link>
            <DeleteQuestButton id={quest.id} titulo={quest.titulo} />
          </div>
        </li>
      ))}
    </ul>
  );
}
