import React, { useState, useEffect } from 'react';
import {
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  X,
  Lock,
  User,
  ShieldAlert,
  Boxes,
  Barcode,
  ShieldCheck,
} from 'lucide-react';
import { Logo } from '../components/layout/Logo';
import { useAuthStore } from '../stores/auth.store';

export const LoginPage: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSuccess, setForgotSuccess] = useState(false);

  // Floating Toast Notification
  const [toast, setToast] = useState<{
    type: 'error' | 'success';
    title: string;
    message: string;
  } | null>(null);

  const { login, isLoading, error, clearError } = useAuthStore();

  // Show Toast when error occurs
  useEffect(() => {
    if (error) {
      setToast({
        type: 'error',
        title: 'Đăng nhập không thành công',
        message: error,
      });
      const timer = setTimeout(() => {
        setToast(null);
        clearError();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, clearError]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setToast({
        type: 'error',
        title: 'Thiếu thông tin đăng nhập',
        message: 'Vui lòng nhập tên tài khoản hoặc email và mật khẩu.',
      });
      return;
    }

    const success = await login({ username: username.trim(), password });
    if (success) {
      setToast({
        type: 'success',
        title: 'Xác thực thành công',
        message: 'Đang chuyển hướng tới cổng làm việc...',
      });
    }
  };

  const handleForgotSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail.trim()) return;
    setForgotSuccess(true);
  };

  return (
    <div className="min-h-screen w-full flex flex-col lg:grid lg:grid-cols-12 bg-white font-sans text-slate-800 selection:bg-brand-light selection:text-brand-dark">
      {/* FLOATING TOAST POPUP NOTIFICATION (Top-right anchor) */}
      {toast && (
        <div className="fixed top-6 right-6 z-50 max-w-sm w-full animate-in slide-in-from-top-4 fade-in duration-200">
          <div className="p-4 rounded-xl shadow-2xl bg-slate-900/95 text-white border border-slate-800 backdrop-blur-md flex items-start gap-3">
            <div
              className={`p-1.5 rounded-lg shrink-0 mt-0.5 ${
                toast.type === 'error'
                  ? 'bg-rose-500/20 text-rose-400'
                  : 'bg-emerald-500/20 text-emerald-400'
              }`}
            >
              {toast.type === 'error' ? (
                <AlertCircle className="w-4 h-4" />
              ) : (
                <CheckCircle2 className="w-4 h-4" />
              )}
            </div>

            <div className="flex-1 min-w-0">
              <h4 className="text-xs font-bold text-white tracking-tight">{toast.title}</h4>
              <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">{toast.message}</p>
            </div>

            <button
              onClick={() => {
                setToast(null);
                if (error) clearError();
              }}
              className="text-slate-400 hover:text-white p-1 rounded-md hover:bg-white/10 transition-colors shrink-0 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* LEFT PANEL: Enterprise Brand Pillar (Desktop only) */}
      <div className="hidden lg:flex lg:col-span-5 xl:col-span-5 bg-[#143D30] text-white p-10 xl:p-14 flex-col justify-between relative overflow-hidden">
        {/* Subtle geometric line pattern */}
        <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(#A7D4C6_1px,transparent_1px)] [background-size:20px_20px]" />
        <div className="absolute -right-24 -top-24 w-96 h-96 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />

        {/* Brand Header */}
        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <div className="relative w-10 h-10 shrink-0">
              <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-sm">
                <path d="M20 4L34 12L20 20L6 12L20 4Z" fill="#3D9B80" />
                <path d="M6 12L20 20V36L6 28V12Z" fill="#205B4B" />
                <path d="M20 20L34 12V28L20 36V20Z" fill="#143D31" />
                <path d="M20 9L27 13L20 17L13 13L20 9Z" fill="#A7D4C6" fillOpacity="0.85" />
                <path d="M20 23V31" stroke="#A7D4C6" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </div>
            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-white tracking-wider">IMS</span>
                <span className="text-xs font-bold text-emerald-300 bg-emerald-950/70 border border-emerald-500/30 px-2 py-0.5 rounded">
                  CORE
                </span>
              </div>
              <div className="text-[10px] font-bold text-emerald-200/70 tracking-[0.24em] uppercase mt-0.5">
                Kho hàng & Vận hành Doanh nghiệp
              </div>
            </div>
          </div>
        </div>

        {/* Operational Highlights */}
        <div className="relative z-10 space-y-6 my-auto py-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/25 text-emerald-300 text-xs font-semibold mb-4">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Cổng vận hành thời gian thực
            </div>
            <h1 className="text-2xl xl:text-3xl font-extrabold text-white leading-snug">
              Quản trị Kho bãi & Chuỗi cung ứng Doanh nghiệp
            </h1>
            <p className="text-sm text-emerald-100/70 mt-2.5 leading-relaxed">
              Tối ưu hóa quy trình nhập xuất, tự động hóa định vị vị trí kệ và kiểm soát tồn kho tức thời chuẩn xác.
            </p>
          </div>

          <div className="space-y-3 pt-2">
            <div className="flex items-start gap-3.5 p-3.5 rounded-xl bg-white/[0.06] border border-white/10 backdrop-blur-xs">
              <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-300 shrink-0 mt-0.5">
                <Boxes className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">Kiểm kê tồn kho đa điểm</h4>
                <p className="text-[11px] text-emerald-100/70 mt-0.5">Theo dõi số lượng tức thời, cảnh báo ngưỡng tối thiểu theo từng kho.</p>
              </div>
            </div>

            <div className="flex items-start gap-3.5 p-3.5 rounded-xl bg-white/[0.06] border border-white/10 backdrop-blur-xs">
              <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-300 shrink-0 mt-0.5">
                <Barcode className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">Vị trí kệ & Mã vạch EAN-13</h4>
                <p className="text-[11px] text-emerald-100/70 mt-0.5">Định vị chính xác từng dãy - kệ - tầng, hỗ trợ in tem và quét mã vạch.</p>
              </div>
            </div>

            <div className="flex items-start gap-3.5 p-3.5 rounded-xl bg-white/[0.06] border border-white/10 backdrop-blur-xs">
              <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-300 shrink-0 mt-0.5">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">Phân quyền RBAC bảo mật</h4>
                <p className="text-[11px] text-emerald-100/70 mt-0.5">Phân định vai trò chặt chẽ: Quản trị viên, Quản lý kho và Thủ kho.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Security & Status Footer */}
        <div className="relative z-10 pt-6 border-t border-emerald-500/20 flex items-center justify-between text-xs text-emerald-200/60">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>Máy chủ vận hành ổn định 99.98%</span>
          </div>
          <span>Bảo mật SSL/TLS 256-bit</span>
        </div>
      </div>

      {/* RIGHT PANEL: Form Container */}
      <div className="flex-1 lg:col-span-7 xl:col-span-7 bg-[#F8FAF9] flex flex-col justify-between p-6 sm:p-12 xl:p-16 min-h-screen">
        {/* Top spacer on desktop / Mobile Logo on small screens */}
        <div className="w-full flex justify-between items-center lg:justify-end">
          <div className="lg:hidden">
            <Logo size="md" />
          </div>
          <div className="text-xs text-slate-400 font-medium">
            Phiên bản v2.0
          </div>
        </div>

        {/* Form Container Card */}
        <div className="w-full max-w-[460px] mx-auto my-auto py-8">
          <div className="bg-white rounded-2xl shadow-[0_10px_35px_-5px_rgba(20,61,48,0.08),0_1px_3px_0_rgba(0,0,0,0.04)] border border-slate-200/90 p-8 sm:p-10 space-y-6">
            <div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Đăng nhập hệ thống
              </h2>
              <p className="text-sm text-slate-500 mt-2">
                Nhập tài khoản để truy cập cổng vận hành nội bộ IMS
              </p>
            </div>

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-4 pt-1">
              {/* Username Input */}
              <div>
                <label className="block text-sm font-semibold text-slate-800 mb-2">
                  Tài khoản hoặc Email
                </label>
                <div className="relative">
                  <User className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  <input
                    type="text"
                    required
                    autoComplete="username"
                    value={username}
                    onChange={(e) => {
                      setUsername(e.target.value);
                      if (toast) setToast(null);
                      if (error) clearError();
                    }}
                    placeholder="Nhập tên đăng nhập hoặc email..."
                    className="w-full pl-11 pr-4 py-3 bg-slate-50/70 border border-slate-300 rounded-xl text-base font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-brand-primary focus:bg-white focus:ring-4 focus:ring-brand-primary/10 transition-all shadow-2xs"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-sm font-semibold text-slate-800">
                    Mật khẩu
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setShowForgotModal(true);
                      setForgotSuccess(false);
                      setForgotEmail('');
                    }}
                    className="text-sm font-medium text-slate-500 hover:text-brand-primary transition-colors cursor-pointer"
                  >
                    Quên mật khẩu?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (toast) setToast(null);
                      if (error) clearError();
                    }}
                    placeholder="Nhập mật khẩu..."
                    className="w-full pl-11 pr-11 py-3 bg-slate-50/70 border border-slate-300 rounded-xl text-base font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-brand-primary focus:bg-white focus:ring-4 focus:ring-brand-primary/10 transition-all shadow-2xs"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition-colors p-1 cursor-pointer rounded"
                    title={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Remember Me */}
              <div className="flex items-center justify-between pt-0.5">
                <label className="flex items-center gap-2.5 cursor-pointer select-none text-slate-600 font-medium text-sm">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-300 text-brand-primary focus:ring-brand-primary cursor-pointer accent-[#1A4D3E]"
                  />
                  <span>Ghi nhớ đăng nhập trên thiết bị này</span>
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-3 py-3.5 px-6 bg-brand-primary hover:bg-brand-hover text-white font-semibold rounded-xl text-base transition-all shadow-sm hover:shadow flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-60 active:scale-[0.99]"
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Đang xác thực thông tin...</span>
                  </>
                ) : (
                  <span>Đăng nhập hệ thống</span>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Bottom Sub-footer */}
        <div className="w-full text-center text-xs text-slate-400 space-y-1 pt-4">
          <div>Hệ thống Quản lý Kho Doanh nghiệp IMS · Bản quyền © 2026</div>
          <div className="text-[11px] text-slate-400/80">
            Hỗ trợ kỹ thuật: it-support@ims.com · Máy chủ bảo mật TLS 1.3
          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-100 space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                  <ShieldAlert className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-slate-900">Quên mật khẩu?</h3>
              </div>
              <button
                onClick={() => setShowForgotModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed">
              Vì lý do bảo mật kho vận, tài khoản nhân viên không được tự thiết lập lại mật khẩu qua email. Vui lòng gửi yêu cầu để Quản trị viên (Super Admin) hỗ trợ cấp lại.
            </p>

            {forgotSuccess ? (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-medium text-center space-y-1">
                <div className="font-bold">Yêu cầu đã được gửi!</div>
                <div className="text-[11px] text-emerald-700">
                  Quản trị viên hệ thống sẽ kiểm tra và liên hệ với bạn trong thời gian sớm nhất.
                </div>
              </div>
            ) : (
              <form onSubmit={handleForgotSubmit} className="space-y-3 pt-1">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Nhập tên tài khoản hoặc email của bạn
                  </label>
                  <input
                    type="text"
                    required
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    placeholder="Nhập tên tài khoản hoặc email của bạn..."
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-brand-primary focus:bg-white"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-2 bg-brand-primary hover:bg-brand-hover text-white rounded-xl text-xs font-semibold cursor-pointer transition-colors shadow-xs"
                >
                  Gửi yêu cầu tới Quản trị viên
                </button>
              </form>
            )}

            <div className="pt-2 text-right">
              <button
                type="button"
                onClick={() => setShowForgotModal(false)}
                className="text-xs font-semibold text-slate-500 hover:text-slate-800 cursor-pointer"
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
