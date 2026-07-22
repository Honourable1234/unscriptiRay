'use client';

import { Skeleton } from '@/components/ui/skeleton';

export const CharacterModalSkeleton = () => {
  return (
    <div className="px-4">
      <div className="mb-3 flex items-center justify-center gap-2">
        <Skeleton className="h-5 w-28" />
        <Skeleton className="h-5 w-8" />
      </div>

      <div className="m-auto mb-6 flex w-fit gap-2">
        <Skeleton className="h-10 w-16 rounded-lg" />
        <Skeleton className="h-10 w-16 rounded-lg" />
        <Skeleton className="h-10 w-16 rounded-lg" />
      </div>

      <div className="relative mx-4 mb-8" style={{ aspectRatio: '4/3' }}>
        <Skeleton className="mx-auto h-full w-[70%] rounded-3xl" />
      </div>

      <div className="flex gap-3 border-t border-black-40 p-4">
        <Skeleton className="h-11 flex-1 rounded-xl" />
        <Skeleton className="h-11 flex-1 rounded-xl" />
      </div>
    </div>
  );
};
