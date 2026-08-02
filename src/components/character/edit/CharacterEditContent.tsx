'use client';

import type { CharacterDetail } from '@/services/useCharacterService';
import { useEffect, useState } from 'react';
import { BouncingDots } from '@/components/general/BouncingDots';
import { useAuth } from '@/context/AuthContext';
import { CreateProvider } from '@/context/CreateContext';
import { Link } from '@/libs/I18nNavigation';
import { useCharacterService } from '@/services/useCharacterService';
import { characterToCreateState } from '@/utils/characterForm';
import { isCharacterOwner } from '@/utils/characterOwner';
import { CharacterEditForm } from './CharacterEditForm';

const Notice = (props: { title: string; body: string; href: string; action: string }) => (
  <div className="flex h-96 flex-col items-center justify-center gap-3 text-center">
    <p className="text-base font-semibold text-white">{props.title}</p>
    <p className="max-w-90 text-sm text-white-75">{props.body}</p>
    <Link href={props.href} className="rounded-xl bg-primary-100 px-6 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90">
      {props.action}
    </Link>
  </div>
);

export const CharacterEditContent = (props: { id: string }) => {
  const { authLoading, user } = useAuth();
  const { getCharacter } = useCharacterService();
  const [character, setCharacter] = useState<CharacterDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    // Managing a character needs the owner's credentials on the request, so
    // nothing is fetched until the session has resolved.
    if (authLoading) {
      return;
    }

    // eslint-disable-next-line react-hooks/set-state-in-effect, react-hooks-extra/no-direct-set-state-in-use-effect
    setLoading(true);
    getCharacter(props.id).then((res) => {
      const content: CharacterDetail | undefined = res?.content;
      setCharacter(content ?? null);
      setError(!content);
    }).catch(() => setError(true)).finally(() => setLoading(false));
  }, [props.id, authLoading]);

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <BouncingDots />
      </div>
    );
  }

  if (error || !character) {
    return (
      <Notice
        title="Character unavailable"
        body="We could not load this character. It may have been deleted."
        href="/my-ai"
        action="Back to My AI"
      />
    );
  }

  if (!isCharacterOwner({ creator: character.creator, username: user?.username })) {
    return (
      <Notice
        title="This character isn't yours"
        body="Only the creator of a character can edit it. You can still chat with this one from its profile."
        href={`/character/${props.id}`}
        action="View profile"
      />
    );
  }

  return (
    <CreateProvider key={character.id} initial={characterToCreateState(character)} persist={false}>
      <CharacterEditForm character={character} />
    </CreateProvider>
  );
};
