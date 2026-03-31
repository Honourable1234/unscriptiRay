import { notFound } from 'next/navigation';
import { CharacterContent } from '@/components/character/CharacterContent';
import { characters } from '@/data/characters';

export default async function CharacterPage(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;
  const character = characters.find(c => c.id === Number(id));

  if (!character) {
    notFound();
  }

  return <CharacterContent character={character} />;
}
