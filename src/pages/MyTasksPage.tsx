import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  FileText,
  Search,
  Plus,
  RefreshCw,
  ArrowDownLeft,
  ArrowUpRight,
  ArrowLeftRight,
  Sliders,
  Eye,
  Building2,
  ChevronLeft,
  ChevronRight,
  Package,
} from 'lucide-react';
import { useAuthStore } from '../stores/auth.store';
import { stockTransactionsService } from '../services/stock-transactions.service';
import { StockTransaction } from '../types/stock-transaction.types';
import { showToast } from '../utils/toast.util';

const TYPE_CONFIG: Record<string, { label: string; icon: any; color: string }> = {
  IMPORT: { label: 'Nhập kho', icon: ArrowDownLeft, color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  EXPORT: { label: 'Xuất kho', icon: ArrowUpRight, color: 'bg-rose-50 text-rose-700 border-rose-200' },
  TRANSFER: { label: 'Điều chuyển', icon: ArrowLeftRight, color: 'bg-blue-50 text-blue-700 border-blue-200' },
  ADJUSTMENT: { label: 'Kiểm kê', icon: Sliders, color: 'bg-amber-50 text-amber-700 border-amber-200' },
};

export const MyTasksPage: React.FC = () => {
  const { user } = useAuthStore();
  const [transactions, setTransactions] = useState<StockTransaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);

  const fetchTransactions = useCallback(async () => {
    try {
      setLoading(true);
      const res = await stockTransactionsService.getAll({
        limit: 100,
      });

      // Filter tasks by current user or show all user's transactions
      let items = res.data || [];
      if (user?.id) {
        items = items.filter(
          (t) => t.created_by_user_id === user.id || t.creator?.id === user.id
        );
      }
      setTransactions(items);
    } catch (err) {
      console.error('Lỗi tải phiếu của tôi:', err);
      showToast.error('Không thể kết nối cơ sở dữ liệu phiếu kho');
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const filteredTasks = useMemo(() => {
    return transactions.filter((t) => {
      const matchSearch =
        !search ||
        t.reference_no?.toLowerCase().includes(search.toLowerCase()) ||
        t.note?.toLowerCase().includes(search.toLowerCase());

      const matchType = selectedType === 'all' || t.type === selectedType;

      return matchSearch && matchType;
    });
  }, [transactions, search, selectedType]);

  const paginatedTasks = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredTasks.slice(start, start + pageSize);
  }, [filteredTasks, page, pageSize]);

  const totalPages = Math.ceil(filteredTasks.length / pageSize) || 1;

  // Type counts
  const importCount = useMemo(
    () => transactions.filter((t) => t.type === 'IMPORT').length,
    [transactions]
  );
  const exportCount = useMemo(
    () => transactions.filter((t) => t.type === 'EXPORT').length,
    [transactions]
  );

  return (
    <div className="flex-1 flex flex-col min-h-0 px-3 sm:px-6 lg:px-8 py-4 max-w-[1560px] w-full mx-auto space-y-4">
      {/* Header */}
      <div className="shrink-0 flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <FileText className="w-7 h-7 text-blue-600" />
            Phiếu kho của tôi
          </h1>
          <p className="text-sm font-medium text-slate-500 mt-1">
            Theo dõi tiến độ và lịch sử các phiếu xuất / nhập kho do bạn khởi tạo
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={() => fetchTransactions()}
            disabled={loading}
            className="p-2.5 text-slate-600 hover:text-slate-900 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer flex items-center gap-2 text-sm font-medium"
            title="Làm mới dữ liệu"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Làm mới</span>
          </button>

          <Link
            to="/stock-transactions"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white rounded-xl text-sm font-bold shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Tạo phiếu mới</span>
          </Link>
        </div>
      </div>

      {/* Tabs & Filters */}
      <div className="shrink-0 bg-white p-3 sm:p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-3">
        {/* Type Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto max-w-full pb-1 sm:pb-0 custom-scrollbar">
          <button
            onClick={() => {
              setSelectedType('all');
              setPage(1);
            }}
            className={`px-3 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer whitespace-nowrap ${
              selectedType === 'all'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Tất cả ({transactions.length})
          </button>
          <button
            onClick={() => {
              setSelectedType('IMPORT');
              setPage(1);
            }}
            className={`px-3 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              selectedType === 'IMPORT'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-emerald-700 bg-emerald-50 hover:bg-emerald-100'
            }`}
          >
            <ArrowDownLeft className="w-3.5 h-3.5" />
            <span>Phiếu nhập ({importCount})</span>
          </button>
          <button
            onClick={() => {
              setSelectedType('EXPORT');
              setPage(1);
            }}
            className={`px-3 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              selectedType === 'EXPORT'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'text-rose-700 bg-rose-50 hover:bg-rose-100'
            }`}
          >
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>Phiếu xuất ({exportCount})</span>
          </button>
        </div>

        {/* Search */}
        <div className="relative flex-1 sm:w-64">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm mã tham chiếu, ghi chú..."
            className="w-full pl-9 pr-4 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-slate-300"
          />
        </div>
      </div>

      {/* Main Table */}
      <div className="flex-1 min-h-[300px] bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden flex flex-col">
        <div className="flex-1 overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-700">
            <thead className="bg-slate-50/80 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="px-4 py-3.5">Mã tham chiếu</th>
                <th className="px-4 py-3.5">Loại nghiệp vụ</th>
                <th className="px-4 py-3.5">Kho thao tác</th>
                <th className="px-4 py-3.5">Số lượng mặt hàng</th>
                <th className="px-4 py-3.5">Thời gian tạo</th>
                <th className="px-4 py-3.5 text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading && transactions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-slate-400">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-slate-400" />
                    Đang tải danh sách phiếu kho...
                  </td>
                </tr>
              ) : paginatedTasks.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-16 text-slate-400">
                    <FileText className="w-10 h-10 mx-auto mb-2 text-slate-300" />
                    Bạn chưa có phiếu xuất nhập kho nào ở mục này
                  </td>
                </tr>
              ) : (
                paginatedTasks.map((t) => {
                  const typeCfg = TYPE_CONFIG[t.type] || {
                    label: t.type,
                    icon: FileText,
                    color: 'bg-slate-50 text-slate-700 border-slate-200',
                  };
                  const TypeIcon = typeCfg.icon;

                  return (
                    <tr key={t.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <Link
                          to="/stock-transactions"
                          className="font-mono font-bold text-slate-900 hover:text-blue-600 transition-colors"
                        >
                          {t.reference_no}
                        </Link>
                        {t.note && (
                          <div className="text-xs text-slate-400 truncate max-w-[220px]">
                            {t.note}
                          </div>
                        )}
                      </td>

                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold rounded-lg border ${typeCfg.color}`}
                        >
                          <TypeIcon className="w-3.5 h-3.5" />
                          <span>{typeCfg.label}</span>
                        </span>
                      </td>

                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <div className="flex items-center gap-1.5 font-medium text-slate-800">
                          <Building2 className="w-3.5 h-3.5 text-slate-400" />
                          <span>{t.warehouse?.name || 'Kho chính'}</span>
                        </div>
                      </td>

                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-xs font-semibold">
                          <Package className="w-3 h-3 text-slate-500" />
                          {t.items?.length || 0} mặt hàng
                        </span>
                      </td>

                      <td className="px-4 py-3.5 whitespace-nowrap text-xs text-slate-500">
                        {new Date(t.created_at).toLocaleString('vi-VN')}
                      </td>

                      <td className="px-4 py-3.5 text-center whitespace-nowrap">
                        <Link
                          to="/stock-transactions"
                          className="inline-flex items-center gap-1 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Mở chi tiết</span>
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="shrink-0 p-3 sm:p-4 border-t border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <div>
            Hiển thị <strong>{paginatedTasks.length}</strong> / <strong>{filteredTasks.length}</strong> phiếu
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-3 py-1 font-semibold text-slate-700">
              Trang {page} / {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};


