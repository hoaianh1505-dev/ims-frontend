import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

export const AppLayout: React.FC = () => {
  const location = useLocation();

  return (
    <div className="h-full w-full bg-[#F4F5F7] flex overflow-hidden">
      {/* Sidebar cố định */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        <Header />

        <main className="flex-1 flex flex-col min-h-0 overflow-y-auto">
          <div key={location.pathname} className="flex-1 flex flex-col min-h-0 animate-page-enter">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

