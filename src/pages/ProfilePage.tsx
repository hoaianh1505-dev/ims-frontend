import React, { useState, useRef, useEffect } from 'react';
import {
  User,
  Mail,
  Phone,
  Shield,
  KeyRound,
  Camera,
  CheckCircle2,
  Lock,
  Eye,
  EyeOff,
  Save,
  Loader2,
  BadgeCheck,
} from 'lucide-react';
import { useAuthStore } from '../stores/auth.store';
import { usersService } from '../services/users.service';
import { authService } from '../services/auth.service';
import { showToast } from '../utils/toast.util';
import { formatImageUrl } from '../utils/image.util';

const ROLE_LABELS: Record<string, { label: string; badge: string; desc: string }> = {
  ADMIN: {
    label: 'Quản trị viên (Super Admin)',
    badge: 'bg-red-50 text-red-700 border-red-200',
    desc: 'Toàn quyền cấu hình hệ thống, quản lý người dùng, phân quyền và dữ liệu.',
  },
  MANAGER: {
    label: 'Quản lý kho (Manager)',
    badge: 'bg-blue-50 text-blue-700 border-blue-200',
    desc: 'Phê duyệt phiếu xuất nhập, quản lý định mức tồn kho và kiểm kê.',
  },
  STAFF: {
    label: 'Nhân viên kho (Staff)',
    badge: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    desc: 'Thực hiện tạo phiếu nhập/xuất kho, quét mã vạch và kiểm đếm thực tế.',
  },
};

