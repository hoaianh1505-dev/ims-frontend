import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus,
  Search,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Store,
  Building,
  ShoppingBag,
} from 'lucide-react';
import {
  Customer,
  CustomerType,
  FilterCustomerParams,
} from '../types/customer.types';
import { customersService } from '../services/customers.service';
import { useAuthStore } from '../stores/auth.store';
import { showToast } from '../utils/toast.util';
import { CustomerTable } from '../components/customers/CustomerTable';
import { CustomerFormModal } from '../components/customers/CustomerFormModal';
import { DeleteCustomerModal } from '../components/customers/DeleteCustomerModal';
import { CustomerDetailDrawer } from '../components/customers/CustomerDetailDrawer';

export const CustomersPage: React.FC = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const isManagerOrAdmin = user?.role === 'ADMIN' || user?.role === 'MANAGER';

  // Data state
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL');
  const [typeFilter, setTypeFilter] = useState<'ALL' | CustomerType>('ALL');

  // Pagination state
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);

  // Modal / Drawer state
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [deletingCustomer, setDeletingCustomer] = useState<Customer | null>(null);
  const [activeDrawerCustomer, setActiveDrawerCustomer] = useState<Customer | null>(null);

  // Fetch Customers
  const fetchCustomers = useCallback(async () => {
    setLoading(true);
    try {
      const params: FilterCustomerParams = {
        page,
        limit,
        search: search.trim() || undefined,
        type: typeFilter === 'ALL' ? undefined : typeFilter,
        is_active:
          statusFilter === 'ACTIVE' ? true : statusFilter === 'INACTIVE' ? false : undefined,
      };
      const res = await customersService.getAll(params);
      setCustomers(res.data || []);
      setTotal(res.meta?.total || 0);
    } catch (err: any) {
      console.error(err);
      showToast.error('Không thể tải danh sách khách hàng');
    } finally {
      setLoading(false);
    }
  }, [page, limit, search, statusFilter, typeFilter]);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  // Debounced search / filter reset page
  useEffect(() => {
    setPage(1);
  }, [search, statusFilter, typeFilter]);

  const totalPages = useMemo(() => Math.max(1, Math.ceil(total / limit)), [total, limit]);

  // Handlers
  const handleOpenCreate = () => {
    setEditingCustomer(null);
    setIsFormModalOpen(true);
  };

  const handleOpenEdit = (c: Customer) => {
    setEditingCustomer(c);
    setIsFormModalOpen(true);
  };

  const handleOpenDelete = (c: Customer) => {
    setDeletingCustomer(c);
  };

  const handleToggleStatus = async (c: Customer) => {
    const nextStatus = !c.is_active;
    try {
      const updated = await customersService.update(c.id, {
        is_active: nextStatus,
      });
      const resolvedCustomer = { ...c, ...updated, is_active: nextStatus };
      setCustomers((prev) =>
        prev.map((item) => (item.id === c.id ? resolvedCustomer : item))
      );
      if (activeDrawerCustomer?.id === c.id) {
        setActiveDrawerCustomer(resolvedCustomer);
      }
      showToast.success(
        nextStatus
          ? `Đã kích hoạt hợp tác với "${c.name}"`
          : `Đã tạm ngưng hợp tác với "${c.name}"`
      );
    } catch (err: any) {
      console.error(err);
      showToast.error('Không thể thay đổi trạng thái khách hàng');
      fetchCustomers();
    }
  };

  const handleNewExportOrder = (c: Customer) => {
    setActiveDrawerCustomer(null);
    navigate(`/stock-transactions?action=export&customer_id=${c.id}`);
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 px-6 sm:px-8 py-4 max-w-[1560px] w-full mx-auto space-y-3.5">
      {/* PAGE HEADER */}
      <div className="shrink-0 flex items-center justify-between gap-4 pb-2 border-b border-slate-100 min-h-[52px]">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Khách hàng & Đại lý
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Quản lý danh sách đối tác khách hàng, nhà phân phối, hạn mức công nợ và xuất bán hàng hóa
          </p>
        </div>

        {isManagerOrAdmin && (
          <button
            onClick={handleOpenCreate}
            className="flex items-center gap-1.5 px-4 py-2 bg-[#EE3D43] hover:bg-[#D9343A] text-white rounded-xl text-xs font-bold transition-all shadow-sm active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Thêm khách hàng</span>
          </button>
        )}
      </div>

      {/* TOOLBAR */}
      <div className="shrink-0 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3 flex-1 min-w-[300px]">
          {/* Search Input */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm theo tên khách, mã KH, SĐT..."
              className="w-full pl-9 pr-3.5 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#EE3D43]/20 focus:border-[#EE3D43] transition-all shadow-2xs"
            />
          </div>

          {/* Customer Type Filter */}
          <div className="inline-flex rounded-xl p-0.5 bg-slate-100 border border-slate-200/80 text-xs font-medium">
            <button
              onClick={() => setTypeFilter('ALL')}
              className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                typeFilter === 'ALL'
                  ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Tất cả loại
            </button>
            <button
              onClick={() => setTypeFilter('RETAIL')}
              className={`px-3 py-1 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                typeFilter === 'RETAIL'
                  ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ShoppingBag className="w-3.5 h-3.5 text-blue-500" />
              <span>Khách lẻ</span>
            </button>
            <button
              onClick={() => setTypeFilter('WHOLESALE')}
              className={`px-3 py-1 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                typeFilter === 'WHOLESALE'
                  ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Store className="w-3.5 h-3.5 text-indigo-500" />
              <span>Khách buôn / sỉ</span>
            </button>
            <button
              onClick={() => setTypeFilter('DISTRIBUTOR')}
              className={`px-3 py-1 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                typeFilter === 'DISTRIBUTOR'
                  ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Building className="w-3.5 h-3.5 text-purple-500" />
              <span>Đại lý phân phối</span>
            </button>
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
              Tất cả
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
                  ? 'bg-white text-rose-700 shadow-2xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Tạm ngưng
            </button>
          </div>
        </div>

        {/* Refresh button */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => fetchCustomers()}
            disabled={loading}
            title="Làm mới danh sách"
            className="p-1.5 border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 rounded-xl transition-all shadow-2xs cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* TABLE CONTAINER */}
      <div className="flex-1 min-h-0 bg-white rounded-2xl border border-slate-200/90 shadow-xs flex flex-col overflow-hidden">
        <div className="flex-1 overflow-auto custom-scrollbar">
          <CustomerTable
            customers={customers}
            loading={loading}
            isManagerOrAdmin={isManagerOrAdmin}
            onRowClick={(c) => setActiveDrawerCustomer(c)}
            onEdit={handleOpenEdit}
            onDelete={handleOpenDelete}
            onToggleStatus={handleToggleStatus}
          />
        </div>

        {/* PAGINATION FOOTER */}
        <div className="shrink-0 px-4 py-2.5 border-t border-slate-100 bg-slate-50/60 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span>Hiển thị</span>
            <select
              value={limit}
              onChange={(e) => setLimit(Number(e.target.value))}
              className="bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs font-semibold text-slate-700 focus:outline-none cursor-pointer"
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
            <span>trên tổng số <strong className="text-slate-800">{total}</strong> khách hàng</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="font-medium text-slate-600">
              Trang {page} / {totalPages}
            </span>
            <div className="inline-flex rounded-lg border border-slate-200 bg-white shadow-2xs overflow-hidden">
              <button
                disabled={page <= 1 || loading}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="p-1 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed text-slate-600 border-r border-slate-100 cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                disabled={page >= totalPages || loading}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="p-1 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed text-slate-600 cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* MODALS & DRAWERS */}
      <CustomerFormModal
        isOpen={isFormModalOpen}
        customer={editingCustomer}
        onClose={() => setIsFormModalOpen(false)}
        onSuccess={() => {
          fetchCustomers();
          if (activeDrawerCustomer && editingCustomer?.id === activeDrawerCustomer.id) {
            customersService.getById(editingCustomer.id).then((fresh) => {
              setActiveDrawerCustomer(fresh);
            });
          }
        }}
      />

      <DeleteCustomerModal
        customer={deletingCustomer}
        onClose={() => setDeletingCustomer(null)}
        onSuccess={() => {
          if (activeDrawerCustomer?.id === deletingCustomer?.id) {
            setActiveDrawerCustomer(null);
          }
          fetchCustomers();
        }}
      />

      <CustomerDetailDrawer
        customer={activeDrawerCustomer}
        isManagerOrAdmin={isManagerOrAdmin}
        onClose={() => setActiveDrawerCustomer(null)}
        onEdit={(c) => {
          handleOpenEdit(c);
        }}
        onToggleStatus={handleToggleStatus}
        onNewExportOrder={handleNewExportOrder}
      />
    </div>
  );
};
