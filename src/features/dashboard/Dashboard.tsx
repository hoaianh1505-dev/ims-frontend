import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Package,
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
  BarChart3,
  PieChart as PieIcon,
  Activity,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import {
  dashboardService,
  DashboardStats,
  InventoryByWarehouse,
  InventoryByCategory,
  TopProduct,
  LowStockAlert,
  StockMovementItem,
  RecentTransaction,
} from '../../services/dashboard.service';
import { showToast } from '../../utils/toast.util';

const formatVND = (amount: number): string => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(amount || 0);
};

const formatShortNumber = (num: number): string => {
  if (num >= 1000000000) return `${(num / 1000000000).toFixed(1)}B`;
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(0)}k`;
  return num.toString();
};

const CHART_COLORS = [
  '#EE3D43', // Red (Brand)
  '#2563EB', // Blue
  '#10B981', // Emerald
  '#F59E0B', // Amber
  '#8B5CF6', // Purple
  '#EC4899', // Pink
  '#06B6D4', // Cyan
  '#6366F1', // Indigo
];

export const Dashboard: React.FC = () => {
  const [loading, setLoading] = useState(true);

  // Dashboard Data State
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [warehouses, setWarehouses] = useState<InventoryByWarehouse[]>([]);
  const [categories, setCategories] = useState<InventoryByCategory[]>([]);
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [alerts, setAlerts] = useState<LowStockAlert[]>([]);
  const [recentTxs, setRecentTxs] = useState<RecentTransaction[]>([]);
  const [movementPeriod, setMovementPeriod] = useState<'7d' | '30d'>('7d');
  const [movement, setMovement] = useState<StockMovementItem[]>([]);

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      const [
        statsRes,
        whRes,
        catRes,
        topRes,
        alertRes,
        moveRes,
        recentRes,
      ] = await Promise.allSettled([
        dashboardService.getStats(),
        dashboardService.getInventoryByWarehouse(),
        dashboardService.getInventoryByCategory(),
        dashboardService.getTopProducts(),
        dashboardService.getLowStockAlerts(),
        dashboardService.getStockMovement(movementPeriod),
        dashboardService.getRecentTransactions(),
      ]);

      if (statsRes.status === 'fulfilled') setStats(statsRes.value);
      if (whRes.status === 'fulfilled') setWarehouses(whRes.value);
      if (catRes.status === 'fulfilled') setCategories(catRes.value);
      if (topRes.status === 'fulfilled') setTopProducts(topRes.value);
      if (alertRes.status === 'fulfilled') setAlerts(alertRes.value);
      if (moveRes.status === 'fulfilled') setMovement(moveRes.value);
      if (recentRes.status === 'fulfilled') setRecentTxs(recentRes.value);
    } catch (err) {
      console.error('Lỗi tải dữ liệu Dashboard:', err);
      showToast.error('Không thể đồng bộ toàn bộ dữ liệu thống kê');
    } finally {
      setLoading(false);
    }
  }, [movementPeriod]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Formatted data for Movement Chart
  const formattedMovementData = useMemo(() => {
    if (!movement || movement.length === 0) return [];
    return movement.map((m) => {
      const parts = m.date.split('-');
      const shortDate = parts.length === 3 ? `${parts[2]}/${parts[1]}` : m.date;
      return {
        date: shortDate,
        fullDate: m.date,
        'Nhập kho': m.import_qty || 0,
        'Xuất kho': m.export_qty || 0,
      };
    });
  }, [movement]);

  // Formatted data for Warehouse Bar Chart
  const formattedWarehouseData = useMemo(() => {
    if (!warehouses || warehouses.length === 0) return [];
    return warehouses.map((w) => ({
      name: w.warehouse_code,
      fullName: w.warehouse_name,
      'Số lượng': Number(w.total_quantity) || 0,
      'Giá trị': Number(w.total_value) || 0,
    }));
  }, [warehouses]);

  // Formatted data for Category Donut Chart
  const formattedCategoryData = useMemo(() => {
    if (!categories || categories.length === 0) return [];
    return categories.map((c) => ({
      name: c.category_name,
      value: Number(c.total_quantity) || 0,
      percentage: c.percentage,
      totalValue: c.total_value,
    }));
  }, [categories]);

  return (
    <div className="p-3 sm:p-6 lg:p-8 max-w-[1600px] w-full mx-auto space-y-6 text-slate-800">
      {/* ========================================================
          1. CLEAN PAGE HEADER (Không còn banner đen to)
         ======================================================== */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-red-600 text-white flex items-center justify-center shadow-xs">
              <Activity className="w-4 h-4" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Tổng quan điều hành kho
            </h1>
          </div>
          <p className="text-xs sm:text-sm font-medium text-slate-500 mt-1">
            Số liệu tồn kho, biến động xuất nhập và trạng thái kho hàng thời gian thực
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={() => fetchDashboardData()}
            disabled={loading}
            className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 text-xs sm:text-sm font-semibold border border-slate-200 shadow-2xs transition-all cursor-pointer flex items-center gap-2"
            title="Làm mới dữ liệu từ server"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-slate-900' : 'text-slate-500'}`} />
            <span>Cập nhật</span>
          </button>

          <Link
            to="/stock-transactions?action=import"
            className="px-4 py-2 rounded-xl bg-[#EE3D43] hover:bg-[#D9343A] text-white text-xs sm:text-sm font-bold shadow-xs transition-all flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Tạo phiếu mới</span>
          </Link>
        </div>
      </div>

      {/* ========================================================
          2. CORE KPI CARDS (4 CARDS)
         ======================================================== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Card 1: Tổng giá trị lưu kho */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Tổng giá trị tồn kho
            </span>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Coins className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight font-mono">
              {formatVND(stats?.total_inventory_value || 0)}
            </div>
            <p className="text-xs text-slate-500 font-medium mt-1">
              Phân bổ trên {stats?.total_warehouses || 0} kho hàng
            </p>
          </div>
        </div>

        {/* Card 2: Hàng hóa lưu kho */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Tổng số lượng hàng
            </span>
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Package className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight font-mono">
              {(stats?.total_inventory_quantity || 0).toLocaleString('vi-VN')}
              <span className="text-sm font-semibold text-slate-400 ml-1.5 font-sans">sản phẩm</span>
            </div>
            <p className="text-xs text-slate-500 font-medium mt-1">
              Quản lý qua {stats?.total_products || 0} mã SKU
            </p>
          </div>
        </div>

        {/* Card 3: Giao dịch trong tháng */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Giao dịch xuất / nhập
            </span>
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <ArrowLeftRight className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight font-mono">
              {stats?.transactions_this_month || 0}
              <span className="text-sm font-semibold text-slate-400 ml-1.5 font-sans">phiếu tháng này</span>
            </div>
            <p className="text-xs text-slate-500 font-medium mt-1">
              {stats?.transactions_today || 0} phiếu phát sinh hôm nay
            </p>
          </div>
        </div>

        {/* Card 4: Cảnh báo tồn kho */}
        <div className="bg-white rounded-2xl border border-rose-200/80 p-5 shadow-xs bg-gradient-to-br from-white to-rose-50/40 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-rose-700 uppercase tracking-wider">
              Cảnh báo tồn kho
            </span>
            <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center animate-pulse">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-black text-rose-600 tracking-tight font-mono">
              {(stats?.low_stock_count || 0) + (stats?.out_of_stock_count || 0)}
              <span className="text-sm font-semibold text-rose-400 ml-1.5 font-sans">mặt hàng</span>
            </div>
            <p className="text-xs text-rose-600/80 font-medium mt-1">
              {stats?.out_of_stock_count || 0} hết hàng · {stats?.low_stock_count || 0} dưới định mức
            </p>
          </div>
        </div>
      </div>

      {/* ========================================================
          3. CHARTS ROW 1: BIỂU ĐỒ BIẾN ĐỘNG (AREA) + DONUT CATEGORY
         ======================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* CHART 1: AreaChart Biến động xuất nhập kho */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-xs flex flex-col justify-between">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-red-600" />
                <span>Biến động Xuất - Nhập kho (Stock Movement)</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                So sánh số lượng hàng nhập vào và xuất ra theo chu kỳ
              </p>
            </div>

            {/* Period switcher */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-semibold">
              <button
                type="button"
                onClick={() => setMovementPeriod('7d')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  movementPeriod === '7d'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                7 ngày qua
              </button>
              <button
                type="button"
                onClick={() => setMovementPeriod('30d')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  movementPeriod === '30d'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                30 ngày qua
              </button>
            </div>
          </div>

          {/* Area Chart Container */}
          <div className="h-[280px] sm:h-[320px] w-full pt-4">
            {formattedMovementData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-slate-400 text-sm">
                Đang nạp dữ liệu biểu đồ...
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={formattedMovementData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="importGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="exportGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#EE3D43" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#EE3D43" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                  <XAxis
                    dataKey="date"
                    stroke="#94A3B8"
                    fontSize={11}
                    tickLine={false}
                    axisLine={{ stroke: '#E2E8F0' }}
                  />
                  <YAxis
                    stroke="#94A3B8"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(val) => `${val}`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0F172A',
                      borderColor: '#1E293B',
                      borderRadius: '12px',
                      color: '#F8FAFC',
                      fontSize: '12px',
                      boxShadow: '0 10px 25px -5px rgba(0,0,0,0.3)',
                    }}
                    labelStyle={{ color: '#94A3B8', fontWeight: 'bold', marginBottom: '4px' }}
                  />
                  <Area
                    type="monotone"
                    dataKey="Nhập kho"
                    stroke="#10B981"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#importGrad)"
                  />
                  <Area
                    type="monotone"
                    dataKey="Xuất kho"
                    stroke="#EE3D43"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#exportGrad)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5 font-semibold text-slate-700">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Nhập kho
              </span>
              <span className="flex items-center gap-1.5 font-semibold text-slate-700">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500" /> Xuất kho
              </span>
            </div>
            <span className="font-medium text-slate-400">Chu kỳ: {movementPeriod === '7d' ? '7 ngày' : '30 ngày'}</span>
          </div>
        </div>

        {/* CHART 2: Donut Chart Cơ cấu danh mục */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
                <PieIcon className="w-5 h-5 text-red-600" />
                <span>Cơ cấu danh mục</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Tỷ trọng số lượng hàng theo ngành
              </p>
            </div>
            <Link
              to="/categories"
              className="text-xs font-semibold text-red-600 hover:text-red-700 flex items-center gap-0.5"
            >
              <span>Chi tiết</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Donut Chart */}
          <div className="h-[200px] w-full relative flex items-center justify-center my-2">
            {formattedCategoryData.length === 0 ? (
              <div className="text-slate-400 text-sm">Đang nạp dữ liệu...</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0F172A',
                      borderColor: '#1E293B',
                      borderRadius: '10px',
                      color: '#F8FAFC',
                      fontSize: '11px',
                    }}
                    formatter={(val: any, name: any, item: any) => [
                      `${val} cái (${item.payload.percentage}%)`,
                      name,
                    ]}
                  />
                  <Pie
                    data={formattedCategoryData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={3}
                  >
                    {formattedCategoryData.map((_, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={CHART_COLORS[index % CHART_COLORS.length]}
                      />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            )}
            {/* Center label */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-xs text-slate-400 font-semibold">Tổng số</span>
              <span className="text-lg font-black text-slate-800 font-mono">
                {formattedCategoryData.length}
              </span>
              <span className="text-[10px] text-slate-400">ngành hàng</span>
            </div>
          </div>

          {/* Legend List */}
          <div className="space-y-2 pt-2 border-t border-slate-100 max-h-[140px] overflow-y-auto custom-scrollbar">
            {formattedCategoryData.slice(0, 5).map((cat, idx) => (
              <div key={cat.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 truncate max-w-[170px]">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: CHART_COLORS[idx % CHART_COLORS.length] }}
                  />
                  <span className="text-slate-700 font-medium truncate">{cat.name}</span>
                </div>
                <span className="font-bold text-slate-900 font-mono">
                  {cat.percentage}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ========================================================
          4. CHARTS ROW 2: BAR CHART KHO HÀNG + DANH SÁCH CẢNH BÁO
         ======================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* CHART 3: BarChart Phân bổ theo từng kho hàng */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
                <Building2 className="w-5 h-5 text-red-600" />
                <span>Phân bổ số lượng lưu kho theo chi nhánh (Kho bãi)</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                So sánh sức chứa và số lượng hàng hóa tại các kho tổng & chi nhánh
              </p>
            </div>
            <Link
              to="/warehouses"
              className="text-xs font-semibold text-red-600 hover:text-red-700 flex items-center gap-0.5"
            >
              <span>Xem kho</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Bar Chart Container */}
          <div className="h-[280px] w-full pt-4">
            {formattedWarehouseData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-slate-400 text-sm">
                Đang nạp dữ liệu kho...
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={formattedWarehouseData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                  <XAxis
                    dataKey="name"
                    stroke="#94A3B8"
                    fontSize={11}
                    tickLine={false}
                    axisLine={{ stroke: '#E2E8F0' }}
                  />
                  <YAxis
                    stroke="#94A3B8"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(val) => formatShortNumber(val)}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0F172A',
                      borderColor: '#1E293B',
                      borderRadius: '12px',
                      color: '#F8FAFC',
                      fontSize: '12px',
                    }}
                    formatter={(val: any, _name: any, item: any) => [
                      `${Number(val).toLocaleString('vi-VN')} cái (${formatVND(item.payload['Giá trị'])})`,
                      item.payload.fullName,
                    ]}
                  />
                  <Bar
                    dataKey="Số lượng"
                    fill="#EE3D43"
                    radius={[6, 6, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Dữ liệu thực tế từ cơ sở dữ liệu PostgreSQL</span>
            <span className="font-semibold text-slate-700">Tổng cộng {warehouses.length} kho</span>
          </div>
        </div>

        {/* Cảnh báo thiếu hàng & Sắp hết */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-rose-600" />
                <span>Cảnh báo cần nhập hàng khẩn</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Các sản phẩm chạm ngưỡng tồn kho tối thiểu
              </p>
            </div>
            <Link
              to="/products"
              className="text-xs font-semibold text-rose-600 hover:text-rose-700 flex items-center gap-0.5"
            >
              <span>Xem tất cả</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-2.5 py-3 flex-1 overflow-y-auto max-h-[290px] custom-scrollbar">
            {alerts.length === 0 ? (
              <div className="text-center py-12 text-slate-400 text-sm">
                <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2 opacity-80" />
                Tuyệt vời! Không có sản phẩm nào bị thiếu hụt
              </div>
            ) : (
              alerts.map((item) => {
                const isOut = item.status === 'OUT_OF_STOCK' || item.current_stock <= 0;
                return (
                  <div
                    key={item.product_id}
                    className="p-3 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-slate-50 transition-colors flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-slate-700 bg-white px-2 py-0.5 rounded border border-slate-200">
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
                      <div className="font-semibold text-slate-800 truncate mt-1">
                        {item.name}
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        Tồn: <strong className="text-rose-600">{item.current_stock}</strong> {item.unit_name} · Ngưỡng: {item.low_stock_threshold} {item.unit_name}
                      </div>
                    </div>

                    <Link
                      to="/stock-transactions?action=import"
                      className="px-3 py-1.5 rounded-lg bg-white hover:bg-slate-100 border border-slate-200 font-bold text-slate-800 shrink-0 transition-colors"
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
          5. TABLES ROW: TOP PRODUCTS (60%) + RECENT TRANSACTIONS (40%)
         ======================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Top 5 Sản phẩm xuất sắc */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-red-600" />
                <span>Top sản phẩm xuất kho nhiều nhất</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Các sản phẩm có thanh khoản và khối lượng lưu chuyển cao nhất
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

          <div className="overflow-x-auto pt-2 flex-1">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50/70 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                <tr>
                  <th className="px-3 py-2.5">Hạng</th>
                  <th className="px-3 py-2.5">Mã SKU</th>
                  <th className="px-3 py-2.5">Tên sản phẩm</th>
                  <th className="px-3 py-2.5 text-right">Số lượng</th>
                  <th className="px-3 py-2.5 text-right">Tổng giá trị</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {topProducts.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-8 text-slate-400">
                      Chưa có dữ liệu sản phẩm luân chuyển
                    </td>
                  </tr>
                ) : (
                  topProducts.slice(0, 5).map((prod, idx) => (
                    <tr key={prod.product_id} className="hover:bg-slate-50/50">
                      <td className="px-3 py-2.5 font-bold text-slate-900">
                        <span
                          className={`w-6 h-6 rounded-full inline-flex items-center justify-center text-[11px] font-bold ${
                            idx === 0
                              ? 'bg-amber-100 text-amber-800 border border-amber-300'
                              : idx === 1
                              ? 'bg-slate-100 text-slate-700 border border-slate-300'
                              : idx === 2
                              ? 'bg-orange-100 text-orange-800 border border-orange-300'
                              : 'bg-slate-50 text-slate-500'
                          }`}
                        >
                          {idx + 1}
                        </span>
                      </td>
                      <td className="px-3 py-2.5 font-mono font-bold text-slate-700">
                        {prod.sku}
                      </td>
                      <td className="px-3 py-2.5 font-semibold text-slate-800 truncate max-w-[180px]">
                        {prod.name}
                      </td>
                      <td className="px-3 py-2.5 text-right font-bold text-slate-900">
                        {prod.total_quantity.toLocaleString('vi-VN')} {prod.unit_name}
                      </td>
                      <td className="px-3 py-2.5 text-right font-bold text-red-600 font-mono">
                        {formatVND(prod.total_value)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Nhật ký giao dịch gần nhất */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
                <Clock className="w-5 h-5 text-red-600" />
                <span>Giao dịch xuất nhập gần nhất</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Các phiếu xuất / nhập kho mới phát sinh
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

          <div className="space-y-2 py-2 flex-1">
            {recentTxs.length === 0 ? (
              <div className="text-center py-8 text-slate-400 text-sm">
                Chưa có giao dịch kho gần đây
              </div>
            ) : (
              recentTxs.slice(0, 5).map((tx) => {
                const isImport = tx.type === 'IMPORT';
                return (
                  <div
                    key={tx.id}
                    className="p-2.5 rounded-xl border border-slate-100 hover:border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition-colors flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                          isImport
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-rose-100 text-rose-700'
                        }`}
                      >
                        {isImport ? (
                          <ArrowDownLeft className="w-3.5 h-3.5" />
                        ) : (
                          <ArrowUpRight className="w-3.5 h-3.5" />
                        )}
                      </div>
                      <div>
                        <div className="font-bold text-slate-800 font-mono">
                          {tx.reference_no}
                        </div>
                        <div className="text-[11px] text-slate-400">
                          {tx.warehouse_name} · {tx.creator_name || 'Nhân viên'}
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <span
                        className={`font-bold px-2 py-0.5 rounded text-[10px] ${
                          isImport
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}
                      >
                        {isImport ? 'Nhập' : 'Xuất'}
                      </span>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        {new Date(tx.created_at).toLocaleDateString('vi-VN')}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <div className="pt-2 border-t border-slate-100 text-center">
            <Link
              to="/stock-transactions"
              className="text-xs font-bold text-slate-700 hover:text-red-600 transition-colors"
            >
              Mở toàn bộ sổ cái xuất nhập kho →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
