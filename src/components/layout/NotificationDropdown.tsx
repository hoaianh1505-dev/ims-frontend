import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell,
  CheckCheck,
  Trash2,
  AlertTriangle,
  AlertOctagon,
  ArrowLeftRight,
  Info,
  Loader2,
  X,
} from 'lucide-react';
import { AppNotification } from '../../types/notification.types';
import { notificationsService } from '../../services/notifications.service';
import { showToast } from '../../utils/toast.util';

const formatTimeAgo = (isoDate: string): string => {
  const diffMs = Date.now() - new Date(isoDate).getTime();
  const diffSec = Math.floor(diffMs / 1000);
  if (diffSec < 60) return 'Vừa xong';
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin} phút trước`;
  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) return `${diffHour} giờ trước`;
  const diffDay = Math.floor(diffHour / 24);
  if (diffDay < 7) return `${diffDay} ngày trước`;
  return new Date(isoDate).toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
  });
};

export const NotificationDropdown: React.FC = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [filterUnreadOnly, setFilterUnreadOnly] = useState(false);
  const [hasNewAlert, setHasNewAlert] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fetch initial notifications & unread count
  const loadNotifications = useCallback(async () => {
    try {
      const [listRes, count] = await Promise.all([
        notificationsService.getAll({ limit: 20 }),
        notificationsService.getUnreadCount(),
      ]);
      setNotifications(listRes.data || []);
      setUnreadCount(count);
    } catch (err) {
      console.error('Không thể tải thông báo:', err);
    }
  }, []);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  // Click outside listener to close dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Connect Server-Sent Events (SSE) Realtime Stream
  useEffect(() => {
    let eventSource: EventSource | null = null;
    let retryTimer: any = null;

    const connectSSE = () => {
      try {
        eventSource = notificationsService.createEventSource();
        if (!eventSource) return;

        eventSource.onmessage = (event) => {
          try {
            const newNotif: AppNotification = JSON.parse(event.data);
            if (!newNotif || !newNotif.id) return;

            // Prepend new notification to state
            setNotifications((prev) => [
              newNotif,
              ...prev.filter((n) => n.id !== newNotif.id),
            ]);
            setUnreadCount((prev) => prev + 1);
            setHasNewAlert(true);

            // Trigger sonner toast based on severity
            const toastMsg = newNotif.message
              ? `${newNotif.title}: ${newNotif.message}`
              : newNotif.title;

            if (newNotif.severity === 'DANGER') {
              showToast.error(toastMsg);
            } else if (newNotif.severity === 'WARNING') {
              showToast.warn(toastMsg);
            } else {
              showToast.info(toastMsg);
            }

            // Remove pulse after 4s
            setTimeout(() => setHasNewAlert(false), 4000);
          } catch (parseErr) {
            console.error('Lỗi phân tích cú pháp SSE notification:', parseErr);
          }
        };

        eventSource.onerror = () => {
          if (eventSource) {
            eventSource.close();
            eventSource = null;
          }
          // Retry after 5s
          retryTimer = setTimeout(connectSSE, 5000);
        };
      } catch (err) {
        console.error('Lỗi kết nối SSE stream:', err);
      }
    };

    connectSSE();

    return () => {
      if (eventSource) eventSource.close();
      if (retryTimer) clearTimeout(retryTimer);
    };
  }, []);

  const handleToggleOpen = () => {
    const nextState = !isOpen;
    setIsOpen(nextState);
    if (nextState) {
      loadNotifications();
    }
  };

  const handleMarkAsRead = async (notif: AppNotification) => {
    if (!notif.is_read) {
      try {
        await notificationsService.markAsRead(notif.id);
        setNotifications((prev) =>
          prev.map((n) => (n.id === notif.id ? { ...n, is_read: true } : n))
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      } catch (err) {
        console.error(err);
      }
    }

    // Optional navigation based on reference_type
    if (notif.reference_type === 'STOCK_TRANSACTION') {
      setIsOpen(false);
      navigate('/stock-transactions');
    } else if (notif.reference_type === 'PRODUCT') {
      setIsOpen(false);
      navigate('/products');
    }
  };

  const handleMarkAllAsRead = async () => {
    if (unreadCount === 0) return;
    setLoading(true);
    try {
      await notificationsService.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      setUnreadCount(0);
      showToast.success('Đã đánh dấu tất cả thông báo là đã đọc');
    } catch (err) {
      showToast.error('Không thể cập nhật trạng thái thông báo');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    try {
      await notificationsService.delete(id);
      const target = notifications.find((n) => n.id === id);
      if (target && !target.is_read) {
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    } catch {
      showToast.error('Không thể xóa thông báo');
    }
  };

  const displayedNotifications = filterUnreadOnly
    ? notifications.filter((n) => !n.is_read)
    : notifications;

  const renderIcon = (notif: AppNotification) => {
    if (notif.type === 'OUT_OF_STOCK' || notif.severity === 'DANGER') {
      return (
        <div className="w-8 h-8 rounded-full bg-rose-50 border border-rose-200/80 flex items-center justify-center shrink-0 text-rose-600">
          <AlertOctagon className="w-4 h-4" />
        </div>
      );
    }
    if (notif.type === 'LOW_STOCK' || notif.severity === 'WARNING') {
      return (
        <div className="w-8 h-8 rounded-full bg-amber-50 border border-amber-200/80 flex items-center justify-center shrink-0 text-amber-600">
          <AlertTriangle className="w-4 h-4" />
        </div>
      );
    }
    if (notif.type === 'STOCK_TRANSACTION') {
      return (
        <div className="w-8 h-8 rounded-full bg-blue-50 border border-blue-200/80 flex items-center justify-center shrink-0 text-blue-600">
          <ArrowLeftRight className="w-4 h-4" />
        </div>
      );
    }
    return (
      <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200/80 flex items-center justify-center shrink-0 text-slate-600">
        <Info className="w-4 h-4" />
      </div>
    );
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* BELL TRIGGER BUTTON */}
      <button
        onClick={handleToggleOpen}
        title="Thông báo hệ thống (Realtime SSE)"
        className={`relative p-2 rounded-xl transition-all cursor-pointer ${
          isOpen
            ? 'bg-slate-100 text-slate-900 shadow-2xs'
            : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
        }`}
      >
        <Bell className={`w-5 h-5 ${hasNewAlert ? 'animate-bounce text-[#2563EB]' : ''}`} />

        {/* Unread badge count */}
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-[#2563EB] text-white font-mono font-bold text-[10px] flex items-center justify-center ring-2 ring-white shadow-2xs animate-in zoom-in-75 duration-150">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* DROPDOWN POPOVER */}
      {isOpen && (
        <div className="absolute right-0 top-12 z-50 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-200/90 overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-150 text-slate-800">
          {/* Header */}
          <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/70 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm text-slate-900">Thông báo</span>
              {unreadCount > 0 && (
                <span className="bg-blue-50 text-blue-700 border border-blue-200 font-semibold text-[11px] px-2 py-0.5 rounded-full">
                  {unreadCount} mới
                </span>
              )}
            </div>

            <div className="flex items-center gap-1">
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  disabled={loading}
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-500 hover:text-slate-900 px-2 py-1 rounded-lg hover:bg-slate-200/60 transition-colors cursor-pointer"
                  title="Đánh dấu tất cả là đã đọc"
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                  <span>Đã đọc hết</span>
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200/60 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Filter Tab bar */}
          <div className="px-3 py-1.5 bg-white border-b border-slate-100 flex items-center gap-2 text-xs font-semibold">
            <button
              onClick={() => setFilterUnreadOnly(false)}
              className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                !filterUnreadOnly
                  ? 'bg-slate-100 text-slate-900 font-bold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Tất cả ({notifications.length})
            </button>
            <button
              onClick={() => setFilterUnreadOnly(true)}
              className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                filterUnreadOnly
                  ? 'bg-slate-100 text-slate-900 font-bold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Chưa đọc ({unreadCount})
            </button>
          </div>

          {/* List items */}
          <div className="max-h-[380px] overflow-y-auto divide-y divide-slate-100 custom-scrollbar">
            {loading && notifications.length === 0 ? (
              <div className="py-12 flex flex-col items-center justify-center gap-2 text-slate-400">
                <Loader2 className="w-6 h-6 animate-spin text-slate-600" />
                <span className="text-xs">Đang tải thông báo...</span>
              </div>
            ) : displayedNotifications.length === 0 ? (
              <div className="py-12 px-4 text-center space-y-2 text-slate-400">
                <Bell className="w-8 h-8 mx-auto text-slate-300 stroke-1" />
                <div className="text-xs font-bold text-slate-700">
                  {filterUnreadOnly
                    ? 'Không có thông báo chưa đọc nào'
                    : 'Chưa có thông báo nào'}
                </div>
                <p className="text-[11px] text-slate-400 max-w-[200px] mx-auto">
                  Khi có giao dịch kho hoặc cảnh báo tồn kho, thông báo realtime sẽ xuất hiện ở đây.
                </p>
              </div>
            ) : (
              displayedNotifications.map((notif) => (
                <div
                  key={notif.id}
                  onClick={() => handleMarkAsRead(notif)}
                  className={`p-3.5 flex items-start gap-3 transition-colors cursor-pointer group relative ${
                    !notif.is_read
                      ? 'bg-rose-50/20 hover:bg-rose-50/40'
                      : 'hover:bg-slate-50/80 bg-white'
                  }`}
                >
                  {/* Icon */}
                  {renderIcon(notif)}

                  {/* Content */}
                  <div className="flex-1 min-w-0 pr-6">
                    <div className="flex items-center gap-1.5">
                      <h4
                        className={`text-xs line-clamp-1 ${
                          !notif.is_read
                            ? 'font-bold text-slate-900'
                            : 'font-medium text-slate-700'
                        }`}
                      >
                        {notif.title}
                      </h4>
                    </div>

                    <p className="text-xs text-slate-600 line-clamp-2 mt-0.5 leading-snug">
                      {notif.message}
                    </p>

                    <div className="flex items-center gap-2 mt-1.5 text-[11px] text-slate-400">
                      <span>{formatTimeAgo(notif.created_at)}</span>
                      {!notif.is_read && (
                        <span className="w-1.5 h-1.5 rounded-full bg-[#2563EB]" />
                      )}
                    </div>
                  </div>

                  {/* Actions: Delete */}
                  <button
                    onClick={(e) => handleDelete(e, notif.id)}
                    className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all absolute top-3 right-3 cursor-pointer"
                    title="Xóa thông báo"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="px-4 py-2 border-t border-slate-100 bg-slate-50/70 flex items-center justify-between text-[11px] text-slate-400">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Realtime SSE hoạt động</span>
            </span>
            <button
              onClick={() => setIsOpen(false)}
              className="text-slate-600 hover:text-slate-900 font-semibold cursor-pointer"
            >
              Đóng
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

