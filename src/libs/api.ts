import { Env } from './Env';

export const api = {
  get: async (path: string, token?: string) => {
    const res = await fetch(`${Env.NEXT_PUBLIC_API_URL}${path}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
    return res.json();
  },
  delete: async (path: string, token?: string) => {
    const res = await fetch(`${Env.NEXT_PUBLIC_API_URL}${path}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
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
    return res.json();
  },
};
