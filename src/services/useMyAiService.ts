import { useAuth } from '@/context/AuthContext';
import { api } from '@/libs/api';
import { guestToken } from '@/libs/guestToken';

export type MyCharacter = {
  id: string;
  name: string;
  age: number;
  style: string;
  image_url: string | null;
  short_bio: string | null;
  tags: string[];
  like_count: number;
  total_chats: number;
  image_count: number;
  video_count: number;
  is_approved: boolean;
  created_at: string;
  creator: string;
};

type Pagination = {
  total: number;
  page: number;
  pageSize: number;
  pageCount: number;
};

type MyCharactersResponse = {
  success: boolean;
  message: string;
  content: {
    characters: MyCharacter[];
    pagination: Pagination;
  };
};

export const useMyAiService = () => {
  const { token } = useAuth();

  const getMyCharacters = (params?: { page?: number; limit?: number }) => {
    const query = new URLSearchParams();
    if (params?.page !== undefined) {
      query.set('page', String(params.page));
    }
    if (params?.limit !== undefined) {
      query.set('limit', String(params.limit));
    }
    const qs = query.toString();
    // Falls back to the guest session so signed-out visitors see whatever the
    // guest user owns instead of a bare 401.
    return api.get(`/my-ai/characters${qs ? `?${qs}` : ''}`, token ?? guestToken.get() ?? undefined) as Promise<MyCharactersResponse>;
  };

  return { getMyCharacters };
};
