import React from 'react';
import { Edit3, Trash2, Truck, Loader2 } from 'lucide-react';
import { Supplier } from '../../types/supplier.types';
import { ToggleSwitch } from '../users/ToggleSwitch';

interface SupplierTableProps {
  suppliers: Supplier[];
  loading: boolean;
  isManagerOrAdmin: boolean;
  onRowClick: (supplier: Supplier) => void;
  onEdit: (supplier: Supplier) => void;
  onDelete: (supplier: Supplier) => void;
  onToggleStatus: (supplier: Supplier) => void;
}

export const SupplierTable: React.FC<SupplierTableProps> = ({
  suppliers,
  loading,
  isManagerOrAdmin,
  onRowClick,
  onEdit,
  onDelete,
  onToggleStatus,
}) => {
  if (loading && suppliers.length === 0) {
    return (
      <div className="py-24 flex flex-col items-center justify-center gap-3 text-slate-400 h-full">
        <Loader2 className="w-7 h-7 animate-spin text-slate-600" />
        <span className="text-sm font-medium">Đang tải danh sách nhà cung cấp...</span>
      </div>
    );
  }

  if (suppliers.length === 0) {
    return (
      <div className="py-20 text-center text-slate-400 space-y-3 h-full flex flex-col items-center justify-center">
        <Truck className="w-12 h-12 mx-auto text-slate-300 stroke-1" />
        <div className="text-base font-bold text-slate-800">Không tìm thấy nhà cung cấp nào</div>
        <p className="text-sm text-slate-500 max-w-sm mx-auto">
          Thử thay đổi từ khóa tìm kiếm hoặc bấm "Thêm nhà cung cấp" để tạo mới đối tác.
        </p>
      </div>
    );
  }

  return (
    <table className="w-full text-left border-collapse text-sm">
      <thead>
        <tr className="sticky top-0 bg-slate-50 z-10 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-xs select-none shadow-2xs">
          <th className="py-2.5 px-4 w-72">Nhà cung cấp</th>
          <th className="py-2.5 px-4 w-44">Người liên hệ</th>
          <th className="py-2.5 px-4 min-w-[200px]">Liên hệ</th>
          <th className="py-2.5 px-4 min-w-[220px]">Địa chỉ</th>
          <th className="py-2.5 px-4 w-44">Trạng thái</th>
          {isManagerOrAdmin && (
            <th className="py-2.5 px-4 w-28 text-right whitespace-nowrap">Thao tác</th>
          )}
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-100 text-slate-700 animate-tab-enter">
        {suppliers.map((s) => (
          <tr
            key={s.id}
            onClick={() => onRowClick(s)}
            className="hover:bg-slate-50/80 transition-colors group cursor-pointer"
          >
            {/* Supplier Name & Code */}
            <td className="py-2.5 px-4">
              <div>
                <div className="font-semibold text-slate-800 group-hover:text-[#EE3D43] transition-colors text-sm line-clamp-1 leading-snug">
                  {s.name}
                </div>
                {s.code && (
                  <span className="font-mono text-xs text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200/80 inline-block mt-0.5">
                    {s.code}
                  </span>
                )}
              </div>
            </td>

            {/* Contact Person */}
            <td className="py-2.5 px-4 text-slate-700 whitespace-nowrap">
              {s.contact_name ? (
                <span className="font-medium text-sm text-slate-800">
                  {s.contact_name}
                </span>
              ) : (
                <span className="text-slate-400 italic text-xs">Chưa cập nhật</span>
              )}
            </td>

            {/* Contact info: Phone & Email */}
            <td className="py-2.5 px-4">
              <div>
                <div className="text-sm text-slate-800 truncate">
                  {s.email || <span className="text-slate-400 italic text-xs">Chưa có email</span>}
                </div>
                {s.phone && (
                  <div className="text-xs text-slate-500 font-mono mt-0.5">
                    {s.phone}
                  </div>
                )}
              </div>
            </td>

            {/* Address */}
            <td className="py-2.5 px-4 text-slate-600">
              <span className="line-clamp-1 text-sm" title={s.address || ''}>
                {s.address || <span className="text-slate-400 italic text-xs">Chưa có địa chỉ</span>}
              </span>
            </td>

            {/* Active Status Switch */}
            <td className="py-2.5 px-4 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center gap-2.5">
                <ToggleSwitch
                  checked={s.is_active}
                  disabled={!isManagerOrAdmin}
                  onChange={() => onToggleStatus(s)}
                  title={s.is_active ? 'Bấm để tạm ngưng giao dịch' : 'Bấm để kích hoạt giao dịch'}
                />
                <span
                  className={`text-xs font-medium w-24 text-left ${
                    s.is_active ? 'text-emerald-700' : 'text-slate-400'
                  }`}
                >
                  {s.is_active ? 'Đang hợp tác' : 'Tạm ngưng'}
                </span>
              </div>
            </td>

            {/* Actions */}
            {isManagerOrAdmin && (
              <td
                className="py-2.5 px-4 text-right whitespace-nowrap"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="inline-flex items-center justify-end gap-1">
                  <button
                    onClick={() => onEdit(s)}
                    className="p-1.5 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                    title="Chỉnh sửa đối tác"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => onDelete(s)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                    title="Xóa nhà cung cấp"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </td>
            )}
          </tr>
        ))}
      </tbody>
    </table>
  );
};
