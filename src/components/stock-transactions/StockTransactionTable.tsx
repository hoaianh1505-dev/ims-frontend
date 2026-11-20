import React from 'react';
import {
  ArrowLeftRight,
  Eye,
  Loader2,
  ArrowRight,
} from 'lucide-react';
import { StockTransaction, StockTransactionType } from '../../types/stock-transaction.types';
import { UserAvatar } from '../common/UserAvatar';

interface StockTransactionTableProps {
  transactions: StockTransaction[];
  loading: boolean;
  onRowClick: (tx: StockTransaction) => void;
}

const TYPE_CONFIG: Record<
  StockTransactionType,
  { label: string; badgeClass: string; qtyPrefix: string; qtyClass: string }
> = {
  IMPORT: {
    label: 'Nhập kho',
    badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    qtyPrefix: '+',
    qtyClass: 'text-emerald-700',
  },
  EXPORT: {
    label: 'Xuất kho',
    badgeClass: 'bg-rose-50 text-rose-700 border-rose-200',
    qtyPrefix: '-',
    qtyClass: 'text-rose-700',
  },
  TRANSFER: {
    label: 'Chuyển kho',
    badgeClass: 'bg-blue-50 text-blue-700 border-blue-200',
    qtyPrefix: '⇄ ',
    qtyClass: 'text-blue-700',
  },
  ADJUSTMENT: {
    label: 'Kiểm kê / Điều chỉnh',
    badgeClass: 'bg-amber-50 text-amber-700 border-amber-200',
    qtyPrefix: '',
    qtyClass: 'text-amber-700',
  },
};

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(value || 0);

const formatDateTime = (iso: string) => {
  const d = new Date(iso);
  return {
    date: d.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }),
    time: d.toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
    }),
  };
};

