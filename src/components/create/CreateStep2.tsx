'use client';

import { useTranslations } from 'next-intl';
import { useEffect } from 'react';
import { useCreate } from '@/context/CreateContext';
import { CharacterInfo } from './CharacterInfo';
import { CreateField } from './CreateField';

export const CreateStep2 = (props: { onValidChange?: (valid: boolean) => void }) => {
  const t = useTranslations('CreateStep2');
  const { data, setName, setAge } = useCreate();

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
      <CharacterInfo />
    </div>
  );
};
