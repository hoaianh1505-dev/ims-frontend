import React from 'react';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const Logo: React.FC<LogoProps> = ({ className = '', size = 'md' }) => {
  const isLarge = size === 'lg';

  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      <div className="flex items-center gap-3">
        <div className={`relative shrink-0 ${isLarge ? 'w-11 h-11' : 'w-8 h-8'}`}>
          <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-xs">
            <path d="M20 4L34 12L20 20L6 12L20 4Z" fill="#2D7A64" />
            <path d="M6 12L20 20V36L6 28V12Z" fill="#1A4D3E" />
            <path d="M20 20L34 12V28L20 36V20Z" fill="#10362B" />
            <path d="M20 9L27 13L20 17L13 13L20 9Z" fill="#A7D4C6" fillOpacity="0.85" />
            <path d="M20 23V31" stroke="#A7D4C6" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </div>
        <div className="flex items-baseline tracking-tight">
          <span className={`font-black text-slate-900 tracking-wider ${isLarge ? 'text-2xl sm:text-3xl' : 'text-xl'}`}>
            IMS
          </span>
          <span
            className={`font-bold text-brand-primary bg-brand-light rounded-sm ${
              isLarge ? 'text-xs ml-2 px-2 py-0.5' : 'text-xs ml-1.5 px-1.5 py-0.2'
            }`}
          >
            CORE
          </span>
        </div>
      </div>
      <div
        className={`font-bold text-slate-400 tracking-[0.24em] uppercase ${
          isLarge ? 'text-xs pl-0.5' : 'text-[10px] pl-0.5'
        }`}
      >
        Kho hàng & Vận hành
      </div>
    </div>
  );
};

