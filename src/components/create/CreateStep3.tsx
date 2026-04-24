'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useCreate } from '@/context/CreateContext';
import { api } from '@/libs/api';
import { CreateAccordionField } from './CreateAccordionField';
import { CreateTagsField } from './CreateTagsField';

type Step3Key = 'backstory' | 'customPhysical' | 'customFaceDetails' | 'greeting' | 'personalityDetails';

const fields: { key: Step3Key; title: string; placeholder: string }[] = [
  { key: 'backstory', title: 'Backstory', placeholder: 'No Backstory set' },
  { key: 'customPhysical', title: 'Custom Physical', placeholder: 'No custom physical set' },
  { key: 'customFaceDetails', title: 'Custom Face Details', placeholder: 'No custom face details set' },
  { key: 'greeting', title: 'Greeting', placeholder: 'No greeting set' },
  { key: 'personalityDetails', title: 'Personality Details', placeholder: 'No personality details set' },
];

const setters: Record<Step3Key, keyof ReturnType<typeof useCreate>> = {
  backstory: 'setBackstory',
  customPhysical: 'setCustomPhysical',
  customFaceDetails: 'setCustomFaceDetails',
  greeting: 'setGreeting',
  personalityDetails: 'setPersonalityDetails',
};

type EnrichContent = {
  backstory?: string;
  custom_face_prompt?: string;
  custom_physical_prompt?: string;
  greeting_message?: string;
  personality_details?: string;
};

export const CreateStep3 = (props: { onValidChange?: (valid: boolean) => void }) => {
  const ctx = useCreate();
  const { token } = useAuth();
  const [enrichLoading, setEnrichLoading] = useState(false);

  useEffect(() => {
    const allFilled = fields.every(f => !!ctx.data[f.key]?.trim());
    const hasTags = (ctx.data.tags ?? []).length > 0;
    props.onValidChange?.(allFilled && hasTags);
  }, [ctx.data.backstory, ctx.data.customPhysical, ctx.data.customFaceDetails, ctx.data.greeting, ctx.data.personalityDetails, ctx.data.tags]);

  const handleEnrich = () => {
    setEnrichLoading(true);
    api.post('/characters/ai-enrich', {
      name: ctx.data.name,
      style: ctx.data.style ?? '',
      appearance: ctx.data.appearance,
      personality_archetype: ctx.data.personality,
      relationship_dynamic: ctx.data.relationship,
      kinks: ctx.data.kinks ? [ctx.data.kinks] : [],
      hobby: ctx.data.socialRole,
    }, token ?? undefined).then((res: unknown) => {
      const content = (res as { content?: EnrichContent })?.content;
      if (content) {
        if (content.backstory) {
          ctx.setBackstory(content.backstory);
        }
        if (content.custom_face_prompt) {
          ctx.setCustomFaceDetails(content.custom_face_prompt);
        }
        if (content.custom_physical_prompt) {
          ctx.setCustomPhysical(content.custom_physical_prompt);
        }
        if (content.greeting_message) {
          ctx.setGreeting(content.greeting_message);
        }
        if (content.personality_details) {
          ctx.setPersonalityDetails(content.personality_details);
        }
      }
      setEnrichLoading(false);
    });
  };

  return (
    <div className="flex flex-col gap-3">
      <CreateAccordionField
        title="AI Enrichment (Autocomplete)"
        subtitle="Use AI to fill in the gaps and create a deeper character"
        expandable={false}
        loading={enrichLoading}
        onClick={handleEnrich}
      />
      {fields.map(f => (
        <CreateAccordionField
          key={f.key}
          title={f.title}
          placeholder={f.placeholder}
          value={ctx.data[f.key]}
          onChange={ctx[setters[f.key]] as (v: string) => void}
        />
      ))}
      <CreateTagsField tags={ctx.data.tags ?? []} onChange={ctx.setTags} />
    </div>
  );
};
