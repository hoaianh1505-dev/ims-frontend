import React, { useState } from 'react';
import { useAuthStore } from '../../stores/auth.store';

export const LoginPage: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotSuccess, setForgotSuccess] = useState(false);

  const { login, isLoading, error, clearError } = useAuthStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) return;
    await login({ username: username.trim(), password });
  };

  return (
    <div className="min-h-screen bg-[#F0F4F8] flex flex-col justify-center items-center p-4">
      {/* Main Card */}
      <div className="w-full max-w-[440px] bg-white rounded-3xl shadow-sm border border-slate-100 p-8 sm:p-10">
        {/* Header Title */}
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
            Chào mừng trở lại
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Đăng nhập tài khoản IMS
          </p>
        </div>

        {/* Error message */}
        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-100 text-rose-600 text-xs text-center font-medium">
            {error}
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">
              Email hoặc Tên đăng nhập
            </label>
            <input
              type="text"
              required
              value={username}
              onChange={(e) => {
                setUsername(e.target.value);
                if (error) clearError();
              }}
              placeholder="m@example.com"
              className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-all"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-xs font-medium text-slate-700">
                Mật khẩu
              </label>
              <button
                type="button"
                onClick={() => {
                  setShowForgotModal(true);
                  setForgotSuccess(false);
                }}
                className="text-xs text-slate-500 hover:text-blue-600 transition-colors cursor-pointer"
              >
                Quên mật khẩu?
              </button>
            </div>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (error) clearError();
              }}
              placeholder="Nhập mật khẩu..."
              className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-2 bg-blue-600 hover:bg-blue-700 text-white py-2.5 px-4 rounded-xl text-sm font-medium transition-all shadow-xs flex items-center justify-center cursor-pointer disabled:opacity-70 active:scale-[0.99]"
          >
            {isLoading ? 'Đang đăng nhập...' : 'Đăng nhập'}
          </button>
        </form>

        {/* Divider */}
        <div className="relative my-6 text-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-100"></div>
          </div>
          <span className="relative bg-white px-3 text-[11px] text-slate-400">
            Hoặc tiếp tục với
          </span>
        </div>

        {/* Social Buttons */}
        <div className="grid grid-cols-3 gap-3">
          {/* Apple */}
          <button
            type="button"
            className="flex items-center justify-center py-2.5 px-4 border border-slate-100 rounded-xl bg-slate-50/50 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <svg className="w-4 h-4 text-slate-800" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.37c.62-.75 1.04-1.8 0.92-2.85-.9.04-2 .6-2.65 1.35-.58.66-1.09 1.73-.95 2.76.99.08 2.06-.51 2.68-1.26z" />
            </svg>
          </button>

          {/* Google */}
          <button
            type="button"
            className="flex items-center justify-center py-2.5 px-4 border border-slate-100 rounded-xl bg-slate-50/50 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <span className="font-bold text-sm text-slate-800">G</span>
          </button>

          {/* Meta */}
          <button
            type="button"
            className="flex items-center justify-center py-2.5 px-4 border border-slate-100 rounded-xl bg-slate-50/50 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <span className="text-sm font-serif text-slate-800">∞</span>
          </button>
        </div>

        {/* Register Hint */}
        <div className="text-center mt-6 text-xs text-slate-500">
          Chưa có tài khoản?{' '}
          <button
            type="button"
            onClick={() => alert('Vui lòng liên hệ Admin để được cấp tài khoản hệ thống kho.')}
            className="font-medium text-blue-600 hover:underline cursor-pointer"
          >
            Đăng ký
          </button>
        </div>
      </div>

      {/* Terms Footer */}
      <div className="mt-8 text-center text-xs text-slate-400">
        Tiếp tục nghĩa là bạn đồng ý{' '}
        <span className="underline hover:text-slate-600 cursor-pointer">Điều khoản</span> ·{' '}
        <span className="underline hover:text-slate-600 cursor-pointer">Bảo mật</span>
      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-xl border border-slate-100 space-y-4">
            <h3 className="text-base font-bold text-slate-900">Quên mật khẩu?</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Theo chính sách bảo mật nội bộ của IMS, tài khoản nhân viên cần được Quản trị viên (Super Admin) đặt lại mật khẩu trực tiếp qua hệ thống.
            </p>

            {forgotSuccess ? (
              <div className="p-3 bg-emerald-50 text-emerald-700 rounded-xl text-xs font-medium">
                Yêu cầu đã được gửi tới Quản trị viên hệ thống!
              </div>
            ) : (
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="Nhập tên đăng nhập hoặc email của bạn..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-blue-600"
                />
                <button
                  type="button"
                  onClick={() => setForgotSuccess(true)}
                  className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold cursor-pointer"
                >
                  Gửi yêu cầu hỗ trợ
                </button>
              </div>
            )}

            <div className="pt-2">
              <button
                type="button"
                onClick={() => setShowForgotModal(false)}
                className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold cursor-pointer"
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
