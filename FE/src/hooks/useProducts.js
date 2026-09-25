import { useState, useEffect, useCallback } from 'react';
import productApi from '../api/productApi';

export function useProducts() {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchProducts = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await productApi.getProducts();
      const data = response.data?.value ?? response.data ?? [];
      setProducts(Array.isArray(data) ? data : Array.isArray(data?.data) ? data.data : []);
    } catch (err) {
      setError(err.message || 'Không thể tải danh sách sản phẩm');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createProduct = async (productData) => {
    setError(null);
    try {
      await productApi.createProduct(productData);
      await fetchProducts();
      return { success: true };
    } catch (err) {
      setError(err.message || 'Không thể tạo sản phẩm');
      return { success: false, error: err.message };
    }
  };

  const updateProduct = async (id, productData) => {
    setError(null);
    try {
      await productApi.updateProduct(id, productData);
      await fetchProducts();
      return { success: true };
    } catch (err) {
      setError(err.message || 'Không thể cập nhật sản phẩm');
      return { success: false, error: err.message };
    }
  };

  const deleteProduct = async (id) => {
    setError(null);
    try {
      await productApi.deleteProduct(id);
      await fetchProducts();
      return { success: true };
    } catch (err) {
      setError(err.message || 'Không thể xóa sản phẩm');
      return { success: false, error: err.message };
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  return {
    products,
    isLoading,
    error,
    fetchProducts,
    createProduct,
    updateProduct,
    deleteProduct,
  };
}
