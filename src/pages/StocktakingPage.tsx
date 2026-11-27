import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  ClipboardCheck,
  Search,
  Plus,
  RefreshCw,
  Building2,
  CheckCircle2,
  Clock,
  Ban,
  Trash2,
  X,
  Eye,
  Save,
  Loader2,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  Filter,
  FileCheck2,
} from 'lucide-react';
import {
  StocktakingSession,
  StocktakingStatus,
  UpdateStocktakingCountItem,
} from '../types/stocktaking.types';
import { Warehouse } from '../types/warehouse.types';
import { stocktakingService } from '../services/stocktaking.service';
import { warehousesService } from '../services/warehouses.service';
import { useAuthStore } from '../stores/auth.store';
import { showToast } from '../utils/toast.util';

const STATUS_META: Record<
  StocktakingStatus,
  { label: string; badgeClass: string; icon: React.ReactNode }
> = {
  IN_PROGRESS: {
    label: 'Đang kiểm kê',
    badgeClass: 'bg-amber-100 text-amber-800 border-amber-300',
    icon: <Clock className="w-3.5 h-3.5 text-amber-600" />,
  },
  COMPLETED: {
    label: 'Đã chốt cân bằng',
    badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    icon: <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />,
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

interface LocalCountDraft {
  counted_quantity: number;
  note: string;
}

export const StocktakingPage: React.FC = () => {
  const { user } = useAuthStore();
  const isManagerOrAdmin = user?.role === 'ADMIN' || user?.role === 'MANAGER';

  // Data state
  const [sessions, setSessions] = useState<StocktakingSession[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);

  // Filters & Pagination
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | StocktakingStatus>('ALL');
  const [warehouseFilter, setWarehouseFilter] = useState('');
  const [page, setPage] = useState(1);
  const limit = 10;

  // Create Modal state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [formWarehouseId, setFormWarehouseId] = useState('');
  const [formTitle, setFormTitle] = useState('');
  const [formCode, setFormCode] = useState('');
  const [formNote, setFormNote] = useState('');
  const [creating, setCreating] = useState(false);

  // Detail & Counting Drawer state
  const [activeSession, setActiveSession] = useState<StocktakingSession | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [countDrafts, setCountDrafts] = useState<Record<string, LocalCountDraft>>({});
  const [itemSearch, setItemSearch] = useState('');
  const [onlyDiscrepant, setOnlyDiscrepant] = useState(false);
  const [savingCounts, setSavingCounts] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  // Confirm Dialog state
  const [confirmAction, setConfirmAction] = useState<{
    type: 'complete' | 'cancel' | 'delete';
    session: StocktakingSession;
  } | null>(null);

  // Load warehouses
  useEffect(() => {
    const loadWarehouses = async () => {
      try {
        const res: any = await warehousesService.getAll({ limit: 100 });
        const list = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
        setWarehouses(list);
        if (list.length > 0) {
          setFormWarehouseId(list[0].id);
        }
      } catch (err) {
        console.error('Lỗi tải danh sách kho:', err);
      }
    };
    loadWarehouses();
  }, []);

  // Fetch sessions
  const fetchSessions = useCallback(async () => {
    setLoading(true);
    try {
      const res = await stocktakingService.getAll({
        page,
        limit,
        search: search.trim() || undefined,
        status: statusFilter === 'ALL' ? undefined : statusFilter,
        warehouse_id: warehouseFilter || undefined,
      });
      setSessions(res.data || []);
      setTotal(res.meta?.total || 0);
    } catch (err) {
      console.error('Lỗi tải danh sách kiểm kê:', err);
      showToast.error('Không thể tải danh sách đợt kiểm kê kho');
    } finally {
      setLoading(false);
    }
  }, [page, limit, search, statusFilter, warehouseFilter]);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  useEffect(() => {
    setPage(1);
  }, [search, statusFilter, warehouseFilter]);

  const totalPages = useMemo(() => Math.max(1, Math.ceil(total / limit)), [total, limit]);

  // Open detail drawer & initialize editable drafts
  const openSessionDetail = async (session: StocktakingSession) => {
    setActiveSession(session);
    setItemSearch('');
    setOnlyDiscrepant(false);
    setLoadingDetail(true);
    try {
      const full = await stocktakingService.getById(session.id);
      setActiveSession(full);
      const drafts: Record<string, LocalCountDraft> = {};
      (full.items || []).forEach((item) => {
        drafts[item.id] = {
          counted_quantity: item.counted_quantity ?? item.system_quantity ?? 0,
          note: item.note || '',
        };
      });
      setCountDrafts(drafts);
    } catch (err) {
      console.error('Lỗi tải chi tiết kiểm kê:', err);
      showToast.error('Không thể tải chi tiết đợt kiểm kê');
    } finally {
      setLoadingDetail(false);
    }
  };

  // Create new session
  const handleCreateSession = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formWarehouseId) {
      showToast.error('Vui lòng chọn kho hàng cần kiểm kê');
      return;
    }
    if (!formTitle.trim()) {
      showToast.error('Vui lòng nhập tiêu đề đợt kiểm kê');
      return;
    }

    setCreating(true);
    try {
      const created = await stocktakingService.create({
        warehouse_id: formWarehouseId,
        title: formTitle.trim(),
        code: formCode.trim() || undefined,
        note: formNote.trim() || undefined,
      });
      showToast.success(`Đã mở đợt kiểm kê "${created.code}" thành công`);
      setIsCreateModalOpen(false);
      setFormTitle('');
      setFormCode('');
      setFormNote('');
      await fetchSessions();
      if (created?.id) {
        openSessionDetail(created);
      }
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Không thể khởi tạo đợt kiểm kê';
      showToast.error(Array.isArray(msg) ? msg.join(', ') : msg);
    } finally {
      setCreating(false);
    }
  };

  // Check if local drafts differ from saved session items
  const hasUnsavedChanges = useMemo(() => {
    if (!activeSession || activeSession.status !== 'IN_PROGRESS') return false;
    return (activeSession.items || []).some((item) => {
      const draft = countDrafts[item.id];
      if (!draft) return false;
      const savedQty = item.counted_quantity ?? item.system_quantity ?? 0;
      const savedNote = item.note || '';
      return draft.counted_quantity !== savedQty || draft.note !== savedNote;
    });
  }, [activeSession, countDrafts]);

  // Save updated counts
  const handleSaveCounts = async () => {
    if (!activeSession || !activeSession.items?.length) return;

    const changedItems: UpdateStocktakingCountItem[] = activeSession.items
      .map((item) => {
        const draft = countDrafts[item.id];
        return {
          item_id: item.id,
          counted_quantity: Math.max(0, Number(draft?.counted_quantity ?? item.system_quantity ?? 0)),
          note: draft?.note?.trim() || '',
        };
      });

    if (changedItems.length === 0) return;

    setSavingCounts(true);
    try {
      const updated = await stocktakingService.updateCounts(activeSession.id, {
        items: changedItems,
      });
      setActiveSession(updated);
      const nextDrafts: Record<string, LocalCountDraft> = {};
      (updated.items || []).forEach((item) => {
        nextDrafts[item.id] = {
          counted_quantity: item.counted_quantity ?? item.system_quantity ?? 0,
          note: item.note || '',
        };
      });
      setCountDrafts(nextDrafts);
      showToast.success('Đã lưu số liệu kiểm đếm thực tế');
      fetchSessions();
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Không thể lưu số liệu kiểm đếm';
      showToast.error(Array.isArray(msg) ? msg.join(', ') : msg);
    } finally {
      setSavingCounts(false);
    }
  };

  // Execute confirmed workflow action (complete / cancel / delete)
  const executeConfirmAction = async () => {
    if (!confirmAction) return;
    setActionLoading(true);
    try {
      const { type, session } = confirmAction;
      if (type === 'complete') {
        // Save pending count changes first if user edited counts before clicking complete
        if (hasUnsavedChanges && activeSession?.id === session.id) {
          const itemsPayload: UpdateStocktakingCountItem[] = (activeSession.items || []).map(
            (item) => {
              const draft = countDrafts[item.id];
              return {
                item_id: item.id,
                counted_quantity: Math.max(
                  0,
                  Number(draft?.counted_quantity ?? item.system_quantity ?? 0)
                ),
                note: draft?.note?.trim() || '',
              };
            }
          );
          if (itemsPayload.length > 0) {
            await stocktakingService.updateCounts(session.id, { items: itemsPayload });
          }
        }
        const completed = await stocktakingService.complete(session.id);
        showToast.success(`Đã chốt đợt kiểm kê ${completed.code} và cân bằng tồn kho`);
        if (activeSession?.id === session.id) {
          setActiveSession(completed);
        }
      } else if (type === 'cancel') {
        const cancelled = await stocktakingService.cancel(session.id);
        showToast.success(`Đã hủy đợt kiểm kê ${cancelled.code}`);
        if (activeSession?.id === session.id) {
          setActiveSession(cancelled);
        }
      } else if (type === 'delete') {
        await stocktakingService.delete(session.id);
        showToast.success(`Đã xóa đợt kiểm kê ${session.code}`);
        if (activeSession?.id === session.id) {
          setActiveSession(null);
        }
      }
      setConfirmAction(null);
      fetchSessions();
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Thao tác thất bại';
      showToast.error(Array.isArray(msg) ? msg.join(', ') : msg);
    } finally {
      setActionLoading(false);
    }
  };

  // Live computed totals for active session drawer
  const liveSummary = useMemo(() => {
    if (!activeSession?.items) {
      return {
        systemQty: activeSession?.total_system_quantity || 0,
        countedQty: activeSession?.total_counted_quantity || 0,
        diffQty: activeSession?.total_diff_quantity || 0,
        diffAmount: activeSession?.total_diff_amount || 0,
        discrepantCount: 0,
      };
    }

    let systemQty = 0;
    let countedQty = 0;
    let diffQty = 0;
    let diffAmount = 0;
    let discrepantCount = 0;

    activeSession.items.forEach((item) => {
      const sys = Number(item.system_quantity || 0);
      const draft = countDrafts[item.id];
      const cnt =
        activeSession.status === 'IN_PROGRESS' && draft
          ? Number(draft.counted_quantity || 0)
          : Number(item.counted_quantity ?? sys);
      const diff = cnt - sys;
      const amt = diff * Number(item.unit_cost || 0);

      systemQty += sys;
      countedQty += cnt;
      diffQty += diff;
      diffAmount += amt;
      if (diff !== 0) discrepantCount += 1;
    });

    return { systemQty, countedQty, diffQty, diffAmount, discrepantCount };
  }, [activeSession, countDrafts]);

  // Filtered items in drawer
  const filteredDrawerItems = useMemo(() => {
    if (!activeSession?.items) return [];
    const q = itemSearch.trim().toLowerCase();
    return activeSession.items.filter((item) => {
      const sys = Number(item.system_quantity || 0);
      const draft = countDrafts[item.id];
      const cnt =
        activeSession.status === 'IN_PROGRESS' && draft
          ? Number(draft.counted_quantity || 0)
          : Number(item.counted_quantity ?? sys);
      const diff = cnt - sys;

      if (onlyDiscrepant && diff === 0) return false;
      if (!q) return true;
      return (
        (item.product?.name || '').toLowerCase().includes(q) ||
        (item.product?.sku || '').toLowerCase().includes(q) ||
        (item.location?.code || '').toLowerCase().includes(q) ||
        (item.location?.name || '').toLowerCase().includes(q)
      );
    });
  }, [activeSession, countDrafts, itemSearch, onlyDiscrepant]);

  return (
    <div className="flex-1 flex flex-col min-h-0 px-4 sm:px-6 lg:px-8 py-4 max-w-[1600px] w-full mx-auto space-y-3.5">
      {/* HEADER */}
      <div className="shrink-0 flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Kiểm kê kho (Stocktaking)
            </h1>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
              {total} đợt kiểm kê
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Khởi tạo phiên kiểm kê, đối chiếu tồn thực tế với hệ thống và tự động sinh phiếu cân bằng kho
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={fetchSessions}
            disabled={loading}
            className="p-2 text-slate-600 hover:text-slate-900 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
            title="Làm mới danh sách"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          {isManagerOrAdmin && (
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#294238] hover:bg-[#20372e] text-white rounded-lg text-xs sm:text-sm font-semibold transition-colors cursor-pointer shadow-xs"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Mở đợt kiểm kê</span>
            </button>
          )}
        </div>
      </div>

      {/* FILTER TOOLBAR */}
      <div className="shrink-0 bg-white rounded-xl border border-slate-200 p-3 flex flex-wrap items-center justify-between gap-2.5 shadow-2xs">
        <div className="flex items-center gap-2.5 flex-wrap flex-1">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm mã phiên, tiêu đề, tên kho..."
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-slate-400"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 focus:outline-none cursor-pointer"
          >
            <option value="ALL">Tất cả trạng thái</option>
            <option value="IN_PROGRESS">Đang kiểm kê</option>
            <option value="COMPLETED">Đã chốt cân bằng</option>
            <option value="CANCELLED">Đã hủy</option>
          </select>

          <select
            value={warehouseFilter}
            onChange={(e) => setWarehouseFilter(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 focus:outline-none cursor-pointer"
          >
            <option value="">Tất cả kho hàng</option>
            {warehouses.map((w) => (
              <option key={w.id} value={w.id}>
                {w.name} ({w.code})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* TABLE CONTAINER */}
      <div className="flex-1 min-h-[420px] bg-white rounded-xl border border-slate-200 shadow-2xs flex flex-col overflow-hidden">
        <div className="flex-1 overflow-auto custom-scrollbar">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400 gap-2">
              <Loader2 className="w-7 h-7 animate-spin text-[#294238]" />
              <span className="text-xs font-medium">Đang tải danh sách đợt kiểm kê...</span>
            </div>
          ) : sessions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400 gap-2 px-4 text-center">
              <ClipboardCheck className="w-10 h-10 text-slate-300 stroke-1.5" />
              <div className="text-sm font-semibold text-slate-600">Chưa có đợt kiểm kê nào</div>
              <p className="text-xs text-slate-400 max-w-md">
                Nhấn &ldquo;Mở đợt kiểm kê&rdquo; để chụp snapshot tồn kho hiện tại và bắt đầu đối chiếu số lượng thực tế.
              </p>
            </div>
          ) : (
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider sticky top-0 z-10">
                <tr>
                  <th className="px-4 py-3">Mã / Tiêu đề</th>
                  <th className="px-4 py-3">Kho hàng</th>
                  <th className="px-4 py-3 text-center">Trạng thái</th>
                  <th className="px-4 py-3 text-right">Tồn HT / Thực đếm</th>
                  <th className="px-4 py-3 text-right">Chênh lệch</th>
                  <th className="px-4 py-3">Người tạo / Thời gian</th>
                  <th className="px-4 py-3 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {sessions.map((s) => {
                  const meta = STATUS_META[s.status] || STATUS_META.IN_PROGRESS;
                  const diffQty = Number(s.total_diff_quantity || 0);
                  const diffAmt = Number(s.total_diff_amount || 0);
                  return (
                    <tr
                      key={s.id}
                      onClick={() => openSessionDetail(s)}
                      className="hover:bg-slate-50/80 transition-colors cursor-pointer"
                    >
                      <td className="px-4 py-3">
                        <div className="font-mono font-bold text-slate-900">{s.code}</div>
                        <div className="font-medium text-slate-700 truncate max-w-[260px] mt-0.5">
                          {s.title}
                        </div>
                        {s.adjustment_transaction?.reference_no && (
                          <div className="text-[11px] text-emerald-700 font-mono mt-0.5">
                            Phiếu cân bằng: {s.adjustment_transaction.reference_no}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="inline-flex items-center gap-1.5 font-semibold text-slate-800">
                          <Building2 className="w-3.5 h-3.5 text-slate-400" />
                          <span>{s.warehouse?.name || '—'}</span>
                        </div>
                        {s.warehouse?.code && (
                          <div className="text-[11px] font-mono text-slate-400 ml-5">
                            {s.warehouse.code}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full border text-[11px] font-bold ${meta.badgeClass}`}
                        >
                          {meta.icon}
                          {meta.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right font-mono">
                        <span className="text-slate-500">
                          {Number(s.total_system_quantity || 0).toLocaleString('vi-VN')}
                        </span>
                        <span className="mx-1 text-slate-300">/</span>
                        <span className="font-bold text-slate-900">
                          {Number(s.total_counted_quantity || 0).toLocaleString('vi-VN')}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right font-mono">
                        <div
                          className={`font-bold ${
                            diffQty > 0
                              ? 'text-emerald-600'
                              : diffQty < 0
                              ? 'text-rose-600'
                              : 'text-slate-500'
                          }`}
                        >
                          {diffQty > 0 ? `+${diffQty.toLocaleString('vi-VN')}` : diffQty.toLocaleString('vi-VN')}
                        </div>
                        <div className="text-[11px] text-slate-500">{formatCurrency(diffAmt)}</div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-semibold text-slate-800">
                          {s.creator?.display_name || s.creator?.username || '—'}
                        </div>
                        <div className="text-[11px] text-slate-400">
                          {new Date(s.created_at).toLocaleString('vi-VN')}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="inline-flex items-center gap-1">
                          <button
                            onClick={() => openSessionDetail(s)}
                            className="p-1.5 text-slate-600 hover:text-[#294238] hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                            title="Xem & Nhập số lượng kiểm đếm"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          {isManagerOrAdmin && s.status !== 'COMPLETED' && (
                            <button
                              onClick={() => setConfirmAction({ type: 'delete', session: s })}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                              title="Xóa đợt kiểm kê"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* PAGINATION */}
        <div className="shrink-0 px-4 py-2.5 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between text-xs text-slate-500">
          <span>
            Tổng cộng <strong className="text-slate-800">{total}</strong> đợt kiểm kê
          </span>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="p-1 rounded-md border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 cursor-pointer"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <span className="px-2 font-semibold text-slate-700">
              Trang {page} / {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="p-1 rounded-md border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 cursor-pointer"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* CREATE STOCKTAKING MODAL */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/60">
              <div className="flex items-center gap-2">
                <ClipboardCheck className="w-5 h-5 text-[#294238]" />
                <h3 className="text-sm font-bold text-slate-900">Khởi tạo đợt kiểm kê kho mới</h3>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateSession} className="p-6 space-y-4 text-xs">
              <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-200 text-emerald-800 leading-relaxed">
                Hệ thống sẽ tự động <strong>chụp snapshot tồn kho hiện tại</strong> của kho được chọn để làm số liệu đối chiếu.
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1.5">
                  Kho hàng cần kiểm kê <span className="text-rose-500">*</span>
                </label>
                <select
                  required
                  value={formWarehouseId}
                  onChange={(e) => setFormWarehouseId(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:bg-white focus:border-slate-400"
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
                <label className="block font-semibold text-slate-700 mb-1.5">
                  Tiêu đề đợt kiểm kê <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="VD: Kiểm kê định kỳ cuối tháng 11/2026"
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:bg-white focus:border-slate-400"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1.5">
                  Mã phiên kiểm kê (Tùy chọn)
                </label>
                <input
                  type="text"
                  value={formCode}
                  onChange={(e) => setFormCode(e.target.value)}
                  placeholder="Để trống để hệ thống tự sinh (VD: KK-20261127-XXXX)"
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono uppercase text-slate-800 focus:outline-none focus:bg-white focus:border-slate-400"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1.5">Ghi chú</label>
                <textarea
                  rows={2}
                  value={formNote}
                  onChange={(e) => setFormNote(e.target.value)}
                  placeholder="Ghi chú phạm vi hoặc nhân sự phụ trách kiểm đếm..."
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:bg-white focus:border-slate-400 resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#294238] hover:bg-[#20372e] text-white rounded-xl font-semibold cursor-pointer disabled:opacity-50"
                >
                  {creating && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Khởi tạo đợt kiểm kê</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DETAIL & COUNTING SLIDE-OVER DRAWER */}
      {activeSession && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div
            onClick={() => setActiveSession(null)}
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs"
          />
          <div className="fixed inset-y-0 right-0 pl-0 sm:pl-8 max-w-full flex">
            <div className="w-screen max-w-full sm:max-w-4xl lg:max-w-5xl bg-white shadow-2xl flex flex-col border-l border-slate-200">
              {/* Drawer Header */}
              <div className="px-6 py-4 border-b border-slate-200 bg-slate-50/70 flex items-start justify-between gap-4">
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-xs font-bold px-2.5 py-0.5 rounded-lg bg-slate-200/80 text-slate-800">
                      {activeSession.code}
                    </span>
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full border text-[11px] font-bold ${
                        (STATUS_META[activeSession.status] || STATUS_META.IN_PROGRESS).badgeClass
                      }`}
                    >
                      {(STATUS_META[activeSession.status] || STATUS_META.IN_PROGRESS).icon}
                      {(STATUS_META[activeSession.status] || STATUS_META.IN_PROGRESS).label}
                    </span>
                    {activeSession.warehouse && (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600">
                        <Building2 className="w-3.5 h-3.5 text-slate-400" />
                        {activeSession.warehouse.name}
                      </span>
                    )}
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 truncate">
                    {activeSession.title}
                  </h3>
                  {activeSession.note && (
                    <p className="text-xs text-slate-500">{activeSession.note}</p>
                  )}
                </div>

                <button
                  onClick={() => setActiveSession(null)}
                  className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-xl cursor-pointer shrink-0"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* KPI Summary Strip */}
              <div className="px-6 py-3 bg-white border-b border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80">
                  <div className="text-[11px] text-slate-500 font-semibold">Tổng tồn hệ thống</div>
                  <div className="text-base font-black font-mono text-slate-900 mt-0.5">
                    {liveSummary.systemQty.toLocaleString('vi-VN')}
                  </div>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80">
                  <div className="text-[11px] text-slate-500 font-semibold">Tổng thực đếm</div>
                  <div className="text-base font-black font-mono text-slate-900 mt-0.5">
                    {liveSummary.countedQty.toLocaleString('vi-VN')}
                  </div>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80">
                  <div className="text-[11px] text-slate-500 font-semibold">
                    Chênh lệch ({liveSummary.discrepantCount} dòng)
                  </div>
                  <div
                    className={`text-base font-black font-mono mt-0.5 ${
                      liveSummary.diffQty > 0
                        ? 'text-emerald-600'
                        : liveSummary.diffQty < 0
                        ? 'text-rose-600'
                        : 'text-slate-700'
                    }`}
                  >
                    {liveSummary.diffQty > 0
                      ? `+${liveSummary.diffQty.toLocaleString('vi-VN')}`
                      : liveSummary.diffQty.toLocaleString('vi-VN')}
                  </div>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80">
                  <div className="text-[11px] text-slate-500 font-semibold">Giá trị chênh lệch</div>
                  <div
                    className={`text-base font-black font-mono mt-0.5 ${
                      liveSummary.diffAmount > 0
                        ? 'text-emerald-600'
                        : liveSummary.diffAmount < 0
                        ? 'text-rose-600'
                        : 'text-slate-700'
                    }`}
                  >
                    {formatCurrency(liveSummary.diffAmount)}
                  </div>
                </div>
              </div>

              {/* Filter bar inside drawer */}
              <div className="px-6 py-2.5 bg-slate-50/50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs">
                <div className="relative w-full sm:w-72">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={itemSearch}
                    onChange={(e) => setItemSearch(e.target.value)}
                    placeholder="Lọc sản phẩm, mã SKU, vị trí kệ..."
                    className="w-full pl-8 pr-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-slate-400"
                  />
                </div>

                <label className="inline-flex items-center gap-2 cursor-pointer select-none font-semibold text-slate-700">
                  <input
                    type="checkbox"
                    checked={onlyDiscrepant}
                    onChange={(e) => setOnlyDiscrepant(e.target.checked)}
                    className="rounded border-slate-300 text-[#294238] focus:ring-[#294238]"
                  />
                  <Filter className="w-3.5 h-3.5 text-slate-400" />
                  <span>Chỉ hiện dòng có chênh lệch</span>
                </label>
              </div>

              {/* Items Table */}
              <div className="flex-1 overflow-auto custom-scrollbar">
                {loadingDetail ? (
                  <div className="flex items-center justify-center py-16 text-slate-400 gap-2">
                    <Loader2 className="w-6 h-6 animate-spin text-[#294238]" />
                    <span className="text-xs">Đang nạp danh sách mặt hàng kiểm kê...</span>
                  </div>
                ) : filteredDrawerItems.length === 0 ? (
                  <div className="text-center py-16 text-slate-400 text-xs">
                    Không có mặt hàng nào khớp bộ lọc.
                  </div>
                ) : (
                  <table className="w-full text-left text-xs text-slate-700">
                    <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider sticky top-0 z-10">
                      <tr>
                        <th className="px-4 py-2.5">Sản phẩm / SKU</th>
                        <th className="px-3 py-2.5">Vị trí kệ</th>
                        <th className="px-3 py-2.5 text-right">Tồn HT</th>
                        <th className="px-3 py-2.5 text-right w-32">Thực đếm</th>
                        <th className="px-3 py-2.5 text-right">Chênh lệch</th>
                        <th className="px-3 py-2.5 text-right">Thành tiền lệch</th>
                        <th className="px-4 py-2.5 w-48">Ghi chú</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredDrawerItems.map((item) => {
                        const isEditable = activeSession.status === 'IN_PROGRESS';
                        const draft = countDrafts[item.id];
                        const sysQty = Number(item.system_quantity || 0);
                        const countedQty =
                          isEditable && draft
                            ? Number(draft.counted_quantity ?? sysQty)
                            : Number(item.counted_quantity ?? sysQty);
                        const diff = countedQty - sysQty;
                        const diffAmt = diff * Number(item.unit_cost || 0);

                        return (
                          <tr
                            key={item.id}
                            className={
                              diff !== 0
                                ? diff < 0
                                  ? 'bg-rose-50/40'
                                  : 'bg-emerald-50/40'
                                : 'hover:bg-slate-50/60'
                            }
                          >
                            <td className="px-4 py-2.5">
                              <div className="font-semibold text-slate-900">
                                {item.product?.name || 'Sản phẩm'}
                              </div>
                              <div className="font-mono text-[11px] text-slate-500">
                                {item.product?.sku || '—'}
                                {item.product?.unit?.name ? ` · ${item.product.unit.name}` : ''}
                              </div>
                            </td>
                            <td className="px-3 py-2.5 font-mono text-[11px] text-slate-600">
                              {item.location ? `${item.location.code} (${item.location.name})` : 'Mặc định'}
                            </td>
                            <td className="px-3 py-2.5 text-right font-mono font-semibold text-slate-700">
                              {sysQty.toLocaleString('vi-VN')}
                            </td>
                            <td className="px-3 py-2.5 text-right">
                              {isEditable ? (
                                <input
                                  type="number"
                                  min={0}
                                  value={draft?.counted_quantity ?? sysQty}
                                  onChange={(e) => {
                                    const val = Math.max(0, parseInt(e.target.value || '0', 10) || 0);
                                    setCountDrafts((prev) => ({
                                      ...prev,
                                      [item.id]: {
                                        counted_quantity: val,
                                        note: prev[item.id]?.note ?? item.note ?? '',
                                      },
                                    }));
                                  }}
                                  className="w-24 px-2 py-1 text-right font-mono font-bold bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-[#294238]"
                                />
                              ) : (
                                <span className="font-mono font-bold text-slate-900">
                                  {countedQty.toLocaleString('vi-VN')}
                                </span>
                              )}
                            </td>
                            <td
                              className={`px-3 py-2.5 text-right font-mono font-bold ${
                                diff > 0
                                  ? 'text-emerald-600'
                                  : diff < 0
                                  ? 'text-rose-600'
                                  : 'text-slate-400'
                              }`}
                            >
                              {diff > 0 ? `+${diff.toLocaleString('vi-VN')}` : diff.toLocaleString('vi-VN')}
                            </td>
                            <td
                              className={`px-3 py-2.5 text-right font-mono font-semibold ${
                                diffAmt > 0
                                  ? 'text-emerald-600'
                                  : diffAmt < 0
                                  ? 'text-rose-600'
                                  : 'text-slate-400'
                              }`}
                            >
                              {formatCurrency(diffAmt)}
                            </td>
                            <td className="px-4 py-2.5">
                              {isEditable ? (
                                <input
                                  type="text"
                                  value={draft?.note ?? ''}
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    setCountDrafts((prev) => ({
                                      ...prev,
                                      [item.id]: {
                                        counted_quantity:
                                          prev[item.id]?.counted_quantity ?? sysQty,
                                        note: val,
                                      },
                                    }));
                                  }}
                                  placeholder="Lý do lệch..."
                                  className="w-full px-2 py-1 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-slate-400"
                                />
                              ) : (
                                <span className="text-slate-500">{item.note || '—'}</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
              </div>

              {/* Drawer Footer Actions */}
              <div className="px-6 py-3.5 border-t border-slate-200 bg-slate-50 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  {isManagerOrAdmin && activeSession.status === 'IN_PROGRESS' && (
                    <button
                      onClick={() =>
                        setConfirmAction({ type: 'cancel', session: activeSession })
                      }
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 border border-rose-200 bg-white rounded-xl cursor-pointer transition-colors"
                    >
                      <Ban className="w-3.5 h-3.5" />
                      <span>Hủy đợt kiểm kê</span>
                    </button>
                  )}
                  {activeSession.adjustment_transaction?.reference_no && (
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl">
                      <FileCheck2 className="w-4 h-4" />
                      Đã sinh phiếu cân bằng: {activeSession.adjustment_transaction.reference_no}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setActiveSession(null)}
                    className="px-4 py-2 border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-semibold cursor-pointer"
                  >
                    Đóng
                  </button>

                  {activeSession.status === 'IN_PROGRESS' && (
                    <button
                      onClick={handleSaveCounts}
                      disabled={savingCounts}
                      className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-semibold cursor-pointer disabled:opacity-50"
                    >
                      {savingCounts ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Save className="w-3.5 h-3.5" />
                      )}
                      <span>
                        {hasUnsavedChanges ? 'Lưu số liệu kiểm đếm *' : 'Lưu số liệu kiểm đếm'}
                      </span>
                    </button>
                  )}

                  {isManagerOrAdmin && activeSession.status === 'IN_PROGRESS' && (
                    <button
                      onClick={() =>
                        setConfirmAction({ type: 'complete', session: activeSession })
                      }
                      className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#294238] hover:bg-[#20372e] text-white rounded-xl text-xs font-semibold cursor-pointer shadow-xs"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Chốt kiểm kê & Cân bằng kho</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRM ACTION MODAL */}
      {confirmAction && (
        <div className="fixed inset-0 z-[60] bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full border border-slate-200 shadow-2xl p-5 space-y-4">
            <div className="flex items-start gap-3">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                  confirmAction.type === 'complete'
                    ? 'bg-emerald-50 text-emerald-600'
                    : 'bg-rose-50 text-rose-600'
                }`}
              >
                {confirmAction.type === 'complete' ? (
                  <CheckCircle2 className="w-5 h-5" />
                ) : (
                  <AlertTriangle className="w-5 h-5" />
                )}
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-slate-900">
                  {confirmAction.type === 'complete'
                    ? 'Xác nhận chốt kiểm kê & cân bằng kho'
                    : confirmAction.type === 'cancel'
                    ? 'Xác nhận hủy đợt kiểm kê'
                    : 'Xác nhận xóa đợt kiểm kê'}
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {confirmAction.type === 'complete'
                    ? `Hệ thống sẽ tự động tạo phiếu điều chỉnh (ADJUSTMENT) cho ${liveSummary.discrepantCount} mặt hàng có chênh lệch và cập nhật tồn kho thực tế. Thao tác không thể hoàn tác.`
                    : confirmAction.type === 'cancel'
                    ? `Đợt kiểm kê "${confirmAction.session.code}" sẽ chuyển sang trạng thái Đã hủy và không làm thay đổi tồn kho.`
                    : `Bạn có chắc muốn xóa vĩnh viễn đợt kiểm kê "${confirmAction.session.code}" khỏi hệ thống?`}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                disabled={actionLoading}
                onClick={() => setConfirmAction(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold cursor-pointer"
              >
                Đóng
              </button>
              <button
                type="button"
                disabled={actionLoading}
                onClick={executeConfirmAction}
                className={`inline-flex items-center gap-1.5 px-4 py-2 text-white rounded-xl text-xs font-semibold cursor-pointer disabled:opacity-50 ${
                  confirmAction.type === 'complete'
                    ? 'bg-[#294238] hover:bg-[#20372e]'
                    : 'bg-rose-600 hover:bg-rose-700'
                }`}
              >
                {actionLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>
                  {confirmAction.type === 'complete'
                    ? 'Chốt & Cân bằng kho'
                    : confirmAction.type === 'cancel'
                    ? 'Xác nhận hủy'
                    : 'Xác nhận xóa'}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

