'use client';

import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { useChatService } from '@/services/useChatService';
import { ExpandableTextarea } from './ExpandableTextarea';

export const ChatInstructionsPanel = (props: { chatroomId: string }) => {
  const { getInstructions, addInstruction: addInstructionApi } = useChatService();
  const [items, setItems] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [input, setInput] = useState('');
  const [adding, setAdding] = useState(false);
  const [addError, setAddError] = useState(false);

  useEffect(() => {
    getInstructions(props.chatroomId).then((res: unknown) => {
      const list = (res as { content?: { instructions?: unknown[] } })?.content?.instructions;
      if (Array.isArray(list)) {
        setItems(list.map(i => String(i)));
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
    addInstructionApi(props.chatroomId, text).then(() => {
      toast.success('Instruction saved.');
      setItems(prev => [...prev, text]);
      setInput('');
    }).catch(() => {
      toast.error('Failed to save instruction.');
      setAddError(true);
    }).finally(() => setAdding(false));
  };

  return (
    <div className="flex flex-col gap-3 px-4 py-3">
      <div className="flex flex-col gap-2">
        <ExpandableTextarea value={input} onChange={setInput} placeholder="Add an instruction…" />
        <button
          onClick={handleAdd}
          disabled={!input.trim() || adding}
          className="cursor-pointer self-end rounded-2xl bg-primary-100 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
        >
          {adding ? '…' : 'Add'}
        </button>
      </div>
      {addError && <p className="text-xs text-error-200">Failed to save instruction.</p>}
      {loading && <p className="text-sm text-white-50">Loading…</p>}
      {!loading && error && <p className="text-sm text-error-200">Failed to load instructions.</p>}
      {!loading && !error && items.length === 0 && (
        <div className="px-4 py-3 text-center text-sm text-white-50">No instructions yet.</div>
      )}
      {items.map(item => (
        <div key={item} className="rounded-2xl border border-black-40 bg-black-60/40 px-4 py-3 text-sm leading-relaxed text-white">{item}</div>
      ))}
    </div>
  );
};
