import { useAuth } from '@/context/AuthContext';
import { api } from '@/libs/api';
import { guestToken } from '@/libs/guestToken';

export type Asset = {
  id: string;
  url: string;
  type: string;
  width: number | null;
  height: number | null;
  /** Orientation the asset was generated with, e.g. `4:5`. */
  orientation: string | null;
  character_id: string | null;
  created_at: string;
};

type RawImageAsset = {
  id: string;
  character_id: string | null;
  image_url: string;
  prompt: string | null;
  width: number | null;
  height: number | null;
  misc: Record<string, unknown> | null;
  created_at: string;
};

type RawVideoAsset = {
  id: string;
  character_id: string | null;
  video_url: string;
  width: number | null;
  height: number | null;
  misc: Record<string, unknown> | null;
  created_at: string;
};

type Preset = {
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

/** Preset types the presets endpoint accepts as a `type` filter; anything else is rejected. */
type PresetType
  = | 'action'
    | 'setting'
    | 'mood'
    | 'voice'
    | 'style_preset'
    | 'web-image-gen-location'
    | 'web-image-gen-outfit'
    | 'web-image-gen-pose';

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

type RawGeneratedAssetsResponse = {
  success: boolean;
  message: string;
  content: {
    images: RawImageAsset[];
    videos: RawVideoAsset[];
    pagination: Pagination;
  };
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

/**
 * Reads the orientation an asset was generated with from its misc payload.
 * @param misc - Generation metadata attached to the asset.
 * @returns The orientation string, or null when the payload has none.
 */
const miscOrientation = (misc: Record<string, unknown> | null | undefined) =>
  typeof misc?.orientation === 'string' ? misc.orientation : null;

/**
 * Normalizes a raw image asset into the shared asset shape used across the generate UI.
 * @param image - Image entry as returned by the assets endpoint.
 * @returns The image as a normalized asset.
 */
const toAsset = (image: RawImageAsset): Asset => ({
  id: image.id,
  url: image.image_url,
  type: 'image',
  width: image.width,
  height: image.height,
  orientation: miscOrientation(image.misc),
  character_id: image.character_id,
  created_at: image.created_at,
});

/**
 * Normalizes a raw video asset into the shared asset shape used across the generate UI.
 * @param video - Video entry as returned by the assets endpoint.
 * @returns The video as a normalized asset.
 */
const toVideoAsset = (video: RawVideoAsset): Asset => ({
  id: video.id,
  url: video.video_url,
  type: 'video',
  width: video.width,
  height: video.height,
  orientation: miscOrientation(video.misc),
  character_id: video.character_id,
  created_at: video.created_at,
});

/**
 * Resolves the CSS aspect ratio of a generated asset, preferring its real pixel
 * dimensions and falling back to the orientation it was generated with.
 * @param asset - Asset to size.
 * @returns An `aspect-ratio` value such as `1568 / 1960`.
 */
export const assetAspectRatio = (asset: Pick<Asset, 'width' | 'height' | 'orientation'>) => {
  if (asset.width && asset.height) {
    return `${asset.width} / ${asset.height}`;
  }
  const [width, height] = asset.orientation?.split(':') ?? [];
  return width && height ? `${width} / ${height}` : '4 / 5';
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
  // Reads fall back to the guest session so signed-out visitors can browse;
  // writes stay signed-in only and surface the sign-up prompt instead.
  const readToken = () => token ?? guestToken.get() ?? undefined;

  const getPresets = (type?: PresetType) =>
    api.get(`/generate/presets${type ? `?type=${type}` : ''}`, readToken()) as Promise<PresetsResponse>;

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
    return (api.get(`/generate/assets${qs ? `?${qs}` : ''}`, readToken()) as Promise<RawGeneratedAssetsResponse>)
      .then(res => ({
        ...res,
        content: {
          ...res.content,
          images: res.content.images.map(toAsset),
          videos: res.content.videos.map(toVideoAsset),
        },
      }));
  };

  const getGeneratedAsset = (assetId: string) => api.get(`/generate/assets/${assetId}`, readToken());

  const getGenerationStatus = (generationId: string) =>
    api.get(`/generate/status/${generationId}`, readToken()) as Promise<{
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
    advanced_prompt?: string;
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
    advanced_prompt?: string;
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
    // The model is serverless and can cold-start (~1-3min) on the first request
    // after idle, which can surface as a spurious `failed` status. Auto-retry
    // once within that window before treating it as a real failure.
    const coldStartRetryWindowMs = 180000;
    const start = Date.now();
    let currentId = generationId;
    let retriedForColdStart = false;
    let stopped = false;
    let timerId: ReturnType<typeof setTimeout>;

    const tick = () => {
      if (stopped) {
        return;
      }
      if (Date.now() - start > timeoutMs) {
        onError('Generation timed out');
        return;
      }
      getGenerationStatus(currentId).then((res) => {
        if (stopped) {
          return;
        }
        const { status } = res.content;
        if (status === 'complete' || status === 'completed') {
          onComplete(res.content);
        } else if (status === 'failed' || status === 'error') {
          if (!retriedForColdStart && Date.now() - start < coldStartRetryWindowMs) {
            retriedForColdStart = true;
            retryGeneration(currentId).then((retryRes) => {
              if (stopped) {
                return;
              }
              currentId = retryRes.content.generation_id;
              timerId = setTimeout(tick, intervalMs);
            }).catch(() => {
              if (!stopped) {
                onError('Generation failed');
              }
            });
          } else {
            onError('Generation failed');
          }
        } else {
          timerId = setTimeout(tick, intervalMs);
        }
      }).catch(() => {
        if (!stopped) {
          timerId = setTimeout(tick, intervalMs);
        }
      });
    };

    timerId = setTimeout(tick, intervalMs);
    return () => {
      stopped = true;
      clearTimeout(timerId);
    };
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
