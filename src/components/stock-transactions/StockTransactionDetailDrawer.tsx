import React from 'react';
import {
  X,
  Building2,
  Truck,
  Users,
  Calendar,
  FileText,
  Printer,
  ArrowRight,
  MapPin,
} from 'lucide-react';
import { StockTransaction, StockTransactionType } from '../../types/stock-transaction.types';
import { UserAvatar } from '../common/UserAvatar';

interface StockTransactionDetailDrawerProps {
  transaction: StockTransaction | null;
  onClose: () => void;
}

const TYPE_META: Record<
  StockTransactionType,
  { label: string; badgeClass: string; voucherTitle: string }
> = {
  IMPORT: {
    label: 'Phiếu nhập kho',
    badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    voucherTitle: 'PHIẾU NHẬP KHO HÀNG HÓA',
  },
  EXPORT: {
    label: 'Phiếu xuất kho',
    badgeClass: 'bg-rose-50 text-rose-700 border-rose-200',
    voucherTitle: 'PHIẾU XUẤT KHO HÀNG HÓA',
  },
  TRANSFER: {
    label: 'Phiếu chuyển kho',
    badgeClass: 'bg-blue-50 text-blue-700 border-blue-200',
    voucherTitle: 'PHIẾU ĐIỀU CHUYỂN KHO NỘI BỘ',
  },
  ADJUSTMENT: {
    label: 'Phiếu điều chỉnh kiểm kê',
    badgeClass: 'bg-amber-50 text-amber-700 border-amber-200',
    voucherTitle: 'BIÊN BẢN ĐIỀU CHỈNH TỒN KHO',
  },
};

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(value || 0);

