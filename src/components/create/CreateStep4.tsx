'use client';

import Image from 'next/image';
import { useState } from 'react';
import { CloseIcon, EditIcon, PlayIcon } from '@/components/icons';
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

const tabs: { label: string; value: Tab }[] = [
  { label: 'Appearance', value: 'appearance' },
  { label: 'Personality', value: 'personality' },
];

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

export const CreateStep4 = (props: { character: CreatedCharacter | null }) => {
  const [tab, setTab] = useState<Tab>('appearance');
  const [tags, setTags] = useState<string[]>(props.character?.tags ?? []);
  const [tagInput, setTagInput] = useState('');

  if (!props.character) {
    return (
      <div className="flex h-64 items-center justify-center rounded-2xl border border-white-25/30">
        <p className="text-sm text-white-50">No character data available.</p>
      </div>
    );
  }

  const c = props.character;
  const a = c.appearance ?? {};
  const imageUrl = c.image_url || '/Create/GenerateImage.jpg';
  const isGenerating = !c.image_url;

  const voiceValue = typeof c.voice_settings === 'object' ? c.voice_settings?.voice_type : (c.voice_settings ?? c.voice_type);
  const kinkValue = Array.isArray(c.kinks) ? c.kinks[0] : c.kinks;

  const appearanceAttrs: { label: string; value?: string | number }[] = [
    { label: 'Voice', value: voiceValue },
    { label: 'Ethnic', value: a.ethnic_influence },
    { label: 'Facial Shape', value: a.facial_shape },
    { label: 'Hair Style', value: a.hair_style },
    { label: 'Eye Intensity', value: a.eye_intensity },
    { label: 'Figure Type', value: a.figure_type },
    { label: 'Bust', value: a.bust_profile },
    { label: 'Hip', value: a.hip_profile },
  ];

  const personalityGrid: { label: string; value?: string }[] = [
    { label: 'Personality', value: c.personality_archetype },
    { label: 'Relationship', value: c.relationship_dynamic },
    { label: 'Kinks & Comforts', value: kinkValue },
    { label: 'Social Role', value: c.hobby },
  ];

  const personalityAccordion: { label: string; value?: string }[] = [
    { label: 'Backstory', value: c.backstory },
    { label: 'Physical', value: c.custom_physical_prompt },
    { label: 'Face Details', value: c.custom_face_prompt },
    { label: 'Greeting', value: c.greeting_message },
    { label: 'Personality Details', value: c.personality_details },
  ];

  const colorTabs: { key: string; label: string; value?: string; map: Record<string, string> }[] = [
    { key: 'hair_color', label: 'Hair Color', value: a.hair_color, map: hairColorMap },
    { key: 'eye_color', label: 'Eye Color', value: a.eye_color, map: eyeColorMap },
    { key: 'skin_tone', label: 'Skin Tone', value: a.skin_tone, map: skinToneMap },
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
          <p className="mb-6 text-center text-white">Preview Character</p>
          <div className="relative h-121 w-full overflow-hidden rounded-2xl">
            <Image
              src={imageUrl}
              alt={c.name || 'Character'}
              fill
              className="object-cover"
            />
            {isGenerating && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/60 px-8">
                <p className="text-sm font-semibold text-white">Generate Process</p>
                <div className="h-4 w-full max-w-49 overflow-hidden rounded-full bg-white">
                  <div className="h-full w-[45%] rounded-full bg-primary-100" />
                </div>
                <p className="text-sm text-white">45%</p>
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

              <div className="flex flex-col gap-2">
                {personalityAccordion.map(item => (
                  <div key={item.label} className="flex items-center justify-between gap-3 rounded-xl bg-black-60 px-4 py-3">
                    <div className="flex min-w-0 flex-col gap-1">
                      <span className="text-sm font-semibold text-white-75">{item.label}</span>
                      <span className="truncate text-xs text-white">{item.value || '—'}</span>
                    </div>
                    <span className="shrink-0 text-white-75"><EditIcon /></span>
                  </div>
                ))}
              </div>
            </>
          )}

          <div className="flex flex-col gap-2">
            <span className="text-sm text-white-75">
              Tags (
              {tags.length}
              /10)
            </span>
            <div className="flex flex-wrap items-center gap-2 rounded-xl border border-white-25/30 px-3 py-2.5">
              {tags.map(tag => (
                <span key={tag} className="flex items-center gap-1 rounded-md bg-primary-100/20 px-2 py-1 text-xs text-primary-100">
                  {tag}
                  <button type="button" onClick={() => setTags(tags.filter(t => t !== tag))} className="cursor-pointer hover:text-white"><CloseIcon /></button>
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
                      setTags([...tags, v]);
                    }
                    setTagInput('');
                  }}
                  placeholder="Add tag..."
                  className="min-w-20 flex-1 bg-transparent text-xs text-white outline-none placeholder:text-white-25"
                />
              )}
            </div>
          </div>

          <button
            type="button"
            className="w-full cursor-pointer rounded-xl bg-primary-100 py-4 text-sm font-semibold text-white transition-opacity hover:opacity-90"
          >
            Meet Your Companion
          </button>
        </div>
      </div>
    </div>
  );
};
