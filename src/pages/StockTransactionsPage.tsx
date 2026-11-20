import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Search,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  ArrowDownLeft,
  ArrowUpRight,
  ArrowLeftRight,
  ClipboardCheck,
  FileDown,
} from 'lucide-react';
import {
  StockTransaction,
  StockTransactionType,
  FilterStockTransactionParams,
} from '../types/stock-transaction.types';
import { Warehouse } from '../types/warehouse.types';
import { Supplier } from '../types/supplier.types';
import { Customer } from '../types/customer.types';
import { Product } from '../types/product.types';
import { stockTransactionsService } from '../services/stock-transactions.service';
import { warehousesService } from '../services/warehouses.service';
import { suppliersService } from '../services/suppliers.service';
import { customersService } from '../services/customers.service';
import { productsService } from '../services/products.service';
import { useAuthStore } from '../stores/auth.store';
import { showToast } from '../utils/toast.util';
import { StockTransactionTable } from '../components/stock-transactions/StockTransactionTable';
import { StockTransactionFormModal } from '../components/stock-transactions/StockTransactionFormModal';
import { StockTransactionDetailDrawer } from '../components/stock-transactions/StockTransactionDetailDrawer';

export const StockTransactionsPage: React.FC = () => {
  const { user } = useAuthStore();
  const isManagerOrAdmin = user?.role === 'ADMIN' || user?.role === 'MANAGER';
  const [searchParams, setSearchParams] = useSearchParams();

  // Data state
  const [transactions, setTransactions] = useState<StockTransaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [exportingExcel, setExportingExcel] = useState(false);

  // Reference data for filters & form
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);

  // Filter state
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<'ALL' | StockTransactionType>('ALL');
  const [warehouseFilter, setWarehouseFilter] = useState('');

  // Pagination state
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);

  // Modal & Drawer state
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [formInitialType, setFormInitialType] = useState<StockTransactionType>('IMPORT');
  const [formInitialSupplierId, setFormInitialSupplierId] = useState<string | undefined>(undefined);
  const [formInitialCustomerId, setFormInitialCustomerId] = useState<string | undefined>(undefined);
  const [activeTransaction, setActiveTransaction] = useState<StockTransaction | null>(null);

  // Load reference lists (warehouses, suppliers, customers, products)
  useEffect(() => {
    const loadRefData = async () => {
      try {
        const [whRes, supRes, custRes, prodRes] = await Promise.all([
          warehousesService.getAll({ limit: 100 }).catch(() => ({ data: [] })),
          suppliersService.getAll({ limit: 100 }).catch(() => ({ data: [] })),
          customersService.getAll({ limit: 100 }).catch(() => ({ data: [] })),
          productsService.getAll({ limit: 200 }).catch(() => ({ data: [] })),
        ]);

        const whList = Array.isArray((whRes as any)?.data)
          ? (whRes as any).data
          : Array.isArray(whRes)
          ? whRes
          : [];
        const supList = Array.isArray((supRes as any)?.data)
          ? (supRes as any).data
          : Array.isArray(supRes)
          ? supRes
          : [];
        const custList = Array.isArray((custRes as any)?.data)
          ? (custRes as any).data
          : Array.isArray(custRes)
          ? custRes
          : [];
        const prodList = Array.isArray((prodRes as any)?.data)
          ? (prodRes as any).data
          : Array.isArray(prodRes)
          ? prodRes
          : [];

        setWarehouses(whList);
        setSuppliers(supList);
        setCustomers(custList);
        setProducts(prodList);
      } catch (err) {
        console.error('Failed to load reference data:', err);
      }
    };
    loadRefData();
  }, []);

  // Handle URL query params (?action=import|export|transfer&supplier_id=...&customer_id=...)
  useEffect(() => {
    const action = searchParams.get('action')?.toUpperCase();
    const supId = searchParams.get('supplier_id') || undefined;
    const custId = searchParams.get('customer_id') || undefined;
    if (
      action === 'IMPORT' ||
      action === 'EXPORT' ||
      action === 'TRANSFER' ||
      action === 'ADJUSTMENT'
    ) {
      setFormInitialType(action as StockTransactionType);
      setFormInitialSupplierId(supId);
      setFormInitialCustomerId(custId);
      setIsFormModalOpen(true);
      searchParams.delete('action');
      searchParams.delete('supplier_id');
      searchParams.delete('customer_id');
      setSearchParams(searchParams, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  // Fetch Stock Transactions
  const fetchTransactions = useCallback(async () => {
    setLoading(true);
    try {
      const params: FilterStockTransactionParams = {
        page,
        limit,
        search: search.trim() || undefined,
        type: typeFilter === 'ALL' ? undefined : typeFilter,
        warehouse_id: warehouseFilter || undefined,
      };
      const res = await stockTransactionsService.getAll(params);
      setTransactions(res.data || []);
      setTotal(res.meta?.total || 0);
    } catch (err) {
      console.error(err);
      showToast.error('Không thể tải danh sách phiếu xuất / nhập kho');
    } finally {
      setLoading(false);
    }
  }, [page, limit, search, typeFilter, warehouseFilter]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  // Reset page on filter changes
  useEffect(() => {
    setPage(1);
  }, [search, typeFilter, warehouseFilter]);

  const totalPages = useMemo(() => Math.max(1, Math.ceil(total / limit)), [total, limit]);

  // Thống kê nhanh theo tiêu chuẩn IMS chuyên nghiệp
  const kpiStats = useMemo(() => {
    let importVal = 0;
    let importQty = 0;
    let importCount = 0;

    let exportVal = 0;
    let exportQty = 0;
    let exportCount = 0;

    let transferCount = 0;
    let adjustCount = 0;

    transactions.forEach((tx) => {
      const items = tx.items || [];
      const txQty = items.reduce((s, it) => s + Number(it.quantity || 0), 0);
      const txVal = items.reduce((s, it) => s + Number(it.total_price || 0), 0);

      if (tx.type === 'IMPORT') {
        importVal += txVal;
        importQty += txQty;
        importCount++;
      } else if (tx.type === 'EXPORT') {
        exportVal += txVal;
        exportQty += txQty;
        exportCount++;
      } else if (tx.type === 'TRANSFER') {
        transferCount++;
      } else if (tx.type === 'ADJUSTMENT') {
        adjustCount++;
      }
    });

    return {
      importVal,
      importQty,
      importCount,
      exportVal,
      exportQty,
      exportCount,
      transferCount,
      adjustCount,
    };
  }, [transactions]);

  const formatVND = (v: number) =>
    new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      maximumFractionDigits: 0,
    }).format(v || 0);

  const handleOpenCreateModal = (type: StockTransactionType) => {
    setFormInitialType(type);
    setFormInitialSupplierId(undefined);
    setIsFormModalOpen(true);
  };

  const handleRowClick = async (tx: StockTransaction) => {
    setActiveTransaction(tx);
    try {
      const fullTx = await stockTransactionsService.getById(tx.id);
      if (fullTx && fullTx.id) {
        setActiveTransaction(fullTx);
      }
    } catch {
      // Fallback to row transaction data already set
    }
  };

  const handleExportExcel = async () => {
    setExportingExcel(true);
    try {
      await stockTransactionsService.exportExcel({
        type: typeFilter === 'ALL' ? undefined : typeFilter,
        warehouse_id: warehouseFilter || undefined,
        search: search.trim() || undefined,
      });
      showToast.success('Đã xuất file Excel lịch sử xuất nhập kho');
    } catch {
      showToast.error('Không thể xuất file Excel');
    } finally {
      setExportingExcel(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 px-4 sm:px-6 lg:px-8 py-4 max-w-[1600px] w-full mx-auto space-y-4">
      {/* 1. PAGE HEADER & QUICK ACTIONS */}
      <div className="shrink-0 flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-100 dark:border-[#30363d]">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Xử lý Xuất / Nhập Kho
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Quy trình nhập hàng từ NCC, xuất bán khách hàng, chuyển kho nội bộ và cân đối kiểm kê
          </p>
        </div>

        {/* Action Hub - Chuẩn IMS (Rõ ràng, trực quan, dễ thao tác) */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Secondary actions: Xuất Excel, Điều chỉnh, Chuyển kho */}
          {isManagerOrAdmin && (
            <button
              onClick={handleExportExcel}
              disabled={exportingExcel}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-white dark:bg-[#161b22] hover:bg-slate-50 dark:hover:bg-white/5 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-[#30363d] rounded-xl font-semibold text-xs transition-all cursor-pointer shadow-2xs disabled:opacity-50"
              title="Xuất file Excel"
            >
              <FileDown className="w-4 h-4 text-emerald-600" />
              <span className="hidden sm:inline">Xuất Excel</span>
            </button>
          )}

          {isManagerOrAdmin && (
            <button
              onClick={() => handleOpenCreateModal('ADJUSTMENT')}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-white dark:bg-[#161b22] hover:bg-amber-50 dark:hover:bg-amber-950/20 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-[#30363d] rounded-xl font-semibold text-xs transition-all cursor-pointer shadow-2xs"
              title="Cân đối tồn kho sau kiểm kê thực tế"
            >
              <ClipboardCheck className="w-4 h-4 text-amber-500" />
              <span>Kiểm kê</span>
            </button>
          )}

          <button
            onClick={() => handleOpenCreateModal('TRANSFER')}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-white dark:bg-[#161b22] hover:bg-blue-50 dark:hover:bg-blue-950/20 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-[#30363d] rounded-xl font-semibold text-xs transition-all cursor-pointer shadow-2xs"
            title="Điều chuyển hàng hóa giữa các kho nội bộ"
          >
            <ArrowLeftRight className="w-4 h-4 text-blue-500" />
            <span>Chuyển kho</span>
          </button>

          {/* Primary Action 1: XUẤT KHO (Đỏ) */}
          <button
            onClick={() => handleOpenCreateModal('EXPORT')}
            className="inline-flex items-center gap-1.5 px-3.5 sm:px-4 py-2 bg-[#EE3D43] hover:bg-[#D9343A] text-white rounded-xl font-bold text-xs transition-all cursor-pointer shadow-sm active:scale-95"
            title="Lập phiếu xuất bán hoặc xuất điều chuyển"
          >
            <ArrowUpRight className="w-4 h-4 stroke-[2.5]" />
            <span>- Xuất kho</span>
          </button>

          {/* Primary Action 2: NHẬP KHO (Xanh lá) */}
          <button
            onClick={() => handleOpenCreateModal('IMPORT')}
            className="inline-flex items-center gap-1.5 px-3.5 sm:px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs transition-all cursor-pointer shadow-sm active:scale-95"
            title="Lập phiếu nhập hàng từ nhà cung cấp"
          >
            <ArrowDownLeft className="w-4 h-4 stroke-[2.5]" />
            <span>+ Nhập kho</span>
          </button>
        </div>
      </div>

      {/* 2. ENTERPRISE IMS KPI SUMMARY CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 shrink-0">
        {/* Card 1: Tổng số phiếu */}
        <div className="card-elevated p-4 sm:p-4.5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Tổng số giao dịch
            </span>
            <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-slate-300 flex items-center justify-center">
              <ArrowLeftRight className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black font-mono text-slate-900 dark:text-white">
              {total}
            </span>
            <span className="text-xs text-slate-500">chứng từ</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Toàn bộ lịch sử xuất, nhập & chuyển kho
          </div>
        </div>

        {/* Card 2: Nhập hàng (Inbound) */}
        <div className="card-elevated p-4 sm:p-4.5 flex flex-col justify-between border-emerald-200/70 dark:border-emerald-900/40">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">
              Giá trị nhập kho
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <ArrowDownLeft className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-xl sm:text-2xl font-black font-mono text-emerald-600 dark:text-emerald-400 truncate">
              {formatVND(kpiStats.importVal)}
            </span>
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 flex items-center justify-between">
            <span>{kpiStats.importCount} phiếu nhập</span>
            <span className="font-mono font-semibold text-emerald-600">+{kpiStats.importQty} SP</span>
          </div>
        </div>

        {/* Card 3: Xuất hàng (Outbound) */}
        <div className="card-elevated p-4 sm:p-4.5 flex flex-col justify-between border-rose-200/70 dark:border-rose-900/40">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-rose-700 dark:text-rose-400 uppercase tracking-wider">
              Giá trị xuất kho
            </span>
            <div className="w-8 h-8 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 flex items-center justify-center">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-xl sm:text-2xl font-black font-mono text-rose-600 dark:text-rose-400 truncate">
              {formatVND(kpiStats.exportVal)}
            </span>
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 flex items-center justify-between">
            <span>{kpiStats.exportCount} phiếu xuất</span>
            <span className="font-mono font-semibold text-rose-600">-{kpiStats.exportQty} SP</span>
          </div>
        </div>

        {/* Card 4: Chuyển & Cân đối kho */}
        <div className="card-elevated p-4 sm:p-4.5 flex flex-col justify-between border-blue-200/70 dark:border-blue-900/40">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-blue-700 dark:text-blue-400 uppercase tracking-wider">
              Nội bộ & Kiểm kê
            </span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <ClipboardCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black font-mono text-slate-900 dark:text-white">
              {kpiStats.transferCount + kpiStats.adjustCount}
            </span>
            <span className="text-xs text-slate-500">chứng từ</span>
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 flex items-center justify-between">
            <span>{kpiStats.transferCount} chuyển kho</span>
            <span>{kpiStats.adjustCount} kiểm kê</span>
          </div>
        </div>
      </div>

      {/* 3. FILTER & SEARCH TOOLBAR */}
      <div className="shrink-0 bg-white dark:bg-[#161b22] rounded-2xl border border-slate-200/80 dark:border-[#30363d] p-3 shadow-2xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 flex-wrap flex-1">
          {/* Search Input */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm theo mã phiếu, ghi chú, đối tác..."
              className="w-full pl-9 pr-3.5 py-1.5 bg-slate-50 dark:bg-[#0d1117] border border-slate-200 dark:border-[#30363d] rounded-xl text-xs text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:bg-white dark:focus:bg-[#161b22] focus:border-slate-400 transition-all"
            />
          </div>

          {/* Segmental Tabs (Tất cả, Nhập kho, Xuất kho, Chuyển kho, Kiểm kê) */}
          <div className="flex items-center bg-slate-100/90 dark:bg-[#0d1117] p-0.5 rounded-xl border border-slate-200/60 dark:border-[#30363d] overflow-x-auto max-w-full">
            {(
              [
                { id: 'ALL', label: 'Tất cả' },
                { id: 'IMPORT', label: 'Nhập kho' },
                { id: 'EXPORT', label: 'Xuất kho' },
                { id: 'TRANSFER', label: 'Chuyển kho' },
                { id: 'ADJUSTMENT', label: 'Kiểm kê' },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                onClick={() => setTypeFilter(tab.id)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                  typeFilter === tab.id
                    ? 'bg-white dark:bg-[#161b22] text-slate-900 dark:text-white shadow-2xs font-bold'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Warehouse Filter Dropdown */}
          <select
            value={warehouseFilter}
            onChange={(e) => setWarehouseFilter(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 dark:bg-[#0d1117] border border-slate-200 dark:border-[#30363d] rounded-xl text-xs font-medium text-slate-700 dark:text-slate-200 focus:outline-none cursor-pointer"
          >
            <option value="">Tất cả kho hàng</option>
            {warehouses.map((w) => (
              <option key={w.id} value={w.id}>
                {w.name} ({w.code})
              </option>
            ))}
          </select>
        </div>

        {/* Refresh Button */}
        <button
          onClick={fetchTransactions}
          disabled={loading}
          title="Làm mới dữ liệu từ server"
          className="p-2 text-slate-500 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 rounded-xl border border-slate-200/80 dark:border-[#30363d] transition-colors cursor-pointer"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* 4. TABLE & MOBILE CARDS CONTAINER */}
      <div className="flex-1 min-h-[420px] bg-white dark:bg-[#161b22] rounded-2xl border border-slate-200/80 dark:border-[#30363d] shadow-2xs flex flex-col overflow-hidden">
        <div className="flex-1 overflow-auto custom-scrollbar">
          <StockTransactionTable
            transactions={transactions}
            loading={loading}
            onRowClick={handleRowClick}
          />
        </div>

        {/* 5. PAGINATION FOOTER */}
        <div className="shrink-0 px-4 py-2.5 border-t border-slate-100 dark:border-[#30363d] bg-slate-50/40 dark:bg-[#0d1117] flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-2">
            <span>Hiển thị</span>
            <select
              value={limit}
              onChange={(e) => {
                setLimit(Number(e.target.value));
                setPage(1);
              }}
              className="bg-white dark:bg-[#161b22] border border-slate-200 dark:border-[#30363d] rounded-lg px-2 py-1 text-xs font-semibold text-slate-700 dark:text-slate-200 focus:outline-none cursor-pointer"
            >
              {[10, 20, 50].map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
            <span>
              trên tổng số <strong className="text-slate-800 dark:text-white">{total}</strong> phiếu kho
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-[#30363d] bg-white dark:bg-[#161b22] text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-2.5 font-semibold text-slate-700 dark:text-slate-300">
              {page} / {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-[#30363d] bg-white dark:bg-[#161b22] text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* CREATE TRANSACTION MODAL */}
      <StockTransactionFormModal
        isOpen={isFormModalOpen}
        initialType={formInitialType}
        initialSupplierId={formInitialSupplierId}
        initialCustomerId={formInitialCustomerId}
        warehouses={warehouses}
        suppliers={suppliers}
        customers={customers}
        products={products}
        isManagerOrAdmin={isManagerOrAdmin}
        onClose={() => setIsFormModalOpen(false)}
        onSuccess={fetchTransactions}
      />

      {/* TRANSACTION DETAIL DRAWER */}
      <StockTransactionDetailDrawer
        transaction={activeTransaction}
        onClose={() => setActiveTransaction(null)}
      />
    </div>
  );
};

