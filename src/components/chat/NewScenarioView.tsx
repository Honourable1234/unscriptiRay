'use client';

import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { SelectCharactersView } from './SelectCharactersView';

export const NewScenarioView = (props: { preSelectedId?: string }) => {
  const t = useTranslations('NewScenarioView');
  const [scenario, setScenario] = useState('');

  return (
    <SelectCharactersView
      preSelectedId={props.preSelectedId}
      heading={t('heading')}
      createLabel={t('create_label')}
      extraField={(
        <textarea
          value={scenario}
          onChange={e => setScenario(e.target.value)}
          placeholder={t('placeholder')}
          rows={4}
          className="w-full resize-none rounded-xl border border-white-25 bg-black-60 px-4 py-3 text-sm text-white placeholder-white-75 focus:outline-none"
        />
      )}
    />
  );
};
