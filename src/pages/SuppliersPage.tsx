import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Plus,
  Search,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { Supplier, FilterSupplierParams } from '../types/supplier.types';
import { suppliersService } from '../services/suppliers.service';
import { useAuthStore } from '../stores/auth.store';
import { showToast } from '../utils/toast.util';
import { SupplierTable } from '../components/suppliers/SupplierTable';
import { SupplierFormModal } from '../components/suppliers/SupplierFormModal';
import { DeleteSupplierModal } from '../components/suppliers/DeleteSupplierModal';
import { SupplierDetailDrawer } from '../components/suppliers/SupplierDetailDrawer';

export const SuppliersPage: React.FC = () => {
  const { user } = useAuthStore();
  const isManagerOrAdmin = user?.role === 'ADMIN' || user?.role === 'MANAGER';

  // Data state
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL');

  // Pagination state
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);

  // Modal / Drawer state
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [deletingSupplier, setDeletingSupplier] = useState<Supplier | null>(null);
  const [activeDrawerSupplier, setActiveDrawerSupplier] = useState<Supplier | null>(null);

  // Fetch Suppliers
  const fetchSuppliers = useCallback(async () => {
    setLoading(true);
    try {
      const params: FilterSupplierParams = {
        page,
        limit,
        search: search.trim() || undefined,
        is_active:
          statusFilter === 'ACTIVE' ? true : statusFilter === 'INACTIVE' ? false : undefined,
      };
      const res = await suppliersService.getAll(params);
      setSuppliers(res.data || []);
      setTotal(res.meta?.total || 0);
    } catch (err: any) {
      console.error(err);
      showToast.error('Không thể tải danh sách nhà cung cấp');
    } finally {
      setLoading(false);
    }
  }, [page, limit, search, statusFilter]);

  useEffect(() => {
    fetchSuppliers();
  }, [fetchSuppliers]);

  // Debounced search reset page
  useEffect(() => {
    setPage(1);
  }, [search, statusFilter]);

  const totalPages = useMemo(() => Math.max(1, Math.ceil(total / limit)), [total, limit]);

  // Handlers
  const handleOpenCreate = () => {
    setEditingSupplier(null);
    setIsFormModalOpen(true);
  };

  const handleOpenEdit = (s: Supplier) => {
    setEditingSupplier(s);
    setIsFormModalOpen(true);
  };

  const handleOpenDelete = (s: Supplier) => {
    setDeletingSupplier(s);
  };

  const handleToggleStatus = async (s: Supplier) => {
    try {
      const updated = await suppliersService.update(s.id, {
        is_active: !s.is_active,
      });
      setSuppliers((prev) => prev.map((item) => (item.id === s.id ? updated : item)));
      if (activeDrawerSupplier?.id === s.id) {
        setActiveDrawerSupplier(updated);
      }
      showToast.success(
        updated.is_active
          ? `Đã kích hoạt hợp tác với "${s.name}"`
          : `Đã tạm ngưng hợp tác với "${s.name}"`
      );
    } catch (err: any) {
      console.error(err);
      showToast.error('Không thể thay đổi trạng thái nhà cung cấp');
    }
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 px-6 sm:px-8 py-4 max-w-[1560px] w-full mx-auto space-y-3.5">
      {/* PAGE HEADER */}
      <div className="shrink-0 flex items-center justify-between gap-4 pb-2 border-b border-slate-100 min-h-[52px]">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Nhà cung cấp
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Quản lý danh sách đối tác cung ứng và thông tin liên hệ nhập hàng
          </p>
        </div>

        {isManagerOrAdmin && (
          <button
            onClick={handleOpenCreate}
            className="flex items-center gap-1.5 px-4 py-2 bg-[#EE3D43] hover:bg-[#D9343A] text-white rounded-xl text-xs font-bold transition-all shadow-sm active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Thêm nhà cung cấp</span>
          </button>
        )}
      </div>

      {/* TOOLBAR */}
      <div className="shrink-0 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3 flex-1 min-w-[300px]">
          {/* Search Input */}
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm theo tên đối tác, mã NCC, SĐT..."
              className="w-full pl-9 pr-3.5 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#EE3D43]/20 focus:border-[#EE3D43] transition-all shadow-2xs"
            />
          </div>

          {/* Status Filter Tabs */}
          <div className="inline-flex rounded-xl p-0.5 bg-slate-100 border border-slate-200/80 text-xs font-medium">
            <button
              onClick={() => setStatusFilter('ALL')}
              className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                statusFilter === 'ALL'
                  ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Tất cả ({total})
            </button>
            <button
              onClick={() => setStatusFilter('ACTIVE')}
              className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                statusFilter === 'ACTIVE'
                  ? 'bg-white text-emerald-700 shadow-2xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Đang hợp tác
            </button>
            <button
              onClick={() => setStatusFilter('INACTIVE')}
              className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                statusFilter === 'INACTIVE'
                  ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Tạm ngưng
            </button>
          </div>
        </div>

        {/* Refresh button */}
        <button
          onClick={fetchSuppliers}
          className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer border border-slate-200 bg-white"
          title="Làm mới dữ liệu"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-slate-600' : ''}`} />
        </button>
      </div>

      {/* MAIN TABLE CONTAINER */}
      <div className="flex-1 min-h-[380px] bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden flex flex-col">
        <div className="flex-1 overflow-auto custom-scrollbar">
          <SupplierTable
            suppliers={suppliers}
            loading={loading}
            isManagerOrAdmin={isManagerOrAdmin}
            onRowClick={(s) => setActiveDrawerSupplier(s)}
            onEdit={handleOpenEdit}
            onDelete={handleOpenDelete}
            onToggleStatus={handleToggleStatus}
          />
        </div>

        {/* PAGINATION FOOTER */}
        <div className="shrink-0 px-4 py-2.5 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500 bg-slate-50/50">
          <div className="flex items-center gap-2">
            <span>Hiển thị</span>
            <select
              value={limit}
              onChange={(e) => {
                setLimit(Number(e.target.value));
                setPage(1);
              }}
              className="px-2 py-1 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#EE3D43] cursor-pointer"
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
            <span>trên tổng số <strong>{total}</strong> đối tác</span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="p-1 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
              title="Trang trước"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-semibold px-2 text-slate-700">
              {page} / {totalPages}
            </span>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="p-1 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
              title="Trang sau"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* MODALS & DRAWERS */}
      <SupplierFormModal
        isOpen={isFormModalOpen}
        supplier={editingSupplier}
        onClose={() => {
          setIsFormModalOpen(false);
          setEditingSupplier(null);
        }}
        onSuccess={fetchSuppliers}
      />

      <DeleteSupplierModal
        supplier={deletingSupplier}
        onClose={() => setDeletingSupplier(null)}
        onSuccess={fetchSuppliers}
      />

      <SupplierDetailDrawer
        supplier={activeDrawerSupplier}
        onClose={() => setActiveDrawerSupplier(null)}
        onEdit={(s) => {
          setActiveDrawerSupplier(null);
          handleOpenEdit(s);
        }}
        isManagerOrAdmin={isManagerOrAdmin}
      />
    </div>
  );
};
