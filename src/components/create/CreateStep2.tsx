'use client';

import { useEffect } from 'react';
import { useCreate } from '@/context/CreateContext';
import { CharacterInfo } from './CharacterInfo';
import { CreateField } from './CreateField';

export const CreateStep2 = (props: { onValidChange?: (valid: boolean) => void }) => {
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
          <CreateField label="Character Name" value={data.name} onChange={handleName} />
        </div>
        <div className="min-w-80 flex-1">
          <CreateField label="Character Age" value={data.age} onChange={handleAge} type="number" />
        </div>
      </div>
      <CharacterInfo />
    </div>
  );
};
