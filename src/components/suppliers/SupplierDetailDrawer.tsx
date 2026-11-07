import React from 'react';
import {
  X,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Building2,
  User,
  Edit3,
  ArrowDownLeft,
} from 'lucide-react';
import { Supplier } from '../../types/supplier.types';
import { useNavigate } from 'react-router-dom';

interface SupplierDetailDrawerProps {
  supplier: Supplier | null;
  onClose: () => void;
  onEdit: (supplier: Supplier) => void;
  isManagerOrAdmin: boolean;
}

export const SupplierDetailDrawer: React.FC<SupplierDetailDrawerProps> = ({
  supplier,
  onClose,
  onEdit,
  isManagerOrAdmin,
}) => {
  const navigate = useNavigate();

  if (!supplier) return null;

  return (
    <div className="fixed inset-0 z-40 flex justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/30 backdrop-blur-2xs transition-opacity"
        onClick={onClose}
      />

      {/* Drawer Panel */}
      <div className="relative z-50 w-full max-w-lg bg-white h-full shadow-2xl border-l border-slate-200 flex flex-col animate-in slide-in-from-right duration-200">
        {/* Drawer Header */}
        <div className="p-6 border-b border-slate-100 flex items-start justify-between bg-slate-50/50">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-700">
                {supplier.code || 'SUP-N/A'}
              </span>
              <span
                className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${
                  supplier.is_active
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : 'bg-slate-100 text-slate-500 border-slate-200'
                }`}
              >
                {supplier.is_active ? 'Đang hợp tác' : 'Tạm ngưng'}
              </span>
            </div>
            <h2 className="text-lg font-bold text-slate-900 leading-snug">
              {supplier.name}
            </h2>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drawer Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar text-sm">
          {/* Quick Actions */}
          <div className="grid grid-cols-2 gap-2.5">
            <button
              onClick={() => {
                onClose();
                navigate('/stock-transactions');
              }}
              className="flex items-center justify-center gap-2 py-2.5 px-3 bg-[#EE3D43] hover:bg-[#D9343A] text-white rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer"
            >
              <ArrowDownLeft className="w-4 h-4" />
              <span>Tạo phiếu nhập hàng</span>
            </button>

            {isManagerOrAdmin && (
              <button
                onClick={() => onEdit(supplier)}
                className="flex items-center justify-center gap-2 py-2.5 px-3 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold transition-all cursor-pointer"
              >
                <Edit3 className="w-4 h-4" />
                <span>Chỉnh sửa đối tác</span>
              </button>
            )}
          </div>

          {/* Contact Details Card */}
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 space-y-3">
            <div className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <User className="w-3.5 h-3.5 text-slate-500" />
              Đầu mối liên hệ
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between py-1 border-b border-slate-200/50">
                <span className="text-slate-500 text-xs">Người đại diện:</span>
                <span className="font-semibold text-slate-800">
                  {supplier.contact_name || 'Chưa cập nhật'}
                </span>
              </div>

              <div className="flex items-center justify-between py-1 border-b border-slate-200/50">
                <span className="text-slate-500 text-xs">Số điện thoại:</span>
                {supplier.phone ? (
                  <a
                    href={`tel:${supplier.phone}`}
                    className="font-mono font-medium text-slate-800 hover:text-[#EE3D43] flex items-center gap-1.5"
                  >
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    {supplier.phone}
                  </a>
                ) : (
                  <span className="text-slate-400 italic text-xs">Chưa có</span>
                )}
              </div>

              <div className="flex items-center justify-between py-1">
                <span className="text-slate-500 text-xs">Email liên hệ:</span>
                {supplier.email ? (
                  <a
                    href={`mailto:${supplier.email}`}
                    className="font-medium text-slate-800 hover:text-[#EE3D43] flex items-center gap-1.5 truncate max-w-[220px]"
                  >
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    {supplier.email}
                  </a>
                ) : (
                  <span className="text-slate-400 italic text-xs">Chưa có</span>
                )}
              </div>
            </div>
          </div>

          {/* Address & Facility Card */}
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 space-y-2.5">
            <div className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5 text-slate-500" />
              Địa chỉ kho bãi / Trụ sở
            </div>

            <p className="text-sm text-slate-700 leading-relaxed">
              {supplier.address || (
                <span className="text-slate-400 italic text-xs">
                  Chưa cập nhật địa chỉ trụ sở của đối tác này.
                </span>
              )}
            </p>
          </div>

          {/* System metadata */}
          <div className="text-xs text-slate-400 space-y-1.5 pt-2 border-t border-slate-100">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              <span>
                Ngày tạo đối tác:{' '}
                {new Date(supplier.created_at).toLocaleDateString('vi-VN')}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5" />
              <span>Mã định danh hệ thống (ID): {supplier.id}</span>
            </div>
          </div>
        </div>

        {/* Drawer Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-slate-200 text-slate-600 hover:bg-slate-100 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
          >
            Đóng cửa sổ
          </button>
        </div>
      </div>
    </div>
  );
};
