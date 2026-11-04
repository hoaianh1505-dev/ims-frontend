import React from 'react';

export const Logo: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      <div className="flex items-center gap-2.5">
        {/* Stylized Modern Isometric 3D Storage Box */}
        <div className="relative w-8 h-8 shrink-0">
          <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-xs">
            {/* Top diamond face */}
            <path
              d="M20 4L34 12L20 20L6 12L20 4Z"
              fill="#2D7A64"
            />
            {/* Left face */}
            <path
              d="M6 12L20 20V36L6 28V12Z"
              fill="#1A4D3E"
            />
            {/* Right face */}
            <path
              d="M20 20L34 12V28L20 36V20Z"
              fill="#10362B"
            />
            {/* Inner dynamic cut - smart rack layer */}
            <path
              d="M20 9L27 13L20 17L13 13L20 9Z"
              fill="#A7D4C6"
              fillOpacity="0.85"
            />
            <path
              d="M20 23V31"
              stroke="#A7D4C6"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        </div>

        {/* Brand Name Typography */}
        <div className="flex items-baseline tracking-tight">
          <span className="text-xl font-black text-slate-900 tracking-wider">IMS</span>
          <span className="text-xs font-bold text-brand-primary ml-1.5 px-1.5 py-0.2 bg-brand-light rounded-sm">
            CORE
          </span>
        </div>
      </div>

      {/* Subtitle like reference image */}
      <div className="text-[10px] font-bold text-slate-400 tracking-[0.22em] uppercase pl-0.5">
        Kho hàng & Vận hành
      </div>
    </div>
  );
};

