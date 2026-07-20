'use client';

import type { WebSettings } from '@/services/useChatService';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { ChevronDownIcon } from '@/components/icons';
import { useChatService } from '@/services/useChatService';

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
      <span className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${props.value ? 'translate-x-5' : 'translate-x-0'}`} />
    </button>
  </div>
);

const SelectRow = (props: { label: string; value: string; options: string[]; onChange: (v: string) => void }) => (
  <div className="flex items-center justify-between px-4 py-3.5">
    <span className="text-sm text-white">{props.label}</span>
    <div className="relative">
      <select
        value={props.value}
        onChange={e => props.onChange(e.target.value)}
        className="cursor-pointer appearance-none rounded-full border border-black-40 bg-black-60/40 py-1.5 pr-7 pl-3 text-xs text-white capitalize focus:border-primary-100 focus:outline-none"
      >
        {props.options.map(o => (
          <option key={o} value={o} className="capitalize">{o}</option>
        ))}
      </select>
      <span className="pointer-events-none absolute top-1/2 right-2.5 -translate-y-1/2 text-white-50 [&>svg]:h-2.5 [&>svg]:w-2.5">
        <ChevronDownIcon />
      </span>
    </div>
  </div>
);

export const ChatSettingsPanel = (props: { chatroomId: string; onBackgroundDisplayChange?: (v: boolean) => void }) => {
  const t = useTranslations('ChatSettingsPanel');
  const { getSettings, updateSettings } = useChatService();
  const [settings, setSettings] = useState<WebSettings | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    getSettings(props.chatroomId).then((res) => {
      const ws = res?.content?.web_settings as WebSettings | undefined;
      if (ws) {
        setSettings(ws);
      }
    }).catch(() => setError(true));
  }, [props.chatroomId]);

  const patch = (update: Partial<WebSettings>) => {
    if (saving) {
      return;
    }
    const prev = settings;
    const next = { ...settings, ...update } as WebSettings;
    setSettings(next);
    if (typeof update.background_display === 'boolean') {
      props.onBackgroundDisplayChange?.(update.background_display);
    }
    setSaving(true);
    updateSettings(props.chatroomId, next)
      .then(() => {
        toast.success('Settings saved.');
      })
      .catch(() => {
        toast.error('Failed to save settings.');
        setSettings(prev);
      })
      .finally(() => setSaving(false));
  };

  if (!settings) {
    return <div className="px-4 py-3 text-sm text-white-50">{error ? t('error') : t('loading')}</div>;
  }

  return (
    <div className="flex flex-col divide-y divide-black-40">
      <ToggleRow
        label={t('allow_messages')}
        value={settings.allow_character_messages}
        onChange={v => patch({ allow_character_messages: v })}
      />
      <ToggleRow
        label={t('background_display')}
        value={settings.background_display}
        onChange={v => patch({ background_display: v })}
      />
      <SelectRow
        label={t('lust_level')}
        value={settings.lust_level}
        options={LUST_LEVELS}
        onChange={v => patch({ lust_level: v })}
      />
      <SelectRow
        label={t('response_length')}
        value={settings.response_length}
        options={RESPONSE_LENGTHS}
        onChange={v => patch({ response_length: v })}
      />
      <SelectRow
        label={t('language')}
        value={settings.language}
        options={LANGUAGES}
        onChange={v => patch({ language: v })}
      />
      {saving && <div className="px-4 py-2 text-right text-xs text-white-50">{t('saving')}</div>}
    </div>
  );
};
