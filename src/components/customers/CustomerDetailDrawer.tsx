import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  X,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Building2,
  Edit3,
  ArrowUpRight,
  Receipt,
  Loader2,
} from 'lucide-react';
import { Customer, CustomerType } from '../../types/customer.types';
import { customersService } from '../../services/customers.service';

interface CustomerDetailDrawerProps {
  customer: Customer | null;
  isManagerOrAdmin: boolean;
  onClose: () => void;
  onEdit: (customer: Customer) => void;
  onToggleStatus?: (customer: Customer) => void;
  onNewExportOrder?: (customer: Customer) => void;
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

export const CustomerDetailDrawer: React.FC<CustomerDetailDrawerProps> = ({
  customer,
  isManagerOrAdmin,
  onClose,
  onEdit,
  onToggleStatus,
  onNewExportOrder,
}) => {
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loadingTx, setLoadingTx] = useState(false);

  useEffect(() => {
    if (customer) {
      setLoadingTx(true);
      customersService
        .getTransactions(customer.id)
        .then((data) => setTransactions(data))
        .catch(() => setTransactions([]))
        .finally(() => setLoadingTx(false));
    } else {
      setTransactions([]);
    }
  }, [customer]);

  if (!customer) return null;

  const typeCfg = TYPE_CONFIG[customer.type] || TYPE_CONFIG.RETAIL;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-[1px] animate-in fade-in duration-150">
      <div className="fixed inset-0" onClick={onClose} />

