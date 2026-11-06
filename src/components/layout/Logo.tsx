import React from 'react';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'light' | 'dark';
  showText?: boolean;
}

const ICON_SIZES = {
  sm: 'w-8 h-8',
  md: 'w-10 h-10',
  lg: 'w-12 h-12',
};

/** IMS app logo loaded directly from /public/images/logo.png */
export const LogoMark: React.FC<{ className?: string; size?: 'sm' | 'md' | 'lg' }> = ({
  className = '',
  size = 'md',
}) => (
  <div
    className={`shrink-0 overflow-hidden rounded-xl bg-white p-1 flex items-center justify-center shadow-xs border border-slate-200/60 ${ICON_SIZES[size]} ${className}`}
  >
    <img
      src="/images/logo.png"
      alt="IMS Logo"
      draggable={false}
      className="w-full h-full object-contain select-none"
    />
  </div>
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
      <LogoMark size={size} />

      {showText && (
        <div className="leading-tight">
          <div
            className={`font-bold tracking-tight ${
              isDark ? 'text-white' : 'text-slate-900'
            } ${isLarge ? 'text-lg' : 'text-sm'}`}
          >
            Quản lý kho
          </div>
          <div
            className={`${
              isDark ? 'text-slate-400' : 'text-slate-500'
            } ${isLarge ? 'text-xs' : 'text-[11px]'}`}
          >
            Inventory Management
          </div>
        </div>
      )}
    </div>
  );
};

