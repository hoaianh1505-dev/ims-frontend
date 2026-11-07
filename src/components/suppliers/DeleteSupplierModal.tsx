import React, { useState } from 'react';
import { AlertTriangle, Loader2 } from 'lucide-react';
import { Supplier } from '../../types/supplier.types';
import { suppliersService } from '../../services/suppliers.service';
import { showToast } from '../../utils/toast.util';

interface DeleteSupplierModalProps {
  supplier: Supplier | null;
  onClose: () => void;
  onSuccess: () => void;
}

export const DeleteSupplierModal: React.FC<DeleteSupplierModalProps> = ({
  supplier,
  onClose,
  onSuccess,
}) => {
  const [loading, setLoading] = useState(false);

  if (!supplier) return null;

  const handleDelete = async () => {
    setLoading(true);
    try {
      await suppliersService.delete(supplier.id);
      showToast.success(`Đã xóa nhà cung cấp "${supplier.name}"`);
      onSuccess();
      onClose();
    } catch (err: any) {
      const msg =
        err.response?.data?.message ||
        'Không thể xóa nhà cung cấp này (có thể do đang có phiếu nhập kho liên kết)';
      showToast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full border border-slate-200 shadow-2xl p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
        <div className="w-12 h-12 rounded-xl bg-rose-50 border border-rose-100 flex items-center justify-center mx-auto text-rose-600">
          <AlertTriangle className="w-6 h-6" />
        </div>

        <div className="text-center space-y-1.5">
          <h3 className="text-base font-bold text-slate-900">
            Xác nhận xóa nhà cung cấp
          </h3>
          <p className="text-sm text-slate-500">
            Bạn có chắc chắn muốn xóa đối tác{' '}
            <strong className="text-slate-800">"{supplier.name}"</strong>?
          </p>
          {supplier.code && (
            <p className="font-mono text-xs text-slate-400">Mã: {supplier.code}</p>
          )}
        </div>

        <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 font-medium">
          Dữ liệu đối tác sẽ được lưu trữ an toàn trong lịch sử chứng từ để phục vụ đối soát phiếu nhập kho cũ.
        </div>

        <div className="flex items-center justify-end gap-2.5 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
          >
            Hủy
          </button>
          <button
            type="button"
            disabled={loading}
            onClick={handleDelete}
            className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            <span>Xác nhận xóa</span>
          </button>
        </div>
      </div>
    </div>
  );
};
