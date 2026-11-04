import React, { useState } from 'react';
import { useAuthStore } from '../stores/auth.store';

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
    <div className="min-h-screen bg-brand-bg flex flex-col justify-center items-center p-4">
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
              className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-light transition-all"
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
                className="text-xs text-slate-500 hover:text-brand-primary transition-colors cursor-pointer"
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
              className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-light transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-2 bg-brand-primary hover:bg-brand-hover text-white py-2.5 px-4 rounded-xl text-sm font-medium transition-all shadow-xs flex items-center justify-center cursor-pointer disabled:opacity-70 active:scale-[0.99]"
          >
            {isLoading ? 'Đang đăng nhập...' : 'Đăng nhập'}
          </button>
        </form>
      </div>

      {/* Footer Notice */}
      <div className="mt-8 text-center text-xs text-slate-400">
        Hệ thống Quản lý Kho Nội bộ · Bảo mật IMS v1.0
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
              <div className="p-3 bg-brand-light text-brand-primary rounded-xl text-xs font-medium">
                Yêu cầu đã được gửi tới Quản trị viên hệ thống!
              </div>
            ) : (
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="Nhập tên đăng nhập hoặc email của bạn..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary"
                />
                <button
                  type="button"
                  onClick={() => setForgotSuccess(true)}
                  className="w-full py-2 bg-brand-primary hover:bg-brand-hover text-white rounded-xl text-xs font-semibold cursor-pointer"
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

