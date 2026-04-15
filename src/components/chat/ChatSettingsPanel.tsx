'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/libs/api';

type WebSettings = {
  allow_character_messages: boolean;
  background_display: boolean;
  language: string;
  lust_level: string;
  response_length: string;
};

const LUST_LEVELS = ['friendly', 'moderate', 'explicit'];
const RESPONSE_LENGTHS = ['short', 'medium', 'long'];
const LANGUAGES = ['english', 'spanish', 'french', 'german', 'portuguese', 'italian', 'japanese', 'korean'];

const ToggleRow = (props: { label: string; value: boolean; onChange: (v: boolean) => void }) => (
  <div className="flex items-center justify-between px-4 py-3.5">
    <span className="text-sm text-white">{props.label}</span>
    <button
      onClick={() => props.onChange(!props.value)}
      className={`relative h-6 w-11 cursor-pointer rounded-full transition-colors ${props.value ? 'bg-primary-100' : 'bg-black-40'}`}
    >
      <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${props.value ? 'translate-x-5.5' : 'translate-x-0.5'}`} />
    </button>
  </div>
);

const SelectRow = (props: { label: string; value: string; options: string[]; onChange: (v: string) => void }) => (
  <div className="flex items-center justify-between px-4 py-3.5">
    <span className="text-sm text-white">{props.label}</span>
    <select
      value={props.value}
      onChange={e => props.onChange(e.target.value)}
      className="cursor-pointer rounded-lg bg-black-40 px-2 py-1 text-xs text-white capitalize focus:outline-none"
    >
      {props.options.map(o => (
        <option key={o} value={o} className="capitalize">{o}</option>
      ))}
    </select>
  </div>
);

export const ChatSettingsPanel = (props: { chatroomId: string }) => {
  const { token } = useAuth();
  const [settings, setSettings] = useState<WebSettings | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get(`/chat/${props.chatroomId}/settings`, token ?? undefined).then((res) => {
      const ws = res?.content?.web_settings as WebSettings | undefined;
      if (ws) {
        setSettings(ws);
      }
    });
  }, [props.chatroomId, token]);

  const patch = (update: Partial<WebSettings>) => {
    if (saving) {
      return;
    }
    const next = { ...settings, ...update } as WebSettings;
    setSettings(next);
    setSaving(true);
    api.patch(`/chat/${props.chatroomId}/settings`, { web_settings: next }, token ?? undefined)
      .finally(() => setSaving(false));
  };

  if (!settings) {
    return <div className="px-4 py-3 text-sm text-white-50">Loading…</div>;
  }

  return (
    <div className="flex flex-col divide-y divide-black-40">
      {saving && <div className="px-4 py-1 text-right text-xs text-white-50">Saving…</div>}
      <ToggleRow
        label="Allow character messages"
        value={settings.allow_character_messages}
        onChange={v => patch({ allow_character_messages: v })}
      />
      <ToggleRow
        label="Background display"
        value={settings.background_display}
        onChange={v => patch({ background_display: v })}
      />
      <SelectRow
        label="Lust level"
        value={settings.lust_level}
        options={LUST_LEVELS}
        onChange={v => patch({ lust_level: v })}
      />
      <SelectRow
        label="Response length"
        value={settings.response_length}
        options={RESPONSE_LENGTHS}
        onChange={v => patch({ response_length: v })}
      />
      <SelectRow
        label="Language"
        value={settings.language}
        options={LANGUAGES}
        onChange={v => patch({ language: v })}
      />
    </div>
  );
};
