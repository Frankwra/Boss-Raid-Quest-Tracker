'use client';

import { useEffect } from 'react';
import { ErrorState } from '@/components/error-state';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto w-full max-w-2xl px-6 py-16">
      <ErrorState message={error.message || 'Erro inesperado'} onRetry={reset} />
    </div>
  );
}
