'use client';

import { Skeleton } from '@/components/ui/skeleton';

export const FeedCardSkeleton = () => {
  return (
    <div className="relative mx-auto h-full w-full max-w-lg shrink-0 overflow-hidden bg-black-100 px-4">
      <Skeleton className="absolute inset-4 rounded-2xl" />

      <div className="absolute right-20 bottom-8 left-8 flex items-center gap-3">
        <Skeleton className="h-10 w-10 shrink-0 rounded-full bg-white/10" />
        <Skeleton className="h-4 w-28 bg-white/10" />
      </div>

      <div className="absolute right-7 bottom-10 flex flex-col items-center gap-6">
        <Skeleton className="h-8 w-8 rounded-full bg-white/10" />
        <Skeleton className="h-8 w-8 rounded-full bg-white/10" />
        <Skeleton className="h-8 w-8 rounded-full bg-white/10" />
      </div>
    </div>
  );
};
