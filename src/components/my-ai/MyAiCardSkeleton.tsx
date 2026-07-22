'use client';

import { Skeleton } from '@/components/ui/skeleton';

export const MyAiCardSkeleton = () => {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-black-80">
      <Skeleton className="h-116 w-full rounded-2xl lg:h-136" />
      <div className="absolute right-0 bottom-0 left-0 flex flex-col gap-2 p-4">
        <Skeleton className="h-5 w-32 bg-white/10" />
        <Skeleton className="h-3 w-44 bg-white/10" />
      </div>
    </div>
  );
};
