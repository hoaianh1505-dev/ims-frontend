import React from 'react';
import { ChevronRight } from 'lucide-react';

interface HeaderProps {
  breadcrumb?: string;
}

export const Header: React.FC<HeaderProps> = ({ breadcrumb = 'Tổng quan' }) => {
  return (
    <header className="h-16 px-8 flex items-center justify-between border-b border-slate-100 bg-white/60 backdrop-blur-sm sticky top-0 z-10">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
        <span className="hover:text-slate-800 cursor-pointer transition-colors">Không gian làm việc</span>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        <span className="text-slate-800 font-semibold">{breadcrumb}</span>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-4">
        {/* Scope selector */}
        <div className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-700 shadow-2xs hover:bg-slate-50 cursor-pointer transition-colors">
          <span className="w-1.5 h-1.5 rounded-full bg-brand-primary"></span>
          <span>Toàn hệ thống kho</span>
        </div>

        {/* Date string */}
        <div className="text-xs font-medium text-slate-500">
          04.11.2026
        </div>
      </div>
    </header>
  );
};

