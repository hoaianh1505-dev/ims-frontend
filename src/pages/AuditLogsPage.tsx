import React, { useState, useEffect, useCallback } from 'react';
import {
  History,
  Search,
  RefreshCw,
  Eye,
  X,
  Layers,
  Activity,
  ChevronLeft,
  ChevronRight,
  Code,
  Copy,
  Check,
} from 'lucide-react';
import { auditLogsService, AuditLogItem } from '../services/audit-logs.service';
import { UserAvatar } from '../components/common/UserAvatar';
import { showToast } from '../utils/toast.util';

const ACTION_COLORS: Record<string, { bg: string; text: string; label: string }> = {
  LOGIN: { bg: 'bg-emerald-50 text-emerald-700 border-emerald-200', text: 'Đăng nhập', label: 'LOGIN' },
  LOGOUT: { bg: 'bg-slate-50 text-slate-700 border-slate-200', text: 'Đăng xuất', label: 'LOGOUT' },
  CREATE: { bg: 'bg-blue-50 text-blue-700 border-blue-200', text: 'Tạo mới', label: 'CREATE' },
  UPDATE: { bg: 'bg-amber-50 text-amber-700 border-amber-200', text: 'Cập nhật', label: 'UPDATE' },
  DELETE: { bg: 'bg-rose-50 text-rose-700 border-rose-200', text: 'Xóa dữ liệu', label: 'DELETE' },
  IMPORT: { bg: 'bg-indigo-50 text-indigo-700 border-indigo-200', text: 'Nhập kho', label: 'IMPORT' },
  EXPORT: { bg: 'bg-orange-50 text-orange-700 border-orange-200', text: 'Xuất kho', label: 'EXPORT' },
  CHANGE_PASSWORD: { bg: 'bg-purple-50 text-purple-700 border-purple-200', text: 'Đổi mật khẩu', label: 'PASSWORD' },
};

const ENTITY_LABELS: Record<string, string> = {
  User: 'Người dùng',
  UserEntity: 'Tài khoản',
  Product: 'Sản phẩm',
  ProductEntity: 'Hàng hóa',
  StockTransaction: 'Giao dịch kho',
  Warehouse: 'Kho hàng',
  Category: 'Danh mục',
  Supplier: 'Nhà cung cấp',
  Customer: 'Khách hàng',
};

