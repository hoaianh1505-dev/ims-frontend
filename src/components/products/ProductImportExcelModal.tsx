import React, { useState, useRef } from 'react';
import {
  X,
  Upload,
  FileSpreadsheet,
  Download,
  Loader2,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { productsService, ProductImportResult } from '../../services/products.service';
import { showToast } from '../../utils/toast.util';

interface ProductImportExcelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const ProductImportExcelModal: React.FC<ProductImportExcelModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [downloading, setDownloading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<ProductImportResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleClose = () => {
    setSelectedFile(null);
    setResult(null);
    onClose();
  };

  const handleDownloadTemplate = async () => {
    setDownloading(true);
    try {
      await productsService.downloadImportTemplate();
      showToast.success('Đã tải file mẫu Mau_Import_San_Pham.xlsx');
    } catch {
      showToast.error('Không thể tải file Excel mẫu');
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
    setResult(null);
  };

  const handleImport = async () => {
    if (!selectedFile) {
      showToast.error('Vui lòng chọn file Excel (.xlsx) trước khi nhập');
      return;
    }
    setUploading(true);
    try {
      const res = await productsService.importProductsExcel(selectedFile);
      setResult(res);
      if (res.imported_count > 0) {
        showToast.success(`Đã nhập thành công ${res.imported_count} sản phẩm từ Excel`);
        onSuccess();
      } else {
        showToast.error('Không có sản phẩm nào được nhập. Vui lòng kiểm tra lỗi bên dưới.');
      }
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Lỗi khi nhập sản phẩm từ file Excel';
      showToast.error(Array.isArray(msg) ? msg.join(', ') : msg);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-xl w-full border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-[#294238]" />
            <h3 className="text-sm font-bold text-slate-900">Import sản phẩm hàng loạt từ Excel</h3>
          </div>
          <button
            onClick={handleClose}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4 text-xs">
          {/* Step 1: Download template */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3">
            <div>
              <div className="font-bold text-slate-800">Bước 1: Tải file Excel mẫu</div>
              <div className="text-slate-500 mt-0.5">
                Điền đúng thứ tự cột: Tên SP, SKU, Barcode, Danh mục, Đơn vị, NCC, Giá vốn, Giá bán...
              </div>
            </div>
            <button
              type="button"
              onClick={handleDownloadTemplate}
              disabled={downloading}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg font-semibold text-slate-700 shrink-0 cursor-pointer disabled:opacity-50"
            >
              {downloading ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Download className="w-3.5 h-3.5 text-[#294238]" />
              )}
              <span>Tải file mẫu</span>
            </button>
          </div>

          {/* Step 2: Upload file */}
          <div>
            <div className="font-bold text-slate-800 mb-1.5">Bước 2: Chọn tệp Excel (.xlsx)</div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
              onChange={handleFileChange}
              className="hidden"
            />
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-300 hover:border-[#294238] rounded-xl p-6 text-center cursor-pointer transition-colors bg-slate-50/50 hover:bg-emerald-50/20"
            >
              <Upload className="w-7 h-7 mx-auto text-slate-400 mb-2" />
              {selectedFile ? (
                <div>
                  <div className="font-bold text-slate-900">{selectedFile.name}</div>
                  <div className="text-slate-500 mt-0.5">
                    {(selectedFile.size / 1024).toFixed(1)} KB · Bấm để chọn tệp khác
                  </div>
                </div>
              ) : (
                <div>
                  <div className="font-semibold text-slate-700">
                    Bấm để chọn tệp Excel (.xlsx) từ máy tính
                  </div>
                  <div className="text-slate-400 mt-0.5">
                    Danh mục, đơn vị tính hoặc nhà cung cấp chưa có sẽ được tự động tạo mới
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Result Summary */}
          {result && (
            <div className="space-y-2.5 pt-1">
              <div className="grid grid-cols-3 gap-2">
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-center">
                  <div className="text-slate-500">Tổng dòng</div>
                  <div className="text-base font-black text-slate-900 font-mono">
                    {result.total_rows}
                  </div>
                </div>
                <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-center">
                  <div className="text-emerald-700 flex items-center justify-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Thành công
                  </div>
                  <div className="text-base font-black text-emerald-700 font-mono">
                    {result.imported_count}
                  </div>
                </div>
                <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-center">
                  <div className="text-rose-700 flex items-center justify-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" /> Lỗi / Bỏ qua
                  </div>
                  <div className="text-base font-black text-rose-700 font-mono">
                    {result.failed_count}
                  </div>
                </div>
              </div>

              {result.errors?.length > 0 && (
                <div className="max-h-40 overflow-y-auto rounded-xl border border-rose-200 bg-rose-50/50 p-3 space-y-1.5">
                  <div className="font-bold text-rose-700">Chi tiết các dòng lỗi:</div>
                  {result.errors.map((err, idx) => (
                    <div key={idx} className="text-[11px] text-rose-700 flex gap-2">
                      <span className="font-mono font-bold shrink-0">Dòng {err.row}:</span>
                      <span>
                        {err.sku ? `[${err.sku}] ` : ''}
                        {err.message}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold cursor-pointer"
            >
              Đóng
            </button>
            <button
              type="button"
              disabled={!selectedFile || uploading}
              onClick={handleImport}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#294238] hover:bg-[#20372e] text-white rounded-xl font-semibold cursor-pointer disabled:opacity-50"
            >
              {uploading ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Upload className="w-3.5 h-3.5" />
              )}
              <span>{uploading ? 'Đang xử lý...' : 'Bắt đầu Import'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

