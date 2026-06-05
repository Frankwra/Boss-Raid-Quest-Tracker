import Link from 'next/link';
import { QuestForm } from '@/components/quest-form';

export default function NewQuestPage() {
  return (
    <div className="mx-auto w-full max-w-2xl px-6 py-10">
      <div className="mb-6">
        <Link href="/" className="text-sm text-blue-600 hover:underline">
          ← Voltar
        </Link>
        <h1 className="mt-2 text-3xl font-bold">Nova quest</h1>
      </div>
      <QuestForm mode="create" />
    </div>
  );
}
