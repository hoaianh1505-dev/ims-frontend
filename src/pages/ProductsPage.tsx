import React, { useState, useEffect, useCallback } from 'react';
import {
  Package,
  Search,
  Plus,
  Filter,
  Layers,
  Edit2,
  Trash2,
  AlertCircle,
  X,
  Loader2,
  CheckCircle2,
  RefreshCw,
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

  // Products state
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedUnit, setSelectedUnit] = useState<string>('');

  // Dropdown options
  const [categories, setCategories] = useState<Category[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);

  // Modal create/edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formSku, setFormSku] = useState('');
  const [formBarcode, setFormBarcode] = useState('');
  const [formName, setFormName] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formCostPrice, setFormCostPrice] = useState<number | string>('');
  const [formPrice, setFormPrice] = useState<number | string>('');
  const [formMinStock, setFormMinStock] = useState<number | string>(0);
  const [formMaxStock, setFormMaxStock] = useState<number | string>(1000);
  const [formCategoryId, setFormCategoryId] = useState('');
  const [formUnitId, setFormUnitId] = useState('');
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Notification
  const [notify, setNotify] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const showNotify = (type: 'success' | 'error', message: string) => {
    setNotify({ type, message });
    setTimeout(() => setNotify(null), 4000);
  };

  // Load Categories & Units for filter dropdowns
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
      showNotify('error', 'Không thể tải danh sách sản phẩm từ máy chủ');
    } finally {
      setLoading(false);
    }
  }, [search, selectedCategory, selectedUnit]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Currency Formatter
  const formatVND = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  // Modal open
  const openCreateModal = () => {
    setEditingProduct(null);
    setFormSku('');
    setFormBarcode('');
    setFormName('');
    setFormDesc('');
    setFormCostPrice('');
    setFormPrice('');
    setFormMinStock(0);
    setFormMaxStock(1000);
    setFormCategoryId(categories[0]?.id || '');
    setFormUnitId(units[0]?.id || '');
    setFormError('');
    setIsModalOpen(true);
  };

  const openEditModal = (p: Product) => {
    setEditingProduct(p);
    setFormSku(p.sku);
    setFormBarcode(p.barcode || '');
    setFormName(p.name);
    setFormDesc(p.description || '');
    setFormCostPrice(p.cost_price);
    setFormPrice(p.price);
    setFormMinStock(p.min_stock);
    setFormMaxStock(p.max_stock);
    setFormCategoryId(p.category_id || p.category?.id || '');
    setFormUnitId(p.unit_id || p.unit?.id || '');
    setFormError('');
    setIsModalOpen(true);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formSku.trim() || !formName.trim()) {
      setFormError('Vui lòng nhập đầy đủ Mã SKU và Tên sản phẩm');
      return;
    }

    setSubmitting(true);
    setFormError('');

    try {
      const payload: Partial<Product> = {
        sku: formSku.trim().toUpperCase(),
        barcode: formBarcode.trim() || undefined,
        name: formName.trim(),
        description: formDesc.trim() || undefined,
        cost_price: Number(formCostPrice) || 0,
        price: Number(formPrice) || 0,
        min_stock: Number(formMinStock) || 0,
        max_stock: Number(formMaxStock) || 1000,
        category_id: formCategoryId || undefined,
        unit_id: formUnitId || undefined,
      };

      if (editingProduct) {
        await productsService.update(editingProduct.id, payload);
        showNotify('success', `Đã cập nhật sản phẩm "${formName}"`);
      } else {
        await productsService.create(payload);
        showNotify('success', `Đã thêm sản phẩm "${formName}" thành công`);
      }

      setIsModalOpen(false);
      fetchProducts();
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Không thể lưu sản phẩm. Vui lòng kiểm tra lại thông tin.';
      setFormError(Array.isArray(msg) ? msg.join(', ') : msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteProduct = async (id: string, name: string) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa sản phẩm "${name}" không?`)) return;
    try {
      await productsService.delete(id);
      showNotify('success', `Đã xóa sản phẩm "${name}"`);
      fetchProducts();
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Không thể xóa sản phẩm này';
      showNotify('error', msg);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      {/* Toast Notification */}
      {notify && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border text-sm font-medium transition-all duration-300 ${
            notify.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : 'bg-rose-50 text-rose-800 border-rose-200'
          }`}
        >
          {notify.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          )}
          <span>{notify.message}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Danh mục sản phẩm</h1>
          <p className="text-sm text-slate-500 mt-1">
            Quản lý mã hàng hóa, giá vốn, giá bán niêm yết và ngưỡng tồn an toàn
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => fetchProducts()}
            className="p-2 text-slate-500 hover:text-slate-800 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer"
            title="Làm mới danh sách"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-brand-primary' : ''}`} />
          </button>

          {isManagerOrAdmin && (
            <button
              onClick={openCreateModal}
              className="inline-flex items-center gap-2 px-4 py-2 bg-brand-primary text-white rounded-xl text-xs font-semibold hover:bg-brand-hover shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Thêm sản phẩm</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
        {/* Search */}
        <div className="sm:col-span-6 relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm theo tên sản phẩm, mã SKU hoặc mã vạch..."
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all"
          />
        </div>

        {/* Category Filter */}
        <div className="sm:col-span-3">
          <div className="relative">
            <Filter className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full pl-9 pr-3 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all cursor-pointer"
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
        <div className="sm:col-span-3">
          <select
            value={selectedUnit}
            onChange={(e) => setSelectedUnit(e.target.value)}
            className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all cursor-pointer"
          >
            <option value="">Tất cả đơn vị tính</option>
            {units.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name} {u.symbol ? `(${u.symbol})` : ''}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        {loading ? (
          <div className="py-24 flex flex-col items-center justify-center gap-3 text-slate-400">
            <Loader2 className="w-7 h-7 animate-spin text-brand-primary" />
            <span className="text-xs font-medium">Đang tải danh sách hàng hóa...</span>
          </div>
        ) : products.length === 0 ? (
          <div className="py-20 text-center text-slate-400 space-y-3">
            <Package className="w-12 h-12 mx-auto text-slate-300 stroke-1" />
            <div className="text-sm font-semibold text-slate-700">Không tìm thấy sản phẩm nào</div>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Không có sản phẩm nào phù hợp với bộ lọc tìm kiếm hoặc kho hàng chưa có dữ liệu.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
                  <th className="py-3.5 px-6">Sản phẩm / SKU</th>
                  <th className="py-3.5 px-6">Danh mục</th>
                  <th className="py-3.5 px-6">Đơn vị</th>
                  <th className="py-3.5 px-6 text-right">Giá vốn</th>
                  <th className="py-3.5 px-6 text-right">Giá bán</th>
                  <th className="py-3.5 px-6 text-center">Định mức kho</th>
                  <th className="py-3.5 px-6 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {products.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-6">
                      <div className="font-bold text-slate-900 line-clamp-1">{p.name}</div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="font-mono text-[11px] font-semibold text-brand-primary bg-brand-light px-1.5 py-0.5 rounded">
                          {p.sku}
                        </span>
                        {p.barcode && (
                          <span className="font-mono text-[10px] text-slate-400">
                            {p.barcode}
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="py-3.5 px-6">
                      {p.category ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200">
                          <Layers className="w-3 h-3 text-slate-400" />
                          <span>{p.category.name}</span>
                        </span>
                      ) : (
                        <span className="text-slate-400 italic">Chưa phân loại</span>
                      )}
                    </td>

                    <td className="py-3.5 px-6">
                      <span className="inline-block px-2 py-0.5 text-[11px] font-medium rounded bg-emerald-50 text-emerald-800 border border-emerald-100">
                        {p.unit?.name || '—'} {p.unit?.symbol ? `(${p.unit.symbol})` : ''}
                      </span>
                    </td>

                    <td className="py-3.5 px-6 text-right font-medium text-slate-500">
                      {formatVND(Number(p.cost_price))}
                    </td>

                    <td className="py-3.5 px-6 text-right font-bold text-slate-900">
                      {formatVND(Number(p.price))}
                    </td>

                    <td className="py-3.5 px-6 text-center text-[11px] text-slate-500">
                      <span className="font-semibold text-slate-700">{p.min_stock}</span>
                      <span className="mx-1 text-slate-300">/</span>
                      <span className="font-semibold text-slate-700">{p.max_stock}</span>
                    </td>

                    <td className="py-3.5 px-6 text-right space-x-1">
                      {isManagerOrAdmin ? (
                        <>
                          <button
                            onClick={() => openEditModal(p)}
                            className="p-1.5 text-slate-500 hover:text-brand-primary hover:bg-brand-light rounded-lg transition-colors cursor-pointer"
                            title="Chỉnh sửa sản phẩm"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          {isAdmin && (
                            <button
                              onClick={() => handleDeleteProduct(p.id, p.name)}
                              className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                              title="Xóa sản phẩm"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </>
                      ) : (
                        <span className="text-[11px] text-slate-400 font-medium">Chỉ xem</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Footer info */}
        <div className="px-6 py-3 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between text-xs text-slate-500">
          <span>Hiển thị {products.length} sản phẩm</span>
          <span className="text-[11px] text-slate-400">Dữ liệu thời gian thực từ PostgreSQL (ims_dev)</span>
        </div>
      </div>

      {/* Modal Thêm / Chỉnh sửa Sản phẩm */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full border border-slate-100 shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">
                {editingProduct ? 'Chỉnh sửa sản phẩm' : 'Thêm mới sản phẩm'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="p-6 space-y-4">
              {formError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-100 text-xs text-rose-700 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
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
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 uppercase focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary focus:bg-white transition-all"
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
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary focus:bg-white transition-all"
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
                    Danh mục
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
                    Đơn vị tính
                  </label>
                  <select
                    value={formUnitId}
                    onChange={(e) => setFormUnitId(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary focus:bg-white transition-all"
                  >
                    <option value="">— Chọn đơn vị tính —</option>
                    {units.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.name} {u.symbol ? `(${u.symbol})` : ''}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                    value={formPrice}
                    onChange={(e) => setFormPrice(e.target.value)}
                    placeholder="0"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary focus:bg-white transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Tồn kho tối thiểu (Cảnh báo hết)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formMinStock}
                    onChange={(e) => setFormMinStock(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary focus:bg-white transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Tồn kho tối đa (Định mức chứa)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formMaxStock}
                    onChange={(e) => setFormMaxStock(e.target.value)}
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
                  placeholder="Thông số kỹ thuật hoặc ghi chú phụ..."
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary focus:bg-white transition-all resize-none"
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
                  className="inline-flex items-center gap-2 px-4 py-2 bg-brand-primary text-white text-xs font-semibold rounded-xl hover:bg-brand-hover shadow-xs transition-colors cursor-pointer disabled:opacity-50"
                >
                  {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{editingProduct ? 'Lưu thay đổi' : 'Tạo sản phẩm'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
