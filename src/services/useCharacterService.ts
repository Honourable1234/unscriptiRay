import { useAuth } from '@/context/AuthContext';
import { api } from '@/libs/api';

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

export type CharacterMediaResponse = {
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

type UpdateCharacterBody = Partial<{
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

  const getCharacter = (id: string) => api.get(`/characters/${id}`);

  const getCharacterMedia = (id: string, type: 'images' | 'videos') =>
    api.get(`/characters/${id}/media?type=${type}`, token ?? undefined) as Promise<CharacterMediaResponse>;

  const likeCharacter = (id: string) => {
    if (!token) {
      return Promise.reject(new Error('Not authenticated'));
    }
    return api.post(`/characters/${id}/like`, {}, token);
  };

  const unlikeCharacter = (id: string) => {
    if (!token) {
      return Promise.reject(new Error('Not authenticated'));
    }
    return api.delete(`/characters/${id}/like`, token);
  };

  const purchaseCollection = (id: string) => {
    if (!token) {
      return Promise.reject(new Error('Not authenticated'));
    }
    return api.post(`/characters/${id}/purchase-collection`, {}, token) as Promise<PurchaseCollectionResponse>;
  };

  const getCreationOptions = () => api.get('/characters/creation-options');

  const createCharacter = (body: CreateCharacterBody) => {
    if (!token) {
      return Promise.reject(new Error('Not authenticated'));
    }
    return api.post('/characters', body as unknown as Record<string, unknown>, token);
  };

  const aiEnrich = (body: AiEnrichBody) => {
    if (!token) {
      return Promise.reject(new Error('Not authenticated'));
    }
    return api.post('/characters/ai-enrich', body as unknown as Record<string, unknown>, token);
  };

  const updateCharacter = (id: string, body: UpdateCharacterBody) => {
    if (!token) {
      return Promise.reject(new Error('Not authenticated'));
    }
    return api.patch(`/characters/${id}`, body as unknown as Record<string, unknown>, token);
  };

  const generateCharacterImage = (id: string) => {
    if (!token) {
      return Promise.reject(new Error('Not authenticated'));
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
    generateCharacterImage,
  };
};
