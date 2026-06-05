import Link from 'next/link';
import { QuestList } from '@/components/quest-list';

export default function HomePage() {
  return (
    <div className="mx-auto w-full max-w-5xl px-6 py-10">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Quests</h1>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            Gerencie as quests do seu raid
          </p>
        </div>
        <Link
          href="/nova"
          className="rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          + Nova quest
        </Link>
      </div>
      <QuestList />
    </div>
  );
}
