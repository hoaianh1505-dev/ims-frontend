import React, { useState } from 'react';
import { X, KeyRound, Copy, Check, Loader2 } from 'lucide-react';
import { UserItem } from '../../services/users.service';

interface ResetPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserItem | null;
  onReset: (id: string, newPassword?: string) => Promise<string>;
}

export const ResetPasswordModal: React.FC<ResetPasswordModalProps> = ({
  isOpen,
  onClose,
  user,
  onReset,
}) => {
  const [customPassword, setCustomPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [resultPassword, setResultPassword] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  if (!isOpen || !user) return null;

  const handleConfirm = async () => {
    setLoading(true);
    try {
      const generated = await onReset(
        user.id,
        customPassword.trim() ? customPassword.trim() : undefined
      );
      setResultPassword(generated);
      setCopied(false);
    } catch {
      // Error handled by parent toast
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (resultPassword) {
      navigator.clipboard.writeText(resultPassword);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleClose = () => {
    setCustomPassword('');
    setResultPassword(null);
    setCopied(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2">
            <KeyRound className="w-4 h-4 text-amber-600" />
            <h3 className="text-base font-bold text-slate-900">
              Đặt lại mật khẩu: <span className="font-mono text-slate-700">@{user.username}</span>
            </h3>
          </div>
          <button
            onClick={handleClose}
            className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {!resultPassword ? (
            <>
              <p className="text-xs text-slate-600 leading-relaxed">
                Nhập mật khẩu mới bên dưới, hoặc để trống để hệ thống tự tạo một mật khẩu tạm ngẫu nhiên.
              </p>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Mật khẩu mới (Tùy chọn)
                </label>
                <input
                  type="text"
                  value={customPassword}
                  onChange={(e) => setCustomPassword(e.target.value)}
                  placeholder="Để trống để tạo ngẫu nhiên..."
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:bg-white transition-all"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-4 py-2 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  onClick={handleConfirm}
                  disabled={loading}
                  className="inline-flex items-center gap-2 px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer disabled:opacity-50"
                >
                  {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{loading ? 'Đang xử lý...' : 'Xác nhận đặt lại'}</span>
                </button>
              </div>
            </>
          ) : (
            <div className="space-y-4">
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-center space-y-2">
                <div className="text-xs font-medium text-emerald-800">
                  Mật khẩu mới đã được cập nhật:
                </div>
                <div className="text-xl font-mono font-bold text-slate-900 bg-white py-2 px-4 rounded-xl border border-emerald-200 select-all">
                  {resultPassword}
                </div>
                <p className="text-[11px] text-slate-500">
                  Người dùng sẽ phải đổi mật khẩu ở lần đăng nhập tiếp theo.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopy}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  <span>{copied ? 'Đã sao chép!' : 'Sao chép mật khẩu'}</span>
                </button>
                <button
                  onClick={handleClose}
                  className="px-4 py-2.5 border border-slate-200 hover:bg-slate-100 rounded-xl text-xs font-bold text-slate-700 transition-colors cursor-pointer"
                >
                  Đóng
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

