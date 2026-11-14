import React, { useState, useEffect } from 'react';
import {
  Compass,
  Plus,
  Edit3,
  Trash2,
  ChevronRight,
  ExternalLink,
  Sparkles,
  AlertCircle,
  X,
} from 'lucide-react';
import navigationMenuApi from '../../api/navigationMenuApi';
import LoadingSpinner from '../../components/LoadingSpinner';
import { resolveIcon } from '../../utils/iconResolver';

export default function AdminMenusPage() {
  const [menus, setMenus] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingMenu, setEditingMenu] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    url: '',
    parentId: null,
    orderIndex: 0,
    target: '_self',
    badge: '',
    badgeColor: 'rose',
    icon: 'Sparkles',
    isActive: true,
  });
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  const fetchMenus = async () => {
    setLoading(true);
    try {
      const data = await navigationMenuApi.getMenus();
      setMenus(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load navigation menus:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMenus();
  }, []);

  const openCreateModal = (parentId = null) => {
    setEditingMenu(null);
    setErrorMessage(null);
    setFormData({
      title: '',
      url: '',
      parentId: parentId,
      orderIndex: menus.length + 1,
      target: '_self',
      badge: '',
      badgeColor: 'rose',
      icon: 'Sparkles',
      isActive: true,
    });
    setModalOpen(true);
  };

  const openEditModal = (menu) => {
    setEditingMenu(menu);
    setErrorMessage(null);
    setFormData({
      title: menu.title,
      url: menu.url,
      parentId: menu.parentId || null,
      orderIndex: menu.orderIndex,
      target: menu.target || '_self',
      badge: menu.badge || '',
      badgeColor: menu.badgeColor || 'rose',
      icon: menu.icon || 'Sparkles',
      isActive: menu.isActive,
    });
    setModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setErrorMessage(null);
    setSaving(true);
    try {
      const payload = {
        ...formData,
        badge: formData.badge?.trim() || null,
        badgeColor: formData.badge ? formData.badgeColor : null,
        icon: formData.icon?.trim() || null,
        parentId: formData.parentId ? formData.parentId : null,
      };

      if (editingMenu) {
        await navigationMenuApi.updateMenu(editingMenu.id, payload);
      } else {
        await navigationMenuApi.createMenu(payload);
      }
      setModalOpen(false);
      fetchMenus();
    } catch (err) {
      setErrorMessage(err.message || 'Lỗi khi lưu menu');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa menu này?')) return;
    try {
      await navigationMenuApi.deleteMenu(id);
      fetchMenus();
    } catch (err) {
      alert(err.message || 'Lỗi khi xóa menu');
    }
  };

  const getBadgeStyle = (color) => {
    switch (color?.toLowerCase()) {
      case 'rose':
        return 'bg-rose-100 text-rose-700 border-rose-200';
      case 'blue':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'purple':
        return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'amber':
        return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'emerald':
        return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  // Root menu list for parent selection (exclude currently edited menu to avoid self-parent)
  const rootMenuItems = menus.filter((m) => !editingMenu || m.id !== editingMenu.id);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 flex items-center gap-2">
            <Compass className="w-6 h-6 text-rose-600" />
            <span>Quản Lý Navigation Menu Động</span>
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Cấu hình các liên kết điều hướng trên thanh Navbar, hỗ trợ menu cha & submenu phân cấp dạng cây.
          </p>
        </div>

        <button
          onClick={() => openCreateModal(null)}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-rose-600 text-white text-xs font-bold shadow-md hover:bg-rose-700 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Thêm Menu Gốc</span>
        </button>
      </div>

      {/* Hierarchical Table */}
      {loading ? (
        <div className="py-20 flex justify-center">
          <LoadingSpinner size="lg" message="Đang nạp hệ thống menu..." />
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-gray-600">
              <thead className="bg-gray-50 uppercase font-bold text-gray-400 tracking-wider">
                <tr>
                  <th className="py-3 px-6">Menu & Đường Dẫn</th>
                  <th className="py-3 px-4">Biểu Tượng</th>
                  <th className="py-3 px-4">Huy Hiệu (Badge)</th>
                  <th className="py-3 px-4 text-center">Thứ Tự</th>
                  <th className="py-3 px-4">Target</th>
                  <th className="py-3 px-4">Trạng Thái</th>
                  <th className="py-3 px-6 text-right">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {menus.map((root) => {
                  const RootIcon = resolveIcon(root.icon, Sparkles);
                  const hasSub = root.subMenus && root.subMenus.length > 0;

                  return (
                    <React.Fragment key={root.id}>
                      {/* Root Item Row */}
                      <tr className="hover:bg-gray-50/70 font-semibold bg-gray-50/20">
                        <td className="py-3.5 px-6">
                          <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center flex-shrink-0">
                              <RootIcon className="w-4 h-4" />
                            </div>
                            <div>
                              <span className="font-bold text-gray-900 block text-xs">{root.title}</span>
                              <span className="text-[11px] font-mono text-gray-400">{root.url}</span>
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 font-mono text-[11px] text-gray-500">
                          {root.icon || '—'}
                        </td>
                        <td className="py-3.5 px-4">
                          {root.badge ? (
                            <span
                              className={`inline-flex px-2 py-0.5 rounded-full text-[9px] font-bold border uppercase ${getBadgeStyle(
                                root.badgeColor
                              )}`}
                            >
                              {root.badge}
                            </span>
                          ) : (
                            <span className="text-gray-300">—</span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-center font-bold text-gray-700">{root.orderIndex}</td>
                        <td className="py-3.5 px-4 font-mono text-[11px] text-gray-500">{root.target}</td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                              root.isActive
                                ? 'bg-emerald-50 text-emerald-600'
                                : 'bg-gray-100 text-gray-500'
                            }`}
                          >
                            {root.isActive ? 'Hoạt động' : 'Tạm ẩn'}
                          </span>
                        </td>
                        <td className="py-3.5 px-6 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => openCreateModal(root.id)}
                              className="px-2.5 py-1.5 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors flex items-center gap-1"
                              title="Thêm menu con"
                            >
                              <Plus className="w-3.5 h-3.5" />
                              <span className="hidden sm:inline">Menu con</span>
                            </button>
                            <button
                              onClick={() => openEditModal(root)}
                              className="p-1.5 rounded-xl text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors"
                              title="Chỉnh sửa menu"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(root.id)}
                              className="p-1.5 rounded-xl text-gray-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                              title="Xóa menu"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>

                      {/* Submenus Rows */}
                      {hasSub &&
                        root.subMenus.map((sub) => {
                          const SubIcon = resolveIcon(sub.icon, Sparkles);
                          return (
                            <tr key={sub.id} className="hover:bg-gray-50/50 bg-white">
                              <td className="py-3 px-6 pl-14">
                                <div className="flex items-center gap-2">
                                  <ChevronRight className="w-3.5 h-3.5 text-gray-300 flex-shrink-0" />
                                  <div className="w-6 h-6 rounded-md bg-gray-100 text-gray-600 flex items-center justify-center flex-shrink-0">
                                    <SubIcon className="w-3 h-3" />
                                  </div>
                                  <div>
                                    <span className="font-semibold text-gray-800 block text-xs">{sub.title}</span>
                                    <span className="text-[10px] font-mono text-gray-400">{sub.url}</span>
                                  </div>
                                </div>
                              </td>
                              <td className="py-3 px-4 font-mono text-[11px] text-gray-400">
                                {sub.icon || '—'}
                              </td>
                              <td className="py-3 px-4">
                                {sub.badge ? (
                                  <span
                                    className={`inline-flex px-2 py-0.5 rounded-full text-[9px] font-bold border uppercase ${getBadgeStyle(
                                      sub.badgeColor
                                    )}`}
                                  >
                                    {sub.badge}
                                  </span>
                                ) : (
                                  <span className="text-gray-300">—</span>
                                )}
                              </td>
                              <td className="py-3 px-4 text-center text-gray-600">{sub.orderIndex}</td>
                              <td className="py-3 px-4 font-mono text-[11px] text-gray-400">{sub.target}</td>
                              <td className="py-3 px-4">
                                <span
                                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                    sub.isActive
                                      ? 'bg-emerald-50 text-emerald-600'
                                      : 'bg-gray-100 text-gray-500'
                                  }`}
                                >
                                  {sub.isActive ? 'Bật' : 'Tắt'}
                                </span>
                              </td>
                              <td className="py-3 px-6 text-right">
                                <div className="flex items-center justify-end gap-1.5">
                                  <button
                                    onClick={() => openEditModal(sub)}
                                    className="p-1.5 rounded-xl text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors"
                                    title="Chỉnh sửa menu con"
                                  >
                                    <Edit3 className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={() => handleDelete(sub.id)}
                                    className="p-1.5 rounded-xl text-gray-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                                    title="Xóa menu con"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal Thêm / Chỉnh Sửa Menu */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl border border-gray-100 shadow-2xl max-w-lg w-full my-8 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-bold text-gray-900 text-base">
                {editingMenu ? 'Chỉnh Sửa Menu' : 'Thêm Menu Mới'}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1 rounded-xl text-gray-400 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4">
              {errorMessage && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 flex items-center gap-2 text-rose-700 text-xs">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Tiêu Đề Menu *</label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl text-xs"
                    placeholder="Kho Mẫu Thiệp"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Menu Cha (Cấp trên)</label>
                  <select
                    value={formData.parentId || ''}
                    onChange={(e) =>
                      setFormData({ ...formData, parentId: e.target.value ? e.target.value : null })
                    }
                    className="w-full px-3 py-2 border rounded-xl text-xs"
                  >
                    <option value="">-- Là Menu Gốc (Không có cha) --</option>
                    {rootMenuItems.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.title}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Đường Dẫn (URL) *</label>
                <input
                  type="text"
                  required
                  value={formData.url}
                  onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl text-xs font-mono"
                  placeholder="/templates hoặc https://example.com"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Thứ Tự</label>
                  <input
                    type="number"
                    value={formData.orderIndex}
                    onChange={(e) =>
                      setFormData({ ...formData, orderIndex: parseInt(e.target.value) || 0 })
                    }
                    className="w-full px-3 py-2 border rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Icon (Lucide)</label>
                  <input
                    type="text"
                    value={formData.icon}
                    onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl text-xs"
                    placeholder="Heart, Ring..."
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Target</label>
                  <select
                    value={formData.target}
                    onChange={(e) => setFormData({ ...formData, target: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl text-xs"
                  >
                    <option value="_self">_self (Hiện tại)</option>
                    <option value="_blank">_blank (Tab mới)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Huy Hiệu (Badge)</label>
                  <input
                    type="text"
                    value={formData.badge}
                    onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl text-xs"
                    placeholder="HOT, NEW, PRO..."
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Màu Huy Hiệu</label>
                  <select
                    value={formData.badgeColor}
                    onChange={(e) => setFormData({ ...formData, badgeColor: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl text-xs"
                  >
                    <option value="rose">Hồng / Đỏ (Rose)</option>
                    <option value="blue">Xanh Dương (Blue)</option>
                    <option value="purple">Tím (Purple)</option>
                    <option value="amber">Vàng Cam (Amber)</option>
                    <option value="emerald">Xanh Lá (Emerald)</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="menuIsActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="w-4 h-4 text-rose-600 rounded"
                />
                <label htmlFor="menuIsActive" className="text-xs text-gray-700 font-semibold cursor-pointer">
                  Kích hoạt hiển thị trên Navbar
                </label>
              </div>

              <div className="pt-4 border-t border-gray-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-gray-200 text-xs font-semibold text-gray-600 hover:bg-gray-50"
                >
                  Hủy Bỏ
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 rounded-xl bg-rose-600 text-white text-xs font-bold hover:bg-rose-700 disabled:opacity-50"
                >
                  {saving ? 'Đang lưu...' : 'Lưu Menu'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
