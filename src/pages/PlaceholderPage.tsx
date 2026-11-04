import React from 'react';
import { LucideIcon, Layers } from 'lucide-react';

interface PlaceholderPageProps {
  title: string;
  description: string;
  icon?: LucideIcon;
}

export const PlaceholderPage: React.FC<PlaceholderPageProps> = ({
  title,
  description,
  icon: Icon = Layers,
}) => {
  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      <div className="pb-2 border-b border-slate-200">
        <h1 className="text-2xl font-bold text-slate-800 tracking-tight">{title}</h1>
        <p className="text-sm text-slate-500 mt-1">{description}</p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-16 text-center">
        <div className="w-14 h-14 mx-auto rounded-2xl bg-brand-light flex items-center justify-center text-brand-primary mb-4">
          <Icon className="w-7 h-7 stroke-1.5" />
        </div>
        <h3 className="text-base font-bold text-slate-800">Tính năng đang hoàn thiện</h3>
        <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
          Phân hệ {title} đang được liên kết cơ sở dữ liệu và xây dựng giao diện chi tiết.
        </p>
      </div>
    </div>
  );
};
