import React from 'react';

interface UserAvatarProps {
  src?: string | null;
  alt?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  variant?: 'light' | 'dark';
  className?: string;
}

export const UserAvatar: React.FC<UserAvatarProps> = ({
  src,
  alt = 'User Avatar',
  size = 'md',
  variant = 'light',
  className = '',
}) => {
  const sizeClasses = {
    xs: 'w-6 h-6',
    sm: 'w-7 h-7',
    md: 'w-8 h-8',
    lg: 'w-9 h-9 sm:w-10 sm:h-10',
  }[size];

  if (src) {
    return (
      <img
        src={src}
        alt={alt}
        className={`${sizeClasses} rounded-full object-cover border ${
          variant === 'dark' ? 'border-[#333D4B]' : 'border-slate-200'
        } shrink-0 ${className}`}
      />
    );
  }

  return (
    <span
      className={`inline-flex items-center justify-center overflow-hidden rounded-full shrink-0 ${sizeClasses} ${
        variant === 'dark'
          ? 'bg-[#262E38] border border-[#333D4B] text-slate-400'
          : 'bg-slate-100 border border-slate-200/80 text-slate-400'
      } ${className}`}
      aria-label={alt}
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
