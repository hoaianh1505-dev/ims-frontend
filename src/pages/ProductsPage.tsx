import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
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
  Image as ImageIcon,
  Star,
  Upload,
  Maximize2,
  Download,
  FileDown,
  FileUp,
  Building2,
  MapPin,
} from 'lucide-react';
import { BarcodeRenderer } from '../components/common/BarcodeRenderer';
import { ProductImportExcelModal } from '../components/products/ProductImportExcelModal';
import { generateEAN13Barcode, printBarcodeLabel } from '../utils/barcode.utils';
import { productsService } from '../services/products.service';
import {
  inventoryService,
  ProductInventoryBreakdown,
} from '../services/inventory.service';
import { categoriesService } from '../services/categories.service';
import { unitsService } from '../services/units.service';
import { Product } from '../types/product.types';
import { Category, Unit } from '../types/category.types';
import { useAuthStore } from '../stores/auth.store';
import { showToast } from '../utils/toast.util';
import { formatImageUrl } from '../utils/image.util';

export const ProductsPage: React.FC = () => {
  const { user } = useAuthStore();
  const isManagerOrAdmin = user?.role === 'ADMIN' || user?.role === 'MANAGER';
  const isAdmin = user?.role === 'ADMIN';

  // Data State
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [exportingExcel, setExportingExcel] = useState(false);
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

  // Image Upload & Gallery State
  const [selectedGalleryImageId, setSelectedGalleryImageId] = useState<string | null>(null);
  const [uploadingProductImage, setUploadingProductImage] = useState(false);
  const drawerImageInputRef = useRef<HTMLInputElement>(null);

  // Modal Image State (For Add/Edit Product Modal)
  const [modalImageFile, setModalImageFile] = useState<File | null>(null);
  const [modalImagePreview, setModalImagePreview] = useState<string | null>(null);
  const modalImageInputRef = useRef<HTMLInputElement>(null);

  // Fullscreen Lightbox Preview State
  const [lightboxImageUrl, setLightboxImageUrl] = useState<string | null>(null);
  const [lightboxImageTitle, setLightboxImageTitle] = useState<string>('');

  // Custom Delete Confirm Dialog
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Import Excel Modal & Product Inventory Breakdown State
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [productInventory, setProductInventory] = useState<ProductInventoryBreakdown | null>(null);
  const [loadingProductInventory, setLoadingProductInventory] = useState(false);

  // Load inventory breakdown across warehouses & locations when opening product drawer
  useEffect(() => {
    if (!activeDrawerProduct?.id) {
      setProductInventory(null);
      return;
    }
    let cancelled = false;
    setLoadingProductInventory(true);
    inventoryService
      .getByProduct(activeDrawerProduct.id)
      .then((res) => {
        if (!cancelled) setProductInventory(res);
      })
      .catch(() => {
        if (!cancelled) setProductInventory(null);
      })
      .finally(() => {
        if (!cancelled) setLoadingProductInventory(false);
      });
    return () => {
      cancelled = true;
    };
  }, [activeDrawerProduct?.id]);

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
    setModalImageFile(null);
    setModalImagePreview(null);
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
    setModalImageFile(null);
    const prim = p.images?.find((img) => img.is_primary)?.image_url || p.images?.[0]?.image_url || null;
    setModalImagePreview(prim);
    setIsModalOpen(true);
  };

  const handleExportExcel = async () => {
    setExportingExcel(true);
    try {
      await productsService.exportInventoryExcel();
      showNotify('success', 'Đã xuất file báo cáo tồn kho Excel (.xlsx) thành công');
    } catch {
      showNotify('error', 'Không thể xuất file Excel báo cáo tồn kho');
    } finally {
      setExportingExcel(false);
    }
  };

  // Drawer Image Upload & Actions
  const handleDrawerUploadImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !activeDrawerProduct) return;

    if (!file.type.startsWith('image/')) {
      showNotify('error', 'Chỉ cho phép upload file định dạng hình ảnh (jpg, png, webp)');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      showNotify('error', 'Kích thước file tối đa 5MB');
      return;
    }

    setUploadingProductImage(true);
    try {
      await productsService.uploadImage(activeDrawerProduct.id, file);
      showNotify('success', 'Đã tải ảnh sản phẩm lên AWS S3 thành công');
      const fresh = await productsService.getOne(activeDrawerProduct.id);
      const updated = fresh?.data || fresh;
      setActiveDrawerProduct(updated);
      setProducts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Không thể upload ảnh sản phẩm';
      showNotify('error', Array.isArray(msg) ? msg[0] : msg);
    } finally {
      setUploadingProductImage(false);
      if (drawerImageInputRef.current) {
        drawerImageInputRef.current.value = '';
      }
    }
  };

  const handleSetPrimaryImage = async (imageId: string) => {
    if (!activeDrawerProduct) return;
    try {
      await productsService.setPrimaryImage(activeDrawerProduct.id, imageId);
      showNotify('success', 'Đã đặt làm ảnh đại diện chính của sản phẩm');
      const fresh = await productsService.getOne(activeDrawerProduct.id);
      const updated = fresh?.data || fresh;
      setActiveDrawerProduct(updated);
      setProducts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Không thể đặt ảnh chính';
      showNotify('error', Array.isArray(msg) ? msg[0] : msg);
    }
  };

  const handleDeleteProductImage = async (imageId: string) => {
    if (!activeDrawerProduct) return;
    try {
      await productsService.deleteImage(activeDrawerProduct.id, imageId);
      showNotify('success', 'Đã xóa ảnh sản phẩm khỏi hệ thống');
      const fresh = await productsService.getOne(activeDrawerProduct.id);
      const updated = fresh?.data || fresh;
      setActiveDrawerProduct(updated);
      if (selectedGalleryImageId === imageId) {
        setSelectedGalleryImageId(null);
      }
      setProducts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Không thể xóa ảnh sản phẩm';
      showNotify('error', Array.isArray(msg) ? msg[0] : msg);
    }
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
        if (modalImageFile) {
          await productsService.uploadImage(editingProduct.id, modalImageFile, true);
        }
        showNotify('success', `Đã cập nhật sản phẩm "${formName}"`);
        if (activeDrawerProduct?.id === editingProduct.id) {
          const fresh = await productsService.getOne(editingProduct.id);
          setActiveDrawerProduct(fresh?.data || fresh);
        }
      } else {
        const created: any = await productsService.create(payload);
        const createdId = created?.data?.id || created?.id;
        if (createdId && modalImageFile) {
          await productsService.uploadImage(createdId, modalImageFile, true);
        }
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
    <div className="products-page min-w-0 flex-1 flex flex-col min-h-0 px-3 sm:px-6 lg:px-8 py-4 max-w-[1560px] w-full mx-auto space-y-3.5">

      {/* PAGE HEADER */}
      <div className="products-page-header shrink-0 flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200 min-h-[52px]">
        <div>
          <h1 className="text-2xl sm:text-[28px] font-bold text-slate-900 tracking-tight">
            Danh mục hàng hóa
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Quản lý toàn bộ danh sách sản phẩm, giá bán, mã vạch và tồn kho thời gian thực
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => fetchProducts()}
            className="p-2.5 text-slate-600 hover:text-slate-900 bg-white border border-slate-300 rounded-sm hover:bg-slate-50 transition-colors cursor-pointer"
            title="Làm mới dữ liệu từ server"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-slate-700' : ''}`} />
          </button>

          {isManagerOrAdmin && (
            <>
              <button
                onClick={() => setIsImportModalOpen(true)}
                className="inline-flex items-center gap-2 px-2.5 sm:px-3.5 py-2.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-sm text-sm font-semibold transition-colors cursor-pointer"
                title="Nhập hàng loạt sản phẩm từ file Excel (.xlsx)"
              >
                <FileUp className="w-4 h-4 text-[#527565]" />
                <span>Nhập Excel</span>
              </button>

              <button
                onClick={handleExportExcel}
                disabled={exportingExcel}
                className="inline-flex items-center gap-2 px-2.5 sm:px-3.5 py-2.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-sm text-sm font-semibold transition-colors cursor-pointer disabled:opacity-50"
                title="Xuất danh sách tồn kho ra file Excel (.xlsx)"
              >
                <FileDown className="w-4 h-4 text-[#527565]" />
                <span>{exportingExcel ? 'Đang xuất...' : 'Xuất Excel'}</span>
              </button>

              <button
                onClick={openCreateModal}
                className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 bg-[#294238] hover:bg-[#20372e] text-white rounded-sm text-xs sm:text-sm font-semibold transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
                <span>Thêm sản phẩm</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* TOOLBAR: SEARCH & FILTERS */}
      <div className="products-toolbar shrink-0 bg-white p-3 sm:p-3.5 border border-slate-200 flex flex-col sm:flex-row sm:flex-wrap sm:items-center sm:justify-between gap-3 min-h-[58px]">
        {/* Left: Search input */}
        <div className="relative w-full flex-1 min-w-0 sm:min-w-[240px] max-w-sm">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Tìm tên, SKU, barcode..."
            className="w-full pl-9 sm:pl-10 pr-8 py-2 bg-slate-50 border border-slate-300 rounded-sm text-xs sm:text-sm text-slate-800 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#527565]/20 focus:border-[#527565] focus:bg-white transition-all"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Middle: Clean Filter Tabs */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-sm text-xs font-medium text-slate-600 overflow-x-auto no-scrollbar max-w-full w-full sm:w-auto">
          <button
            onClick={() => {
              setStockStatusFilter('all');
              setPage(1);
            }}
            className={`px-3 py-1.5 rounded-lg transition-all duration-150 active:scale-95 cursor-pointer ${
              stockStatusFilter === 'all'
                ? 'bg-white text-[#294238] shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Tất cả
          </button>
          <button
            onClick={() => {
              setStockStatusFilter('in_stock');
              setPage(1);
            }}
            className={`px-3 py-1.5 rounded-lg transition-all duration-150 active:scale-95 cursor-pointer ${
              stockStatusFilter === 'in_stock'
                ? 'bg-white text-[#294238] shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Đủ hàng
          </button>
          <button
            onClick={() => {
              setStockStatusFilter('low_stock');
              setPage(1);
            }}
            className={`px-3 py-1.5 rounded-lg transition-all duration-150 active:scale-95 cursor-pointer ${
              stockStatusFilter === 'low_stock'
                ? 'bg-white text-amber-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Sắp hết
          </button>
          <button
            onClick={() => {
              setStockStatusFilter('out_of_stock');
              setPage(1);
            }}
            className={`px-3 py-1.5 rounded-lg transition-all duration-150 active:scale-95 cursor-pointer ${
              stockStatusFilter === 'out_of_stock'
                ? 'bg-white text-rose-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Hết hàng
          </button>
        </div>

        {/* Right: Dropdowns */}
        <div className="grid w-full grid-cols-2 gap-2 sm:flex sm:w-auto sm:items-center sm:gap-2">
          {/* Category Dropdown */}
          <div className="relative min-w-0">
            <Filter className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <select
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setPage(1);
              }}
              className="w-full min-w-0 pl-8 pr-2 sm:pr-4 py-2 bg-slate-50 border border-slate-300 rounded-sm text-xs sm:text-sm font-medium text-slate-700 focus:outline-none focus:border-[#527565] transition-all cursor-pointer"
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
            className="w-full min-w-0 px-2 sm:px-3 py-2 bg-slate-50 border border-slate-300 rounded-sm text-xs sm:text-sm font-medium text-slate-700 focus:outline-none focus:border-[#527565] transition-all cursor-pointer"
          >
            <option value="">Tất cả đơn vị</option>
            {units.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name}
              </option>
            ))}
          </select>

          {/* Sort Dropdown */}
          <div className="relative col-span-2 min-w-0 sm:col-span-1">
            <SlidersHorizontal className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full min-w-0 pl-8 pr-2 sm:pr-4 py-2 bg-slate-50 border border-slate-300 rounded-sm text-xs sm:text-sm font-medium text-slate-700 focus:outline-none focus:border-[#527565] transition-all cursor-pointer"
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

      {/* ENLARGED DATA TABLE */}
      <div className="products-table-shell flex-1 min-h-[480px] bg-white border border-slate-200 flex flex-col overflow-hidden">
        <div className="products-table-scroll flex-1 min-h-0 min-w-0 overflow-auto">
          {loading && products.length === 0 ? (
            <div className="py-24 flex flex-col items-center justify-center gap-3 text-slate-400 h-full">
              <Loader2 className="w-7 h-7 animate-spin text-slate-600" />
              <span className="text-sm font-medium">Đang tải dữ liệu sản phẩm...</span>
            </div>
          ) : paginatedProducts.length === 0 ? (
            <div className="py-20 text-center text-slate-400 space-y-3 h-full flex flex-col items-center justify-center">
              <Package className="w-12 h-12 mx-auto text-slate-300 stroke-1" />
              <div className="text-base font-bold text-slate-800">Không tìm thấy sản phẩm nào</div>
              <p className="text-sm text-slate-500 max-w-sm mx-auto">
                Không có sản phẩm nào khớp với điều kiện lọc hiện tại.
              </p>
            </div>
          ) : (
            <>
              {/* DESKTOP TABLE VIEW (Màn hình máy tính) */}
              <div className="hidden md:block">
                <table className="products-table w-full min-w-[680px] text-left border-collapse text-sm">
                  <thead>
                    <tr className="sticky top-0 bg-slate-50 z-10 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-xs select-none shadow-2xs">
                      <th className="py-3 px-2 lg:px-4">Sản phẩm / Quy cách</th>
                      <th className="py-3 px-2 lg:px-4 w-32 lg:w-36">Danh mục</th>
                      <th className="py-3 px-2 lg:px-4 w-36 lg:w-40 text-right">Giá bán niêm yết</th>
                      <th className="py-3 px-2 lg:px-4 w-32 lg:w-36 text-center">Tồn kho khả dụng</th>
                      <th className="py-3 px-2 lg:px-4 w-20 lg:w-24 text-right whitespace-nowrap">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody key={`${currentPage}-${selectedCategory}-${stockStatusFilter}-${sortBy}`} className="divide-y divide-slate-100 text-slate-700 animate-tab-enter">
                    {paginatedProducts.map((p) => {
                      const cost = Number(p.cost_price || 0);
                      const sell = Number(p.selling_price || 0);
                      const stock = p.current_stock ?? 0;
                      const threshold = p.low_stock_threshold ?? 10;
                      const isOutOfStock = stock <= 0;
                      const isLowStock = !isOutOfStock && stock <= threshold;
                      const primaryImg = p.images?.find((img) => img.is_primary)?.image_url || p.images?.[0]?.image_url;

                      return (
                        <tr
                          key={p.id}
                          onClick={() => setActiveDrawerProduct(p)}
                          className="hover:bg-[#f1f5f2] transition-colors group cursor-pointer"
                        >
                          {/* Name, SKU & Unit */}
                          <td className="py-2.5 px-4">
                            <div className="flex items-center gap-3">
                              {primaryImg ? (
                                <img
                                  src={formatImageUrl(primaryImg)}
                                  alt={p.name}
                                  title="Bấm để xem phóng to"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setLightboxImageUrl(formatImageUrl(primaryImg));
                                    setLightboxImageTitle(p.name);
                                  }}
                                  onError={(e) => {
                                    e.currentTarget.style.display = 'none';
                                  }}
                                  className="w-10 h-10 rounded-xl object-cover border border-slate-200/80 shrink-0 bg-slate-50 shadow-2xs hover:scale-105 transition-transform"
                                />
                              ) : (
                                <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200/80 flex items-center justify-center shrink-0 text-slate-400">
                                  <Package className="w-5 h-5 stroke-[1.5]" />
                                </div>
                              )}
                              <div className="min-w-0">
                                <div className="font-medium text-slate-800 group-hover:text-[#35584e] transition-colors line-clamp-1 text-sm leading-snug">
                                  {p.name}
                                </div>
                                <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-400">
                                  <span className="font-mono text-xs text-slate-600 bg-slate-100 border border-slate-200/80 px-1.5 py-0.5 rounded">
                                    {p.sku}
                                  </span>
                                  {p.unit && <span>• {p.unit.name}</span>}
                                  {p.barcode && <span className="font-mono text-xs hidden sm:inline">• {p.barcode}</span>}
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* Category */}
                          <td className="py-2.5 px-4 text-slate-600">
                            <span className="line-clamp-1 text-sm">
                              {p.category?.name || '—'}
                            </span>
                          </td>

                          {/* Selling Price & Cost */}
                          <td className="py-2.5 px-4 text-right whitespace-nowrap">
                            <div className="font-medium text-slate-800 text-sm font-mono">
                              {formatVND(sell)}
                            </div>
                            <div className="text-xs text-slate-400 mt-0.5">
                              Vốn: {formatVND(cost)}
                            </div>
                          </td>

                          {/* Stock Quantity & Status */}
                          <td className="py-2.5 px-4 text-center whitespace-nowrap">
                            <div className="font-medium text-slate-800 text-sm font-mono">
                              {stock.toLocaleString('vi-VN')} {p.unit?.name || ''}
                            </div>
                            <div className="mt-1">
                              {isOutOfStock ? (
                                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium bg-rose-50 text-rose-700 border border-rose-200">
                                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                                  Hết hàng
                                </span>
                              ) : isLowStock ? (
                                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-800 border border-amber-200">
                                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                                  Sắp hết
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                  Đủ hàng
                                </span>
                              )}
                            </div>
                          </td>

                          {/* Actions */}
                          <td
                            className="py-2.5 px-2 text-right whitespace-nowrap"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <div className="inline-flex items-center justify-end gap-0">
                              <button
                                onClick={() => setActiveDrawerProduct(p)}
                                className="p-0.5 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                                title="Xem chi tiết"
                              >
                                <Eye className="w-4 h-4" />
                              </button>

                              {isManagerOrAdmin && (
                                <button
                                  onClick={() => openEditModal(p)}
                                  className="p-0.5 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                                  title="Chỉnh sửa sản phẩm"
                                >
                                  <Edit3 className="w-4 h-4" />
                                </button>
                              )}

                              {isAdmin && (
                                <button
                                  onClick={() => setDeleteTarget(p)}
                                  className="p-0.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
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
              </div>

              {/* MOBILE CARD VIEW (Dành riêng cho điện thoại - Tinh gọn, rõ ràng, 0% tràn viền) */}
              <div className="products-mobile-list md:hidden divide-y divide-slate-200 animate-tab-enter">
                {paginatedProducts.map((p) => {
                  const sell = Number(p.selling_price || 0);
                  const stock = p.current_stock ?? 0;
                  const threshold = p.low_stock_threshold ?? 10;
                  const isOutOfStock = stock <= 0;
                  const isLowStock = !isOutOfStock && stock <= threshold;
                  const primaryImg = p.images?.find((img) => img.is_primary)?.image_url || p.images?.[0]?.image_url;

                  return (
                    <div
                      key={`mobile-${p.id}`}
                      onClick={() => setActiveDrawerProduct(p)}
                      className="products-mobile-row p-3 sm:p-4 hover:bg-slate-50/80 transition-colors flex items-center gap-3 cursor-pointer"
                    >
                      {/* Thumbnail */}
                      {primaryImg ? (
                        <img
                          src={formatImageUrl(primaryImg)}
                          alt={p.name}
                          className="w-12 h-12 rounded-xl object-cover border border-slate-200 shrink-0 bg-slate-50 shadow-2xs"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0 text-slate-400">
                          <Package className="w-6 h-6 stroke-[1.5]" />
                        </div>
                      )}

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-mono text-[11px] font-bold text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                            {p.sku}
                          </span>
                          <span className="font-mono font-bold text-slate-900 text-sm">
                            {formatVND(sell)}
                          </span>
                        </div>

                        <div className="font-semibold text-slate-800 text-sm truncate mt-1">
                          {p.name}
                        </div>

                        <div className="flex items-center justify-between text-xs mt-1.5">
                          <span className="text-slate-400 truncate max-w-[130px]">
                            {p.category?.name || 'Chưa phân loại'}
                          </span>
                          <div>
                            {isOutOfStock ? (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-700 border border-rose-200">
                                Hết hàng (0)
                              </span>
                            ) : isLowStock ? (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                                Sắp hết ({stock})
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                                Tồn: {stock} {p.unit?.name || ''}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>

        {/* Compact Pagination Bar */}
        <div className="products-pagination px-3 sm:px-5 py-2.5 border-t border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-600">
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
                className="p-1 border border-slate-200 bg-white rounded-md hover:bg-slate-50 text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                title="Trang trước"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <button
                disabled={currentPage >= totalPages}
                onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
                className="p-1 border border-slate-200 bg-white rounded-md hover:bg-slate-50 text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
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

          <div className="fixed inset-y-0 right-0 pl-0 sm:pl-10 max-w-full flex">
            <div className="w-screen max-w-full sm:max-w-2xl lg:max-w-3xl bg-white shadow-2xl flex flex-col border-l border-slate-200 animate-in slide-in-from-right duration-250">
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
                {/* Product Image Gallery Section */}
                {(() => {
                  const images = activeDrawerProduct.images || [];
                  const activeImg =
                    images.find((i) => i.id === selectedGalleryImageId) ||
                    images.find((i) => i.is_primary) ||
                    images[0];

                  return (
                    <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200/90 space-y-3.5">
                      <div className="flex items-center justify-between">
                        <div className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                          <ImageIcon className="w-3.5 h-3.5 text-slate-400" />
                          <span>Thư viện ảnh sản phẩm ({images.length})</span>
                        </div>
                        {isManagerOrAdmin && (
                          <div>
                            <input
                              type="file"
                              ref={drawerImageInputRef}
                              accept="image/png,image/jpeg,image/webp,image/jpg"
                              onChange={handleDrawerUploadImage}
                              className="hidden"
                            />
                            <button
                              type="button"
                              disabled={uploadingProductImage}
                              onClick={() => drawerImageInputRef.current?.click()}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 rounded-xl transition-colors cursor-pointer border border-slate-200 shadow-2xs disabled:opacity-50"
                            >
                              {uploadingProductImage ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin text-[#294238]" />
                              ) : (
                                <Upload className="w-3.5 h-3.5 text-slate-600" />
                              )}
                              <span>{uploadingProductImage ? 'Đang tải lên...' : 'Thêm ảnh mới'}</span>
                            </button>
                          </div>
                        )}
                      </div>

                      {activeImg ? (
                        <div className="space-y-3">
                          {/* Active Large View */}
                          <div
                            onClick={() => {
                              setLightboxImageUrl(formatImageUrl(activeImg.image_url));
                              setLightboxImageTitle(activeDrawerProduct.name);
                            }}
                            className="relative rounded-2xl overflow-hidden border border-slate-200 bg-white flex items-center justify-center max-h-72 aspect-video group cursor-zoom-in"
                          >
                            <img
                              src={formatImageUrl(activeImg.image_url)}
                              alt={activeDrawerProduct.name}
                              className="max-h-72 w-full object-contain p-2 group-hover:scale-[1.02] transition-transform duration-200"
                            />
                            {/* Hover zoom pill */}
                            <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900/70 text-white text-xs px-2.5 py-1 rounded-lg backdrop-blur-xs flex items-center gap-1.5 pointer-events-none">
                              <Maximize2 className="w-3.5 h-3.5" />
                              <span>Phóng to</span>
                            </div>
                            {/* Badges & Actions Overlay */}
                            <div className="absolute top-3 left-3 flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                              {activeImg.is_primary ? (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-500 text-white shadow-xs">
                                  <Star className="w-3 h-3 fill-white" />
                                  <span>Ảnh đại diện chính</span>
                                </span>
                              ) : isManagerOrAdmin ? (
                                <button
                                  type="button"
                                  onClick={() => handleSetPrimaryImage(activeImg.id)}
                                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-white/90 hover:bg-white text-slate-700 shadow-xs backdrop-blur-xs border border-slate-200 transition-all cursor-pointer"
                                >
                                  <Star className="w-3 h-3 text-amber-500" />
                                  <span>Đặt làm ảnh chính</span>
                                </button>
                              ) : null}
                            </div>

                            {isManagerOrAdmin && (
                              <div className="absolute top-3 right-3" onClick={(e) => e.stopPropagation()}>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteProductImage(activeImg.id)}
                                  className="p-1.5 rounded-lg bg-white/90 hover:bg-rose-50 text-slate-500 hover:text-rose-600 shadow-xs backdrop-blur-xs border border-slate-200 transition-all cursor-pointer"
                                  title="Xóa ảnh này"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            )}
                          </div>

                          {/* Thumbnails Strip */}
                          {images.length > 1 && (
                            <div className="flex items-center gap-2 overflow-x-auto pb-1 custom-scrollbar">
                              {images.map((img) => {
                                const isSelected = img.id === activeImg.id;
                                return (
                                  <button
                                    key={img.id}
                                    type="button"
                                    onClick={() => setSelectedGalleryImageId(img.id)}
                                    className={`relative w-16 h-16 rounded-xl overflow-hidden border-2 shrink-0 transition-all cursor-pointer bg-white ${
                                      isSelected
                                        ? 'border-[#294238] ring-2 ring-[#294238]/20'
                                        : 'border-slate-200 hover:border-slate-400'
                                    }`}
                                  >
                                    <img
                                      src={formatImageUrl(img.image_url)}
                                      alt=""
                                      className="w-full h-full object-cover"
                                    />
                                    {img.is_primary && (
                                      <div className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-amber-500 ring-1 ring-white" />
                                    )}
                                  </button>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="py-8 text-center bg-white rounded-2xl border border-dashed border-slate-200 space-y-2">
                          <ImageIcon className="w-8 h-8 mx-auto text-slate-300 stroke-1" />
                          <div className="text-xs font-semibold text-slate-600">
                            Chưa có hình ảnh nào cho sản phẩm này
                          </div>
                          {isManagerOrAdmin && (
                            <button
                              type="button"
                              onClick={() => drawerImageInputRef.current?.click()}
                              className="text-xs font-bold text-[#294238] hover:underline cursor-pointer"
                            >
                              Bấm vào đây để tải ảnh đầu tiên lên AWS S3
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })()}

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

                  {/* Per-warehouse & location breakdown */}
                  <div className="pt-3 mt-2 border-t border-slate-200/80 space-y-2">
                    <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5 text-slate-400" />
                      <span>Phân bổ theo kho &amp; vị trí kệ</span>
                    </div>
                    {loadingProductInventory ? (
                      <div className="flex items-center gap-2 text-xs text-slate-400 py-2">
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Đang tải phân bổ tồn kho...</span>
                      </div>
                    ) : !productInventory || productInventory.warehouses.length === 0 ? (
                      <div className="text-xs text-slate-400 italic py-1">
                        Chưa có bản ghi tồn kho tại kho nào.
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {productInventory.warehouses.map((wh) => (
                          <div
                            key={wh.warehouse.id}
                            className="bg-white rounded-xl border border-slate-200/80 p-3 space-y-2"
                          >
                            <div className="flex items-center justify-between gap-2">
                              <div className="flex items-center gap-2 min-w-0">
                                <span className="font-mono text-[11px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                                  {wh.warehouse.code}
                                </span>
                                <span className="font-bold text-slate-800 text-xs truncate">
                                  {wh.warehouse.name}
                                </span>
                              </div>
                              <span className="font-mono font-black text-slate-900 text-xs shrink-0">
                                {wh.total_in_warehouse.toLocaleString('vi-VN')}{' '}
                                {activeDrawerProduct.unit?.name || ''}
                              </span>
                            </div>
                            {wh.locations.length > 0 && (
                              <div className="flex flex-wrap gap-1.5 pt-1 border-t border-slate-100">
                                {wh.locations.map((loc, idx) => (
                                  <span
                                    key={loc.location?.id || `default-${idx}`}
                                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-50 border border-slate-200 text-[11px] text-slate-600"
                                  >
                                    <MapPin className="w-3 h-3 text-slate-400" />
                                    <span className="font-medium">
                                      {loc.location ? `${loc.location.code} (${loc.location.name})` : 'Khu vực chung'}:
                                    </span>
                                    <strong className="font-mono text-slate-900">
                                      {loc.quantity.toLocaleString('vi-VN')}
                                    </strong>
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
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
                      <div className="text-xl sm:text-2xl font-black text-[#294238] mt-1 font-mono">
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
                      className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#294238] hover:bg-[#20372e] text-white rounded-xl font-bold shadow-xs transition-colors cursor-pointer text-sm"
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

      {/* IMPORT PRODUCTS EXCEL MODAL */}
      <ProductImportExcelModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onSuccess={fetchProducts}
      />

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

      {/* FULLSCREEN LIGHTBOX PREVIEW MODAL */}
      {lightboxImageUrl && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-sm flex flex-col items-center justify-center p-4 sm:p-6 animate-in fade-in duration-150"
          onClick={() => setLightboxImageUrl(null)}
        >
          {/* Header Bar */}
          <div
            className="w-full max-w-4xl flex items-center justify-between pb-3 text-white"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-2 min-w-0">
              <ImageIcon className="w-4 h-4 text-slate-400 shrink-0" />
              <span className="font-semibold text-sm truncate">
                {lightboxImageTitle || 'Xem trước hình ảnh'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <a
                href={lightboxImageUrl}
                target="_blank"
                rel="noreferrer"
                download
                className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
                title="Tải ảnh về máy"
              >
                <Download className="w-4 h-4" />
              </a>
              <button
                onClick={() => setLightboxImageUrl(null)}
                className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
                title="Đóng (ESC)"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Image Display */}
          <div
            className="relative max-w-4xl max-h-[80vh] flex items-center justify-center overflow-hidden rounded-2xl bg-black/40 border border-white/10 shadow-2xl p-2"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={lightboxImageUrl}
              alt={lightboxImageTitle}
              className="max-h-[75vh] max-w-full object-contain rounded-xl select-none"
            />
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

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Hình ảnh đại diện sản phẩm
                </label>
                <div className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-200/80 rounded-2xl">
                  {modalImagePreview ? (
                    <div
                      onClick={() => {
                        setLightboxImageUrl(formatImageUrl(modalImagePreview));
                        setLightboxImageTitle(formName || 'Ảnh xem trước sản phẩm');
                      }}
                      className="relative group w-16 h-16 rounded-xl border border-slate-200 overflow-hidden shrink-0 bg-white shadow-2xs cursor-zoom-in"
                    >
                      <img
                        src={formatImageUrl(modalImagePreview)}
                        alt="Preview"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setModalImageFile(null);
                          setModalImagePreview(null);
                          if (modalImageInputRef.current) modalImageInputRef.current.value = '';
                        }}
                        className="absolute inset-0 bg-rose-900/70 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                        title="Hủy chọn ảnh"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="w-14 h-14 rounded-xl bg-white border border-dashed border-slate-300 flex items-center justify-center text-slate-400 shrink-0">
                      <ImageIcon className="w-6 h-6 stroke-1" />
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <input
                      type="file"
                      ref={modalImageInputRef}
                      accept="image/png,image/jpeg,image/webp,image/jpg"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        if (!file.type.startsWith('image/')) {
                          showNotify('error', 'Chỉ cho phép chọn file hình ảnh (jpg, png, webp)');
                          return;
                        }
                        if (file.size > 5 * 1024 * 1024) {
                          showNotify('error', 'Kích thước file ảnh tối đa 5MB');
                          return;
                        }
                        setModalImageFile(file);
                        setModalImagePreview(URL.createObjectURL(file));
                      }}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => modalImageInputRef.current?.click()}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-100 rounded-xl text-xs font-semibold text-slate-700 shadow-2xs transition-colors cursor-pointer"
                    >
                      <Upload className="w-3.5 h-3.5 text-slate-500" />
                      <span>{modalImagePreview ? 'Đổi ảnh khác' : 'Chọn ảnh từ thiết bị'}</span>
                    </button>
                    <div className="text-[11px] text-slate-400 mt-1">
                      Ảnh tải lên sẽ được tự động đồng bộ và lưu trữ an toàn trên AWS S3.
                    </div>
                  </div>
                </div>
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

      {/* FULLSCREEN LIGHTBOX PREVIEW MODAL */}
      {lightboxImageUrl && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-sm flex flex-col items-center justify-center p-4 sm:p-6 animate-in fade-in duration-150"
          onClick={() => setLightboxImageUrl(null)}
        >
          {/* Header Bar */}
          <div
            className="w-full max-w-4xl flex items-center justify-between pb-3 text-white"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-2 min-w-0">
              <ImageIcon className="w-4 h-4 text-slate-400 shrink-0" />
              <span className="font-semibold text-sm truncate">
                {lightboxImageTitle || 'Xem trước hình ảnh'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <a
                href={lightboxImageUrl}
                target="_blank"
                rel="noreferrer"
                download
                className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
                title="Tải ảnh về máy"
              >
                <Download className="w-4 h-4" />
              </a>
              <button
                onClick={() => setLightboxImageUrl(null)}
                className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
                title="Đóng (ESC)"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Image Display */}
          <div
            className="relative max-w-4xl max-h-[80vh] flex items-center justify-center overflow-hidden rounded-2xl bg-black/40 border border-white/10 shadow-2xl p-2"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={lightboxImageUrl}
              alt={lightboxImageTitle}
              className="max-h-[75vh] max-w-full object-contain rounded-xl select-none"
            />
          </div>
        </div>
      )}
    </div>
  );
};