export const ProfilePage: React.FC = () => {
  const { user, updateUser } = useAuthStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Profile Form State
  const [displayName, setDisplayName] = useState(user?.display_name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [previewAvatar, setPreviewAvatar] = useState<string | null>(null);
  const [avatarError, setAvatarError] = useState(false);

  // Sync fresh profile from server on mount
  useEffect(() => {
    authService.getProfile().then((fresh) => {
      if (fresh) {
        updateUser(fresh);
        if (fresh.display_name) setDisplayName(fresh.display_name);
        if (fresh.email) setEmail(fresh.email);
        if (fresh.phone) setPhone(fresh.phone);
      }
    }).catch(() => {});
  }, []);

  const activeAvatarSrc = previewAvatar || user?.avatar;
  const resolvedAvatarUrl = formatImageUrl(activeAvatarSrc);

  useEffect(() => {
    setAvatarError(false);
  }, [activeAvatarSrc]);

  // Password Form State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [isChangingPass, setIsChangingPass] = useState(false);

  const roleInfo = ROLE_LABELS[user?.role || ''] || {
    label: user?.role || 'Người dùng',
    badge: 'bg-slate-50 text-slate-700 border-slate-200',
    desc: 'Người dùng hệ thống quản lý kho IMS.',
  };

  // Avatar Upload Handler
  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user?.id) return;

    if (!file.type.startsWith('image/')) {
      showToast.error('Vui lòng chọn file hình ảnh (jpg, png, webp)');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      showToast.error('Kích thước ảnh tối đa 5MB');
      return;
    }

    // Instant local preview
    const objectUrl = URL.createObjectURL(file);
    setPreviewAvatar(objectUrl);
    setAvatarError(false);

    try {
      setIsUploadingAvatar(true);
      const updated: any = await usersService.uploadAvatar(user.id, file);
      const newAvatar = updated?.avatar || updated?.data?.avatar;
      if (newAvatar) {
        updateUser({ avatar: newAvatar });
      }
      showToast.success('Cập nhật ảnh đại diện thành công!');
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Không thể tải ảnh đại diện lên.';
      showToast.error(msg);
      setPreviewAvatar(null);
    } finally {
      setIsUploadingAvatar(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Update Profile Info Handler
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) return;

    try {
      setIsUpdatingProfile(true);
      const res = await usersService.update(user.id, {
        display_name: displayName.trim(),
        email: email.trim(),
        phone: phone.trim(),
      });

      updateUser({
        display_name: res.display_name || displayName.trim(),
        email: res.email || email.trim(),
        phone: res.phone || phone.trim(),
      });

      showToast.success('Cập nhật thông tin hồ sơ thành công!');
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Cập nhật thông tin thất bại.';
      showToast.error(msg);
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  // Change Password Handler
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword.trim() || !newPassword.trim()) {
      showToast.warn('Vui lòng điền đầy đủ mật khẩu hiện tại và mật khẩu mới.');
      return;
    }

    if (newPassword.length < 6) {
      showToast.warn('Mật khẩu mới phải có ít nhất 6 ký tự.');
      return;
    }

    if (newPassword !== confirmPassword) {
      showToast.error('Mật khẩu xác nhận không khớp với mật khẩu mới.');
      return;
    }

    try {
      setIsChangingPass(true);
      await authService.changePassword(currentPassword, newPassword);
      showToast.success('Đổi mật khẩu thành công!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Mật khẩu hiện tại không chính xác.';
      showToast.error(msg);
    } finally {
      setIsChangingPass(false);
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8 max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 pb-16">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
          <User className="w-7 h-7 text-red-600" />
          Hồ sơ cá nhân
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          Quản lý thông tin tài khoản, cập nhật ảnh đại diện và thiết lập mật khẩu bảo mật
        </p>
      </div>

      {/* Main Profile Header Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 sm:p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-red-500/5 rounded-full blur-3xl -z-0 pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row items-center sm:items-start gap-6">
          {/* Avatar with Upload Badge */}
          <div className="relative group">
            <div className="relative w-28 h-28 rounded-2xl overflow-hidden ring-4 ring-slate-100 shadow-md bg-slate-100 flex items-center justify-center">
              {resolvedAvatarUrl && !avatarError ? (
                <img
                  src={resolvedAvatarUrl}
                  alt={user?.display_name || user?.username || 'Avatar'}
                  onError={() => setAvatarError(true)}
                  className="w-full h-full object-cover"
                />
              ) : (
                <User className="w-12 h-12 text-slate-400" />
              )}
              {isUploadingAvatar && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white">
                  <Loader2 className="w-8 h-8 animate-spin" />
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploadingAvatar}
              className="absolute -bottom-2 -right-2 p-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl shadow-md transition-transform hover:scale-110 cursor-pointer disabled:opacity-50"
              title="Đổi ảnh đại diện"
            >
              <Camera className="w-4 h-4" />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarChange}
            />
          </div>

          {/* User Details Headline */}
          <div className="text-center sm:text-left flex-1">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2.5 justify-center sm:justify-start">
              <h2 className="text-2xl font-bold text-slate-900">
                {user?.display_name || user?.username || 'Người dùng'}
              </h2>
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-full border ${roleInfo.badge}`}
              >
                <Shield className="w-3.5 h-3.5" />
                {roleInfo.label}
              </span>
            </div>

            <p className="text-slate-500 text-sm mt-1.5 flex items-center justify-center sm:justify-start gap-1.5">
              <span>@{user?.username}</span>
              <span>•</span>
              <span className="inline-flex items-center gap-1 text-emerald-600 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5" /> Tài khoản đang hoạt động
              </span>
            </p>

            <p className="text-slate-600 text-sm mt-3 max-w-2xl bg-slate-50 border border-slate-200/60 rounded-xl p-3">
              {roleInfo.desc}
            </p>
          </div>
        </div>
      </div>

      {/* Grid: 2 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Personal Information Form (7 Cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 sm:p-7">
          <div className="flex items-center justify-between pb-5 border-b border-slate-100 mb-6">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-red-50 text-red-600 rounded-xl">
                <User className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-lg">Thông tin tài khoản</h3>
                <p className="text-xs text-slate-500">Cập nhật thông tin định danh và liên hệ</p>
              </div>
            </div>
          </div>

          <form onSubmit={handleUpdateProfile} className="space-y-5">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Tên đăng nhập (Username)
              </label>
              <input
                type="text"
                disabled
                value={user?.username || ''}
                className="w-full px-4 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-slate-500 font-medium cursor-not-allowed select-none"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">
                Tên đăng nhập được dùng cố định để định danh tài khoản trong hệ thống
              </span>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Tên hiển thị (Họ và tên)
              </label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  required
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Nhập họ và tên..."
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-900 font-medium focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition-all text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Địa chỉ Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="email@ims.com"
                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-900 font-medium focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition-all text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Số điện thoại
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="0901 234 567"
                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-900 font-medium focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition-all text-sm"
                  />
                </div>
              </div>
            </div>

            <div className="pt-3 flex justify-end">
              <button
                type="submit"
                disabled={isUpdatingProfile}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white font-medium rounded-xl shadow-sm transition-all hover:shadow cursor-pointer disabled:opacity-50 text-sm"
              >
                {isUpdatingProfile ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                Lưu thay đổi thông tin
              </button>
            </div>
          </form>
        </div>

        {/* Right Column: Change Password & Security (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Password Card */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 sm:p-7">
            <div className="flex items-center gap-2.5 pb-5 border-b border-slate-100 mb-6">
              <div className="p-2 bg-amber-50 text-amber-600 rounded-xl">
                <KeyRound className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-lg">Đổi mật khẩu</h3>
                <p className="text-xs text-slate-500">Bảo vệ an toàn cho tài khoản cá nhân</p>
              </div>
            </div>

            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Mật khẩu hiện tại
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type={showCurrentPass ? 'text' : 'password'}
                    required
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Nhập mật khẩu hiện tại..."
                    className="w-full pl-10 pr-10 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-900 font-medium focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20 text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPass(!showCurrentPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showCurrentPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Mật khẩu mới
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type={showNewPass ? 'text' : 'password'}
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Ít nhất 6 ký tự..."
                    className="w-full pl-10 pr-10 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-900 font-medium focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20 text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPass(!showNewPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showNewPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Xác nhận mật khẩu mới
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Nhập lại mật khẩu mới..."
                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-900 font-medium focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20 text-sm"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isChangingPass}
                  className="w-full inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-medium rounded-xl shadow-sm transition-all cursor-pointer disabled:opacity-50 text-sm"
                >
                  {isChangingPass ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <KeyRound className="w-4 h-4" />
                  )}
                  Cập nhật mật khẩu mới
                </button>
              </div>
            </form>
          </div>

          {/* Quick Security Badge Box */}
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-2xl p-5 shadow-sm space-y-3">
            <div className="flex items-center gap-2 text-red-400 font-semibold text-sm">
              <BadgeCheck className="w-5 h-5 text-red-500" />
              Bảo mật hệ thống IMS
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Mật khẩu được mã hóa chuẩn bcrypt 256-bit. Mọi phiên đăng nhập đều được bảo vệ bởi
              JWT Token với thời hạn tự động làm mới an toàn.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
