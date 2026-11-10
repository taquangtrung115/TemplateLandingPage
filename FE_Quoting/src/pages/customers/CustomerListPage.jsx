import RowActions from '../../components/common/RowActions';
import React, { useState, useEffect, useMemo } from 'react';
import { Banner } from '@astryxdesign/core/Banner';
import { Card } from '@astryxdesign/core/Card';
import { QuotingTable as Table, pixel, proportional } from '../../components/common/QuotingTable';
import { Button } from '@astryxdesign/core/Button';
import { IconButton } from '@astryxdesign/core/IconButton';
import { Heading, Text } from '@astryxdesign/core/Text';
import { HStack, VStack } from '@astryxdesign/core/Layout';
import { Grid } from '@astryxdesign/core/Grid';
import { TextInput } from '@astryxdesign/core/TextInput';
import { TextArea } from '@astryxdesign/core/TextArea';
import { Divider } from '@astryxdesign/core/Divider';
import { EmptyState } from '@astryxdesign/core/EmptyState';
import { Drawer, DrawerHeader } from '@astryxdesign/core/Drawer';
import { Pagination } from '@astryxdesign/core/Pagination';
import { Skeleton } from '@astryxdesign/core/Skeleton';
import { AlertDialog } from '@astryxdesign/core/AlertDialog';
import { useToast } from '@astryxdesign/core/Toast';
import { Field } from '@astryxdesign/core/Field';
import { FieldStatus } from '@astryxdesign/core/FieldStatus';
import { Icon } from '@astryxdesign/core/Icon';
import {
  PlusIcon,
  PencilSquareIcon,
  TrashIcon,
  CheckIcon,
} from '@heroicons/react/24/outline';
import { quotingCustomerApi } from '../../api/quotingCustomerApi';

