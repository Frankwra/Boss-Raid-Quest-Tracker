'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { QuestForm } from '@/components/quest-form';

export default function EditQuestPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id;

  if (!id) {
    return <p className="mx-auto max-w-2xl px-6 py-10 text-zinc-500">ID inválido.</p>;
  }

  return (
    <div className="mx-auto w-full max-w-2xl px-6 py-10">
      <div className="mb-6">
        <Link href="/" className="text-sm text-blue-600 hover:underline">
          ← Voltar
        </Link>
        <h1 className="mt-2 text-3xl font-bold">Editar quest</h1>
      </div>
      <QuestForm mode="edit" questId={id} />
    </div>
  );
}
