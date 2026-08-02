'use client';

import type { EditSection } from './editSections';
import type { CharacterDetail } from '@/services/useCharacterService';
import { useState } from 'react';
import { toast } from 'react-toastify';
import { CreateStep1 } from '@/components/create/CreateStep1';
import { CreateStep2 } from '@/components/create/CreateStep2';
import { CreateStep3 } from '@/components/create/CreateStep3';
import { ChevronLeftIcon, SpinnerIcon } from '@/components/icons';
import { useCreate } from '@/context/CreateContext';
import { Link } from '@/libs/I18nNavigation';
import { useCharacterService } from '@/services/useCharacterService';
import { characterToCreateState, createStateToUpdateBody } from '@/utils/characterForm';
import { CharacterDeleteButton } from './CharacterDeleteButton';
import { CharacterEditAvatar } from './CharacterEditAvatar';
import { CharacterEditNav } from './CharacterEditNav';
import { CharacterVisibilityField } from './CharacterVisibilityField';
import { editSectionMeta } from './editSections';

export const CharacterEditForm = (props: { character: CharacterDetail }) => {
  const { data } = useCreate();
  const { updateCharacter } = useCharacterService();
  const [saving, setSaving] = useState(false);
  // Null keeps narrow screens on the list, the way the chat right panel opens;
  // wide screens show both panes and fall back to the first section.
  const [section, setSection] = useState<EditSection | null>(null);
  const openSection = section ?? 'profile';

  // What the character was loaded with, so only edited fields get sent.
  const initial = characterToCreateState(props.character);
  const body = createStateToUpdateBody(data, initial);
  const hasChanges = Object.keys(body).length > 0;
  const canSave = !!data.name.trim() && !!data.age.trim() && hasChanges && !saving;

  const handleSave = () => {
    setSaving(true);
    updateCharacter(props.character.id, body)
      .then(() => toast.success('Changes saved'))
      .catch((error: unknown) => toast.error(error instanceof Error ? error.message : 'Could not save changes'))
      .finally(() => setSaving(false));
  };

  return (
    <div className="mx-auto flex w-full max-w-209 flex-col gap-6 pb-10">
      <div className="sticky top-0 z-20 flex items-center justify-between gap-3 bg-black-80 py-4">
        <Link href={`/character/${props.character.id}`} className="flex w-fit items-center gap-1 text-xs font-medium text-white-75 transition-colors hover:text-white">
          <span className="[&>svg]:h-4 [&>svg]:w-3.5"><ChevronLeftIcon /></span>
          Back to profile
        </Link>

        <div className="flex items-center gap-2">
          <CharacterDeleteButton id={props.character.id} name={props.character.name} />
          <button
            type="button"
            onClick={handleSave}
            disabled={!canSave}
            className={`rounded-xl px-5 py-2.5 text-xs font-semibold transition-colors ${canSave ? 'cursor-pointer bg-primary-100 text-white' : 'cursor-not-allowed bg-primary-100/40 text-white/40'}`}
          >
            {saving ? <SpinnerIcon /> : 'Save changes'}
          </button>
        </div>
      </div>

      <div className="flex gap-6 md:gap-8">
        {/* Docks to the right on wide screens; on narrow ones it is the first
            thing shown and the picked section replaces it. */}
        <div className={`min-w-0 flex-1 md:order-2 md:w-64 md:flex-none ${section ? 'hidden md:block' : 'block'}`}>
          <CharacterEditNav active={section} onSelect={setSection} />
        </div>

        <div className={`min-w-0 flex-1 flex-col gap-4 md:order-1 ${section ? 'flex' : 'hidden md:flex'}`}>
          <div className="flex flex-col gap-1 border-b border-black-40 pb-3">
            <button
              type="button"
              onClick={() => setSection(null)}
              className="flex w-fit cursor-pointer items-center gap-1 text-base font-semibold text-white md:cursor-default"
            >
              <span className="md:hidden [&>svg]:h-4 [&>svg]:w-3.5"><ChevronLeftIcon /></span>
              {editSectionMeta[openSection].label}
            </button>
            <p className="text-xs text-white-75">{editSectionMeta[openSection].description}</p>
          </div>

          {openSection === 'profile' && (
            <div className="flex flex-col gap-4">
              <CharacterEditAvatar id={props.character.id} name={props.character.name} imageUrl={props.character.image_url} />
              <CharacterVisibilityField id={props.character.id} visibility={props.character.visibility} />
            </div>
          )}
          {openSection === 'appearance' && <CreateStep1 />}
          {openSection === 'details' && <CreateStep2 />}
          {openSection === 'story' && <CreateStep3 />}
        </div>
      </div>
    </div>
  );
};
