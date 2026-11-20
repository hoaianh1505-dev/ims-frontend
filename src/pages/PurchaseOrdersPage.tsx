import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  ShoppingCart,
  Search,
  Plus,
  RefreshCw,
  Building2,
  Truck,
  CheckCircle2,
  Clock,
  Send,
  PackageCheck,
  Ban,
  Trash2,
  X,
  Eye,
  FileText,
  Loader2,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import {
  PurchaseOrder,
  PurchaseOrderStatus,
  CreatePurchaseOrderParams,
  CreatePurchaseOrderItemParams,
} from '../types/purchase-order.types';
import { Supplier } from '../types/supplier.types';
import { Warehouse } from '../types/warehouse.types';
import { Product } from '../types/product.types';
import { purchaseOrdersService } from '../services/purchase-orders.service';
import { suppliersService } from '../services/suppliers.service';
import { warehousesService } from '../services/warehouses.service';
import { productsService } from '../services/products.service';
import { useAuthStore } from '../stores/auth.store';
import { showToast } from '../utils/toast.util';

const STATUS_META: Record<
  PurchaseOrderStatus,
  { label: string; badgeClass: string; icon: React.ReactNode }
> = {
  DRAFT: {
    label: 'Bản nháp',
    badgeClass: 'bg-slate-100 text-slate-700 border-slate-300',
    icon: <FileText className="w-3.5 h-3.5 text-slate-500" />,
  },
  PENDING_APPROVAL: {
    label: 'Chờ duyệt',
    badgeClass: 'bg-amber-100 text-amber-800 border-amber-300',
    icon: <Clock className="w-3.5 h-3.5 text-amber-600" />,
  },
  APPROVED: {
    label: 'Đã duyệt',
    badgeClass: 'bg-blue-100 text-blue-800 border-blue-300',
    icon: <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />,
  },
  ORDERED: {
    label: 'Đã đặt hàng',
    badgeClass: 'bg-indigo-100 text-indigo-800 border-indigo-300',
    icon: <Send className="w-3.5 h-3.5 text-indigo-600" />,
  },
  RECEIVED: {
    label: 'Đã nhập kho',
    badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    icon: <PackageCheck className="w-3.5 h-3.5 text-emerald-600" />,
  },
  CANCELLED: {
    label: 'Đã hủy',
    badgeClass: 'bg-rose-100 text-rose-800 border-rose-300',
    icon: <Ban className="w-3.5 h-3.5 text-rose-600" />,
  },
};

const formatCurrency = (val: number) =>
  new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(val || 0);

