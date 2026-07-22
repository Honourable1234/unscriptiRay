'use client';

import { Skeleton } from '@/components/ui/skeleton';

const mediaTileKeys = ['a', 'b', 'c', 'd', 'e', 'f'];

export const CharacterContentSkeleton = () => {
  return (
    <div className="w-full py-2.5">
      <div className="mb-4 flex flex-wrap items-start gap-3 border-b border-black-40 pb-3">
        <Skeleton className="h-25 w-25 shrink-0 rounded-full" />
        <div className="flex flex-1 flex-col gap-3">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-3 w-56" />
          <Skeleton className="h-3 w-full max-w-100" />
          <div className="flex flex-wrap gap-3">
            <Skeleton className="h-9 w-32 rounded-xl" />
            <Skeleton className="h-9 w-32 rounded-xl" />
            <Skeleton className="h-9 w-32 rounded-xl" />
          </div>
        </div>
      </div>
      <div className="flex flex-wrap gap-2.5">
        {mediaTileKeys.map(key => (
          <Skeleton key={key} className="aspect-3/4 max-w-80 min-w-60 flex-1 rounded-xl" />
        ))}
      </div>
    </div>
  );
};
