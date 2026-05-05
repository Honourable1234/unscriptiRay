import { Env } from './Env';

const inFlight = new Map<string, Promise<unknown>>();

export const api = {
  get: async (path: string, token?: string) => {
    const key = `${token ?? ''}|${path}`;
    const existing = inFlight.get(key);
    if (existing) {
      return existing;
    }

    const promise = fetch(`${Env.NEXT_PUBLIC_API_URL}${path}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    }).then(async (res) => {
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error((body as { message?: string; detail?: string })?.message ?? (body as { detail?: string })?.detail ?? `HTTP ${res.status}`);
      }
      return res.json();
    }).finally(() => inFlight.delete(key));

    inFlight.set(key, promise);
    return promise;
  },
  delete: async (path: string, token?: string, body?: Record<string, unknown>) => {
    const res = await fetch(`${Env.NEXT_PUBLIC_API_URL}${path}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      ...(body ? { body: JSON.stringify(body) } : {}),
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error((body as { message?: string; detail?: string })?.message ?? (body as { detail?: string })?.detail ?? `HTTP ${res.status}`);
    }
    return res.json();
  },
  patch: async (path: string, body: Record<string, unknown>, token?: string) => {
    const res = await fetch(`${Env.NEXT_PUBLIC_API_URL}${path}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error((body as { message?: string; detail?: string })?.message ?? (body as { detail?: string })?.detail ?? `HTTP ${res.status}`);
    }

    return res.json();
  },
  post: async (path: string, body: Record<string, unknown>, token?: string) => {
    const res = await fetch(`${Env.NEXT_PUBLIC_API_URL}${path}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error((body as { message?: string; detail?: string })?.message ?? (body as { detail?: string })?.detail ?? `HTTP ${res.status}`);
    }

    return res.json();
  },
};
