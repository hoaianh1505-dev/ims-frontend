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
    <div className={`flex items-center gap-2.5 ${className}`}>
      {/* Mark: simple storage rack */}
      <svg
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`shrink-0 ${isLarge ? 'w-9 h-9' : 'w-7 h-7'}`}
      >
        <rect width="32" height="32" rx="7" fill="#EE3D43" />
        <path d="M9 8v16M23 8v16" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
        <path d="M9 13h14M9 19h14" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
      </svg>

      <div className="flex items-baseline gap-2 leading-none">
        <span
          className={`font-bold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'} ${
            isLarge ? 'text-2xl' : 'text-lg'
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
    </div>
  );
};
