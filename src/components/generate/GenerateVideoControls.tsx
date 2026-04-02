'use client';

import { useState } from 'react';
import { SpeechIcon, StackedCoinIcon } from '@/components/icons';

const qualityOptions: { value: string; label: string; description: string; coins?: number }[] = [
  { value: 'Balanced', label: 'Balance (480p)', description: 'Best for outfits, backgrounds and effects' },
  { value: 'Ultra', label: 'Ultra (1080p)', description: 'Optimized for NSFW and anatomical detail', coins: 100 },
];

const orientationOptions = [
  { value: '4:5', boxW: 'w-10', boxH: 'h-12' },
  { value: '5:4', boxW: 'w-12', boxH: 'h-10' },
  { value: '9:16', boxW: 'w-8', boxH: 'h-14' },
  { value: '16:9', boxW: 'w-14', boxH: 'h-8' },
  { value: '1:1', boxW: 'w-11', boxH: 'h-11' },
];

const durationOptions: { value: string; coins?: number }[] = [
  { value: '5s' },
  { value: '10s', coins: 100 },
  { value: '15s', coins: 200 },
  { value: '20s', coins: 300 },
  { value: '30s', coins: 500 },
];

export const GenerateVideoControls = (props: {
  quality: string;
  orientation: string;
  duration: string;
  audio: boolean;
  onQualityChange: (v: string) => void;
  onOrientationChange: (v: string) => void;
  onDurationChange: (v: string) => void;
  onAudioToggle: () => void;
}) => {
  const [qualityOpen, setQualityOpen] = useState(false);
  const [orientationOpen, setOrientationOpen] = useState(false);
  const [durationOpen, setDurationOpen] = useState(false);

  return (
    <div className="justify-between sm:flex">
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative">
          <button
            onClick={() => setQualityOpen(prev => !prev)}
            className="flex cursor-pointer items-center gap-1 rounded-xl border border-black-40 bg-black-100 px-3 py-3 text-sm font-medium text-white-50 transition-colors hover:border-primary-100"
          >
            Quality Level:
            <span className="font-bold text-white">{props.quality}</span>
          </button>
          {qualityOpen && (
            <div className="absolute top-full left-0 z-50 mt-1 w-screen max-w-72 rounded-xl border border-white-25 bg-black-100 py-1 shadow-lg">
              {qualityOptions.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => {
                    props.onQualityChange(opt.value);
                    setQualityOpen(false);
                  }}
                  className="flex w-full cursor-pointer items-center justify-between px-4 py-3 text-left hover:bg-black-60"
                >
                  <div className="flex flex-col gap-0.5">
                    <span className="text-sm font-semibold text-white">{opt.label}</span>
                    <span className="text-xs text-white-75">{opt.description}</span>
                    {opt.coins && (
                      <span className="mt-1 flex w-fit items-center gap-1 rounded-lg bg-black-40 px-2 py-1 text-xs font-semibold text-white">
                        {opt.coins}
                        {' '}
                        <StackedCoinIcon />
                      </span>
                    )}
                  </div>
                  {props.quality === opt.value && (
                    <div className="shrink-0 rounded-full bg-primary-100 p-1">
                      <svg width="12" height="12" viewBox="0 0 16 16" fill="none" className="text-white">
                        <path d="M3 8l3.5 3.5L13 4.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
        <div className="relative">
          <button
            onClick={() => setOrientationOpen(prev => !prev)}
            className="flex cursor-pointer items-center gap-1 rounded-xl border border-black-40 bg-black-100 px-3 py-3 text-sm font-medium text-white-50 transition-colors hover:border-primary-100"
          >
            Orientation:
            <span className="font-bold text-white">{props.orientation}</span>
          </button>
          {orientationOpen && (
            <div className="absolute top-full left-0 z-50 mt-1 rounded-xl border border-white-25 bg-black-100 p-4 shadow-lg">
              <div className="flex items-end gap-3">
                {orientationOptions.map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => {
                      props.onOrientationChange(opt.value);
                      setOrientationOpen(false);
                    }}
                    className={`flex cursor-pointer flex-col items-center justify-center rounded-lg border text-xs font-medium transition-colors ${opt.boxW} ${opt.boxH} ${props.orientation === opt.value ? 'border-primary-100 text-primary-100' : 'border-white-25 text-white-75 hover:border-white-50'}`}
                  >
                    {opt.value}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
        <div className="relative">
          <button
            onClick={() => setDurationOpen(prev => !prev)}
            className="flex cursor-pointer items-center gap-1 rounded-xl border border-black-40 bg-black-100 px-3 py-3 text-sm font-medium text-white-50 transition-colors hover:border-primary-100"
          >
            Duration:
            <span className="font-bold text-white">{props.duration}</span>
          </button>
          {durationOpen && (
            <div className="absolute top-full left-0 z-50 mt-1 w-screen max-w-60 rounded-xl border border-white-25 bg-black-100 py-1 shadow-lg">
              {durationOptions.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => {
                    props.onDurationChange(opt.value);
                    setDurationOpen(false);
                  }}
                  className="flex w-full cursor-pointer items-center justify-between px-4 py-3 text-left hover:bg-black-60"
                >
                  <span className="text-sm font-semibold text-white">{opt.value}</span>
                  <div className="flex items-center gap-2">
                    {opt.coins && (
                      <span className="flex items-center gap-1 rounded-lg bg-black-40 px-2 py-1 text-xs font-semibold text-white">
                        {opt.coins}
                        {' '}
                        <StackedCoinIcon />
                      </span>
                    )}
                    {props.duration === opt.value && (
                      <div className="shrink-0 rounded-full bg-primary-100 p-1">
                        <svg width="12" height="12" viewBox="0 0 16 16" fill="none" className="text-white">
                          <path d="M3 8l3.5 3.5L13 4.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
      <button
        onClick={props.onAudioToggle}
        className={`flex cursor-pointer items-center gap-1 rounded-xl border px-3 py-3 text-sm font-medium transition-colors ${props.audio ? 'border-primary-100 bg-primary-100/10 text-primary-100' : 'border-black-40 bg-black-100 text-white-50 hover:border-primary-100'}`}
      >
        <SpeechIcon />
        Audio
      </button>
    </div>
  );
};
