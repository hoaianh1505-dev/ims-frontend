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
    <div className="p-6 max-w-[1600px] mx-auto space-y-6 text-slate-800">
      {/* ========================================================
          ROW 1: SALES ACTIVITY (65%) + INVENTORY SUMMARY (35%)
         ======================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        {/* Card: Sales Activity */}
        <div className="lg:col-span-8 bg-white rounded-xl border border-slate-200/90 p-5 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-900 tracking-tight">
              Sales Activity <span className="text-xs font-normal text-slate-400 ml-1.5">(Hoạt động xuất nhập)</span>
            </h3>
            <span className="text-[11px] font-semibold text-slate-400 bg-slate-50 px-2.5 py-1 rounded-md border border-slate-200">
              Hôm nay
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-slate-100 pt-1">
            {/* 1. To Be Packed */}
            <div className="p-3 text-center flex flex-col items-center justify-center">
              <div className="text-3xl font-extrabold text-sky-600 tracking-tight">
                228
              </div>
              <div className="text-[11px] text-slate-400 font-medium mt-0.5">Số lượng</div>
              <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-600 mt-2.5 uppercase tracking-wider">
                <PackageCheck className="w-3.5 h-3.5 text-sky-500" />
                <span>To Be Packed</span>
              </div>
            </div>

            {/* 2. To Be Shipped */}
            <div className="p-3 text-center flex flex-col items-center justify-center">
              <div className="text-3xl font-extrabold text-[#EE3D43] tracking-tight">
                6
              </div>
              <div className="text-[11px] text-slate-400 font-medium mt-0.5">Kiện hàng</div>
              <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-600 mt-2.5 uppercase tracking-wider">
                <Truck className="w-3.5 h-3.5 text-[#EE3D43]" />
                <span>To Be Shipped</span>
              </div>
            </div>

            {/* 3. To Be Delivered */}
            <div className="p-3 text-center flex flex-col items-center justify-center">
              <div className="text-3xl font-extrabold text-emerald-600 tracking-tight">
                10
              </div>
              <div className="text-[11px] text-slate-400 font-medium mt-0.5">Vận đơn</div>
              <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-600 mt-2.5 uppercase tracking-wider">
                <Send className="w-3.5 h-3.5 text-emerald-500" />
                <span>To Be Delivered</span>
              </div>
            </div>

            {/* 4. To Be Invoiced */}
            <div className="p-3 text-center flex flex-col items-center justify-center">
              <div className="text-3xl font-extrabold text-indigo-600 tracking-tight">
                474
              </div>
              <div className="text-[11px] text-slate-400 font-medium mt-0.5">Phiếu xuất</div>
              <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-600 mt-2.5 uppercase tracking-wider">
                <FileCheck2 className="w-3.5 h-3.5 text-indigo-500" />
                <span>To Be Invoiced</span>
              </div>
            </div>
          </div>
        </div>

        {/* Card: Inventory Summary */}
        <div className="lg:col-span-4 bg-white rounded-xl border border-slate-200/90 p-5 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-slate-900 tracking-tight">
              Inventory Summary <span className="text-xs font-normal text-slate-400 ml-1.5">(Tồn kho)</span>
            </h3>
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
          </div>

          <div className="space-y-3 pt-1">
            {/* Panel: Quantity In Hand */}
            <div className="flex items-center justify-between p-3.5 rounded-lg bg-slate-50 border border-slate-200/80">
              <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Quantity In Hand
              </div>
              <div className="text-lg font-black text-slate-900 font-mono">
                {totalQuantity.toLocaleString()}
              </div>
            </div>

            {/* Panel: Quantity To Be Received */}
            <div className="flex items-center justify-between p-3.5 rounded-lg bg-slate-50 border border-slate-200/80">
              <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Quantity To Be Received
              </div>
              <div className="text-lg font-black text-slate-900 font-mono">
                168
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================
          ROW 2: PRODUCT DETAILS (50%) + TOP SELLING ITEMS (50%)
         ======================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        {/* Card: Product Details */}
        <div className="lg:col-span-6 bg-white rounded-xl border border-slate-200/90 p-5 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Product Details
            </h3>
            <span className="text-[11px] text-slate-400 font-medium">Toàn hệ thống</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
            {/* Left stats list */}
            <div className="sm:col-span-7 space-y-2.5">
              <div className="flex items-center justify-between text-xs py-1 border-b border-slate-50">
                <span className="text-rose-600 font-bold flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  Low Stock Items
                </span>
                <span className="font-extrabold text-rose-600">{lowStockCount}</span>
              </div>

              <div className="flex items-center justify-between text-xs py-1 border-b border-slate-50">
                <span className="text-slate-600 font-medium">All Item Group</span>
                <span className="font-bold text-slate-900">12</span>
              </div>

              <div className="flex items-center justify-between text-xs py-1 border-b border-slate-50">
                <span className="text-slate-600 font-medium">All Items</span>
                <span className="font-bold text-slate-900">{totalProducts}</span>
              </div>

              <div className="flex items-center justify-between text-xs py-1">
                <span className="text-slate-600 font-medium">Unconfirmed Items</span>
                <span className="font-bold text-slate-500">15</span>
              </div>
            </div>

            {/* Right Donut Meter */}
            <div className="sm:col-span-5 flex flex-col items-center justify-center p-2">
              <div className="relative w-24 h-24 flex items-center justify-center">
                {/* SVG Donut */}
                <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                  {/* Background Track */}
                  <path
                    className="text-slate-100"
                    strokeWidth="3.8"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  {/* Green Progress Arc 71% */}
                  <path
                    className="text-emerald-500"
                    strokeDasharray="71, 100"
                    strokeWidth="3.8"
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                {/* Center text */}
                <div className="absolute text-center">
                  <span className="text-base font-black text-slate-900">71%</span>
                </div>
              </div>
              <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mt-2">
                Active Items
              </div>
            </div>
          </div>
        </div>

        {/* Card: Top Selling Items */}
        <div className="lg:col-span-6 bg-white rounded-xl border border-slate-200/90 p-5 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Top Selling Items
            </h3>
            <div className="flex items-center gap-1 text-[11px] font-semibold text-slate-500 cursor-pointer hover:text-slate-800">
              <span>This Month</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Top Product 1 */}
            <div className="flex flex-col items-center text-center p-3 rounded-xl bg-slate-50/80 border border-slate-100">
              <div className="w-14 h-14 rounded-lg bg-white border border-slate-200 flex items-center justify-center p-2 mb-2 shadow-2xs">
                <ShoppingBag className="w-7 h-7 text-amber-500" />
              </div>
              <h4 className="text-xs font-bold text-slate-800 line-clamp-1">
                {topProducts[0]?.name || 'Chuột Logitech MX Master 3S'}
              </h4>
              <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                {topProducts[0]?.sku || 'LOGI-MX3S'}
              </div>
              <div className="text-base font-black text-slate-900 mt-2">
                {topProducts[0]?.total_quantity || 171}{' '}
                <span className="text-xs font-normal text-slate-500">pcs</span>
              </div>
            </div>

            {/* Top Product 2 */}
            <div className="flex flex-col items-center text-center p-3 rounded-xl bg-slate-50/80 border border-slate-100">
              <div className="w-14 h-14 rounded-lg bg-white border border-slate-200 flex items-center justify-center p-2 mb-2 shadow-2xs">
                <Layers className="w-7 h-7 text-blue-500" />
              </div>
              <h4 className="text-xs font-bold text-slate-800 line-clamp-1">
                {topProducts[1]?.name || 'Màn hình Dell UltraSharp U2723QE'}
              </h4>
              <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                {topProducts[1]?.sku || 'DELL-U2723'}
              </div>
              <div className="text-base font-black text-slate-900 mt-2">
                {topProducts[1]?.total_quantity || 45}{' '}
                <span className="text-xs font-normal text-slate-500">sets</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================
          ROW 3: PURCHASE ORDER (35%) + SALES ORDER TABLE (65%)
         ======================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        {/* Card: Purchase Order */}
        <div className="lg:col-span-4 bg-white rounded-xl border border-slate-200/90 p-5 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Purchase Order
            </h3>
            <div className="flex items-center gap-1 text-[11px] font-semibold text-slate-500 cursor-pointer hover:text-slate-800">
              <span>This Month</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </div>
          </div>

          <div className="py-6 flex flex-col items-center justify-center text-center">
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
              Quantity Ordered
            </div>
            <div className="text-4xl font-black text-sky-600 font-mono tracking-tight">
              652.00
            </div>
            <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-semibold mt-3">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>+12.4% so với tháng trước</span>
            </div>
          </div>
        </div>

        {/* Card: Sales Order Table */}
        <div className="lg:col-span-8 bg-white rounded-xl border border-slate-200/90 p-5 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-3">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Sales Order Status
            </h3>
            <span className="text-[11px] font-semibold text-slate-400">
              Theo kênh luân chuyển
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 text-[11px] uppercase tracking-wider font-bold">
                  <th className="py-2.5 px-3">Channel</th>
                  <th className="py-2.5 px-3 text-center">Draft</th>
                  <th className="py-2.5 px-3 text-center">Confirmed</th>
                  <th className="py-2.5 px-3 text-center">Packed</th>
                  <th className="py-2.5 px-3 text-center">Shipped</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                <tr className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3 px-3 font-semibold text-slate-900 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-blue-500" />
                    Direct sales (Bán trực tiếp)
                  </td>
                  <td className="py-3 px-3 text-center font-mono font-medium text-slate-400">0</td>
                  <td className="py-3 px-3 text-center font-mono font-bold text-sky-600">50</td>
                  <td className="py-3 px-3 text-center font-mono font-medium text-slate-400">0</td>
                  <td className="py-3 px-3 text-center font-mono font-medium text-slate-400">0</td>
                </tr>

                <tr className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3 px-3 font-semibold text-slate-900 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#EE3D43]" />
                    Wholesale (Đại lý & Chi nhánh)
                  </td>
                  <td className="py-3 px-3 text-center font-mono font-medium text-slate-400">2</td>
                  <td className="py-3 px-3 text-center font-mono font-bold text-sky-600">28</td>
                  <td className="py-3 px-3 text-center font-mono font-bold text-amber-600">12</td>
                  <td className="py-3 px-3 text-center font-mono font-bold text-emerald-600">16</td>
                </tr>

                <tr className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3 px-3 font-semibold text-slate-900 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    Online / E-Commerce
                  </td>
                  <td className="py-3 px-3 text-center font-mono font-medium text-slate-400">8</td>
                  <td className="py-3 px-3 text-center font-mono font-bold text-sky-600">94</td>
                  <td className="py-3 px-3 text-center font-mono font-bold text-amber-600">35</td>
                  <td className="py-3 px-3 text-center font-mono font-bold text-emerald-600">51</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