export const StockTransactionTable: React.FC<StockTransactionTableProps> = ({
  transactions,
  loading,
  onRowClick,
}) => {
  if (loading && transactions.length === 0) {
    return (
      <div className="py-24 flex flex-col items-center justify-center gap-3 text-slate-400 h-full">
        <Loader2 className="w-7 h-7 animate-spin text-slate-600" />
        <span className="text-sm font-medium">Đang tải danh sách phiếu kho...</span>
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <div className="py-20 text-center text-slate-400 space-y-3 h-full flex flex-col items-center justify-center">
        <ArrowLeftRight className="w-12 h-12 mx-auto text-slate-300 stroke-1" />
        <div className="text-base font-bold text-slate-800">Chưa có phiếu xuất / nhập kho nào</div>
        <p className="text-sm text-slate-500 max-w-sm mx-auto">
          Thử thay đổi bộ lọc tìm kiếm hoặc tạo phiếu nhập kho, xuất kho mới để bắt đầu ghi nhận giao dịch.
        </p>
      </div>
    );
  }

  return (
    <table className="w-full text-left border-collapse text-sm">
      <thead>
        <tr className="sticky top-0 bg-slate-50 z-10 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-xs select-none shadow-2xs">
          <th className="py-2.5 px-4 w-44">Mã phiếu / Thời gian</th>
          <th className="py-2.5 px-4 w-40">Phân loại</th>
          <th className="py-2.5 px-4 min-w-[220px]">Kho vận hành & Đối tác</th>
          <th className="py-2.5 px-4 min-w-[220px]">Mặt hàng giao dịch</th>
          <th className="py-2.5 px-4 w-32 text-right">Tổng SL</th>
          <th className="py-2.5 px-4 w-40 text-right">Tổng giá trị</th>
          <th className="py-2.5 px-4 w-44">Người lập phiếu</th>
          <th className="py-2.5 px-4 w-20 text-right whitespace-nowrap">Chi tiết</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-100 text-slate-700 animate-tab-enter">
        {transactions.map((tx) => {
          const cfg = TYPE_CONFIG[tx.type] || TYPE_CONFIG.IMPORT;
          const dt = formatDateTime(tx.created_at);
          const items = tx.items || [];
          const firstItem = items[0];
          const extraCount = Math.max(0, items.length - 1);

          const totalQty = items.reduce((sum, item) => sum + Number(item.quantity || 0), 0);
          const totalValue = items.reduce((sum, item) => sum + Number(item.total_price || 0), 0);

          return (
            <tr
              key={tx.id}
              onClick={() => onRowClick(tx)}
              className="hover:bg-slate-50/80 transition-colors group cursor-pointer"
            >
              {/* Reference No & Timestamp */}
              <td className="py-2.5 px-4 whitespace-nowrap">
                <div className="font-mono font-bold text-slate-800 group-hover:text-[#EE3D43] transition-colors text-xs">
                  {tx.reference_no || tx.id.slice(0, 8).toUpperCase()}
                </div>
                <div className="text-xs text-slate-400 mt-0.5">
                  {dt.date} • {dt.time}
                </div>
              </td>

              {/* Transaction Type Badge */}
              <td className="py-2.5 px-4 whitespace-nowrap">
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-semibold border ${cfg.badgeClass}`}
                >
                  {cfg.label}
                </span>
              </td>

              {/* Warehouse & Partner */}
              <td className="py-2.5 px-4">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="font-semibold text-slate-800 text-sm">
                    {tx.warehouse?.name || 'Kho mặc định'}
                  </span>
                  {tx.type === 'TRANSFER' && tx.target_warehouse && (
                    <>
                      <ArrowRight className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                      <span className="font-semibold text-blue-700 text-sm">
                        {tx.target_warehouse.name}
                      </span>
                    </>
                  )}
                </div>
                {tx.type === 'IMPORT' && tx.supplier ? (
                  <div className="text-xs text-slate-500 truncate mt-0.5">
                    NCC: <span className="font-medium text-slate-700">{tx.supplier.name}</span>
                  </div>
                ) : tx.type === 'EXPORT' && tx.customer ? (
                  <div className="text-xs text-slate-500 truncate mt-0.5">
                    KH: <span className="font-medium text-slate-700">{tx.customer.name}</span>
                  </div>
                ) : tx.note ? (
                  <div className="text-xs text-slate-400 truncate mt-0.5 max-w-[260px]" title={tx.note}>
                    {tx.note}
                  </div>
                ) : null}
              </td>

              {/* Items Summary */}
              <td className="py-2.5 px-4">
                {firstItem ? (
                  <div>
                    <div className="font-medium text-slate-800 text-sm line-clamp-1">
                      {firstItem.product?.name || 'Sản phẩm'}
                    </div>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      {firstItem.product?.sku && (
                        <span className="font-mono text-[11px] text-slate-500 bg-slate-100 px-1.5 py-0.2 rounded border border-slate-200/70">
                          {firstItem.product.sku}
                        </span>
                      )}
                      {extraCount > 0 && (
                        <span className="text-xs font-semibold text-slate-500">
                          +{extraCount} mặt hàng khác
                        </span>
                      )}
                    </div>
                  </div>
                ) : (
                  <span className="text-xs text-slate-400 italic">Không có chi tiết</span>
                )}
              </td>

              {/* Total Quantity */}
              <td className="py-2.5 px-4 text-right whitespace-nowrap">
                <span className={`font-mono font-bold text-sm ${cfg.qtyClass}`}>
                  {tx.type === 'ADJUSTMENT'
                    ? totalQty > 0
                      ? `+${totalQty}`
                      : `${totalQty}`
                    : `${cfg.qtyPrefix}${Math.abs(totalQty).toLocaleString('vi-VN')}`}
                </span>
                <div className="text-[11px] text-slate-400">
                  {items.length} dòng SP
                </div>
              </td>

              {/* Total Value */}
              <td className="py-2.5 px-4 text-right whitespace-nowrap">
                <span className="font-mono font-semibold text-slate-800 text-sm">
                  {formatCurrency(totalValue)}
                </span>
              </td>

              {/* Creator */}
              <td className="py-2.5 px-4 whitespace-nowrap">
                <div className="flex items-center gap-2">
                  <UserAvatar
                    src={tx.creator?.avatar}
                    alt={tx.creator?.display_name || tx.creator?.username}
                    size="sm"
                  />
                  <div className="min-w-0">
                    <div className="text-xs font-semibold text-slate-800 truncate max-w-[120px]">
                      {tx.creator?.display_name || tx.creator?.username || 'Hệ thống'}
                    </div>
                    {tx.creator?.username && (
                      <div className="text-[11px] text-slate-400 font-mono truncate">
                        @{tx.creator.username}
                      </div>
                    )}
                  </div>
                </div>
              </td>

              {/* View Detail Button */}
              <td
                className="py-2.5 px-4 text-right whitespace-nowrap"
                onClick={(e) => {
                  e.stopPropagation();
                  onRowClick(tx);
                }}
              >
                <button
                  className="p-1.5 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                  title="Xem chi tiết phiếu kho"
                >
                  <Eye className="w-4 h-4" />
                </button>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
};

