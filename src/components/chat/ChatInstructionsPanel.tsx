'use client';

import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { useChatService } from '@/services/useChatService';
import { ExpandableTextarea } from './ExpandableTextarea';

export const ChatInstructionsPanel = (props: { chatroomId: string }) => {
  const { getInstructions, updateInstructions } = useChatService();
  const [value, setValue] = useState('');
  const [saved, setSaved] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getInstructions(props.chatroomId).then((res: unknown) => {
      const instructions = (res as { content?: { custom_instructions?: unknown } })?.content?.custom_instructions;
      const text = typeof instructions === 'string' ? instructions : '';
      setValue(text);
      setSaved(text);
    }).catch(() => setError(true)).finally(() => setLoading(false));
  }, [props.chatroomId]);

  const handleSave = () => {
    if (saving || value.trim() === saved.trim()) {
      return;
    }
    setSaving(true);
    updateInstructions(props.chatroomId, value.trim()).then(() => {
      toast.success('Instructions saved.');
      setSaved(value.trim());
    }).catch(() => {
      toast.error('Failed to save instructions.');
    }).finally(() => setSaving(false));
  };

  return (
    <div className="flex flex-col gap-3 px-4 py-3">
      {loading && <p className="text-sm text-white-50">Loading…</p>}
      {!loading && error && <p className="text-sm text-error-200">Failed to load instructions.</p>}
      {!loading && !error && (
        <div className="flex flex-col gap-2">
          <ExpandableTextarea value={value} onChange={setValue} placeholder="Add custom instructions…" />
          <button
            onClick={handleSave}
            disabled={saving || value.trim() === saved.trim()}
            className="cursor-pointer self-end rounded-2xl bg-primary-100 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
          >
            {saving ? '…' : 'Save'}
          </button>
        </div>
      )}
    </div>
  );
};
