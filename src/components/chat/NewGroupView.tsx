'use client';

import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { SelectCharactersView } from './SelectCharactersView';

export const NewGroupView = (props: { preSelectedId?: string }) => {
  const t = useTranslations('NewGroupView');
  const [groupName, setGroupName] = useState('');

  return (
    <SelectCharactersView
      preSelectedId={props.preSelectedId}
      heading={t('heading')}
      extraField={(
        <div>
          <label htmlFor="group-name" className="mb-2 block text-sm font-medium text-white">{t('group_name_label')}</label>
          <input
            id="group-name"
            type="text"
            value={groupName}
            onChange={e => setGroupName(e.target.value)}
            placeholder={t('group_name_placeholder')}
            className="w-full rounded-xl border border-white-25 bg-black-60 px-4 py-3 text-sm text-white placeholder-white-75 focus:outline-none"
          />
        </div>
      )}
    />
  );
};