export const PurchaseOrdersPage: React.FC = () => {
  const { user } = useAuthStore();
  const isManagerOrAdmin = user?.role === 'ADMIN' || user?.role === 'MANAGER';

  // Data state
  const [orders, setOrders] = useState<PurchaseOrder[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);

  // Reference data
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [products, setProducts] = useState<Product[]>([]);

  // Filter state
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | PurchaseOrderStatus>('ALL');
  const [warehouseFilter, setWarehouseFilter] = useState('');
  const [page, setPage] = useState(1);
  const limit = 10;

  // Modal / Drawer state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [activeOrder, setActiveOrder] = useState<PurchaseOrder | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Form State for Creating PO
  const [formSupplierId, setFormSupplierId] = useState('');
  const [formWarehouseId, setFormWarehouseId] = useState('');
  const [formExpectedDate, setFormExpectedDate] = useState('');
  const [formNote, setFormNote] = useState('');
  const [formItems, setFormItems] = useState<CreatePurchaseOrderItemParams[]>([
    { product_id: '', quantity: 10, unit_price: 0, note: '' },
  ]);

  // Load Reference Data
  useEffect(() => {
    const loadRefs = async () => {
      try {
        const [supRes, whRes, prodRes] = await Promise.all([
          suppliersService.getAll({ limit: 100 }),
          warehousesService.getAll({ limit: 50 }),
          productsService.getAll({ limit: 200 }),
        ]);

        const sList = (supRes as any)?.data || supRes || [];
        const wList = (whRes as any)?.data || whRes || [];
        const pList = (prodRes as any)?.data || prodRes || [];

        setSuppliers(Array.isArray(sList) ? sList : []);
        setWarehouses(Array.isArray(wList) ? wList : []);
        setProducts(Array.isArray(pList) ? pList : []);

        if (wList.length > 0) setFormWarehouseId(wList[0].id);
        if (sList.length > 0) setFormSupplierId(sList[0].id);
      } catch (err) {
        console.error('Lỗi nạp danh mục tham chiếu:', err);
      }
    };
    loadRefs();
  }, []);

  // Fetch Purchase Orders
  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const res: any = await purchaseOrdersService.getAll({
        page,
        limit,
        search: search.trim() || undefined,
        status: statusFilter === 'ALL' ? undefined : statusFilter,
        warehouse_id: warehouseFilter || undefined,
      });

      const list = res?.data || res?.items || (Array.isArray(res) ? res : []);
      const count = res?.meta?.total || res?.total || list.length;
      setOrders(list);
      setTotal(count);
    } catch (err) {
      console.error(err);
      showToast.error('Không thể tải danh sách đơn đặt hàng');
    } finally {
      setLoading(false);
    }
  }, [page, search, statusFilter, warehouseFilter]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Total amount of Form Items
  const formTotalAmount = useMemo(() => {
    return formItems.reduce(
      (sum, item) => sum + (Number(item.quantity) || 0) * (Number(item.unit_price) || 0),
      0
    );
  }, [formItems]);

  const handleAddItemRow = () => {
    setFormItems((prev) => [
      ...prev,
      { product_id: products[0]?.id || '', quantity: 10, unit_price: 0, note: '' },
    ]);
  };

  const handleRemoveItemRow = (idx: number) => {
    if (formItems.length <= 1) return;
    setFormItems((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleItemChange = (
    idx: number,
    field: keyof CreatePurchaseOrderItemParams,
    value: any
  ) => {
    setFormItems((prev) => {
      const updated = [...prev];
      updated[idx] = { ...updated[idx], [field]: value };

      // Tự động gán giá vốn mặc định khi chọn sản phẩm
      if (field === 'product_id') {
        const prod = products.find((p) => p.id === value);
        if (prod && prod.cost_price) {
          updated[idx].unit_price = Number(prod.cost_price);
        }
      }
      return updated;
    });
  };

  const handleCreateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formSupplierId || !formWarehouseId) {
      showToast.error('Vui lòng chọn Nhà cung cấp và Kho nhận hàng');
      return;
    }

    const validItems = formItems.filter((i) => i.product_id && i.quantity > 0);
    if (validItems.length === 0) {
      showToast.error('Đơn đặt hàng phải có ít nhất 1 sản phẩm với số lượng > 0');
      return;
    }

    setActionLoading(true);
    try {
      const payload: CreatePurchaseOrderParams = {
        supplier_id: formSupplierId,
        warehouse_id: formWarehouseId,
        expected_delivery_date: formExpectedDate || undefined,
        note: formNote.trim() || undefined,
        items: validItems.map((i) => ({
          product_id: i.product_id,
          quantity: Number(i.quantity),
          unit_price: Number(i.unit_price) || 0,
          note: i.note,
        })),
      };

      await purchaseOrdersService.create(payload);
      showToast.success('Đã tạo đơn đặt hàng nhà cung cấp thành công (Trạng thái: Bản nháp)');
      setIsCreateModalOpen(false);
      fetchOrders();
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Không thể tạo đơn đặt hàng';
      showToast.error(Array.isArray(msg) ? msg[0] : msg);
    } finally {
      setActionLoading(false);
    }
  };

  // Workflow Action Handlers
  const handleSubmitForApproval = async (id: string) => {
    setActionLoading(true);
    try {
      await purchaseOrdersService.submitForApproval(id);
      showToast.success('Đã gửi đơn hàng lên cấp Quản lý phê duyệt');
      fetchOrders();
      if (activeOrder && activeOrder.id === id) {
        const updated = await purchaseOrdersService.getOne(id);
        setActiveOrder(updated);
      }
    } catch (err: any) {
      showToast.error(err?.response?.data?.message || 'Thao tác thất bại');
    } finally {
      setActionLoading(false);
    }
  };

  const handleApprove = async (id: string) => {
    setActionLoading(true);
    try {
      await purchaseOrdersService.approve(id);
      showToast.success('Phê duyệt đơn đặt hàng thành công');
      fetchOrders();
      if (activeOrder && activeOrder.id === id) {
        const updated = await purchaseOrdersService.getOne(id);
        setActiveOrder(updated);
      }
    } catch (err: any) {
      showToast.error(err?.response?.data?.message || 'Phê duyệt thất bại');
    } finally {
      setActionLoading(false);
    }
  };

  const handleMarkAsOrdered = async (id: string) => {
    setActionLoading(true);
    try {
      await purchaseOrdersService.markAsOrdered(id);
      showToast.success('Đã cập nhật: Đã gửi đơn hàng cho nhà cung cấp');
      fetchOrders();
      if (activeOrder && activeOrder.id === id) {
        const updated = await purchaseOrdersService.getOne(id);
        setActiveOrder(updated);
      }
    } catch (err: any) {
      showToast.error(err?.response?.data?.message || 'Thao tác thất bại');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReceiveOrder = async (po: PurchaseOrder) => {
    setActionLoading(true);
    try {
      // Tự động nhận toàn bộ số lượng theo đơn
      const payload = {
        received_date: new Date().toISOString(),
        note: `Nhận hàng tự động theo đơn đặt hàng ${po.code}`,
        items: (po.items || []).map((i) => ({
          product_id: i.product_id,
          received_quantity: Number(i.quantity),
        })),
      };

      await purchaseOrdersService.receive(po.id, payload);
      showToast.success('Đã nhận hàng thành công và tự động tạo phiếu Nhập kho!');
      fetchOrders();
      setActiveOrder(null);
    } catch (err: any) {
      showToast.error(err?.response?.data?.message || 'Lỗi khi nhận hàng vào kho');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancelOrder = async (id: string) => {
    if (!window.confirm('Bạn có chắc chắn muốn hủy đơn đặt hàng này không?')) return;
    setActionLoading(true);
    try {
      await purchaseOrdersService.cancel(id, 'Hủy theo yêu cầu của quản lý');
      showToast.success('Đã hủy đơn đặt hàng');
      fetchOrders();
      if (activeOrder && activeOrder.id === id) {
        const updated = await purchaseOrdersService.getOne(id);
        setActiveOrder(updated);
      }
    } catch (err: any) {
      showToast.error(err?.response?.data?.message || 'Lỗi khi hủy đơn');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteOrder = async (id: string) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa vĩnh viễn đơn đặt hàng này?')) return;
    setActionLoading(true);
    try {
      await purchaseOrdersService.delete(id);
      showToast.success('Đã xóa đơn đặt hàng');
      fetchOrders();
      setActiveOrder(null);
    } catch (err: any) {
      showToast.error(err?.response?.data?.message || 'Không thể xóa đơn');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 px-4 sm:px-6 lg:px-8 py-5 max-w-[1600px] w-full mx-auto space-y-4">
      {/* 1. HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#EE3D43] to-rose-500 text-white flex items-center justify-center shadow-xs">
              <ShoppingCart className="w-5 h-5" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Đơn đặt hàng nhà cung cấp (PO)
            </h1>
          </div>
          <p className="text-sm font-semibold text-slate-600 mt-1">
            Quản lý chuỗi cung ứng, phê duyệt đơn mua và tự động sinh phiếu nhập kho
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={() => fetchOrders()}
            disabled={loading}
            className="p-2.5 text-slate-600 hover:text-slate-900 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer"
            title="Làm mới dữ liệu"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#EE3D43] hover:bg-[#D9343A] text-white rounded-xl text-sm font-bold shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Tạo đơn đặt hàng (PO)</span>
          </button>
        </div>
      </div>

      {/* 2. FILTER TOOLBAR */}
      <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 flex-wrap flex-1">
          {/* Search */}
          <div className="relative min-w-[240px] max-w-sm flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Tìm theo mã đơn PO, ghi chú..."
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#EE3D43]/20 focus:border-[#EE3D43] transition-all"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value as any);
              setPage(1);
            }}
            className="px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#EE3D43]/20 transition-all cursor-pointer"
          >
            <option value="ALL">Tất cả trạng thái</option>
            <option value="DRAFT">Bản nháp</option>
            <option value="PENDING_APPROVAL">Chờ duyệt</option>
            <option value="APPROVED">Đã duyệt</option>
            <option value="ORDERED">Đã đặt hàng</option>
            <option value="RECEIVED">Đã nhập kho</option>
            <option value="CANCELLED">Đã hủy</option>
          </select>

          {/* Warehouse Filter */}
          <select
            value={warehouseFilter}
            onChange={(e) => {
              setWarehouseFilter(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#EE3D43]/20 transition-all cursor-pointer"
          >
            <option value="">Tất cả kho nhận</option>
            {warehouses.map((w) => (
              <option key={w.id} value={w.id}>
                {w.name}
              </option>
            ))}
          </select>
        </div>

        <div className="text-sm font-semibold text-slate-600">
          Tổng cộng: <strong className="text-slate-900">{total}</strong> đơn đặt hàng
        </div>
      </div>

      {/* 3. TABLE */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden flex-1 flex flex-col justify-between">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-800">
            <thead className="bg-slate-100 text-xs font-bold text-slate-700 uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="px-4 py-3">Mã đơn PO</th>
                <th className="px-4 py-3">Nhà cung cấp</th>
                <th className="px-4 py-3">Kho nhận</th>
                <th className="px-4 py-3 text-center">Số mặt hàng</th>
                <th className="px-4 py-3 text-right">Tổng giá trị</th>
                <th className="px-4 py-3">Ngày giao dự kiến</th>
                <th className="px-4 py-3 text-center">Trạng thái</th>
                <th className="px-4 py-3 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {loading ? (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-slate-500 font-medium">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-[#EE3D43]" />
                    Đang nạp danh sách đơn đặt hàng...
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-slate-500 font-medium">
                    <ShoppingCart className="w-8 h-8 mx-auto mb-2 opacity-40 text-slate-400" />
                    Chưa có đơn đặt hàng nào phù hợp với bộ lọc
                  </td>
                </tr>
              ) : (
                orders.map((po) => {
                  const meta = STATUS_META[po.status] || STATUS_META.DRAFT;
                  const itemCount = po.items?.length || 0;

                  return (
                    <tr
                      key={po.id}
                      onClick={() => setActiveOrder(po)}
                      className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                    >
                      <td className="px-4 py-3.5 font-mono font-bold text-slate-900 group-hover:text-[#EE3D43] transition-colors">
                        {po.code}
                      </td>
                      <td className="px-4 py-3.5 font-semibold text-slate-800">
                        {po.supplier?.name || 'Chưa xác định'}
                      </td>
                      <td className="px-4 py-3.5 text-slate-700 font-medium">
                        {po.warehouse?.name || 'Kho tổng'}
                      </td>
                      <td className="px-4 py-3.5 text-center font-bold text-slate-800 font-mono">
                        {itemCount} món
                      </td>
                      <td className="px-4 py-3.5 text-right font-mono font-bold text-slate-900">
                        {formatCurrency(Number(po.total_amount || 0))}
                      </td>
                      <td className="px-4 py-3.5 text-slate-600 font-medium">
                        {po.expected_delivery_date
                          ? new Date(po.expected_delivery_date).toLocaleDateString('vi-VN')
                          : '—'}
                      </td>
                      <td className="px-4 py-3.5 text-center">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${meta.badgeClass}`}
                        >
                          {meta.icon}
                          {meta.label}
                        </span>
                      </td>
                      <td
                        className="px-4 py-3.5 text-right"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => setActiveOrder(po)}
                            className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                            title="Xem chi tiết"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {/* Quick Workflow Action Button */}
                          {po.status === 'DRAFT' && (
                            <button
                              type="button"
                              onClick={() => handleSubmitForApproval(po.id)}
                              className="px-2.5 py-1 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-xs font-bold transition-all shadow-2xs"
                              title="Gửi duyệt đơn"
                            >
                              Gửi duyệt
                            </button>
                          )}

                          {po.status === 'PENDING_APPROVAL' && isManagerOrAdmin && (
                            <button
                              type="button"
                              onClick={() => handleApprove(po.id)}
                              className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-all shadow-2xs"
                              title="Phê duyệt đơn hàng"
                            >
                              Duyệt
                            </button>
                          )}

                          {po.status === 'APPROVED' && isManagerOrAdmin && (
                            <button
                              type="button"
                              onClick={() => handleMarkAsOrdered(po.id)}
                              className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition-all shadow-2xs"
                              title="Đánh dấu đã đặt hàng"
                            >
                              Đặt hàng
                            </button>
                          )}

                          {po.status === 'ORDERED' && (
                            <button
                              type="button"
                              onClick={() => handleReceiveOrder(po)}
                              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-all shadow-2xs"
                              title="Nhận hàng và tự động nhập kho"
                            >
                              Nhận hàng
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="p-4 border-t border-slate-200 flex items-center justify-between text-sm text-slate-600">
          <span>
            Trang <strong>{page}</strong> / {Math.ceil(total / limit) || 1}
          </span>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="p-1.5 rounded-lg border border-slate-300 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setPage((p) => p + 1)}
              disabled={page * limit >= total}
              className="p-1.5 rounded-lg border border-slate-300 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================
          MODAL: TẠO ĐƠN ĐẶT HÀNG (PO) MỚI
         ======================================================== */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#EE3D43] text-white flex items-center justify-center">
                  <ShoppingCart className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900">
                    Khởi tạo đơn đặt hàng mới (PO)
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    Đặt hàng nhà cung cấp và theo dõi lộ trình giao hàng
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateOrder} className="flex-1 flex flex-col overflow-hidden">
              <div className="p-6 space-y-4 overflow-y-auto custom-scrollbar flex-1 text-sm">
                {/* NCC & Kho nhận */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                      Nhà cung cấp <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={formSupplierId}
                      onChange={(e) => setFormSupplierId(e.target.value)}
                      required
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-semibold text-slate-800"
                    >
                      {suppliers.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name} ({s.code || 'NCC'})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                      Kho nhận hàng <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={formWarehouseId}
                      onChange={(e) => setFormWarehouseId(e.target.value)}
                      required
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-semibold text-slate-800"
                    >
                      {warehouses.map((w) => (
                        <option key={w.id} value={w.id}>
                          {w.name} ({w.code})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Ngày giao dự kiến & Ghi chú */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                      Ngày dự kiến giao hàng
                    </label>
                    <input
                      type="date"
                      value={formExpectedDate}
                      onChange={(e) => setFormExpectedDate(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-medium text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                      Ghi chú đơn hàng
                    </label>
                    <input
                      type="text"
                      value={formNote}
                      onChange={(e) => setFormNote(e.target.value)}
                      placeholder="Ghi chú điều khoản giao hàng..."
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-medium text-slate-800"
                    />
                  </div>
                </div>

                {/* Bảng danh sách mặt hàng đặt */}
                <div className="pt-2">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Danh sách sản phẩm đặt mua ({formItems.length} mặt hàng)
                    </span>
                    <button
                      type="button"
                      onClick={handleAddItemRow}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-[#EE3D43] hover:underline cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                      <span>Thêm dòng sản phẩm</span>
                    </button>
                  </div>

                  <div className="border border-slate-200 rounded-xl overflow-hidden">
                    <table className="w-full text-xs text-slate-800">
                      <thead className="bg-slate-100 font-bold text-slate-700 uppercase">
                        <tr>
                          <th className="p-2.5 text-left">Sản phẩm</th>
                          <th className="p-2.5 text-right w-24">Số lượng</th>
                          <th className="p-2.5 text-right w-32">Đơn giá (VND)</th>
                          <th className="p-2.5 text-right w-36">Thành tiền</th>
                          <th className="p-2.5 text-center w-12">Xóa</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        {formItems.map((item, idx) => {
                          const lineTotal = (item.quantity || 0) * (item.unit_price || 0);
                          return (
                            <tr key={idx} className="hover:bg-slate-50">
                              <td className="p-2">
                                <select
                                  value={item.product_id}
                                  onChange={(e) =>
                                    handleItemChange(idx, 'product_id', e.target.value)
                                  }
                                  required
                                  className="w-full p-1.5 bg-white border border-slate-300 rounded-lg font-medium text-slate-800"
                                >
                                  <option value="">-- Chọn sản phẩm --</option>
                                  {products.map((p) => (
                                    <option key={p.id} value={p.id}>
                                      {p.sku} - {p.name}
                                    </option>
                                  ))}
                                </select>
                              </td>
                              <td className="p-2 text-right">
                                <input
                                  type="number"
                                  min="1"
                                  value={item.quantity}
                                  onChange={(e) =>
                                    handleItemChange(idx, 'quantity', Number(e.target.value))
                                  }
                                  required
                                  className="w-full p-1.5 bg-white border border-slate-300 rounded-lg text-right font-mono font-bold"
                                />
                              </td>
                              <td className="p-2 text-right">
                                <input
                                  type="number"
                                  min="0"
                                  step="1000"
                                  value={item.unit_price}
                                  onChange={(e) =>
                                    handleItemChange(idx, 'unit_price', Number(e.target.value))
                                  }
                                  className="w-full p-1.5 bg-white border border-slate-300 rounded-lg text-right font-mono font-bold"
                                />
                              </td>
                              <td className="p-2 text-right font-mono font-bold text-slate-900">
                                {formatCurrency(lineTotal)}
                              </td>
                              <td className="p-2 text-center">
                                <button
                                  type="button"
                                  onClick={() => handleRemoveItemRow(idx)}
                                  disabled={formItems.length <= 1}
                                  className="p-1 text-slate-400 hover:text-rose-600 disabled:opacity-30 cursor-pointer"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                      <tfoot>
                        <tr className="bg-slate-50 font-bold text-slate-900 border-t border-slate-200">
                          <td colSpan={3} className="p-2.5 text-right uppercase">
                            Tổng giá trị đơn:
                          </td>
                          <td className="p-2.5 text-right font-mono text-[#EE3D43] text-sm">
                            {formatCurrency(formTotalAmount)}
                          </td>
                          <td />
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>
              </div>

              <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
                <span className="text-xs text-slate-500 font-medium">
                  Đơn tạo mới sẽ ở trạng thái <strong>Bản nháp</strong>
                </span>
                <div className="flex items-center gap-2.5">
                  <button
                    type="button"
                    onClick={() => setIsCreateModalOpen(false)}
                    className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-100"
                  >
                    Hủy bỏ
                  </button>
                  <button
                    type="submit"
                    disabled={actionLoading}
                    className="px-5 py-2 bg-[#EE3D43] hover:bg-[#D9343A] text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer disabled:opacity-50"
                  >
                    {actionLoading ? 'Đang tạo đơn...' : 'Tạo đơn đặt hàng'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================
          DRAWER: CHI TIẾT ĐƠN ĐẶT HÀNG & THAO TÁC WORKFLOW
         ======================================================== */}
      {activeOrder && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="fixed inset-0" onClick={() => setActiveOrder(null)} />

          <div className="relative z-10 w-full max-w-2xl bg-white h-full shadow-2xl border-l border-slate-200 flex flex-col justify-between animate-in slide-in-from-right duration-200">
            {/* Header */}
            <div className="px-6 py-5 border-b border-slate-200 flex items-start justify-between bg-slate-50">
              <div className="space-y-1">
                <div className="flex items-center gap-2.5">
                  <span className="font-mono text-base font-bold text-slate-900 bg-white px-2.5 py-0.5 rounded border border-slate-300">
                    {activeOrder.code}
                  </span>
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                      STATUS_META[activeOrder.status]?.badgeClass
                    }`}
                  >
                    {STATUS_META[activeOrder.status]?.icon}
                    {STATUS_META[activeOrder.status]?.label}
                  </span>
                </div>
                <p className="text-xs text-slate-500 font-medium">
                  Thời gian tạo: {new Date(activeOrder.created_at).toLocaleString('vi-VN')}
                </p>
              </div>

              <button
                onClick={() => setActiveOrder(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-3.5">
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                  <div className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1.5">
                    <Truck className="w-3.5 h-3.5" /> Nhà cung cấp
                  </div>
                  <div className="font-bold text-slate-900">{activeOrder.supplier?.name}</div>
                  <div className="text-xs text-slate-600 font-mono">
                    SĐT: {activeOrder.supplier?.phone || 'N/A'}
                  </div>
                </div>

                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                  <div className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5" /> Kho nhận hàng
                  </div>
                  <div className="font-bold text-slate-900">{activeOrder.warehouse?.name}</div>
                  <div className="text-xs text-slate-600">
                    Địa chỉ: {activeOrder.warehouse?.address || 'Hà Nội'}
                  </div>
                </div>
              </div>

              {activeOrder.note && (
                <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900">
                  <strong>Ghi chú:</strong> {activeOrder.note}
                </div>
              )}

              {/* Bảng sản phẩm */}
              <div>
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Danh mục hàng hóa đặt mua
                </h4>
                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <table className="w-full text-xs text-slate-800">
                    <thead className="bg-slate-100 font-bold text-slate-700 uppercase">
                      <tr>
                        <th className="p-2.5 text-left">SKU & Tên</th>
                        <th className="p-2.5 text-right w-20">SL đặt</th>
                        <th className="p-2.5 text-right w-28">Đơn giá</th>
                        <th className="p-2.5 text-right w-32">Thành tiền</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {(activeOrder.items || []).map((it, idx) => (
                        <tr key={idx} className="hover:bg-slate-50">
                          <td className="p-2.5">
                            <span className="font-mono font-bold text-slate-900">
                              {it.product?.sku}
                            </span>
                            <div className="text-slate-600 truncate max-w-[220px]">
                              {it.product?.name}
                            </div>
                          </td>
                          <td className="p-2.5 text-right font-mono font-bold">{it.quantity}</td>
                          <td className="p-2.5 text-right font-mono">
                            {formatCurrency(Number(it.unit_price || 0))}
                          </td>
                          <td className="p-2.5 text-right font-mono font-bold text-slate-900">
                            {formatCurrency(
                              (Number(it.quantity) || 0) * (Number(it.unit_price) || 0)
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="bg-slate-50 font-bold text-slate-900 border-t border-slate-200">
                        <td colSpan={3} className="p-2.5 text-right uppercase">
                          Tổng cộng:
                        </td>
                        <td className="p-2.5 text-right font-mono text-[#EE3D43] text-sm">
                          {formatCurrency(Number(activeOrder.total_amount || 0))}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            </div>

            {/* Workflow Action Buttons Footer */}
            <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                {activeOrder.status === 'DRAFT' && (
                  <button
                    onClick={() => handleDeleteOrder(activeOrder.id)}
                    className="p-2 text-rose-600 hover:bg-rose-50 rounded-xl border border-rose-200 text-xs font-bold"
                    title="Xóa đơn nháp"
                  >
                    Xóa đơn
                  </button>
                )}
                {activeOrder.status !== 'RECEIVED' && activeOrder.status !== 'CANCELLED' && (
                  <button
                    onClick={() => handleCancelOrder(activeOrder.id)}
                    className="px-3 py-2 text-slate-600 hover:bg-slate-200 rounded-xl text-xs font-bold"
                  >
                    Hủy đơn
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2.5">
                {activeOrder.status === 'DRAFT' && (
                  <button
                    onClick={() => handleSubmitForApproval(activeOrder.id)}
                    disabled={actionLoading}
                    className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-1.5"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Gửi duyệt đơn</span>
                  </button>
                )}

                {activeOrder.status === 'PENDING_APPROVAL' && isManagerOrAdmin && (
                  <button
                    onClick={() => handleApprove(activeOrder.id)}
                    disabled={actionLoading}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Phê duyệt đơn</span>
                  </button>
                )}

                {activeOrder.status === 'APPROVED' && isManagerOrAdmin && (
                  <button
                    onClick={() => handleMarkAsOrdered(activeOrder.id)}
                    disabled={actionLoading}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-1.5"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Đánh dấu đã đặt hàng</span>
                  </button>
                )}

                {activeOrder.status === 'ORDERED' && (
                  <button
                    onClick={() => handleReceiveOrder(activeOrder)}
                    disabled={actionLoading}
                    className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-1.5"
                  >
                    <PackageCheck className="w-4 h-4" />
                    <span>Nhận hàng vào kho</span>
                  </button>
                )}

                <button
                  onClick={() => setActiveOrder(null)}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
