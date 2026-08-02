'use client';

import type { MyCharacter } from '@/services/useMyAiService';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { FilterDropdown } from '@/components/explore/FilterDropdown';
import { EditIcon } from '@/components/icons';
import { useAuth } from '@/context/AuthContext';
import { Link } from '@/libs/I18nNavigation';
import { useMyAiService } from '@/services/useMyAiService';
import { MyAiCard } from '../my-ai/MyAiCard';
import { ProfileEditModal } from './ProfileEditModal';

type Tab = 'Highlighted' | 'Characters' | 'Activity';

const tabs: Tab[] = ['Highlighted', 'Characters', 'Activity'];

export const ProfileView = () => {
  const { user, token } = useAuth();
  const { getMyCharacters } = useMyAiService();
  const [characters, setCharacters] = useState<MyCharacter[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [tab, setTab] = useState<Tab>('Characters');
  const [style, setStyle] = useState('Any Style');
  const [sort, setSort] = useState('Newest');
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    if (!token) {
      return;
    }
    getMyCharacters({ limit: 50 })
      .then((res) => {
        if (res.success) {
          setCharacters(res.content.characters);
        }
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, [token]);

  const styleOptions = ['Any Style', ...Array.from(new Set(characters.map(c => c.style).filter(Boolean)))];

  const filtered = characters
    .filter(c => style === 'Any Style' || c.style === style)
    .sort((a, b) => {
      const diff = new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      return sort === 'Newest' ? diff : -diff;
    });

  const avatarInitial = (user?.display_name ?? user?.username ?? user?.email ?? '?').slice(0, 2).toUpperCase();

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-full bg-black-60">
          {user?.image_url
            ? <Image src={user.image_url} alt="" fill sizes="64px" className="object-cover" />
            : <span className="flex h-full w-full items-center justify-center text-lg font-bold text-white">{avatarInitial}</span>}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-xl font-bold text-white">{user?.display_name ?? user?.username ?? 'Unnamed'}</p>
          <div className="mt-1 flex flex-wrap gap-x-4 text-sm text-white-50">
            <span>
              <span className="font-semibold text-white">0</span>
              {' '}
              interactions
            </span>
            <span>
              <span className="font-semibold text-white">0</span>
              {' '}
              followers
            </span>
            <span>
              <span className="font-semibold text-white">0</span>
              {' '}
              following
            </span>
          </div>
        </div>
        <button
          onClick={() => setEditing(true)}
          className="flex flex-shrink-0 cursor-pointer items-center gap-1.5 rounded-full bg-black-60 px-5 py-2.5 text-xs font-semibold text-white hover:bg-black-40 [&_svg]:size-3.5"
        >
          <EditIcon />
          Edit Profile
        </button>
      </div>

      {/* Tabs + filters */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-1">
          {tabs.map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`cursor-pointer rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${tab === t ? 'bg-black-60 text-white' : 'text-white-50 hover:text-white'}`}
            >
              {t}
            </button>
          ))}
        </div>
        {tab === 'Characters' && (
          <div className="flex flex-wrap gap-2">
            <FilterDropdown label="Style" value={style} options={styleOptions} onChange={setStyle} />
            <FilterDropdown label="Sort" value={sort} options={['Newest', 'Oldest']} onChange={setSort} />
          </div>
        )}
      </div>

      {/* Content */}
      {tab !== 'Characters'
        ? (
            <div className="flex justify-center py-16">
              <p className="text-sm text-white-50">Nothing to show yet.</p>
            </div>
          )
        : isLoading
          ? (
              <div className="flex justify-center py-16">
                <p className="text-sm text-white-50">Loading...</p>
              </div>
            )
          : (
              <>
                {filtered.length === 0 && (
                  <p className="text-center text-sm text-white-50">No characters match your style filters</p>
                )}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                  <Link
                    href="/create"
                    className="flex h-116 flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-white-25 bg-black-80 transition-colors hover:border-primary-100 lg:h-136"
                  >
                    <span className="text-sm font-semibold text-white">CREATE NEW CHARACTER</span>
                    <span className="rounded-full bg-white px-5 py-2 text-xs font-semibold text-black-100">Create</span>
                  </Link>
                  {filtered.map((character, i) => (
                    <MyAiCard key={character.id} character={character} priority={i < 2} />
                  ))}
                </div>
              </>
            )}

      {editing && <ProfileEditModal onClose={() => setEditing(false)} />}
    </div>
  );
};
