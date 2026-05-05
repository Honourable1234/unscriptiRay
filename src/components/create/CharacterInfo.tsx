'use client';

import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { useCreate } from '@/context/CreateContext';
import { CharacterInfoCard } from './CharacterInfoCard';
import { OptionModal } from './OptionModal';

export const CharacterInfo = () => {
  const t = useTranslations('CharacterInfo');
  const { data, setVoice, setPersonality, setRelationship, setKinks } = useCreate();

  const [voiceOpen, setVoiceOpen] = useState(false);
  const [personalityOpen, setPersonalityOpen] = useState(false);
  const [relationshipOpen, setRelationshipOpen] = useState(false);
  const [kinksOpen, setKinksOpen] = useState(false);

  return (
    <div className="flex flex-col gap-4">
      <h3 className="mb-4 text-center text-lg font-medium text-white">{t('heading')}</h3>
      <div className="flex flex-wrap justify-between gap-3">
        <div className="min-w-80 flex-1">
          <CharacterInfoCard title={t('voice')} value={data.voice} onClick={() => setVoiceOpen(true)} />
        </div>
        <div className="min-w-80 flex-1">
          <CharacterInfoCard title={t('personality')} value={data.personality} iconColor="#4e9f3d" onClick={() => setPersonalityOpen(true)} />
        </div>
        <div className="min-w-80 flex-1">
          <CharacterInfoCard title={t('relationship')} value={data.relationship} iconColor="#4e9f3d" onClick={() => setRelationshipOpen(true)} />
        </div>
        <div className="min-w-80 flex-1">
          <CharacterInfoCard title={t('kinks')} value={data.kinks} iconColor="#4e9f3d" onClick={() => setKinksOpen(true)} />
        </div>
      </div>

      {voiceOpen && (
        <OptionModal
          title={t('select_voice')}
          endpoint="/voice/list"
          labelKey="localName"
          selected={data.voice}
          onSelect={setVoice}
          onClose={() => setVoiceOpen(false)}
        />
      )}
      {personalityOpen && (
        <OptionModal
          title={t('select_personality')}
          endpoint="/characters/creation-options"
          responseKey="personality_archetypes"
          topItem={{ label: 'Custom', locked: true }}
          selected={data.personality}
          onSelect={setPersonality}
          onClose={() => setPersonalityOpen(false)}
        />
      )}
      {relationshipOpen && (
        <OptionModal
          title={t('select_relationship')}
          endpoint="/characters/creation-options"
          responseKey="relationship_dynamics"
          topItem={{ label: 'Custom', locked: true }}
          selected={data.relationship}
          onSelect={setRelationship}
          onClose={() => setRelationshipOpen(false)}
        />
      )}
      {kinksOpen && (
        <OptionModal
          title={t('select_kinks')}
          endpoint="/characters/creation-options"
          responseKey="kinks"
          topItem={{ label: 'Custom', locked: true }}
          selected={data.kinks}
          onSelect={setKinks}
          onClose={() => setKinksOpen(false)}
        />
      )}
    </div>
  );
};
