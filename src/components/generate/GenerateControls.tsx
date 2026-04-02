'use client';

import { useState } from 'react';

const visualOptions = [
  { value: 'Cinematic', description: 'High-quality results with strong prompt accuracy' },
  { value: 'Realistic', description: 'Ultra-realistic visuals with enhanced lighting' },
  { value: 'Anime', description: 'Stylised anime aesthetic with vivid colours' },
];

const orientationOptions = [
  { value: '4:5', boxW: 'w-13', boxH: 'h-18' },
  { value: '5:4', boxW: 'w-18', boxH: 'h-14' },
  { value: '9:16', boxW: 'w-11', boxH: 'h-14' },
  { value: '16:9', boxW: 'w-14', boxH: 'h-11' },
  { value: '1:1', boxW: 'w-10', boxH: 'h-10' },
];

export const GenerateControls = (props: {
  visual: string;
  orientation: string;
  onVisualChange: (v: string) => void;
  onOrientationChange: (v: string) => void;
}) => {
  const [visualOpen, setVisualOpen] = useState(false);
  const [orientationOpen, setOrientationOpen] = useState(false);

  return (
    <div className="flex flex-wrap items-center justify-start gap-3">
      <div className="relative">
        <button
          onClick={() => setVisualOpen(prev => !prev)}
          className="flex cursor-pointer items-center gap-1 rounded-xl border border-black-40 bg-black-100 px-6 py-3 text-sm font-medium text-white-50 transition-colors hover:border-primary-100"
        >
          Visual:
          <span className="text-white">{props.visual}</span>
        </button>
        {visualOpen && (
          <div className="absolute top-full left-0 z-50 mt-1 w-65 max-w-100 rounded-xl border border-white-25 bg-black-100 py-1 shadow-lg sm:w-screen">
            {visualOptions.map(opt => (
              <button
                key={opt.value}
                onClick={() => {
                  props.onVisualChange(opt.value);
                  setVisualOpen(false);
                }}
                className="flex w-full cursor-pointer items-center justify-between px-4 py-3 text-left hover:bg-black-60"
              >
                <div className="flex flex-col gap-0.5">
                  <span className="text-sm font-semibold text-white">{opt.value}</span>
                  <span className="text-xs text-white-75">{opt.description}</span>
                </div>
                {props.visual === opt.value && (
                  <div className="rounded-full bg-primary-100 p-1">
                    <svg width="12" height="12" viewBox="0 0 16 16" fill="none" className="shrink-0 text-white">
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
          className="flex cursor-pointer items-center gap-1 rounded-xl border border-black-40 bg-black-100 px-6 py-3 text-sm font-medium text-white-50 transition-colors hover:border-primary-100"
        >
          Orientation:
          <span className="text-white">{props.orientation}</span>
        </button>
        {orientationOpen && (
          <div className="absolute top-full left-0 z-50 mt-1 rounded-xl border border-white-25 bg-black-100 p-4 shadow-lg">
            <div className="flex items-end gap-3">
              {orientationOptions.map((opt) => {
                const isSelected = props.orientation === opt.value;
                return (
                  <button
                    key={opt.value}
                    onClick={() => {
                      props.onOrientationChange(opt.value);
                      setOrientationOpen(false);
                    }}
                    className={`flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 text-xs font-medium transition-colors ${opt.boxW} ${opt.boxH} ${isSelected ? 'border-primary-100 text-primary-100' : 'border-white text-white-75 hover:border-white-50'}`}
                  >
                    {opt.value}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
