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

export type Preset = {
  id: string;
  preset_type: string;
  name: string;
  display_name: string;
  image_url: string | null;
  display_order: number;
};

type PresetsResponse = {
  success: boolean;
  message: string;
  content: Preset[];
};

/**
 * Filters presets by type (singular or plural) and sorts them by display order.
 * @param presets - Full preset list returned by the presets endpoint.
 * @param type - Singular preset type to keep, e.g. `action` or `visual`.
 * @returns The matching presets ordered for display.
 */
export const presetsOfType = (presets: Preset[], type: string) =>
  presets
    .filter(p => p.preset_type?.toLowerCase().replace(/s$/, '') === type)
    .sort((a, b) => a.display_order - b.display_order);

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

type GenerationStatus = {
  generation_id: string;
  type: string;
  status: string;
  url: string | null;
};

type GetGeneratedAssetsParams = {
  filter?: 'all' | 'image' | 'video';
  sort?: 'newest' | 'oldest';
  character_id?: string;
  page?: number;
  limit?: number;
};

type GenerateResult = Promise<{
  success: boolean;
  message: string;
  content: { generation_id: string; status: string };
}>;

export const useGenerateService = () => {
  const { token } = useAuth();

  const getPresets = () => api.get('/generate/presets', token ?? undefined) as Promise<PresetsResponse>;

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

  const getGenerationStatus = (generationId: string) =>
    api.get(`/generate/status/${generationId}`, token ?? undefined) as Promise<{
      success: boolean;
      content: GenerationStatus;
    }>;

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
  }): GenerateResult => {
    if (!token) {
      return Promise.reject(new Error('Not authenticated'));
    }
    return api.post('/generate/image', body, token) as GenerateResult;
  };

  const editImage = (body: {
    asset_id: string;
    visual?: string;
    model?: string;
    orientation?: string;
  }): GenerateResult => {
    if (!token) {
      return Promise.reject(new Error('Not authenticated'));
    }
    return api.post('/generate/edit', body, token) as GenerateResult;
  };

  const uploadReference = async (file: File): Promise<{ key: string; url: string }> => {
    if (!token) {
      return Promise.reject(new Error('Not authenticated'));
    }
    const res = await api.post('/generate/upload-reference', {
      content_type: file.type,
      filename: file.name,
    }, token) as { success: boolean; content: { uploadUrl: string; url: string; key: string } };

    await fetch(res.content.uploadUrl, {
      method: 'PUT',
      body: file,
      headers: { 'Content-Type': file.type },
    });

    return { key: res.content.key, url: res.content.url };
  };

  const enhanceGeneratedImage = (assetId: string) => {
    if (!token) {
      return Promise.reject(new Error('Not authenticated'));
    }
    return api.post('/generate/enhance', { asset_id: assetId }, token) as Promise<{
      success: boolean;
      message: string;
      content: { asset_id: string; status: string; generation_id?: string };
    }>;
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
  }): GenerateResult => {
    if (!token) {
      return Promise.reject(new Error('Not authenticated'));
    }
    return api.post('/generate/animation', body, token) as GenerateResult;
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
  }): GenerateResult => {
    if (!token) {
      return Promise.reject(new Error('Not authenticated'));
    }
    return api.post('/generate/speech', body, token) as GenerateResult;
  };

  const retryGeneration = (generationId: string): GenerateResult => {
    if (!token) {
      return Promise.reject(new Error('Not authenticated'));
    }
    return api.post(`/generate/${generationId}/retry`, {}, token) as GenerateResult;
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
    return api.delete('/generate/assets/batch', token, body) as Promise<{
      success: boolean;
      message: string;
      content: { deleted_count: number };
    }>;
  };

  const pollGenerationStatus = (
    generationId: string,
    onComplete: (result: GenerationStatus) => void,
    onError: (message: string) => void,
    intervalMs = 3000,
    timeoutMs = 300000,
  ): (() => void) => {
    const start = Date.now();
    let timerId: ReturnType<typeof setTimeout>;

    const tick = () => {
      if (Date.now() - start > timeoutMs) {
        onError('Generation timed out');
        return;
      }
      getGenerationStatus(generationId).then((res) => {
        const { status } = res.content;
        if (status === 'complete' || status === 'completed') {
          onComplete(res.content);
        } else if (status === 'failed' || status === 'error') {
          onError('Generation failed');
        } else {
          timerId = setTimeout(tick, intervalMs);
        }
      }).catch(() => {
        timerId = setTimeout(tick, intervalMs);
      });
    };

    timerId = setTimeout(tick, intervalMs);
    return () => clearTimeout(timerId);
  };
  return {
    getPresets,
    getGeneratedAssets,
    getGeneratedAsset,
    getGenerationStatus,
    generateImage,
    editImage,
    uploadReference,
    generateVideo,
    generateSpeech,
    retryGeneration,
    enhanceGeneratedImage,
    enrichPrompt,
    deleteAsset,
    deleteAssets,
    pollGenerationStatus,
  };
};
