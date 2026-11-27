import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Upload,
  FileSpreadsheet,
  Download,
  Loader2,
  AlertTriangle,
} from 'lucide-react';
import { Warehouse } from '../../types/warehouse.types';
import { Supplier } from '../../types/supplier.types';
import { stockTransactionsService } from '../../services/stock-transactions.service';
import { showToast } from '../../utils/toast.util';

interface StockImportExcelModalProps {
  isOpen: boolean;
  warehouses: Warehouse[];
  suppliers: Supplier[];
  onClose: () => void;
  onSuccess: () => void;
}

export const StockImportExcelModal: React.FC<StockImportExcelModalProps> = ({
  isOpen,
  warehouses,
  suppliers,
  onClose,
  onSuccess,
}) => {
  const [warehouseId, setWarehouseId] = useState('');
  const [supplierId, setSupplierId] = useState('');
  const [referenceNo, setReferenceNo] = useState('');
  const [note, setNote] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [downloading, setDownloading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [rowErrors, setRowErrors] = useState<Array<{ row: number; sku?: string; message: string }>>(
    []
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && warehouses.length > 0 && !warehouseId) {
      setWarehouseId(warehouses[0].id);
    }
  }, [isOpen, warehouses, warehouseId]);

  if (!isOpen) return null;

  const handleClose = () => {
    setSelectedFile(null);
    setRowErrors([]);
    setReferenceNo('');
    setNote('');
    onClose();
  };

  const handleDownloadTemplate = async () => {
    setDownloading(true);
    try {
      await stockTransactionsService.downloadImportTemplate();
      showToast.success('Đã tải file mẫu Mau_Import_Nhap_Kho.xlsx');
    } catch {
      showToast.error('Không thể tải file Excel mẫu nhập kho');
    } finally {
      setDownloading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.name.toLowerCase().endsWith('.xlsx')) {
      showToast.error('Vui lòng chọn tệp định dạng Excel (.xlsx)');
      return;
    }
    setSelectedFile(file);
    setRowErrors([]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!warehouseId) {
      showToast.error('Vui lòng chọn kho nhận hàng');
      return;
    }
    if (!selectedFile) {
      showToast.error('Vui lòng chọn file Excel (.xlsx)');
      return;
    }

    setUploading(true);
    setRowErrors([]);
    try {
      const tx = await stockTransactionsService.importStockExcel({
        file: selectedFile,
        warehouse_id: warehouseId,
        supplier_id: supplierId || undefined,
        reference_no: referenceNo.trim() || undefined,
        note: note.trim() || undefined,
      });
      showToast.success(
        `Đã tạo phiếu nhập kho ${tx?.reference_no || ''} từ file Excel thành công`
      );
      onSuccess();
      handleClose();
    } catch (err: any) {
      const data = err?.response?.data;
      if (Array.isArray(data?.errors) && data.errors.length > 0) {
        setRowErrors(data.errors);
      }
      const msg = data?.message || 'Không thể nhập kho từ file Excel';
      showToast.error(Array.isArray(msg) ? msg.join(', ') : msg);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-[#161b22] rounded-2xl max-w-xl w-full border border-slate-200 dark:border-[#30363d] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-[#30363d] flex items-center justify-between bg-slate-50/70 dark:bg-[#0d1117]">
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Nhập kho hàng loạt từ Excel
            </h3>
          </div>
          <button
            onClick={handleClose}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {/* Template download */}
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#0d1117] border border-slate-200 dark:border-[#30363d] flex items-center justify-between gap-3">
            <div>
              <div className="font-bold text-slate-800 dark:text-slate-100">
                Bước 1: Tải file mẫu nhập kho
              </div>
              <div className="text-slate-500 dark:text-slate-400 mt-0.5">
                Cột bắt buộc: Mã SKU (*), Số lượng nhập (*). Tùy chọn: Vị trí kệ, Đơn giá nhập.
              </div>
            </div>
            <button
              type="button"
              onClick={handleDownloadTemplate}
              disabled={downloading}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-white dark:bg-[#161b22] hover:bg-slate-100 border border-slate-300 dark:border-[#30363d] rounded-lg font-semibold text-slate-700 dark:text-slate-200 shrink-0 cursor-pointer disabled:opacity-50"
            >
              {downloading ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Download className="w-3.5 h-3.5 text-emerald-600" />
              )}
              <span>Tải file mẫu</span>
            </button>
          </div>

          {/* Warehouse & Supplier */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Kho nhận hàng <span className="text-rose-500">*</span>
              </label>
              <select
                required
                value={warehouseId}
                onChange={(e) => setWarehouseId(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-[#0d1117] border border-slate-200 dark:border-[#30363d] rounded-xl text-xs font-medium text-slate-800 dark:text-slate-100 focus:outline-none"
              >
                <option value="">-- Chọn kho hàng --</option>
                {warehouses.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.name} ({w.code})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Nhà cung cấp (Tùy chọn)
              </label>
              <select
                value={supplierId}
                onChange={(e) => setSupplierId(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-[#0d1117] border border-slate-200 dark:border-[#30363d] rounded-xl text-xs font-medium text-slate-800 dark:text-slate-100 focus:outline-none"
              >
                <option value="">-- Không chọn --</option>
                {suppliers.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Mã phiếu (Tùy chọn)
              </label>
              <input
                type="text"
                value={referenceNo}
                onChange={(e) => setReferenceNo(e.target.value)}
                placeholder="Để trống để tự động sinh"
                className="w-full px-3 py-2 bg-slate-50 dark:bg-[#0d1117] border border-slate-200 dark:border-[#30363d] rounded-xl text-xs font-mono text-slate-800 dark:text-slate-100 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Ghi chú
              </label>
              <input
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="VD: Nhập lô hàng tháng 11 từ Excel"
                className="w-full px-3 py-2 bg-slate-50 dark:bg-[#0d1117] border border-slate-200 dark:border-[#30363d] rounded-xl text-xs text-slate-800 dark:text-slate-100 focus:outline-none"
              />
            </div>
          </div>

          {/* File upload */}
          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
              onChange={handleFileChange}
              className="hidden"
            />
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-300 dark:border-[#30363d] hover:border-emerald-500 rounded-xl p-5 text-center cursor-pointer transition-colors bg-slate-50/50 dark:bg-[#0d1117]"
            >
              <Upload className="w-6 h-6 mx-auto text-slate-400 mb-1.5" />
              {selectedFile ? (
                <div>
                  <div className="font-bold text-slate-900 dark:text-white">
                    {selectedFile.name}
                  </div>
                  <div className="text-slate-500 mt-0.5">
                    {(selectedFile.size / 1024).toFixed(1)} KB · Bấm để chọn tệp khác
                  </div>
                </div>
              ) : (
                <div className="font-semibold text-slate-700 dark:text-slate-300">
                  Bấm để chọn tệp Excel nhập kho (.xlsx)
                </div>
              )}
            </div>
          </div>

          {/* Row errors */}
          {rowErrors.length > 0 && (
            <div className="max-h-36 overflow-y-auto rounded-xl border border-rose-200 bg-rose-50/70 p-3 space-y-1">
              <div className="font-bold text-rose-700 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>File Excel có {rowErrors.length} dòng lỗi dữ liệu:</span>
              </div>
              {rowErrors.map((err, idx) => (
                <div key={idx} className="text-[11px] text-rose-700">
                  <strong className="font-mono">Dòng {err.row}:</strong>{' '}
                  {err.sku ? `[${err.sku}] ` : ''}
                  {err.message}
                </div>
              ))}
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-[#30363d]">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 bg-slate-100 dark:bg-white/10 hover:bg-slate-200 text-slate-700 dark:text-slate-200 rounded-xl font-semibold cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={!selectedFile || !warehouseId || uploading}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold cursor-pointer disabled:opacity-50"
            >
              {uploading ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Upload className="w-3.5 h-3.5" />
              )}
              <span>{uploading ? 'Đang nhập kho...' : 'Tạo phiếu nhập từ Excel'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

