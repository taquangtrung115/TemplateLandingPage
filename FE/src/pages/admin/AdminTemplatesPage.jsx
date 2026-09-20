import React, { useState, useEffect } from 'react';
import { 
  Plus, Edit3, Trash2, Layers, Search, Check, X, AlertCircle, Eye 
} from 'lucide-react';
import { templateApi } from '../../api/templateApi';
import LoadingSpinner from '../../components/LoadingSpinner';
import { DEFAULT_WEDDING_CONFIG } from '../../utils/defaultTemplates';

export default function AdminTemplatesPage() {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    category: 'Wedding',
    thumbnailUrl: '',
    previewUrl: '',
    defaultConfigJson: JSON.stringify(DEFAULT_WEDDING_CONFIG, null, 2),
    isActive: true,
  });
  const [jsonError, setJsonError] = useState(null);
  const [saving, setSaving] = useState(false);

  const fetchTemplates = async () => {
    setLoading(true);
    try {
      const data = await templateApi.getTemplates();
      setTemplates(data);
    } catch (err) {
      console.error('Failed to load templates:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  const openCreateModal = () => {
    setEditingTemplate(null);
    setFormData({
      name: '',
      slug: '',
      description: '',
      category: 'Wedding',
      thumbnailUrl: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=800&q=80',
      previewUrl: '',
      defaultConfigJson: JSON.stringify(DEFAULT_WEDDING_CONFIG, null, 2),
      isActive: true,
    });
    setJsonError(null);
    setModalOpen(true);
  };

  const openEditModal = (tmpl) => {
    setEditingTemplate(tmpl);
    setFormData({
      name: tmpl.name,
      slug: tmpl.slug,
      description: tmpl.description || '',
      category: tmpl.category,
      thumbnailUrl: tmpl.thumbnailUrl,
      previewUrl: tmpl.previewUrl || '',
      defaultConfigJson: typeof tmpl.defaultConfigJson === 'string'
        ? tmpl.defaultConfigJson
        : JSON.stringify(tmpl.defaultConfigJson, null, 2),
      isActive: tmpl.isActive,
    });
    setJsonError(null);
    setModalOpen(true);
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
      if (editingTemplate) {
        await templateApi.updateTemplate(editingTemplate.id, formData);
      } else {
        await templateApi.createTemplate(formData);
      }
      setModalOpen(false);
      fetchTemplates();
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
      setTemplates(prev => prev.filter(t => t.id !== id));
    } catch (err) {
      alert(err.message || 'Lỗi khi xóa template');
    }
  };

  const filteredTemplates = templates.filter(t =>
    t.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.category?.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
            Thêm mới, sửa JSON cấu hình mặc định và quản lý trạng thái các mẫu landing page.
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
          placeholder="Tìm kiếm mẫu theo tên hoặc danh mục..."
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
                  <th className="py-3 px-4">Danh Mục</th>
                  <th className="py-3 px-4">Slug</th>
                  <th className="py-3 px-4">Trạng Thái</th>
                  <th className="py-3 px-4">Ngày Tạo</th>
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
                        className="w-12 h-12 object-cover rounded-xl shadow-sm flex-shrink-0"
                      />
                      <div>
                        <span className="block text-sm">{tmpl.name}</span>
                        <span className="text-[11px] text-gray-400 font-normal line-clamp-1">{tmpl.description}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-50 text-rose-600">
                        {tmpl.category}
                      </span>
                    </td>
                    <td className="py-4 px-4 font-mono text-[11px] text-gray-500">{tmpl.slug}</td>
                    <td className="py-4 px-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        tmpl.isActive ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-100 text-gray-500'
                      }`}>
                        {tmpl.isActive ? 'Hoạt động' : 'Tạm ẩn'}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-gray-400">
                      {new Date(tmpl.createdAtUtc).toLocaleDateString('vi-VN')}
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
                          className="p-2 rounded-xl text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors"
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
          <div className="bg-white rounded-3xl border border-gray-100 shadow-2xl max-w-2xl w-full my-8 overflow-hidden">
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

            <form onSubmit={handleSave} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
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
                  <label className="block text-xs font-bold text-gray-700 mb-1">Danh Mục</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl text-xs"
                  >
                    <option value="Wedding">Đám cưới (Wedding)</option>
                    <option value="Birthday">Sinh nhật (Birthday)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Trạng Thái</label>
                  <div className="flex items-center gap-2 pt-2">
                    <input
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                      className="w-4 h-4 text-rose-600 rounded"
                    />
                    <span className="text-xs text-gray-700 font-semibold">Cho phép người dùng sử dụng</span>
                  </div>
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

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">URL Ảnh Thumbnail</label>
                <input
                  type="text"
                  required
                  value={formData.thumbnailUrl}
                  onChange={(e) => setFormData({ ...formData, thumbnailUrl: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl text-xs font-mono text-[11px]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Cấu hình JSON mặc định (DefaultConfigJson) *</label>
                <textarea
                  rows={10}
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