      <div className="relative z-10 w-full max-w-lg bg-white h-full shadow-2xl border-l border-slate-200 flex flex-col justify-between animate-in slide-in-from-right duration-200">
        {/* Drawer Header */}
        <div className="p-6 border-b border-slate-100 flex items-start justify-between gap-4 bg-slate-50/60">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-semibold border ${typeCfg.badgeClass}`}
              >
                {typeCfg.label}
              </span>
              {isManagerOrAdmin && onToggleStatus ? (
                <button
                  type="button"
                  onClick={() => onToggleStatus(customer)}
                  title="Nhấn để đổi trạng thái hợp tác"
                  className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium cursor-pointer transition-colors ${
                    customer.is_active
                      ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-500 border border-slate-200'
                  }`}
                >
                  {customer.is_active ? 'Đang hợp tác' : 'Tạm ngưng'}
                </button>
              ) : (
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium ${
                    customer.is_active
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-slate-100 text-slate-500 border border-slate-200'
                  }`}
                >
                  {customer.is_active ? 'Đang hợp tác' : 'Tạm ngưng'}
                </span>
              )}
            </div>

            <h2 className="text-xl font-black text-slate-900 leading-snug">
              {customer.name}
            </h2>

            {customer.code && (
              <span className="font-mono text-xs font-semibold text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200 shadow-2xs inline-block">
                {customer.code}
              </span>
            )}
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drawer Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5 custom-scrollbar text-sm">
          {/* Quick Action Button */}
          <div className="grid grid-cols-2 gap-2.5">
            <button
              onClick={() => {
                if (onNewExportOrder) {
                  onNewExportOrder(customer);
                } else {
                  onClose();
                  navigate(`/stock-transactions?action=export&customer_id=${customer.id}`);
                }
              }}
              className="flex items-center justify-center gap-2 py-2.5 px-3 bg-[#EE3D43] hover:bg-[#D9343A] text-white rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer"
            >
              <ArrowUpRight className="w-4 h-4" />
              <span>Tạo phiếu xuất kho</span>
            </button>

            {isManagerOrAdmin && (
              <button
                onClick={() => onEdit(customer)}
                className="flex items-center justify-center gap-2 py-2.5 px-3 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold transition-all cursor-pointer"
              >
                <Edit3 className="w-4 h-4" />
                <span>Chỉnh sửa hồ sơ</span>
              </button>
            )}
          </div>

          {/* Debt Summary Card */}
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 space-y-2">
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center justify-between">
              <span>Công nợ khách hàng</span>
              <Receipt className="w-3.5 h-3.5 text-slate-400" />
            </div>

            <div className="flex items-baseline justify-between pt-1">
              <div>
                <div className="text-[11px] text-slate-400">Nợ hiện tại</div>
                <div className="text-lg font-black font-mono text-slate-900">
                  {formatCurrency(customer.current_debt)}
                </div>
              </div>
              <div className="text-right">
                <div className="text-[11px] text-slate-400">Hạn mức nợ cho phép</div>
                <div className="text-sm font-bold font-mono text-slate-600">
                  {formatCurrency(customer.debt_limit)}
                </div>
              </div>
            </div>
          </div>

          {/* Contact Details Card */}
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 space-y-3">
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Thông tin liên hệ & Pháp lý
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between py-1 border-b border-slate-200/50">
                <span className="text-slate-500 text-xs">Số điện thoại:</span>
                {customer.phone ? (
                  <a
                    href={`tel:${customer.phone}`}
                    className="font-mono font-bold text-slate-800 hover:text-[#EE3D43] flex items-center gap-1.5"
                  >
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span>{customer.phone}</span>
                  </a>
                ) : (
                  <span className="text-slate-400 italic text-xs">Chưa có</span>
                )}
              </div>

              <div className="flex items-center justify-between py-1 border-b border-slate-200/50">
                <span className="text-slate-500 text-xs">Email:</span>
                {customer.email ? (
                  <a
                    href={`mailto:${customer.email}`}
                    className="text-slate-800 hover:text-[#EE3D43] flex items-center gap-1.5 truncate max-w-[220px]"
                  >
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    <span className="truncate">{customer.email}</span>
                  </a>
                ) : (
                  <span className="text-slate-400 italic text-xs">Chưa có</span>
                )}
              </div>

              {customer.tax_id && (
                <div className="flex items-center justify-between py-1 border-b border-slate-200/50">
                  <span className="text-slate-500 text-xs">Mã số thuế:</span>
                  <span className="font-mono font-semibold text-slate-800">
                    {customer.tax_id}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Address Card */}
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 space-y-1.5">
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              Địa chỉ giao hàng / Trụ sở
            </div>
            <p className="text-sm text-slate-700 leading-relaxed">
              {customer.address || (
                <span className="text-slate-400 italic text-xs">Chưa cập nhật địa chỉ</span>
              )}
            </p>
          </div>

          {/* Note Card */}
          {customer.note && (
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 space-y-1.5">
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Ghi chú đối tác
              </div>
              <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                {customer.note}
              </p>
            </div>
          )}

          {/* Order history section */}
          <div className="space-y-2">
            <div className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Lịch sử các phiếu xuất kho ({transactions.length} phiếu)
            </div>

            {loadingTx ? (
              <div className="py-6 flex items-center justify-center gap-2 text-slate-400 text-xs">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Đang tải lịch sử mua hàng...</span>
              </div>
            ) : transactions.length === 0 ? (
              <div className="p-4 bg-slate-50 rounded-xl text-center text-xs text-slate-400">
                Chưa phát sinh phiếu xuất kho nào cho khách hàng này.
              </div>
            ) : (
              <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100">
                {transactions.slice(0, 5).map((tx) => (
                  <div
                    key={tx.id}
                    onClick={() => {
                      onClose();
                      navigate('/stock-transactions');
                    }}
                    className="p-3 hover:bg-slate-50/80 transition-colors flex items-center justify-between gap-3 cursor-pointer"
                  >
                    <div>
                      <div className="font-mono font-bold text-xs text-slate-800">
                        {tx.reference_no}
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        {new Date(tx.created_at).toLocaleDateString('vi-VN')} •{' '}
                        {tx.warehouse?.name || 'Kho'}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-mono font-bold text-rose-600">
                        -{tx.items?.reduce((s: number, i: any) => s + Number(i.quantity || 0), 0)}{' '}
                        SP
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* System metadata */}
          <div className="text-xs text-slate-400 space-y-1 pt-2 border-t border-slate-100">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              <span>
                Ngày tạo hồ sơ: {new Date(customer.created_at).toLocaleDateString('vi-VN')}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5" />
              <span>Mã ID: {customer.id}</span>
            </div>
          </div>
        </div>

        {/* Drawer Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/60 flex justify-end">
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
