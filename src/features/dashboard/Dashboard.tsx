import React, { useEffect, useState } from 'react';
import {
  PackageCheck,
  Truck,
  Send,
  FileCheck2,
  ChevronDown,
  Layers,
  TrendingUp,
  ShoppingBag,
  AlertTriangle,
} from 'lucide-react';
import { dashboardService, DashboardStats, TopProduct } from '../../services/dashboard.service';

export const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsData, topData] = await Promise.allSettled([
          dashboardService.getStats(),
          dashboardService.getTopProducts(),
        ]);

        if (statsData.status === 'fulfilled') {
          setStats(statsData.value);
        }
        if (topData.status === 'fulfilled') {
          setTopProducts(topData.value);
        }
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      }
    };

    fetchData();
  }, []);

  const totalQuantity = stats?.total_inventory_quantity || 7593;
  const totalProducts = stats?.total_products || 50;
  const lowStockCount = stats?.low_stock_count ?? 1;

  return (
    <div className="p-6 sm:p-8 max-w-[1600px] mx-auto space-y-7 text-slate-800">
      {/* ========================================================
          ROW 1: SALES ACTIVITY (65%) + INVENTORY SUMMARY (35%)
         ======================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Card: Sales Activity */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-7 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight">
                Sales Activity
              </h3>
              <p className="text-sm text-slate-500 font-medium mt-0.5">
                Hoạt động bán hàng & xuất nhập kho hôm nay
              </p>
            </div>
            <span className="text-xs sm:text-sm font-bold text-slate-600 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
              Hôm nay
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-slate-100 pt-2">
            {/* 1. To Be Packed */}
            <div className="p-4 text-center flex flex-col items-center justify-center">
              <div className="text-4xl sm:text-5xl font-black text-sky-600 tracking-tight font-mono">
                228
              </div>
              <div className="text-xs sm:text-sm text-slate-400 font-medium mt-1">Số lượng hàng</div>
              <div className="flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-700 mt-3 uppercase tracking-wider">
                <PackageCheck className="w-4 h-4 text-sky-500" />
                <span>To Be Packed</span>
              </div>
            </div>

            {/* 2. To Be Shipped */}
            <div className="p-4 text-center flex flex-col items-center justify-center">
              <div className="text-4xl sm:text-5xl font-black text-[#EE3D43] tracking-tight font-mono">
                6
              </div>
              <div className="text-xs sm:text-sm text-slate-400 font-medium mt-1">Kiện hàng</div>
              <div className="flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-700 mt-3 uppercase tracking-wider">
                <Truck className="w-4 h-4 text-[#EE3D43]" />
                <span>To Be Shipped</span>
              </div>
            </div>

            {/* 3. To Be Delivered */}
            <div className="p-4 text-center flex flex-col items-center justify-center">
              <div className="text-4xl sm:text-5xl font-black text-emerald-600 tracking-tight font-mono">
                10
              </div>
              <div className="text-xs sm:text-sm text-slate-400 font-medium mt-1">Vận đơn giao</div>
              <div className="flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-700 mt-3 uppercase tracking-wider">
                <Send className="w-4 h-4 text-emerald-500" />
                <span>To Be Delivered</span>
              </div>
            </div>

            {/* 4. To Be Invoiced */}
            <div className="p-4 text-center flex flex-col items-center justify-center">
              <div className="text-4xl sm:text-5xl font-black text-indigo-600 tracking-tight font-mono">
                474
              </div>
              <div className="text-xs sm:text-sm text-slate-400 font-medium mt-1">Phiếu xuất kho</div>
              <div className="flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-700 mt-3 uppercase tracking-wider">
                <FileCheck2 className="w-4 h-4 text-indigo-500" />
                <span>To Be Invoiced</span>
              </div>
            </div>
          </div>
        </div>

        {/* Card: Inventory Summary */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-7 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight">
                Inventory Summary
              </h3>
              <p className="text-sm text-slate-500 font-medium mt-0.5">
                Tổng hợp lượng tồn kho toàn hệ thống
              </p>
            </div>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 ring-4 ring-emerald-100" />
          </div>

          <div className="space-y-4 pt-1">
            {/* Panel: Quantity In Hand */}
            <div className="flex items-center justify-between p-4 sm:p-5 rounded-xl bg-slate-50 border border-slate-200/80">
              <div className="text-xs sm:text-sm font-bold text-slate-600 uppercase tracking-wider">
                Quantity In Hand <br />
                <span className="text-xs font-normal text-slate-400 lowercase">(Tồn thực tế)</span>
              </div>
              <div className="text-2xl sm:text-3xl font-black text-slate-900 font-mono">
                {totalQuantity.toLocaleString()}
              </div>
            </div>

            {/* Panel: Quantity To Be Received */}
            <div className="flex items-center justify-between p-4 sm:p-5 rounded-xl bg-slate-50 border border-slate-200/80">
              <div className="text-xs sm:text-sm font-bold text-slate-600 uppercase tracking-wider">
                Quantity To Be Received <br />
                <span className="text-xs font-normal text-slate-400 lowercase">(Sắp nhập về)</span>
              </div>
              <div className="text-2xl sm:text-3xl font-black text-slate-900 font-mono">
                168
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================
          ROW 2: PRODUCT DETAILS (50%) + TOP SELLING ITEMS (50%)
         ======================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Card: Product Details */}
        <div className="lg:col-span-6 bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-7 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-5 border-b border-slate-100 pb-3.5">
            <h3 className="text-base sm:text-lg font-extrabold text-slate-900 uppercase tracking-wider">
              Product Details <span className="text-xs font-semibold text-slate-400 lowercase">(Chi tiết sản phẩm)</span>
            </h3>
            <span className="text-xs sm:text-sm font-bold text-slate-500">Toàn hệ thống</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 items-center pt-1">
            {/* Left stats list */}
            <div className="sm:col-span-7 space-y-3.5">
              <div className="flex items-center justify-between text-sm sm:text-base py-1.5 border-b border-slate-100">
                <span className="text-rose-600 font-bold flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  Low Stock Items
                </span>
                <span className="font-black text-rose-600 text-lg sm:text-xl font-mono">{lowStockCount}</span>
              </div>

              <div className="flex items-center justify-between text-sm sm:text-base py-1.5 border-b border-slate-100">
                <span className="text-slate-700 font-semibold">All Item Groups</span>
                <span className="font-black text-slate-900 text-base sm:text-lg font-mono">12</span>
              </div>

              <div className="flex items-center justify-between text-sm sm:text-base py-1.5 border-b border-slate-100">
                <span className="text-slate-700 font-semibold">All Items (SKU)</span>
                <span className="font-black text-slate-900 text-base sm:text-lg font-mono">{totalProducts}</span>
              </div>

              <div className="flex items-center justify-between text-sm sm:text-base py-1.5">
                <span className="text-slate-700 font-semibold">Unconfirmed Items</span>
                <span className="font-bold text-slate-500 text-base sm:text-lg font-mono">15</span>
              </div>
            </div>

            {/* Right Donut Meter */}
            <div className="sm:col-span-5 flex flex-col items-center justify-center p-3">
              <div className="relative w-28 h-28 flex items-center justify-center">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                  <path
                    className="text-slate-100"
                    strokeWidth="3.6"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    className="text-emerald-500"
                    strokeDasharray="71, 100"
                    strokeWidth="3.6"
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <div className="absolute text-center">
                  <span className="text-xl sm:text-2xl font-black text-slate-900">71%</span>
                </div>
              </div>
              <div className="text-xs sm:text-sm font-bold text-slate-600 uppercase tracking-wider mt-3">
                Active Items
              </div>
            </div>
          </div>
        </div>

        {/* Card: Top Selling Items */}
        <div className="lg:col-span-6 bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-7 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-5 border-b border-slate-100 pb-3.5">
            <h3 className="text-base sm:text-lg font-extrabold text-slate-900 uppercase tracking-wider">
              Top Selling Items <span className="text-xs font-semibold text-slate-400 lowercase">(Sản phẩm xuất nhiều nhất)</span>
            </h3>
            <div className="flex items-center gap-1.5 text-xs sm:text-sm font-bold text-slate-600 cursor-pointer hover:text-slate-900">
              <span>This Month</span>
              <ChevronDown className="w-4 h-4 text-slate-400" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-1">
            {/* Top Product 1 */}
            <div className="flex flex-col items-center text-center p-4 rounded-xl bg-slate-50/90 border border-slate-200">
              <div className="w-16 h-16 rounded-xl bg-white border border-slate-200 flex items-center justify-center p-2 mb-3 shadow-2xs">
                <ShoppingBag className="w-8 h-8 text-amber-500" />
              </div>
              <h4 className="text-sm sm:text-base font-bold text-slate-900 line-clamp-1">
                {topProducts[0]?.name || 'Chuột Logitech MX Master 3S'}
              </h4>
              <div className="text-xs sm:text-sm text-slate-400 font-mono mt-0.5">
                {topProducts[0]?.sku || 'LOGI-MX3S'}
              </div>
              <div className="text-lg sm:text-xl font-black text-slate-900 mt-2 font-mono">
                {topProducts[0]?.total_quantity || 171}{' '}
                <span className="text-xs sm:text-sm font-medium text-slate-500">pcs</span>
              </div>
            </div>

            {/* Top Product 2 */}
            <div className="flex flex-col items-center text-center p-4 rounded-xl bg-slate-50/90 border border-slate-200">
              <div className="w-16 h-16 rounded-xl bg-white border border-slate-200 flex items-center justify-center p-2 mb-3 shadow-2xs">
                <Layers className="w-8 h-8 text-blue-500" />
              </div>
              <h4 className="text-sm sm:text-base font-bold text-slate-900 line-clamp-1">
                {topProducts[1]?.name || 'Màn hình Dell UltraSharp U2723QE'}
              </h4>
              <div className="text-xs sm:text-sm text-slate-400 font-mono mt-0.5">
                {topProducts[1]?.sku || 'DELL-U2723'}
              </div>
              <div className="text-lg sm:text-xl font-black text-slate-900 mt-2 font-mono">
                {topProducts[1]?.total_quantity || 45}{' '}
                <span className="text-xs sm:text-sm font-medium text-slate-500">sets</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================
          ROW 3: PURCHASE ORDER (35%) + SALES ORDER TABLE (65%)
         ======================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Card: Purchase Order */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-7 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-5 border-b border-slate-100 pb-3.5">
            <h3 className="text-base sm:text-lg font-extrabold text-slate-900 uppercase tracking-wider">
              Purchase Order
            </h3>
            <div className="flex items-center gap-1.5 text-xs sm:text-sm font-bold text-slate-600 cursor-pointer hover:text-slate-900">
              <span>This Month</span>
              <ChevronDown className="w-4 h-4 text-slate-400" />
            </div>
          </div>

          <div className="py-6 flex flex-col items-center justify-center text-center">
            <div className="text-xs sm:text-sm font-bold text-slate-500 uppercase tracking-wider mb-2">
              Quantity Ordered <span className="text-xs font-normal text-slate-400 lowercase">(Đã đặt nhập)</span>
            </div>
            <div className="text-5xl font-black text-sky-600 font-mono tracking-tight">
              652.00
            </div>
            <div className="flex items-center gap-2 text-sm text-emerald-600 font-bold mt-4">
              <TrendingUp className="w-4 h-4" />
              <span>+12.4% so với tháng trước</span>
            </div>
          </div>
        </div>

        {/* Card: Sales Order Table */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-7 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3.5">
            <div>
              <h3 className="text-base sm:text-lg font-extrabold text-slate-900 uppercase tracking-wider">
                Sales Order Status
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
                Tình trạng xử lý đơn hàng theo kênh luân chuyển
              </p>
            </div>
            <span className="text-xs sm:text-sm font-bold text-slate-600 bg-slate-100 px-3 py-1 rounded-lg">
              Thời gian thực
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 text-xs sm:text-sm uppercase tracking-wider font-bold bg-slate-50/50">
                  <th className="py-3 px-4">Channel (Kênh)</th>
                  <th className="py-3 px-4 text-center">Draft (Nháp)</th>
                  <th className="py-3 px-4 text-center">Confirmed</th>
                  <th className="py-3 px-4 text-center">Packed</th>
                  <th className="py-3 px-4 text-center">Shipped</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-800 text-sm sm:text-base">
                <tr className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-slate-900 flex items-center gap-2.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                    Direct sales (Bán trực tiếp)
                  </td>
                  <td className="py-3.5 px-4 text-center font-mono font-medium text-slate-400">0</td>
                  <td className="py-3.5 px-4 text-center font-mono font-black text-sky-600 text-base">50</td>
                  <td className="py-3.5 px-4 text-center font-mono font-medium text-slate-400">0</td>
                  <td className="py-3.5 px-4 text-center font-mono font-medium text-slate-400">0</td>
                </tr>

                <tr className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-slate-900 flex items-center gap-2.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#EE3D43]" />
                    Wholesale (Đại lý & Chi nhánh)
                  </td>
                  <td className="py-3.5 px-4 text-center font-mono font-medium text-slate-400">2</td>
                  <td className="py-3.5 px-4 text-center font-mono font-black text-sky-600 text-base">28</td>
                  <td className="py-3.5 px-4 text-center font-mono font-black text-amber-600 text-base">12</td>
                  <td className="py-3.5 px-4 text-center font-mono font-black text-emerald-600 text-base">16</td>
                </tr>

                <tr className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-slate-900 flex items-center gap-2.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                    Online / E-Commerce
                  </td>
                  <td className="py-3.5 px-4 text-center font-mono font-medium text-slate-400">8</td>
                  <td className="py-3.5 px-4 text-center font-mono font-black text-sky-600 text-base">94</td>
                  <td className="py-3.5 px-4 text-center font-mono font-black text-amber-600 text-base">35</td>
                  <td className="py-3.5 px-4 text-center font-mono font-black text-emerald-600 text-base">51</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
