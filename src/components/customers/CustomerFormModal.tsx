import React, { useState, useEffect } from 'react';
import { X, Loader2 } from 'lucide-react';
import { Customer, CustomerType } from '../../types/customer.types';
import { customersService } from '../../services/customers.service';
import { showToast } from '../../utils/toast.util';

interface CustomerFormModalProps {
  isOpen: boolean;
  customer?: Customer | null;
  onClose: () => void;
  onSuccess: () => void;
}

export const CustomerFormModal: React.FC<CustomerFormModalProps> = ({
  isOpen,
  customer,
  onClose,
  onSuccess,
}) => {
  const isEditing = Boolean(customer);

  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [type, setType] = useState<CustomerType>('RETAIL');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [taxId, setTaxId] = useState('');
  const [debtLimit, setDebtLimit] = useState<number>(0);
  const [isActive, setIsActive] = useState(true);
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (customer) {
      setName(customer.name || '');
      setCode(customer.code || '');
      setType(customer.type || 'RETAIL');
      setPhone(customer.phone || '');
      setEmail(customer.email || '');
      setAddress(customer.address || '');
      setTaxId(customer.tax_id || '');
      setDebtLimit(customer.debt_limit || 0);
      setIsActive(customer.is_active !== false);
      setNote(customer.note || '');
    } else {
      setName('');
      setCode('');
      setType('RETAIL');
      setPhone('');
      setEmail('');
      setAddress('');
      setTaxId('');
      setDebtLimit(0);
      setIsActive(true);
      setNote('');
    }
  }, [customer, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      showToast.error('Vui lòng nhập tên khách hàng / đại lý');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        name: name.trim(),
        code: code.trim() || undefined,
        type,
        phone: phone.trim() || undefined,
        email: email.trim() || undefined,
        address: address.trim() || undefined,
        tax_id: taxId.trim() || undefined,
        debt_limit: Number(debtLimit) || 0,
        is_active: isActive,
        note: note.trim() || undefined,
      };

      if (isEditing && customer) {
        await customersService.update(customer.id, payload);
        showToast.success(`Đã cập nhật khách hàng "${name.trim()}"`);
      } else {
        await customersService.create(payload);
        showToast.success(`Đã tạo mới khách hàng "${name.trim()}"`);
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        'Không thể lưu thông tin khách hàng. Vui lòng kiểm tra lại.';
      showToast.error(Array.isArray(msg) ? msg[0] : msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-[1px] animate-in fade-in duration-150">
      <div className="fixed inset-0" onClick={() => !submitting && onClose()} />

      <div className="relative z-10 bg-white w-full max-w-xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div>
            <h2 className="text-base font-black text-slate-900">
              {isEditing ? 'Cập nhật khách hàng / đại lý' : 'Thêm mới khách hàng / đối tác'}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Thông tin phục vụ ghi nhận công nợ và tạo phiếu xuất kho bán hàng
            </p>
          </div>

          <button
            type="button"
            disabled={submitting}
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Customer Name */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Tên khách hàng / Đại lý <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ví dụ: Công ty CP Máy tính Phong Vũ, Anh Hoàng..."
                className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400"
              />
            </div>

            {/* Customer Code */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Mã khách hàng (Tùy chọn)
              </label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Để trống tự sinh mã..."
                className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm font-mono text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400"
              />
            </div>

            {/* Customer Type */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Phân loại khách hàng
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as CustomerType)}
                className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400"
              >
                <option value="RETAIL">Khách lẻ</option>
                <option value="WHOLESALE">Khách sỉ</option>
                <option value="DISTRIBUTOR">Đại lý phân phối</option>
              </select>
            </div>

            {/* Phone */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Số điện thoại
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="0987xxxxxx"
                className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm font-mono text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Địa chỉ Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="customer@domain.com"
                className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400"
              />
            </div>

            {/* Tax ID */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Mã số thuế (Doanh nghiệp)
              </label>
              <input
                type="text"
                value={taxId}
                onChange={(e) => setTaxId(e.target.value)}
                placeholder="010xxxxxxx"
                className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm font-mono text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400"
              />
            </div>

            {/* Debt Limit */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Hạn mức nợ tối đa (VND)
              </label>
              <input
                type="number"
                min={0}
                step={500000}
                value={debtLimit}
                onChange={(e) => setDebtLimit(Math.max(0, parseFloat(e.target.value || '0')))}
                placeholder="0"
                className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm font-mono text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400"
              />
            </div>

            {/* Address */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Địa chỉ nhận hàng / Trụ sở
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Số nhà, đường, quận/huyện, tỉnh/thành..."
                className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400"
              />
            </div>

            {/* Note */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Ghi chú
              </label>
              <textarea
                rows={2}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Ghi chú thêm về điều khoản giao hàng, chiết khấu..."
                className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400"
              />
            </div>
          </div>

          {/* Active status */}
          <div className="pt-2 flex items-center gap-2">
            <input
              type="checkbox"
              id="is_active"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="w-4 h-4 rounded text-[#294238] focus:ring-[#294238] border-slate-300"
            />
            <label htmlFor="is_active" className="text-xs font-medium text-slate-700 cursor-pointer">
              Đang hợp tác giao dịch (cho phép chọn khi tạo phiếu xuất kho)
            </label>
          </div>

          {/* Footer */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              disabled={submitting}
              onClick={onClose}
              className="px-4 py-2 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl text-xs font-bold transition-colors cursor-pointer"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-2 px-5 py-2 bg-[#294238] hover:bg-[#20372e] disabled:opacity-60 text-white rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer"
            >
              {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
              <span>{isEditing ? 'Lưu thay đổi' : 'Tạo khách hàng'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

