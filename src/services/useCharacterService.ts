import { useTranslations } from 'next-intl';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/libs/api';
import { guestToken } from '@/libs/guestToken';

/** One media entry; the API sends only `blur_url` for items the viewer cannot see. */
export type CharacterMediaItem = {
  id: string;
  image_url?: string | null;
  video_url?: string | null;
  blur_url?: string | null;
  width?: number | null;
  height?: number | null;
  orientation?: string | null;
  locked?: boolean;
};

type CharacterMediaResponse = {
  success: boolean;
  message: string;
  content: {
    items: CharacterMediaItem[];
    nextCursor: string | null;
    /** Whether the viewer owns this character's collection. */
    hasFullAccess: boolean;
  };
};

type PurchaseCollectionResponse = {
  success: boolean;
  message: string;
  content: {
    /** True when the viewer already owned the collection and was not charged again. */
    already_purchased: boolean;
    coin_cost: number;
    remaining_balance: number;
  };
};

export type CharacterVisibility = 'public' | 'unlisted' | 'private';

/**
 * Shape of `GET /characters/{id}`. Fields the API keeps behind `secrets_locked`
 * arrive only for the creator, so everything past the public summary is optional.
 */
export type CharacterDetail = {
  id: string;
  name: string;
  age: number | null;
  gender: string | null;
  style: string | null;
  image_url: string | null;
  short_bio: string | null;
  tags: string[] | null;
  visibility: CharacterVisibility;
  creator: string | null;
  appearance?: Partial<Record<string, string>> | null;
  voice_settings?: string | { voice_type?: string } | null;
  personality_archetype?: string | null;
  relationship_dynamic?: string | null;
  kinks?: string | string[] | null;
  hobby?: string | null;
  backstory?: string | null;
  scenario?: string | null;
  personality_details?: string | null;
  custom_physical_prompt?: string | null;
  custom_face_prompt?: string | null;
  greeting_message?: string | null;
};

type CreateCharacterBody = {
  style: string;
  appearance: Partial<Record<string, string>>;
  name?: string;
  age?: number;
  gender?: string;
  voice_type?: string;
  personality_archetype?: string;
  relationship_dynamic?: string;
  kinks?: string[];
  hobby?: string;
  backstory?: string;
  custom_physical_prompt?: string;
  custom_face_prompt?: string;
  personality_details?: string;
  tags?: string[];
  greeting_message?: string;
};

type AiEnrichBody = {
  name?: string;
  style: string;
  appearance: Partial<Record<string, string>>;
  personality_archetype?: string;
  relationship_dynamic?: string;
  kinks?: string[];
  hobby?: string;
};

export type UpdateCharacterBody = Partial<{
  style: string;
  appearance: Partial<{
    ethnic_influence: string;
    facial_shape: string;
    hair_color: string;
    hair_style: string;
    eye_color: string;
    eye_intensity: string;
    figure_type: string;
    bust_profile: string;
    hip_profile: string;
    skin_tone: string;
  }>;
  name: string;
  age: number;
  gender: string;
  voice_type: string;
  personality_archetype: string;
  relationship_dynamic: string;
  kinks: string[];
  hobby: string;
  backstory: string;
  custom_physical_prompt: string;
  custom_face_prompt: string;
  personality_details: string;
  tags: string[];
  greeting_message: string;
}>;

export const useCharacterService = () => {
  const { token } = useAuth();
  const t = useTranslations('Errors');

  // A character the viewer owns is only readable with their credentials, so the
  // guest token stands in for the signed-in one on characters made before sign-up.
  const getCharacter = (id: string) => api.get(`/characters/${id}`, token ?? guestToken.get() ?? undefined);

  const getCharacterMedia = (id: string, type: 'images' | 'videos', limit?: number) => {
    const query = new URLSearchParams({ type });
    if (limit !== undefined) {
      query.set('limit', String(limit));
    }
    return api.get(`/characters/${id}/media?${query.toString()}`, token ?? guestToken.get() ?? undefined) as Promise<CharacterMediaResponse>;
  };

  const likeCharacter = (id: string) => {
    if (!token) {
      return Promise.reject(new Error(t('not_authenticated')));
    }
    return api.post(`/characters/${id}/like`, {}, token);
  };

  const unlikeCharacter = (id: string) => {
    if (!token) {
      return Promise.reject(new Error(t('not_authenticated')));
    }
    return api.delete(`/characters/${id}/like`, token);
  };

  const purchaseCollection = (id: string) => {
    if (!token) {
      return Promise.reject(new Error(t('not_authenticated')));
    }
    return api.post(`/characters/${id}/purchase-collection`, {}, token) as Promise<PurchaseCollectionResponse>;
  };

  const getCreationOptions = () => api.get('/characters/creation-options');

  const createCharacter = (body: CreateCharacterBody) => {
    if (!token) {
      return Promise.reject(new Error(t('not_authenticated')));
    }
    return api.post('/characters', body as unknown as Record<string, unknown>, token);
  };

  const aiEnrich = (body: AiEnrichBody) => {
    if (!token) {
      return Promise.reject(new Error(t('not_authenticated')));
    }
    return api.post('/characters/ai-enrich', body as unknown as Record<string, unknown>, token);
  };

  const updateCharacter = (id: string, body: UpdateCharacterBody) => {
    if (!token) {
      return Promise.reject(new Error(t('not_authenticated')));
    }
    return api.patch(`/characters/${id}`, body as unknown as Record<string, unknown>, token);
  };

  const updateVisibility = (id: string, visibility: CharacterVisibility) => {
    if (!token) {
      return Promise.reject(new Error(t('not_authenticated')));
    }
    return api.patch(`/characters/${id}/visibility`, { visibility }, token);
  };

  const deleteCharacter = (id: string) => {
    if (!token) {
      return Promise.reject(new Error(t('not_authenticated')));
    }
    return api.delete(`/characters/${id}`, token);
  };

  const generateCharacterImage = (id: string) => {
    if (!token) {
      return Promise.reject(new Error(t('not_authenticated')));
    }
    return api.post(`/characters/${id}/generate-image`, {}, token) as Promise<{
      success: boolean;
      message: string;
      content: { generation_id: string; status: string };
    }>;
  };

  return {
    getCharacter,
    getCharacterMedia,
    likeCharacter,
    unlikeCharacter,
    purchaseCollection,
    getCreationOptions,
    createCharacter,
    aiEnrich,
    updateCharacter,
    updateVisibility,
    deleteCharacter,
    generateCharacterImage,
  };
};
