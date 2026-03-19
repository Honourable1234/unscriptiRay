'use client';

import { useState } from 'react';
import { Link } from '@/libs/I18nNavigation';
import { BouncingDots } from '../general/BouncingDots';

export const AuthLink = (props: {
  text: string;
  linkText: string;
  href: string;
}) => {
  const [isLoading, setIsLoading] = useState(false);

  return (
    <p className="p-3 text-center text-xs font-medium">
      <span className="text-white">{props.text}</span>
      {' '}
      <Link
        href={props.href}
        onClick={() => setIsLoading(true)}
        className={isLoading ? 'pointer-events-none' : ''}
      >
        <span className="inline-flex items-center text-primary-100">
          {isLoading ? <BouncingDots /> : props.linkText}
        </span>
      </Link>
    </p>
  );
};
