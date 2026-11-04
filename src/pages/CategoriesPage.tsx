import React, { useState, useEffect, useCallback } from 'react';
import {
  Layers,
  Ruler,
  Plus,
  Search,
  Edit2,
  Trash2,
  AlertCircle,
  X,
  Loader2,
  CheckCircle2,
} from 'lucide-react';
import { categoriesService } from '../services/categories.service';
import { unitsService } from '../services/units.service';
import { Category, Unit } from '../types/category.types';
import { useAuthStore } from '../stores/auth.store';

export const CategoriesPage: React.FC = () => {
  const { user } = useAuthStore();
  const isAdmin = user?.role === 'ADMIN';

  // Tabs: 'categories' | 'units'
  const [activeTab, setActiveTab] = useState<'categories' | 'units'>('categories');

  // Categories state
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [catSearch, setCatSearch] = useState('');

  // Units state
  const [units, setUnits] = useState<Unit[]>([]);
  const [loadingUnits, setLoadingUnits] = useState(false);
  const [unitSearch, setUnitSearch] = useState('');

  // Category Modal
  const [isCatModalOpen, setIsCatModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [catName, setCatName] = useState('');
  const [catDesc, setCatDesc] = useState('');
  const [catParentId, setCatParentId] = useState<string>('');
  const [catFormError, setCatFormError] = useState('');
  const [submittingCat, setSubmittingCat] = useState(false);

  // Unit Modal
  const [isUnitModalOpen, setIsUnitModalOpen] = useState(false);
  const [editingUnit, setEditingUnit] = useState<Unit | null>(null);
  const [unitName, setUnitName] = useState('');
  const [unitSymbol, setUnitSymbol] = useState('');
  const [unitFormError, setUnitFormError] = useState('');
  const [submittingUnit, setSubmittingUnit] = useState(false);

  // Notification message
  const [notify, setNotify] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const showNotify = (type: 'success' | 'error', message: string) => {
    setNotify({ type, message });
    setTimeout(() => setNotify(null), 4000);
  };

  // Fetch Categories
  const fetchCategories = useCallback(async () => {
    setLoadingCategories(true);
    try {
      const res = await categoriesService.getAll({ search: catSearch.trim() || undefined, limit: 100 });
      setCategories(res.data || []);
    } catch (err: any) {
      console.error(err);
      showNotify('error', 'Không thể tải danh sách danh mục');
    } finally {
      setLoadingCategories(false);
    }
  }, [catSearch]);

  // Fetch Units
  const fetchUnits = useCallback(async () => {
    setLoadingUnits(true);
    try {
      const res = await unitsService.getAll({ search: unitSearch.trim() || undefined, limit: 100 });
      setUnits(res.data || []);
    } catch (err: any) {
      console.error(err);
      showNotify('error', 'Không thể tải danh sách đơn vị tính');
    } finally {
      setLoadingUnits(false);
    }
  }, [unitSearch]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    fetchUnits();
  }, [fetchUnits]);

  // Handle open Cat Modal
  const openCreateCategory = () => {
    setEditingCategory(null);
    setCatName('');
    setCatDesc('');
    setCatParentId('');
    setCatFormError('');
    setIsCatModalOpen(true);
  };

  const openEditCategory = (cat: Category) => {
    setEditingCategory(cat);
    setCatName(cat.name);
    setCatDesc(cat.description || '');
    setCatParentId(cat.parent_id || '');
    setCatFormError('');
    setIsCatModalOpen(true);
  };

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!catName.trim()) {
      setCatFormError('Vui lòng nhập tên danh mục');
      return;
    }
    setSubmittingCat(true);
    setCatFormError('');
    try {
      if (editingCategory) {
        await categoriesService.update(editingCategory.id, {
          name: catName.trim(),
          description: catDesc.trim() || undefined,
          parent_id: catParentId || null,
        });
        showNotify('success', 'Cập nhật danh mục thành công');
      } else {
        await categoriesService.create({
          name: catName.trim(),
          description: catDesc.trim() || undefined,
          parent_id: catParentId || null,
        });
        showNotify('success', 'Thêm mới danh mục thành công');
      }
      setIsCatModalOpen(false);
      fetchCategories();
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Có lỗi xảy ra khi lưu danh mục';
      setCatFormError(msg);
    } finally {
      setSubmittingCat(false);
    }
  };

  const handleDeleteCategory = async (id: string, name: string) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa danh mục "${name}" không?`)) return;
    try {
      await categoriesService.delete(id);
      showNotify('success', `Đã xóa danh mục "${name}"`);
      fetchCategories();
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Không thể xóa danh mục này (có thể chứa danh mục con hoặc sản phẩm)';
      showNotify('error', msg);
    }
  };

  // Handle open Unit Modal
  const openCreateUnit = () => {
    setEditingUnit(null);
    setUnitName('');
    setUnitSymbol('');
    setUnitFormError('');
    setIsUnitModalOpen(true);
  };

  const openEditUnit = (unit: Unit) => {
    setEditingUnit(unit);
    setUnitName(unit.name);
    setUnitSymbol(unit.symbol || '');
    setUnitFormError('');
    setIsUnitModalOpen(true);
  };

  const handleSaveUnit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!unitName.trim()) {
      setUnitFormError('Vui lòng nhập tên đơn vị tính');
      return;
    }
    setSubmittingUnit(true);
    setUnitFormError('');
    try {
      if (editingUnit) {
        await unitsService.update(editingUnit.id, {
          name: unitName.trim(),
          symbol: unitSymbol.trim() || undefined,
        });
        showNotify('success', 'Cập nhật đơn vị tính thành công');
      } else {
        await unitsService.create({
          name: unitName.trim(),
          symbol: unitSymbol.trim() || undefined,
        });
        showNotify('success', 'Thêm mới đơn vị tính thành công');
      }
      setIsUnitModalOpen(false);
      fetchUnits();
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Có lỗi xảy ra khi lưu đơn vị tính';
      setUnitFormError(msg);
    } finally {
      setSubmittingUnit(false);
    }
  };

  const handleDeleteUnit = async (id: string, name: string) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa đơn vị tính "${name}" không?`)) return;
    try {
      await unitsService.delete(id);
      showNotify('success', `Đã xóa đơn vị tính "${name}"`);
      fetchUnits();
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Không thể xóa đơn vị tính này';
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

      {/* Header & Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Danh mục & Đơn vị tính</h1>
          <p className="text-sm text-slate-500 mt-1">
            Quản lý cây danh mục phân loại hàng hóa và các đơn vị đo lường trong kho
          </p>
        </div>

        {/* Tab switch pills */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl">
          <button
            onClick={() => setActiveTab('categories')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'categories'
                ? 'bg-white text-brand-primary shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Danh mục sản phẩm</span>
            <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-brand-light text-brand-primary font-bold">
              {categories.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('units')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'units'
                ? 'bg-white text-brand-primary shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Ruler className="w-4 h-4" />
            <span>Đơn vị tính</span>
            <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-brand-light text-brand-primary font-bold">
              {units.length}
            </span>
          </button>
        </div>
      </div>

      {/* TAB 1: DANH MỤC */}
      {activeTab === 'categories' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={catSearch}
                onChange={(e) => setCatSearch(e.target.value)}
                placeholder="Tìm kiếm danh mục theo tên..."
                className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all"
              />
            </div>

            {isAdmin && (
              <button
                onClick={openCreateCategory}
                className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-brand-primary text-white rounded-xl text-xs font-semibold hover:bg-brand-hover shadow-xs transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Thêm danh mục</span>
              </button>
            )}
          </div>

          {/* Categories Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
            {loadingCategories ? (
              <div className="py-20 flex flex-col items-center justify-center gap-3 text-slate-400">
                <Loader2 className="w-6 h-6 animate-spin text-brand-primary" />
                <span className="text-xs font-medium">Đang tải danh mục...</span>
              </div>
            ) : categories.length === 0 ? (
              <div className="py-16 text-center text-slate-400 space-y-2">
                <Layers className="w-10 h-10 mx-auto text-slate-300 stroke-1" />
                <div className="text-sm font-semibold text-slate-700">Chưa có danh mục nào</div>
                <div className="text-xs text-slate-400">Nhấn "Thêm danh mục" để tạo danh mục phân loại đầu tiên.</div>
              </div>
            ) : (
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
                    <th className="py-3.5 px-6">Tên danh mục</th>
                    <th className="py-3.5 px-6">Mô tả</th>
                    <th className="py-3.5 px-6">Danh mục cha</th>
                    <th className="py-3.5 px-6 text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {categories.map((cat) => (
                    <tr key={cat.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3.5 px-6 font-semibold text-slate-900 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-brand-primary"></span>
                        {cat.name}
                      </td>
                      <td className="py-3.5 px-6 text-slate-500 max-w-xs truncate">
                        {cat.description || '—'}
                      </td>
                      <td className="py-3.5 px-6">
                        {cat.parent ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200">
                            {cat.parent.name}
                          </span>
                        ) : (
                          <span className="text-slate-400 italic">Cấp gốc</span>
                        )}
                      </td>
                      <td className="py-3.5 px-6 text-right space-x-1">
                        {isAdmin ? (
                          <>
                            <button
                              onClick={() => openEditCategory(cat)}
                              className="p-1.5 text-slate-500 hover:text-brand-primary hover:bg-brand-light rounded-lg transition-colors cursor-pointer"
                              title="Chỉnh sửa"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteCategory(cat.id, cat.name)}
                              className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                              title="Xóa"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </>
                        ) : (
                          <span className="text-[11px] text-slate-400 font-medium">Chỉ xem</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: ĐƠN VỊ TÍNH */}
      {activeTab === 'units' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={unitSearch}
                onChange={(e) => setUnitSearch(e.target.value)}
                placeholder="Tìm kiếm đơn vị tính..."
                className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all"
              />
            </div>

            {isAdmin && (
              <button
                onClick={openCreateUnit}
                className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-brand-primary text-white rounded-xl text-xs font-semibold hover:bg-brand-hover shadow-xs transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Thêm đơn vị tính</span>
              </button>
            )}
          </div>

          {/* Units Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
            {loadingUnits ? (
              <div className="py-20 flex flex-col items-center justify-center gap-3 text-slate-400">
                <Loader2 className="w-6 h-6 animate-spin text-brand-primary" />
                <span className="text-xs font-medium">Đang tải đơn vị tính...</span>
              </div>
            ) : units.length === 0 ? (
              <div className="py-16 text-center text-slate-400 space-y-2">
                <Ruler className="w-10 h-10 mx-auto text-slate-300 stroke-1" />
                <div className="text-sm font-semibold text-slate-700">Chưa có đơn vị tính nào</div>
                <div className="text-xs text-slate-400">Nhấn "Thêm đơn vị tính" để tạo đơn vị đo lường mới.</div>
              </div>
            ) : (
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
                    <th className="py-3.5 px-6">Tên đơn vị</th>
                    <th className="py-3.5 px-6">Ký hiệu</th>
                    <th className="py-3.5 px-6">Ngày cập nhật</th>
                    <th className="py-3.5 px-6 text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {units.map((unit) => (
                    <tr key={unit.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3.5 px-6 font-semibold text-slate-900">{unit.name}</td>
                      <td className="py-3.5 px-6">
                        {unit.symbol ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                            {unit.symbol}
                          </span>
                        ) : (
                          <span className="text-slate-400 italic">—</span>
                        )}
                      </td>
                      <td className="py-3.5 px-6 text-slate-500">
                        {new Date(unit.created_at).toLocaleDateString('vi-VN')}
                      </td>
                      <td className="py-3.5 px-6 text-right space-x-1">
                        {isAdmin ? (
                          <>
                            <button
                              onClick={() => openEditUnit(unit)}
                              className="p-1.5 text-slate-500 hover:text-brand-primary hover:bg-brand-light rounded-lg transition-colors cursor-pointer"
                              title="Chỉnh sửa"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteUnit(unit.id, unit.name)}
                              className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                              title="Xóa"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </>
                        ) : (
                          <span className="text-[11px] text-slate-400 font-medium">Chỉ xem</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* Modal: Thêm/Sửa Danh mục */}
      {isCatModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full border border-slate-100 shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">
                {editingCategory ? 'Chỉnh sửa danh mục' : 'Thêm mới danh mục'}
              </h3>
              <button
                onClick={() => setIsCatModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveCategory} className="p-6 space-y-4">
              {catFormError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-100 text-xs text-rose-700 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
                  <span>{catFormError}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Tên danh mục <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={catName}
                  onChange={(e) => setCatName(e.target.value)}
                  placeholder="Ví dụ: Thiết bị điện tử, Gia dụng..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary focus:bg-white transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Danh mục cha (Tùy chọn)
                </label>
                <select
                  value={catParentId}
                  onChange={(e) => setCatParentId(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary focus:bg-white transition-all"
                >
                  <option value="">— Cấp gốc (Không có danh mục cha) —</option>
                  {categories
                    .filter((c) => !editingCategory || c.id !== editingCategory.id)
                    .map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Mô tả
                </label>
                <textarea
                  rows={3}
                  value={catDesc}
                  onChange={(e) => setCatDesc(e.target.value)}
                  placeholder="Mô tả tóm tắt về nhóm danh mục này..."
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary focus:bg-white transition-all resize-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsCatModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={submittingCat}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-brand-primary text-white text-xs font-semibold rounded-xl hover:bg-brand-hover shadow-xs transition-colors cursor-pointer disabled:opacity-50"
                >
                  {submittingCat && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{editingCategory ? 'Lưu thay đổi' : 'Tạo danh mục'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Thêm/Sửa Đơn vị tính */}
      {isUnitModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full border border-slate-100 shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">
                {editingUnit ? 'Chỉnh sửa đơn vị tính' : 'Thêm mới đơn vị tính'}
              </h3>
              <button
                onClick={() => setIsUnitModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveUnit} className="p-6 space-y-4">
              {unitFormError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-100 text-xs text-rose-700 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
                  <span>{unitFormError}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Tên đơn vị <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={unitName}
                  onChange={(e) => setUnitName(e.target.value)}
                  placeholder="Ví dụ: Kilogram, Hộp, Chai, Thùng..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary focus:bg-white transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Ký hiệu viết tắt (Tùy chọn)
                </label>
                <input
                  type="text"
                  value={unitSymbol}
                  onChange={(e) => setUnitSymbol(e.target.value)}
                  placeholder="Ví dụ: kg, hop, chai..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary focus:bg-white transition-all"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsUnitModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={submittingUnit}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-brand-primary text-white text-xs font-semibold rounded-xl hover:bg-brand-hover shadow-xs transition-colors cursor-pointer disabled:opacity-50"
                >
                  {submittingUnit && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{editingUnit ? 'Lưu thay đổi' : 'Tạo đơn vị'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
