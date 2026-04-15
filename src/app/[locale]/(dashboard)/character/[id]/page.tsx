import { CharacterContent } from '@/components/character/CharacterContent';

export default async function CharacterPage(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;

  return <CharacterContent id={id} />;
}
