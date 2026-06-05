import type { Quest } from '@/types/quest';
import type { CreateQuestInput, UpdateQuestInput } from './schemas';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3333';

class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const hasBody = init.body !== undefined && init.body !== null;
  const headers = hasBody
    ? { 'Content-Type': 'application/json', ...(init.headers ?? {}) }
    : { ...(init.headers ?? {}) };

  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    headers,
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({ message: res.statusText }));
    throw new ApiError(res.status, body.message ?? res.statusText);
  }

  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

export const questsApi = {
  findAll: () => request<Quest[]>('/api/quests'),
  findById: (id: string) => request<Quest>(`/api/quests/${id}`),
  create: (data: CreateQuestInput) =>
    request<Quest>('/api/quests', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: UpdateQuestInput) =>
    request<Quest>(`/api/quests/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  delete: (id: string) => request<void>(`/api/quests/${id}`, { method: 'DELETE' }),
};

export { ApiError };
