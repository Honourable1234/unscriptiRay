'use client';

import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { CloseIcon, EditIcon, PlayIcon, SpinnerIcon } from '@/components/icons';
import { useAuth } from '@/context/AuthContext';
import { useGenerateService } from '@/services/generateService';
import { useCharacterService } from '@/services/useCharacterService';
import { eyeColorMap, hairColorMap, skinToneMap } from './colorMaps';

export type CreatedCharacter = {
  id: string;
  name: string;
  age: number;
  style: string;
  vibe: string;
  image_url: string;
  short_bio: string;
  bio: string;
  backstory: string;
  greeting_message: string;
  personality_archetype: string;
  relationship_dynamic: string;
  hobby: string;
  tags: string[];
  display_id: string;
  voice_type?: string;
  voice_settings?: string | { voice_type?: string };
  kinks?: string | string[];
  custom_physical_prompt?: string;
  custom_face_prompt?: string;
  personality_details?: string;
  appearance?: {
    ethnic_influence?: string;
    eye_color?: string;
    eye_intensity?: string;
    facial_shape?: string;
    figure_type?: string;
    hair_color?: string;
    hair_style?: string;
    hip_profile?: string;
    bust_profile?: string;
    skin_tone?: string;
  };
};

type Tab = 'appearance' | 'personality';

function lookupColor(map: Record<string, string>, name?: string): string {
  if (!name) {
    return '#1a1f2e';
  }
  return map[name] ?? '#1a1f2e';
}

function isLightColor(hex: string): boolean {
  const r = Number.parseInt(hex.slice(1, 3), 16);
  const g = Number.parseInt(hex.slice(3, 5), 16);
  const b = Number.parseInt(hex.slice(5, 7), 16);
  return (r * 299 + g * 587 + b * 114) / 1000 > 128;
}

type AccordionField = { label: string; value?: string; apiKey: string };

