import React from 'react';

interface ChartBarData {
  date: string;
  value: number;
  heightPercent: number;
}

const barData: ChartBarData[] = [
  { date: '28/10', value: 8, heightPercent: 75 },
  { date: '29/10', value: 9, heightPercent: 85 },
  { date: '30/10', value: 8, heightPercent: 75 },
  { date: '02/11', value: 10, heightPercent: 100 },
  { date: '03/11', value: 9, heightPercent: 85 },
];

const pendingTransactions = [
  {
    id: 'PXK-2026-003',
    type: 'Xuất kho',
    typeColor: 'text-amber-700 bg-amber-50 border-amber-200',
    partner: 'Đại lý Miền Nam (Lô 12)',
    warehouse: 'Kho Tổng Hà Nội',
    quantity: '450 thùng',
    time: '08:30 Hôm nay',
    status: 'Chờ duyệt',
  },
  {
    id: 'PNK-2026-089',
    type: 'Nhập kho',
    typeColor: 'text-emerald-700 bg-emerald-50 border-emerald-200',
    partner: 'Công ty Cung ứng Á Châu',
    warehouse: 'Kho Chi nhánh 1',
    quantity: '1,200 cái',
    time: '09:15 Hôm nay',
    status: 'Chờ duyệt',
  },
  {
    id: 'PDC-2026-014',
    type: 'Điều chuyển',
    typeColor: 'text-blue-700 bg-blue-50 border-blue-200',
    partner: 'Kho Tổng -> Kho Phụ',
    warehouse: 'Kho Trung tâm',
    quantity: '300 hộp',
    time: 'Hôm qua',
    status: 'Chờ nhận',
  },
];

export const Dashboard: React.FC = () => {
  return (
    <div className="p-8 max-w-7xl mx-auto space-y-7">
      {/* 1. Header Section - Thoáng đãng, thanh lịch */}
      <div>
        <div className="text-xs font-bold text-brand-primary tracking-wider uppercase mb-1.5">
          Thứ ba, 03 tháng 11
        </div>
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
          Nhịp làm việc hôm nay
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Tình hình nhân sự và chấm công toàn doanh nghiệp.
        </p>
      </div>

      {/* 2. KPI Stats Row */}
      <div className="bg-white rounded-2xl border border-slate-100/90 shadow-2xs overflow-hidden">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-slate-100">
          <div className="p-5.5">
            <div className="text-xs font-medium text-slate-400 mb-1.5">Nhân viên</div>
            <div className="text-3xl font-extrabold text-slate-900 tracking-tight">12</div>
            <div className="text-[11px] text-slate-400 mt-1.5 font-normal">10 đang làm việc</div>
          </div>

          <div className="p-5.5">
            <div className="text-xs font-medium text-slate-400 mb-1.5">Đã có mặt</div>
            <div className="text-3xl font-extrabold text-slate-900 tracking-tight">09</div>
            <div className="text-[11px] text-slate-400 mt-1.5 font-normal">Trong đó 2 đi muộn</div>
          </div>

          <div className="p-5.5">
            <div className="text-xs font-medium text-slate-400 mb-1.5">Chưa có mặt</div>
            <div className="text-3xl font-extrabold text-slate-900 tracking-tight">01</div>
            <div className="text-[11px] text-slate-400 mt-1.5 font-normal">Chưa ghi nhận check-in</div>
          </div>

          <div className="p-5.5">
            <div className="text-xs font-medium text-slate-400 mb-1.5">Đơn chờ xử lý</div>
            <div className="text-3xl font-extrabold text-slate-900 tracking-tight">03</div>
            <div className="text-[11px] text-slate-400 mt-1.5 font-normal">Cần được xem xét</div>
          </div>
        </div>
      </div>

      {/* 3. Main Chart & Notice Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        <div className="lg:col-span-8 bg-white rounded-2xl p-6 border border-slate-100/90 shadow-2xs flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Có mặt trong 5 ngày gần nhất</h3>
            <p className="text-[11px] text-slate-400 mt-0.5">Số người đã check-in · Dữ liệu minh họa</p>
          </div>

          <div className="pt-8 pb-3">
            <div className="h-40 flex items-end justify-between gap-4 px-6">
              {barData.map((item) => (
                <div key={item.date} className="flex-1 flex flex-col items-center gap-1.5 group">
                  <span className="text-xs font-semibold text-slate-700 transition-transform group-hover:-translate-y-1">
                    {item.value}
                  </span>
                  <div className="w-full max-w-[60px] bg-slate-100 rounded-t-sm overflow-hidden flex items-end h-32">
                    <div
                      className="w-full bg-brand-primary rounded-t-sm transition-all duration-500 ease-out group-hover:bg-brand-hover"
                      style={{ height: `${item.heightPercent}%` }}
                    ></div>
                  </div>
                  <span className="text-[11px] font-medium text-slate-400 mt-1">
                    {item.date}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="lg:col-span-4 bg-brand-light rounded-2xl p-6 border border-brand-border/50 flex flex-col justify-between">
          <div>
            <div className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
              Cần chú ý
            </div>
            <h3 className="text-xl font-extrabold text-slate-900 mt-2 leading-snug">
              3 đơn nghỉ đang chờ xử lý
            </h3>
            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
              Xem thời gian nghỉ và người gửi trước khi quyết định.
            </p>

            <button className="w-full mt-5 bg-brand-primary hover:bg-brand-hover text-white py-2.5 px-4 rounded-xl text-xs font-semibold transition-all shadow-xs cursor-pointer active:scale-[0.99]">
              Xem đơn chờ xử lý
            </button>
          </div>

          <div className="pt-5 border-t border-brand-border/50 mt-5">
            <div className="text-[11px] text-slate-500 font-medium">Chấm công của bạn</div>
            <div className="text-xs text-slate-700 font-normal mt-0.5">
              Hôm nay bạn chưa check-in.
            </div>
            <button className="mt-3 w-full text-center text-xs font-bold text-slate-800 hover:text-brand-primary transition-colors cursor-pointer py-0.5">
              Mở chấm công của tôi
            </button>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-900">
            Chấm công cần xem xét
          </h3>
          <button className="px-3.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors shadow-2xs cursor-pointer">
            Xem tất cả
          </button>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100/90 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/70 border-b border-slate-100 text-slate-500 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="py-3 px-6">Mã giao dịch</th>
                  <th className="py-3 px-6">Loại phiếu</th>
                  <th className="py-3 px-6">Đối tác / Chi nhánh</th>
                  <th className="py-3 px-6">Kho hàng</th>
                  <th className="py-3 px-6">Số lượng</th>
                  <th className="py-3 px-6">Thời gian</th>
                  <th className="py-3 px-6 text-right">Trạng thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {pendingTransactions.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-6 font-semibold text-slate-900">{item.id}</td>
                    <td className="py-3.5 px-6">
                      <span className={`inline-flex px-2 py-0.5 rounded-md text-[11px] font-semibold border ${item.typeColor}`}>
                        {item.type}
                      </span>
                    </td>
                    <td className="py-3.5 px-6">{item.partner}</td>
                    <td className="py-3.5 px-6 text-slate-500">{item.warehouse}</td>
                    <td className="py-3.5 px-6 font-medium">{item.quantity}</td>
                    <td className="py-3.5 px-6 text-slate-400">{item.time}</td>
                    <td className="py-3.5 px-6 text-right">
                      <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                        {item.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

