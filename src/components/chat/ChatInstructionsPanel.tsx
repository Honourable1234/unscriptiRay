'use client';

import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { useChatService } from '@/services/useChatService';

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
    <div className="flex flex-col gap-2 px-4 pb-3">
      {loading && <p className="text-sm text-white-50">Loading…</p>}
      {!loading && error && <p className="text-sm text-error-200">Failed to load instructions.</p>}
      {!loading && !error && items.length === 0 && (
        <p className="text-sm text-white-50">No instructions yet.</p>
      )}
      {items.map(item => (
        <div key={item} className="rounded-xl bg-black-60 px-3 py-2.5 text-sm text-white">{item}</div>
      ))}
      <div className="mt-1 flex gap-2">
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handleAdd();
            }
          }}
          placeholder="Add an instruction…"
          className="flex-1 rounded-xl bg-black-60 px-3 py-2 text-sm text-white placeholder-white-50 focus:outline-none"
        />
        <button
          onClick={handleAdd}
          disabled={!input.trim() || adding}
          className="cursor-pointer rounded-xl bg-primary-100 px-3 py-2 text-sm font-semibold text-white disabled:opacity-50"
        >
          {adding ? '…' : 'Add'}
        </button>
      </div>
      {addError && <p className="text-xs text-error-200">Failed to save instruction.</p>}
    </div>
  );
};
