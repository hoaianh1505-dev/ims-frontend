import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Building2,
  Search,
  Plus,
  Edit3,
  Trash2,
  AlertTriangle,
  X,
  Loader2,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Layers,
  MapPin,
  UserCheck,
  ShieldAlert,
} from 'lucide-react';
import { warehousesService } from '../services/warehouses.service';
import { usersService, UserItem } from '../services/users.service';
import { Warehouse, WarehouseLocation } from '../types/warehouse.types';
import { useAuthStore } from '../stores/auth.store';
import { showToast } from '../utils/toast.util';

export const WarehousesPage: React.FC = () => {
  const { user } = useAuthStore();
  const isAdmin = user?.role === 'ADMIN';
  const isManagerOrAdmin = user?.role === 'ADMIN' || user?.role === 'MANAGER';

  // Data State
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [loading, setLoading] = useState(false);
  const [managers, setManagers] = useState<UserItem[]>([]);

  // Filter State
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);

  // Warehouse Modal State
  const [isWarehouseModalOpen, setIsWarehouseModalOpen] = useState(false);
  const [editingWarehouse, setEditingWarehouse] = useState<Warehouse | null>(null);
  const [formWhCode, setFormWhCode] = useState('');
  const [formWhName, setFormWhName] = useState('');
  const [formWhAddress, setFormWhAddress] = useState('');
  const [formWhManagerId, setFormWhManagerId] = useState('');
  const [formWhIsActive, setFormWhIsActive] = useState(true);
  const [formWhError, setFormWhError] = useState('');
  const [submittingWh, setSubmittingWh] = useState(false);

  // Location Drawer State
  const [activeDrawerWarehouse, setActiveDrawerWarehouse] = useState<Warehouse | null>(null);
  const [locations, setLocations] = useState<WarehouseLocation[]>([]);
  const [loadingLocations, setLoadingLocations] = useState(false);

  // Add Location Form in Drawer
  const [isAddingLocation, setIsAddingLocation] = useState(false);
  const [editingLocation, setEditingLocation] = useState<WarehouseLocation | null>(null);
  const [locCode, setLocCode] = useState('');
  const [locName, setLocName] = useState('');
  const [locDesc, setLocDesc] = useState('');
  const [locError, setLocError] = useState('');
  const [submittingLoc, setSubmittingLoc] = useState(false);

  // Custom Delete Confirm Dialog
  const [deleteTarget, setDeleteTarget] = useState<{
    type: 'warehouse' | 'location';
    id: string;
    name: string;
  } | null>(null);
  const [deleting, setDeleting] = useState(false);

  const showNotify = (type: 'success' | 'error', message: string) => {
    if (type === 'success') {
      showToast.success(message);
    } else {
      showToast.error(message);
    }
  };

  // Load Warehouses
  const fetchWarehouses = useCallback(async () => {
    setLoading(true);
    try {
      const res = await warehousesService.getAll({ limit: 100 });
      setWarehouses(res.data || []);
    } catch (err) {
      console.error('Lỗi tải kho hàng:', err);
      showNotify('error', 'Không thể tải danh sách kho hàng từ máy chủ');
    } finally {
      setLoading(false);
    }
  }, []);

  // Load Managers (if Admin)
  useEffect(() => {
    if (isAdmin) {
      usersService.getAll({ limit: 50 }).then((res) => {
        setManagers(res.data || []);
      });
    }
    fetchWarehouses();
  }, [isAdmin, fetchWarehouses]);

  // Load Locations for Drawer
  const fetchLocations = useCallback(async (warehouseId: string) => {
    setLoadingLocations(true);
    try {
      const data = await warehousesService.getLocations(warehouseId);
      setLocations(data || []);
    } catch (err) {
      console.error('Lỗi tải vị trí kệ:', err);
      showNotify('error', 'Không thể tải danh sách vị trí kệ');
    } finally {
      setLoadingLocations(false);
    }
  }, []);

  const openLocationsDrawer = (wh: Warehouse) => {
    setActiveDrawerWarehouse(wh);
    setIsAddingLocation(false);
    setEditingLocation(null);
    setLocError('');
    fetchLocations(wh.id);
  };

  // Filter & Search Logic
  const filteredWarehouses = useMemo(() => {
    return warehouses.filter((wh) => {
      const q = search.trim().toLowerCase();
      const matchSearch =
        !q ||
        wh.name.toLowerCase().includes(q) ||
        wh.code.toLowerCase().includes(q) ||
        (wh.address && wh.address.toLowerCase().includes(q));

      const matchStatus =
        statusFilter === 'all' ||
        (statusFilter === 'active' && wh.is_active) ||
        (statusFilter === 'inactive' && !wh.is_active);

      return matchSearch && matchStatus;
    });
  }, [warehouses, search, statusFilter]);

  // Pagination
  const totalItems = filteredWarehouses.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const currentPage = Math.min(page, totalPages);
  const paginatedWarehouses = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredWarehouses.slice(start, start + pageSize);
  }, [filteredWarehouses, currentPage, pageSize]);

  // Handle Warehouse Modal
  const openCreateWarehouseModal = () => {
    setEditingWarehouse(null);
    setFormWhCode('');
    setFormWhName('');
    setFormWhAddress('');
    setFormWhManagerId('');
    setFormWhIsActive(true);
    setFormWhError('');
    setIsWarehouseModalOpen(true);
  };

  const openEditWarehouseModal = (wh: Warehouse) => {
    setEditingWarehouse(wh);
    setFormWhCode(wh.code);
    setFormWhName(wh.name);
    setFormWhAddress(wh.address || '');
    setFormWhManagerId(wh.manager_id || '');
    setFormWhIsActive(wh.is_active);
    setFormWhError('');
    setIsWarehouseModalOpen(true);
  };

  const handleSaveWarehouse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formWhName.trim() || !formWhCode.trim()) {
      setFormWhError('Vui lòng nhập đầy đủ mã và tên kho');
      return;
    }

    setSubmittingWh(true);
    setFormWhError('');

    try {
      const payload = {
        name: formWhName.trim(),
        code: formWhCode.trim().toUpperCase(),
        address: formWhAddress.trim() || undefined,
        manager_id: formWhManagerId || null,
        is_active: formWhIsActive,
      };

      if (editingWarehouse) {
        await warehousesService.update(editingWarehouse.id, payload);
        showNotify('success', `Đã cập nhật kho ${payload.name}`);
      } else {
        await warehousesService.create(payload);
        showNotify('success', `Đã thêm kho mới ${payload.name}`);
      }
      setIsWarehouseModalOpen(false);
      fetchWarehouses();
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Không thể lưu thông tin kho';
      setFormWhError(Array.isArray(msg) ? msg.join(', ') : msg);
    } finally {
      setSubmittingWh(false);
    }
  };

  // Handle Location Form
  const openCreateLocationForm = () => {
    setEditingLocation(null);
    setLocCode('');
    setLocName('');
    setLocDesc('');
    setLocError('');
    setIsAddingLocation(true);
  };

  const openEditLocationForm = (loc: WarehouseLocation) => {
    setEditingLocation(loc);
    setLocCode(loc.code);
    setLocName(loc.name);
    setLocDesc(loc.description || '');
    setLocError('');
    setIsAddingLocation(true);
  };

  const handleSaveLocation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeDrawerWarehouse) return;
    if (!locCode.trim() || !locName.trim()) {
      setLocError('Vui lòng nhập mã kệ và tên vị trí');
      return;
    }

    setSubmittingLoc(true);
    setLocError('');

    try {
      const payload = {
        code: locCode.trim().toUpperCase(),
        name: locName.trim(),
        description: locDesc.trim() || undefined,
      };

      if (editingLocation) {
        await warehousesService.updateLocation(editingLocation.id, payload);
        showNotify('success', `Đã cập nhật vị trí kệ ${payload.code}`);
      } else {
        await warehousesService.createLocation(activeDrawerWarehouse.id, payload);
        showNotify('success', `Đã thêm vị trí kệ mới ${payload.code}`);
      }

      setIsAddingLocation(false);
      fetchLocations(activeDrawerWarehouse.id);
      fetchWarehouses();
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Không thể lưu vị trí kệ';
      setLocError(Array.isArray(msg) ? msg.join(', ') : msg);
    } finally {
      setSubmittingLoc(false);
    }
  };

  // Handle Confirm Delete
  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      if (deleteTarget.type === 'warehouse') {
        await warehousesService.delete(deleteTarget.id);
        showNotify('success', `Đã xóa kho ${deleteTarget.name}`);
        if (activeDrawerWarehouse?.id === deleteTarget.id) {
          setActiveDrawerWarehouse(null);
        }
        fetchWarehouses();
      } else {
        await warehousesService.deleteLocation(deleteTarget.id);
        showNotify('success', `Đã xóa vị trí kệ ${deleteTarget.name}`);
        if (activeDrawerWarehouse) {
          fetchLocations(activeDrawerWarehouse.id);
          fetchWarehouses();
        }
      }
      setDeleteTarget(null);
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Không thể xóa mục này do còn dữ liệu phụ thuộc';
      showNotify('error', msg);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 px-6 sm:px-8 py-4 max-w-[1560px] w-full mx-auto space-y-3.5">

      {/* HEADER BAR */}
      <div className="shrink-0 flex items-center justify-between gap-4 pb-2 border-b border-slate-100 min-h-[52px]">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Tổ chức Kho hàng</h1>
          <p className="text-sm font-medium text-slate-500 mt-0.5">
            Quản lý mạng lưới chi nhánh kho, sức chứa và danh mục vị trí kệ phân khu
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={() => fetchWarehouses()}
            className="p-2.5 text-slate-500 hover:text-slate-800 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer"
            title="Làm mới dữ liệu từ server"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-slate-700' : ''}`} />
          </button>

          {isAdmin && (
            <button
              onClick={openCreateWarehouseModal}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#EE3D43] hover:bg-[#D9343A] text-white rounded-xl text-sm font-bold shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Thêm kho hàng</span>
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
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Tìm theo tên kho, mã kho hoặc địa chỉ..."
            className="w-full pl-10 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#EE3D43]/15 focus:border-slate-300 focus:bg-white transition-all"
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

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-sm font-medium text-slate-600">
          <button
            onClick={() => {
              setStatusFilter('all');
              setPage(1);
            }}
            className={`px-3 py-1.5 rounded-lg transition-all duration-150 active:scale-95 cursor-pointer ${
              statusFilter === 'all'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Tất cả ({warehouses.length})
          </button>
          <button
            onClick={() => {
              setStatusFilter('active');
              setPage(1);
            }}
            className={`px-3 py-1.5 rounded-lg transition-all duration-150 active:scale-95 cursor-pointer ${
              statusFilter === 'active'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Đang hoạt động ({warehouses.filter((w) => w.is_active).length})
          </button>
          <button
            onClick={() => {
              setStatusFilter('inactive');
              setPage(1);
            }}
            className={`px-3 py-1.5 rounded-lg transition-all duration-150 active:scale-95 cursor-pointer ${
              statusFilter === 'inactive'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Tạm dừng ({warehouses.filter((w) => !w.is_active).length})
          </button>
        </div>
      </div>

      {/* WAREHOUSES TABLE */}
      <div className="flex-1 min-h-[480px] bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col overflow-hidden">
        <div className="flex-1 min-h-0 overflow-auto">
          {loading && warehouses.length === 0 ? (
            <div className="py-24 flex flex-col items-center justify-center gap-3 text-slate-400 h-full">
              <Loader2 className="w-7 h-7 animate-spin text-slate-600" />
              <span className="text-sm font-medium">Đang tải danh sách kho hàng...</span>
            </div>
          ) : paginatedWarehouses.length === 0 ? (
            <div className="py-20 text-center text-slate-400 space-y-3 h-full flex flex-col items-center justify-center">
              <Building2 className="w-12 h-12 mx-auto text-slate-300 stroke-1" />
              <div className="text-base font-bold text-slate-800">Không tìm thấy kho hàng nào</div>
              <div className="text-sm text-slate-500">
                {search ? 'Thử thay đổi từ khóa tìm kiếm hoặc bộ lọc trạng thái.' : 'Bấm "+ Thêm kho hàng" để tạo kho mới.'}
              </div>
            </div>
          ) : (
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="sticky top-0 bg-slate-50 z-10 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-xs select-none shadow-2xs">
                  <th className="py-2.5 px-4 w-72">Kho hàng</th>
                  <th className="py-2.5 px-4 min-w-[200px]">Địa chỉ & Vị trí</th>
                  <th className="py-2.5 px-4 w-48">Quản lý / Thủ kho</th>
                  <th className="py-2.5 px-4 w-32 text-center">Vị trí kệ</th>
                  <th className="py-2.5 px-4 w-32 text-center">Trạng thái</th>
                  <th className="py-2.5 px-4 w-28 text-right whitespace-nowrap">Thao tác</th>
                </tr>
              </thead>
              <tbody key={`${currentPage}-${statusFilter}`} className="divide-y divide-slate-100 text-slate-700 animate-tab-enter">
              {paginatedWarehouses.map((wh) => (
                <tr
                  key={wh.id}
                  onClick={() => openLocationsDrawer(wh)}
                  className="hover:bg-slate-50/80 transition-colors group cursor-pointer"
                >
                    {/* Warehouse Info */}
                    <td className="py-2.5 px-4">
                      <div>
                        <div className="font-medium text-slate-800 group-hover:text-[#EE3D43] transition-colors text-sm line-clamp-1 leading-snug">
                          {wh.name}
                        </div>
                        <span className="font-mono text-xs text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200/80 inline-block mt-0.5">
                          {wh.code}
                        </span>
                      </div>
                    </td>

                    {/* Address */}
                    <td className="py-2.5 px-4 text-slate-600">
                      <div className="flex items-start gap-1.5">
                        <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                        <span className="line-clamp-1 text-sm">
                          {wh.address || <span className="text-slate-400 italic">Chưa cập nhật địa chỉ</span>}
                        </span>
                      </div>
                    </td>

                    {/* Manager */}
                    <td className="py-2.5 px-4 text-slate-700 whitespace-nowrap">
                      {wh.manager ? (
                        <div className="flex items-center gap-2">
                          <UserCheck className="w-4 h-4 text-[#EE3D43] shrink-0" />
                          <div>
                            <div className="font-medium text-slate-800 text-sm">
                              {wh.manager.display_name || wh.manager.username}
                            </div>
                            {wh.manager.phone && (
                              <div className="text-xs text-slate-400 font-medium">{wh.manager.phone}</div>
                            )}
                          </div>
                        </div>
                      ) : (
                        <span className="text-slate-400 text-sm italic">Chưa phân công</span>
                      )}
                    </td>

                    {/* Locations Count */}
                    <td className="py-2.5 px-4 text-center whitespace-nowrap">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg font-medium text-xs bg-slate-100 text-slate-700 border border-slate-200/80">
                        <Layers className="w-3.5 h-3.5 text-slate-500" />
                        <span>{wh.locations?.length || 0} vị trí</span>
                      </span>
                    </td>

                    {/* Active Status */}
                    <td className="py-2.5 px-4 text-center whitespace-nowrap">
                      {wh.is_active ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                          Hoạt động
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                          Tạm dừng
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td
                      className="py-2.5 px-4 text-right whitespace-nowrap"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="inline-flex items-center justify-end gap-1">
                        <button
                          onClick={() => openLocationsDrawer(wh)}
                          className="p-1.5 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                          title="Quản lý vị trí kệ"
                        >
                          <Layers className="w-4 h-4" />
                        </button>

                        {isAdmin && (
                          <>
                            <button
                              onClick={() => openEditWarehouseModal(wh)}
                              className="p-1.5 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                              title="Chỉnh sửa kho"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>

                            <button
                              onClick={() =>
                                setDeleteTarget({
                                  type: 'warehouse',
                                  id: wh.id,
                                  name: wh.name,
                                })
                              }
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                              title="Xóa kho"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Compact Pagination Bar */}
        <div className="px-5 py-2.5 border-t border-slate-200/80 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500">
          <div className="flex items-center gap-3">
            <span>
              Hiển thị <span className="font-semibold text-slate-800">{paginatedWarehouses.length}</span> / {totalItems} kho hàng
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
                <option value={10}>10</option>
                <option value={15}>15</option>
                <option value={30}>30</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-500 text-[11px]">
              Trang {currentPage} / {totalPages}
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={currentPage <= 1}
                className="p-1 border border-slate-200 bg-white rounded-md hover:bg-slate-50 text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                title="Trang trước"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage >= totalPages}
                className="p-1 border border-slate-200 bg-white rounded-md hover:bg-slate-50 text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                title="Trang tiếp"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* SLIDE-OVER DRAWER: QUẢN LÝ VỊ TRÍ KỆ HÀNG */}
      {activeDrawerWarehouse && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div
            onClick={() => setActiveDrawerWarehouse(null)}
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
          />

          <div className="fixed inset-y-0 right-0 pl-10 max-w-full flex">
            <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col border-l border-slate-200 animate-in slide-in-from-right duration-250">
              {/* Drawer Top Header */}
              <div className="p-5 border-b border-slate-100 bg-slate-50/60 flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                      {activeDrawerWarehouse.code}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      {locations.length} vị trí kệ
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-slate-900 mt-1">
                    {activeDrawerWarehouse.name}
                  </h3>
                  {activeDrawerWarehouse.address && (
                    <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                      <span className="line-clamp-1">{activeDrawerWarehouse.address}</span>
                    </p>
                  )}
                </div>
                <button
                  onClick={() => setActiveDrawerWarehouse(null)}
                  className="p-1 text-slate-400 hover:text-slate-600 hover:bg-white rounded-lg transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Drawer Body */}
              <div className="flex-1 p-5 space-y-4 overflow-y-auto text-xs">
                {/* Manager Card */}
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-brand-primary">
                      <UserCheck className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-400">Thủ kho phụ trách</div>
                      <div className="font-semibold text-slate-800 text-xs">
                        {activeDrawerWarehouse.manager?.display_name ||
                          activeDrawerWarehouse.manager?.username ||
                          'Chưa chỉ định'}
                      </div>
                    </div>
                  </div>
                  {activeDrawerWarehouse.manager?.phone && (
                    <span className="font-mono text-xs text-slate-500">
                      {activeDrawerWarehouse.manager.phone}
                    </span>
                  )}
                </div>

                {/* Locations Section Header */}
                <div className="flex items-center justify-between pt-2">
                  <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    Danh mục Vị trí / Kệ ({locations.length})
                  </div>
                  {isManagerOrAdmin && !isAddingLocation && (
                    <button
                      onClick={openCreateLocationForm}
                      className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-brand-primary bg-brand-light/70 hover:bg-brand-light rounded-lg transition-colors cursor-pointer border border-brand-primary/20"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Thêm vị trí</span>
                    </button>
                  )}
                </div>

                {/* Inline Add/Edit Location Form */}
                {isAddingLocation && (
                  <form
                    onSubmit={handleSaveLocation}
                    className="p-3.5 bg-brand-light/40 rounded-xl border border-brand-primary/20 space-y-3 animate-in fade-in duration-150"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-800 text-xs">
                        {editingLocation ? 'Sửa vị trí kệ' : 'Thêm vị trí kệ mới'}
                      </span>
                      <button
                        type="button"
                        onClick={() => setIsAddingLocation(false)}
                        className="text-slate-400 hover:text-slate-600"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {locError && (
                      <div className="p-2 rounded bg-rose-50 border border-rose-100 text-[11px] text-rose-600">
                        {locError}
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                          Mã vị trí / Kệ <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={locCode}
                          onChange={(e) => setLocCode(e.target.value)}
                          placeholder="VD: K-A1-01"
                          className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-mono uppercase focus:outline-none focus:border-slate-400"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                          Tên vị trí <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={locName}
                          onChange={(e) => setLocName(e.target.value)}
                          placeholder="VD: Kệ CPU tầng 1"
                          className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-slate-400"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                        Mô tả ghi chú
                      </label>
                      <input
                        type="text"
                        value={locDesc}
                        onChange={(e) => setLocDesc(e.target.value)}
                        placeholder="VD: Chứa hàng linh kiện nhỏ, nhiệt độ phòng"
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-slate-400"
                      />
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setIsAddingLocation(false)}
                        className="px-2.5 py-1 text-xs text-slate-600 hover:bg-slate-200/50 rounded-lg font-medium cursor-pointer"
                      >
                        Hủy
                      </button>
                      <button
                        type="submit"
                        disabled={submittingLoc}
                        className="px-3 py-1 bg-brand-primary text-white text-xs font-semibold rounded-lg hover:bg-brand-hover transition-colors cursor-pointer disabled:opacity-50"
                      >
                        {submittingLoc ? 'Đang lưu...' : editingLocation ? 'Lưu thay đổi' : 'Thêm kệ'}
                      </button>
                    </div>
                  </form>
                )}

                {/* Locations List */}
                {loadingLocations ? (
                  <div className="py-12 flex justify-center text-slate-400">
                    <Loader2 className="w-5 h-5 animate-spin" />
                  </div>
                ) : locations.length === 0 ? (
                  <div className="py-12 text-center text-slate-400 space-y-1">
                    <Layers className="w-8 h-8 mx-auto text-slate-300 stroke-1" />
                    <div className="text-xs font-medium text-slate-600">Kho này chưa có vị trí kệ nào</div>
                    <div className="text-[11px] text-slate-400">Nhấn "Thêm vị trí" để phân loại khu vực xếp hàng.</div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {locations.map((loc) => (
                      <div
                        key={loc.id}
                        className="p-3 bg-white rounded-xl border border-slate-200/90 shadow-2xs hover:border-slate-300 transition-colors flex items-start justify-between gap-3 group"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-800 border border-slate-200">
                              {loc.code}
                            </span>
                            <span className="font-semibold text-slate-900 text-xs">
                              {loc.name}
                            </span>
                          </div>
                          {loc.description && (
                            <p className="text-[11px] text-slate-500 leading-normal pl-0.5">
                              {loc.description}
                            </p>
                          )}
                        </div>

                        {isManagerOrAdmin && (
                          <div className="inline-flex items-center gap-0.5 shrink-0 opacity-80 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => openEditLocationForm(loc)}
                              className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md transition-colors cursor-pointer"
                              title="Sửa kệ"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() =>
                                setDeleteTarget({
                                  type: 'location',
                                  id: loc.id,
                                  name: `${loc.code} (${loc.name})`,
                                })
                              }
                              className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors cursor-pointer"
                              title="Xóa kệ"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Drawer Footer */}
              <div className="p-3.5 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
                <span className="text-[11px] text-slate-400">
                  ID: {activeDrawerWarehouse.id.substring(0, 8)}...
                </span>
                <button
                  onClick={() => setActiveDrawerWarehouse(null)}
                  className="px-3.5 py-1.5 border border-slate-200 bg-white text-slate-700 rounded-lg font-semibold hover:bg-slate-50 transition-colors cursor-pointer text-xs"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CREATE / EDIT WAREHOUSE MODAL */}
      {isWarehouseModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full border border-slate-100 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-brand-primary"></div>
                <h3 className="text-sm font-bold text-slate-900">
                  {editingWarehouse ? 'Chỉnh sửa thông tin kho hàng' : 'Thêm mới kho hàng vào hệ thống'}
                </h3>
              </div>
              <button
                onClick={() => setIsWarehouseModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveWarehouse} className="p-6 space-y-4 text-xs">
              {formWhError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-100 text-xs text-rose-700 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-rose-500" />
                  <span>{formWhError}</span>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Mã kho hàng <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formWhCode}
                    onChange={(e) => setFormWhCode(e.target.value)}
                    placeholder="VD: WH-HN-04"
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-medium text-slate-800 uppercase focus:outline-none focus:ring-1 focus:ring-slate-400 focus:bg-white transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Trạng thái hoạt động
                  </label>
                  <select
                    value={formWhIsActive ? 'active' : 'inactive'}
                    onChange={(e) => setFormWhIsActive(e.target.value === 'active')}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-400 focus:bg-white transition-all"
                  >
                    <option value="active">Đang hoạt động</option>
                    <option value="inactive">Tạm dừng vận hành</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Tên kho hàng <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formWhName}
                  onChange={(e) => setFormWhName(e.target.value)}
                  placeholder="VD: Kho Trung chuyển Bắc Ninh"
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-400 focus:bg-white transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Địa chỉ kho bãi
                </label>
                <input
                  type="text"
                  value={formWhAddress}
                  onChange={(e) => setFormWhAddress(e.target.value)}
                  placeholder="VD: Lô B4 KCN Tiên Sơn, Bắc Ninh"
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-400 focus:bg-white transition-all"
                />
              </div>

              {isAdmin && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Thủ kho / Quản lý phụ trách
                  </label>
                  <select
                    value={formWhManagerId}
                    onChange={(e) => setFormWhManagerId(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-400 focus:bg-white transition-all"
                  >
                    <option value="">-- Chưa chỉ định thủ kho --</option>
                    {managers.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.display_name || m.username} ({m.role}) {m.phone ? `- ${m.phone}` : ''}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsWarehouseModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl font-medium text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer text-xs"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={submittingWh}
                  className="inline-flex items-center gap-2 px-5 py-2 bg-brand-primary text-white text-xs font-semibold rounded-xl hover:bg-brand-hover shadow-xs transition-colors cursor-pointer disabled:opacity-50"
                >
                  {submittingWh && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{editingWarehouse ? 'Lưu thay đổi' : 'Tạo kho mới'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CUSTOM CONFIRM DELETE DIALOG */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
            <div className="w-10 h-10 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mb-3">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold text-slate-900">
              Xác nhận xóa {deleteTarget.type === 'warehouse' ? 'kho hàng' : 'vị trí kệ'}?
            </h4>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Bạn có chắc chắn muốn xóa <span className="font-semibold text-slate-800">{deleteTarget.name}</span>?
              {deleteTarget.type === 'warehouse'
                ? ' Các vị trí kệ thuộc kho này cũng sẽ bị xóa. Thao tác không thể hoàn tác.'
                : ' Thao tác này không thể hoàn tác.'}
            </p>
            <div className="flex items-center justify-end gap-2 mt-5">
              <button
                disabled={deleting}
                onClick={() => setDeleteTarget(null)}
                className="px-3.5 py-1.5 border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 text-xs font-medium cursor-pointer"
              >
                Hủy
              </button>
              <button
                disabled={deleting}
                onClick={handleConfirmDelete}
                className="px-4 py-1.5 bg-rose-600 text-white rounded-xl hover:bg-rose-700 text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {deleting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>Xóa dữ liệu</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

