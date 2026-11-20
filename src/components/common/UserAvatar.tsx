import React, { useState, useEffect } from 'react';
import { formatImageUrl } from '../../utils/image.util';

interface UserAvatarProps {
  src?: string | null;
  alt?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  variant?: 'light' | 'dark';
  className?: string;
}

export const UserAvatar: React.FC<UserAvatarProps> = ({
  src,
  alt = 'User',
  size = 'md',
  variant = 'light',
  className = '',
}) => {
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setHasError(false);
  }, [src]);

  const sizeClasses = {
    xs: 'w-6 h-6 text-[10px]',
    sm: 'w-7 h-7 text-[11px]',
    md: 'w-8 h-8 text-xs',
    lg: 'w-10 h-10 text-sm font-bold',
  }[size];

  const resolvedUrl = formatImageUrl(src);

  if (resolvedUrl && !hasError) {
    return (
      <img
        src={resolvedUrl}
        alt={alt}
        onError={() => setHasError(true)}
        className={`${sizeClasses} rounded-full object-cover border ${
          variant === 'dark' ? 'border-[#384252]' : 'border-slate-200 dark:border-[#384252]'
        } shrink-0 ${className}`}
      />
    );
  }

  // Fallback: Default clean SVG user avatar (như cũ)
  return (
    <span
      className={`inline-flex items-center justify-center overflow-hidden rounded-full shrink-0 ${sizeClasses} ${
        variant === 'dark'
          ? 'bg-[#262E38] border border-[#384252] text-slate-400'
          : 'bg-slate-100 dark:bg-[#21262d] border border-slate-200 dark:border-[#384252] text-slate-400 dark:text-slate-500'
      } ${className}`}
      aria-label={alt}
      title={alt}
    >
      <svg
        className="h-full w-full"
        fill="currentColor"
        viewBox="0 0 24 24"
      >
        <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
    </span>
  );
};
