'use client';

import type { SceneActionKey } from '@/components/generate/GenerateSceneActions';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import { generatePlaceholders } from '@/components/generate/generatePlaceholders';
import { GenerateSceneActions } from '@/components/generate/GenerateSceneActions';
import { GenerateSceneModal } from '@/components/generate/GenerateSceneModal';
import { CloseIcon } from '@/components/icons';

export default function GenerateScenePage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const [activeId, setActiveId] = useState(params.id);
  const active = generatePlaceholders.find(p => p.id === activeId) ?? generatePlaceholders[0]!;
  const [modal, setModal] = useState<SceneActionKey | null>(null);

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black">
      {/* Close */}
      <button
        onClick={() => router.back()}
        className="absolute top-4 left-4 z-10 cursor-pointer rounded-full bg-black-60 p-1 text-white"
      >
        <CloseIcon />
      </button>

      {/* Main image */}
      <div className="flex flex-1 items-center justify-center px-2">
        <div className="relative h-full max-h-123 w-full max-w-105 overflow-hidden rounded-lg">
          <Image src={active.src} alt="Generated scene" fill className="object-cover" sizes="512px" />
        </div>
      </div>

      {/* Actions */}
      <div className="overflow-x-auto pb-8 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <div className="m-auto flex w-fit gap-2 px-4">
          <GenerateSceneActions onAction={key => setModal(key)} />
        </div>
      </div>

      {/* Thumbnails — scrollable row on mobile, column top-right on sm+ */}
      <div className="absolute top-4 right-0 left-0 overflow-x-auto [scrollbar-width:none] sm:right-4 sm:left-auto sm:overflow-x-visible [&::-webkit-scrollbar]:hidden">
        <div className="flex gap-2 px-4 sm:flex-col sm:px-0">
          {generatePlaceholders.map(item => (
            <button
              key={item.id}
              onClick={() => setActiveId(item.id)}
              className={`relative h-39 w-31 shrink-0 cursor-pointer overflow-hidden rounded-xl border-2 transition-colors ${active.id === item.id ? 'border-primary-100' : 'border-transparent'}`}
            >
              <Image src={item.src} alt="Thumbnail" fill className="object-cover" sizes="124px" />
            </button>
          ))}
        </div>
      </div>

      {/* Modal */}
      {modal && (
        <GenerateSceneModal action={modal} onClose={() => setModal(null)} imageSrc={active.src} imageName={active.name} />
      )}
    </div>
  );
}
