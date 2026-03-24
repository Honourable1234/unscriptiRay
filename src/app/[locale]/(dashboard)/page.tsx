import { Env } from '@/libs/Env';

async function getCharacters(params?: {
  q?: string;
  sort?: 'trending' | 'newly_born' | 'most_engaged' | 'editor_picks';
  page?: number;
  limit?: number;
}) {
  const searchParams = new URLSearchParams();
  if (params?.q) {
    searchParams.set('q', params.q);
  }
  if (params?.sort) {
    searchParams.set('sort', params.sort);
  }
  if (params?.page) {
    searchParams.set('page', String(params.page));
  }
  if (params?.limit) {
    searchParams.set('limit', String(params.limit));
  }

  const res = await fetch(
    `${Env.NEXT_PUBLIC_API_URL}/explore/characters?${searchParams}`,
    { next: { revalidate: 60 } },
  );

  const data = await res.json();
  return data.content;
}

export default async function ExplorePage() {
  const characters = await getCharacters({ limit: 20 });

  return (
    <div>
      <pre>{JSON.stringify(characters, null, 2)}</pre>
    </div>
  );
}
