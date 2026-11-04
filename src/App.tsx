import { useState } from 'react';
import { useAuthStore } from './stores/auth.store';
import { LoginPage, DashboardPage } from './pages';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';

export default function App() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const [activeTab, setActiveTab] = useState('dashboard');

  // Nếu chưa đăng nhập -> Tự động chuyển hướng sang màn hình Login
  if (!isAuthenticated) {
    return <LoginPage />;
  }

  // Đã đăng nhập -> Vào giao diện chính của hệ thống
  return (
    <div className="h-screen bg-brand-bg flex overflow-hidden">
      {/* Sidebar bên trái cố định */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        <Header breadcrumb={activeTab === 'dashboard' ? 'Tổng quan' : activeTab} />

        <main className="flex-1 overflow-y-auto">
          {activeTab === 'dashboard' && <DashboardPage />}
          {activeTab !== 'dashboard' && (
            <div className="p-8 text-center text-slate-400">
              <div className="bg-white rounded-2xl p-12 border border-slate-100 max-w-lg mx-auto">
                <h3 className="text-lg font-bold text-slate-800">Màn hình {activeTab}</h3>
                <button
                  onClick={() => setActiveTab('dashboard')}
                  className="mt-4 px-4 py-2 bg-brand-primary text-white rounded-lg text-xs font-semibold hover:bg-brand-hover cursor-pointer"
                >
                  Quay lại Tổng quan
                </button>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