function AccordionEditList(props: {
  items: AccordionField[];
  characterId: string;
  onSaved: (apiKey: string, value: string) => void;
}) {
  const t = useTranslations('CreateStep4');
  const { updateCharacter } = useCharacterService();
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [draft, setDraft] = useState('');
  const [saving, setSaving] = useState(false);

  const openEdit = (item: AccordionField) => {
    setEditingKey(item.apiKey);
    setDraft(item.value ?? '');
  };

  const handleSave = async () => {
    if (!editingKey) {
      return;
    }
    setSaving(true);
    try {
      await updateCharacter(props.characterId, { [editingKey]: draft });
      props.onSaved(editingKey, draft);
      toast.success(t('saved'));
      setEditingKey(null);
    } catch {
      toast.error(t('save_failed'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      {props.items.map(item => (
        <div key={item.apiKey} className="rounded-xl bg-black-60">
          <div className="flex items-center justify-between gap-3 px-4 py-3">
            <div className="flex min-w-0 flex-col gap-1">
              <span className="text-sm font-semibold text-white-75">{item.label}</span>
              {editingKey !== item.apiKey && (
                <span className="truncate text-xs text-white">{item.value || '—'}</span>
              )}
            </div>
            <button
              type="button"
              onClick={() => editingKey === item.apiKey ? setEditingKey(null) : openEdit(item)}
              className="shrink-0 cursor-pointer text-white-75 hover:text-white"
            >
              {editingKey === item.apiKey ? <CloseIcon /> : <EditIcon />}
            </button>
          </div>
          {editingKey === item.apiKey && (
            <div className="flex flex-col gap-2 px-4 pb-4">
              <textarea
                value={draft}
                onChange={e => setDraft(e.target.value)}
                rows={4}
                className="w-full resize-none rounded-xl border border-white-25/30 bg-transparent px-3 py-2 text-xs text-white outline-none placeholder:text-white-25 focus:border-white-50"
              />
              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="cursor-pointer self-end rounded-lg bg-primary-100 px-4 py-1.5 text-xs font-semibold text-white disabled:opacity-50"
              >
                {saving ? <SpinnerIcon /> : t('save')}
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export const CreateStep4 = (props: {
  character: CreatedCharacter | null;
  generationId?: string | null;
  onTagsChange?: (tags: string[]) => void;
  onImageGenerated?: (url: string) => void;
}) => {
  const t = useTranslations('CreateStep4');
  const router = useRouter();
  const { token } = useAuth();
  const { generateCharacterImage } = useCharacterService();
  const { pollGenerationStatus } = useGenerateService();
  const [tab, setTab] = useState<Tab>('appearance');
  const [localCharacter, setLocalCharacter] = useState<CreatedCharacter | null>(props.character);
  const [tags, setTags] = useState<string[]>(props.character?.tags ?? []);
  const [tagInput, setTagInput] = useState('');
  const [imageUrl, setImageUrl] = useState(props.character?.image_url ?? '');
  const [progress, setProgress] = useState(0);
  const [failed, setFailed] = useState(false);
  const stopPollingRef = useRef<(() => void) | null>(null);

  const onFieldSaved = (apiKey: string, value: string) => {
    setLocalCharacter(prev => prev ? { ...prev, [apiKey]: value } : prev);
  };

  const runImageGeneration = async (characterId: string, existingGenerationId?: string) => {
    setFailed(false);
    setProgress(0);
    stopPollingRef.current?.();
    try {
      let genId = existingGenerationId;
      if (!genId) {
        const res = await generateCharacterImage(characterId);
        genId = res.content.generation_id;
      }
      setProgress(10);
      stopPollingRef.current = pollGenerationStatus(
        genId,
        (result) => {
          setProgress(100);
          if (result.url) {
            setImageUrl(result.url);
            props.onImageGenerated?.(result.url);
          } else {
            setFailed(true);
          }
        },
        () => setFailed(true),
      );
    } catch {
      setFailed(true);
    }
  };

  useEffect(() => {
    const characterId = props.character?.id;
    if (imageUrl || !characterId || !token || !props.generationId) {
      return;
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void runImageGeneration(characterId, props.generationId);
    return () => stopPollingRef.current?.();
  }, [props.character?.id, props.generationId, token, imageUrl]);

  const tabs: { label: string; value: Tab }[] = [
    { label: t('tab_appearance'), value: 'appearance' },
    { label: t('tab_personality'), value: 'personality' },
  ];

  if (!localCharacter) {
    return (
      <div className="flex h-64 items-center justify-center rounded-2xl border border-white-25/30">
        <p className="text-sm text-white-50">{t('no_character')}</p>
      </div>
    );
  }

  const c = localCharacter ?? props.character;
  const a = c.appearance ?? {};
  const displayImage = imageUrl || '/Create/GenerateImage.jpg';
  const isGenerating = !imageUrl;

  const voiceValue = typeof c.voice_settings === 'object' ? c.voice_settings?.voice_type : (c.voice_settings ?? c.voice_type);
  const kinkValue = Array.isArray(c.kinks) ? c.kinks.join(', ') : c.kinks;

  const appearanceAttrs: { label: string; value?: string | number }[] = [
    { label: t('voice'), value: voiceValue },
    { label: t('ethnic'), value: a.ethnic_influence },
    { label: t('facial_shape'), value: a.facial_shape },
    { label: t('hair_style'), value: a.hair_style },
    { label: t('eye_intensity'), value: a.eye_intensity },
    { label: t('figure_type'), value: a.figure_type },
    { label: t('bust'), value: a.bust_profile },
    { label: t('hip'), value: a.hip_profile },
  ];

  const personalityGrid: { label: string; value?: string }[] = [
    { label: t('personality_attr'), value: c.personality_archetype },
    { label: t('relationship'), value: c.relationship_dynamic },
    { label: t('kinks_comforts'), value: kinkValue },
    { label: t('social_role'), value: c.hobby },
  ];

  const personalityAccordion: AccordionField[] = [
    { label: t('backstory'), value: c.backstory, apiKey: 'backstory' },
    { label: t('physical'), value: c.custom_physical_prompt, apiKey: 'custom_physical_prompt' },
    { label: t('face_details'), value: c.custom_face_prompt, apiKey: 'custom_face_prompt' },
    { label: t('greeting'), value: c.greeting_message, apiKey: 'greeting_message' },
    { label: t('personality_details'), value: c.personality_details, apiKey: 'personality_details' },
  ];

  const colorTabs: { key: string; label: string; value?: string; map: Record<string, string> }[] = [
    { key: 'hair_color', label: t('hair_color'), value: a.hair_color, map: hairColorMap },
    { key: 'eye_color', label: t('eye_color'), value: a.eye_color, map: eyeColorMap },
    { key: 'skin_tone', label: t('skin_tone'), value: a.skin_tone, map: skinToneMap },
  ];

  return (
    <div className="flex flex-col gap-8 pb-10">
      {/* Tab toggle — full width above both panels */}
      <div className="mx-auto flex w-full max-w-xs rounded-xl border border-black-40 bg-black-100 p-1">
        {tabs.map(t => (
          <button
            key={t.value}
            type="button"
            onClick={() => setTab(t.value)}
            className={`flex-1 rounded-lg px-4 py-3 text-sm font-medium transition-colors ${tab === t.value ? 'border border-primary-100 bg-primary-100/10 text-primary-100' : 'text-white hover:text-white-75'}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap items-start justify-center gap-6">
        {/* Left: image — always visible */}
        <div className="flex max-w-87 min-w-60 flex-1 flex-col gap-2">
          <p className="mb-6 text-center text-white">{t('preview')}</p>
          <div className="relative h-121 w-full overflow-hidden rounded-2xl">
            <Image
              src={displayImage}
              alt={c.name || 'Character'}
              fill
              sizes="(max-width: 640px) 100vw, 350px"
              className="object-cover"
            />
            {isGenerating && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/60 px-8">
                {failed
                  ? (
                      <>
                        <p className="text-sm font-semibold text-white">{t('image_failed')}</p>
                        <button
                          type="button"
                          onClick={() => void runImageGeneration(c.id)}
                          className="cursor-pointer rounded-xl bg-primary-100 px-6 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
                        >
                          {t('retry')}
                        </button>
                      </>
                    )
                  : (
                      <>
                        <p className="text-sm font-semibold text-white">{t('generate_process')}</p>
                        <div className="h-4 w-full max-w-49 overflow-hidden rounded-full bg-white">
                          <div className="h-full rounded-full bg-primary-100 transition-all duration-700" style={{ width: `${progress}%` }} />
                        </div>
                        <p className="text-sm text-white">
                          {progress}
                          %
                        </p>
                      </>
                    )}
              </div>
            )}
          </div>
        </div>

        {/* Right: tab content */}
        <div className="flex max-w-sm min-w-60 flex-1 flex-col gap-4 rounded-3xl border border-black-40 p-4">

          {tab === 'appearance' && (
            <>
              <div className="flex flex-wrap gap-3">
                {appearanceAttrs.map(attr => (
                  <div key={attr.label} className={`max-w-55 min-w-40 flex-1 rounded-xl bg-black-60 p-3 ${attr.label === 'Voice' ? 'flex items-center justify-between' : 'flex flex-col gap-1'}`}>
                    <div className="flex flex-col gap-1">
                      <span className="text-sm font-semibold text-white-75">{attr.label}</span>
                      <span className="text-sm font-semibold text-white capitalize">{attr.value ?? '—'}</span>
                    </div>
                    {attr.label === 'Voice' && (
                      <span className="text-primary-100"><PlayIcon /></span>
                    )}
                  </div>
                ))}
              </div>

              <div className="flex gap-2">
                {colorTabs.map((ct) => {
                  const bg = lookupColor(ct.map, ct.value);
                  const light = isLightColor(bg);
                  return (
                    <div
                      key={ct.key}
                      style={{ backgroundColor: bg, color: light ? '#111827' : '#ffffff' }}
                      className="flex h-15 flex-1 items-center justify-center rounded-xl px-3 text-sm font-semibold"
                    >
                      {ct.label}
                    </div>
                  );
                })}
              </div>
            </>
          )}

          {tab === 'personality' && (
            <>
              <div className="grid grid-cols-2 gap-3">
                {personalityGrid.map(attr => (
                  <div key={attr.label} className="flex flex-col gap-1 rounded-xl bg-black-60 p-3">
                    <span className="text-sm font-semibold text-white-75">{attr.label}</span>
                    <span className="text-sm font-semibold text-white capitalize">{attr.value ?? '—'}</span>
                  </div>
                ))}
              </div>

              <AccordionEditList items={personalityAccordion} characterId={c.id} onSaved={onFieldSaved} />
            </>
          )}

          <div className="flex flex-col gap-2">
            <span className="text-sm text-white-75">{t('tags', { count: tags.length })}</span>
            <div className="flex flex-wrap items-center gap-2 rounded-xl border border-white-25/30 px-3 py-2.5">
              {tags.map(tag => (
                <span key={tag} className="flex items-center gap-1 rounded-md bg-primary-100/20 px-2 py-1 text-xs text-primary-100">
                  {tag}
                  <button
                    type="button"
                    onClick={() => {
                      const next = tags.filter(t => t !== tag);
                      setTags(next);
                      props.onTagsChange?.(next);
                    }}
                    className="cursor-pointer hover:text-white"
                  >
                    <CloseIcon />
                  </button>
                </span>
              ))}
              {tags.length < 10 && (
                <input
                  type="text"
                  value={tagInput}
                  onChange={e => setTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key !== 'Enter') {
                      return;
                    }
                    e.preventDefault();
                    const v = tagInput.trim();
                    if (v && !tags.includes(v)) {
                      const next = [...tags, v];
                      setTags(next);
                      props.onTagsChange?.(next);
                    }
                    setTagInput('');
                  }}
                  placeholder={t('tag_placeholder')}
                  className="min-w-20 flex-1 bg-transparent text-xs text-white outline-none placeholder:text-white-25"
                />
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={() => router.push('/my-ai')}
            className="w-full cursor-pointer rounded-xl bg-primary-100 py-4 text-sm font-semibold text-white transition-opacity hover:opacity-90"
          >
            {t('meet_companion')}
          </button>
        </div>
      </div>
    </div>
  );
};
