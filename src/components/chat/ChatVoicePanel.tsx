'use client';

import { useTranslations } from 'next-intl';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'react-toastify';
import { PlayIcon, SearchIcon, VoiceIcon } from '@/components/icons';
import { useChatNavigation } from '@/context/ChatContext';
import { useChatService } from '@/services/useChatService';
import { useVoices } from '@/services/UseVoice';

type Voice = { localName: string; shortName: string; gender: 'Female' | 'Male'; sampleUrl: string };
type ApiVoice = { localName: string; shortName: string; gender: string; sampleUrl: string };

export const ChatVoicePanel = () => {
  const t = useTranslations('ChatVoicePanel');
  const { getVoices } = useVoices();
  const { activeChat, voiceId, setVoiceId } = useChatNavigation();
  const { updateVoice } = useChatService();
  const [voices, setVoices] = useState<Voice[] | null>(null);
  const [error, setError] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playingShortName, setPlayingShortName] = useState<string | null>(null);
  const [savingShortName, setSavingShortName] = useState<string | null>(null);
  const [query, setQuery] = useState('');

  const handleSelect = (voice: Voice) => {
    if (!activeChat || savingShortName || voice.shortName === voiceId) {
      return;
    }
    const previous = voiceId;
    setVoiceId(voice.shortName);
    setSavingShortName(voice.shortName);
    updateVoice(activeChat.chatroomId, voice.shortName)
      .catch(() => {
        setVoiceId(previous);
        toast.error(t('toast_update_failed'));
      })
      .finally(() => setSavingShortName(null));
  };

  useEffect(() => {
    getVoices().then((res: unknown) => {
      const items = (res as { content?: ApiVoice[] })?.content;
      if (Array.isArray(items)) {
        setVoices(items
          .filter(v => v.gender === 'Female' || v.gender === 'Male')
          .map(v => ({ localName: v.localName, shortName: v.shortName, gender: v.gender as 'Female' | 'Male', sampleUrl: v.sampleUrl })));
      }
    }).catch(() => setError(true));
    return () => audioRef.current?.pause();
  }, []);

  const handlePlay = (voice: Voice) => {
    if (!voice.sampleUrl) {
      return;
    }
    if (audioRef.current) {
      audioRef.current.pause();
      if (playingShortName === voice.shortName) {
        setPlayingShortName(null);
        return;
      }
    }
    const audio = new Audio(voice.sampleUrl);
    audioRef.current = audio;
    setPlayingShortName(voice.shortName);
    audio.play().catch(() => {});
    audio.onended = () => setPlayingShortName(null);
  };

  if (!voices) {
    return <div className="px-4 py-3 text-sm text-white-50">{error ? t('load_failed') : t('loading')}</div>;
  }

  const filtered = query.trim()
    ? voices.filter(v => v.localName.toLowerCase().includes(query.trim().toLowerCase()))
    : voices;
  const female = filtered.filter(v => v.gender === 'Female');
  const male = filtered.filter(v => v.gender === 'Male');

  return (
    <div className="flex flex-col gap-6 px-4 py-3">
      <div className="relative">
        <span className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-white-50 [&>svg]:h-4 [&>svg]:w-4">
          <SearchIcon />
        </span>
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder={t('search_placeholder')}
          className="w-full rounded-2xl border border-black-40 bg-black-60/40 py-2.5 pr-4 pl-10 text-sm text-white placeholder-white-50 focus:border-primary-100 focus:outline-none"
        />
      </div>

      {female.length === 0 && male.length === 0 && (
        <div className="px-4 py-3 text-center text-sm text-white-50">{t('no_voices')}</div>
      )}

      {([{ label: t('female'), items: female }, { label: t('male'), items: male }] as const).map(group => group.items.length > 0 && (
        <div key={group.label} className="flex flex-col gap-3">
          <span className="text-sm font-semibold text-white">{group.label}</span>
          <div className="flex flex-col gap-2">
            {group.items.map(v => (
              <div
                key={v.shortName}
                className={`flex items-center justify-between rounded-2xl border px-4 py-3 transition-colors ${v.shortName === voiceId ? 'border-primary-100 bg-primary-100/10' : 'border-black-40 bg-black-60/40'}`}
              >
                <button
                  onClick={() => handleSelect(v)}
                  disabled={!!savingShortName}
                  className="flex flex-1 cursor-pointer items-center gap-2 text-left disabled:cursor-default"
                >
                  <span className="text-sm text-white">{v.localName}</span>
                  {v.shortName === voiceId && (
                    <span className="rounded-full bg-primary-100 px-2 py-0.5 text-[10px] font-semibold text-white">{t('selected')}</span>
                  )}
                </button>

                <button
                  onClick={() => handlePlay(v)}
                  className={`flex h-7 w-7 shrink-0 cursor-pointer items-center justify-center rounded-full transition-colors ${playingShortName === v.shortName ? 'bg-primary-100' : 'bg-primary-800'}`}
                >
                  {playingShortName === v.shortName ? <VoiceIcon /> : <PlayIcon />}
                </button>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};
