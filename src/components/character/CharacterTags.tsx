import type { Character } from '@/data/characters';

export const CharacterTags = (props: { character: Character }) => (
  <div className="flex flex-wrap gap-2">
    {props.character.tags.map(tag => (
      <span key={tag} className="rounded-lg bg-black-40 px-3 py-2 text-xs font-medium text-white-75">
        {tag}
      </span>
    ))}
  </div>
);
