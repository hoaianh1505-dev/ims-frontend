import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Layers,
  Ruler,
  Plus,
  Search,
  Edit3,
  Trash2,
  AlertTriangle,
  X,
  Loader2,
  CheckCircle2,
  ShieldAlert,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
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

  // Pagination for Categories
  const [catPage, setCatPage] = useState(1);
  const [catPageSize, setCatPageSize] = useState(10);

  // Pagination for Units
  const [unitPage, setUnitPage] = useState(1);
  const [unitPageSize, setUnitPageSize] = useState(10);

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

  // Custom Delete Confirm Dialog
  const [deleteTarget, setDeleteTarget] = useState<{
    type: 'category' | 'unit';
    id: string;
    name: string;
  } | null>(null);
  const [deleting, setDeleting] = useState(false);

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

  // Paginated Categories
  const totalCatItems = categories.length;
  const totalCatPages = Math.max(1, Math.ceil(totalCatItems / catPageSize));
  const currentCatPage = Math.min(catPage, totalCatPages);
  const paginatedCategories = useMemo(() => {
    const start = (currentCatPage - 1) * catPageSize;
    return categories.slice(start, start + catPageSize);
  }, [categories, currentCatPage, catPageSize]);

  // Paginated Units
  const totalUnitItems = units.length;
  const totalUnitPages = Math.max(1, Math.ceil(totalUnitItems / unitPageSize));
  const currentUnitPage = Math.min(unitPage, totalUnitPages);
  const paginatedUnits = useMemo(() => {
    const start = (currentUnitPage - 1) * unitPageSize;
    return units.slice(start, start + unitPageSize);
  }, [units, currentUnitPage, unitPageSize]);

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

  // Custom Delete Execution
  const executeDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      if (deleteTarget.type === 'category') {
        await categoriesService.delete(deleteTarget.id);
        showNotify('success', `Đã xóa danh mục "${deleteTarget.name}"`);
        fetchCategories();
      } else {
        await unitsService.delete(deleteTarget.id);
        showNotify('success', `Đã xóa đơn vị "${deleteTarget.name}"`);
        fetchUnits();
      }
      setDeleteTarget(null);
    } catch (err: any) {
      const msg =
        err.response?.data?.message ||
        'Không thể xóa mục này (có thể do đang chứa dữ liệu liên kết)';
      showNotify('error', msg);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="p-8 max-w-[1440px] mx-auto space-y-7">
      {/* Toast Notification */}
      {notify && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-2xl shadow-xl border text-xs font-semibold animate-in slide-in-from-bottom-3 duration-200 ${
            notify.type === 'success'
              ? 'bg-[#EAF3EE] text-[#1A4D3E] border-[#C8E1D5]'
              : 'bg-rose-50 text-rose-900 border-rose-200'
          }`}
        >
          {notify.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-brand-primary shrink-0" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
          )}
          <span>{notify.message}</span>
        </div>
      )}

      {/* Header & Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-brand-light border border-brand-border text-[11px] font-bold text-brand-primary">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-primary"></span>
            <span>Cấu trúc dữ liệu kho</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Danh mục & Đơn vị tính
          </h1>
          <p className="text-xs text-slate-500">
            Thiết lập danh mục phân loại hàng hóa và chuẩn đo lường trong toàn bộ kho
          </p>
        </div>

        {/* Tab switch pills */}
        <div className="flex items-center gap-1.5 p-1 bg-white border border-brand-border/80 rounded-xl shadow-2xs">
          <button
            onClick={() => setActiveTab('categories')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'categories'
                ? 'bg-brand-primary text-white shadow-xs'
                : 'text-slate-600 hover:text-brand-primary hover:bg-brand-light/50'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Danh mục sản phẩm</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                activeTab === 'categories'
                  ? 'bg-white/20 text-white'
                  : 'bg-brand-light text-brand-primary'
              }`}
            >
              {categories.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('units')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'units'
                ? 'bg-brand-primary text-white shadow-xs'
                : 'text-slate-600 hover:text-brand-primary hover:bg-brand-light/50'
            }`}
          >
            <Ruler className="w-4 h-4" />
            <span>Đơn vị tính</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                activeTab === 'units'
                  ? 'bg-white/20 text-white'
                  : 'bg-brand-light text-brand-primary'
              }`}
            >
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
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-primary/70" />
              <input
                type="text"
                value={catSearch}
                onChange={(e) => {
                  setCatSearch(e.target.value);
                  setCatPage(1);
                }}
                placeholder="Tìm kiếm danh mục theo tên..."
                className="w-full pl-10 pr-8 py-2.5 bg-white border border-slate-200 hover:border-brand-border rounded-xl text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all shadow-2xs"
              />
              {catSearch && (
                <button
                  onClick={() => setCatSearch('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => fetchCategories()}
                className="p-2.5 text-slate-600 hover:text-brand-primary bg-white border border-slate-200 hover:border-brand-border rounded-xl hover:bg-brand-light/40 transition-colors shadow-2xs cursor-pointer"
                title="Làm mới"
              >
                <RefreshCw className={`w-4 h-4 ${loadingCategories ? 'animate-spin text-brand-primary' : ''}`} />
              </button>

              {isAdmin && (
                <button
                  onClick={openCreateCategory}
                  className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-brand-primary text-white rounded-xl text-xs font-semibold hover:bg-brand-hover shadow-sm shadow-brand-primary/25 transition-all cursor-pointer hover:scale-[1.01] active:scale-[0.99]"
                >
                  <Plus className="w-4 h-4" />
                  <span>Thêm danh mục</span>
                </button>
              )}
            </div>
          </div>

          {/* Categories Table */}
          <div className="bg-white rounded-2xl border border-brand-border/70 shadow-2xs overflow-hidden">
            {loadingCategories ? (
              <div className="py-20 flex flex-col items-center justify-center gap-3 text-slate-400">
                <Loader2 className="w-7 h-7 animate-spin text-brand-primary" />
                <span className="text-xs font-medium">Đang tải danh mục...</span>
              </div>
            ) : paginatedCategories.length === 0 ? (
              <div className="py-16 text-center text-slate-400 space-y-2">
                <Layers className="w-10 h-10 mx-auto text-slate-300 stroke-1" />
                <div className="text-sm font-semibold text-slate-700">Chưa có danh mục nào</div>
                <div className="text-xs text-slate-400">Nhấn "Thêm danh mục" để tạo danh mục phân loại đầu tiên.</div>
              </div>
            ) : (
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-[#F0F5F2] border-b border-brand-border/80 text-brand-dark font-bold uppercase tracking-wider text-[11px] select-none">
                    <th className="py-3.5 px-5 w-1/3">Tên danh mục</th>
                    <th className="py-3.5 px-4 w-1/4">Danh mục cha</th>
                    <th className="py-3.5 px-4">Mô tả</th>
                    <th className="py-3.5 px-5 w-28 text-right whitespace-nowrap">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {paginatedCategories.map((cat) => (
                    <tr key={cat.id} className="hover:bg-[#F6FAF8] transition-colors border-l-2 border-transparent hover:border-brand-primary">
                      <td className="py-3 px-5">
                        <div className="flex items-center gap-3">
                          <div className="w-7 h-7 rounded-lg bg-brand-light text-brand-primary flex items-center justify-center shrink-0 border border-brand-border/60">
                            <Layers className="w-3.5 h-3.5 stroke-2" />
                          </div>
                          <span className="font-bold text-slate-900 line-clamp-1 text-xs">{cat.name}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        {cat.parent ? (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-semibold bg-brand-light text-brand-dark border border-brand-border">
                            {cat.parent.name}
                          </span>
                        ) : (
                          <span className="text-slate-400 italic">Cấp gốc</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-slate-500 line-clamp-1">
                        {cat.description || '—'}
                      </td>
                      <td className="py-3.5 px-5 text-right whitespace-nowrap">
                        {isAdmin ? (
                          <div className="inline-flex items-center justify-end gap-1">
                            <button
                              onClick={() => openEditCategory(cat)}
                              className="p-1.5 text-slate-400 hover:text-brand-primary hover:bg-brand-light rounded-lg transition-colors cursor-pointer"
                              title="Chỉnh sửa"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() =>
                                setDeleteTarget({
                                  type: 'category',
                                  id: cat.id,
                                  name: cat.name,
                                })
                              }
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                              title="Xóa"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <span className="text-[11px] text-slate-400 font-medium">Chỉ xem</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {/* Pagination Bar */}
            <div className="px-6 py-3.5 border-t border-slate-200 bg-[#FBFDFB] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
              <div className="flex items-center gap-4">
                <span>
                  Hiển thị <span className="font-bold text-slate-800">{paginatedCategories.length}</span> / {totalCatItems} danh mục
                </span>
                <div className="flex items-center gap-1.5">
                  <span>Mỗi trang:</span>
                  <select
                    value={catPageSize}
                    onChange={(e) => {
                      setCatPageSize(Number(e.target.value));
                      setCatPage(1);
                    }}
                    className="px-2 py-1 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 cursor-pointer focus:outline-none"
                  >
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-slate-500 font-medium">
                  Trang {currentCatPage} / {totalCatPages}
                </span>
                <div className="flex items-center gap-1">
                  <button
                    disabled={currentCatPage <= 1}
                    onClick={() => setCatPage((prev) => Math.max(prev - 1, 1))}
                    className="p-1.5 border border-slate-200 bg-white rounded-lg hover:bg-slate-50 text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    disabled={currentCatPage >= totalCatPages}
                    onClick={() => setCatPage((prev) => Math.min(prev + 1, totalCatPages))}
                    className="p-1.5 border border-slate-200 bg-white rounded-lg hover:bg-slate-50 text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: ĐƠN VỊ TÍNH */}
      {activeTab === 'units' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-primary/70" />
              <input
                type="text"
                value={unitSearch}
                onChange={(e) => {
                  setUnitSearch(e.target.value);
                  setUnitPage(1);
                }}
                placeholder="Tìm kiếm đơn vị tính..."
                className="w-full pl-10 pr-8 py-2.5 bg-white border border-slate-200 hover:border-brand-border rounded-xl text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all shadow-2xs"
              />
              {unitSearch && (
                <button
                  onClick={() => setUnitSearch('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => fetchUnits()}
                className="p-2.5 text-slate-600 hover:text-brand-primary bg-white border border-slate-200 hover:border-brand-border rounded-xl hover:bg-brand-light/40 transition-colors shadow-2xs cursor-pointer"
                title="Làm mới"
              >
                <RefreshCw className={`w-4 h-4 ${loadingUnits ? 'animate-spin text-brand-primary' : ''}`} />
              </button>

              {isAdmin && (
                <button
                  onClick={openCreateUnit}
                  className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-brand-primary text-white rounded-xl text-xs font-semibold hover:bg-brand-hover shadow-sm shadow-brand-primary/25 transition-all cursor-pointer hover:scale-[1.01] active:scale-[0.99]"
                >
                  <Plus className="w-4 h-4" />
                  <span>Thêm đơn vị tính</span>
                </button>
              )}
            </div>
          </div>

          {/* Units Table */}
          <div className="bg-white rounded-2xl border border-brand-border/70 shadow-2xs overflow-hidden">
            {loadingUnits ? (
              <div className="py-20 flex flex-col items-center justify-center gap-3 text-slate-400">
                <Loader2 className="w-7 h-7 animate-spin text-brand-primary" />
                <span className="text-xs font-medium">Đang tải đơn vị tính...</span>
              </div>
            ) : paginatedUnits.length === 0 ? (
              <div className="py-16 text-center text-slate-400 space-y-2">
                <Ruler className="w-10 h-10 mx-auto text-slate-300 stroke-1" />
                <div className="text-sm font-semibold text-slate-700">Chưa có đơn vị tính nào</div>
                <div className="text-xs text-slate-400">Nhấn "Thêm đơn vị tính" để tạo đơn vị đo lường mới.</div>
              </div>
            ) : (
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-[#F0F5F2] border-b border-brand-border/80 text-brand-dark font-bold uppercase tracking-wider text-[11px] select-none">
                    <th className="py-3.5 px-5 w-1/3">Tên đơn vị</th>
                    <th className="py-3.5 px-4 w-1/4">Ký hiệu viết tắt</th>
                    <th className="py-3.5 px-4">Ngày tạo</th>
                    <th className="py-3.5 px-5 w-28 text-right whitespace-nowrap">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {paginatedUnits.map((unit) => (
                    <tr key={unit.id} className="hover:bg-[#F6FAF8] transition-colors border-l-2 border-transparent hover:border-brand-primary">
                      <td className="py-3 px-5">
                        <div className="flex items-center gap-3">
                          <div className="w-7 h-7 rounded-lg bg-brand-light text-brand-primary flex items-center justify-center shrink-0 border border-brand-border/60">
                            <Ruler className="w-3.5 h-3.5 stroke-2" />
                          </div>
                          <span className="font-bold text-slate-900 line-clamp-1 text-xs">{unit.name}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        {unit.symbol ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-[#EAF3EE] text-[#1A4D3E] border border-[#C8E1D5]">
                            {unit.symbol}
                          </span>
                        ) : (
                          <span className="text-slate-400 italic">—</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-slate-500">
                        {new Date(unit.created_at).toLocaleDateString('vi-VN')}
                      </td>
                      <td className="py-3.5 px-5 text-right whitespace-nowrap">
                        {isAdmin ? (
                          <div className="inline-flex items-center justify-end gap-1">
                            <button
                              onClick={() => openEditUnit(unit)}
                              className="p-1.5 text-slate-400 hover:text-brand-primary hover:bg-brand-light rounded-lg transition-colors cursor-pointer"
                              title="Chỉnh sửa"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() =>
                                setDeleteTarget({
                                  type: 'unit',
                                  id: unit.id,
                                  name: unit.name,
                                })
                              }
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                              title="Xóa"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <span className="text-[11px] text-slate-400 font-medium">Chỉ xem</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {/* Pagination Bar */}
            <div className="px-6 py-3.5 border-t border-slate-200 bg-[#FBFDFB] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
              <div className="flex items-center gap-4">
                <span>
                  Hiển thị <span className="font-bold text-slate-800">{paginatedUnits.length}</span> / {totalUnitItems} đơn vị
                </span>
                <div className="flex items-center gap-1.5">
                  <span>Mỗi trang:</span>
                  <select
                    value={unitPageSize}
                    onChange={(e) => {
                      setUnitPageSize(Number(e.target.value));
                      setUnitPage(1);
                    }}
                    className="px-2 py-1 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 cursor-pointer focus:outline-none"
                  >
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-slate-500 font-medium">
                  Trang {currentUnitPage} / {totalUnitPages}
                </span>
                <div className="flex items-center gap-1">
                  <button
                    disabled={currentUnitPage <= 1}
                    onClick={() => setUnitPage((prev) => Math.max(prev - 1, 1))}
                    className="p-1.5 border border-slate-200 bg-white rounded-lg hover:bg-slate-50 text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    disabled={currentUnitPage >= totalUnitPages}
                    onClick={() => setUnitPage((prev) => Math.min(prev + 1, totalUnitPages))}
                    className="p-1.5 border border-slate-200 bg-white rounded-lg hover:bg-slate-50 text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
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
              <h3 className="text-base font-bold text-slate-900">
                Xác nhận xóa {deleteTarget.type === 'category' ? 'danh mục' : 'đơn vị tính'}
              </h3>
              <p className="text-xs text-slate-500">
                Bạn có chắc chắn muốn xóa mục này khỏi cơ sở dữ liệu?
              </p>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-center">
              <div className="font-bold text-slate-800 text-xs">{deleteTarget.name}</div>
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
                onClick={executeDelete}
                className="flex-1 py-2.5 px-4 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                {deleting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>Xác nhận xóa</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Thêm/Sửa Danh mục */}
      {isCatModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full border border-slate-100 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 border-b border-brand-border/60 flex items-center justify-between bg-[#F1F6F3]">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-brand-primary"></div>
                <h3 className="text-sm font-bold text-brand-dark">
                  {editingCategory ? 'Chỉnh sửa danh mục' : 'Thêm mới danh mục'}
                </h3>
              </div>
              <button
                onClick={() => setIsCatModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveCategory} className="p-6 space-y-4">
              {catFormError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-100 text-xs text-rose-700 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-rose-500" />
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
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-primary text-white text-xs font-semibold rounded-xl hover:bg-brand-hover shadow-xs transition-colors cursor-pointer disabled:opacity-50"
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
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full border border-slate-100 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 border-b border-brand-border/60 flex items-center justify-between bg-[#F1F6F3]">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-brand-primary"></div>
                <h3 className="text-sm font-bold text-brand-dark">
                  {editingUnit ? 'Chỉnh sửa đơn vị tính' : 'Thêm mới đơn vị tính'}
                </h3>
              </div>
              <button
                onClick={() => setIsUnitModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveUnit} className="p-6 space-y-4">
              {unitFormError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-100 text-xs text-rose-700 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-rose-500" />
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
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-primary text-white text-xs font-semibold rounded-xl hover:bg-brand-hover shadow-xs transition-colors cursor-pointer disabled:opacity-50"
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
