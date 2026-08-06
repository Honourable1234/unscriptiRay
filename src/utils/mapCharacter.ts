import type { Character } from '@/data/characters';

export const mapCharacter = (c: Record<string, unknown>): Character => ({
  id: c.id as string,
  name: c.name as string,
  age: c.age as number,
  gender: c.gender as 'Male' | 'Female',
  description: (c.short_bio ?? '') as string,
  image: (c.image_url ?? '') as string,
  likes: String(c.like_count ?? 0),
  comments: String(c.total_chats ?? 0),
  tags: (c.tags as string[]) ?? [],
  is_liked: c.is_liked as boolean | undefined,
});
