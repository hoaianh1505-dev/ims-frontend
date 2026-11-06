import React from 'react';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'light' | 'dark';
  showText?: boolean;
}

const ICON_SIZES = {
  sm: 'w-7 h-7',
  md: 'w-9 h-9',
  lg: 'w-11 h-11',
};

/** IMS app icon (generated from /public/images/logo.png). */
export const LogoMark: React.FC<{ className?: string }> = ({ className = '' }) => (
  <img src="/logo-192.png" alt="IMS" draggable={false} className={`select-none ${className}`} />
);

export const Logo: React.FC<LogoProps> = ({
  className = '',
  size = 'md',
  variant = 'light',
  showText = true,
}) => {
  const isLarge = size === 'lg';
  const isDark = variant === 'dark';

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <LogoMark className={`shrink-0 rounded-[22%] ${ICON_SIZES[size]}`} />

      {showText && (
        <div className="leading-tight">
          <div
            className={`font-bold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'} ${
              isLarge ? 'text-lg' : 'text-sm'
            }`}
          >
            Quản lý kho
          </div>
          <div
            className={`${isDark ? 'text-slate-400' : 'text-slate-500'} ${
              isLarge ? 'text-xs' : 'text-[11px]'
            }`}
          >
            Inventory Management
          </div>
        </div>
      )}
    </div>
  );
};
