import { useAuth } from '@/context/AuthContext';
import { api } from '@/libs/api';

type CreateCharacterBody = {
  style: string;
  appearance: Partial<Record<string, string>>;
  name?: string;
  age?: number;
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
    api.get(`/characters/${id}/media?type=${type}`, token ?? undefined);

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
    return api.post(`/characters/${id}/purchase-collection`, {}, token);
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
  };
};
