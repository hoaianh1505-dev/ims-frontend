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
  ShieldAlert,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
} from 'lucide-react';
import { categoriesService } from '../services/categories.service';
import { unitsService } from '../services/units.service';
import { Category, Unit } from '../types/category.types';
import { useAuthStore } from '../stores/auth.store';
import { showToast } from '../utils/toast.util';

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

  // Fetch Categories
  const fetchCategories = useCallback(async () => {
    setLoadingCategories(true);
    try {
      const res = await categoriesService.getAll({ search: catSearch.trim() || undefined, limit: 100 });
      setCategories(res.data || []);
    } catch (err: any) {
      console.error(err);
      showToast.error('Không thể tải danh sách danh mục');
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
      showToast.error('Không thể tải danh sách đơn vị tính');
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
        showToast.success('Cập nhật danh mục thành công');
      } else {
        await categoriesService.create({
          name: catName.trim(),
          description: catDesc.trim() || undefined,
          parent_id: catParentId || null,
        });
        showToast.success('Thêm mới danh mục thành công');
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
        showToast.success('Cập nhật đơn vị tính thành công');
      } else {
        await unitsService.create({
          name: unitName.trim(),
          symbol: unitSymbol.trim() || undefined,
        });
        showToast.success('Thêm mới đơn vị tính thành công');
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
        showToast.success(`Đã xóa danh mục "${deleteTarget.name}"`);
        fetchCategories();
      } else {
        await unitsService.delete(deleteTarget.id);
        showToast.success(`Đã xóa đơn vị "${deleteTarget.name}"`);
        fetchUnits();
      }
      setDeleteTarget(null);
    } catch (err: any) {
      const msg =
        err.response?.data?.message ||
        'Không thể xóa mục này (có thể do đang chứa dữ liệu liên kết)';
      showToast.error(msg);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 px-6 sm:px-8 py-4 max-w-[1560px] w-full mx-auto space-y-3.5">
      {/* PAGE HEADER */}
      <div className="shrink-0 flex items-center justify-between gap-4 pb-2 border-b border-slate-100 min-h-[52px]">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Danh mục & Đơn vị tính
          </h1>
          <p className="text-sm font-medium text-slate-500 mt-0.5">
            Phân loại hàng hóa và thiết lập chuẩn đơn vị đo lường trong kho
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={() => (activeTab === 'categories' ? fetchCategories() : fetchUnits())}
            className="p-2.5 text-slate-500 hover:text-slate-800 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer"
            title="Làm mới dữ liệu từ server"
          >
            <RefreshCw
              className={`w-4 h-4 ${
                (activeTab === 'categories' ? loadingCategories : loadingUnits)
                  ? 'animate-spin text-slate-600'
                  : ''
              }`}
            />
          </button>

          {isAdmin && (
            <button
              onClick={activeTab === 'categories' ? openCreateCategory : openCreateUnit}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#EE3D43] hover:bg-[#D9343A] text-white rounded-xl text-sm font-bold shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>{activeTab === 'categories' ? 'Thêm danh mục' : 'Thêm đơn vị tính'}</span>
            </button>
          )}
        </div>
      </div>

      {/* TOOLBAR */}
      <div className="shrink-0 bg-white p-3 sm:p-3.5 rounded-2xl border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-3 min-h-[58px]">
        {/* Search */}
        <div className="relative flex-1 min-w-[260px] max-w-sm">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={activeTab === 'categories' ? catSearch : unitSearch}
            onChange={(e) => {
              if (activeTab === 'categories') {
                setCatSearch(e.target.value);
                setCatPage(1);
              } else {
                setUnitSearch(e.target.value);
                setUnitPage(1);
              }
            }}
            placeholder={activeTab === 'categories' ? 'Tìm kiếm danh mục...' : 'Tìm kiếm đơn vị tính...'}
            className="w-full pl-10 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#EE3D43]/15 focus:border-slate-300 focus:bg-white transition-all"
          />
          {((activeTab === 'categories' ? catSearch : unitSearch)) && (
            <button
              onClick={() => {
                if (activeTab === 'categories') {
                  setCatSearch('');
                  setCatPage(1);
                } else {
                  setUnitSearch('');
                  setUnitPage(1);
                }
              }}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Tab switch pills */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-sm font-medium text-slate-600">
          <button
            onClick={() => setActiveTab('categories')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all duration-150 active:scale-95 cursor-pointer ${
              activeTab === 'categories'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Layers className="w-4 h-4 text-[#EE3D43]" />
            <span>Danh mục ({categories.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('units')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all duration-150 active:scale-95 cursor-pointer ${
              activeTab === 'units'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Ruler className="w-4 h-4 text-blue-500" />
            <span>Đơn vị tính ({units.length})</span>
          </button>
        </div>
      </div>

      {/* REUSED TABLE CARD CONTAINER */}
      <div className="flex-1 min-h-[480px] bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col overflow-hidden">
        <div className="flex-1 min-h-0 overflow-auto">
          {activeTab === 'categories' ? (
            /* CATEGORIES VIEW */
            loadingCategories && categories.length === 0 ? (
              <div className="py-20 flex flex-col items-center justify-center gap-2 text-slate-400 h-full">
                <Loader2 className="w-6 h-6 animate-spin text-slate-600" />
                <span className="text-sm font-medium">Đang tải danh mục...</span>
              </div>
            ) : paginatedCategories.length === 0 ? (
              <div className="py-16 text-center text-slate-400 space-y-2 h-full flex flex-col items-center justify-center">
                <Layers className="w-10 h-10 mx-auto text-slate-300 stroke-1" />
                <div className="text-sm font-medium text-slate-700">Chưa có danh mục nào</div>
                <div className="text-xs text-slate-400">Nhấn "Thêm danh mục" để tạo danh mục đầu tiên.</div>
              </div>
            ) : (
              <table className="w-full text-left border-collapse text-sm animate-tab-enter">
                <thead>
                  <tr className="sticky top-0 bg-slate-50 z-10 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-xs select-none shadow-2xs">
                    <th className="py-2.5 px-4 w-64 whitespace-nowrap">Tên danh mục</th>
                    <th className="py-2.5 px-4 w-40 whitespace-nowrap">Danh mục cha</th>
                    <th className="py-2.5 px-4 min-w-[200px]">Mô tả</th>
                    <th className="py-2.5 px-4 w-24 text-right whitespace-nowrap">Thao tác</th>
                  </tr>
                </thead>
                <tbody key={`${activeTab}-${currentCatPage}`} className="divide-y divide-slate-100 text-slate-700 animate-tab-enter">
                  {paginatedCategories.map((cat) => (
                    <tr key={cat.id} className="hover:bg-slate-50/80 transition-colors group">
                      <td className="py-2.5 px-4 whitespace-nowrap">
                        <span className="font-medium text-slate-800 group-hover:text-[#EE3D43] transition-colors text-sm">
                          {cat.name}
                        </span>
                      </td>
                      <td className="py-2.5 px-4 text-slate-600 whitespace-nowrap">
                        {cat.parent ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-700">
                            {cat.parent.name}
                          </span>
                        ) : (
                          <span className="text-slate-400 italic text-sm">Cấp gốc</span>
                        )}
                      </td>
                      <td className="py-2.5 px-4 text-slate-600">
                        <div className="leading-relaxed text-sm py-0.5 break-words line-clamp-1" title={cat.description || ''}>
                          {cat.description || <span className="text-slate-400 italic">—</span>}
                        </div>
                      </td>
                      <td className="py-2.5 px-4 text-right whitespace-nowrap">
                        {isAdmin ? (
                          <div className="inline-flex items-center justify-end gap-1">
                            <button
                              onClick={() => openEditCategory(cat)}
                              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
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
                          <span className="text-xs text-slate-400 font-medium">Chỉ xem</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )
          ) : (
            /* UNITS VIEW */
            loadingUnits && units.length === 0 ? (
              <div className="py-20 flex flex-col items-center justify-center gap-2 text-slate-400 h-full">
                <Loader2 className="w-6 h-6 animate-spin text-slate-600" />
                <span className="text-sm font-medium">Đang tải đơn vị tính...</span>
              </div>
            ) : paginatedUnits.length === 0 ? (
              <div className="py-16 text-center text-slate-400 space-y-2 h-full flex flex-col items-center justify-center">
                <Ruler className="w-10 h-10 mx-auto text-slate-300 stroke-1" />
                <div className="text-sm font-medium text-slate-700">Chưa có đơn vị tính nào</div>
                <div className="text-xs text-slate-400">Nhấn "Thêm đơn vị tính" để tạo đơn vị mới.</div>
              </div>
            ) : (
              <table className="w-full text-left border-collapse text-sm animate-tab-enter">
                <thead>
                  <tr className="sticky top-0 bg-slate-50 z-10 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-xs select-none shadow-2xs">
                    <th className="py-2.5 px-4 w-64 whitespace-nowrap">Tên đơn vị</th>
                    <th className="py-2.5 px-4 w-40 whitespace-nowrap">Ký hiệu viết tắt</th>
                    <th className="py-2.5 px-4 min-w-[200px]">Ngày tạo</th>
                    <th className="py-2.5 px-4 w-24 text-right whitespace-nowrap">Thao tác</th>
                  </tr>
                </thead>
                <tbody key={`${activeTab}-${currentUnitPage}`} className="divide-y divide-slate-100 text-slate-700 animate-tab-enter">
                  {paginatedUnits.map((unit) => (
                    <tr key={unit.id} className="hover:bg-slate-50/80 transition-colors group">
                      <td className="py-2.5 px-4 whitespace-nowrap">
                        <span className="font-medium text-slate-800 group-hover:text-[#EE3D43] transition-colors text-sm">
                          {unit.name}
                        </span>
                      </td>
                      <td className="py-2.5 px-4">
                        {unit.symbol ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-700">
                            {unit.symbol}
                          </span>
                        ) : (
                          <span className="text-slate-400 italic text-sm">—</span>
                        )}
                      </td>
                      <td className="py-2.5 px-4 text-slate-500 text-sm">
                        {new Date(unit.created_at).toLocaleDateString('vi-VN')}
                      </td>
                      <td className="py-2.5 px-4 text-right whitespace-nowrap">
                        {isAdmin ? (
                          <div className="inline-flex items-center justify-end gap-1">
                            <button
                              onClick={() => openEditUnit(unit)}
                              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
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
                          <span className="text-xs text-slate-400 font-medium">Chỉ xem</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )
          )}
        </div>

          {/* Compact Pagination Bar */}
          <div className="px-5 py-2.5 border-t border-slate-200/80 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500">
            <div className="flex items-center gap-3">
              <span>
                Hiển thị{' '}
                <span className="font-semibold text-slate-800">
                  {activeTab === 'categories' ? paginatedCategories.length : paginatedUnits.length}
                </span>{' '}
                / {activeTab === 'categories' ? totalCatItems : totalUnitItems}{' '}
                {activeTab === 'categories' ? 'danh mục' : 'đơn vị'}
              </span>
              <div className="flex items-center gap-1 text-[11px]">
                <span>Mỗi trang:</span>
                <select
                  value={activeTab === 'categories' ? catPageSize : unitPageSize}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    if (activeTab === 'categories') {
                      setCatPageSize(val);
                      setCatPage(1);
                    } else {
                      setUnitPageSize(val);
                      setUnitPage(1);
                    }
                  }}
                  className="px-1.5 py-0.5 bg-white border border-slate-200 rounded text-[11px] font-medium text-slate-700 cursor-pointer focus:outline-none"
                >
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                </select>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-slate-500 text-[11px]">
                Trang {activeTab === 'categories' ? currentCatPage : currentUnitPage} /{' '}
                {activeTab === 'categories' ? totalCatPages : totalUnitPages}
              </span>
              <div className="flex items-center gap-1">
                <button
                  disabled={
                    activeTab === 'categories' ? currentCatPage <= 1 : currentUnitPage <= 1
                  }
                  onClick={() => {
                    if (activeTab === 'categories') {
                      setCatPage((prev) => Math.max(prev - 1, 1));
                    } else {
                      setUnitPage((prev) => Math.max(prev - 1, 1));
                    }
                  }}
                  className="p-1 border border-slate-200 bg-white rounded-md hover:bg-slate-50 text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                  title="Trang trước"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                <button
                  disabled={
                    activeTab === 'categories'
                      ? currentCatPage >= totalCatPages
                      : currentUnitPage >= totalUnitPages
                  }
                  onClick={() => {
                    if (activeTab === 'categories') {
                      setCatPage((prev) => Math.min(prev + 1, totalCatPages));
                    } else {
                      setUnitPage((prev) => Math.min(prev + 1, totalUnitPages));
                    }
                  }}
                  className="p-1 border border-slate-200 bg-white rounded-md hover:bg-slate-50 text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                  title="Trang tiếp"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>

      {/* CUSTOM CONFIRM MODAL FOR DELETE */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full border border-slate-100 shadow-2xl p-5 space-y-3.5 animate-in fade-in zoom-in-95 duration-150">
            <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
              <ShieldAlert className="w-5 h-5 stroke-2" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="text-sm font-bold text-slate-900">
                Xác nhận xóa {deleteTarget.type === 'category' ? 'danh mục' : 'đơn vị tính'}
              </h3>
              <p className="text-xs text-slate-500">
                Bạn có chắc chắn muốn xóa mục này khỏi cơ sở dữ liệu?
              </p>
            </div>

            <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-center">
              <div className="font-bold text-slate-800 text-xs">{deleteTarget.name}</div>
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
                onClick={executeDelete}
                className="flex-1 py-2 px-3 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer flex items-center justify-center gap-1 disabled:opacity-50"
              >
                {deleting && <Loader2 className="w-3 h-3 animate-spin" />}
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
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-brand-primary"></div>
                <h3 className="text-sm font-bold text-slate-900">
                  {editingCategory ? 'Chỉnh sửa danh mục' : 'Thêm mới danh mục'}
                </h3>
              </div>
              <button
                onClick={() => setIsCatModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
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
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-400 focus:border-slate-400 focus:bg-white transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Danh mục cha (Tùy chọn)
                </label>
                <select
                  value={catParentId}
                  onChange={(e) => setCatParentId(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-400 focus:border-slate-400 focus:bg-white transition-all"
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
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-400 focus:border-slate-400 focus:bg-white transition-all resize-none"
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
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-brand-primary"></div>
                <h3 className="text-sm font-bold text-slate-900">
                  {editingUnit ? 'Chỉnh sửa đơn vị tính' : 'Thêm mới đơn vị tính'}
                </h3>
              </div>
              <button
                onClick={() => setIsUnitModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
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
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-400 focus:border-slate-400 focus:bg-white transition-all"
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
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-400 focus:border-slate-400 focus:bg-white transition-all"
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