export const AuditLogsPage: React.FC = () => {
  const [logs, setLogs] = useState<AuditLogItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(15);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Filters
  const [search, setSearch] = useState('');
  const [selectedAction, setSelectedAction] = useState<string>('');
  const [selectedEntity, setSelectedEntity] = useState<string>('');

  // Details Modal
  const [activeLog, setActiveLog] = useState<AuditLogItem | null>(null);
  const [copied, setCopied] = useState(false);

  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true);
      const res = await auditLogsService.getAll({
        page,
        limit: pageSize,
        search: search.trim() || undefined,
        action: selectedAction || undefined,
        entity_name: selectedEntity || undefined,
      });

      setLogs(res.data);
      setTotalPages(res.meta.totalPages);
      setTotalCount(res.meta.total);
    } catch (err) {
      console.error('Lỗi tải audit logs:', err);
      showToast.error('Không thể tải dữ liệu nhật ký hệ thống');
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, search, selectedAction, selectedEntity]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const handleCopyDetails = () => {
    if (!activeLog?.details) return;
    navigator.clipboard.writeText(JSON.stringify(activeLog.details, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    showToast.success('Đã sao chép chi tiết log!');
  };

  const formatTimestamp = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return {
        date: d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }),
        time: d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      };
    } catch {
      return { date: dateStr, time: '' };
    }
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 px-3 sm:px-6 lg:px-8 py-4 max-w-[1560px] w-full mx-auto space-y-4">
      {/* Header */}
      <div className="shrink-0 flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <History className="w-7 h-7 text-red-600" />
            Nhật ký hệ thống (Audit Logs)
          </h1>
          <p className="text-sm font-medium text-slate-500 mt-1">
            Ghi lại toàn bộ thao tác truy cập, thay đổi dữ liệu và lịch sử vận hành bảo mật
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={() => fetchLogs()}
            disabled={loading}
            className="p-2.5 text-slate-600 hover:text-slate-900 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer flex items-center gap-2 text-sm font-medium"
            title="Làm mới"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Làm mới</span>
          </button>
        </div>
      </div>

      {/* Toolbar & Filters */}
      <div className="shrink-0 bg-white p-3 sm:p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 min-w-[240px] max-w-sm">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Tìm kiếm người dùng, IP, ghi chú..."
            className="w-full pl-10 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#EE3D43]/15 focus:border-slate-300 focus:bg-white transition-all"
          />
          {search && (
            <button
              onClick={() => {
                setSearch('');
                setPage(1);
              }}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Dropdowns */}
        <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
          {/* Action Filter */}
          <select
            value={selectedAction}
            onChange={(e) => {
              setSelectedAction(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 focus:outline-none focus:border-slate-300"
          >
            <option value="">Tất cả hành động</option>
            <option value="LOGIN">Đăng nhập (LOGIN)</option>
            <option value="LOGOUT">Đăng xuất (LOGOUT)</option>
            <option value="CREATE">Tạo mới (CREATE)</option>
            <option value="UPDATE">Cập nhật (UPDATE)</option>
            <option value="DELETE">Xóa (DELETE)</option>
            <option value="IMPORT">Nhập kho (IMPORT)</option>
            <option value="EXPORT">Xuất kho (EXPORT)</option>
            <option value="CHANGE_PASSWORD">Đổi mật khẩu</option>
          </select>

          {/* Entity Filter */}
          <select
            value={selectedEntity}
            onChange={(e) => {
              setSelectedEntity(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 focus:outline-none focus:border-slate-300"
          >
            <option value="">Tất cả đối tượng</option>
            <option value="User">Người dùng (User)</option>
            <option value="Product">Sản phẩm (Product)</option>
            <option value="StockTransaction">Phiếu kho (StockTransaction)</option>
            <option value="Warehouse">Kho hàng (Warehouse)</option>
            <option value="Category">Danh mục (Category)</option>
            <option value="Supplier">Nhà cung cấp (Supplier)</option>
            <option value="Customer">Khách hàng (Customer)</option>
          </select>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="flex-1 min-h-[300px] bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden flex flex-col">
        <div className="flex-1 overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-700">
            <thead className="bg-slate-50/80 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="px-4 py-3.5">Thời gian</th>
                <th className="px-4 py-3.5">Người thực hiện</th>
                <th className="px-4 py-3.5">Hành động</th>
                <th className="px-4 py-3.5">Đối tượng tác động</th>
                <th className="px-4 py-3.5">Địa chỉ IP</th>
                <th className="px-4 py-3.5 text-center">Chi tiết</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading && logs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-slate-400">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-slate-400" />
                    Đang tải nhật ký hệ thống...
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-16 text-slate-400">
                    <Activity className="w-10 h-10 mx-auto mb-2 text-slate-300" />
                    Chưa có nhật ký hoạt động nào phù hợp với bộ lọc
                  </td>
                </tr>
              ) : (
                logs.map((log) => {
                  const actionStyle = ACTION_COLORS[log.action] || {
                    bg: 'bg-slate-50 text-slate-700 border-slate-200',
                    text: log.action,
                    label: log.action,
                  };
                  const { date, time } = formatTimestamp(log.created_at);
                  const entityDisplay = ENTITY_LABELS[log.entity_name] || log.entity_name;

                  return (
                    <tr key={log.id} className="hover:bg-slate-50/70 transition-colors">
                      {/* Timestamp */}
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <div className="font-semibold text-slate-800">{time}</div>
                        <div className="text-xs text-slate-400">{date}</div>
                      </td>

                      {/* User */}
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <div className="flex items-center gap-2.5">
                          <UserAvatar src={log.user?.avatar} size="sm" alt={log.user?.username || 'User'} />
                          <div>
                            <div className="font-bold text-slate-900">
                              {log.user?.display_name || log.user?.username || 'Hệ thống'}
                            </div>
                            <div className="text-xs text-slate-400">
                              @{log.user?.username || 'system'}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Action */}
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 text-xs font-bold rounded-lg border ${actionStyle.bg}`}
                        >
                          {actionStyle.text}
                        </span>
                      </td>

                      {/* Entity */}
                      <td className="px-4 py-3.5">
                        <div className="font-medium text-slate-800 flex items-center gap-1.5">
                          <Layers className="w-3.5 h-3.5 text-slate-400" />
                          <span>{entityDisplay}</span>
                        </div>
                        {log.entity_id && (
                          <div className="text-xs font-mono text-slate-400 truncate max-w-[180px]">
                            ID: {log.entity_id}
                          </div>
                        )}
                      </td>

                      {/* IP */}
                      <td className="px-4 py-3.5 whitespace-nowrap font-mono text-xs text-slate-500">
                        {log.ip_address || '::1 (Local)'}
                      </td>

                      {/* Action details button */}
                      <td className="px-4 py-3.5 text-center whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => setActiveLog(log)}
                          className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                          title="Xem chi tiết dữ liệu"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="shrink-0 p-3 sm:p-4 border-t border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <div>
            Hiển thị <strong>{logs.length}</strong> / <strong>{totalCount}</strong> bản ghi
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
              Trang {page} / {totalPages || 1}
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

      {/* Details JSON Modal */}
      {activeLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[85vh] flex flex-col border border-slate-200 overflow-hidden">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50/70">
              <div className="flex items-center gap-2.5">
                <Code className="w-5 h-5 text-red-600" />
                <h3 className="font-bold text-slate-900 text-base sm:text-lg">
                  Chi tiết bản ghi Audit Log
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setActiveLog(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4 sm:p-6 overflow-y-auto space-y-4 text-sm">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200/70">
                <div>
                  <span className="text-xs text-slate-400 block">Hành động:</span>
                  <span className="font-bold text-slate-800">{activeLog.action}</span>
                </div>
                <div>
                  <span className="text-xs text-slate-400 block">Đối tượng:</span>
                  <span className="font-bold text-slate-800">{activeLog.entity_name}</span>
                </div>
                <div>
                  <span className="text-xs text-slate-400 block">Người thực hiện:</span>
                  <span className="font-bold text-slate-800">
                    {activeLog.user?.display_name || activeLog.user?.username || 'Hệ thống'}
                  </span>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                    Dữ liệu chi tiết (Payload / Changes):
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyDetails}
                    className="inline-flex items-center gap-1.5 text-xs text-slate-600 hover:text-slate-900 font-medium px-2 py-1 rounded-md hover:bg-slate-100 border border-slate-200 cursor-pointer"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Đã chép' : 'Sao chép JSON'}</span>
                  </button>
                </div>
                <pre className="p-4 bg-slate-900 text-slate-100 rounded-xl text-xs font-mono overflow-x-auto max-h-[350px] leading-relaxed custom-scrollbar">
                  {activeLog.details
                    ? JSON.stringify(activeLog.details, null, 2)
                    : 'Không có dữ liệu chi tiết bổ sung'}
                </pre>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-200 bg-slate-50/70 flex justify-end">
              <button
                type="button"
                onClick={() => setActiveLog(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-sm font-semibold transition-colors cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
