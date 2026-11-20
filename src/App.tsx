import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
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

export default function App() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return (
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

            {/* 3. Danh mục & Đơn vị tính (Real data from PostgreSQL) */}
            <Route path="categories" element={<CategoriesPage />} />

            {/* 4. Tổ chức kho hàng & Vị trí kệ */}
            <Route path="warehouses" element={<WarehousesPage />} />

            {/* 5. Nhà cung cấp (Real data from PostgreSQL) */}
            <Route path="suppliers" element={<SuppliersPage />} />

            {/* 6. Khách hàng & Đại lý (Real data from PostgreSQL) */}
            <Route path="customers" element={<CustomersPage />} />

            {/* 7. Xử lý xuất / nhập (Real data from PostgreSQL) */}
            <Route path="stock-transactions" element={<StockTransactionsPage />} />

            {/* 8. Đơn đặt hàng nhà cung cấp PO (Real data from PostgreSQL) */}
            <Route path="purchase-orders" element={<PurchaseOrdersPage />} />

            {/* 9. Phiếu của tôi (Real data from PostgreSQL) */}
            <Route path="my-tasks" element={<MyTasksPage />} />

            {/* 8. Hồ sơ cá nhân */}
            <Route path="profile" element={<ProfilePage />} />

            {/* 9. Quản trị tài khoản & quyền */}
            <Route path="users" element={<UsersPage />} />

            {/* 10. Nhật ký hệ thống (Real data from PostgreSQL) */}
            <Route path="audit-logs" element={<AuditLogsPage />} />
          </Route>
        </Route>

        {/* Fallback route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
