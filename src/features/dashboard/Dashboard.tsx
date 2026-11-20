import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Package,
  Layers,
  ArrowDownLeft,
  ArrowUpRight,
  ArrowLeftRight,
  AlertTriangle,
  Building2,
  RefreshCw,
  Coins,
  TrendingUp,
  Clock,
  ChevronRight,
  ShieldAlert,
  CheckCircle2,
  Plus,
  Calendar,
} from 'lucide-react';
import {
  dashboardService,
  DashboardStats,
  InventoryByWarehouse,
  InventoryByCategory,
  TopProduct,
  LowStockAlert,
  RecentTransaction,
} from '../../services/dashboard.service';
import { useAuthStore } from '../../stores/auth.store';
import { showToast } from '../../utils/toast.util';

const formatVND = (amount: number): string => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(amount || 0);
};

const CATEGORY_COLORS = [
  '#EE3D43', // Red
  '#3B82F6', // Blue
  '#10B981', // Emerald
  '#F59E0B', // Amber
  '#8B5CF6', // Purple
  '#EC4899', // Pink
  '#06B6D4', // Cyan
  '#6366F1', // Indigo
];

export const Dashboard: React.FC = () => {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);

  // Dashboard Data State
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [warehouses, setWarehouses] = useState<InventoryByWarehouse[]>([]);
  const [categories, setCategories] = useState<InventoryByCategory[]>([]);
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [alerts, setAlerts] = useState<LowStockAlert[]>([]);
  const [recentTxs, setRecentTxs] = useState<RecentTransaction[]>([]);

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      const [
        statsRes,
        whRes,
        catRes,
        topRes,
        alertRes,
        recentRes,
      ] = await Promise.allSettled([
        dashboardService.getStats(),
        dashboardService.getInventoryByWarehouse(),
        dashboardService.getInventoryByCategory(),
        dashboardService.getTopProducts(),
        dashboardService.getLowStockAlerts(),
        dashboardService.getRecentTransactions(),
      ]);

      if (statsRes.status === 'fulfilled') setStats(statsRes.value);
      if (whRes.status === 'fulfilled') setWarehouses(whRes.value);
      if (catRes.status === 'fulfilled') setCategories(catRes.value);
      if (topRes.status === 'fulfilled') setTopProducts(topRes.value);
      if (alertRes.status === 'fulfilled') setAlerts(alertRes.value);
      if (recentRes.status === 'fulfilled') setRecentTxs(recentRes.value);
    } catch (err) {
      console.error('Lỗi tải dữ liệu Dashboard:', err);
      showToast.error('Không thể đồng bộ toàn bộ dữ liệu thống kê');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Current formatted Vietnamese Date
  const todayFormatted = new Date().toLocaleDateString('vi-VN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  // Calculate highest warehouse value for scaling bars
  const maxWhValue = warehouses.reduce((max, w) => Math.max(max, Number(w.total_value) || 0), 1);

  return (
    <div className="p-3 sm:p-6 lg:p-8 max-w-[1600px] w-full mx-auto space-y-6 text-slate-800">
      {/* ========================================================
          1. HEADER & GREETING BANNER
         ======================================================== */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden shadow-xl">
        <div className="absolute right-0 top-0 bottom-0 w-96 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/10 text-xs font-semibold text-slate-300 mb-3 backdrop-blur-xs">
              <Calendar className="w-3.5 h-3.5 text-red-400" />
              <span>{todayFormatted}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Xin chào, {user?.display_name || user?.username || 'Quản trị viên'} 👋
            </h1>
            <p className="text-slate-300 text-sm sm:text-base mt-1.5 max-w-2xl font-normal leading-relaxed">
              Hệ thống quản lý kho tổng IMS đang vận hành ổn định trên đám mây. Theo dõi chỉ số tồn kho, biến động xuất nhập và cảnh báo kịp thời.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              onClick={() => fetchDashboardData()}
              disabled={loading}
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs sm:text-sm font-semibold transition-all border border-white/15 cursor-pointer flex items-center gap-2"
              title="Làm mới dữ liệu từ server"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              <span>Cập nhật</span>
            </button>

            <Link
              to="/stock-transactions?action=import"
              className="px-4 py-2.5 rounded-xl bg-[#EE3D43] hover:bg-[#D9343A] text-white text-xs sm:text-sm font-bold shadow-md transition-all flex items-center gap-2"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Tạo phiếu nhập</span>
            </Link>
          </div>
        </div>
      </div>

      {/* ========================================================
          2. CORE KPI CARDS (4 COLUMNS)
         ======================================================== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Card 1: Tổng giá trị kho */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-xs relative overflow-hidden flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Tổng giá trị lưu kho
            </span>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Coins className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight font-mono">
              {formatVND(stats?.total_inventory_value || 0)}
            </div>
            <p className="text-xs text-slate-500 font-medium mt-1">
              Ước tính theo giá vốn thực tế sản phẩm
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500">Phân bổ tại:</span>
            <span className="font-bold text-slate-800">{stats?.total_warehouses || 0} kho hàng</span>
          </div>
        </div>

        {/* Card 2: Tổng sản phẩm tồn kho */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-xs relative overflow-hidden flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Hàng hóa lưu kho
            </span>
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Package className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight font-mono">
              {(stats?.total_inventory_quantity || 0).toLocaleString('vi-VN')}
              <span className="text-base font-semibold text-slate-400 ml-1.5 font-sans">sản phẩm</span>
            </div>
            <p className="text-xs text-slate-500 font-medium mt-1">
              Phân loại theo {stats?.total_products || 0} mã hàng (SKU)
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500">Tình trạng:</span>
            <span className="font-bold text-emerald-600 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Sẵn sàng cung ứng
            </span>
          </div>
        </div>

        {/* Card 3: Giao dịch tháng này */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-xs relative overflow-hidden flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Giao dịch xuất / nhập
            </span>
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <ArrowLeftRight className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight font-mono">
              {stats?.transactions_this_month || 0}
              <span className="text-base font-semibold text-slate-400 ml-1.5 font-sans">phiếu trong tháng</span>
            </div>
            <p className="text-xs text-slate-500 font-medium mt-1">
              {stats?.transactions_today || 0} phiếu hoàn thành hôm nay
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500">Xem nhật ký:</span>
            <Link to="/stock-transactions" className="font-bold text-red-600 hover:underline flex items-center gap-0.5">
              <span>Chi tiết</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Card 4: Cảnh báo tồn kho */}
        <div className="bg-white rounded-2xl border border-rose-200/80 p-5 sm:p-6 shadow-xs relative overflow-hidden flex flex-col justify-between bg-gradient-to-br from-white via-white to-rose-50/40">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-rose-700 uppercase tracking-wider">
              Cảnh báo tồn kho
            </span>
            <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center animate-pulse">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl sm:text-3xl font-black text-rose-600 tracking-tight font-mono">
              {(stats?.low_stock_count || 0) + (stats?.out_of_stock_count || 0)}
              <span className="text-base font-semibold text-rose-400 ml-1.5 font-sans">mặt hàng</span>
            </div>
            <p className="text-xs text-rose-600/80 font-medium mt-1">
              {stats?.out_of_stock_count || 0} hết hàng · {stats?.low_stock_count || 0} dưới định mức
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-rose-100 flex items-center justify-between text-xs">
            <span className="text-slate-500">Cần xử lý:</span>
            <Link to="/products" className="font-bold text-rose-700 hover:underline">
              Bổ sung ngay
            </Link>
          </div>
        </div>
      </div>

      {/* ========================================================
          3. ROW 2: WAREHOUSE DISTRIBUTION (60%) + LOW STOCK ALERTS (40%)
         ======================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Phân bổ tồn kho theo từng kho hàng */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
                <Building2 className="w-5 h-5 text-red-600" />
                <span>Phân bổ tồn kho theo kho bãi</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Số lượng và giá trị hàng hóa lưu trữ tại các chi nhánh kho
              </p>
            </div>
            <Link
              to="/warehouses"
              className="text-xs font-semibold text-red-600 hover:text-red-700 flex items-center gap-0.5"
            >
              <span>Xem sơ đồ</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-4 py-4 flex-1">
            {warehouses.length === 0 ? (
              <div className="text-center py-10 text-slate-400 text-sm">
                Đang tải dữ liệu kho hàng...
              </div>
            ) : (
              warehouses.map((wh) => {
                const ratio = Math.round(((Number(wh.total_value) || 0) / maxWhValue) * 100);
                return (
                  <div key={wh.warehouse_id} className="space-y-1.5">
                    <div className="flex items-center justify-between text-sm">
                      <div className="font-bold text-slate-800 flex items-center gap-2">
                        <span className="px-2 py-0.5 text-xs font-mono font-bold bg-slate-100 text-slate-600 rounded">
                          {wh.warehouse_code}
                        </span>
                        <span className="truncate max-w-[200px] sm:max-w-xs">{wh.warehouse_name}</span>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-slate-900 font-mono">
                          {formatVND(Number(wh.total_value) || 0)}
                        </span>
                        <span className="text-xs text-slate-400 ml-2">
                          ({Number(wh.total_quantity || 0).toLocaleString('vi-VN')} cái)
                        </span>
                      </div>
                    </div>
                    {/* Progress Bar */}
                    <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-red-500 to-[#EE3D43] rounded-full transition-all duration-500"
                        style={{ width: `${Math.max(ratio, 4)}%` }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Toàn bộ {warehouses.length} kho đều đạt tiêu chuẩn lưu kho</span>
            <span className="font-semibold text-slate-700">Dữ liệu thời gian thực</span>
          </div>
        </div>

        {/* Danh sách cảnh báo hàng sắp hết & hết hàng */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-rose-600" />
                <span>Cảnh báo cần nhập thêm hàng</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Các mặt hàng chạm ngưỡng tồn kho tối thiểu
              </p>
            </div>
            <Link
              to="/products"
              className="text-xs font-semibold text-rose-600 hover:text-rose-700 flex items-center gap-0.5"
            >
              <span>Tất cả</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-3 py-4 flex-1 overflow-y-auto max-h-[340px] custom-scrollbar">
            {alerts.length === 0 ? (
              <div className="text-center py-12 text-slate-400 text-sm">
                <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2 opacity-80" />
                Tuyệt vời! Không có mặt hàng nào bị thiếu hụt tồn kho
              </div>
            ) : (
              alerts.map((item) => {
                const isOut = item.status === 'OUT_OF_STOCK' || item.current_stock <= 0;
                return (
                  <div
                    key={item.product_id}
                    className="p-3 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-slate-50 transition-colors flex items-center justify-between gap-3"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold text-slate-600 bg-white px-2 py-0.5 rounded border border-slate-200">
                          {item.sku}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            isOut
                              ? 'bg-rose-100 text-rose-700'
                              : 'bg-amber-100 text-amber-700'
                          }`}
                        >
                          {isOut ? 'HẾT HÀNG' : 'SẮP HẾT'}
                        </span>
                      </div>
                      <div className="text-xs font-semibold text-slate-800 truncate mt-1">
                        {item.name}
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        Tồn: <strong className="text-rose-600">{item.current_stock}</strong> {item.unit_name} · Định mức: {item.low_stock_threshold} {item.unit_name}
                      </div>
                    </div>

                    <Link
                      to="/stock-transactions?action=import"
                      className="px-3 py-1.5 rounded-lg bg-white hover:bg-slate-100 border border-slate-200 text-xs font-bold text-slate-700 shrink-0 transition-colors"
                    >
                      Nhập hàng
                    </Link>
                  </div>
                );
              })
            )}
          </div>

          <div className="pt-3 border-t border-slate-100 text-center">
            <Link
              to="/stock-transactions?action=import"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-red-600 hover:text-red-700"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Khởi tạo phiếu nhập hàng bổ sung</span>
            </Link>
          </div>
        </div>
      </div>

      {/* ========================================================
          4. ROW 3: CATEGORY RATIOS (50%) + RECENT TRANSACTIONS (50%)
         ======================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Cơ cấu danh mục */}
        <div className="lg:col-span-6 bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
                <Layers className="w-5 h-5 text-red-600" />
                <span>Cơ cấu hàng hóa theo ngành hàng</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Tỷ trọng số lượng và danh mục sản phẩm chủ lực
              </p>
            </div>
            <Link
              to="/categories"
              className="text-xs font-semibold text-red-600 hover:text-red-700 flex items-center gap-0.5"
            >
              <span>Xem danh mục</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="py-4 space-y-3.5 flex-1">
            {categories.map((cat, idx) => {
              const color = CATEGORY_COLORS[idx % CATEGORY_COLORS.length];
              return (
                <div key={cat.category_id} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-800 flex items-center gap-2">
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: color }}
                      />
                      <span>{cat.category_name}</span>
                    </span>
                    <span className="text-slate-500 font-medium">
                      <strong>{cat.percentage}%</strong> ({cat.total_quantity} cái)
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${Math.max(cat.percentage, 3)}%`,
                        backgroundColor: color,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Tổng số {categories.length} danh mục hàng hóa</span>
            <span className="font-semibold text-slate-700">100% chuẩn mã GS1</span>
          </div>
        </div>

        {/* Lịch sử giao dịch mới nhất */}
        <div className="lg:col-span-6 bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
                <Clock className="w-5 h-5 text-red-600" />
                <span>Hoạt động xuất nhập kho gần đây</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Lịch sử ghi nhận phiếu kho hoàn thành gần nhất
              </p>
            </div>
            <Link
              to="/stock-transactions"
              className="text-xs font-semibold text-red-600 hover:text-red-700 flex items-center gap-0.5"
            >
              <span>Xem tất cả</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-2.5 py-4 flex-1">
            {recentTxs.length === 0 ? (
              <div className="text-center py-10 text-slate-400 text-sm">
                Chưa có giao dịch kho gần đây
              </div>
            ) : (
              recentTxs.slice(0, 5).map((tx) => {
                const isImport = tx.type === 'IMPORT';
                return (
                  <div
                    key={tx.id}
                    className="p-3 rounded-xl border border-slate-100 hover:border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition-colors flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                          isImport
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-rose-100 text-rose-700'
                        }`}
                      >
                        {isImport ? (
                          <ArrowDownLeft className="w-4 h-4" />
                        ) : (
                          <ArrowUpRight className="w-4 h-4" />
                        )}
                      </div>
                      <div>
                        <div className="font-bold text-slate-800 font-mono">
                          {tx.reference_no}
                        </div>
                        <div className="text-slate-400 mt-0.5">
                          {tx.warehouse_name} · {tx.creator_name || 'Nhân viên'}
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <span
                        className={`font-bold px-2 py-0.5 rounded text-[11px] ${
                          isImport
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}
                      >
                        {isImport ? 'Nhập kho' : 'Xuất kho'}
                      </span>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        {new Date(tx.created_at).toLocaleDateString('vi-VN')}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <div className="pt-3 border-t border-slate-100 text-center">
            <Link
              to="/stock-transactions"
              className="text-xs font-bold text-slate-700 hover:text-red-600 transition-colors"
            >
              Mở toàn bộ sổ cái xuất nhập kho →
            </Link>
          </div>
        </div>
      </div>

      {/* ========================================================
          5. ROW 4: TOP HIGH-DEMAND MOVING PRODUCTS
         ======================================================== */}
      {topProducts.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-xs">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-red-600" />
                <span>Top sản phẩm xuất kho & luân chuyển nhiều nhất</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Các mặt hàng có lưu lượng xuất nhập và thanh khoản cao nhất
              </p>
            </div>
            <Link
              to="/products"
              className="text-xs font-semibold text-red-600 hover:text-red-700 flex items-center gap-0.5"
            >
              <span>Xem danh mục</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto pt-4">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50/70 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3">Hạng</th>
                  <th className="px-4 py-3">Mã SKU</th>
                  <th className="px-4 py-3">Tên sản phẩm</th>
                  <th className="px-4 py-3">Danh mục</th>
                  <th className="px-4 py-3 text-right">Số lượng luân chuyển</th>
                  <th className="px-4 py-3 text-right">Tổng giá trị</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {topProducts.slice(0, 5).map((prod, idx) => (
                  <tr key={prod.product_id} className="hover:bg-slate-50/50">
                    <td className="px-4 py-3 font-bold text-slate-900">
                      #{idx + 1}
                    </td>
                    <td className="px-4 py-3 font-mono font-bold text-slate-700">
                      {prod.sku}
                    </td>
                    <td className="px-4 py-3 font-semibold text-slate-900">
                      {prod.name}
                    </td>
                    <td className="px-4 py-3 text-slate-500">
                      {prod.category_name}
                    </td>
                    <td className="px-4 py-3 text-right font-bold text-slate-900">
                      {prod.total_quantity.toLocaleString('vi-VN')} {prod.unit_name}
                    </td>
                    <td className="px-4 py-3 text-right font-bold text-red-600 font-mono">
                      {formatVND(prod.total_value)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
