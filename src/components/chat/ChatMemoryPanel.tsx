'use client';

import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { useChatService } from '@/services/useChatService';
import { ExpandableTextarea } from './ExpandableTextarea';

export const ChatMemoryPanel = (props: { chatroomId: string }) => {
  const t = useTranslations('ChatMemoryPanel');
  const { getMemory, addMemory: addMemoryApi } = useChatService();
  const [summaries, setSummaries] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [input, setInput] = useState('');
  const [adding, setAdding] = useState(false);
  const [addError, setAddError] = useState(false);

  useEffect(() => {
    getMemory(props.chatroomId).then((res) => {
      const items = res?.content?.summaries as string[] | undefined;
      if (Array.isArray(items)) {
        setSummaries(items);
      }
    }).catch(() => setError(true)).finally(() => setLoading(false));
  }, [props.chatroomId]);

  const handleAdd = () => {
    const text = input.trim();
    if (!text || adding) {
      return;
    }
    setAddError(false);
    setAdding(true);
    addMemoryApi(props.chatroomId, text).then(() => {
      toast.success(t('toast_saved'));
      setSummaries(prev => [...prev, text]);
      setInput('');
    }).catch(() => {
      toast.error(t('toast_save_failed'));
      setAddError(true);
    }).finally(() => setAdding(false));
  };

  return (
    <div className="flex flex-col gap-3 px-4 py-3">
      <div className="flex flex-col gap-2">
        <ExpandableTextarea value={input} onChange={setInput} placeholder={t('placeholder')} />
        <button
          onClick={handleAdd}
          disabled={!input.trim() || adding}
          className="cursor-pointer self-end rounded-2xl bg-primary-100 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
        >
          {adding ? '…' : t('add')}
        </button>
      </div>
      {addError && <p className="text-xs text-error-200">{t('toast_save_failed')}</p>}
      {loading && <p className="text-sm text-white-50">{t('loading')}</p>}
      {!loading && error && <p className="text-sm text-error-200">{t('load_failed')}</p>}
      {!loading && !error && summaries.length === 0 && (
        <div className="px-4 py-3 text-center text-sm text-white-50">{t('empty')}</div>
      )}
      {summaries.map(s => (
        <div key={s} className="rounded-2xl border border-black-40 bg-black-60/40 px-4 py-3 text-sm leading-relaxed text-white">
          {s}
        </div>
      ))}
    </div>
  );
};
