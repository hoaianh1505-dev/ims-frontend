import React from 'react';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'light' | 'dark';
  showText?: boolean;
}

/**
 * IMS brand mark: three stacked blocks (pallet stack).
 * Same geometry as /public/logo.svg and /public/favicon.svg.
 */
export const LogoMark: React.FC<{ className?: string }> = ({ className = '' }) => (
  <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden="true">
    <rect x="11" y="2.5" width="10" height="6" rx="1.8" fill="#F58A8D" />
    <rect x="7" y="10" width="18" height="7.5" rx="2" fill="#EE3D43" />
    <rect x="3" y="19" width="26" height="10" rx="2.5" fill="#B8242A" />
  </svg>
);

export const Logo: React.FC<LogoProps> = ({
  className = '',
  size = 'md',
  variant = 'light',
  showText = true,
}) => {
  const isLarge = size === 'lg';
  const isSmall = size === 'sm';
  const isDark = variant === 'dark';

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <LogoMark className={`shrink-0 ${isLarge ? 'w-9 h-9' : isSmall ? 'w-6 h-6' : 'w-7 h-7'}`} />

      {showText && (
        <div className="flex items-baseline gap-2 leading-none">
          <span
            className={`font-extrabold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'} ${
              isLarge ? 'text-2xl' : isSmall ? 'text-base' : 'text-lg'
            }`}
          >
            IMS
          </span>
          <span
            className={`font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'} ${
              isLarge ? 'text-sm' : 'text-xs'
            }`}
          >
            Quản lý kho
          </span>
        </div>
      )}
    </div>
  );
};
