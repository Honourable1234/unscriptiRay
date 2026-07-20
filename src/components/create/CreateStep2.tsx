'use client';

import { useTranslations } from 'next-intl';
import { useEffect } from 'react';
import { useCreate } from '@/context/CreateContext';
import { CharacterInfo } from './CharacterInfo';
import { CreateField } from './CreateField';

const genders = ['female', 'male', 'non-binary'] as const;

export const CreateStep2 = (props: { onValidChange?: (valid: boolean) => void }) => {
  const t = useTranslations('CreateStep2');
  const { data, setName, setAge, setGender } = useCreate();

  const genderLabel = (gender: (typeof genders)[number]) => {
    switch (gender) {
      case 'female': return t('gender_female');
      case 'male': return t('gender_male');
      case 'non-binary': return t('gender_non_binary');
    }
  };

  const handleName = (value: string) => {
    setName(value);
    props.onValidChange?.(!!value.trim() && !!data.age.trim());
  };

  const handleAge = (value: string) => {
    setAge(value);
    props.onValidChange?.(!!data.name.trim() && !!value.trim());
  };

  useEffect(() => {
    props.onValidChange?.(!!data.name.trim() && !!data.age.trim());
  }, []);

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap justify-center gap-3">
        <div className="min-w-80 flex-1">
          <CreateField label={t('character_name')} value={data.name} onChange={handleName} />
        </div>
        <div className="min-w-80 flex-1">
          <CreateField label={t('character_age')} value={data.age} onChange={handleAge} type="number" />
        </div>
      </div>
      <div className="flex flex-col items-center gap-3">
        <span className="text-sm font-medium text-white">{t('gender')}</span>
        <div className="flex flex-wrap justify-center gap-2">
          {genders.map(gender => (
            <button
              key={gender}
              onClick={() => setGender(gender)}
              className={`cursor-pointer rounded-lg px-4 py-2 text-xs font-medium transition-colors ${data.gender === gender ? 'bg-primary-100 text-white' : 'bg-black-40 text-white-75 hover:bg-black-60'}`}
            >
              {genderLabel(gender)}
            </button>
          ))}
        </div>
      </div>
      <CharacterInfo />
    </div>
  );
};
