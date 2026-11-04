import React from 'react';
import { Inbox, BarChart2, CheckCircle2 } from 'lucide-react';

export const Dashboard: React.FC = () => {
  return (
    <div className="p-8 max-w-7xl mx-auto space-y-7">
      {/* 1. Header Section */}
      <div>
        <div className="text-xs font-bold text-brand-primary tracking-wider uppercase mb-1.5">
          Tổng quan hệ thống
        </div>
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
          Tình hình kho hôm nay
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Số liệu thống kê hoạt động xuất nhập tồn toàn hệ thống.
        </p>
      </div>

      {/* 2. KPI Stats Row - Để trống khi chưa kết nối */}
      <div className="bg-white rounded-2xl border border-slate-100/90 shadow-2xs overflow-hidden">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-slate-100">
          <div className="p-5.5">
            <div className="text-xs font-medium text-slate-400 mb-1.5">Tổng sản phẩm (SKU)</div>
            <div className="text-3xl font-extrabold text-slate-900 tracking-tight">-</div>
            <div className="text-[11px] text-slate-400 mt-1.5 font-normal">Chưa có số liệu</div>
          </div>

          <div className="p-5.5">
            <div className="text-xs font-medium text-slate-400 mb-1.5">Tồn kho khả dụng</div>
            <div className="text-3xl font-extrabold text-slate-900 tracking-tight">-</div>
            <div className="text-[11px] text-slate-400 mt-1.5 font-normal">Chưa có số liệu</div>
          </div>

          <div className="p-5.5">
            <div className="text-xs font-medium text-slate-400 mb-1.5">Hàng sắp hết</div>
            <div className="text-3xl font-extrabold text-slate-900 tracking-tight">-</div>
            <div className="text-[11px] text-slate-400 mt-1.5 font-normal">Dưới định mức an toàn</div>
          </div>

          <div className="p-5.5">
            <div className="text-xs font-medium text-slate-400 mb-1.5">Đơn chờ duyệt</div>
            <div className="text-3xl font-extrabold text-slate-900 tracking-tight">-</div>
            <div className="text-[11px] text-slate-400 mt-1.5 font-normal">Chờ thủ kho xác nhận</div>
          </div>
        </div>
      </div>

      {/* 3. Main Chart & Notice Grid - Trống sạch sẽ */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        <div className="lg:col-span-8 bg-white rounded-2xl p-6 border border-slate-100/90 shadow-2xs flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Biến động xuất / nhập 5 ngày gần nhất</h3>
            <p className="text-[11px] text-slate-400 mt-0.5">Biểu đồ tổng hợp lượng hàng xuất nhập</p>
          </div>

          <div className="py-12 flex flex-col items-center justify-center text-slate-400">
            <BarChart2 className="w-10 h-10 stroke-[1.5] text-slate-300 mb-2" />
            <p className="text-xs font-medium text-slate-500">Chưa có dữ liệu biến động kho</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Dữ liệu sẽ hiển thị khi phát sinh giao dịch nhập xuất</p>
          </div>
        </div>

        <div className="lg:col-span-4 bg-brand-light rounded-2xl p-6 border border-brand-border/50 flex flex-col justify-between">
          <div>
            <div className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
              Cần chú ý
            </div>
            <h3 className="text-xl font-extrabold text-slate-900 mt-2 leading-snug">
              Không có cảnh báo
            </h3>
            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
              Hệ thống đang vận hành ổn định, không có phiếu tồn đọng hay cảnh báo khẩn cấp.
            </p>
          </div>

          <div className="pt-5 border-t border-brand-border/50 mt-5 flex items-center gap-2 text-xs text-slate-600 font-medium">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Tất cả phiếu kho đã được xử lý</span>
          </div>
        </div>
      </div>

      {/* 4. Bottom Section: Danh sách giao dịch - Trống */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-900">
            Giao dịch kho gần đây
          </h3>
          <button className="px-3.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors shadow-2xs cursor-pointer">
            Xem tất cả
          </button>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100/90 shadow-2xs p-10 flex flex-col items-center justify-center text-slate-400">
          <Inbox className="w-10 h-10 stroke-[1.5] text-slate-300 mb-2" />
          <p className="text-xs font-medium text-slate-600">Chưa có giao dịch phát sinh</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Các phiếu nhập xuất mới sẽ xuất hiện tại đây</p>
        </div>
      </div>
    </div>
  );
};
