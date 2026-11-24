import React, { useState } from 'react';
import {
  ArrowRight,
  Clock,
  Eye,
  EyeOff,
  Lock,
  Mail,
  Phone,
  ShieldAlert,
  ShieldCheck,
  User,
  Warehouse,
  X,
} from 'lucide-react';
import { Logo } from '../components/layout/Logo';
import { useAuthStore } from '../stores/auth.store';
import { showToast } from '../utils/toast.util';

export const LoginPage: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSuccess, setForgotSuccess] = useState(false);

  const { login, isLoading } = useAuthStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      showToast.warn('Vui lòng nhập tên tài khoản và mật khẩu.');
      return;
    }

    const success = await login({ username: username.trim(), password });
    if (success) {
      showToast.success('Đăng nhập thành công! Đang chuyển hướng...');
    } else {
      const errorMsg =
        useAuthStore.getState().error ||
        'Tên tài khoản hoặc mật khẩu không chính xác.';
      showToast.error(errorMsg);
    }
  };

  const handleForgotSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail.trim()) return;
    setForgotSuccess(true);
    showToast.info('Yêu cầu hỗ trợ đã được gửi tới Quản trị viên.');
  };

  return (
    <main className="min-h-[100dvh] w-full overflow-y-auto bg-[#dfe4e8] font-sans text-slate-900">
      <div className="mx-auto min-h-[100dvh] w-full max-w-[1440px] lg:flex lg:items-center lg:justify-center lg:p-5 xl:p-8">
        <section className="grid min-h-[100dvh] w-full overflow-hidden bg-[#f7f8f7] lg:min-h-[680px] lg:max-h-[760px] lg:grid-cols-[minmax(0,1.28fr)_minmax(420px,0.72fr)] lg:rounded-[4px] lg:border lg:border-slate-900/15 lg:shadow-[0_24px_60px_-24px_rgba(15,23,42,0.48)]">
          <aside className="relative hidden min-h-[680px] overflow-hidden bg-[#111827] lg:flex lg:flex-col lg:justify-between lg:p-10 xl:p-12">
            <div className="pointer-events-none absolute inset-0 z-0">
              <img
                src="/images/warehouse-login-hero.jpg"
                alt=""
                className="h-full w-full object-cover object-center opacity-[0.23] grayscale contrast-125"
              />
              <div className="absolute inset-0 bg-[linear-gradient(115deg,rgba(17,24,39,0.98)_0%,rgba(17,24,39,0.86)_58%,rgba(17,24,39,0.48)_100%)]" />
              <div className="absolute inset-0 opacity-[0.12] [background-image:linear-gradient(rgba(255,255,255,.18)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.18)_1px,transparent_1px)] [background-size:32px_32px]" />
            </div>

            <header className="relative z-10 flex items-center justify-between border-b border-white/10 pb-6">
              <Logo variant="dark" size="lg" />
              <div className="hidden items-center gap-2 border border-white/15 px-3 py-2 text-[11px] font-bold uppercase tracking-[0.16em] text-slate-300 xl:flex">
                <Warehouse className="h-4 w-4 text-[#f05a4f]" />
                Cổng kho nội bộ
              </div>
            </header>

            <div className="relative z-10 max-w-[580px] border-l-4 border-[#f05a4f] pl-6 xl:pl-8">
              <p className="mb-5 text-xs font-bold uppercase tracking-[0.24em] text-[#f05a4f]">
                IMS / Hệ thống vận hành
              </p>
              <h1 className="max-w-[540px] text-[38px] font-black leading-[1.08] tracking-[-0.03em] text-white xl:text-[44px]">
                Hệ thống Quản lý Kho
              </h1>
              <p className="mt-5 max-w-[500px] text-[15px] leading-7 text-slate-300">
                Cổng nội bộ dành cho nhân viên kho và bộ phận quản lý.
              </p>
              <p className="mt-3 max-w-[500px] border-t border-white/10 pt-4 text-sm leading-6 text-slate-400">
                Tài khoản do quản trị viên cấp. Nếu chưa có tài khoản hoặc bị khóa,
                vui lòng liên hệ bộ phận IT.
              </p>
            </div>

            <footer className="relative z-10">
              <dl className="grid grid-cols-3 gap-px overflow-hidden border border-white/10 bg-white/10">
                <div className="bg-[#111827]/95 px-4 py-4">
                  <dt className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500">
                    <Phone className="h-3.5 w-3.5" />
                    Hotline IT
                  </dt>
                  <dd className="mt-2 text-sm font-bold text-white">1900 6868</dd>
                </div>
                <div className="bg-[#111827]/95 px-4 py-4">
                  <dt className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500">
                    <Mail className="h-3.5 w-3.5" />
                    Email hỗ trợ
                  </dt>
                  <dd className="mt-2 text-sm font-bold text-white">it@ims.com.vn</dd>
                </div>
                <div className="bg-[#111827]/95 px-4 py-4">
                  <dt className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500">
                    <Clock className="h-3.5 w-3.5" />
                    Giờ làm việc
                  </dt>
                  <dd className="mt-2 text-sm font-bold text-white">T2 – T7, 7:30 – 17:30</dd>
                </div>
              </dl>
              <div className="mt-4 flex items-center justify-between text-[11px] font-medium text-slate-500">
                <span>© 2026 IMS</span>
                <span>Phiên bản 2.4.0</span>
              </div>
            </footer>
          </aside>

          <div className="relative flex min-h-[100dvh] flex-col bg-[#f7f8f7] px-5 py-5 sm:px-8 sm:py-7 lg:min-h-[680px] lg:px-10 lg:py-8 xl:px-12">
            <div className="flex items-center justify-between border-b border-slate-200 pb-5 lg:hidden">
              <Logo size="sm" />
              <span className="border-l-2 border-[#f05a4f] pl-3 text-[10px] font-black uppercase tracking-[0.16em] text-slate-500">
                Cổng nội bộ
              </span>
            </div>

            <div className="my-auto w-full max-w-[420px] self-center py-8 lg:py-4">
              <div className="mb-8">
                <div className="mb-4 flex items-center gap-3">
                  <div className="h-px w-9 bg-[#f05a4f]" />
                  <span className="text-[11px] font-black uppercase tracking-[0.22em] text-[#c83d35]">
                    Xác thực tài khoản
                  </span>
                </div>
                <h2 className="text-[32px] font-black leading-none tracking-[-0.03em] text-slate-950 sm:text-[38px]">
                  Đăng nhập
                </h2>
                <p className="mt-3 text-sm font-medium text-slate-500">
                  Nhập tài khoản để truy cập hệ thống
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="mb-2 block text-[12px] font-black uppercase tracking-[0.08em] text-slate-700">
                    Tài khoản hoặc Email
                  </label>
                  <div className="relative">
                    <User className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      required
                      autoComplete="username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="Nhập tên đăng nhập hoặc email..."
                      className="h-[52px] w-full rounded-[3px] border border-slate-300 bg-white pl-12 pr-4 text-[15px] font-semibold text-slate-950 placeholder:text-slate-400 focus:border-[#e54840] focus:outline-none focus:ring-2 focus:ring-[#e54840]/15"
                    />
                  </div>
                </div>

                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <label className="text-[12px] font-black uppercase tracking-[0.08em] text-slate-700">
                      Mật khẩu
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setShowForgotModal(true);
                        setForgotSuccess(false);
                        setForgotEmail('');
                      }}
                      className="cursor-pointer text-[12px] font-bold text-[#c83d35] hover:text-[#992c27] hover:underline"
                    >
                      Quên mật khẩu?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      autoComplete="current-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Nhập mật khẩu..."
                      className="h-[52px] w-full rounded-[3px] border border-slate-300 bg-white pl-12 pr-12 text-[15px] font-semibold text-slate-950 placeholder:text-slate-400 focus:border-[#e54840] focus:outline-none focus:ring-2 focus:ring-[#e54840]/15"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 cursor-pointer rounded p-1 text-slate-400 hover:text-slate-700"
                      title={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </div>

                <label className="flex cursor-pointer items-center gap-2.5 text-sm font-semibold text-slate-600 select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="h-4 w-4 cursor-pointer accent-[#e54840]"
                  />
                  <span>Ghi nhớ đăng nhập</span>
                </label>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex h-[54px] w-full cursor-pointer items-center justify-center gap-3 rounded-[3px] bg-[#e54840] px-6 text-[15px] font-black uppercase tracking-[0.04em] text-white shadow-[0_8px_20px_-10px_rgba(197,56,48,0.8)] transition-colors hover:bg-[#c83d35] disabled:cursor-not-allowed disabled:opacity-60 active:translate-y-px"
                >
                  {isLoading ? (
                    <>
                      <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      <span>Đang xác thực...</span>
                    </>
                  ) : (
                    <>
                      <span>Đăng nhập</span>
                      <ArrowRight className="h-5 w-5" />
                    </>
                  )}
                </button>
              </form>
            </div>

            <div className="mt-auto border-t border-slate-200 pt-4">
              <div className="flex items-center justify-center gap-2 text-[11px] font-bold text-slate-500 lg:justify-start">
                <ShieldCheck className="h-4 w-4 text-emerald-600" />
                <span>Bảo mật phiên đăng nhập SSL 256-bit</span>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2 text-[10px] font-medium text-slate-400 lg:hidden">
                <span>Hotline IT: 1900 6868</span>
                <span className="text-right">Phiên bản 2.4.0</span>
                <span>it@ims.com.vn</span>
                <span className="text-right">© 2026 IMS</span>
                <span className="col-span-2">T2 – T7, 7:30 – 17:30</span>
              </div>
            </div>
          </div>
        </section>
      </div>

      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md space-y-4 rounded-[4px] border border-slate-200 bg-white p-6 shadow-2xl sm:p-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-[3px] bg-rose-50 text-[#e54840]">
                  <ShieldAlert className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-black text-slate-900">Quên mật khẩu?</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowForgotModal(false)}
                className="cursor-pointer rounded-[3px] p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <p className="text-sm leading-relaxed text-slate-500">
              Vì lý do an toàn kho vận, tài khoản nhân viên không được tự thiết lập lại mật khẩu qua email. Vui lòng gửi yêu cầu để Quản trị viên hỗ trợ cấp lại.
            </p>

            {forgotSuccess ? (
              <div className="space-y-1 rounded-[3px] border border-emerald-200 bg-emerald-50 p-4 text-center text-sm font-medium text-emerald-800">
                <div className="font-bold">Yêu cầu đã được gửi!</div>
                <div className="text-xs text-emerald-700">
                  Quản trị viên hệ thống sẽ kiểm tra và liên hệ với bạn trong thời gian sớm nhất.
                </div>
              </div>
            ) : (
              <form onSubmit={handleForgotSubmit} className="space-y-4 pt-1">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">
                    Nhập tên tài khoản hoặc email của bạn
                  </label>
                  <input
                    type="text"
                    required
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    placeholder="Nhập tên tài khoản hoặc email của bạn..."
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-[#EE3D43] focus:bg-white"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-3 bg-[#EE3D43] hover:bg-[#D9343A] text-white rounded-xl text-sm font-bold cursor-pointer transition-colors shadow-xs"
                >
                  Gửi yêu cầu tới Quản trị viên
                </button>
              </form>
            )}

            <div className="pt-2 text-right">
              <button
                type="button"
                onClick={() => setShowForgotModal(false)}
                className="text-sm font-semibold text-slate-500 hover:text-slate-800 cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};
