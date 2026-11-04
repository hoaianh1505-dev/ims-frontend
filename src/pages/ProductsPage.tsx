import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Package,
  Search,
  Plus,
  Filter,
  Layers,
  Edit3,
  Trash2,
  AlertTriangle,
  X,
  Loader2,
  CheckCircle2,
  RefreshCw,
  Eye,
  ChevronLeft,
  ChevronRight,
  ShieldAlert,
  SlidersHorizontal,
} from 'lucide-react';
import { productsService } from '../services/products.service';
import { categoriesService } from '../services/categories.service';
import { unitsService } from '../services/units.service';
import { Product } from '../types/product.types';
import { Category, Unit } from '../types/category.types';
import { useAuthStore } from '../stores/auth.store';

export const ProductsPage: React.FC = () => {
  const { user } = useAuthStore();
  const isManagerOrAdmin = user?.role === 'ADMIN' || user?.role === 'MANAGER';
  const isAdmin = user?.role === 'ADMIN';

  // Data State
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);

  // Filter & Search State
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedUnit, setSelectedUnit] = useState<string>('');
  const [sortBy, setSortBy] = useState<'name' | 'price_desc' | 'price_asc' | 'newest'>('newest');

  // Pagination State
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Drawer & Modal State
  const [activeDrawerProduct, setActiveDrawerProduct] = useState<Product | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form State
  const [formSku, setFormSku] = useState('');
  const [formBarcode, setFormBarcode] = useState('');
  const [formName, setFormName] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formCostPrice, setFormCostPrice] = useState<number | string>('');
  const [formSellingPrice, setFormSellingPrice] = useState<number | string>('');
  const [formLowStockThreshold, setFormLowStockThreshold] = useState<number | string>(10);
  const [formCategoryId, setFormCategoryId] = useState('');
  const [formUnitId, setFormUnitId] = useState('');
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Custom Delete Confirm Dialog
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Toast Notification
  const [notify, setNotify] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const showNotify = (type: 'success' | 'error', message: string) => {
    setNotify({ type, message });
    setTimeout(() => setNotify(null), 4000);
  };

  // Currency Formatter
  const formatVND = (amount: number | string | undefined) => {
    const val = Number(amount);
    if (isNaN(val)) return '0 ₫';
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);
  };

  // Load Categories & Units
  useEffect(() => {
    const loadDropdownData = async () => {
      try {
        const [catRes, unitRes] = await Promise.all([
          categoriesService.getAll({ limit: 100 }),
          unitsService.getAll({ limit: 100 }),
        ]);
        setCategories(catRes.data || []);
        setUnits(unitRes.data || []);
      } catch (err) {
        console.error('Lỗi tải danh mục/đơn vị:', err);
      }
    };
    loadDropdownData();
  }, []);

  // Fetch Products
  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await productsService.getAll({
        search: search.trim() || undefined,
        category_id: selectedCategory || undefined,
        unit_id: selectedUnit || undefined,
        limit: 100,
      });
      setProducts(res.data || []);
    } catch (err) {
      console.error('Lỗi tải danh sách sản phẩm:', err);
      showNotify('error', 'Không thể kết nối tới cơ sở dữ liệu');
    } finally {
      setLoading(false);
    }
  }, [search, selectedCategory, selectedUnit]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Client-side Sort & Filtered list
  const filteredAndSortedProducts = useMemo(() => {
    let list = [...products];

    if (sortBy === 'price_desc') {
      list.sort((a, b) => Number(b.selling_price || 0) - Number(a.selling_price || 0));
    } else if (sortBy === 'price_asc') {
      list.sort((a, b) => Number(a.selling_price || 0) - Number(b.selling_price || 0));
    } else if (sortBy === 'name') {
      list.sort((a, b) => a.name.localeCompare(b.name, 'vi'));
    } else {
      list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }

    return list;
  }, [products, sortBy]);

  // Pagination calculation
  const totalItems = filteredAndSortedProducts.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const currentPage = Math.min(page, totalPages);
  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredAndSortedProducts.slice(start, start + pageSize);
  }, [filteredAndSortedProducts, currentPage, pageSize]);

  // Open Create Modal
  const openCreateModal = () => {
    setEditingProduct(null);
    setFormSku('');
    setFormBarcode('');
    setFormName('');
    setFormDesc('');
    setFormCostPrice('');
    setFormSellingPrice('');
    setFormLowStockThreshold(10);
    setFormCategoryId(categories[0]?.id || '');
    setFormUnitId(units[0]?.id || '');
    setFormError('');
    setIsModalOpen(true);
  };

  // Open Edit Modal
  const openEditModal = (p: Product) => {
    setEditingProduct(p);
    setFormSku(p.sku);
    setFormBarcode(p.barcode || '');
    setFormName(p.name);
    setFormDesc(p.description || '');
    setFormCostPrice(p.cost_price || 0);
    setFormSellingPrice(p.selling_price || 0);
    setFormLowStockThreshold(p.low_stock_threshold ?? 10);
    setFormCategoryId(p.category_id || p.category?.id || '');
    setFormUnitId(p.unit_id || p.unit?.id || '');
    setFormError('');
    setIsModalOpen(true);
  };

  // Handle Save
  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formSku.trim() || !formName.trim()) {
      setFormError('Vui lòng nhập Mã SKU và Tên sản phẩm');
      return;
    }

    setSubmitting(true);
    setFormError('');

    try {
      const payload: any = {
        sku: formSku.trim().toUpperCase(),
        barcode: formBarcode.trim() || undefined,
        name: formName.trim(),
        description: formDesc.trim() || undefined,
        cost_price: Number(formCostPrice) || 0,
        selling_price: Number(formSellingPrice) || 0,
        low_stock_threshold: Number(formLowStockThreshold) || 10,
        category_id: formCategoryId || undefined,
        unit_id: formUnitId || undefined,
      };

      if (editingProduct) {
        await productsService.update(editingProduct.id, payload);
        showNotify('success', `Cập nhật sản phẩm "${formName}" thành công`);
        if (activeDrawerProduct?.id === editingProduct.id) {
          setActiveDrawerProduct({ ...editingProduct, ...payload });
        }
      } else {
        await productsService.create(payload);
        showNotify('success', `Đã thêm mới sản phẩm "${formName}"`);
      }

      setIsModalOpen(false);
      fetchProducts();
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Có lỗi xảy ra khi lưu sản phẩm';
      setFormError(Array.isArray(msg) ? msg.join(', ') : msg);
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Delete with Custom Modal
  const confirmDeleteProduct = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await productsService.delete(deleteTarget.id);
      showNotify('success', `Đã xóa sản phẩm "${deleteTarget.name}"`);
      if (activeDrawerProduct?.id === deleteTarget.id) {
        setActiveDrawerProduct(null);
      }
      setDeleteTarget(null);
      fetchProducts();
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Không thể xóa sản phẩm này';
      showNotify('error', msg);
    } finally {
      setDeleting(false);
    }
  };

  // Unit display helper
  const renderUnitBadge = (unit?: Unit) => {
    if (!unit) return <span className="text-slate-400 italic">—</span>;
    const isSame = unit.symbol && unit.name.toLowerCase() === unit.symbol.toLowerCase();
    const text = isSame || !unit.symbol ? unit.name : `${unit.name} (${unit.symbol})`;
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium bg-emerald-50 text-emerald-800 border border-emerald-200/80">
        {text}
      </span>
    );
  };

  // Profit Margin helper
  const calculateMargin = (cost: number, sell: number) => {
    if (!sell || sell <= 0) return null;
    const margin = ((sell - cost) / sell) * 100;
    return margin.toFixed(1);
  };

  return (
    <div className="p-8 max-w-[1440px] mx-auto space-y-6">
      {/* Toast Notification */}
      {notify && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-xl border text-xs font-semibold animate-in slide-in-from-bottom-3 duration-200 ${
            notify.type === 'success'
              ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
              : 'bg-rose-50 text-rose-900 border-rose-200'
          }`}
        >
          {notify.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
          )}
          <span>{notify.message}</span>
        </div>
      )}

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Danh mục sản phẩm</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-brand-light text-brand-primary border border-brand-primary/10">
              {totalItems} mặt hàng
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Quản lý mã hàng hóa, giá vốn, giá niêm yết và mức cảnh báo an toàn
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => fetchProducts()}
            className="p-2.5 text-slate-600 hover:text-brand-primary bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer"
            title="Làm mới dữ liệu từ server"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-brand-primary' : ''}`} />
          </button>

          {isManagerOrAdmin && (
            <button
              onClick={openCreateModal}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-brand-primary text-white rounded-xl text-xs font-semibold hover:bg-brand-hover shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Thêm sản phẩm</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter & Toolbar */}
      <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          {/* Search box */}
          <div className="md:col-span-5 relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Tìm theo tên sản phẩm, mã SKU hoặc mã vạch..."
              className="w-full pl-10 pr-8 py-2 bg-slate-50 hover:bg-slate-50/80 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary focus:bg-white transition-all"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Category Filter */}
          <div className="md:col-span-3">
            <div className="relative">
              <Filter className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <select
                value={selectedCategory}
                onChange={(e) => {
                  setSelectedCategory(e.target.value);
                  setPage(1);
                }}
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary focus:bg-white transition-all cursor-pointer"
              >
                <option value="">Tất cả danh mục</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Unit Filter */}
          <div className="md:col-span-2">
            <select
              value={selectedUnit}
              onChange={(e) => {
                setSelectedUnit(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary focus:bg-white transition-all cursor-pointer"
            >
              <option value="">Tất cả đơn vị</option>
              {units.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name}
                </option>
              ))}
            </select>
          </div>

          {/* Sort By */}
          <div className="md:col-span-2">
            <div className="relative">
              <SlidersHorizontal className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary focus:bg-white transition-all cursor-pointer"
              >
                <option value="newest">Mới nhất</option>
                <option value="name">Tên A-Z</option>
                <option value="price_desc">Giá bán cao nhất</option>
                <option value="price_asc">Giá bán thấp nhất</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Main Data Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        {loading ? (
          <div className="py-24 flex flex-col items-center justify-center gap-3 text-slate-400">
            <Loader2 className="w-8 h-8 animate-spin text-brand-primary" />
            <span className="text-xs font-medium">Đang đồng bộ dữ liệu PostgreSQL...</span>
          </div>
        ) : paginatedProducts.length === 0 ? (
          <div className="py-20 text-center text-slate-400 space-y-3">
            <Package className="w-12 h-12 mx-auto text-slate-300 stroke-1" />
            <div className="text-sm font-semibold text-slate-700">Không tìm thấy sản phẩm nào</div>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Không có sản phẩm nào khớp với điều kiện lọc hiện tại. Hãy thử xóa bớt bộ lọc.
            </p>
          </div>
        ) : (
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/90 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider select-none">
                <th className="py-3 px-5">Sản phẩm / Quy cách</th>
                <th className="py-3 px-4 w-40">Danh mục</th>
                <th className="py-3 px-4 w-44 text-right">Định giá niêm yết</th>
                <th className="py-3 px-4 w-36 text-center">Tồn kho thực tế</th>
                <th className="py-3 px-5 w-28 text-right whitespace-nowrap">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {paginatedProducts.map((p) => {
                const cost = Number(p.cost_price || 0);
                const sell = Number(p.selling_price || 0);
                const margin = calculateMargin(cost, sell);

                return (
                  <tr
                    key={p.id}
                    onClick={() => setActiveDrawerProduct(p)}
                    className="hover:bg-slate-50/70 transition-colors group cursor-pointer"
                  >
                    {/* Name, SKU & Unit */}
                    <td className="py-3.5 px-5">
                      <div className="font-bold text-slate-900 group-hover:text-brand-primary transition-colors line-clamp-1">
                        {p.name}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="font-mono text-[11px] font-semibold text-brand-primary bg-brand-light px-1.5 py-0.5 rounded border border-brand-primary/10">
                          {p.sku}
                        </span>
                        {p.unit && (
                          <span className="text-[11px] text-slate-500 font-medium">
                            • {p.unit.name}
                          </span>
                        )}
                        {p.barcode && (
                          <span className="font-mono text-[10px] text-slate-400 hidden sm:inline">
                            • {p.barcode}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Category */}
                    <td className="py-3.5 px-4">
                      {p.category ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200 truncate max-w-[160px]">
                          <Layers className="w-3 h-3 text-slate-400 shrink-0" />
                          <span className="truncate">{p.category.name}</span>
                        </span>
                      ) : (
                        <span className="text-slate-400 italic">Chưa phân loại</span>
                      )}
                    </td>

                    {/* Selling Price & Cost */}
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="font-bold text-slate-900 text-xs">{formatVND(sell)}</div>
                      <div className="flex items-center justify-end gap-1.5 text-[10px] text-slate-400 mt-0.5">
                        <span>Vốn: {formatVND(cost)}</span>
                        {margin && (
                          <span className="font-bold text-emerald-700 bg-emerald-50 px-1 py-0.2 rounded">
                            +{margin}%
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Stock Quantity & Status */}
                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
                      {(() => {
                        const stock = p.current_stock ?? 0;
                        const threshold = p.low_stock_threshold ?? 10;
                        const isOutOfStock = stock <= 0;
                        const isLowStock = !isOutOfStock && stock <= threshold;

                        return (
                          <div className="flex flex-col items-center">
                            <span className="font-bold text-slate-800 text-xs">
                              {stock.toLocaleString('vi-VN')} {p.unit?.name || ''}
                            </span>
                            <span
                              className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold mt-0.5 ${
                                isOutOfStock
                                  ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                  : isLowStock
                                  ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                  : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              }`}
                            >
                              {isOutOfStock ? 'Hết hàng' : isLowStock ? 'Sắp hết' : 'Đủ hàng'}
                            </span>
                          </div>
                        );
                      })()}
                    </td>

                    {/* Actions */}
                    <td
                      className="py-3.5 px-5 text-right whitespace-nowrap"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="inline-flex items-center justify-end gap-1">
                        <button
                          onClick={() => setActiveDrawerProduct(p)}
                          className="p-1.5 text-slate-400 hover:text-brand-primary hover:bg-brand-light rounded-lg transition-colors cursor-pointer"
                          title="Xem chi tiết"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        {isManagerOrAdmin && (
                          <button
                            onClick={() => openEditModal(p)}
                            className="p-1.5 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                            title="Chỉnh sửa sản phẩm"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                        )}

                        {isAdmin && (
                          <button
                            onClick={() => setDeleteTarget(p)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                            title="Xóa sản phẩm"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}

        {/* Pagination Bar */}
        <div className="px-6 py-3.5 border-t border-slate-200 bg-slate-50/60 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <div className="flex items-center gap-4">
            <span>
              Hiển thị <span className="font-semibold text-slate-800">{paginatedProducts.length}</span> / {totalItems} sản phẩm
            </span>
            <div className="flex items-center gap-1.5">
              <span>Mỗi trang:</span>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setPage(1);
                }}
                className="px-2 py-1 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 cursor-pointer focus:outline-none"
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-500 font-medium">
              Trang {currentPage} / {totalPages}
            </span>
            <div className="flex items-center gap-1">
              <button
                disabled={currentPage <= 1}
                onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                className="p-1.5 border border-slate-200 bg-white rounded-lg hover:bg-slate-50 text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                title="Trang trước"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                disabled={currentPage >= totalPages}
                onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
                className="p-1.5 border border-slate-200 bg-white rounded-lg hover:bg-slate-50 text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                title="Trang tiếp"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* SLIDE-OVER DRAWER: Quick Detail View */}
      {activeDrawerProduct && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Backdrop */}
          <div
            onClick={() => setActiveDrawerProduct(null)}
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
          />

          <div className="fixed inset-y-0 right-0 pl-10 max-w-full flex">
            <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col border-l border-slate-200 animate-in slide-in-from-right duration-250">
              {/* Drawer Header */}
              <div className="p-6 border-b border-slate-100 flex items-start justify-between bg-slate-50/50">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-brand-light text-brand-primary border border-brand-primary/10">
                      {activeDrawerProduct.sku}
                    </span>
                    {activeDrawerProduct.barcode && (
                      <span className="font-mono text-[11px] text-slate-400">
                        {activeDrawerProduct.barcode}
                      </span>
                    )}
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mt-2">
                    {activeDrawerProduct.name}
                  </h3>
                </div>
                <button
                  onClick={() => setActiveDrawerProduct(null)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Drawer Body */}
              <div className="flex-1 p-6 space-y-6 overflow-y-auto text-xs">
                {/* Financial Summary Card */}
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-3">
                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Thông tin định giá & tỷ suất
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-slate-400 text-[11px]">Giá vốn nhập</div>
                      <div className="text-sm font-bold text-slate-700 mt-0.5">
                        {formatVND(activeDrawerProduct.cost_price)}
                      </div>
                    </div>
                    <div>
                      <div className="text-slate-400 text-[11px]">Giá bán niêm yết</div>
                      <div className="text-sm font-bold text-slate-900 mt-0.5">
                        {formatVND(activeDrawerProduct.selling_price)}
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
                    <span className="text-slate-500 font-medium">Lợi nhuận gộp ước tính:</span>
                    <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 text-xs">
                      {formatVND(
                        Number(activeDrawerProduct.selling_price || 0) -
                          Number(activeDrawerProduct.cost_price || 0),
                      )}{' '}
                      ({calculateMargin(
                        Number(activeDrawerProduct.cost_price || 0),
                        Number(activeDrawerProduct.selling_price || 0),
                      ) || 0}
                      %)
                    </span>
                  </div>
                </div>

                {/* Categorization Card */}
                <div className="space-y-3">
                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Phân loại & Định mức
                  </div>
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between py-2 border-b border-slate-100">
                      <span className="text-slate-500">Danh mục</span>
                      <span className="font-semibold text-slate-800">
                        {activeDrawerProduct.category?.name || 'Chưa phân loại'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between py-2 border-b border-slate-100">
                      <span className="text-slate-500">Đơn vị đo lường</span>
                      <span>{renderUnitBadge(activeDrawerProduct.unit)}</span>
                    </div>
                    <div className="flex items-center justify-between py-2 border-b border-slate-100">
                      <span className="text-slate-500">Tồn kho toàn hệ thống</span>
                      <span className="font-bold text-slate-900 text-sm">
                        {(activeDrawerProduct.current_stock ?? 0).toLocaleString('vi-VN')} {activeDrawerProduct.unit?.name || ''}
                      </span>
                    </div>
                    <div className="flex items-center justify-between py-2 border-b border-slate-100">
                      <span className="text-slate-500">Ngưỡng cảnh báo sắp hết</span>
                      <span className="font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 text-[11px]">
                        Tồn &lt; {activeDrawerProduct.low_stock_threshold ?? 10}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Mô tả sản phẩm
                  </div>
                  <div className="p-3.5 bg-slate-50 rounded-xl text-slate-700 leading-relaxed border border-slate-100">
                    {activeDrawerProduct.description || (
                      <span className="text-slate-400 italic">Chưa có thông tin mô tả chi tiết</span>
                    )}
                  </div>
                </div>

                {/* Metadata */}
                <div className="text-[11px] text-slate-400 space-y-1 pt-4 border-t border-slate-100">
                  <div>Mã định danh hệ thống (ID): {activeDrawerProduct.id}</div>
                  <div>
                    Ngày tạo:{' '}
                    {new Date(activeDrawerProduct.created_at).toLocaleString('vi-VN')}
                  </div>
                </div>
              </div>

              {/* Drawer Footer */}
              <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between gap-3">
                {isAdmin ? (
                  <button
                    onClick={() => {
                      setDeleteTarget(activeDrawerProduct);
                    }}
                    className="px-4 py-2 text-rose-600 hover:bg-rose-50 rounded-xl font-semibold transition-colors cursor-pointer text-xs flex items-center gap-1.5"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Xóa</span>
                  </button>
                ) : (
                  <div></div>
                )}

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setActiveDrawerProduct(null)}
                    className="px-4 py-2 border border-slate-200 bg-white text-slate-700 rounded-xl font-semibold hover:bg-slate-50 transition-colors cursor-pointer text-xs"
                  >
                    Đóng
                  </button>

                  {isManagerOrAdmin && (
                    <button
                      onClick={() => {
                        openEditModal(activeDrawerProduct);
                      }}
                      className="inline-flex items-center gap-1.5 px-4 py-2 bg-brand-primary text-white rounded-xl font-semibold hover:bg-brand-hover shadow-xs transition-colors cursor-pointer text-xs"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Chỉnh sửa</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CUSTOM CONFIRM MODAL FOR DELETE */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full border border-slate-100 shadow-2xl p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
              <ShieldAlert className="w-6 h-6 stroke-2" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="text-base font-bold text-slate-900">Xác nhận xóa sản phẩm</h3>
              <p className="text-xs text-slate-500">
                Bạn có chắc chắn muốn xóa sản phẩm này khỏi hệ thống kho?
              </p>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-center space-y-1">
              <div className="font-bold text-slate-800 text-xs">{deleteTarget.name}</div>
              <div className="font-mono text-[11px] text-brand-primary">{deleteTarget.sku}</div>
            </div>

            <div className="flex items-center gap-2.5 pt-2">
              <button
                type="button"
                disabled={deleting}
                onClick={() => setDeleteTarget(null)}
                className="flex-1 py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors cursor-pointer disabled:opacity-50"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                disabled={deleting}
                onClick={confirmDeleteProduct}
                className="flex-1 py-2.5 px-4 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                {deleting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>Xác nhận xóa</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CREATE / EDIT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full border border-slate-100 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-brand-primary"></div>
                <h3 className="text-sm font-bold text-slate-900">
                  {editingProduct ? 'Chỉnh sửa thông tin sản phẩm' : 'Thêm mới sản phẩm vào kho'}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="p-6 space-y-4">
              {formError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-100 text-xs text-rose-700 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-rose-500" />
                  <span>{formError}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Mã SKU <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formSku}
                    onChange={(e) => setFormSku(e.target.value)}
                    placeholder="VD: LAPTOP-DELL-5520"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 uppercase focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary focus:bg-white transition-all font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Mã vạch (Barcode)
                  </label>
                  <input
                    type="text"
                    value={formBarcode}
                    onChange={(e) => setFormBarcode(e.target.value)}
                    placeholder="VD: 8935001234567"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary focus:bg-white transition-all font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Tên sản phẩm <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="VD: Laptop Dell Precision 5520 Core i7"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary focus:bg-white transition-all"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Danh mục phân loại
                  </label>
                  <select
                    value={formCategoryId}
                    onChange={(e) => setFormCategoryId(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary focus:bg-white transition-all"
                  >
                    <option value="">— Chọn danh mục —</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Đơn vị đo lường
                  </label>
                  <select
                    value={formUnitId}
                    onChange={(e) => setFormUnitId(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary focus:bg-white transition-all"
                  >
                    <option value="">— Chọn đơn vị —</option>
                    {units.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.name} {u.symbol ? `(${u.symbol})` : ''}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Giá vốn (VNĐ)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="1000"
                    value={formCostPrice}
                    onChange={(e) => setFormCostPrice(e.target.value)}
                    placeholder="0"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary focus:bg-white transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Giá bán niêm yết (VNĐ)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="1000"
                    value={formSellingPrice}
                    onChange={(e) => setFormSellingPrice(e.target.value)}
                    placeholder="0"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary focus:bg-white transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Ngưỡng cảnh báo tồn
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formLowStockThreshold}
                    onChange={(e) => setFormLowStockThreshold(e.target.value)}
                    placeholder="10"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary focus:bg-white transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Mô tả sản phẩm
                </label>
                <textarea
                  rows={2}
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  placeholder="Quy cách đóng gói, thông số kỹ thuật..."
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary focus:bg-white transition-all resize-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-primary text-white text-xs font-semibold rounded-xl hover:bg-brand-hover shadow-xs transition-colors cursor-pointer disabled:opacity-50"
                >
                  {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{editingProduct ? 'Lưu thay đổi' : 'Thêm vào kho'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
