import type { DiscoverItem } from '@/components/feed/FeedCard';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/libs/api';
import { Env } from '@/libs/Env';

type DiscoverResponse = {
  items: DiscoverItem[];
  nextCursor: string | null;
  seed: string | null;
};

export class FeedLimitError extends Error {
  constructor(detail: string) {
    super(detail);
    this.name = 'FeedLimitError';
  }
}

export const useFeedService = () => {
  const { token } = useAuth();

  const getDiscoverVideos = async (options: { cursor?: string; seed?: string; limit?: number } = {}): Promise<{ content: DiscoverResponse }> => {
    const params = new URLSearchParams({ limit: String(options.limit ?? 10) });
    if (options.cursor) {
      params.set('cursor', options.cursor);
    }
    if (options.seed) {
      params.set('seed', options.seed);
    }
    const res = await fetch(`${Env.NEXT_PUBLIC_API_URL}/discover/videos?${params.toString()}`, {
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
    const body = await res.json() as { success: boolean; error?: string; detail?: string; content?: DiscoverResponse };
    if (!res.ok) {
      if (body.error === 'DISCOVER_LIMIT_REACHED') {
        throw new FeedLimitError(body.detail ?? 'Daily discover limit reached');
      }
      throw new Error(body.detail ?? `HTTP ${res.status}`);
    }
    return body as { content: DiscoverResponse };
  };

  const likeAsset = (assetId: string) => {
    if (!token) {
      return Promise.reject(new Error('Not authenticated'));
    }
    return api.post(`/feed/${assetId}/like`, {}, token);
  };

  const unlikeAsset = (assetId: string) => {
    if (!token) {
      return Promise.reject(new Error('Not authenticated'));
    }
    return api.delete(`/feed/${assetId}/like`, token);
  };

  return { getDiscoverVideos, likeAsset, unlikeAsset };
};