export const StockTransactionDetailDrawer: React.FC<StockTransactionDetailDrawerProps> = ({
  transaction,
  onClose,
}) => {
  if (!transaction) return null;

  const meta = TYPE_META[transaction.type] || TYPE_META.IMPORT;
  const items = transaction.items || [];
  const totalQuantity = items.reduce((sum, item) => sum + Number(item.quantity || 0), 0);
  const totalAmount = items.reduce((sum, item) => sum + Number(item.total_price || 0), 0);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-[1px] animate-in fade-in duration-150">
      <div className="fixed inset-0" onClick={onClose} />

      <div className="relative z-10 w-full max-w-2xl bg-white h-full shadow-2xl border-l border-slate-200 flex flex-col justify-between animate-in slide-in-from-right duration-200">
        {/* Drawer Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-start justify-between gap-4 bg-slate-50/60">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-semibold border ${meta.badgeClass}`}
              >
                {meta.label}
              </span>
              <span className="font-mono text-sm font-black text-slate-900 bg-white px-2.5 py-0.5 rounded-md border border-slate-200 shadow-2xs">
                {transaction.reference_no || transaction.id.slice(0, 8).toUpperCase()}
              </span>
            </div>
            <div className="text-xs text-slate-500 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>
                Thời gian lập:{' '}
                <strong className="text-slate-700">
                  {new Date(transaction.created_at).toLocaleString('vi-VN', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </strong>
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drawer Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5 custom-scrollbar text-sm">
          {/* Warehouse & Partner Info Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {/* Warehouse Card */}
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 space-y-2">
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-slate-400" />
                {transaction.type === 'TRANSFER'
                  ? 'Lộ trình điều chuyển kho'
                  : transaction.type === 'IMPORT'
                  ? 'Kho tiếp nhận hàng'
                  : 'Kho vận hành'}
              </div>

              {transaction.type === 'TRANSFER' ? (
                <div className="space-y-1.5 pt-0.5">
                  <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
                    <span>{transaction.warehouse?.name || 'Kho xuất'}</span>
                    <ArrowRight className="w-4 h-4 text-blue-600 shrink-0" />
                    <span className="text-blue-700">
                      {transaction.target_warehouse?.name || 'Kho nhận'}
                    </span>
                  </div>
                  <div className="text-xs text-slate-500 font-mono">
                    {transaction.warehouse?.code || '---'} →{' '}
                    {transaction.target_warehouse?.code || '---'}
                  </div>
                </div>
              ) : (
                <div className="pt-0.5">
                  <div className="text-sm font-bold text-slate-900">
                    {transaction.warehouse?.name || 'Chưa xác định'}
                  </div>
                  {transaction.warehouse?.code && (
                    <span className="inline-block mt-1 font-mono text-xs text-slate-600 bg-white px-2 py-0.5 rounded border border-slate-200">
                      {transaction.warehouse.code}
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Creator or Supplier Card */}
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 space-y-2">
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Nhân sự thực hiện
              </div>
              <div className="flex items-center gap-2.5 pt-0.5">
                <UserAvatar
                  src={transaction.creator?.avatar}
                  alt={transaction.creator?.display_name || transaction.creator?.username}
                  size="md"
                />
                <div className="min-w-0">
                  <div className="font-bold text-slate-900 text-sm truncate">
                    {transaction.creator?.display_name ||
                      transaction.creator?.username ||
                      'Hệ thống'}
                  </div>
                  <div className="text-xs text-slate-500 font-mono truncate">
                    @{transaction.creator?.username || 'system'}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Supplier Block (if IMPORT) */}
          {transaction.type === 'IMPORT' && transaction.supplier && (
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 flex items-start justify-between gap-4">
              <div className="space-y-1">
                <div className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                  <Truck className="w-3.5 h-3.5 text-slate-400" />
                  Nhà cung cấp đối tác
                </div>
                <div className="font-bold text-slate-900 text-sm">
                  {transaction.supplier.name}
                </div>
                <div className="text-xs text-slate-600 flex items-center gap-3 flex-wrap">
                  {transaction.supplier.contact_name && (
                    <span>Đại diện: {transaction.supplier.contact_name}</span>
                  )}
                  {transaction.supplier.phone && (
                    <span className="font-mono">SĐT: {transaction.supplier.phone}</span>
                  )}
                </div>
              </div>
              {transaction.supplier.code && (
                <span className="font-mono text-xs font-semibold text-slate-600 bg-white px-2.5 py-1 rounded-lg border border-slate-200 shrink-0">
                  {transaction.supplier.code}
                </span>
              )}
            </div>
          )}

          {/* Customer Block (if EXPORT) */}
          {transaction.type === 'EXPORT' && transaction.customer && (
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 flex items-start justify-between gap-4">
              <div className="space-y-1">
                <div className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-slate-400" />
                  Khách hàng / Đại lý nhận hàng
                </div>
                <div className="font-bold text-slate-900 text-sm">
                  {transaction.customer.name}
                </div>
                <div className="text-xs text-slate-600 flex items-center gap-3 flex-wrap">
                  {transaction.customer.phone && (
                    <span className="font-mono">SĐT: {transaction.customer.phone}</span>
                  )}
                  {transaction.customer.email && (
                    <span>Email: {transaction.customer.email}</span>
                  )}
                  {transaction.customer.address && (
                    <span>Địa chỉ: {transaction.customer.address}</span>
                  )}
                </div>
              </div>
              {transaction.customer.code && (
                <span className="font-mono text-xs font-semibold text-slate-600 bg-white px-2.5 py-1 rounded-lg border border-slate-200 shrink-0">
                  {transaction.customer.code}
                </span>
              )}
            </div>
          )}

          {/* Note Block */}
          {transaction.note && (
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 space-y-1.5">
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-slate-400" />
                Ghi chú chứng từ
              </div>
              <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                {transaction.note}
              </p>
            </div>
          )}

          {/* Itemized Products List */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Danh mục hàng hóa trong phiếu ({items.length} dòng)
              </h3>
            </div>

            <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white">
              <table className="w-full text-left border-collapse text-xs sm:text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase text-[11px] tracking-wider">
                    <th className="py-2.5 px-3 w-10 text-center">#</th>
                    <th className="py-2.5 px-3">Sản phẩm</th>
                    <th className="py-2.5 px-3">Vị trí kệ</th>
                    <th className="py-2.5 px-3 text-right">
                      {transaction.type === 'ADJUSTMENT' ? 'Thực đếm / Lệch' : 'Số lượng'}
                    </th>
                    <th className="py-2.5 px-3 text-right">Đơn giá</th>
                    <th className="py-2.5 px-3 text-right">Thành tiền</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {items.map((item, idx) => (
                    <tr key={item.id || idx} className="hover:bg-slate-50/60">
                      <td className="py-2.5 px-3 text-center text-xs text-slate-400 font-mono">
                        {idx + 1}
                      </td>
                      <td className="py-2.5 px-3">
                        <div className="font-semibold text-slate-800 text-xs sm:text-sm">
                          {item.product?.name || 'Sản phẩm'}
                        </div>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          {item.product?.sku && (
                            <span className="font-mono text-[11px] text-slate-500 bg-slate-100 px-1.5 py-0.2 rounded">
                              {item.product.sku}
                            </span>
                          )}
                          {(item.product as any)?.unit?.name && (
                            <span className="text-[11px] text-slate-400">
                              ĐVT: {(item.product as any).unit.name}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-2.5 px-3 whitespace-nowrap text-xs">
                        {item.location ? (
                          <div className="inline-flex items-center gap-1 font-mono text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                            <MapPin className="w-3 h-3 text-slate-400" />
                            <span>{item.location.code}</span>
                            {transaction.type === 'TRANSFER' && item.target_location && (
                              <>
                                <span>→</span>
                                <span className="text-blue-700 font-bold">
                                  {item.target_location.code}
                                </span>
                              </>
                            )}
                          </div>
                        ) : (
                          <span className="text-slate-400 italic text-xs">Mặc định</span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold whitespace-nowrap">
                        {transaction.type === 'ADJUSTMENT' ? (
                          <div>
                            <div className="text-slate-900">
                              Đếm: {item.counted_quantity ?? 0}
                            </div>
                            <div
                              className={`text-xs ${
                                item.quantity > 0
                                  ? 'text-emerald-600'
                                  : item.quantity < 0
                                  ? 'text-rose-600'
                                  : 'text-slate-400'
                              }`}
                            >
                              ({item.quantity > 0 ? `+${item.quantity}` : item.quantity})
                            </div>
                          </div>
                        ) : (
                          <span className="text-slate-900">
                            {Number(item.quantity).toLocaleString('vi-VN')}
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono text-slate-600 whitespace-nowrap text-xs">
                        {formatCurrency(Number(item.unit_price || 0))}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-semibold text-slate-900 whitespace-nowrap text-xs sm:text-sm">
                        {formatCurrency(Number(item.total_price || 0))}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-slate-50/90 border-t border-slate-200 font-bold text-slate-900">
                    <td colSpan={3} className="py-3 px-3 text-right text-xs uppercase text-slate-500">
                      Tổng cộng phiếu:
                    </td>
                    <td className="py-3 px-3 text-right font-mono text-sm">
                      {transaction.type === 'ADJUSTMENT'
                        ? totalQuantity > 0
                          ? `+${totalQuantity}`
                          : totalQuantity
                        : totalQuantity.toLocaleString('vi-VN')}
                    </td>
                    <td className="py-3 px-3" />
                    <td className="py-3 px-3 text-right font-mono text-sm text-[#294238]">
                      {formatCurrency(totalAmount)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>

        {/* Drawer Footer */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/60 flex items-center justify-between gap-3 no-print">
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold transition-colors shadow-2xs cursor-pointer"
          >
            <Printer className="w-4 h-4 text-slate-500" />
            <span>In phiếu kho</span>
          </button>

          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
          >
            Đóng cửa sổ
          </button>
        </div>
      </div>

      {/* ========================================================
          PRINTABLE VOUCHER (Biểu mẫu chuẩn A4 khi in)
         ======================================================== */}
      <div className="hidden print:block fixed inset-0 bg-white p-8 z-[9999] text-black text-sm">
        <div className="flex justify-between items-start pb-4 border-b-2 border-black">
          <div>
            <h1 className="text-lg font-black uppercase tracking-wider">HỆ THỐNG QUẢN LÝ KHO TỔNG IMS</h1>
            <p className="text-xs">Đơn vị: Tổng kho vận hành IMS Logistics</p>
            <p className="text-xs">Kho: {transaction.warehouse?.name} - {transaction.warehouse?.address || 'Hà Nội'}</p>
          </div>
          <div className="text-right">
            <h2 className="text-base font-bold uppercase">{meta.voucherTitle}</h2>
            <p className="text-xs font-mono">Mã số: <strong>{transaction.reference_no}</strong></p>
            <p className="text-xs">Ngày lập: {new Date(transaction.created_at).toLocaleDateString('vi-VN')}</p>
          </div>
        </div>

        <div className="my-4 text-xs space-y-1">
          <p>Kho lưu trữ: <strong>{transaction.warehouse?.name} ({transaction.warehouse?.code})</strong></p>
          {transaction.type === 'TRANSFER' && (
            <p>Kho nhận điều chuyển: <strong>{transaction.target_warehouse?.name}</strong></p>
          )}
          {transaction.supplier && (
            <p>Nhà cung cấp: <strong>{transaction.supplier.name}</strong> - SĐT: {transaction.supplier.phone || 'N/A'}</p>
          )}
          {transaction.customer && (
            <p>Khách hàng: <strong>{transaction.customer.name}</strong> - SĐT: {transaction.customer.phone || 'N/A'}</p>
          )}
          <p>Người tạo phiếu: <strong>{transaction.creator?.display_name || transaction.creator?.username}</strong></p>
          {transaction.note && <p>Ghi chú: {transaction.note}</p>}
        </div>

        <table className="w-full border-collapse border border-black text-xs my-4">
          <thead>
            <tr className="bg-slate-100 border-b border-black">
              <th className="border border-black p-2 text-center w-12">STT</th>
              <th className="border border-black p-2 text-left w-32">Mã SKU</th>
              <th className="border border-black p-2 text-left">Tên sản phẩm</th>
              <th className="border border-black p-2 text-center w-20">ĐVT</th>
              <th className="border border-black p-2 text-right w-24">Số lượng</th>
              <th className="border border-black p-2 text-right w-28">Đơn giá</th>
              <th className="border border-black p-2 text-right w-32">Thành tiền</th>
            </tr>
          </thead>
          <tbody>
            {items.map((it, idx) => (
              <tr key={it.id || idx}>
                <td className="border border-black p-2 text-center">{idx + 1}</td>
                <td className="border border-black p-2 font-mono">{it.product?.sku}</td>
                <td className="border border-black p-2 font-medium">{it.product?.name}</td>
                <td className="border border-black p-2 text-center">{it.product?.unit?.name || 'Cái'}</td>
                <td className="border border-black p-2 text-right font-bold">{it.quantity}</td>
                <td className="border border-black p-2 text-right">{formatCurrency(Number(it.unit_price || 0))}</td>
                <td className="border border-black p-2 text-right font-bold">{formatCurrency(Number(it.total_price || 0))}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="font-bold border-t border-black bg-slate-50">
              <td colSpan={4} className="border border-black p-2 text-right">TỔNG CỘNG:</td>
              <td className="border border-black p-2 text-right">{totalQuantity.toLocaleString('vi-VN')}</td>
              <td className="border border-black p-2" />
              <td className="border border-black p-2 text-right">{formatCurrency(totalAmount)}</td>
            </tr>
          </tfoot>
        </table>

        <div className="grid grid-cols-4 gap-4 text-center text-xs mt-10 pt-4">
          <div>
            <p className="font-bold">Người lập phiếu</p>
            <p className="text-[10px] text-slate-500 italic mt-1">(Ký, họ tên)</p>
          </div>
          <div>
            <p className="font-bold">Người nhận / giao</p>
            <p className="text-[10px] text-slate-500 italic mt-1">(Ký, họ tên)</p>
          </div>
          <div>
            <p className="font-bold">Thủ kho</p>
            <p className="text-[10px] text-slate-500 italic mt-1">(Ký, họ tên)</p>
          </div>
          <div>
            <p className="font-bold">Giám đốc / Kế toán</p>
            <p className="text-[10px] text-slate-500 italic mt-1">(Ký, đóng dấu)</p>
          </div>
        </div>
      </div>
    </div>
  );
};

