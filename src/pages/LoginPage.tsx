import React, { useState } from 'react';
import {
  Eye,
  EyeOff,
  Lock,
  User,
  ShieldAlert,
  X,
} from 'lucide-react';
import { toast } from 'sonner';
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

  const { login, isLoading } = useAuthStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      toast.warning('Thiếu thông tin đăng nhập', {
        description: 'Vui lòng nhập tên tài khoản hoặc email và mật khẩu.',
      });
      return;
    }

    const success = await login({ username: username.trim(), password });
    if (success) {
      toast.success('Đăng nhập thành công!', {
        description: 'Đang chuyển hướng tới cổng làm việc...',
      });
    } else {
      toast.error('Đăng nhập không thành công', {
        description: 'Tên tài khoản hoặc mật khẩu không chính xác. Vui lòng thử lại.',
      });
    }
  };

  const handleForgotSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail.trim()) return;
    setForgotSuccess(true);
    toast.success('Yêu cầu đã được gửi', {
      description: 'Quản trị viên sẽ liên hệ với bạn trong thời gian sớm nhất.',
    });
  };

  return (
    <div className="min-h-screen w-full bg-[#CBD5E1] flex items-center justify-center p-4 sm:p-6 lg:p-10 font-sans text-slate-800">
      {/* FLOATING SPLIT CARD */}
      <div className="w-full max-w-6xl bg-white rounded-3xl shadow-[0_30px_70px_-15px_rgba(15,23,42,0.25)] border border-slate-300/80 overflow-hidden flex flex-col lg:grid lg:grid-cols-12 min-h-[660px]">
        {/* ========================================================
            LEFT COLUMN: Solid Dark Minimal (~55% width)
            - Completely minimal, spacious typography, zero clutter
           ======================================================== */}
        <div className="lg:col-span-7 bg-[#161B22] text-white p-10 sm:p-14 lg:p-16 flex flex-col justify-between">
          {/* Top Logo */}
          <div>
            <Logo variant="dark" size="lg" />
          </div>

          {/* Center Minimal Typography */}
          <div className="py-12 my-auto space-y-4">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white leading-[1.12] tracking-tight">
              Quản trị Kho bãi. <br />
              <span className="text-[#EE3D43]">Vận hành Chuẩn xác.</span>
            </h1>

            <p className="text-base sm:text-lg text-slate-400 font-normal leading-relaxed max-w-md pt-2">
              Hệ thống kiểm soát tồn kho, định vị vị trí kệ và quản trị chuỗi cung ứng doanh nghiệp thời gian thực.
            </p>
          </div>

          {/* Bottom subtle note */}
          <div className="text-xs text-slate-400">
            Hệ thống Quản lý Kho Doanh nghiệp IMS
          </div>
        </div>

        {/* ========================================================
            RIGHT COLUMN: Clean White Form (~45% width)
            - Spacious, large text, confident inputs
           ======================================================== */}
        <div className="lg:col-span-5 bg-white p-10 sm:p-14 flex flex-col justify-between">
          {/* Top Logo (Mobile only) */}
          <div className="flex justify-between items-center pb-2">
            <div className="lg:hidden">
              <Logo size="md" />
            </div>
          </div>

          {/* Form */}
          <div className="my-auto py-4 space-y-7">
            <div>
              <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
                Đăng nhập
              </h2>
              <p className="text-base text-slate-500 mt-2 font-medium">
                Nhập tài khoản để truy cập hệ thống
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Username Input */}
              <div>
                <label className="block text-sm sm:text-base font-bold text-slate-800 mb-2">
                  Tài khoản hoặc Email
                </label>
                <div className="relative">
                  <User className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  <input
                    type="text"
                    required
                    autoComplete="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Nhập tên đăng nhập hoặc email..."
                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-300 rounded-xl text-base font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-[#EE3D43] focus:ring-4 focus:ring-[#EE3D43]/10 transition-all"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-sm sm:text-base font-bold text-slate-800">
                    Mật khẩu
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setShowForgotModal(true);
                      setForgotSuccess(false);
                      setForgotEmail('');
                    }}
                    className="text-sm font-semibold text-[#EE3D43] hover:underline cursor-pointer"
                  >
                    Quên mật khẩu?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Nhập mật khẩu..."
                    className="w-full pl-12 pr-12 py-4 bg-slate-50 border border-slate-300 rounded-xl text-base font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-[#EE3D43] focus:ring-4 focus:ring-[#EE3D43]/10 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 p-1 cursor-pointer rounded"
                    title={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Remember Me */}
              <div className="flex items-center justify-between pt-1">
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
                className="w-full mt-2 py-4 px-6 bg-[#EE3D43] hover:bg-[#D9343A] text-white font-bold rounded-xl text-base sm:text-lg transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 active:scale-[0.99]"
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
          <div className="bg-white rounded-2xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-100 space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-lg bg-rose-50 text-[#EE3D43] flex items-center justify-center">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">Quên mật khẩu?</h3>
              </div>
              <button
                onClick={() => setShowForgotModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-sm text-slate-500 leading-relaxed">
              Vì lý do an toàn kho vận, tài khoản nhân viên không được tự thiết lập lại mật khẩu qua email. Vui lòng gửi yêu cầu để Quản trị viên hỗ trợ cấp lại.
            </p>

            {forgotSuccess ? (
              <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-sm font-medium text-center space-y-1">
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
    </div>
  );
};
