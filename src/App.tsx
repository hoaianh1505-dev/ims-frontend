import { Component, ErrorInfo, ReactNode } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { useAuthStore } from './stores/auth.store';
import {
  LoginPage,
  DashboardPage,
  CategoriesPage,
  ProductsPage,
  WarehousesPage,
  UsersPage,
  SuppliersPage,
  CustomersPage,
  StockTransactionsPage,
  ProfilePage,
  AuditLogsPage,
  MyTasksPage,
  PurchaseOrdersPage,
} from './pages';
import { AppLayout } from './components/layout/AppLayout';
import { ProtectedRoute } from './components/common/ProtectedRoute';

// Error Boundary chống trắng màn toàn hệ thống
interface Props {
  children: ReactNode;
}
interface State {
  hasError: boolean;
  error: Error | null;
}
class GlobalErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Lỗi giao diện uncaught:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6 text-slate-100">
          <div className="max-w-md w-full bg-[#161b22] border border-[#30363d] rounded-2xl p-6 text-center space-y-4 shadow-2xl">
            <div className="w-12 h-12 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-500 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h2 className="text-lg font-bold text-white">Đã xảy ra lỗi hiển thị</h2>
            <p className="text-xs text-slate-400">
              Hệ thống đã tự động ghi nhận sự cố để tránh trắng màn hình. Bạn có thể nhấn tải lại trang để tiếp tục làm việc.
            </p>
            {this.state.error && (
              <pre className="text-[11px] font-mono text-rose-300 bg-rose-950/30 p-2.5 rounded-lg text-left overflow-x-auto border border-rose-900/40">
                {this.state.error.message}
              </pre>
            )}
            <button
              onClick={() => {
                this.setState({ hasError: false, error: null });
                window.location.reload();
              }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#EE3D43] hover:bg-[#D9343A] text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Tải lại trang</span>
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function App() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return (
    <GlobalErrorBoundary>
      <BrowserRouter>
        <Toaster position="top-right" duration={3500} />
        <Routes>
          {/* Public Route */}
          <Route
            path="/login"
            element={
              isAuthenticated ? <Navigate to="/" replace /> : <LoginPage />
            }
          />

          {/* Protected Routes */}
          <Route element={<ProtectedRoute />}>
            <Route element={<AppLayout />}>
              {/* 1. Tổng quan */}
              <Route index element={<DashboardPage />} />
              <Route path="dashboard" element={<Navigate to="/" replace />} />

              {/* 2. Sản phẩm (Real data from PostgreSQL) */}
              <Route path="products" element={<ProductsPage />} />
              <Route path="product" element={<Navigate to="/products" replace />} />

              {/* 3. Danh mục & Đơn vị tính (Real data from PostgreSQL) */}
              <Route path="categories" element={<CategoriesPage />} />
              <Route path="category" element={<Navigate to="/categories" replace />} />

              {/* 4. Tổ chức kho hàng & Vị trí kệ */}
              <Route path="warehouses" element={<WarehousesPage />} />
              <Route path="warehouse" element={<Navigate to="/warehouses" replace />} />

              {/* 5. Nhà cung cấp (Real data from PostgreSQL) */}
              <Route path="suppliers" element={<SuppliersPage />} />
              <Route path="supplier" element={<Navigate to="/suppliers" replace />} />

              {/* 6. Khách hàng & Đại lý (Real data from PostgreSQL) */}
              <Route path="customers" element={<CustomersPage />} />
              <Route path="customer" element={<Navigate to="/customers" replace />} />

              {/* 7. Xử lý xuất / nhập (Real data from PostgreSQL) */}
              <Route path="stock-transactions" element={<StockTransactionsPage />} />
              <Route path="stock-transaction" element={<Navigate to="/stock-transactions" replace />} />

              {/* 8. Đơn đặt hàng nhà cung cấp PO (Real data from PostgreSQL) */}
              <Route path="purchase-orders" element={<PurchaseOrdersPage />} />
              <Route path="purchase-order" element={<Navigate to="/purchase-orders" replace />} />

              {/* 9. Phiếu của tôi (Real data from PostgreSQL) */}
              <Route path="my-tasks" element={<MyTasksPage />} />

              {/* 10. Hồ sơ cá nhân */}
              <Route path="profile" element={<ProfilePage />} />

              {/* 11. Quản trị tài khoản & quyền */}
              <Route path="users" element={<UsersPage />} />
              <Route path="user" element={<Navigate to="/users" replace />} />

              {/* 12. Nhật ký hệ thống (Real data from PostgreSQL) */}
              <Route path="audit-logs" element={<AuditLogsPage />} />
            </Route>
          </Route>

          {/* Fallback route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </GlobalErrorBoundary>
  );
}