export default function CustomerListPage() {
  const [loadError, setLoadError] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Pagination state
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  // Form Drawer State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [name, setName] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [taxCode, setTaxCode] = useState('');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  // Delete Alert State
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deletingCustomerId, setDeletingCustomerId] = useState(null);

  const toast = useToast();

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const res = await quotingCustomerApi.getCustomers({
        includeInactive: true,
      });
      setCustomers(res || []);
      setLoadError(null);
    } catch (err) {
      setLoadError(err.message || 'Không thể tải khách hàng. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleOpenAdd = () => {
    setEditingCustomer(null);
    setName('');
    setContactPerson('');
    setPhone('');
    setEmail('');
    setAddress('');
    setTaxCode('');
    setNotes('');
    setErrorMessage(null);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (c) => {
    setEditingCustomer(c);
    setName(c.name);
    setContactPerson(c.contactPerson || '');
    setPhone(c.phone);
    setEmail(c.email || '');
    setAddress(c.address || '');
    setTaxCode(c.taxCode || '');
    setNotes(c.notes || '');
    setErrorMessage(null);
    setIsFormOpen(true);
  };

  const handleSave = async () => {
    if (saving) return;
    if (!name.trim() || !phone.trim()) {
      setErrorMessage('Tên khách hàng và Số điện thoại là bắt buộc.');
      return;
    }

    if (email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) { setErrorMessage('Nhập địa chỉ email hợp lệ.'); return; }
    try {
      setSaving(true);
      setErrorMessage(null);
      if (editingCustomer) {
        await quotingCustomerApi.updateCustomer(editingCustomer.id, {
          name,
          contactPerson,
          phone,
          email,
          address,
          taxCode,
          notes,
          isActive: true,
        });
        toast({ body: `Cập nhật thông tin ${name} thành công.`, type: 'info' });
      } else {
        await quotingCustomerApi.createCustomer({
          name,
          contactPerson,
          phone,
          email,
          address,
          taxCode,
          notes,
          isActive: true,
        });
        toast({ body: `Thêm mới khách hàng ${name} thành công.`, type: 'info' });
      }
      setIsFormOpen(false);
      fetchCustomers();
    } catch (err) {
      const msg = err?.message || 'Lỗi khi lưu khách hàng.';
      setErrorMessage(msg);
      toast({ body: msg, type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleConfirmDelete = (id) => {
    setDeletingCustomerId(id);
    setIsDeleteOpen(true);
  };

  const executeDelete = async () => {
    if (!deletingCustomerId || deleting) return;
    setDeleting(true);
    try {
      await quotingCustomerApi.deleteCustomer(deletingCustomerId);
      setIsDeleteOpen(false);
      toast({ body: 'Đã xóa khách hàng thành công.', type: 'info' });
      fetchCustomers();
    } catch (err) {
      toast({ body: err.message || 'Không thể xóa khách hàng. Vui lòng thử lại.', type: 'error' });
    } finally { setDeleting(false); }
  };

  const filteredCustomers = useMemo(() => {
    if (!searchTerm.trim()) return customers;
    const q = searchTerm.trim().toLowerCase();
    return customers.filter(
      (c) =>
        c.name?.toLowerCase().includes(q) ||
        c.phone?.includes(q) ||
        c.email?.toLowerCase().includes(q) ||
        c.taxCode?.includes(q)
    );
  }, [customers, searchTerm]);

  // Reset về page 1 nếu tìm kiếm làm giảm tổng số item
  useEffect(() => {
    setPage(1);
  }, [searchTerm]);

  useEffect(() => { setPage((current) => Math.min(current, Math.max(1, Math.ceil(filteredCustomers.length / pageSize)))); }, [filteredCustomers.length, pageSize]);

  const paginatedCustomers = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredCustomers.slice(start, start + pageSize);
  }, [filteredCustomers, page, pageSize]);

  const columns = useMemo(
    () => [
      {
        key: 'name',
        header: 'Tên Khách hàng / Doanh Nghiệp',
        width: proportional(1, { minWidth: 200 }),
        renderCell: (row) => (
          <VStack gap={0.5}>
            <Text type="body" weight="semibold">
              {row.name}
            </Text>
            {row.contactPerson && (
              <Text type="supporting" color="secondary">
                Người liên hệ: {row.contactPerson}
              </Text>
            )}
          </VStack>
        ),
      },
      {
        key: 'phone',
        header: 'Số Điện Thoại',
        width: pixel(140),
        renderCell: (row) => <Text type="body">{row.phone}</Text>,
      },
      {
        key: 'email',
        header: 'Email',
        width: pixel(180),
        renderCell: (row) => (
          <Text type="body" color="secondary">
            {row.email || '—'}
          </Text>
        ),
      },
      {
        key: 'taxCode',
        header: 'Mã số thuế',
        width: pixel(140),
        renderCell: (row) => (
          <Text type="body" weight="medium">
            {row.taxCode || '—'}
          </Text>
        ),
      },
      {
        key: 'address',
        header: 'Địa chỉ',
        width: proportional(1, { minWidth: 220 }),
        renderCell: (row) => (
          <Text type="body" color="secondary">
            {row.address || '—'}
          </Text>
        ),
      },
      {
        key: 'actions',
        header: 'Thao tác',
        width: pixel(130),
      renderCell: (row) => <RowActions label={row.name || row.fileName} actions={[{ label: 'Sửa khách hàng', icon: PencilSquareIcon, onClick: () => handleOpenEdit(row) }, { label: 'Xóa khách hàng', icon: TrashIcon, destructive: true, onClick: () => handleConfirmDelete(row.id) }]} />,
      },
    ],
    []
  );

  return (
    <VStack gap={6}>
      {/* Header */}
      <HStack gap={3} vAlign="center" hAlign="between" wrap="wrap">
        <VStack gap={1}>
          <Heading level={1}>Khách hàng</Heading>
          <Text type="body" color="secondary">
            Thông tin liên hệ, mã số thuế, địa chỉ giao nhận phục vụ tạo báo giá thương mại
          </Text>
        </VStack>
        <Button
          variant="primary"
          label="Thêm khách hàng"
          icon={<Icon icon={PlusIcon} size="sm" />}
          onClick={handleOpenAdd}
        />
      </HStack>

      {/* Drawer Form thay thế Inline Card Form */}
      <Drawer
        isOpen={isFormOpen}
        onOpenChange={(open) => { if (!saving) setIsFormOpen(open); }}
        side="end"
        width={500}
        label={editingCustomer ? 'Sửa khách hàng' : 'Thêm khách hàng'}
      >
        <div style={{ padding: '24px' }}>
          <VStack gap={5}>
            <DrawerHeader
              title={editingCustomer ? 'Sửa khách hàng' : 'Thêm khách hàng'}
              onOpenChange={(open) => { if (!saving) setIsFormOpen(open); }}
            />

            {errorMessage && (
              <FieldStatus type="error" message={errorMessage} />
            )}

            <VStack gap={4}>
              <Field label="Tên khách hàng" inputID="customer-field-1" labelID="customer-field-1-label" status={errorMessage && !name.trim() ? { type: 'error' } : undefined}>
                <TextInput
                  label="Tên khách hàng" isLabelHidden
                  id="customer-field-1" aria-labelledby="customer-field-1-label"
                  value={name}
                  onChange={setName}
                  placeholder="VD: CÔNG TY TNHH ABC"
                />
              </Field>

              <Field label="Người liên hệ" inputID="customer-field-2" labelID="customer-field-2-label">
                <TextInput
                  label="Người liên hệ" isLabelHidden
                  id="customer-field-2" aria-labelledby="customer-field-2-label"
                  value={contactPerson}
                  onChange={setContactPerson}
                  placeholder="VD: Anh Nam (Phòng Thu Mua)"
                />
              </Field>

              <Grid className="quoting-grid" columns={{ minWidth: 200, repeat: 'fit' }} gap={4}>
                <Field label="Số điện thoại" inputID="customer-field-3" labelID="customer-field-3-label" status={errorMessage && !phone.trim() ? { type: 'error' } : undefined}>
                  <TextInput
                    label="Số điện thoại" isLabelHidden
                  id="customer-field-3" aria-labelledby="customer-field-3-label"
                  value={phone}
                    onChange={setPhone}
                    placeholder="0901234567"
                  />
                </Field>
                <Field label="Địa chỉ email" inputID="customer-field-4" labelID="customer-field-4-label">
                  <TextInput
                    label="Địa chỉ email" isLabelHidden
                  id="customer-field-4" aria-labelledby="customer-field-4-label"
                  value={email}
                    onChange={setEmail}
                    placeholder="contact@abc.vn"
                  />
                </Field>
              </Grid>

              <Field label="Mã số thuế" inputID="customer-field-5" labelID="customer-field-5-label">
                <TextInput
                  label="Mã số thuế" isLabelHidden
                  id="customer-field-5" aria-labelledby="customer-field-5-label"
                  value={taxCode}
                  onChange={setTaxCode}
                  placeholder="0312345678"
                />
              </Field>

              <Field label="Địa chỉ giao hàng / trụ sở" inputID="customer-field-6" labelID="customer-field-6-label">
                <TextInput
                  label="Địa chỉ giao hàng / trụ sở" isLabelHidden
                  id="customer-field-6" aria-labelledby="customer-field-6-label"
                  value={address}
                  onChange={setAddress}
                  placeholder="123 Đường số 1, Quận 1, TP.HCM"
                />
              </Field>

              <Field label="Ghi chú" inputID="customer-field-7" labelID="customer-field-7-label">
                <TextArea
                  label="Ghi chú" isLabelHidden
                  id="customer-field-7" aria-labelledby="customer-field-7-label"
                  value={notes}
                  onChange={setNotes}
                  rows={2}
                />
              </Field>
            </VStack>

            <Divider />

            <HStack gap={3} hAlign="end">
              <Button
                variant="secondary"
                label="Hủy"
                onClick={() => setIsFormOpen(false)}
              />
              <Button
                variant="primary"
                label={saving ? 'Đang lưu...' : 'Lưu khách hàng'}
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
        title="Xác nhận xóa khách hàng"
        description="Bạn có chắc chắn muốn xóa khách hàng này? Thao tác này không thể hoàn tác."
        actionLabel="Xóa khách hàng"
        actionVariant="destructive"
        onAction={executeDelete}
        isActionLoading={deleting}
        cancelLabel="Hủy"
      />

      {/* Search Bar */}
      <HStack gap={3} hAlign="end">
        <div style={{ width: 320, maxWidth: '100%' }}>
          <TextInput
            label="Tìm kiếm khách hàng"
            isLabelHidden
            placeholder="Tìm theo tên, SĐT, MST..."
            value={searchTerm}
            onChange={setSearchTerm}
          />
        </div>
      </HStack>

      {loadError && <Banner status="error" title="Không thể tải khách hàng" description={loadError} />}
      {loadError && <Button label="Thử lại" onClick={fetchCustomers} />}
      {/* Main Table or Skeleton */}
      <Card padding={0}>
        {loading ? (
          <div style={{ padding: 24 }}>
            <VStack gap={3}>
              <Skeleton height={40} width="100%" radius={2} index={0} />
              <Skeleton height={40} width="100%" radius={2} index={1} />
              <Skeleton height={40} width="100%" radius={2} index={2} />
              <Skeleton height={40} width="100%" radius={2} index={3} />
            </VStack>
          </div>
        ) : filteredCustomers.length === 0 ? (
          <div style={{ padding: 48 }}>
            <EmptyState
              title="Chưa có khách hàng nào"
              description="Thêm khách hàng để bắt đầu tạo bảng báo giá nhanh chóng."
              actions={
                <Button
                  variant="primary"
                  label="Thêm khách hàng"
                  icon={<Icon icon={PlusIcon} size="sm" />}
                  onClick={handleOpenAdd}
                />
              }
            />
          </div>
        ) : (
          <>
            <Table
              data={paginatedCustomers}
              columns={columns}
              idKey="id"
              density="balanced"
              hasHover
            />
            {filteredCustomers.length > 0 && (
              <div style={{ padding: '16px 20px', display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid var(--color-border)' }}>
                <Pagination
                  page={page}
                  onChange={setPage}
                  totalItems={filteredCustomers.length}
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
