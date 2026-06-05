'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { questsApi } from '@/lib/api';

export function DeleteQuestButton({ id, titulo }: { id: string; titulo: string }) {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: () => questsApi.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['quests'] }),
  });

  function handleClick() {
    if (window.confirm(`Deletar "${titulo}"?`)) {
      mutation.mutate();
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={mutation.isPending}
      className="rounded bg-red-100 px-3 py-1 text-xs font-medium text-red-800 hover:bg-red-200 disabled:opacity-50 dark:bg-red-900/30 dark:text-red-300"
    >
      {mutation.isPending ? 'Deletando...' : 'Deletar'}
    </button>
  );
}
