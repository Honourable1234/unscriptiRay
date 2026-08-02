import { CharacterEditContent } from '@/components/character/edit/CharacterEditContent';

export default async function CharacterEditPage(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;

  return <CharacterEditContent id={id} />;
}
