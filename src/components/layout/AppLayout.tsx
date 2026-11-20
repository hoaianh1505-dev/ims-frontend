import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { AIAssistantWidget } from '../assistant/AIAssistantWidget';
import { useAuthStore } from '../../stores/auth.store';
import { authService } from '../../services/auth.service';

export const AppLayout: React.FC = () => {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const location = useLocation();
  const { updateUser, isAuthenticated } = useAuthStore();

  // Luôn đồng bộ hồ sơ & avatar mới nhất từ server khi vào layout
  useEffect(() => {
    if (isAuthenticated) {
      authService.getProfile().then((fresh) => {
        if (fresh) updateUser(fresh);
      }).catch(() => {});
    }
  }, [isAuthenticated]);

  // Đóng sidebar trên mobile mỗi khi chuyển trang
  useEffect(() => {
    setIsMobileSidebarOpen(false);
  }, [location.pathname]);

  return (
    <div className="h-full w-full bg-[#EDF0F5] flex overflow-hidden relative">
      {/* Sidebar (Responsive cho desktop & mobile) */}
      <Sidebar
        isMobileOpen={isMobileSidebarOpen}
        onClose={() => setIsMobileSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        <Header onOpenMobileSidebar={() => setIsMobileSidebarOpen(true)} />

        <main className="flex-1 flex flex-col min-h-0 overflow-y-auto">
          <div key={location.pathname} className="flex-1 flex flex-col min-h-0 animate-page-enter">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Trợ lý AI Quản Lý Kho Hàng (Bóng chat nổi góc dưới bên phải - Stateless) */}
      <AIAssistantWidget />
    </div>
  );
};
