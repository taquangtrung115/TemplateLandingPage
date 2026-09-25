import React, { useState, useEffect } from 'react';
import {
  Plus,
  Edit3,
  Trash2,
  Layers,
  Search,
  Check,
  X,
  AlertCircle,
  Eye,
  Music,
  Sparkles,
} from 'lucide-react';
import { templateApi } from '../../api/templateApi';
import categoryApi from '../../api/categoryApi';
import LoadingSpinner from '../../components/LoadingSpinner';
import { DEFAULT_WEDDING_CONFIG } from '../../utils/defaultTemplates';

export default function AdminTemplatesPage() {
  const [templates, setTemplates] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [loadingTemplateId, setLoadingTemplateId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    categoryId: '',
    category: 'Wedding',
    thumbnailUrl: '',
    previewUrl: '',
    longPreviewUrl: '',
    badge: 'Basic',
    audioUrl: '',
    musicTitle: '',
    defaultConfigJson: JSON.stringify(DEFAULT_WEDDING_CONFIG, null, 2),
    isActive: true,
  });
  const [jsonError, setJsonError] = useState(null);
  const [saving, setSaving] = useState(false);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const [templateData, catData] = await Promise.all([
        templateApi.getTemplates(),
        categoryApi.getCategories(),
      ]);
      setTemplates(Array.isArray(templateData) ? templateData : []);
      setCategories(Array.isArray(catData) ? catData : []);
    } catch (err) {
      console.error('Failed to load templates or categories:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  const openCreateModal = () => {
    setEditingTemplate(null);
    const defaultCat = categories.length > 0 ? categories[0] : null;
    setFormData({
      name: '',
      slug: '',
      description: '',
      categoryId: defaultCat ? defaultCat.id : '',
      category: defaultCat ? defaultCat.name : 'Wedding',
      thumbnailUrl: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=800&q=80',
      previewUrl: '',
      longPreviewUrl: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=800&q=80',
      badge: 'Basic',
      audioUrl: 'https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3',
      musicTitle: 'A Thousand Years - Piano Instrumental',
      defaultConfigJson: JSON.stringify(DEFAULT_WEDDING_CONFIG, null, 2),
      isActive: true,
    });
    setJsonError(null);
    setModalOpen(true);
  };

  const openEditModal = async (tmpl) => {
    if (loadingTemplateId) return;

    setLoadingTemplateId(tmpl.id);
    try {
      // Catalog rows intentionally omit the large JSON config; fetch the editable detail on demand.
      const detail = await templateApi.getTemplateById(tmpl.id);
      if (!detail || !detail.defaultConfigJson) {
        throw new Error('Không tải được cấu hình chi tiết của template');
      }

      setEditingTemplate(detail);
      setFormData({
        name: detail.name,
        slug: detail.slug,
        description: detail.description || '',
        categoryId: detail.categoryId || '',
        category: detail.category || 'Wedding',
        thumbnailUrl: detail.thumbnailUrl || '',
        previewUrl: detail.previewUrl || '',
        longPreviewUrl: detail.longPreviewUrl || '',
        badge: detail.badge || 'Basic',
        audioUrl: detail.audioUrl || '',
        musicTitle: detail.musicTitle || '',
        defaultConfigJson:
          typeof detail.defaultConfigJson === 'string'
            ? detail.defaultConfigJson
            : JSON.stringify(detail.defaultConfigJson, null, 2),
        isActive: detail.isActive,
      });
      setJsonError(null);
      setModalOpen(true);
    } catch (err) {
      alert(err.message || 'Lỗi khi tải chi tiết template');
    } finally {
      setLoadingTemplateId(null);
    }
  };

  const handleCategorySelect = (catId) => {
    const found = categories.find((c) => c.id === catId);
    if (found) {
      setFormData((prev) => ({
        ...prev,
        categoryId: found.id,
        category: found.name,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        categoryId: '',
      }));
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setJsonError(null);

    // Validate JSON format
    try {
      JSON.parse(formData.defaultConfigJson);
    } catch (err) {
      setJsonError('Cấu hình JSON không hợp lệ: ' + err.message);
      return;
    }

    setSaving(true);
    try {
      const payload = {
        ...formData,
        categoryId: formData.categoryId ? formData.categoryId : null,
        badge: formData.badge || null,
        longPreviewUrl: formData.longPreviewUrl?.trim() || null,
        audioUrl: formData.audioUrl?.trim() || null,
        musicTitle: formData.musicTitle?.trim() || null,
        previewUrl: formData.previewUrl?.trim() || `/preview/${formData.slug}`,
      };

      if (editingTemplate) {
        await templateApi.updateTemplate(editingTemplate.id, payload);
      } else {
        await templateApi.createTemplate(payload);
      }
      setModalOpen(false);
      const updated = await templateApi.getTemplates();
      setTemplates(Array.isArray(updated) ? updated : []);
    } catch (err) {
      alert(err.message || 'Lỗi khi lưu master template');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa master template này?')) return;
    try {
      await templateApi.deleteTemplate(id);
      setTemplates((prev) => prev.filter((t) => t.id !== id));
    } catch (err) {
      alert(err.message || 'Lỗi khi xóa template');
    }
  };

  const filteredTemplates = templates.filter(
    (t) =>
      t.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.badge?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getBadgeStyle = (badge) => {
    switch (badge?.toLowerCase()) {
      case 'free':
        return 'bg-gray-100 text-gray-700 border-gray-200';
      case 'basic':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'premium':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'hot':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'new':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      default:
        return 'bg-rose-50 text-rose-700 border-rose-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 flex items-center gap-2">
            <Layers className="w-6 h-6 text-rose-600" />
            <span>Quản Lý Master Templates</span>
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Quản lý mẫu thiệp Cinelove: ảnh cuộn mockup dọc, nhạc nền preview, phân loại danh mục và huy hiệu gói.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-rose-600 text-white text-xs font-bold shadow-md hover:bg-rose-700 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Thêm Mẫu Mới</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-3 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-2 max-w-md">
        <Search className="w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Tìm kiếm theo tên mẫu, danh mục hoặc gói..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full text-xs outline-none bg-transparent"
        />
      </div>

      {/* Table */}
      {loading ? (
        <div className="py-20 flex justify-center">
          <LoadingSpinner size="lg" message="Đang nạp danh sách mẫu..." />
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-gray-600">
              <thead className="bg-gray-50 uppercase font-bold text-gray-400 tracking-wider">
                <tr>
                  <th className="py-3 px-6">Mẫu Giao Diện</th>
                  <th className="py-3 px-4">Gói / Badge</th>
                  <th className="py-3 px-4">Danh Mục</th>
                  <th className="py-3 px-4">Nhạc Nền</th>
                  <th className="py-3 px-4">Trạng Thái</th>
                  <th className="py-3 px-6 text-right">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredTemplates.map((tmpl) => (
                  <tr key={tmpl.id} className="hover:bg-gray-50/50">
                    <td className="py-4 px-6 font-bold text-gray-900 flex items-center gap-3">
                      <img
                        src={tmpl.thumbnailUrl}
                        alt={tmpl.name}
                        className="w-12 h-14 object-cover rounded-xl shadow-sm flex-shrink-0 border border-gray-200"
                      />
                      <div>
                        <span className="block text-sm font-bold text-gray-900">{tmpl.name}</span>
                        <span className="text-[11px] font-mono text-gray-400">{tmpl.slug}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      {tmpl.badge ? (
                        <span
                          className={`inline-flex px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase border ${getBadgeStyle(
                            tmpl.badge
                          )}`}
                        >
                          {tmpl.badge}
                        </span>
                      ) : (
                        <span className="text-gray-300">—</span>
                      )}
                    </td>
                    <td className="py-4 px-4">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-50 text-rose-600 border border-rose-100">
                        {tmpl.category}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      {tmpl.audioUrl ? (
                        <div className="flex items-center gap-1.5 text-xs text-gray-700 max-w-[180px]">
                          <Music className="w-3.5 h-3.5 text-rose-500 flex-shrink-0" />
                          <span className="truncate text-[11px]" title={tmpl.musicTitle || tmpl.audioUrl}>
                            {tmpl.musicTitle || 'Âm thanh đính kèm'}
                          </span>
                        </div>
                      ) : (
                        <span className="text-gray-300 text-[11px]">Chưa có nhạc</span>
                      )}
                    </td>
                    <td className="py-4 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          tmpl.isActive
                            ? 'bg-emerald-50 text-emerald-600'
                            : 'bg-gray-100 text-gray-500'
                        }`}
                      >
                        {tmpl.isActive ? 'Hoạt động' : 'Tạm ẩn'}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <a
                          href={`/preview/${tmpl.id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 rounded-xl text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors"
                          title="Xem trang mẫu"
                        >
                          <Eye className="w-4 h-4" />
                        </a>
                        <button
                          onClick={() => openEditModal(tmpl)}
                          disabled={loadingTemplateId !== null}
                          className="p-2 rounded-xl text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-wait"
                          title="Chỉnh sửa mẫu & JSON"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(tmpl.id)}
                          className="p-2 rounded-xl text-gray-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                          title="Xóa mẫu"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create / Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl border border-gray-100 shadow-2xl max-w-3xl w-full my-8 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-bold text-gray-900 text-base">
                {editingTemplate ? 'Chỉnh Sửa Master Template' : 'Thêm Mẫu Mới'}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1 rounded-xl text-gray-400 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              {jsonError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 flex items-center gap-2 text-rose-700 text-xs">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{jsonError}</span>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Tên Mẫu *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl text-xs"
                    placeholder="Elegance Blossom"
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
                    placeholder="elegance-blossom"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Danh Mục Động *</label>
                  <select
                    value={formData.categoryId}
                    onChange={(e) => handleCategorySelect(e.target.value)}
                    className="w-full px-3 py-2 border rounded-xl text-xs"
                  >
                    <option value="">-- Chọn danh mục --</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Gói / Badge</label>
                  <select
                    value={formData.badge}
                    onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl text-xs"
                  >
                    <option value="Free">Miễn phí (Free)</option>
                    <option value="Basic">Tiêu chuẩn (Basic)</option>
                    <option value="Premium">Cao cấp (Premium)</option>
                    <option value="Hot">Nổi bật (Hot)</option>
                    <option value="New">Mới nhất (New)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Mô tả ngắn</label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl text-xs"
                  placeholder="Mô tả phong cách và điểm nổi bật của mẫu thiệp này..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">URL Ảnh Thumbnail *</label>
                  <input
                    type="text"
                    required
                    value={formData.thumbnailUrl}
                    onChange={(e) => setFormData({ ...formData, thumbnailUrl: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl text-xs font-mono text-[11px]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    URL Ảnh Mockup Dài (Cuộn Animation)
                  </label>
                  <input
                    type="text"
                    value={formData.longPreviewUrl}
                    onChange={(e) => setFormData({ ...formData, longPreviewUrl: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl text-xs font-mono text-[11px]"
                    placeholder="URL ảnh dọc dài để tạo hiệu ứng auto-scroll trên card..."
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">URL File Nhạc Preview (Audio)</label>
                  <input
                    type="text"
                    value={formData.audioUrl}
                    onChange={(e) => setFormData({ ...formData, audioUrl: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl text-xs font-mono text-[11px]"
                    placeholder="https://.../music.mp3"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Tên Bài Hát (Music Title)</label>
                  <input
                    type="text"
                    value={formData.musicTitle}
                    onChange={(e) => setFormData({ ...formData, musicTitle: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl text-xs"
                    placeholder="A Thousand Years - Piano Instrumental"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="tmplIsActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="w-4 h-4 text-rose-600 rounded"
                />
                <label htmlFor="tmplIsActive" className="text-xs text-gray-700 font-semibold cursor-pointer">
                  Cho phép người dùng nhìn thấy và sử dụng mẫu này
                </label>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Cấu hình JSON mặc định (DefaultConfigJson) *
                </label>
                <textarea
                  rows={8}
                  required
                  value={formData.defaultConfigJson}
                  onChange={(e) => setFormData({ ...formData, defaultConfigJson: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl text-xs font-mono bg-gray-900 text-green-400 focus:outline-none"
                />
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
                  {saving ? 'Đang lưu...' : 'Lưu Template'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
