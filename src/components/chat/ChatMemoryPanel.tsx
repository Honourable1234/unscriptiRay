'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/libs/api';

export const ChatMemoryPanel = (props: { chatroomId: string }) => {
  const { token } = useAuth();
  const [summaries, setSummaries] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [input, setInput] = useState('');
  const [adding, setAdding] = useState(false);
  const [addError, setAddError] = useState(false);

  useEffect(() => {
    api.get(`/chat/${props.chatroomId}/memory`, token ?? undefined).then((res) => {
      const items = res?.content?.summaries as string[] | undefined;
      if (Array.isArray(items)) {
        setSummaries(items);
      }
    }).catch(() => setError(true)).finally(() => setLoading(false));
  }, [props.chatroomId, token]);

  const addMemory = () => {
    const text = input.trim();
    if (!text || adding) {
      return;
    }
    setAddError(false);
    setAdding(true);
    api.post(`/chat/${props.chatroomId}/memory`, { summary: text }, token ?? undefined).then(() => {
      setSummaries(prev => [...prev, text]);
      setInput('');
    }).catch(() => setAddError(true)).finally(() => setAdding(false));
  };

  return (
    <div className="flex flex-col gap-2 px-4 pb-3">
      {loading && <p className="text-sm text-white-50">Loading…</p>}
      {!loading && error && <p className="text-sm text-error-200">Failed to load memories.</p>}
      {!loading && !error && summaries.length === 0 && (
        <p className="text-sm text-white-50">No memories yet.</p>
      )}
      {summaries.map(s => (
        <div key={s} className="rounded-xl bg-black-60 px-3 py-2.5 text-sm text-white">
          {s}
        </div>
      ))}
      <div className="mt-1 flex gap-2">
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              addMemory();
            }
          }}
          placeholder="Add a memory…"
          className="flex-1 rounded-xl bg-black-60 px-3 py-2 text-sm text-white placeholder-white-50 focus:outline-none"
        />
        <button
          onClick={addMemory}
          disabled={!input.trim() || adding}
          className="cursor-pointer rounded-xl bg-primary-100 px-3 py-2 text-sm font-semibold text-white disabled:opacity-50"
        >
          {adding ? '…' : 'Add'}
        </button>
      </div>
      {addError && <p className="text-xs text-error-200">Failed to save memory.</p>}
    </div>
  );
};
