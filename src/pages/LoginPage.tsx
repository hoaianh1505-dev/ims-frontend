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
      }, 4500);
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
    <div className="min-h-screen bg-[#F4F6F4] bg-[radial-gradient(#1A4D3E14_1px,transparent_1px)] [background-size:24px_24px] flex flex-col justify-center items-center p-4 relative font-sans text-slate-800 selection:bg-brand-light selection:text-brand-dark">
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

      {/* LOGIN CARD */}
      <div className="w-full max-w-[490px] bg-white rounded-2xl shadow-[0_16px_40px_-8px_rgba(20,61,48,0.09),0_1px_3px_0_rgba(0,0,0,0.04)] border border-slate-200/90 p-8 sm:p-11 space-y-7">
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center space-y-4">
          <Logo size="lg" className="items-center" />
          <div className="pt-1">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Đăng nhập cổng vận hành
            </h2>
            <p className="text-sm text-slate-500 mt-1.5">
              Hệ thống quản lý kho & chuỗi cung ứng doanh nghiệp
            </p>
          </div>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-5 pt-1">
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
                placeholder="admin hoặc admin@ims.com"
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
            className="w-full mt-2 py-3.5 px-6 bg-brand-primary hover:bg-brand-hover text-white font-semibold rounded-xl text-base transition-all shadow-sm hover:shadow flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-60 active:scale-[0.99]"
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

      {/* Sub-footer */}
      <div className="mt-8 text-center text-xs sm:text-sm text-slate-400 space-y-1">
        <div>Hệ thống Quản lý Kho Nội bộ IMS · Phiên bản v2.0</div>
        <div className="text-xs text-slate-400/80">
          Kết nối máy chủ mã hóa SSL/TLS · Phân quyền truy cập RBAC
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
                    placeholder="VD: admin@ims.com hoặc staff_hn01"
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
