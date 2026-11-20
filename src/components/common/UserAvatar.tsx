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

  // Fallback: Gradient avatar with user initials
  const words = (alt || 'User').trim().split(/\s+/).filter(Boolean);
  let initials = 'AD';
  if (words.length >= 2) {
    initials = (words[0][0] + words[1][0]).toUpperCase();
  } else if (words.length === 1 && words[0].length >= 2) {
    initials = words[0].slice(0, 2).toUpperCase();
  } else if (words.length === 1 && words[0].length === 1) {
    initials = words[0].toUpperCase();
  }

  return (
    <span
      className={`inline-flex items-center justify-center overflow-hidden rounded-full font-bold select-none shrink-0 bg-gradient-to-tr from-[#EE3D43] via-rose-500 to-amber-500 text-white shadow-xs border border-white/20 tracking-wider ${sizeClasses} ${className}`}
      aria-label={alt}
      title={alt}
    >
      {initials}
    </span>
  );
};
