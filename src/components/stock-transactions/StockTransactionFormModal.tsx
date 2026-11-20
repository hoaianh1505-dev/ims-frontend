import React, { useState, useEffect, useMemo } from 'react';
import {
  X,
  Plus,
  Trash2,
  Loader2,
  ArrowDownLeft,
  ArrowUpRight,
  ArrowLeftRight,
  ClipboardCheck,
} from 'lucide-react';
import {
  StockTransactionType,
} from '../../types/stock-transaction.types';
import { Warehouse, WarehouseLocation } from '../../types/warehouse.types';
import { Supplier } from '../../types/supplier.types';
import { Customer } from '../../types/customer.types';
import { Product } from '../../types/product.types';
import {
  stockTransactionsService,
  WarehouseInventoryRecord,
} from '../../services/stock-transactions.service';
import { warehousesService } from '../../services/warehouses.service';
import { customersService } from '../../services/customers.service';
import { showToast } from '../../utils/toast.util';

interface StockTransactionFormModalProps {
  isOpen: boolean;
  initialType: StockTransactionType;
  initialSupplierId?: string;
  initialCustomerId?: string;
  warehouses: Warehouse[];
  suppliers: Supplier[];
  customers?: Customer[];
  products: Product[];
  isManagerOrAdmin: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface FormRowItem {
  key: string;
  product_id: string;
  location_id: string;
  target_location_id: string;
  quantity: number;
  counted_quantity: number;
  unit_price: number;
}

const createEmptyRow = (): FormRowItem => ({
  key: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
  product_id: '',
  location_id: '',
  target_location_id: '',
  quantity: 1,
  counted_quantity: 0,
  unit_price: 0,
});

const formatCurrency = (val: number) =>
  new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(val || 0);

export const StockTransactionFormModal: React.FC<StockTransactionFormModalProps> = ({
  isOpen,
  initialType,
  initialSupplierId,
  initialCustomerId,
  warehouses,
  suppliers,
  customers = [],
  products,
  isManagerOrAdmin,
  onClose,
  onSuccess,
}) => {
  const [txType, setTxType] = useState<StockTransactionType>(initialType);
  const [warehouseId, setWarehouseId] = useState('');
  const [targetWarehouseId, setTargetWarehouseId] = useState('');
  const [supplierId, setSupplierId] = useState('');
  const [customerId, setCustomerId] = useState(initialCustomerId || '');
  const [referenceNo, setReferenceNo] = useState('');
  const [note, setNote] = useState('');
  const [rows, setRows] = useState<FormRowItem[]>([createEmptyRow()]);
  const [submitting, setSubmitting] = useState(false);

  // Internal customer list fallback
  const [internalCustomers, setInternalCustomers] = useState<Customer[]>(customers);

  useEffect(() => {
    if (customers && customers.length > 0) {
      setInternalCustomers(customers);
    } else if (isOpen) {
      customersService
        .getAll({ limit: 100 })
        .then((res) => {
          setInternalCustomers(res.data || []);
        })
        .catch(() => {});
    }
  }, [customers, isOpen]);

  // Locations & inventory for selected warehouse
  const [sourceLocations, setSourceLocations] = useState<WarehouseLocation[]>([]);
  const [targetLocations, setTargetLocations] = useState<WarehouseLocation[]>([]);
  const [warehouseInventory, setWarehouseInventory] = useState<WarehouseInventoryRecord[]>([]);

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setTxType(initialType);
      const defaultWh = warehouses[0]?.id || '';
      setWarehouseId(defaultWh);
      setTargetWarehouseId(warehouses[1]?.id || '');
      setSupplierId(initialSupplierId || '');
      setCustomerId(initialCustomerId || '');
      setReferenceNo('');
      setNote('');
      setRows([createEmptyRow()]);
    }
  }, [isOpen, initialType, initialSupplierId, initialCustomerId, warehouses]);

  // Fetch source warehouse locations & inventory when warehouseId changes
  useEffect(() => {
    if (!isOpen || !warehouseId) {
      setSourceLocations([]);
      setWarehouseInventory([]);
      return;
    }

    let cancelled = false;
    const loadSourceData = async () => {
      try {
        const [locRes, invRes] = await Promise.all([
          warehousesService.getLocations(warehouseId).catch(() => []),
          stockTransactionsService.getWarehouseInventory(warehouseId).catch(() => []),
        ]);
        if (!cancelled) {
          const locs = Array.isArray((locRes as any)?.data)
            ? (locRes as any).data
            : Array.isArray(locRes)
            ? locRes
            : [];
          setSourceLocations(locs);
          setWarehouseInventory(invRes);
        }
      } catch {
        if (!cancelled) {
          setSourceLocations([]);
          setWarehouseInventory([]);
        }
      }
    };
    loadSourceData();
    return () => {
      cancelled = true;
    };
  }, [isOpen, warehouseId]);

  // Fetch target warehouse locations when targetWarehouseId changes (for TRANSFER)
  useEffect(() => {
    if (!isOpen || txType !== 'TRANSFER' || !targetWarehouseId) {
      setTargetLocations([]);
      return;
    }

    let cancelled = false;
    warehousesService
      .getLocations(targetWarehouseId)
      .then((res: any) => {
        if (!cancelled) {
          const locs = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
          setTargetLocations(locs);
        }
      })
      .catch(() => {
        if (!cancelled) setTargetLocations([]);
      });

    return () => {
      cancelled = true;
    };
  }, [isOpen, txType, targetWarehouseId]);

  // Helper to get current stock in selected warehouse (and location if chosen)
  const getCurrentStock = (productId: string, locationId?: string): number => {
    if (!productId) return 0;
    if (locationId) {
      const match = warehouseInventory.find(
        (r) => r.product_id === productId && r.location_id === locationId
      );
      return match ? match.quantity : 0;
    }
    return warehouseInventory
      .filter((r) => r.product_id === productId)
      .reduce((sum, r) => sum + r.quantity, 0);
  };

  const handleProductChange = (index: number, productId: string) => {
    const product = products.find((p) => p.id === productId);
    const currentStock = getCurrentStock(productId, rows[index]?.location_id);
    setRows((prev) =>
      prev.map((row, idx) => {
        if (idx !== index) return row;
        return {
          ...row,
          product_id: productId,
          unit_price:
            txType === 'EXPORT'
              ? Number(product?.selling_price || 0)
              : Number(product?.cost_price || 0),
          counted_quantity: currentStock,
        };
      })
    );
  };

  const handleRowChange = (index: number, field: keyof FormRowItem, value: any) => {
    setRows((prev) =>
      prev.map((row, idx) => {
        if (idx !== index) return row;
        const nextRow = { ...row, [field]: value };
        if (field === 'location_id' && nextRow.product_id && txType === 'ADJUSTMENT') {
          nextRow.counted_quantity = getCurrentStock(nextRow.product_id, value);
        }
        return nextRow;
      })
    );
  };

  const handleAddRow = () => {
    setRows((prev) => [...prev, createEmptyRow()]);
  };

  const handleRemoveRow = (index: number) => {
    if (rows.length <= 1) return;
    setRows((prev) => prev.filter((_, idx) => idx !== index));
  };

  const totalAmount = useMemo(() => {
    if (txType === 'TRANSFER' || txType === 'ADJUSTMENT') return 0;
    return rows.reduce(
      (sum, r) => sum + Number(r.quantity || 0) * Number(r.unit_price || 0),
      0
    );
  }, [rows, txType]);

  const totalQuantity = useMemo(() => {
    return rows.reduce(
      (sum, r) =>
        sum +
        (txType === 'ADJUSTMENT'
          ? Number(r.counted_quantity || 0)
          : Number(r.quantity || 0)),
      0
    );
  }, [rows, txType]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!warehouseId) {
      showToast.error('Vui lòng chọn kho vận hành');
      return;
    }

    if (txType === 'TRANSFER') {
      if (!targetWarehouseId) {
        showToast.error('Vui lòng chọn kho nhận hàng');
        return;
      }
      if (warehouseId === targetWarehouseId) {
        showToast.error('Kho xuất và kho nhận không được trùng nhau');
        return;
      }
    }

    const validRows = rows.filter((r) => r.product_id);
    if (validRows.length === 0) {
      showToast.error('Vui lòng chọn ít nhất 1 sản phẩm trong phiếu');
      return;
    }

    for (const r of validRows) {
      if (txType !== 'ADJUSTMENT' && (!r.quantity || r.quantity < 1)) {
        showToast.error('Số lượng sản phẩm phải lớn hơn hoặc bằng 1');
        return;
      }
      if (txType === 'ADJUSTMENT' && r.counted_quantity < 0) {
        showToast.error('Số lượng thực đếm không được nhỏ hơn 0');
        return;
      }
    }

    setSubmitting(true);
    try {
      const cleanRef = referenceNo.trim() || undefined;
      const cleanNote = note.trim() || undefined;

      if (txType === 'IMPORT') {
        await stockTransactionsService.createImport({
          warehouse_id: warehouseId,
          supplier_id: supplierId || undefined,
          reference_no: cleanRef,
          note: cleanNote,
          items: validRows.map((r) => ({
            product_id: r.product_id,
            location_id: r.location_id || undefined,
            quantity: Number(r.quantity),
            unit_price: Number(r.unit_price),
          })),
        });
        showToast.success('Đã tạo phiếu nhập kho và cộng tồn kho thành công');
      } else if (txType === 'EXPORT') {
        await stockTransactionsService.createExport({
          warehouse_id: warehouseId,
          customer_id: customerId || undefined,
          reference_no: cleanRef,
          note: cleanNote,
          items: validRows.map((r) => ({
            product_id: r.product_id,
            location_id: r.location_id || undefined,
            quantity: Number(r.quantity),
            unit_price: Number(r.unit_price),
          })),
        });
        showToast.success('Đã tạo phiếu xuất kho và trừ tồn kho thành công');
      } else if (txType === 'TRANSFER') {
        await stockTransactionsService.createTransfer({
          warehouse_id: warehouseId,
          target_warehouse_id: targetWarehouseId,
          reference_no: cleanRef,
          note: cleanNote,
          items: validRows.map((r) => ({
            product_id: r.product_id,
            location_id: r.location_id || undefined,
            target_location_id: r.target_location_id || undefined,
            quantity: Number(r.quantity),
          })),
        });
        showToast.success('Đã tạo phiếu điều chuyển kho thành công');
      } else if (txType === 'ADJUSTMENT') {
        await stockTransactionsService.createAdjustment({
          warehouse_id: warehouseId,
          reference_no: cleanRef,
          note: cleanNote,
          items: validRows.map((r) => ({
            product_id: r.product_id,
            location_id: r.location_id || undefined,
            counted_quantity: Number(r.counted_quantity),
          })),
        });
        showToast.success('Đã cân bằng tồn kho theo biên bản kiểm kê');
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        'Không thể tạo phiếu giao dịch kho. Vui lòng kiểm tra lại tồn kho.';
      showToast.error(Array.isArray(msg) ? msg[0] : msg);
    } finally {
      setSubmitting(false);
    }
  };

  const activeSuppliers = suppliers.filter((s) => s.is_active !== false);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-[2px] animate-in fade-in duration-150">
      <div className="fixed inset-0" onClick={() => !submitting && onClose()} />

      <div className="relative z-10 bg-white dark:bg-[#161b22] w-full max-w-5xl max-h-[92vh] rounded-2xl shadow-2xl border border-slate-200 dark:border-[#30363d] flex flex-col overflow-hidden animate-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="px-6 py-3.5 border-b border-slate-100 dark:border-[#30363d] flex items-center justify-between bg-slate-50/70 dark:bg-[#0d1117] shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200/80 dark:border-red-900/50 flex items-center justify-center text-[#EE3D43]">
              <ArrowLeftRight className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white leading-tight">
                Lập phiếu giao dịch kho
              </h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                Ghi nhận nhập, xuất, chuyển kho và cân bằng tồn kho tức thì
              </p>
            </div>
          </div>

          <button
            type="button"
            disabled={submitting}
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-white/10 rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Transaction Type Segmented Control */}
        <div className="px-6 py-2.5 bg-slate-50/40 dark:bg-[#0d1117]/60 border-b border-slate-100 dark:border-[#30363d] shrink-0">
          <div className="inline-flex p-1 bg-slate-200/60 dark:bg-[#0d1117] rounded-xl border border-slate-200/80 dark:border-[#30363d] gap-1 overflow-x-auto max-w-full">
            <button
              type="button"
              onClick={() => setTxType('IMPORT')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                txType === 'IMPORT'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-white/60 dark:hover:bg-white/5'
              }`}
            >
              <ArrowDownLeft className="w-3.5 h-3.5" />
              <span>Phiếu nhập kho</span>
            </button>

            <button
              type="button"
              onClick={() => setTxType('EXPORT')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                txType === 'EXPORT'
                  ? 'bg-[#EE3D43] text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-white/60 dark:hover:bg-white/5'
              }`}
            >
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>Phiếu xuất kho</span>
            </button>

            <button
              type="button"
              onClick={() => setTxType('TRANSFER')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                txType === 'TRANSFER'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-white/60 dark:hover:bg-white/5'
              }`}
            >
              <ArrowLeftRight className="w-3.5 h-3.5" />
              <span>Chuyển kho nội bộ</span>
            </button>

            {isManagerOrAdmin && (
              <button
                type="button"
                onClick={() => setTxType('ADJUSTMENT')}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  txType === 'ADJUSTMENT'
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-white/60 dark:hover:bg-white/5'
                }`}
              >
                <ClipboardCheck className="w-3.5 h-3.5" />
                <span>Điều chỉnh kiểm kê</span>
              </button>
            )}
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 min-h-0 flex flex-col overflow-hidden">
          {/* General Voucher Metadata */}
          <div className="px-6 py-4 space-y-3 bg-slate-50/30 dark:bg-[#161b22]/50 border-b border-slate-100 dark:border-[#30363d] shrink-0">
            {/* Row 1: 3 columns */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              {/* Col 1 */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                  {txType === 'IMPORT'
                    ? 'Kho nhập hàng'
                    : txType === 'TRANSFER'
                    ? 'Kho xuất đi'
                    : txType === 'EXPORT'
                    ? 'Kho xuất hàng'
                    : 'Kho kiểm kê'}{' '}
                  <span className="text-rose-500">*</span>
                </label>
                <select
                  value={warehouseId}
                  onChange={(e) => setWarehouseId(e.target.value)}
                  required
                  className="w-full h-9 px-3 border border-slate-200 dark:border-[#30363d] rounded-lg text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-[#EE3D43] focus:border-[#EE3D43] bg-white dark:bg-[#0d1117] shadow-2xs"
                >
                  <option value="">-- Chọn kho hàng --</option>
                  {warehouses.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.name} ({w.code})
                    </option>
                  ))}
                </select>
              </div>

              {/* Col 2 */}
              <div>
                {txType === 'IMPORT' ? (
                  <>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                      Nhà cung cấp đối tác
                    </label>
                    <select
                      value={supplierId}
                      onChange={(e) => setSupplierId(e.target.value)}
                      className="w-full h-9 px-3 border border-slate-200 dark:border-[#30363d] rounded-lg text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-[#EE3D43] focus:border-[#EE3D43] bg-white dark:bg-[#0d1117] shadow-2xs"
                    >
                      <option value="">-- Không chọn / Nhập lẻ --</option>
                      {activeSuppliers.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name} {s.code ? `(${s.code})` : ''}
                        </option>
                      ))}
                    </select>
                  </>
                ) : txType === 'EXPORT' ? (
                  <>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                      Khách hàng / Đại lý nhận
                    </label>
                    <select
                      value={customerId}
                      onChange={(e) => setCustomerId(e.target.value)}
                      className="w-full h-9 px-3 border border-slate-200 dark:border-[#30363d] rounded-lg text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-[#EE3D43] focus:border-[#EE3D43] bg-white dark:bg-[#0d1117] shadow-2xs"
                    >
                      <option value="">-- Khách vãng lai / Bán lẻ trực tiếp --</option>
                      {internalCustomers
                        .filter((c) => c.is_active !== false)
                        .map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name} {c.code ? `(${c.code})` : ''} {c.phone ? `- ${c.phone}` : ''}
                          </option>
                        ))}
                    </select>
                  </>
                ) : txType === 'TRANSFER' ? (
                  <>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                      Kho tiếp nhận <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={targetWarehouseId}
                      onChange={(e) => setTargetWarehouseId(e.target.value)}
                      required
                      className="w-full h-9 px-3 border border-slate-200 dark:border-[#30363d] rounded-lg text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-[#EE3D43] focus:border-[#EE3D43] bg-white dark:bg-[#0d1117] shadow-2xs"
                    >
                      <option value="">-- Chọn kho đích --</option>
                      {warehouses
                        .filter((w) => w.id !== warehouseId)
                        .map((w) => (
                          <option key={w.id} value={w.id}>
                            {w.name} ({w.code})
                          </option>
                        ))}
                    </select>
                  </>
                ) : (
                  <>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                      Mục đích kiểm kê
                    </label>
                    <input
                      type="text"
                      readOnly
                      value="Kiểm kê định kỳ & Cân bằng tồn kho"
                      className="w-full h-9 px-3 border border-slate-200 dark:border-[#30363d] rounded-lg text-xs text-slate-500 dark:text-slate-400 bg-slate-100/60 dark:bg-[#0d1117]/80 cursor-default font-medium shadow-2xs"
                    />
                  </>
                )}
              </div>

              {/* Col 3 */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                  Mã chứng từ (Tùy chọn)
                </label>
                <input
                  type="text"
                  value={referenceNo}
                  onChange={(e) => setReferenceNo(e.target.value)}
                  placeholder="Để trống tự sinh mã..."
                  className="w-full h-9 px-3 border border-slate-200 dark:border-[#30363d] rounded-lg text-xs font-mono text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-[#EE3D43] focus:border-[#EE3D43] bg-white dark:bg-[#0d1117] shadow-2xs"
                />
              </div>
            </div>

            {/* Row 2: Note */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                Ghi chú chứng từ / Diễn giải
              </label>
              <input
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Ví dụ: Xuất hàng đại lý, số hóa đơn VAT, đơn hàng #SO-009..."
                className="w-full h-9 px-3 border border-slate-200 dark:border-[#30363d] rounded-lg text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-[#EE3D43] focus:border-[#EE3D43] bg-white dark:bg-[#0d1117] shadow-2xs"
              />
            </div>
          </div>

          {/* Line Items Section */}
          <div className="px-6 py-3.5 flex-1 min-h-0 flex flex-col gap-2.5 overflow-hidden">
            <div className="flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                  Chi tiết danh mục sản phẩm
                </span>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 dark:bg-[#21262d] text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-[#30363d]">
                  {rows.length} dòng
                </span>
              </div>
              <button
                type="button"
                onClick={handleAddRow}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 text-white rounded-lg text-xs font-bold transition-all shadow-2xs cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>Thêm dòng sản phẩm</span>
              </button>
            </div>

            {/* Table Container */}
            <div className="flex-1 min-h-[160px] max-h-[320px] border border-slate-200 dark:border-[#30363d] rounded-xl overflow-auto bg-white dark:bg-[#161b22] shadow-2xs">
              <table className="w-full text-left border-collapse text-xs">
                <thead className="sticky top-0 z-10 bg-slate-100/90 dark:bg-[#0d1117] shadow-[0_1px_0_0_rgba(226,232,240,1)] dark:shadow-[0_1px_0_0_rgba(48,54,61,1)] backdrop-blur-[1px]">
                  <tr className="border-b border-slate-200 dark:border-[#30363d] text-slate-600 dark:text-slate-400 font-bold uppercase text-[11px] tracking-wider">
                    <th className="py-2.5 px-3 w-10 text-center">#</th>
                    <th className="py-2.5 px-3 min-w-[220px]">Sản phẩm</th>
                    <th className="py-2.5 px-3 w-36">
                      {txType === 'TRANSFER' ? 'Vị trí kệ xuất' : 'Vị trí kệ'}
                    </th>
                    {txType === 'TRANSFER' && (
                      <th className="py-2.5 px-3 w-36">Vị trí kệ nhận</th>
                    )}
                    <th className="py-2.5 px-3 w-24 text-center">Tồn kho</th>
                    <th className="py-2.5 px-3 w-28 text-right">
                      {txType === 'ADJUSTMENT' ? 'SL thực đếm' : 'Số lượng'}
                    </th>
                    {(txType === 'IMPORT' || txType === 'EXPORT') && (
                      <>
                        <th className="py-2.5 px-3 w-32 text-right">Đơn giá (VNĐ)</th>
                        <th className="py-2.5 px-3 w-32 text-right">Thành tiền</th>
                      </>
                    )}
                    {txType === 'ADJUSTMENT' && (
                      <th className="py-2.5 px-3 w-28 text-right">Chênh lệch</th>
                    )}
                    <th className="py-2.5 px-3 w-10 text-center" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-[#30363d]/60">
                  {rows.map((row, index) => {
                    const currentStock = getCurrentStock(row.product_id, row.location_id);
                    const diff = Number(row.counted_quantity || 0) - currentStock;

                    return (
                      <tr key={row.key} className="hover:bg-slate-50/60 dark:hover:bg-white/[0.02] transition-colors">
                        <td className="py-2 px-3 text-center font-mono text-xs text-slate-400">
                          {index + 1}
                        </td>

                        {/* Product Select */}
                        <td className="py-2 px-3">
                          <select
                            value={row.product_id}
                            onChange={(e) => handleProductChange(index, e.target.value)}
                            required
                            className="w-full h-8 px-2.5 border border-slate-200 dark:border-[#30363d] rounded-lg text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:border-[#EE3D43] bg-white dark:bg-[#0d1117]"
                          >
                            <option value="">-- Chọn sản phẩm --</option>
                            {products.map((p) => (
                              <option key={p.id} value={p.id}>
                                [{p.sku}] {p.name}
                              </option>
                            ))}
                          </select>
                        </td>

                        {/* Source Location */}
                        <td className="py-2 px-3">
                          <select
                            value={row.location_id}
                            onChange={(e) =>
                              handleRowChange(index, 'location_id', e.target.value)
                            }
                            className="w-full h-8 px-2 border border-slate-200 dark:border-[#30363d] rounded-lg text-xs text-slate-700 dark:text-slate-300 focus:outline-none focus:border-[#EE3D43] bg-white dark:bg-[#0d1117]"
                          >
                            <option value="">Mặc định</option>
                            {sourceLocations.map((loc) => (
                              <option key={loc.id} value={loc.id}>
                                {loc.code} - {loc.name}
                              </option>
                            ))}
                          </select>
                        </td>

                        {/* Target Location (TRANSFER only) */}
                        {txType === 'TRANSFER' && (
                          <td className="py-2 px-3">
                            <select
                              value={row.target_location_id}
                              onChange={(e) =>
                                handleRowChange(index, 'target_location_id', e.target.value)
                              }
                              className="w-full h-8 px-2 border border-slate-200 dark:border-[#30363d] rounded-lg text-xs text-slate-700 dark:text-slate-300 focus:outline-none focus:border-[#EE3D43] bg-white dark:bg-[#0d1117]"
                            >
                              <option value="">Mặc định</option>
                              {targetLocations.map((loc) => (
                                <option key={loc.id} value={loc.id}>
                                  {loc.code} - {loc.name}
                                </option>
                              ))}
                            </select>
                          </td>
                        )}

                        {/* Current Stock */}
                        <td className="py-2 px-3 text-center font-mono text-xs">
                          {row.product_id ? (
                            <span
                              className={`px-2 py-0.5 rounded font-bold text-xs ${
                                currentStock > 0
                                  ? 'bg-slate-100 dark:bg-[#21262d] text-slate-800 dark:text-slate-200'
                                  : 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400'
                              }`}
                            >
                              {currentStock}
                            </span>
                          ) : (
                            <span className="text-slate-300 dark:text-slate-600">-</span>
                          )}
                        </td>

                        {/* Quantity */}
                        <td className="py-2 px-3 text-right">
                          {txType === 'ADJUSTMENT' ? (
                            <input
                              type="number"
                              min={0}
                              value={row.counted_quantity}
                              onChange={(e) =>
                                handleRowChange(
                                  index,
                                  'counted_quantity',
                                  Math.max(0, parseInt(e.target.value || '0', 10))
                                )
                              }
                              className="w-20 h-8 px-2 border border-slate-200 dark:border-[#30363d] rounded-lg text-right font-mono font-bold text-slate-900 dark:text-white text-xs focus:outline-none focus:border-[#EE3D43] bg-white dark:bg-[#0d1117]"
                            />
                          ) : (
                            <input
                              type="number"
                              min={1}
                              value={row.quantity}
                              onChange={(e) =>
                                handleRowChange(
                                  index,
                                  'quantity',
                                  Math.max(1, parseInt(e.target.value || '1', 10))
                                )
                              }
                              className="w-20 h-8 px-2 border border-slate-200 dark:border-[#30363d] rounded-lg text-right font-mono font-bold text-slate-900 dark:text-white text-xs focus:outline-none focus:border-[#EE3D43] bg-white dark:bg-[#0d1117]"
                            />
                          )}
                        </td>

                        {/* Price & Amount (IMPORT / EXPORT) */}
                        {(txType === 'IMPORT' || txType === 'EXPORT') && (
                          <>
                            <td className="py-2 px-3 text-right">
                              <input
                                type="number"
                                min={0}
                                step="1000"
                                value={row.unit_price}
                                onChange={(e) =>
                                  handleRowChange(
                                    index,
                                    'unit_price',
                                    Math.max(0, parseFloat(e.target.value || '0'))
                                  )
                                }
                                className="w-28 h-8 px-2 border border-slate-200 dark:border-[#30363d] rounded-lg text-right font-mono text-slate-800 dark:text-slate-100 text-xs focus:outline-none focus:border-[#EE3D43] bg-white dark:bg-[#0d1117]"
                              />
                            </td>
                            <td className="py-2 px-3 text-right font-mono font-bold text-xs text-slate-900 dark:text-slate-100 whitespace-nowrap">
                              {formatCurrency(
                                Number(row.quantity || 0) * Number(row.unit_price || 0)
                              )}
                            </td>
                          </>
                        )}

                        {/* Discrepancy (ADJUSTMENT) */}
                        {txType === 'ADJUSTMENT' && (
                          <td className="py-2 px-3 text-right font-mono font-bold text-xs">
                            {row.product_id ? (
                              <span
                                className={
                                  diff > 0
                                    ? 'text-emerald-600 dark:text-emerald-400'
                                    : diff < 0
                                    ? 'text-rose-600 dark:text-rose-400'
                                    : 'text-slate-400'
                                }
                              >
                                {diff > 0 ? `+${diff}` : diff}
                              </span>
                            ) : (
                              '-'
                            )}
                          </td>
                        )}

                        {/* Delete button */}
                        <td className="py-2 px-2 text-center">
                          <button
                            type="button"
                            disabled={rows.length <= 1}
                            onClick={() => handleRemoveRow(index)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 disabled:opacity-30 rounded-lg transition-colors cursor-pointer"
                            title="Xóa dòng"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Total Summary Bar */}
            <div className="h-11 shrink-0 flex items-center justify-between px-4 bg-slate-50 dark:bg-[#0d1117] rounded-xl border border-slate-200/90 dark:border-[#30363d] text-xs">
              <div className="flex items-center gap-4 text-slate-500 dark:text-slate-400">
                <div className="flex items-center gap-1.5">
                  <span>Mặt hàng:</span>
                  <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                    {rows.length} SKU
                  </span>
                </div>
                <span className="text-slate-300 dark:text-slate-700">|</span>
                <div className="flex items-center gap-1.5">
                  <span>Tổng số lượng:</span>
                  <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                    {totalQuantity} SP
                  </span>
                </div>
              </div>

              {txType === 'IMPORT' || txType === 'EXPORT' ? (
                <div className="flex items-center gap-2">
                  <span className="font-bold uppercase text-slate-500 dark:text-slate-400 text-[11px]">
                    Tổng giá trị chứng từ:
                  </span>
                  <span className="text-base font-black font-mono text-[#EE3D43]">
                    {formatCurrency(totalAmount)}
                  </span>
                </div>
              ) : txType === 'TRANSFER' ? (
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">Hình thức:</span>
                  <span className="text-blue-600 dark:text-blue-400 font-bold">
                    Điều chuyển hàng nội bộ
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">Hình thức:</span>
                  <span className="text-amber-600 dark:text-amber-400 font-bold">
                    Biên bản cân bằng kiểm kê
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Modal Footer */}
          <div className="px-6 py-3.5 border-t border-slate-100 dark:border-[#30363d] flex items-center justify-between bg-slate-50/70 dark:bg-[#0d1117] shrink-0">
            <span className="text-[11px] text-slate-400 dark:text-slate-500 hidden sm:inline">
              Nhấn Hủy bỏ hoặc bấm ra ngoài để đóng hộp thoại
            </span>

            <div className="flex items-center gap-2.5 ml-auto">
              <button
                type="button"
                disabled={submitting}
                onClick={onClose}
                className="px-4 py-2 border border-slate-200 dark:border-[#30363d] text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                Hủy bỏ
              </button>

              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center gap-2 px-5 py-2 bg-[#EE3D43] hover:bg-[#D9343A] disabled:opacity-60 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
              >
                {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                <span>
                  {txType === 'IMPORT'
                    ? 'Lưu & Nhập kho'
                    : txType === 'EXPORT'
                    ? 'Lưu & Xuất kho'
                    : txType === 'TRANSFER'
                    ? 'Lưu & Chuyển kho'
                    : 'Xác nhận điều chỉnh'}
                </span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

