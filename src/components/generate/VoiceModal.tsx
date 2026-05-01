'use client';

import { useEffect, useRef, useState } from 'react';
import { CloseIcon, PlayIcon, VoiceIcon } from '@/components/icons';
import { useVoices } from '@/services/UseVoice';

type Voice = { localName: string; shortName: string; gender: 'Female' | 'Male'; sampleUrl: string };

type ApiVoice = { localName: string; shortName: string; gender: string; sampleUrl: string };

export const VoiceModal = (props: {
  selected: string;
  onSelect: (voice: string) => void;
  onClose: () => void;
}) => {
  const { getVoices } = useVoices();
  const [voices, setVoices] = useState<Voice[] | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playingShortName, setPlayingShortName] = useState<string | null>(null);

  useEffect(() => {
    const fetchVoices = async () => {
      try {
        const response = await getVoices() as { content?: ApiVoice[] };
        if (response.content && response.content.length > 0) {
          const mapped = response.content
            .filter(v => v.gender === 'Female' || v.gender === 'Male')
            .map(v => ({
              localName: v.localName,
              shortName: v.shortName,
              gender: v.gender as 'Female' | 'Male',
              sampleUrl: v.sampleUrl,
            }));
          setVoices(mapped);
        }
      } catch (error) {
        console.error('Failed to fetch voices:', error);
      }
    };
    fetchVoices();
  }, []);

  const handlePlay = (voice: Voice, e: React.MouseEvent) => {
    e.stopPropagation();
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

  const female = voices?.filter(v => v.gender === 'Female');
  const male = voices?.filter(v => v.gender === 'Male');

  return (
    <div className="fixed inset-0 z-70 flex items-start justify-center overflow-y-auto bg-black/80 p-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      <div className="my-auto w-full max-w-160 rounded-2xl border border-white-25 bg-black-80 px-4 py-6 md:px-7.5">
        <div className="mb-5 flex items-center justify-between border-b border-black-40 pb-4">
          <h2 className="text-base font-semibold text-white">Select Voice</h2>
          <button onClick={props.onClose} className="cursor-pointer text-white-75 hover:text-white">
            <CloseIcon />
          </button>
        </div>

        <div className="flex flex-col gap-6">
          {([{ label: 'Female', items: female }, { label: 'Male', items: male }] as const).map(group => (
            <div key={group.label} className="flex flex-col gap-3">
              <span className="text-sm font-semibold text-white">{group.label}</span>
              <div className="grid grid-cols-3 gap-2">
                {group?.items?.map(v => (
                  <button
                    key={v.shortName}
                    onClick={() => {
                      props.onSelect(v.shortName);
                    }}
                    className={`flex cursor-pointer items-center justify-between rounded-xl border px-4 py-3 transition-colors ${props.selected === v.shortName ? 'border-primary-100' : 'border-black-40 bg-black-100 hover:border-primary-100'}`}
                  >
                    <span className="text-sm font-medium text-white">{v.localName}</span>
                    {' '}
                    <div>
                      <button
                        onClick={e => handlePlay(v, e)}
                        className={`flex h-7 w-7 shrink-0 cursor-pointer items-center justify-center rounded-full transition-colors ${playingShortName === v.shortName ? 'bg-primary-100' : 'bg-primary-800'}`}
                      >
                        {playingShortName === v.shortName ? <VoiceIcon /> : <PlayIcon />}
                      </button>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6">
          <button
            onClick={props.onClose}
            className="w-full cursor-pointer rounded-xl bg-primary-100 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};
