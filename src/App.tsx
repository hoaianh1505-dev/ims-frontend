import { Component, ErrorInfo, ReactNode, Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { AlertTriangle, RefreshCw, Home, Loader2 } from 'lucide-react';
import { useAuthStore } from './stores/auth.store';
import { AppLayout } from './components/layout/AppLayout';
import { ProtectedRoute } from './components/common/ProtectedRoute';

// Route-level Code Splitting để giảm kích thước bundle tải lần đầu
const LoginPage = lazy(() => import('./pages/LoginPage').then((m) => ({ default: m.LoginPage })));
const DashboardPage = lazy(() =>
  import('./pages/DashboardPage').then((m) => ({ default: m.DashboardPage })),
);
const CategoriesPage = lazy(() =>
  import('./pages/CategoriesPage').then((m) => ({ default: m.CategoriesPage })),
);
const ProductsPage = lazy(() =>
  import('./pages/ProductsPage').then((m) => ({ default: m.ProductsPage })),
);
const WarehousesPage = lazy(() =>
  import('./pages/WarehousesPage').then((m) => ({ default: m.WarehousesPage })),
);
const UsersPage = lazy(() => import('./pages/UsersPage').then((m) => ({ default: m.UsersPage })));
const SuppliersPage = lazy(() =>
  import('./pages/SuppliersPage').then((m) => ({ default: m.SuppliersPage })),
);
const CustomersPage = lazy(() =>
  import('./pages/CustomersPage').then((m) => ({ default: m.CustomersPage })),
);
const StockTransactionsPage = lazy(() =>
  import('./pages/StockTransactionsPage').then((m) => ({ default: m.StockTransactionsPage })),
);
const ProfilePage = lazy(() =>
  import('./pages/ProfilePage').then((m) => ({ default: m.ProfilePage })),
);
const AuditLogsPage = lazy(() =>
  import('./pages/AuditLogsPage').then((m) => ({ default: m.AuditLogsPage })),
);
const MyTasksPage = lazy(() =>
  import('./pages/MyTasksPage').then((m) => ({ default: m.MyTasksPage })),
);
const PurchaseOrdersPage = lazy(() =>
  import('./pages/PurchaseOrdersPage').then((m) => ({ default: m.PurchaseOrdersPage })),
);
const StocktakingPage = lazy(() =>
  import('./pages/StocktakingPage').then((m) => ({ default: m.StocktakingPage })),
);

const PageLoader = () => (
  <div className="flex-1 flex items-center justify-center min-h-[300px] text-slate-500 gap-2 text-xs font-medium">
    <Loader2 className="w-5 h-5 animate-spin text-[#294238]" />
    <span>Đang tải trang...</span>
  </div>
);

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
        <div className="min-h-screen bg-slate-50 dark:bg-[#0b0f17] flex items-center justify-center p-6 text-slate-800 dark:text-slate-200">
          <div className="max-w-md w-full bg-white dark:bg-[#161b22] border border-slate-200 dark:border-[#384252] rounded-3xl p-7 text-center space-y-5 shadow-xl animate-in fade-in zoom-in-95 duration-200">
            <div className="w-14 h-14 rounded-2xl bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 text-[#294238] flex items-center justify-center mx-auto shadow-xs">
              <AlertTriangle className="w-7 h-7" />
            </div>

            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
                Đã xảy ra sự cố hiển thị
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
                Hệ thống đã tự động bảo vệ để tránh lỗi trắng màn hình. Bạn có thể nhấn tải lại trang để tiếp tục làm việc bình thường.
              </p>
            </div>

            {this.state.error && (
              <div className="p-3 bg-slate-50 dark:bg-[#0d1117] rounded-xl border border-slate-200 dark:border-[#384252] text-left">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Chi tiết kỹ thuật:
                </span>
                <p className="text-xs font-mono text-rose-600 dark:text-rose-400 truncate">
                  {this.state.error.message}
                </p>
              </div>
            )}

            <div className="flex items-center justify-center gap-3 pt-1">
              <button
                type="button"
                onClick={() => {
                  this.setState({ hasError: false, error: null });
                  window.location.reload();
                }}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-[#294238] hover:bg-[#20372e] text-white rounded-xl text-xs sm:text-sm font-semibold shadow-xs transition-colors cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Tải lại trang</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  this.setState({ hasError: false, error: null });
                  window.location.href = '/';
                }}
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-[#21262d] dark:hover:bg-[#30363d] text-slate-700 dark:text-slate-300 rounded-xl text-xs sm:text-sm font-semibold transition-colors cursor-pointer"
              >
                <Home className="w-4 h-4" />
                <span>Về trang chủ</span>
              </button>
            </div>
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
        <Suspense fallback={<PageLoader />}>
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

              {/* 8b. Kiểm kê kho (Stocktaking) */}
              <Route path="stocktaking" element={<StocktakingPage />} />

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
        </Suspense>
      </BrowserRouter>
    </GlobalErrorBoundary>
  );
}
