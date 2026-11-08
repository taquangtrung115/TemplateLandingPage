import { resolveApiAssetUrl } from '../../api/apiUrl';
import React, { useState, useEffect, useMemo } from 'react';
import { Banner } from '@astryxdesign/core/Banner';
import { useMediaQuery } from '@astryxdesign/core/hooks';
import { FileInput } from '@astryxdesign/core/FileInput';
import { Card } from '@astryxdesign/core/Card';
import { QuotingTable as Table, pixel, proportional } from '../../components/common/QuotingTable';
import { Badge } from '@astryxdesign/core/Badge';
import { Button } from '@astryxdesign/core/Button';
import { Selector } from '@astryxdesign/core/Selector';
import { Heading, Text } from '@astryxdesign/core/Text';
import { HStack, VStack } from '@astryxdesign/core/Layout';
import { Grid } from '@astryxdesign/core/Grid';
import { TextInput } from '@astryxdesign/core/TextInput';
import { NumberInput } from '@astryxdesign/core/NumberInput';
import { TextArea } from '@astryxdesign/core/TextArea';
import { Divider } from '@astryxdesign/core/Divider';
import { EmptyState } from '@astryxdesign/core/EmptyState';
import { Drawer, DrawerHeader } from '@astryxdesign/core/Drawer';
import { HoverCard } from '@astryxdesign/core/HoverCard';
import { Pagination } from '@astryxdesign/core/Pagination';
import { Skeleton } from '@astryxdesign/core/Skeleton';
import { AlertDialog } from '@astryxdesign/core/AlertDialog';
import { useToast } from '@astryxdesign/core/Toast';
import { Field } from '@astryxdesign/core/Field';
import { FieldStatus } from '@astryxdesign/core/FieldStatus';
import { InputGroup, InputGroupText } from '@astryxdesign/core/InputGroup';
import { Switch } from '@astryxdesign/core/Switch';
import { Icon } from '@astryxdesign/core/Icon';
import {
  PlusIcon,
  PencilSquareIcon,
  TrashIcon,
  CubeIcon,
  CheckIcon,
} from '@heroicons/react/24/outline';
import { quotingProductApi } from '../../api/quotingProductApi';
import { useAuth } from '../../contexts/AuthContext';

function formatVnd(amount) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', minimumFractionDigits: 0, maximumFractionDigits: 2 }).format(amount || 0);
}

