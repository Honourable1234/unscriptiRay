import { Env } from './Env';

export const api = {
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
