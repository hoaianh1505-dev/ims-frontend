import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Package,
  Search,
  Plus,
  Filter,
  Edit3,
  Trash2,
  AlertTriangle,
  X,
  Loader2,
  RefreshCw,
  Eye,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
  ShieldAlert,
  Sparkles,
  Printer,
} from 'lucide-react';
import { BarcodeRenderer } from '../components/common/BarcodeRenderer';
import { generateEAN13Barcode, printBarcodeLabel } from '../utils/barcode.utils';
import { productsService } from '../services/products.service';
import { categoriesService } from '../services/categories.service';
import { unitsService } from '../services/units.service';
import { Product } from '../types/product.types';
import { Category, Unit } from '../types/category.types';
import { useAuthStore } from '../stores/auth.store';
import { showToast } from '../utils/toast.util';

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
  const [stockStatusFilter, setStockStatusFilter] = useState<'all' | 'in_stock' | 'low_stock' | 'out_of_stock'>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'name' | 'price_desc' | 'price_asc' | 'stock_desc'>('newest');

  // Pagination State - defaults to 15 to show full list on screen
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);

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

  const showNotify = (type: 'success' | 'error', message: string) => {
    if (type === 'success') {
      showToast.success(message);
    } else {
      showToast.error(message);
    }
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
      showNotify('error', 'Không thể kết nối cơ sở dữ liệu');
    } finally {
      setLoading(false);
    }
  }, [search, selectedCategory, selectedUnit]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Filter & Sort Products
  const filteredAndSortedProducts = useMemo(() => {
    let list = [...products];

    // Status filter
    if (stockStatusFilter === 'in_stock') {
      list = list.filter((p) => (p.current_stock ?? 0) > (p.low_stock_threshold ?? 10));
    } else if (stockStatusFilter === 'low_stock') {
      list = list.filter((p) => {
        const s = p.current_stock ?? 0;
        return s > 0 && s <= (p.low_stock_threshold ?? 10);
      });
    } else if (stockStatusFilter === 'out_of_stock') {
      list = list.filter((p) => (p.current_stock ?? 0) <= 0);
    }

    // Sort
    if (sortBy === 'price_desc') {
      list.sort((a, b) => Number(b.selling_price || 0) - Number(a.selling_price || 0));
    } else if (sortBy === 'price_asc') {
      list.sort((a, b) => Number(a.selling_price || 0) - Number(b.selling_price || 0));
    } else if (sortBy === 'stock_desc') {
      list.sort((a, b) => Number(b.current_stock || 0) - Number(a.current_stock || 0));
    } else if (sortBy === 'name') {
      list.sort((a, b) => a.name.localeCompare(b.name, 'vi'));
    } else {
      list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }

    return list;
  }, [products, stockStatusFilter, sortBy]);

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
        showNotify('success', `Đã cập nhật sản phẩm "${formName}"`);
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

  return (
    <div className="px-6 py-4 max-w-[1440px] mx-auto space-y-3">

      {/* SIMPLE CLEAN HEADER */}
      <div className="flex items-center justify-between gap-3 pb-2 border-b border-slate-100">
        <h1 className="text-xl font-bold text-slate-900 tracking-tight">
          Danh mục hàng hóa
        </h1>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => fetchProducts()}
            className="p-2 text-slate-500 hover:text-slate-800 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer"
            title="Làm mới dữ liệu từ server"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-slate-700' : ''}`} />
          </button>

          {isManagerOrAdmin && (
            <button
              onClick={openCreateModal}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-brand-primary text-white rounded-lg text-xs font-semibold hover:bg-brand-hover shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Thêm sản phẩm</span>
            </button>
          )}
        </div>
      </div>

      {/* SINGLE-LINE MINIMALIST TOOLBAR */}
      <div className="bg-white px-3 py-2 rounded-xl border border-slate-200/90 shadow-2xs flex flex-wrap items-center justify-between gap-2.5">
        {/* Left: Search input */}
        <div className="relative flex-1 min-w-[220px] max-w-xs">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Tìm theo tên, SKU, barcode..."
            className="w-full pl-8 pr-7 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400 focus:border-slate-400 focus:bg-white transition-all"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>

        {/* Middle: Clean Monochrome Filter Tabs */}
        <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg text-[11px] font-medium text-slate-600">
          <button
            onClick={() => {
              setStockStatusFilter('all');
              setPage(1);
            }}
            className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
              stockStatusFilter === 'all'
                ? 'bg-white text-slate-900 font-semibold shadow-xs'
                : 'hover:text-slate-900'
            }`}
          >
            Tất cả
          </button>
          <button
            onClick={() => {
              setStockStatusFilter('in_stock');
              setPage(1);
            }}
            className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
              stockStatusFilter === 'in_stock'
                ? 'bg-white text-slate-900 font-semibold shadow-xs'
                : 'hover:text-slate-900'
            }`}
          >
            Đủ hàng
          </button>
          <button
            onClick={() => {
              setStockStatusFilter('low_stock');
              setPage(1);
            }}
            className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
              stockStatusFilter === 'low_stock'
                ? 'bg-white text-amber-700 font-semibold shadow-xs'
                : 'hover:text-slate-900'
            }`}
          >
            Sắp hết
          </button>
          <button
            onClick={() => {
              setStockStatusFilter('out_of_stock');
              setPage(1);
            }}
            className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
              stockStatusFilter === 'out_of_stock'
                ? 'bg-white text-rose-700 font-semibold shadow-xs'
                : 'hover:text-slate-900'
            }`}
          >
            Hết hàng
          </button>
        </div>

        {/* Right: Dropdowns */}
        <div className="flex items-center gap-2">
          {/* Category Dropdown */}
          <div className="relative">
            <Filter className="w-3 h-3 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <select
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setPage(1);
              }}
              className="pl-7 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 focus:outline-none focus:border-slate-400 transition-all cursor-pointer"
            >
              <option value="">Tất cả danh mục</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Unit Dropdown */}
          <select
            value={selectedUnit}
            onChange={(e) => {
              setSelectedUnit(e.target.value);
              setPage(1);
            }}
            className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 focus:outline-none focus:border-slate-400 transition-all cursor-pointer"
          >
            <option value="">Tất cả đơn vị</option>
            {units.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name}
              </option>
            ))}
          </select>

          {/* Sort Dropdown */}
          <div className="relative">
            <SlidersHorizontal className="w-3 h-3 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="pl-7 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 focus:outline-none focus:border-slate-400 transition-all cursor-pointer"
            >
              <option value="newest">Mới nhất</option>
              <option value="stock_desc">Tồn kho nhiều nhất</option>
              <option value="name">Tên A-Z</option>
              <option value="price_desc">Giá cao nhất</option>
              <option value="price_asc">Giá thấp nhất</option>
            </select>
          </div>
        </div>
      </div>

      {/* CLEAN MONOCHROME DATA TABLE */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-2 text-slate-400">
            <Loader2 className="w-6 h-6 animate-spin text-slate-600" />
            <span className="text-xs font-medium">Đang tải dữ liệu...</span>
          </div>
        ) : paginatedProducts.length === 0 ? (
          <div className="py-16 text-center text-slate-400 space-y-2">
            <Package className="w-10 h-10 mx-auto text-slate-300 stroke-1" />
            <div className="text-sm font-semibold text-slate-700">Không tìm thấy sản phẩm nào</div>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Không có sản phẩm nào khớp với điều kiện lọc hiện tại.
            </p>
          </div>
        ) : (
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/70 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[11px] select-none">
                <th className="py-2.5 px-4">Sản phẩm / Quy cách</th>
                <th className="py-2.5 px-3 w-40">Danh mục</th>
                <th className="py-2.5 px-3 w-40 text-right">Giá bán niêm yết</th>
                <th className="py-2.5 px-3 w-36 text-center">Tồn kho khả dụng</th>
                <th className="py-2.5 px-4 w-24 text-right whitespace-nowrap">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {paginatedProducts.map((p) => {
                const cost = Number(p.cost_price || 0);
                const sell = Number(p.selling_price || 0);
                const stock = p.current_stock ?? 0;
                const threshold = p.low_stock_threshold ?? 10;
                const isOutOfStock = stock <= 0;
                const isLowStock = !isOutOfStock && stock <= threshold;

                return (
                  <tr
                    key={p.id}
                    onClick={() => setActiveDrawerProduct(p)}
                    className="hover:bg-slate-50/70 transition-colors group cursor-pointer"
                  >
                    {/* Name, SKU & Unit */}
                    <td className="py-2.5 px-4">
                      <div className="font-semibold text-slate-900 group-hover:text-brand-primary transition-colors line-clamp-1 text-xs">
                        {p.name}
                      </div>
                      <div className="flex items-center gap-1.5 mt-0.5 text-[11px] text-slate-400">
                        <span className="font-mono text-[10px] font-medium text-slate-600 bg-slate-100 px-1 py-0.2 rounded">
                          {p.sku}
                        </span>
                        {p.unit && <span>• {p.unit.name}</span>}
                        {p.barcode && <span className="font-mono text-[10px] hidden sm:inline">• {p.barcode}</span>}
                      </div>
                    </td>

                    {/* Category */}
                    <td className="py-2.5 px-3 text-slate-600">
                      <span className="line-clamp-1 text-xs">
                        {p.category?.name || '—'}
                      </span>
                    </td>

                    {/* Selling Price & Cost */}
                    <td className="py-2.5 px-3 text-right whitespace-nowrap">
                      <div className="font-semibold text-slate-900 text-xs">
                        {formatVND(sell)}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        Vốn: {formatVND(cost)}
                      </div>
                    </td>

                    {/* Stock Quantity & Status */}
                    <td className="py-2.5 px-3 text-center whitespace-nowrap">
                      <div className="font-semibold text-slate-900 text-xs">
                        {stock.toLocaleString('vi-VN')} {p.unit?.name || ''}
                      </div>
                      <div className="text-[10px] font-medium mt-0.5">
                        {isOutOfStock ? (
                          <span className="text-rose-600 flex items-center justify-center gap-1">
                            <span className="w-1 h-1 rounded-full bg-rose-500"></span>
                            Hết hàng
                          </span>
                        ) : isLowStock ? (
                          <span className="text-amber-600 flex items-center justify-center gap-1">
                            <span className="w-1 h-1 rounded-full bg-amber-500"></span>
                            Sắp hết
                          </span>
                        ) : (
                          <span className="text-slate-400">
                            Định mức &gt; {threshold}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Actions */}
                    <td
                      className="py-2.5 px-4 text-right whitespace-nowrap"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="inline-flex items-center justify-end gap-1">
                        <button
                          onClick={() => setActiveDrawerProduct(p)}
                          className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md transition-colors cursor-pointer"
                          title="Xem chi tiết"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>

                        {isManagerOrAdmin && (
                          <button
                            onClick={() => openEditModal(p)}
                            className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md transition-colors cursor-pointer"
                            title="Chỉnh sửa sản phẩm"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                        )}

                        {isAdmin && (
                          <button
                            onClick={() => setDeleteTarget(p)}
                            className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors cursor-pointer"
                            title="Xóa sản phẩm"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
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

        {/* Compact Pagination Bar */}
        <div className="px-5 py-2.5 border-t border-slate-200/80 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500">
          <div className="flex items-center gap-3">
            <span>
              Hiển thị <span className="font-semibold text-slate-800">{paginatedProducts.length}</span> / {totalItems} sản phẩm
            </span>
            <div className="flex items-center gap-1 text-[11px]">
              <span>Mỗi trang:</span>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setPage(1);
                }}
                className="px-1.5 py-0.5 bg-white border border-slate-200 rounded text-[11px] font-medium text-slate-700 cursor-pointer focus:outline-none"
              >
                <option value={15}>15</option>
                <option value={30}>30</option>
                <option value={50}>50</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-500 text-[11px]">
              Trang {currentPage} / {totalPages}
            </span>
            <div className="flex items-center gap-1">
              <button
                disabled={currentPage <= 1}
                onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                className="p-1 border border-slate-200 bg-white rounded-md hover:bg-slate-50 text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                title="Trang trước"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <button
                disabled={currentPage >= totalPages}
                onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
                className="p-1 border border-slate-200 bg-white rounded-md hover:bg-slate-50 text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                title="Trang tiếp"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* SLIDE-OVER DRAWER */}
      {activeDrawerProduct && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div
            onClick={() => setActiveDrawerProduct(null)}
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
          />

          <div className="fixed inset-y-0 right-0 pl-10 max-w-full flex">
            <div className="w-screen max-w-2xl lg:max-w-3xl bg-white shadow-2xl flex flex-col border-l border-slate-200 animate-in slide-in-from-right duration-250">
              {/* Drawer Top Banner */}
              <div className="p-6 sm:p-7 border-b border-slate-200 bg-slate-50/70">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2.5">
                      <span className="font-mono text-xs sm:text-sm font-bold px-3 py-1 rounded-lg bg-slate-200/80 text-slate-800 border border-slate-300">
                        {activeDrawerProduct.sku}
                      </span>
                      {activeDrawerProduct.barcode && (
                        <span className="font-mono text-xs sm:text-sm font-semibold text-slate-500 bg-white px-2.5 py-1 rounded-lg border border-slate-200">
                          {activeDrawerProduct.barcode}
                        </span>
                      )}
                    </div>
                    <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight leading-snug">
                      {activeDrawerProduct.name}
                    </h3>
                  </div>
                  <button
                    onClick={() => setActiveDrawerProduct(null)}
                    className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-xl transition-colors cursor-pointer shrink-0"
                    title="Đóng cửa sổ"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Drawer Body */}
              <div className="flex-1 p-6 sm:p-7 space-y-6 overflow-y-auto text-sm">
                {/* Barcode & Print Section */}
                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200/90 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                      Mã vạch định danh (EAN-13)
                    </div>
                    <button
                      onClick={() => printBarcodeLabel(activeDrawerProduct)}
                      className="inline-flex items-center gap-2 px-3.5 py-1.5 text-xs sm:text-sm font-semibold text-slate-700 bg-white hover:bg-slate-100 rounded-xl transition-colors cursor-pointer border border-slate-200 shadow-2xs"
                      title="In tem mã vạch sản phẩm"
                    >
                      <Printer className="w-4 h-4 text-slate-600" />
                      <span>In tem mã vạch</span>
                    </button>
                  </div>
                  <div className="bg-white p-3 rounded-xl border border-slate-200/60 flex justify-center">
                    <BarcodeRenderer
                      value={activeDrawerProduct.barcode || activeDrawerProduct.sku}
                      height={58}
                    />
                  </div>
                </div>

                {/* Real-time Inventory Card */}
                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200/90 space-y-2">
                  <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Tồn kho toàn hệ thống
                  </div>
                  <div className="flex items-baseline justify-between flex-wrap gap-2 pt-1">
                    <div className="text-3xl sm:text-4xl font-black text-slate-900 font-mono">
                      {(activeDrawerProduct.current_stock ?? 0).toLocaleString('vi-VN')}{' '}
                      <span className="text-base font-bold text-slate-500">
                        {activeDrawerProduct.unit?.name || 'đơn vị'}
                      </span>
                    </div>
                    <span className="text-xs sm:text-sm font-semibold text-amber-700 bg-amber-50 px-3 py-1 rounded-lg border border-amber-200">
                      Ngưỡng báo động: &lt; {activeDrawerProduct.low_stock_threshold ?? 10}
                    </span>
                  </div>
                </div>

                {/* Financial Summary Card */}
                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200/90 space-y-3">
                  <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Thông tin định giá
                  </div>
                  <div className="grid grid-cols-2 gap-4 pt-1">
                    <div className="bg-white p-4 rounded-xl border border-slate-200/80">
                      <div className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Giá vốn nhập</div>
                      <div className="text-lg sm:text-xl font-bold text-slate-700 mt-1 font-mono">
                        {formatVND(activeDrawerProduct.cost_price)}
                      </div>
                    </div>
                    <div className="bg-white p-4 rounded-xl border border-slate-200/80">
                      <div className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Giá bán niêm yết</div>
                      <div className="text-xl sm:text-2xl font-black text-[#EE3D43] mt-1 font-mono">
                        {formatVND(activeDrawerProduct.selling_price)}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Categorization Card */}
                <div className="space-y-3">
                  <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Phân loại & Đơn vị tính
                  </div>
                  <div className="bg-slate-50 rounded-2xl border border-slate-200/90 divide-y divide-slate-100 overflow-hidden">
                    <div className="flex items-center justify-between p-4">
                      <span className="text-slate-500 font-medium">Danh mục hàng</span>
                      <span className="font-bold text-slate-900 text-base">
                        {activeDrawerProduct.category?.name || 'Chưa phân loại'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-4">
                      <span className="text-slate-500 font-medium">Đơn vị đo lường</span>
                      <span className="font-bold text-slate-900 text-base">
                        {activeDrawerProduct.unit?.name || '—'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Mô tả sản phẩm
                  </div>
                  <div className="p-4 bg-slate-50 rounded-2xl text-slate-700 leading-relaxed border border-slate-200/90 text-sm">
                    {activeDrawerProduct.description || (
                      <span className="text-slate-400 italic">Chưa có thông tin mô tả chi tiết cho sản phẩm này.</span>
                    )}
                  </div>
                </div>

                {/* Metadata */}
                <div className="text-xs text-slate-400 space-y-1.5 pt-4 border-t border-slate-200">
                  <div>Mã ID hệ thống: <span className="font-mono text-slate-600 font-medium">{activeDrawerProduct.id}</span></div>
                  <div>
                    Ngày cập nhật:{' '}
                    <span className="text-slate-600 font-medium">{new Date(activeDrawerProduct.updated_at || activeDrawerProduct.created_at).toLocaleString('vi-VN')}</span>
                  </div>
                </div>
              </div>

              {/* Drawer Footer */}
              <div className="p-4 sm:p-5 border-t border-slate-200 bg-slate-50 flex items-center justify-between gap-4">
                {isAdmin ? (
                  <button
                    onClick={() => {
                      setDeleteTarget(activeDrawerProduct);
                    }}
                    className="px-4 py-2.5 text-rose-600 hover:bg-rose-50 rounded-xl font-bold transition-colors cursor-pointer text-sm flex items-center gap-1.5"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Xóa sản phẩm</span>
                  </button>
                ) : (
                  <div></div>
                )}

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setActiveDrawerProduct(null)}
                    className="px-5 py-2.5 border border-slate-300 bg-white text-slate-700 rounded-xl font-bold hover:bg-slate-100 transition-colors cursor-pointer text-sm"
                  >
                    Đóng
                  </button>

                  {isManagerOrAdmin && (
                    <button
                      onClick={() => {
                        openEditModal(activeDrawerProduct);
                      }}
                      className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#EE3D43] hover:bg-[#D9343A] text-white rounded-xl font-bold shadow-xs transition-colors cursor-pointer text-sm"
                    >
                      <Edit3 className="w-4 h-4" />
                      <span>Chỉnh sửa sản phẩm</span>
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
          <div className="bg-white rounded-2xl max-w-sm w-full border border-slate-100 shadow-2xl p-5 space-y-3.5 animate-in fade-in zoom-in-95 duration-150">
            <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
              <ShieldAlert className="w-5 h-5 stroke-2" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="text-sm font-bold text-slate-900">Xác nhận xóa sản phẩm</h3>
              <p className="text-xs text-slate-500">
                Bạn có chắc chắn muốn xóa sản phẩm này khỏi hệ thống kho?
              </p>
            </div>

            <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-center space-y-0.5">
              <div className="font-bold text-slate-800 text-xs">{deleteTarget.name}</div>
              <div className="font-mono text-[11px] text-slate-500">{deleteTarget.sku}</div>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                disabled={deleting}
                onClick={() => setDeleteTarget(null)}
                className="flex-1 py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors cursor-pointer disabled:opacity-50"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                disabled={deleting}
                onClick={confirmDeleteProduct}
                className="flex-1 py-2 px-3 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer flex items-center justify-center gap-1 disabled:opacity-50"
              >
                {deleting && <Loader2 className="w-3 h-3 animate-spin" />}
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
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 uppercase focus:outline-none focus:ring-1 focus:ring-slate-400 focus:border-slate-400 focus:bg-white transition-all font-mono"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-semibold text-slate-700">
                      Mã vạch (Barcode)
                    </label>
                    <button
                      type="button"
                      onClick={() => setFormBarcode(generateEAN13Barcode())}
                      className="inline-flex items-center gap-1 text-[11px] font-medium text-brand-primary hover:text-emerald-700 cursor-pointer transition-colors"
                      title="Tạo mã vạch EAN-13 chuẩn Việt Nam tự động"
                    >
                      <Sparkles className="w-3 h-3 text-amber-500" />
                      <span>Tự sinh mã EAN-13</span>
                    </button>
                  </div>
                  <input
                    type="text"
                    value={formBarcode}
                    onChange={(e) => setFormBarcode(e.target.value)}
                    placeholder="VD: 8935001234567"
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-400 focus:border-slate-400 focus:bg-white transition-all font-mono"
                  />
                  {formBarcode && (
                    <div className="mt-2 p-1.5 bg-slate-50 rounded-lg border border-slate-200/60 flex justify-center">
                      <BarcodeRenderer value={formBarcode} height={36} fontSize={10} />
                    </div>
                  )}
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
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-400 focus:border-slate-400 focus:bg-white transition-all"
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
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-400 focus:border-slate-400 focus:bg-white transition-all"
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
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-400 focus:border-slate-400 focus:bg-white transition-all"
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
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-400 focus:border-slate-400 focus:bg-white transition-all"
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
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-400 focus:border-slate-400 focus:bg-white transition-all"
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
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-400 focus:border-slate-400 focus:bg-white transition-all"
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
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-400 focus:border-slate-400 focus:bg-white transition-all resize-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center gap-2 px-5 py-2 bg-brand-primary text-white text-xs font-semibold rounded-xl hover:bg-brand-hover shadow-xs transition-colors cursor-pointer disabled:opacity-50"
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
