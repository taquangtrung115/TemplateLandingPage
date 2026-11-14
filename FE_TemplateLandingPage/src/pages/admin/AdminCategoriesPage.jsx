import React, { useState, useEffect } from 'react';
import {
  FolderTree,
  Plus,
  Edit3,
  Trash2,
  Search,
  Check,
  X,
  Sparkles,
  Layers,
  AlertCircle,
} from 'lucide-react';
import categoryApi from '../../api/categoryApi';
import LoadingSpinner from '../../components/LoadingSpinner';
import { resolveIcon } from '../../utils/iconResolver';

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    icon: 'Heart',
    orderIndex: 0,
    isActive: true,
  });
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const data = await categoryApi.getCategories();
      setCategories(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load categories:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const generateSlug = (text) => {
    return text
      .toString()
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[đĐ]/g, 'd')
      .replace(/[^a-z0-9\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
  };

  const handleNameChange = (e) => {
    const val = e.target.value;
    if (!editingCategory) {
      setFormData((prev) => ({
        ...prev,
        name: val,
        slug: generateSlug(val),
      }));
    } else {
      setFormData((prev) => ({ ...prev, name: val }));
    }
  };

  const openCreateModal = () => {
    setEditingCategory(null);
    setErrorMessage(null);
    setFormData({
      name: '',
      slug: '',
      description: '',
      icon: 'Heart',
      orderIndex: categories.length + 1,
      isActive: true,
    });
    setModalOpen(true);
  };

  const openEditModal = (cat) => {
    setEditingCategory(cat);
    setErrorMessage(null);
    setFormData({
      name: cat.name,
      slug: cat.slug,
      description: cat.description || '',
      icon: cat.icon || 'Heart',
      orderIndex: cat.orderIndex,
      isActive: cat.isActive,
    });
    setModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setErrorMessage(null);
    setSaving(true);
    try {
      if (editingCategory) {
        await categoryApi.updateCategory(editingCategory.id, formData);
      } else {
        await categoryApi.createCategory(formData);
      }
      setModalOpen(false);
      fetchCategories();
    } catch (err) {
      setErrorMessage(err.message || 'Lỗi khi lưu danh mục');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa danh mục này?')) return;
    try {
      await categoryApi.deleteCategory(id);
      setCategories((prev) => prev.filter((c) => c.id !== id));
    } catch (err) {
      alert(err.message || 'Lỗi khi xóa danh mục');
    }
  };

  const filteredCategories = categories.filter(
    (c) =>
      c.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.slug?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 flex items-center gap-2">
            <FolderTree className="w-6 h-6 text-rose-600" />
            <span>Quản Lý Danh Mục Thiệp</span>
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Quản lý các danh mục phân loại mẫu thiệp cưới, sinh nhật, kỷ niệm, thôi nôi...
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-rose-600 text-white text-xs font-bold shadow-md hover:bg-rose-700 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Thêm Danh Mục</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-3 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-2 max-w-md">
        <Search className="w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Tìm kiếm danh mục theo tên hoặc slug..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full text-xs outline-none bg-transparent"
        />
      </div>

      {/* Table */}
      {loading ? (
        <div className="py-20 flex justify-center">
          <LoadingSpinner size="lg" message="Đang nạp danh mục..." />
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-gray-600">
              <thead className="bg-gray-50 uppercase font-bold text-gray-400 tracking-wider">
                <tr>
                  <th className="py-3 px-6">Danh Mục</th>
                  <th className="py-3 px-4">Slug</th>
                  <th className="py-3 px-4 text-center">Thứ Tự</th>
                  <th className="py-3 px-4 text-center">Mẫu Sử Dụng</th>
                  <th className="py-3 px-4">Trạng Thái</th>
                  <th className="py-3 px-6 text-right">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredCategories.map((cat) => {
                  const IconComponent = resolveIcon(cat.icon, Sparkles);
                  return (
                    <tr key={cat.id} className="hover:bg-gray-50/50">
                      <td className="py-4 px-6 font-bold text-gray-900 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center flex-shrink-0 border border-rose-100">
                          <IconComponent className="w-5 h-5" />
                        </div>
                        <div>
                          <span className="block text-sm">{cat.name}</span>
                          <span className="text-[11px] text-gray-400 font-normal line-clamp-1">
                            {cat.description || 'Chưa có mô tả'}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-4 font-mono text-[11px] text-gray-500">{cat.slug}</td>
                      <td className="py-4 px-4 text-center font-bold text-gray-700">{cat.orderIndex}</td>
                      <td className="py-4 px-4 text-center">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-gray-100 text-gray-700">
                          <Layers className="w-3 h-3 text-gray-400" />
                          {cat.templateCount}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                            cat.isActive
                              ? 'bg-emerald-50 text-emerald-600'
                              : 'bg-gray-100 text-gray-500'
                          }`}
                        >
                          {cat.isActive ? 'Hoạt động' : 'Tạm ẩn'}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openEditModal(cat)}
                            className="p-2 rounded-xl text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors"
                            title="Chỉnh sửa danh mục"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(cat.id)}
                            className="p-2 rounded-xl text-gray-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                            title="Xóa danh mục"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal Thêm / Sửa Danh Mục */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl border border-gray-100 shadow-2xl max-w-lg w-full my-8 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-bold text-gray-900 text-base">
                {editingCategory ? 'Chỉnh Sửa Danh Mục' : 'Thêm Danh Mục Mới'}
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
                  <label className="block text-xs font-bold text-gray-700 mb-1">Tên Danh Mục *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={handleNameChange}
                    className="w-full px-3 py-2 border rounded-xl text-xs"
                    placeholder="Lễ Đính Hôn"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Slug *</label>
                  <input
                    type="text"
                    required
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl text-xs font-mono"
                    placeholder="engagement"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Biểu Tượng (Lucide Icon)
                  </label>
                  <input
                    type="text"
                    value={formData.icon}
                    onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl text-xs"
                    placeholder="Heart, Cake, Ring, Sparkles..."
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Thứ Tự Hiển Thị</label>
                  <input
                    type="number"
                    value={formData.orderIndex}
                    onChange={(e) =>
                      setFormData({ ...formData, orderIndex: parseInt(e.target.value) || 0 })
                    }
                    className="w-full px-3 py-2 border rounded-xl text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Mô tả ngắn</label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl text-xs"
                  placeholder="Mô tả phong cách và đối tượng của danh mục này..."
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="categoryIsActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="w-4 h-4 text-rose-600 rounded"
                />
                <label htmlFor="categoryIsActive" className="text-xs text-gray-700 font-semibold cursor-pointer">
                  Kích hoạt hiển thị cho người dùng
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
                  {saving ? 'Đang lưu...' : 'Lưu Danh Mục'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
