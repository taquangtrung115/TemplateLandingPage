import { Icon } from '@astryxdesign/core/Icon';
import { PlusIcon, ArrowPathIcon, XMarkIcon, CheckIcon, PencilSquareIcon, TrashIcon } from '@heroicons/react/24/outline';
import React, { useEffect, useState } from 'react';
import { Button } from '../../components/common/Button';
import { Card } from '@astryxdesign/core/Card';
import { Heading, Text } from '@astryxdesign/core/Text';
import { Banner } from '@astryxdesign/core/Banner';
import { TextInput } from '@astryxdesign/core/TextInput';
import { TextArea } from '@astryxdesign/core/TextArea';
import { NumberInput } from '@astryxdesign/core/NumberInput';
import { Switch } from '@astryxdesign/core/Switch';
import { Badge } from '@astryxdesign/core/Badge';
import { Drawer, DrawerHeader } from '@astryxdesign/core/Drawer';
import { ConfirmationDialog as AlertDialog } from '../../components/common/ConfirmationDialog';
import { Skeleton } from '@astryxdesign/core/Skeleton';
import { useToast } from '@astryxdesign/core/Toast';
import { QuotingTable, pixel, proportional } from '../../components/common/QuotingTable';
import RowActions from '../../components/common/RowActions';
import { quotingProductGroupApi } from '../../api/quotingProductGroupApi';
import { useAuth } from '../../contexts/AuthContext';

const emptyGroup = () => ({ code: '', name: '', description: '', sortOrder: 1, isActive: true });

export default function ProductGroupPage() {
  // #region State and effects
  const { isAdmin } = useAuth();
  const toast = useToast();
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [formError, setFormError] = useState('');
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(emptyGroup);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(null);
  const [removing, setRemoving] = useState(false);
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    let active = true;
    setLoading(true);
    quotingProductGroupApi.getGroups({ includeInactive: true }).then((data) => {
      if (active) { setGroups(data); setError(''); }
    }).catch((error) => { if (active) setError(error.message || 'Không thể tải nhóm sản phẩm.'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [attempt]);
  // #endregion

  // #region Handlers
  const edit = (group) => { setForm(group || { ...emptyGroup(), sortOrder: Math.max(0, ...groups.map((group) => group.sortOrder)) + 1 }); setFormError(''); setOpen(true); };
  const update = (field, value) => setForm((current) => ({ ...current, [field]: value }));
  const save = async () => {
    if (saving || !isAdmin) return;
    if (!form.code.trim() || !form.name.trim() || !Number.isInteger(Number(form.sortOrder)) || Number(form.sortOrder) < 0) {
      setFormError('Nhập mã, tên nhóm và thứ tự là số nguyên không âm.'); return;
    }
    setSaving(true); setFormError('');
    try {
      const data = { ...form, sortOrder: Number(form.sortOrder) };
      if (form.id) await quotingProductGroupApi.updateGroup(form.id, data);
      else await quotingProductGroupApi.createGroup(data);
      setOpen(false); setAttempt((value) => value + 1);
      toast({ body: 'Đã lưu nhóm sản phẩm.', type: 'info' });
    } catch (error) { setFormError(error.message || 'Không thể lưu nhóm sản phẩm.'); }
    finally { setSaving(false); }
  };
  const remove = async () => {
    if (removing || !isAdmin || !deleting) return;
    setRemoving(true);
    try { await quotingProductGroupApi.deleteGroup(deleting.id); setDeleting(null); setAttempt((value) => value + 1); }
    catch (error) { toast({ body: error.message || 'Không thể xóa nhóm sản phẩm.', type: 'error' }); }
    finally { setRemoving(false); }
  };
  // #endregion

  const columns = [
    { key: 'name', header: 'Nhóm sản phẩm', width: proportional(1, { minWidth: 240 }), renderCell: (group) => <div><strong>{group.name}</strong><Text type="supporting" color="secondary">{group.code}</Text></div> },
    { key: 'description', header: 'Mô tả', renderCell: (group) => group.description || '—' },
    { key: 'sortOrder', header: 'Thứ tự', width: pixel(100), renderCell: (group) => group.sortOrder },
    { key: 'isActive', header: 'Trạng thái', width: pixel(140), renderCell: (group) => <Badge label={group.isActive ? 'Đang dùng' : 'Tạm ngưng'} variant={group.isActive ? 'success' : 'neutral'} /> },
    ...(isAdmin ? [{ key: 'actions', header: 'Thao tác', width: pixel(80), renderCell: (group) => <RowActions label={group.name} actions={[
      { label: 'Sửa nhóm', icon: PencilSquareIcon, onClick: () => edit(group) }, { label: 'Xóa nhóm', icon: TrashIcon, destructive: true, onClick: () => setDeleting(group) },
    ]} /> }] : []),
  ];

  return <div className="quoting-page-stack">
    <div className="page-heading"><div><Heading level={1}>Nhóm sản phẩm</Heading><Text color="secondary">Sắp xếp các dòng sản phẩm theo thứ tự hiển thị trên báo giá.</Text></div>
      {isAdmin && <Button icon={<Icon icon={PlusIcon} size="sm" />} label="Thêm nhóm" onClick={() => edit(null)} />}</div>
    {error && <><Banner status="error" title="Không thể tải danh mục" description={error} /><Button icon={<Icon icon={ArrowPathIcon} size="sm" />} label="Thử lại" onClick={() => setAttempt((value) => value + 1)} /></>}
    <Card padding={0}>{loading ? <Skeleton height={180} /> : groups.length ? <QuotingTable data={groups} columns={columns} idKey="id" /> : <div className="empty-records">Chưa có nhóm sản phẩm.</div>}</Card>
    <Drawer isOpen={open} onOpenChange={(value) => { if (!saving) setOpen(value); }} side="end" width={480} label={form.id ? 'Sửa nhóm sản phẩm' : 'Thêm nhóm sản phẩm'}>
      <div className="group-editor quoting-page-stack">
        <DrawerHeader title={form.id ? 'Sửa nhóm sản phẩm' : 'Thêm nhóm sản phẩm'} onOpenChange={(value) => { if (!saving) setOpen(value); }} />
        {formError && <Banner status="error" title="Chưa thể lưu" description={formError} />}
        <TextInput label="Mã nhóm" value={form.code} onChange={(value) => update('code', value)} />
        <TextInput label="Tên nhóm" value={form.name} onChange={(value) => update('name', value)} placeholder="A/ DÒNG COMBO" />
        <TextArea label="Mô tả" value={form.description || ''} onChange={(value) => update('description', value)} />
        <NumberInput label="Thứ tự hiển thị" value={form.sortOrder} min={0} precision={0} onChange={(value) => update('sortOrder', value)} />
        <Switch label="Đang dùng" value={form.isActive} onChange={(value) => update('isActive', value)} />
        <div className="group-editor-actions"><Button icon={<Icon icon={XMarkIcon} size="sm" />} label="Hủy" variant="secondary" isDisabled={saving} onClick={() => setOpen(false)} /><Button icon={<Icon icon={CheckIcon} size="sm" />} label="Lưu nhóm" onClick={save} isLoading={saving} /></div>
      </div>
    </Drawer>
    <AlertDialog isOpen={Boolean(deleting)} onOpenChange={(open) => { if (!open && !removing) setDeleting(null); }} title="Xóa nhóm sản phẩm?"
      description="Chỉ xóa được nhóm chưa có sản phẩm. Báo giá đã lưu giữ nguyên nội dung." actionLabel="Xóa nhóm" actionVariant="destructive" onAction={remove} isActionLoading={removing} cancelLabel="Hủy" />
  </div>;
}
