import { useAuth } from '@/context/AuthContext';
import { api } from '@/libs/api';

type Asset = {
  id: string;
  url: string;
  type: string;
  width: number;
  height: number;
  created_at: string;
};

type Pagination = {
  total: number;
  page: number;
  pageSize: number;
  pageCount: number;
};

export type GeneratedAssetsResponse = {
  success: boolean;
  message: string;
  content: {
    images: Asset[];
    videos: Asset[];
    pagination: Pagination;
  };
};

type GetGeneratedAssetsParams = {
  filter?: 'all' | 'image' | 'video';
  sort?: 'newest' | 'oldest';
  character_id?: string;
  page?: number;
  limit?: number;
};

export const useGenerateService = () => {
  const { token } = useAuth();

  const imagePreset = () => api.get('/generate/image-presets', token ?? undefined);

  const getPresets = () => api.get('/generate/presets', token ?? undefined);

  const getGeneratedAssets = (params?: GetGeneratedAssetsParams) => {
    const query = new URLSearchParams();
    if (params?.filter) {
      query.set('filter', params.filter);
    }
    if (params?.sort) {
      query.set('sort', params.sort);
    }
    if (params?.character_id) {
      query.set('character_id', params.character_id);
    }
    if (params?.page !== undefined) {
      query.set('page', String(params.page));
    }
    if (params?.limit !== undefined) {
      query.set('limit', String(params.limit));
    }
    const qs = query.toString();
    return api.get(`/generate/assets${qs ? `?${qs}` : ''}`, token ?? undefined) as Promise<GeneratedAssetsResponse>;
  };

  const getGeneratedAsset = (assetId: string) => api.get(`/generate/assets/${assetId}`, token ?? undefined);

  const generateImage = (body: {
    character_ids?: string[];
    reference_image_key?: string;
    action?: string;
    setting?: string;
    mood?: string;
    visual?: string;
    orientation?: string;
    advanced_prompt?: string;
    quality?: string;
    negative_prompt?: string;
    face_negative_prompt?: string;
  }) => {
    if (!token) {
      return Promise.reject(new Error('Not authenticated'));
    }
    return api.post('/generate/image', body, token) as Promise<{
      success: boolean;
      message: string;
      content: { generation_id: string; status: string };
    }>;
  };

  const enhanceGeneratedImage = (assetId: string) => {
    if (!token) {
      return Promise.reject(new Error('Not authenticated'));
    }
    return api.post('/generate/enhance', { asset_id: assetId }, token);
  };

  const generateVideo = (body: {
    character_ids?: string[];
    mode?: string;
    action?: string;
    setting?: string;
    mood?: string;
    source_image_id?: string;
    motion?: string;
    voice_type?: string;
    script?: string;
    scene_emotion?: string;
    quality?: string;
    orientation?: string;
    duration?: number;
  }) => {
    if (!token) {
      return Promise.reject(new Error('Not authenticated'));
    }
    return api.post('/generate/animation', body, token) as Promise<{
      success: boolean;
      message: string;
      content: { generation_id: string; status: string };
    }>;
  };
  const generateSpeech = (body: {
    character_ids?: string[];
    mode?: string;
    action?: string;
    setting?: string;
    mood?: string;
    source_image_id?: string;
    motion?: string;
    voice_type?: string;
    script?: string;
    scene_emotion?: string;
    quality?: string;
    orientation?: string;
    duration?: number;
  }) => {
    if (!token) {
      return Promise.reject(new Error('Not authenticated'));
    }
    return api.post('/generate/speech', body, token) as Promise<{
      success: boolean;
      message: string;
      content: { generation_id: string; status: string };
    }>;
  };

  const deleteAsset = (assetId: string) => {
    if (!token) {
      return Promise.reject(new Error('Not authenticated'));
    }
    return api.delete(`/generate/assets/${assetId}`, token) as Promise<{
      success: boolean;
      message: string;
      content: { deleted: boolean; asset_id: string; type: string };
    }>;
  };

  const enrichPrompt = (body: { prompt: string; character_id?: string }) => {
    if (!token) {
      return Promise.reject(new Error('Not authenticated'));
    }
    return api.post('/generate/enrich', body, token) as Promise<{
      success: boolean;
      message: string;
      content: { enriched_prompt: string };
    }>;
  };

  const deleteAssets = (body: { asset_ids: string[]; type: 'image' | 'video' }) => {
    if (!token) {
      return Promise.reject(new Error('Not authenticated'));
    }
    return api.delete('/generate/assets', token, body) as Promise<{
      success: boolean;
      message: string;
      content: { deleted_count: number };
    }>;
  };

  return { imagePreset, getPresets, getGeneratedAssets, getGeneratedAsset, generateImage, generateVideo, generateSpeech, enhanceGeneratedImage, enrichPrompt, deleteAsset, deleteAssets };
};
