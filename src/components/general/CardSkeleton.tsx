'use client';

import { Skeleton } from '@/components/ui/skeleton';

const sizeClasses = {
  lg: 'h-77.5 max-w-75 min-w-65',
  sm: 'h-65 max-w-50 min-w-40',
};

export const CardSkeleton = (props: { size?: keyof typeof sizeClasses }) => {
  return <Skeleton className={`${sizeClasses[props.size ?? 'lg']} flex-1 rounded-2xl`} />;
};
