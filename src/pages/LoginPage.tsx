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
    <div className="min-h-screen w-full bg-[#CBD5E1] flex items-center justify-center p-4 sm:p-6 lg:p-10 font-sans text-slate-800">
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
                <AlertCircle className="w-5 h-5" />
              ) : (
                <CheckCircle2 className="w-5 h-5" />
              )}
            </div>

            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-bold text-white tracking-tight">{toast.title}</h4>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">{toast.message}</p>
            </div>

            <button
              onClick={() => {
                setToast(null);
                if (error) clearError();
              }}
              className="text-slate-400 hover:text-white p-1 rounded-md hover:bg-white/10 transition-colors shrink-0 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* FLOATING SPLIT CARD */}
      <div className="w-full max-w-5xl bg-white rounded-2xl shadow-[0_20px_50px_-12px_rgba(15,23,42,0.25)] border border-slate-300/80 overflow-hidden flex flex-col lg:grid lg:grid-cols-12 min-h-[560px]">
        {/* ========================================================
            LEFT COLUMN: Solid Dark Minimal (~55% width)
            - No blobs, no badges, no lists, just clean typography
           ======================================================== */}
        <div className="lg:col-span-7 bg-[#1A1F26] text-white p-8 sm:p-12 lg:p-14 flex flex-col justify-between">
          {/* Top Logo */}
          <div>
            <Logo variant="dark" size="lg" />
          </div>

          {/* Center Minimal Typography */}
          <div className="py-12 my-auto space-y-4">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white leading-tight tracking-tight">
              Quản trị Kho bãi. <br />
              <span className="text-[#EE3D43]">Vận hành Chuẩn xác.</span>
            </h1>

            <p className="text-base sm:text-lg text-slate-300 font-normal leading-relaxed max-w-md pt-2">
              Hệ thống kiểm soát tồn kho, định vị vị trí kệ và quản trị chuỗi cung ứng nội bộ.
            </p>
          </div>

          {/* Bottom subtle note */}
          <div className="text-xs text-slate-400">
            Hệ thống Quản lý Kho Doanh nghiệp IMS
          </div>
        </div>

        {/* ========================================================
            RIGHT COLUMN: Clean White Form (~45% width)
           ======================================================== */}
        <div className="lg:col-span-5 bg-white p-8 sm:p-12 flex flex-col justify-between">
          {/* Top Version */}
          <div className="flex justify-between items-center pb-2">
            <div className="lg:hidden">
              <Logo size="md" />
            </div>
            <span className="text-xs font-semibold text-slate-400 ml-auto">
              Phiên bản 2.0
            </span>
          </div>

          {/* Form */}
          <div className="my-auto py-4 space-y-6">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                Đăng nhập
              </h2>
              <p className="text-sm sm:text-base text-slate-500 mt-1">
                Nhập tài khoản để tiếp tục
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Username Input */}
              <div>
                <label className="block text-sm sm:text-base font-semibold text-slate-800 mb-2">
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
                    className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-300 rounded-xl text-base font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-[#EE3D43] focus:ring-4 focus:ring-[#EE3D43]/10 transition-all"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-sm sm:text-base font-semibold text-slate-800">
                    Mật khẩu
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setShowForgotModal(true);
                      setForgotSuccess(false);
                      setForgotEmail('');
                    }}
                    className="text-xs sm:text-sm font-semibold text-[#EE3D43] hover:underline cursor-pointer"
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
                    className="w-full pl-11 pr-11 py-3.5 bg-slate-50 border border-slate-300 rounded-xl text-base font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-[#EE3D43] focus:ring-4 focus:ring-[#EE3D43]/10 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 p-1 cursor-pointer rounded"
                    title={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Remember Me */}
              <div className="flex items-center justify-between pt-0.5">
                <label className="flex items-center gap-2.5 cursor-pointer select-none text-slate-600 font-medium text-sm sm:text-base">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-300 text-[#EE3D43] focus:ring-[#EE3D43] cursor-pointer accent-[#EE3D43]"
                  />
                  <span>Ghi nhớ đăng nhập</span>
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-2 py-3.5 px-6 bg-[#EE3D43] hover:bg-[#D9343A] text-white font-bold rounded-xl text-base sm:text-lg transition-all shadow-sm hover:shadow flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 active:scale-[0.99]"
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Đang xác thực...</span>
                  </>
                ) : (
                  <span>Đăng nhập</span>
                )}
              </button>
            </form>
          </div>

          {/* Simple Bottom Note */}
          <div className="text-center text-xs text-slate-400 pt-2">
            Bảo mật phiên đăng nhập SSL 256-bit
          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-slate-100 space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-rose-50 text-[#EE3D43] flex items-center justify-center">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-slate-900">Quên mật khẩu?</h3>
              </div>
              <button
                onClick={() => setShowForgotModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
              Vì lý do an toàn kho vận, tài khoản nhân viên không được tự thiết lập lại mật khẩu qua email. Vui lòng gửi yêu cầu để Quản trị viên (Super Admin) hỗ trợ cấp lại.
            </p>

            {forgotSuccess ? (
              <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs sm:text-sm font-medium text-center space-y-1">
                <div className="font-bold">Yêu cầu đã được gửi!</div>
                <div className="text-xs text-emerald-700">
                  Quản trị viên hệ thống sẽ kiểm tra và liên hệ với bạn trong thời gian sớm nhất.
                </div>
              </div>
            ) : (
              <form onSubmit={handleForgotSubmit} className="space-y-3.5 pt-1">
                <div>
                  <label className="block text-xs sm:text-sm font-bold text-slate-700 mb-1.5">
                    Nhập tên tài khoản hoặc email của bạn
                  </label>
                  <input
                    type="text"
                    required
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    placeholder="Nhập tên tài khoản hoặc email của bạn..."
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-[#EE3D43] focus:bg-white"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-2.5 bg-[#EE3D43] hover:bg-[#D9343A] text-white rounded-xl text-sm font-bold cursor-pointer transition-colors shadow-xs"
                >
                  Gửi yêu cầu tới Quản trị viên
                </button>
              </form>
            )}

            <div className="pt-2 text-right">
              <button
                type="button"
                onClick={() => setShowForgotModal(false)}
                className="text-xs sm:text-sm font-semibold text-slate-500 hover:text-slate-800 cursor-pointer"
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
