'use client';

import { useState } from 'react';
import { AiIcon, AttachIcon, MicIcon, SendIcon } from '@/components/icons';

export const ChatInputBar = () => {
  const [input, setInput] = useState('');

  return (
    <div className=" flex py-3 sm:px-4">
      <div className="flex w-full items-center gap-3 rounded-l-xl border border-black-40 bg-black-60 px-3 py-3 sm:px-4 sm:py-6">
        <button className="cursor-pointer text-white-75 hover:text-white">
          <AttachIcon />
        </button>
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Send a message..."
          className="flex-1 bg-transparent text-sm text-white placeholder-white-75 focus:outline-none"
        />
        <button className="cursor-pointer text-white-75 hover:text-white">
          {input.trim() ? <SendIcon /> : <AiIcon />}
        </button>
      </div>
      <button className="cursor-pointer rounded-r-xl bg-primary-100 px-3 py-3 text-white sm:px-6 sm:py-4">
        <MicIcon />
      </button>
    </div>
  );
};
