'use client';

import type { Character } from '@/data/characters';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { AddIcon, CaptureIcon, ChatIcon2, FemaleIcon, GroupIcon, MaleIcon } from '@/components/icons';
import { CharacterActionButton } from './CharacterActionButton';
import { CharacterDescription } from './CharacterDescription';
import { CharacterStats } from './CharacterStats';
import { CharacterTags } from './CharacterTags';

export const CharacterHeader = (props: { character: Character; imageCount?: number; videoCount?: number }) => {
  const t = useTranslations('CharacterHeader');
  const router = useRouter();

  const handleChat = () => {
    router.push(`/chat/${props.character.id}`);
  };

  const handleGroup = () => {
    router.push(`/chat?view=group&characterId=${props.character.id}`);
  };

  const handleScenario = () => {
    router.push(`/chat?view=scenario&characterId=${props.character.id}`);
  };

  const handleGenerate = () => {
    const params = new URLSearchParams({
      characterId: String(props.character.id),
      characterName: props.character.name,
      characterImage: props.character.image,
    });
    router.push(`/generate?${params.toString()}`);
  };

  return (
    <div className="mb-2 flex flex-wrap items-start justify-between gap-3 border-b border-black-40 pb-3 sm:mb-3 sm:flex-nowrap md:mb-4">
      <div className="flex flex-wrap items-start gap-3 md:flex-nowrap">
        <div className="relative h-25 w-25 flex-shrink-0 overflow-hidden rounded-full">
          <Image src={props.character.image} alt={props.character.name} fill sizes="100px" className="object-cover" />
        </div>
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-1">
            <span className="text-lg font-semibold text-white">{props.character.name}</span>
            <span className="font-medium text-white-75">{props.character.age}</span>
            {props.character.gender === 'Male' ? <MaleIcon /> : <FemaleIcon />}
          </div>
          <CharacterStats character={props.character} imageCount={props.imageCount} videoCount={props.videoCount} />
          <CharacterTags character={props.character} />
          <CharacterDescription character={props.character} />
          <div className="mb-4 flex w-full flex-wrap gap-3">
            <CharacterActionButton text={t('chat')} icon={<ChatIcon2 />} className="w-full max-w-42 flex-1 bg-primary-100" onClick={handleChat} />
            <CharacterActionButton text={t('new_group')} icon={<GroupIcon />} className="w-full max-w-52 flex-1 border border-black-20" onClick={handleGroup} />
            <CharacterActionButton text={t('generate')} icon={<CaptureIcon />} className="w-full max-w-42 flex-1 border border-black-20" onClick={handleGenerate} />
          </div>
        </div>
      </div>
      <button
        className="flex cursor-pointer items-center gap-2.5 rounded-xl bg-success-100 px-4 py-2 text-xs font-semibold whitespace-nowrap text-white"
        onClick={handleScenario}
      >
        <AddIcon />
        {t('new_scenario')}
      </button>
    </div>
  );
};
