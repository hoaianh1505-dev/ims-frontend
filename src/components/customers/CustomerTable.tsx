import React from 'react';
import { Edit3, Trash2, Users, Loader2 } from 'lucide-react';
import { Customer, CustomerType } from '../../types/customer.types';
import { ToggleSwitch } from '../users/ToggleSwitch';

interface CustomerTableProps {
  customers: Customer[];
  loading: boolean;
  isManagerOrAdmin: boolean;
  onRowClick: (customer: Customer) => void;
  onEdit: (customer: Customer) => void;
  onDelete: (customer: Customer) => void;
  onToggleStatus: (customer: Customer) => void;
}

const TYPE_CONFIG: Record<CustomerType, { label: string; badgeClass: string }> = {
  RETAIL: {
    label: 'Khách lẻ',
    badgeClass: 'bg-slate-100 text-slate-700 border-slate-200',
  },
  WHOLESALE: {
    label: 'Khách sỉ',
    badgeClass: 'bg-blue-50 text-blue-700 border-blue-200',
  },
  DISTRIBUTOR: {
    label: 'Đại lý phân phối',
    badgeClass: 'bg-purple-50 text-purple-700 border-purple-200',
  },
};

const formatCurrency = (val: number) =>
  new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(val || 0);

export const CustomerTable: React.FC<CustomerTableProps> = ({
  customers,
  loading,
  isManagerOrAdmin,
  onRowClick,
  onEdit,
  onDelete,
  onToggleStatus,
}) => {
  if (loading && customers.length === 0) {
    return (
      <div className="py-24 flex flex-col items-center justify-center gap-3 text-slate-400 h-full">
        <Loader2 className="w-7 h-7 animate-spin text-slate-600" />
        <span className="text-sm font-medium">Đang tải danh sách khách hàng...</span>
      </div>
    );
  }

  if (customers.length === 0) {
    return (
      <div className="py-20 text-center text-slate-400 space-y-3 h-full flex flex-col items-center justify-center">
        <Users className="w-12 h-12 mx-auto text-slate-300 stroke-1" />
        <div className="text-base font-bold text-slate-800">Không tìm thấy khách hàng nào</div>
        <p className="text-sm text-slate-500 max-w-sm mx-auto">
          Thử thay đổi từ khóa tìm kiếm hoặc bấm "Thêm khách hàng" để tạo mới đối tác xuất kho.
        </p>
      </div>
    );
  }

  return (
    <table className="w-full text-left border-collapse text-sm">
      <thead>
        <tr className="sticky top-0 bg-slate-50 z-10 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-xs select-none shadow-2xs">
          <th className="py-2.5 px-4 w-72">Khách hàng / Đối tác</th>
          <th className="py-2.5 px-4 w-40">Phân loại</th>
          <th className="py-2.5 px-4 min-w-[200px]">Thông tin liên hệ</th>
          <th className="py-2.5 px-4 min-w-[220px]">Địa chỉ / MST</th>
          <th className="py-2.5 px-4 w-44 text-right">Công nợ / Hạn mức</th>
          <th className="py-2.5 px-4 w-36">Trạng thái</th>
          {isManagerOrAdmin && (
            <th className="py-2.5 px-4 w-28 text-right whitespace-nowrap">Thao tác</th>
          )}
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-100 text-slate-700 animate-tab-enter">
        {customers.map((c) => {
          const typeCfg = TYPE_CONFIG[c.type] || TYPE_CONFIG.RETAIL;

          return (
            <tr
              key={c.id}
              onClick={() => onRowClick(c)}
              className="hover:bg-slate-50/80 transition-colors group cursor-pointer"
            >
              {/* Customer Name & Code */}
              <td className="py-2.5 px-4">
                <div>
                  <div className="font-semibold text-slate-800 group-hover:text-[#EE3D43] transition-colors text-sm line-clamp-1 leading-snug">
                    {c.name}
                  </div>
                  {c.code && (
                    <span className="font-mono text-xs text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200/80 inline-block mt-0.5">
                      {c.code}
                    </span>
                  )}
                </div>
              </td>

              {/* Type Badge */}
              <td className="py-2.5 px-4 whitespace-nowrap">
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-semibold border ${typeCfg.badgeClass}`}
                >
                  {typeCfg.label}
                </span>
              </td>

              {/* Contact info: Phone & Email */}
              <td className="py-2.5 px-4">
                <div>
                  <div className="text-sm text-slate-800 truncate">
                    {c.phone ? (
                      <span className="font-mono font-medium">{c.phone}</span>
                    ) : (
                      <span className="text-slate-400 italic text-xs">Chưa có SĐT</span>
                    )}
                  </div>
                  {c.email && (
                    <div className="text-xs text-slate-500 truncate mt-0.5">
                      {c.email}
                    </div>
                  )}
                </div>
              </td>

              {/* Address & Tax ID */}
              <td className="py-2.5 px-4 text-slate-600">
                <div className="line-clamp-1 text-sm" title={c.address || ''}>
                  {c.address || (
                    <span className="text-slate-400 italic text-xs">Chưa có địa chỉ</span>
                  )}
                </div>
                {c.tax_id && (
                  <div className="text-xs text-slate-400 font-mono mt-0.5">
                    MST: {c.tax_id}
                  </div>
                )}
              </td>

              {/* Debt & Debt Limit */}
              <td className="py-2.5 px-4 text-right whitespace-nowrap">
                <div className="font-mono font-bold text-slate-800 text-sm">
                  {formatCurrency(c.current_debt)}
                </div>
                <div className="text-[11px] text-slate-400 font-mono">
                  HM: {formatCurrency(c.debt_limit)}
                </div>
              </td>

              {/* Active Status Switch */}
              <td className="py-2.5 px-4 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center gap-2">
                  <ToggleSwitch
                    checked={c.is_active}
                    disabled={!isManagerOrAdmin}
                    onChange={() => onToggleStatus(c)}
                    title={
                      c.is_active ? 'Bấm để tạm ngưng giao dịch' : 'Bấm để kích hoạt giao dịch'
                    }
                  />
                  <span
                    className={`text-xs font-medium w-20 text-left ${
                      c.is_active ? 'text-emerald-700' : 'text-slate-400'
                    }`}
                  >
                    {c.is_active ? 'Đang hợp tác' : 'Tạm ngưng'}
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
                      onClick={() => onEdit(c)}
                      className="p-1.5 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                      title="Chỉnh sửa thông tin khách hàng"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => onDelete(c)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                      title="Xóa khách hàng"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              )}
            </tr>
          );
        })}
      </tbody>
    </table>
  );
};

