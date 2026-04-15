'use client';

import type { Message } from './types';
import Image from 'next/image';
import { useEffect, useRef } from 'react';
import { BouncingDots } from '@/components/general/BouncingDots';
import { useChat } from '@/context/ChatContext';

const groupByDate = (messages: Message[]) => {
  const map: Record<string, Message[]> = {};
  for (const msg of messages) {
    if (!map[msg.date]) {
      map[msg.date] = [];
    }
    map[msg.date]!.push(msg);
  }
  return map;
};

export const ChatMessageList = (props: {
  messages: Message[];
  characterName: string;
  characterImage: string;
  backgroundImage?: string;
}) => {
  const { isTyping } = useChat();
  const bottomRef = useRef<HTMLDivElement>(null);
  const grouped = groupByDate(props.messages);

  useEffect(() => {
    const id = requestAnimationFrame(() => {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    });
    return () => cancelAnimationFrame(id);
  }, [props.messages, isTyping]);

  return (
    <div className="relative flex-1 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {props.backgroundImage && (
        <>
          <Image src={props.backgroundImage} alt="" fill sizes="(max-width: 640px) 100vw, calc(100vw - 500px)" className="object-cover" />
          <div className="absolute inset-0 h-full bg-black/90" />
        </>
      )}
      <div className="relative px-4 py-4">
        {Object.entries(grouped).map(([date, msgs]) => (
          <div key={date}>
            <div className="my-4 flex items-center justify-center md:my-7.5">
              <span className="text-sm text-white">{date}</span>
            </div>

            {msgs.map(msg => (
              <div
                key={msg.id}
                className={`mb-3 flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`flex max-w-[90%] flex-col gap-1 ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
                  {msg.image && (
                    <div className="relative h-58 w-58 overflow-hidden rounded-xl">
                      <Image src={msg.image} alt="message" fill sizes="232px" className="object-cover" />
                    </div>
                  )}
                  {msg.text && (
                    <div className={`w-full max-w-[90%] rounded-2xl px-6 py-4 text-sm leading-6 text-white sm:w-131 ${msg.sender === 'user' ? 'rounded-br-sm bg-black-40' : 'rounded-bl-sm bg-black-80'}`}>
                      {msg.text}
                    </div>
                  )}
                  <span className="text-[10px] text-white-75">{msg.time}</span>
                </div>
              </div>
            ))}
          </div>
        ))}

        {isTyping && (
          <div className="mb-3 flex items-end gap-2">
            <div className="rounded-2xl rounded-bl-sm bg-black-80 px-6 py-4 text-white [&>span>span]:size-3.5">
              <BouncingDots />
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>
    </div>
  );
};
