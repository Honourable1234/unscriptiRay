'use client';

import type { MyCharacter } from '@/services/useMyAiService';
import type { WalletTransaction } from '@/services/useWalletService';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { FilterDropdown } from '@/components/explore/FilterDropdown';
import { EditIcon } from '@/components/icons';
import { useAuth } from '@/context/AuthContext';
import { Link } from '@/libs/I18nNavigation';
import { useMyAiService } from '@/services/useMyAiService';
import { useWalletService } from '@/services/useWalletService';
import { pagesToShow, signedAmount } from '@/utils/Helpers';
import { MyAiCard } from '../my-ai/MyAiCard';
import { ProfileEditModal } from './ProfileEditModal';

type Tab = 'Highlighted' | 'Characters' | 'Activity';

const tabs: Tab[] = ['Highlighted', 'Characters', 'Activity'];

export const ProfileView = () => {
  const t = useTranslations('ProfileView');
  const tWallet = useTranslations('WalletSection');
  const { user, token } = useAuth();
  const { getMyCharacters } = useMyAiService();
  const { getTransactions } = useWalletService();
  const [characters, setCharacters] = useState<MyCharacter[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [tab, setTab] = useState<Tab>('Characters');
  const [style, setStyle] = useState('Any Style');
  const [sort, setSort] = useState('Newest');
  const [editing, setEditing] = useState(false);
  const [transactions, setTransactions] = useState<WalletTransaction[] | null>(null);
  const [txPage, setTxPage] = useState(1);
  const [txPageCount, setTxPageCount] = useState(1);
  const [txTotal, setTxTotal] = useState(0);
  const [isTxPaging, setIsTxPaging] = useState(false);

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

  /**
   * Loads a page of activity, replacing the table on page 1.
   * @param nextPage - One-based page to fetch.
   * @returns A promise that settles once the page is applied.
   */
  const fetchTransactions = (nextPage: number) =>
    getTransactions(nextPage).then((res) => {
      setTransactions(res.content.rows);
      setTxPage(res.content.pagination.page);
      setTxPageCount(res.content.pagination.pageCount);
      setTxTotal(res.content.pagination.total);
    });

  const goToTxPage = (nextPage: number) => {
    if (isTxPaging || nextPage === txPage || nextPage < 1 || nextPage > txPageCount) {
      return;
    }
    setIsTxPaging(true);
    fetchTransactions(nextPage).catch(() => {}).finally(() => setIsTxPaging(false));
  };

  // Loaded lazily the first time the tab is opened, not on mount.
  useEffect(() => {
    if (tab !== 'Activity' || !token || transactions !== null) {
      return;
    }
    fetchTransactions(1).catch(() => setTransactions([]));
  }, [tab, token]);

  const styleOptions = ['Any Style', ...Array.from(new Set(characters.map(c => c.style).filter(Boolean)))];

  const filtered = characters
    .filter(c => style === 'Any Style' || c.style === style)
    .sort((a, b) => {
      const diff = new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      return sort === 'Newest' ? diff : -diff;
    });

  const avatarInitial = (user?.display_name ?? user?.username ?? user?.email ?? '?').slice(0, 2).toUpperCase();
  const tabLabels: Record<Tab, string> = {
    Highlighted: t('tab_highlighted'),
    Characters: t('tab_characters'),
    Activity: t('tab_activity'),
  };

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
          <p className="truncate text-xl font-bold text-white">{user?.display_name ?? user?.username ?? t('unnamed')}</p>
          <div className="mt-1 flex flex-wrap gap-x-4 text-sm text-white-50">
            <span>
              <span className="font-semibold text-white">0</span>
              {' '}
              {t('interactions')}
            </span>
            <span>
              <span className="font-semibold text-white">0</span>
              {' '}
              {t('followers')}
            </span>
            <span>
              <span className="font-semibold text-white">0</span>
              {' '}
              {t('following')}
            </span>
          </div>
        </div>
        <button
          onClick={() => setEditing(true)}
          className="flex flex-shrink-0 cursor-pointer items-center gap-1.5 rounded-full bg-black-60 px-5 py-2.5 text-xs font-semibold text-white hover:bg-black-40 [&_svg]:size-3.5"
        >
          <EditIcon />
          {t('edit_profile')}
        </button>
      </div>

      {/* Tabs + filters */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-1">
          {tabs.map(tabKey => (
            <button
              key={tabKey}
              onClick={() => setTab(tabKey)}
              className={`cursor-pointer rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${tab === tabKey ? 'bg-black-60 text-white' : 'text-white-50 hover:text-white'}`}
            >
              {tabLabels[tabKey]}
            </button>
          ))}
        </div>
        {tab === 'Characters' && (
          <div className="flex flex-wrap gap-2">
            <FilterDropdown label={t('filter_style')} value={style} options={styleOptions} onChange={setStyle} />
            <FilterDropdown label={t('filter_sort')} value={sort} options={['Newest', 'Oldest']} onChange={setSort} />
          </div>
        )}
      </div>

      {/* Content */}
      {tab === 'Highlighted' && (
        <div className="flex justify-center py-16">
          <p className="text-sm text-white-50">{t('nothing_to_show')}</p>
        </div>
      )}

      {tab === 'Activity' && (
        transactions === null
          ? (
              <div className="flex flex-col gap-2">
                {[0, 1, 2].map(i => (
                  <div key={i} className="h-14 animate-pulse rounded-2xl bg-black-60" />
                ))}
              </div>
            )
          : transactions.length === 0
            ? (
                <div className="rounded-2xl border border-black-40 bg-black-100 px-4 py-6 text-center">
                  <p className="text-sm text-white-50">{tWallet('no_transactions')}</p>
                </div>
              )
            : (
                <div className="flex flex-col gap-2">
                  <div className="overflow-x-auto rounded-2xl border border-black-40 bg-black-100">
                    <table className="w-full text-left text-sm">
                      <thead>
                        <tr className="border-b border-black-40 text-xs text-white-50">
                          <th className="px-4 py-3 font-medium">{tWallet('column_reason')}</th>
                          <th className="px-4 py-3 font-medium">{tWallet('column_date')}</th>
                          <th className="px-4 py-3 text-right font-medium">{tWallet('column_coins')}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {transactions.map(transaction => (
                          <tr key={transaction.id} className="border-b border-black-40 last:border-0">
                            <td className="px-4 py-3 whitespace-nowrap text-white capitalize">
                              {transaction.reason.replace(/[_-]+/g, ' ')}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-white-75">
                              {new Date(transaction.created_at).toLocaleString()}
                            </td>
                            <td className={`px-4 py-3 text-right font-semibold whitespace-nowrap ${transaction.amount < 0 ? 'text-white-75' : 'text-primary-100'}`}>
                              {signedAmount(transaction.amount)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {txPageCount > 1 && (
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="text-xs text-white-50">
                        {tWallet('pagination', { page: txPage, pageCount: txPageCount, total: txTotal })}
                      </p>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => goToTxPage(txPage - 1)}
                          disabled={isTxPaging || txPage === 1}
                          className="cursor-pointer rounded-lg bg-black-60 px-3 py-1.5 text-xs font-semibold text-white hover:bg-black-40 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          {tWallet('prev')}
                        </button>
                        {pagesToShow(txPage, txPageCount).map((pageNumber, i) => (
                          pageNumber === null
                            // eslint-disable-next-line react/no-array-index-key -- gaps have no id of their own
                            ? <span key={`gap-${i}`} className="px-1 text-xs text-white-50">…</span>
                            : (
                                <button
                                  key={pageNumber}
                                  onClick={() => goToTxPage(pageNumber)}
                                  disabled={isTxPaging}
                                  className={`min-w-8 cursor-pointer rounded-lg px-2.5 py-1.5 text-xs font-semibold disabled:cursor-not-allowed ${pageNumber === txPage ? 'bg-primary-100 text-white' : 'bg-black-60 text-white-75 hover:bg-black-40'}`}
                                >
                                  {pageNumber}
                                </button>
                              )
                        ))}
                        <button
                          onClick={() => goToTxPage(txPage + 1)}
                          disabled={isTxPaging || txPage === txPageCount}
                          className="cursor-pointer rounded-lg bg-black-60 px-3 py-1.5 text-xs font-semibold text-white hover:bg-black-40 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          {tWallet('next')}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )
      )}

      {tab === 'Characters' && (
        isLoading
          ? (
              <div className="flex justify-center py-16">
                <p className="text-sm text-white-50">{t('loading')}</p>
              </div>
            )
          : (
              <>
                {filtered.length === 0 && (
                  <p className="text-center text-sm text-white-50">{t('no_matches')}</p>
                )}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                  <Link
                    href="/create"
                    className="flex h-116 flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-white-25 bg-black-80 transition-colors hover:border-primary-100 lg:h-136"
                  >
                    <span className="text-sm font-semibold text-white">{t('create_new_character')}</span>
                    <span className="rounded-full bg-white px-5 py-2 text-xs font-semibold text-black-100">{t('create')}</span>
                  </Link>
                  {filtered.map((character, i) => (
                    <MyAiCard key={character.id} character={character} priority={i < 2} />
                  ))}
                </div>
              </>
            )
      )}

      {editing && <ProfileEditModal onClose={() => setEditing(false)} />}
    </div>
  );
};
