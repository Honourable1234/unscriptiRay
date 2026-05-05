'use client';
import type { CreatedCharacter } from '@/components/create/CreateStep4';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { CreateStep1 } from '@/components/create/CreateStep1';
import { CreateStep2 } from '@/components/create/CreateStep2';
import { CreateStep3 } from '@/components/create/CreateStep3';
import { CreateStep4 } from '@/components/create/CreateStep4';
import { CreateStepper } from '@/components/create/CreateStepper';
import { ForwardArrowIcon, SpinnerIcon, StackedCoinIcon } from '@/components/icons';
import { CreateProvider, useCreate } from '@/context/CreateContext';
import { useCharacterService } from '@/services/useCharacterService';

const steps = [CreateStep1, CreateStep2, CreateStep3];

const appearanceKeys = ['ethnic_influence', 'eye_color', 'eye_intensity', 'facial_shape', 'figure_type', 'hair_color', 'hair_style', 'hip_profile', 'bust_profile', 'skin_tone'];

const getInitialStep = (): number => {
  try {
    if (sessionStorage.getItem('create_character')) {
      return 4;
    }
    const raw = sessionStorage.getItem('create_form');
    if (!raw) {
      return 1;
    }
    const d = JSON.parse(raw);
    const step1Done = !!d.style && appearanceKeys.every((k: string) => !!d.appearance?.[k]);
    if (!step1Done) {
      return 1;
    }
    const step2Done = !!d.name?.trim() && !!d.age?.trim();
    if (!step2Done) {
      return 2;
    }
    return 3;
  } catch {
    return 1;
  }
};

const getInitialCharacter = (): CreatedCharacter | null => {
  try {
    const raw = sessionStorage.getItem('create_character');
    return raw ? (JSON.parse(raw) as CreatedCharacter) : null;
  } catch {
    return null;
  }
};

function CreatePageContent() {
  const t = useTranslations('CreatePage');
  const [step, setStep] = useState(getInitialStep);
  const [stepValid, setStepValid] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [character, setCharacter] = useState<CreatedCharacter | null>(getInitialCharacter);
  const { data } = useCreate();
  const { createCharacter } = useCharacterService();

  const handleGenerate = () => {
    setGenerating(true);
    createCharacter({
      style: data.style ?? '',
      appearance: data.appearance,
      name: data.name,
      age: Number(data.age),
      voice_type: data.voice,
      personality_archetype: data.personality,
      relationship_dynamic: data.relationship,
      kinks: data.kinks ? [data.kinks] : [],
      hobby: data.socialRole,
      backstory: data.backstory,
      custom_physical_prompt: data.customPhysical,
      custom_face_prompt: data.customFaceDetails,
      personality_details: data.personalityDetails,
      tags: data.tags,
      greeting_message: data.greeting,
    }).then((res) => {
      sessionStorage.setItem('create_character_response', JSON.stringify(res));
      const content = (res as { content?: CreatedCharacter })?.content;
      if (content) {
        const c = { ...content, voice_settings: content.voice_settings ?? data.voice };
        sessionStorage.setItem('create_character', JSON.stringify(c));
        setCharacter(c);
      }
      setGenerating(false);
      setStepValid(false);
      setStep(4);
    });
  };

  const handleNext = () => {
    if (step === 3) {
      handleGenerate();
      return;
    }
    setStepValid(false);
    setStep(s => Math.min(3, s + 1));
  };

  return (
    <div className="flex min-h-full flex-col justify-between gap-8">
      <h1 className="mt-2.5 text-center text-xl font-bold text-white sm:text-2xl md:text-[32px]">
        {t('title')}
        <span className="text-primary-100">
          {' '}
          {t('title_highlight')}
        </span>
      </h1>

      <CreateStepper step={step} />

      <div className="m-auto mt-2 w-full max-w-209">
        {step === 4
          ? (
              <CreateStep4
                character={character}
                onTagsChange={(tags) => {
                  if (character) {
                    const updated = { ...character, tags };
                    sessionStorage.setItem('create_character', JSON.stringify(updated));
                    setCharacter(updated);
                  }
                }}
              />
            )
          : (() => {
              const StepContent = steps[step - 1];
              return StepContent ? <StepContent onValidChange={setStepValid} /> : null;
            })()}
      </div>

      {step !== 4 && (
        <div className="mb-5 flex justify-center gap-3">
          <button
            onClick={() => {
              setStepValid(false);
              setStep(s => Math.max(1, s - 1));
            }}
            disabled={step === 1}
            className={`rounded-xl border px-6 py-4 text-sm font-medium transition-colors ${step === 1 ? 'cursor-not-allowed border-white-25/30 text-white-25' : 'cursor-pointer border-white-25 bg-black-60 text-white hover:border-white hover:text-white'}`}
          >
            {t('prev')}
          </button>
          <button
            onClick={handleNext}
            disabled={!stepValid || generating}
            className={`w-full max-w-118 rounded-xl py-4 text-xs font-semibold transition-colors ${stepValid && !generating ? 'cursor-pointer bg-primary-100 text-white' : 'cursor-not-allowed bg-primary-100/40 text-white/40'}`}
          >
            {step === 3
              ? (
                  <span className="flex items-center justify-center gap-2">
                    {generating
                      ? <SpinnerIcon />
                      : (
                          <>
                            {t('generate')}
                            <span className="flex items-center gap-1.5 rounded-lg bg-white/20 px-3 py-1 text-sm font-semibold">
                              10
                              <StackedCoinIcon />
                            </span>
                          </>
                        )}
                  </span>
                )
              : (
                  <span className="flex items-center justify-center gap-2">
                    {t('next')}
                    <ForwardArrowIcon />
                  </span>
                )}
          </button>
        </div>
      )}
    </div>
  );
}

export default function CreatePage() {
  return (
    <CreateProvider>
      <CreatePageContent />
    </CreateProvider>
  );
}