export default function ProductCatalogPage() {
  const { isAdmin } = useAuth();
  const isMobile = useMediaQuery('(max-width: 767px)');
  const [loadError, setLoadError] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');

  // Pagination state
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  const categoryFilterOptions = useMemo(() => [
    { label: 'Tất cả nhóm sản phẩm', value: 'ALL' },
    ...[...new Set(products.map((product) => product.category?.trim()).filter(Boolean))].sort((a, b) => a.localeCompare(b, 'vi')).map((category) => ({ value: category, label: category })),
  ], [products]);

  // Form Drawer State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [unit, setUnit] = useState('Gói');
  const [price, setPrice] = useState(25000);
  const [category, setCategory] = useState('A/ DÒNG COMBO');
  const [imageUrl, setImageUrl] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [isActive, setIsActive] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  // Delete Alert State
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deletingProductId, setDeletingProductId] = useState(null);

  const toast = useToast();

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await quotingProductApi.getProducts({
        includeInactive: true,
      });
      setProducts(res || []);
      setLoadError(null);
    } catch (error) {
      setLoadError(error.message || 'Không thể tải sản phẩm. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    if (!imageFile || !URL.createObjectURL) { setImagePreview(''); return; }
    const url = URL.createObjectURL(imageFile);
    setImagePreview(url);
    return () => URL.revokeObjectURL(url);
  }, [imageFile]);

  const handleImageChange = (file) => {
    if (file && (!['image/png', 'image/jpeg'].includes(file.type) || file.size > 5 * 1024 * 1024)) {
      setErrorMessage('Chọn ảnh JPG hoặc PNG, dung lượng tối đa 5 MB.'); return;
    }
    setErrorMessage(null); setImageFile(file);
  };

  const handleFormOpenChange = (open) => {
    if (saving) return;
    setIsFormOpen(open);
    if (!open) setImageFile(null);
  };

  const handleOpenAdd = () => {
    setEditingProduct(null);
    setCode(`SP-${Date.now().toString(36).toUpperCase()}`);
    setName('');
    setDescription('');
    setUnit('Gói');
    setPrice(25000);
    setCategory('A/ DÒNG COMBO');
    setImageUrl('');
    setImageFile(null);
    setIsActive(true);
    setErrorMessage(null);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (p) => {
    setEditingProduct(p);
    setCode(p.code);
    setName(p.name);
    setDescription(p.description || '');
    setUnit(p.unit);
    setPrice(p.price);
    setCategory(p.category || 'A/ DÒNG COMBO');
    setImageUrl(p.imageUrl || '');
    setImageFile(null);
    setIsActive(p.isActive);
    setErrorMessage(null);
    setIsFormOpen(true);
  };

  const handleSave = async () => {
    if (saving || !isAdmin) return;
    if (!code.trim() || !name.trim()) {
      setErrorMessage('Mã và Tên sản phẩm không được để trống.');
      return;
    }

    if (!unit.trim() || price === null || !Number.isFinite(Number(price)) || Number(price) < 0) { setErrorMessage('Nhập đơn vị tính và đơn giá không âm.'); return; }
    try {
      setSaving(true);
      setErrorMessage(null);
      let savedImageUrl = imageUrl;
      if (imageFile) {
        setUploadingImage(true);
        try {
          const uploaded = await quotingProductApi.uploadImage(imageFile);
          if (!uploaded?.image?.imageUrl) throw new Error('Chưa thể lưu ảnh sản phẩm. Vui lòng thử lại.');
          savedImageUrl = uploaded.image.imageUrl;
          setImageUrl(savedImageUrl); setImageFile(null);
        } finally { setUploadingImage(false); }
      }
      if (editingProduct) {
        await quotingProductApi.updateProduct(editingProduct.id, {
          code,
          name,
          description,
          unit,
          price: Number(price) || 0,
          category,
          imageUrl: savedImageUrl,
          isActive,
        });
        toast({ body: `Cập nhật sản phẩm ${name} thành công.`, type: 'info' });
      } else {
        await quotingProductApi.createProduct({
          code,
          name,
          description,
          unit,
          price: Number(price) || 0,
          category,
          imageUrl: savedImageUrl,
          isActive,
        });
        toast({ body: `Thêm mới sản phẩm ${name} thành công.`, type: 'info' });
      }
      setIsFormOpen(false);
      fetchProducts();
    } catch (err) {
      const msg = err?.message || 'Lỗi khi lưu sản phẩm.';
      setErrorMessage(msg);
      toast({ body: msg, type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleConfirmDelete = (id) => {
    setDeletingProductId(id);
    setIsDeleteOpen(true);
  };

  const executeDelete = async () => {
    if (!deletingProductId || deleting || !isAdmin) return;
    setDeleting(true);
    try {
      await quotingProductApi.deleteProduct(deletingProductId);
      setIsDeleteOpen(false);
      toast({ body: 'Đã xóa sản phẩm khỏi danh mục.', type: 'info' });
      fetchProducts();
    } catch (err) {
      toast({ body: err.message || 'Không thể xóa sản phẩm. Vui lòng thử lại.', type: 'error' });
    } finally { setDeleting(false); }
  };

  const visibleProducts = useMemo(() => {
    let result = products;
    if (selectedCategory !== 'ALL') {
      result = result.filter((p) => p.category === selectedCategory);
    }
    if (searchTerm.trim()) {
      const q = searchTerm.trim().toLowerCase();
      result = result.filter(
        (p) =>
          p.name?.toLowerCase().includes(q) ||
          p.code?.toLowerCase().includes(q) ||
          p.category?.toLowerCase().includes(q)
      );
    }
    return result;
  }, [products, searchTerm, selectedCategory]);

  useEffect(() => {
    setPage(1);
  }, [searchTerm, selectedCategory]);

  useEffect(() => { setPage((current) => Math.min(current, Math.max(1, Math.ceil(visibleProducts.length / pageSize)))); }, [visibleProducts.length, pageSize]);

  const paginatedProducts = useMemo(() => {
    const start = (page - 1) * pageSize;
    return visibleProducts.slice(start, start + pageSize);
  }, [visibleProducts, page, pageSize]);

  const columns = useMemo(
    () => [
      {
        key: 'image',
        header: 'Hình ảnh',
        width: pixel(80),
        renderCell: (row) =>
          row.imageUrl ? (
            <HoverCard
              placement="end"
              content={
                <div style={{ padding: 12, width: 220, textAlign: 'center' }}>
                  <img
                    src={resolveApiAssetUrl(row.imageUrl)}
                    alt={row.name}
                    style={{ width: '100%', height: 160, objectFit: 'cover', borderRadius: 8, marginBottom: 8 }}
                  />
                  <Text type="label" weight="bold">{row.name}</Text>
                  {row.description && (
                    <Text type="supporting" color="secondary" size="sm" style={{ marginTop: 4 }}>
                      {row.description}
                    </Text>
                  )}
                </div>
              }
            >
              <img
                src={resolveApiAssetUrl(row.imageUrl)}
                alt={row.name}
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 6,
                  objectFit: 'cover',
                  border: '1px solid var(--color-border)',
                  cursor: 'pointer',
                }}
              />
            </HoverCard>
          ) : (
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 6,
                backgroundColor: 'var(--color-background-surface)',
                border: '1px solid var(--color-border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Icon icon={CubeIcon} size="sm" color="secondary" />
            </div>
          ),
      },
      {
        key: 'code',
        header: 'Mã sản phẩm',
        width: pixel(110),
        renderCell: (row) => (
          <Text type="body" weight="semibold">
            {row.code}
          </Text>
        ),
      },
      {
        key: 'name',
        header: 'Tên sản phẩm và mô tả',
        width: proportional(1, { minWidth: 220 }),
        renderCell: (row) => (
          <HoverCard
            placement="above"
            content={
              <div style={{ padding: 12, maxWidth: 260 }}>
                <Text type="label" weight="bold">{row.name}</Text>
                <div style={{ marginTop: 4 }}>
                  <Text type="supporting" color="secondary">
                    {row.description || 'Chưa có thông tin mô tả nguyên liệu.'}
                  </Text>
                </div>
              </div>
            }
          >
            <VStack gap={0.5} style={{ cursor: 'pointer' }}>
              <Text type="body" weight="semibold">
                {row.name}
              </Text>
              {row.description && (
                <Text type="supporting" color="secondary" size="sm">
                  {row.description}
                </Text>
              )}
            </VStack>
          </HoverCard>
        ),
      },
      {
        key: 'category',
        header: 'Nhóm sản phẩm',
        width: pixel(180),
        renderCell: (row) => (
          <Badge label={row.category || 'Chung'} variant="neutral" />
        ),
      },
      {
        key: 'unit',
        header: 'ĐVT',
        width: pixel(100),
        renderCell: (row) => (
          <Badge label={row.unit || 'Gói'} variant="neutral" />
        ),
      },
      {
        key: 'price',
        header: 'Giá danh mục (VNĐ)',
        width: pixel(140),
        renderCell: (row) => (
          <Text type="body" weight="semibold">
            {formatVnd(row.price)}
          </Text>
        ),
      },
      {
        key: 'status',
        header: 'Trạng thái',
        width: pixel(130),
        renderCell: (row) => (
          <Badge
            label={row.isActive ? 'Đang bán' : 'Tạm ngưng'}
            variant={row.isActive ? 'success' : 'neutral'}
          />
        ),
      },
      {
        key: 'actions',
        header: 'Thao tác',
        width: pixel(140),
        renderCell: (row) => (
          <HStack gap={1}>
            <Button
              variant="secondary"
              size="sm"
              icon={<Icon icon={PencilSquareIcon} size="sm" />}
              label={`Sửa ${row.name}`}
              isIconOnly
              onClick={() => handleOpenEdit(row)}
            />
            {isAdmin && (
              <Button
                variant="destructive"
                size="sm"
                icon={<Icon icon={TrashIcon} size="sm" />}
                label={`Xóa ${row.name}`}
                isIconOnly
                onClick={() => handleConfirmDelete(row.id)}
              />
            )}
          </HStack>
        ),
      },
    ],
    [isAdmin]
  );

  return (
    <VStack gap={6}>
      {/* Header */}
      <HStack gap={3} vAlign="center" hAlign="between" wrap="wrap">
        <VStack gap={1}>
          <Heading level={1}>Danh mục sản phẩm</Heading>
          <Text type="body" color="secondary">
            Khai báo và quản lý mã sản phẩm, giá bán, hình ảnh, đơn vị tính chuẩn mẫu Chuỗi Ăn Vặt
          </Text>
        </VStack>
        <Button
          variant="primary"
          label="Thêm sản phẩm"
          icon={<Icon icon={PlusIcon} size="sm" />}
          onClick={handleOpenAdd}
          isDisabled={!isAdmin}
        />
      </HStack>

      {/* Drawer Form thay thế Inline Card Form */}
      <Drawer
        isOpen={isFormOpen}
        onOpenChange={handleFormOpenChange}
        side="end"
        width={520}
        label={editingProduct ? 'Sửa sản phẩm' : 'Thêm sản phẩm'}
      >
        <div style={{ padding: '24px' }}>
          <VStack gap={5}>
            <DrawerHeader
              title={editingProduct ? 'Sửa sản phẩm' : 'Thêm sản phẩm'}
              onOpenChange={handleFormOpenChange}
            />

            {errorMessage && (
              <FieldStatus type="error" message={errorMessage} />
            )}

            <VStack gap={4}>
              <Grid className="quoting-grid" columns={{ minWidth: 200, repeat: 'fit' }} gap={4}>
                <Field label="Mã sản phẩm (SKU)" inputID="product-field-1" labelID="product-field-1-label" status={errorMessage && !code.trim() ? { type: 'error' } : undefined}>
                  <TextInput
                    id="product-field-1" aria-labelledby="product-field-1-label"
                  label="Mã sản phẩm"
                    isLabelHidden
                    value={code}
                    onChange={setCode}
                    placeholder="VD: CB-01"
                    isDisabled={!!editingProduct}
                  />
                </Field>

                <Field label="Tên sản phẩm" inputID="product-field-2" labelID="product-field-2-label" status={errorMessage && !name.trim() ? { type: 'error' } : undefined}>
                  <TextInput
                    id="product-field-2" aria-labelledby="product-field-2-label"
                  label="Tên sản phẩm"
                    isLabelHidden
                    value={name}
                    onChange={setName}
                    placeholder="VD: COMBO NGUYÊN BẢN BAO NGON"
                  />
                </Field>
              </Grid>

              <Field label="Thành phần / mô tả" inputID="product-field-3" labelID="product-field-3-label">
                <TextArea
                  label="Thành phần / mô tả" isLabelHidden
                  id="product-field-3" aria-labelledby="product-field-3-label"
                  value={description}
                  onChange={setDescription}
                  placeholder="Surimi hải sản, cá viên, bò viên, chả cá cốm..."
                  rows={3}
                />
              </Field>

              <Grid className="quoting-grid" columns={{ minWidth: 140, repeat: 'fit' }} gap={4}>
                <Field label="Đơn vị tính" inputID="product-field-4" labelID="product-field-4-label">
                  <TextInput
                    label="Đơn vị tính" isLabelHidden
                  id="product-field-4" aria-labelledby="product-field-4-label"
                  value={unit}
                    onChange={setUnit}
                    placeholder="GÓI, 10 QUE/GÓI..."
                  />
                </Field>

                <InputGroup label="Giá danh mục">
                  <NumberInput
                    value={price}
                    onChange={setPrice}
                    min={0}
                    step={1000}
                  />
                  <InputGroupText>VNĐ</InputGroupText>
                </InputGroup>
              </Grid>

              <Field label="Nhóm sản phẩm" inputID="product-field-5" labelID="product-field-5-label">
                <TextInput
                  label="Nhóm sản phẩm" isLabelHidden
                  id="product-field-5" aria-labelledby="product-field-5-label"
                  value={category}
                  onChange={setCategory}
                  placeholder="A/ DÒNG COMBO, B/ DÒNG SẢN PHẨM XIÊN QUE"
                />
              </Field>

              <FileInput label="Ảnh sản phẩm" value={imageFile} onChange={handleImageChange} accept="image/jpeg,image/png" maxSize={5 * 1024 * 1024}
                mode="dropzone" isDisabled={saving || !isAdmin} isLoading={uploadingImage} description="Chọn ảnh JPG hoặc PNG, tối đa 5 MB. Ảnh được tải lên khi bạn lưu sản phẩm." placeholder="Chọn ảnh từ thiết bị" />
              {(imagePreview || imageUrl) && <VStack gap={2}>
                <img src={imagePreview || resolveApiAssetUrl(imageUrl)} alt="Ảnh sản phẩm đang chọn" className="product-image-preview" />
                <Button label="Xóa ảnh" variant="secondary" isDisabled={saving || !isAdmin} onClick={() => { setImageFile(null); setImageUrl(''); }} />
              </VStack>}

              <HStack vAlign="center" gap={3}>
                <Switch
                  label="Đang bán"
                  value={isActive}
                  onChange={setIsActive}
                />
              </HStack>
            </VStack>

            <Divider />

            <HStack gap={3} hAlign="end">
              <Button
                variant="secondary"
                label="Hủy"
                onClick={() => handleFormOpenChange(false)}
              />
              <Button
                variant="primary"
                label={uploadingImage ? 'Đang tải ảnh...' : saving ? 'Đang lưu...' : 'Lưu sản phẩm'}
                icon={<Icon icon={CheckIcon} size="sm" />}
                onClick={handleSave}
                isLoading={saving}
              />
            </HStack>
          </VStack>
        </div>
      </Drawer>

      {/* Confirmation AlertDialog for Deletion */}
      <AlertDialog
        isOpen={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        title="Xác nhận xóa sản phẩm"
        description="Bạn có chắc chắn muốn xóa sản phẩm này khỏi danh mục? Thao tác này không thể hoàn tác."
        actionLabel="Xóa sản phẩm"
        actionVariant="destructive"
        onAction={executeDelete}
        isActionLoading={deleting}
        cancelLabel="Hủy"
      />

      {/* Filter & Search Bar */}
      <HStack gap={3} vAlign="center" hAlign="between" wrap="wrap">
        <HStack gap={2} vAlign="center">
          <Text type="body" weight="medium">
            Phân loại:
          </Text>
          <div style={{ width: 220 }}>
            <Selector
              label="Nhóm sản phẩm" isLabelHidden
              options={categoryFilterOptions}
              value={selectedCategory}
              onChange={setSelectedCategory}
            />
          </div>
        </HStack>
        <div style={{ width: 320, maxWidth: '100%' }}>
          <TextInput
            label="Tìm kiếm sản phẩm"
            isLabelHidden
            placeholder="Tìm theo tên, mã sản phẩm..."
            value={searchTerm}
            onChange={setSearchTerm}
          />
        </div>
      </HStack>

      {loadError && <Banner status="error" title="Không thể tải sản phẩm" description={loadError} />}
      {loadError && <Button label="Thử lại" onClick={fetchProducts} />}
      {/* Main Table or Skeleton */}
      <Card padding={0}>
        {loading ? (
          <div style={{ padding: 24 }}>
            <VStack gap={3}>
              <Skeleton height={44} width="100%" radius={2} index={0} />
              <Skeleton height={44} width="100%" radius={2} index={1} />
              <Skeleton height={44} width="100%" radius={2} index={2} />
              <Skeleton height={44} width="100%" radius={3} index={3} />
            </VStack>
          </div>
        ) : visibleProducts.length === 0 ? (
          <div style={{ padding: 48 }}>
            <EmptyState
              title="Không tìm thấy sản phẩm"
              description="Không có sản phẩm nào phù hợp với bộ lọc tìm kiếm hiện tại."
              actions={
                <Button
                  variant="secondary"
                  label="Xóa bộ lọc"
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedCategory('ALL');
                  }}
                />
              }
            />
          </div>
        ) : (
          <>
            {isMobile ? (
              <VStack gap={3} className="product-mobile-list" aria-label="Danh sách sản phẩm trên điện thoại">
                {paginatedProducts.map((product) => (
                  <Card key={product.id} padding={4} aria-label={`Sản phẩm ${product.code}`}>
                    <VStack gap={3}>
                      <HStack gap={3} vAlign="start">
                        {product.imageUrl && <img src={resolveApiAssetUrl(product.imageUrl)} alt={product.name} className="product-mobile-image" />}
                        <VStack gap={1} className="product-mobile-title">
                          <Text type="supporting" color="secondary">{product.code}</Text>
                          <Heading level={2}>{product.name}</Heading>
                          <Badge label={product.isActive ? 'Đang bán' : 'Tạm ngưng'} variant={product.isActive ? 'success' : 'neutral'} />
                        </VStack>
                      </HStack>
                      <Text type="body">{product.description || 'Chưa có mô tả.'}</Text>
                      <VStack gap={1}>
                        <Text type="body"><strong>Nhóm sản phẩm:</strong> {product.category || 'Chưa phân loại'}</Text>
                        <Text type="body"><strong>Đơn vị tính:</strong> {product.unit || '—'}</Text>
                        <Text type="body" weight="semibold">Giá danh mục: {formatVnd(product.price)}</Text>
                      </VStack>
                      <HStack gap={2} wrap="wrap">
                        <Button label="Sửa sản phẩm" aria-label={`Sửa ${product.name}`} icon={<Icon icon={PencilSquareIcon} size="sm" />} variant="secondary" onClick={() => handleOpenEdit(product)} />
                        {isAdmin && <Button label="Xóa sản phẩm" aria-label={`Xóa ${product.name}`} icon={<Icon icon={TrashIcon} size="sm" />} variant="destructive" onClick={() => handleConfirmDelete(product.id)} />}
                      </HStack>
                    </VStack>
                  </Card>
                ))}
              </VStack>
            ) : <Table data={paginatedProducts} columns={columns} idKey="id" density="balanced" hasHover />}
            {visibleProducts.length > 0 && (
              <div style={{ padding: '16px 20px', display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid var(--color-border)' }}>
                <Pagination
                  page={page}
                  onChange={setPage}
                  totalItems={visibleProducts.length}
                  pageSize={pageSize}
                  pageSizeOptions={[10, 20, 50]}
                  onPageSizeChange={(size) => { setPageSize(size); setPage(1); }}
                />
              </div>
            )}
          </>
        )}
      </Card>
    </VStack>
  );
}
