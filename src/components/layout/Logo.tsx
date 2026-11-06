import React from 'react';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'light' | 'dark';
}

export const Logo: React.FC<LogoProps> = ({ className = '', size = 'md', variant = 'light' }) => {
  const isLarge = size === 'lg';
  const isDark = variant === 'dark';

  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      <div className="flex items-center gap-2.5">
        <div className={`relative shrink-0 ${isLarge ? 'w-11 h-11' : 'w-8 h-8'}`}>
          {isDark ? (
            <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-xs">
              <rect x="4" y="8" width="32" height="26" rx="4" fill="#EE3D43" />
              <path d="M4 16H36" stroke="#FFFFFF" strokeWidth="2" strokeOpacity="0.3" />
              <path d="M16 8V16H24V8" fill="#FFFFFF" fillOpacity="0.2" />
              <rect x="18" y="11" width="4" height="2" rx="1" fill="#FFFFFF" />
            </svg>
          ) : (
            <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-xs">
              <path d="M20 4L34 12L20 20L6 12L20 4Z" fill="#EE3D43" />
              <path d="M6 12L20 20V36L6 28V12Z" fill="#C62828" />
              <path d="M20 20L34 12V28L20 36V20Z" fill="#8E0000" />
              <path d="M20 9L27 13L20 17L13 13L20 9Z" fill="#FF8A80" fillOpacity="0.85" />
              <path d="M20 23V31" stroke="#FFCDD2" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          )}
        </div>
        <div className="flex items-baseline tracking-tight">
          <span
            className={`font-black tracking-wider ${
              isDark ? 'text-white' : 'text-slate-900'
            } ${isLarge ? 'text-2xl sm:text-3xl' : 'text-xl'}`}
          >
            Inventory
          </span>
          <span
            className={`font-bold rounded-sm ml-1.5 px-1.5 py-0.5 text-[10px] uppercase ${
              isDark
                ? 'bg-[#EE3D43]/20 text-[#EE3D43] border border-[#EE3D43]/30'
                : 'bg-rose-50 text-[#EE3D43] border border-rose-200'
            }`}
          >
            IMS
          </span>
        </div>
      </div>
      <div
        className={`font-semibold tracking-[0.2em] uppercase ${
          isDark ? 'text-slate-400' : 'text-slate-400'
        } ${isLarge ? 'text-xs pl-0.5' : 'text-[9px] pl-0.5'}`}
      >
        Kho hàng & Vận hành
      </div>
    </div>
  );
};

