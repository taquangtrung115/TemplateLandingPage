import { useState } from 'react';
import { Plus, Edit2, Trash2, AlertCircle, PackageSearch } from 'lucide-react';
import { useProducts } from '../hooks/useProducts';
import LoadingSpinner from '../components/LoadingSpinner';
import Modal from '../components/Modal';
import { formatCurrency, formatDate } from '../utils/formatters';

export default function ProductsPage() {
  const { products, isLoading, error, createProduct, updateProduct, deleteProduct } = useProducts();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);

  const [currentProduct, setCurrentProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    isActive: true,
  });

  const handleOpenCreateModal = () => {
    setCurrentProduct(null);
    setFormData({ name: '', description: '', price: '', isActive: true });
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (product) => {
    setCurrentProduct(product);
    setFormData({
      name: product.name,
      description: product.description || '',
      price: product.price.toString(),
      isActive: product.isActive,
    });
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleOpenDeleteModal = (product) => {
    setCurrentProduct(product);
    setFormError(null);
    setIsDeleteModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);

    const priceNum = parseFloat(formData.price);
    if (!formData.name.trim()) {
      setFormError('Tên sản phẩm không được để trống.');
      return;
    }
    if (isNaN(priceNum) || priceNum <= 0) {
      setFormError('Giá sản phẩm phải lớn hơn 0.');
      return;
    }

    setIsSubmitting(true);

    let res;
    if (currentProduct) {
      res = await updateProduct(currentProduct.id, {
        name: formData.name.trim(),
        description: formData.description.trim() || null,
        price: priceNum,
        isActive: formData.isActive,
      });
    } else {
      res = await createProduct({
        name: formData.name.trim(),
        description: formData.description.trim() || null,
        price: priceNum,
      });
    }

    setIsSubmitting(false);

    if (res.success) {
      setIsModalOpen(false);
    } else {
      setFormError(res.error);
    }
  };

  const handleDelete = async () => {
    if (!currentProduct) return;
    setIsSubmitting(true);
    setFormError(null);

    const res = await deleteProduct(currentProduct.id);
    setIsSubmitting(false);

    if (res.success) {
      setIsDeleteModalOpen(false);
      setCurrentProduct(null);
    } else {
      setFormError(res.error);
    }
  };

  return (
    <div className="space-y-8 py-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Quản lý Sản phẩm</h1>
          <p className="text-gray-500 text-sm mt-1">Danh sách sản phẩm được đồng bộ với Backend API (.NET 10 CQRS).</p>
        </div>
        <button
          onClick={handleOpenCreateModal}
          className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-indigo-600 text-white font-medium hover:bg-indigo-700 shadow-md hover:shadow-indigo-500/20 transition"
        >
          <Plus className="w-5 h-5" />
          <span>Thêm sản phẩm</span>
        </button>
      </div>

      {/* Global Error Banner */}
      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 flex items-start space-x-3">
          <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
          <div className="text-sm">
            <p className="font-semibold">Lỗi tải dữ liệu</p>
            <p className="mt-0.5">{error}</p>
          </div>
        </div>
      )}

      {/* Content */}
      {isLoading ? (
        <LoadingSpinner text="Đang tải danh sách sản phẩm..." />
      ) : products.length === 0 ? (
        /* Empty State */
        <div className="text-center py-16 px-4 bg-white rounded-2xl border border-gray-100 shadow-sm space-y-4">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-500">
            <PackageSearch className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Chưa có sản phẩm nào</h3>
          <p className="text-gray-500 max-w-md mx-auto text-sm">
            Hãy tạo sản phẩm mới để trải nghiệm quy trình Command & Query trong kiến trúc Clean Architecture!
          </p>
          <button
            onClick={handleOpenCreateModal}
            className="inline-flex items-center space-x-2 px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition"
          >
            <Plus className="w-4 h-4" />
            <span>Tạo sản phẩm đầu tiên</span>
          </button>
        </div>
      ) : (
        /* Product Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <div
              key={product.id}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition p-6 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-bold text-lg text-gray-900 line-clamp-1">{product.name}</h3>
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      product.isActive
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {product.isActive ? 'Đang bán' : 'Tạm dừng'}
                  </span>
                </div>
                <p className="text-sm text-gray-500 line-clamp-2 min-h-[40px]">
                  {product.description || 'Không có mô tả cho sản phẩm này.'}
                </p>
                <div className="pt-2">
                  <span className="text-2xl font-extrabold text-indigo-600">
                    {formatCurrency(product.price)}
                  </span>
                </div>
              </div>

              <div className="pt-6 mt-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-400">
                <span>{formatDate(product.createdAtUtc)}</span>
                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => handleOpenEditModal(product)}
                    className="p-1.5 rounded-lg text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 transition"
                    title="Chỉnh sửa"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleOpenDeleteModal(product)}
                    className="p-1.5 rounded-lg text-gray-500 hover:text-red-600 hover:bg-red-50 transition"
                    title="Xóa"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create / Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => !isSubmitting && setIsModalOpen(false)}
        title={currentProduct ? 'Chỉnh sửa Sản phẩm' : 'Thêm Sản phẩm Mới'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {formError && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tên sản phẩm *</label>
            <input
              type="text"
              required
              maxLength={200}
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="VD: Bàn phím cơ không dây"
              className="w-full px-3.5 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Giá ($) *</label>
            <input
              type="number"
              step="0.01"
              min="0.01"
              required
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              placeholder="VD: 49.99"
              className="w-full px-3.5 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả</label>
            <textarea
              rows={3}
              maxLength={1000}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Nhập mô tả chi tiết sản phẩm..."
              className="w-full px-3.5 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
            />
          </div>

          {currentProduct && (
            <div className="flex items-center space-x-2 pt-2">
              <input
                type="checkbox"
                id="isActive"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="w-4 h-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500"
              />
              <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
                Kích hoạt bán sản phẩm này
              </label>
            </div>
          )}

          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-xl transition"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition shadow-sm disabled:opacity-50 flex items-center space-x-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Đang lưu...</span>
                </>
              ) : (
                <span>{currentProduct ? 'Cập nhật' : 'Tạo mới'}</span>
              )}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => !isSubmitting && setIsDeleteModalOpen(false)}
        title="Xác nhận Xóa Sản phẩm"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Bạn có chắc chắn muốn xóa sản phẩm <span className="font-semibold text-gray-900">"{currentProduct?.name}"</span>? Thao tác này sẽ áp dụng cơ chế Soft Delete.
          </p>

          {formError && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => setIsDeleteModalOpen(false)}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-xl transition"
            >
              Hủy
            </button>
            <button
              type="button"
              disabled={isSubmitting}
              onClick={handleDelete}
              className="px-5 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-xl transition shadow-sm disabled:opacity-50 flex items-center space-x-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Đang xóa...</span>
                </>
              ) : (
                <span>Xác nhận Xóa</span>
              )}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
