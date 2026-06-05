'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { questsApi } from '@/lib/api';
import { createQuestSchema, updateQuestSchema } from '@/lib/schemas';

type Mode = 'create' | 'edit';

interface QuestFormData {
  titulo: string;
  descricao?: string;
  xp: number;
  concluida?: boolean;
}

interface QuestFormProps {
  mode: Mode;
  questId?: string;
}

export function QuestForm({ mode, questId }: QuestFormProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const isEdit = mode === 'edit';

  const { data: existing, isLoading } = useQuery({
    queryKey: ['quests', questId],
    queryFn: () => questsApi.findById(questId!),
    enabled: isEdit && Boolean(questId),
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<QuestFormData>({
    resolver: zodResolver(isEdit ? updateQuestSchema : createQuestSchema) as never,
    defaultValues: isEdit
      ? undefined
      : { titulo: '', descricao: '', xp: 0 },
    values: isEdit && existing
      ? {
          titulo: existing.titulo,
          descricao: existing.descricao ?? '',
          xp: existing.xp,
          concluida: existing.concluida,
        }
      : undefined,
  });

  const mutation = useMutation({
    mutationFn: (data: QuestFormData) =>
      isEdit
        ? questsApi.update(questId!, {
            titulo: data.titulo,
            descricao: data.descricao || null,
            xp: data.xp,
            concluida: data.concluida,
          })
        : questsApi.create({
            titulo: data.titulo,
            descricao: data.descricao || undefined,
            xp: data.xp,
          }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quests'] });
      toast.success(isEdit ? 'Quest atualizada' : 'Quest criada');
      router.push('/');
    },
    onError: (error) => toast.error(`Erro: ${error.message}`),
  });

  if (isEdit && isLoading) {
    return <p className="text-zinc-500">Carregando...</p>;
  }

  return (
    <form
      onSubmit={handleSubmit((data) => mutation.mutate(data))}
      className="flex flex-col gap-4 max-w-md"
    >
      <label className="flex flex-col gap-1">
        <span className="text-sm font-medium">Título</span>
        <input
          {...register('titulo')}
          type="text"
          className="rounded border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder:text-zinc-500"
        />
        {errors.titulo && <span className="text-xs text-red-600">{errors.titulo.message}</span>}
      </label>

      <label className="flex flex-col gap-1">
        <span className="text-sm font-medium">Descrição (opcional)</span>
        <textarea
          {...register('descricao')}
          rows={3}
          className="rounded border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder:text-zinc-500"
        />
        {errors.descricao && <span className="text-xs text-red-600">{errors.descricao.message}</span>}
      </label>

      <label className="flex flex-col gap-1">
        <span className="text-sm font-medium">XP</span>
        <input
          {...register('xp')}
          type="number"
          min={0}
          className="rounded border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
        />
        {errors.xp && <span className="text-xs text-red-600">{errors.xp.message}</span>}
      </label>

      {isEdit && (
        <label className="flex items-center gap-2">
          <input {...register('concluida')} type="checkbox" className="h-4 w-4" />
          <span className="text-sm font-medium">Concluída</span>
        </label>
      )}

      {mutation.isError && <p className="text-sm text-red-600">Erro: {mutation.error.message}</p>}

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={isSubmitting || mutation.isPending}
          className="rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {isEdit ? 'Salvar alterações' : 'Criar quest'}
        </button>
        <button
          type="button"
          onClick={() => router.push('/')}
          className="rounded border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-900 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}
