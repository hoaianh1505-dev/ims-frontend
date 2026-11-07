import React, { useState, useEffect } from 'react';
import { X, Loader2 } from 'lucide-react';
import { Supplier, CreateSupplierPayload } from '../../types/supplier.types';
import { suppliersService } from '../../services/suppliers.service';
import { showToast } from '../../utils/toast.util';
import { ToggleSwitch } from '../users/ToggleSwitch';

interface SupplierFormModalProps {
  isOpen: boolean;
  supplier?: Supplier | null;
  onClose: () => void;
  onSuccess: () => void;
}

export const SupplierFormModal: React.FC<SupplierFormModalProps> = ({
  isOpen,
  supplier,
  onClose,
  onSuccess,
}) => {
  const isEdit = Boolean(supplier);

  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [contactName, setContactName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [isActive, setIsActive] = useState(true);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (supplier) {
      setName(supplier.name || '');
      setCode(supplier.code || '');
      setContactName(supplier.contact_name || '');
      setPhone(supplier.phone || '');
      setEmail(supplier.email || '');
      setAddress(supplier.address || '');
      setIsActive(supplier.is_active ?? true);
    } else {
      setName('');
      setCode('');
      setContactName('');
      setPhone('');
      setEmail('');
      setAddress('');
      setIsActive(true);
    }
    setError('');
  }, [supplier, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Vui lòng nhập tên nhà cung cấp');
      return;
    }

    setLoading(true);
    setError('');

    const payload: CreateSupplierPayload = {
      name: name.trim(),
      code: code.trim() || undefined,
      contact_name: contactName.trim() || undefined,
      phone: phone.trim() || undefined,
      email: email.trim() || undefined,
      address: address.trim() || undefined,
      is_active: isActive,
    };

    try {
      if (isEdit && supplier) {
        await suppliersService.update(supplier.id, payload);
        showToast.success('Cập nhật nhà cung cấp thành công');
      } else {
        await suppliersService.create(payload);
        showToast.success('Thêm nhà cung cấp mới thành công');
      }
      onSuccess();
      onClose();
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Có lỗi xảy ra khi lưu nhà cung cấp';
      setError(Array.isArray(msg) ? msg[0] : msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <h3 className="text-base font-bold text-slate-900">
            {isEdit ? `Cập nhật đối tác: ${supplier?.name}` : 'Thêm nhà cung cấp mới'}
          </h3>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs font-medium text-rose-700">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Supplier Name */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Tên nhà cung cấp <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="vd: Công ty TNHH Phân phối Synnex FPT"
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#EE3D43]/20 focus:bg-white transition-all"
              />
            </div>

            {/* Supplier Code */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Mã nhà cung cấp
              </label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase().trim())}
                placeholder="vd: SUP-FPT"
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 font-mono focus:outline-none focus:ring-2 focus:ring-[#EE3D43]/20 focus:bg-white transition-all"
              />
            </div>

            {/* Contact Person */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Người liên hệ đại diện
              </label>
              <input
                type="text"
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
                placeholder="vd: Nguyễn Văn Hùng"
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#EE3D43]/20 focus:bg-white transition-all"
              />
            </div>

            {/* Phone */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Số điện thoại
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="vd: 02473000911"
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#EE3D43]/20 focus:bg-white transition-all"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Email liên hệ
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="vd: contact@synnexfpt.com.vn"
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#EE3D43]/20 focus:bg-white transition-all"
              />
            </div>

            {/* Address */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Địa chỉ kho hàng / trụ sở
              </label>
              <textarea
                rows={2}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="vd: Tòa nhà FPT, Phố Duy Tân, Cầu Giấy, Hà Nội"
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#EE3D43]/20 focus:bg-white transition-all resize-none"
              />
            </div>
          </div>

          {/* Active Status Toggle */}
          <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-xl">
            <div>
              <span className="text-xs font-bold text-slate-800 block">Trạng thái hợp tác</span>
              <span className="text-[11px] text-slate-500">
                {isActive ? 'Đang hợp tác (Có thể nhập hàng)' : 'Tạm ngưng (Tạm khóa nhập kho)'}
              </span>
            </div>
            <ToggleSwitch checked={isActive} onChange={setIsActive} />
          </div>

          {/* Buttons */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 bg-[#EE3D43] hover:bg-[#D9343A] text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>{isEdit ? 'Lưu thay đổi' : 'Thêm nhà cung cấp'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
