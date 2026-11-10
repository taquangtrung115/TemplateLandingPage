import RowActions from '../../components/common/RowActions';
import { resolveApiAssetUrl } from '../../api/apiUrl';
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Switch } from '@astryxdesign/core/Switch';
import { NumberInput } from '@astryxdesign/core/NumberInput';
import { InputGroup, InputGroupText } from '@astryxdesign/core/InputGroup';
import { calculateQuotation } from '../../utils/quotationCalculation';
import { Card } from '@astryxdesign/core/Card';
import { Badge } from '@astryxdesign/core/Badge';
import { Button } from '../../components/common/Button';
import { Heading, Text } from '@astryxdesign/core/Text';
import { HStack, VStack } from '@astryxdesign/core/Layout';
import { Divider } from '@astryxdesign/core/Divider';
import { SegmentedControl, SegmentedControlItem } from '@astryxdesign/core/SegmentedControl';
import { QuotingTable as Table, pixel, proportional } from '../../components/common/QuotingTable';
import { HoverCard } from '@astryxdesign/core/HoverCard';
import { ConfirmationDialog as AlertDialog } from '../../components/common/ConfirmationDialog';
import { useToast } from '@astryxdesign/core/Toast';
import { Banner } from '@astryxdesign/core/Banner';
import { downloadBlob } from '../../utils/downloadFile';
import { Skeleton } from '@astryxdesign/core/Skeleton';
import { Icon } from '@astryxdesign/core/Icon';
import {
  ArrowLeftIcon,
  ArrowDownTrayIcon,
  CheckCircleIcon,
  PaperAirplaneIcon,
  XCircleIcon,
  DocumentDuplicateIcon, ArrowPathIcon, PencilSquareIcon, TrashIcon,
} from '@heroicons/react/24/outline';
import { quotationApi } from '../../api/quotationApi';
import {
  QuotationStatusBadge,
  ProductCategoryBadge,
  UnitBadge,
} from '../../components/common/StatusBadge';
import { ActionButton } from '../../components/common/ActionButton';

export default function QuotationDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();

  const [quotation, setQuotation] = useState(null);
  const [previewHtml, setPreviewHtml] = useState('');
  const [includeExportVat, setIncludeExportVat] = useState(false);
  const [exportTaxPercent, setExportTaxPercent] = useState(10);
  const [previewing, setPreviewing] = useState(false);
  const [previewError, setPreviewError] = useState(null);
  const exportOptions = useRef(undefined);
  const previewRequest = useRef(0);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [changingStatus, setChangingStatus] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const detailRequest = useRef(0);
  const [activeTab, setActiveTab] = useState('preview');

  // Status Change Dialog State
  const [statusDialog, setStatusDialog] = useState({
    isOpen: false,
    targetStatus: null,
    title: '',
    description: '',
  });

  const fetchDetail = async () => {
    const requestId = ++detailRequest.current;
    try {
      setLoading(true);
      setErrorMessage(null);
      const [detail, preview] = await Promise.all([
        quotationApi.getQuotationById(id),
        quotationApi.previewQuotation(id, exportOptions.current).catch(() => null),
      ]);
      if (requestId !== detailRequest.current) return;
      setQuotation(detail);
      if (exportOptions.current === undefined) {
        setIncludeExportVat(detail.taxPercent > 0);
        setExportTaxPercent(detail.taxPercent || 10);
      }
      setPreviewHtml(preview?.htmlContent || '');
    } catch (error) {
      if (requestId === detailRequest.current) setErrorMessage(error.message || 'Không thể tải báo giá. Vui lòng thử lại.');
    } finally {
      if (requestId === detailRequest.current) setLoading(false);
    }
  };

  useEffect(() => {
    setQuotation(null);
    setPreviewHtml('');
    exportOptions.current = undefined;
    fetchDetail();
    return () => { detailRequest.current += 1; };
  }, [id]);

  const handleOpenStatusConfirm = (newStatus) => {
    const statusTitles = {
      Sent: 'Đánh dấu báo giá đã gửi?',
      Approved: 'Phê duyệt báo giá?',
      Rejected: 'Từ chối báo giá?',
    };
    const statusDescriptions = {
      Sent: 'Chỉ cập nhật trạng thái. Hãy gửi báo giá cho khách hàng qua kênh liên lạc của bạn trước khi xác nhận.',
      Approved: 'Ghi nhận báo giá đã được phê duyệt. Bạn sẽ không thể sửa nội dung báo giá sau bước này.',
      Rejected: 'Báo giá sẽ bị từ chối và kết thúc tiến trình đàm phán.',
    };

    setStatusDialog({
      isOpen: true,
      targetStatus: newStatus,
      title: statusTitles[newStatus] || 'Xác nhận thay đổi trạng thái',
      description: statusDescriptions[newStatus] || 'Bạn có chắc muốn thực hiện thay đổi này?',
    });
  };

  const executeStatusChange = async () => {
    if (!statusDialog.targetStatus || changingStatus) return;
    setChangingStatus(true);
    try {
      await quotationApi.changeStatus(id, statusDialog.targetStatus, 'Cập nhật trên trang chi tiết báo giá');
      setStatusDialog({ isOpen: false, targetStatus: null, title: '', description: '' });
      toast({ body: 'Đã cập nhật trạng thái báo giá.', type: 'info' });
      await fetchDetail();
    } catch (error) {
      toast({ body: error.message || 'Không thể cập nhật trạng thái báo giá. Vui lòng thử lại.', type: 'error' });
    } finally { setChangingStatus(false); }
  };

  const handleExport = async (fileType) => {
    if (exporting || previewing || previewError) return;
    setExporting(true);
    try {
      const file = exportOptions.current === undefined
        ? await quotationApi.exportFile(id, fileType)
        : await quotationApi.exportFile(id, fileType, exportOptions.current);
      const blob = await quotationApi.downloadFile(id, file.id);
      downloadBlob(blob, file.fileName);
      toast({ body: `Đã tải báo giá ${fileType.toUpperCase()}.`, type: 'info' });
      await fetchDetail();
    } catch (error) {
      toast({ body: error.message || 'Không thể tải báo giá. Vui lòng thử lại.', type: 'error' });
    } finally { setExporting(false); }
  };

  const updateExportVat = async (enabled, percent) => {
    setIncludeExportVat(enabled);
    setExportTaxPercent(percent);
    exportOptions.current = enabled ? Number(percent) || 0 : 0;
    const requestId = ++previewRequest.current;
    setPreviewing(true);
    setPreviewError(null);
    try {
      const preview = await quotationApi.previewQuotation(id, exportOptions.current);
      if (requestId === previewRequest.current) setPreviewHtml(preview?.htmlContent || '');
    } catch (error) {
      if (requestId === previewRequest.current) { setPreviewHtml(''); setPreviewError(error.message || 'Không thể cập nhật bản xem trước.'); }
    } finally { if (requestId === previewRequest.current) setPreviewing(false); }
  };

  const handleDownloadFile = async (file) => {
    if (exporting) return;
    setExporting(true);
    try {
      downloadBlob(await quotationApi.downloadFile(id, file.id), file.fileName);
    } catch (error) {
      toast({ body: error.message || 'Không thể tải tệp. Vui lòng thử lại.', type: 'error' });
    } finally { setExporting(false); }
  };

  const handleDeleteQuotation = async () => {
    if (deleting) return;
    setDeleting(true);
    try {
      await quotationApi.deleteQuotation(id);
      toast({ body: 'Đã xóa báo giá khỏi danh sách.', type: 'info' });
      navigate('/quotations');
    } catch (error) { toast({ body: error.message || 'Không thể xóa báo giá. Vui lòng thử lại.', type: 'error' }); }
    finally { setDeleting(false); }
  };

  const formatVnd = (amount) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', minimumFractionDigits: 0, maximumFractionDigits: 2 }).format(amount || 0);
  };

  const itemColumns = useMemo(() => [
    {
      key: 'productName',
      header: 'Sản phẩm',
      width: proportional(1, { minWidth: 240 }),
      renderCell: (row) => (
        <HoverCard
          placement="above"
          content={
            <div style={{ padding: 12, maxWidth: 260, textAlign: 'center' }}>
              {row.imageUrl && (
                <img
                  src={resolveApiAssetUrl(row.imageUrl)}
                  alt={row.productName}
                  style={{ width: '100%', height: 120, objectFit: 'cover', borderRadius: 6, marginBottom: 8 }}
                />
              )}
              <Text type="label" weight="bold">{row.productName}</Text>
              <div style={{ fontSize: 11, color: 'var(--color-text-secondary)', marginTop: 4 }}>
                {row.description || 'Sản phẩm chuẩn Chuỗi Ăn Vặt'}
              </div>
            </div>
          }
        >
          <VStack gap={0.5} style={{ cursor: 'pointer' }}>
            <Text type="body" weight="semibold">{row.productName}</Text>
            <HStack gap={1.5} vAlign="center" wrap="wrap">
              {row.itemGroup && <ProductCategoryBadge category={row.itemGroup} />}
              {row.description && <Text type="supporting" color="secondary" style={{ fontSize: 11 }}>{row.description}</Text>}
            </HStack>
          </VStack>
        </HoverCard>
      ),
    },
    {
      key: 'unit',
      header: 'ĐVT',
      width: pixel(100),
      renderCell: (row) => <UnitBadge unit={row.unit} />,
    },
    {
      key: 'quantity',
      header: 'Số lượng',
      width: pixel(100),
      renderCell: (row) => <Text type="body" weight="semibold">{row.quantity}</Text>,
    },
    {
      key: 'unitPrice',
      header: 'Đơn giá báo giá (VNĐ)',
      width: pixel(140),
      renderCell: (row) => <Text type="body">{formatVnd(row.unitPrice)}</Text>,
    },
    {
      key: 'discountPercent',
      header: 'Chiết khấu (%)',
      width: pixel(90),
      renderCell: (row) => (
        <Text type="body" style={{ color: row.discountPercent > 0 ? 'var(--color-text-error)' : 'inherit' }}>
          {row.discountPercent}%
        </Text>
      ),
    },
    {
      key: 'totalAmount',
      header: 'Thành tiền',
      width: pixel(150),
      renderCell: (row) => (
        <Text type="body" weight="semibold" color="primary">
          {formatVnd(row.totalAmount)}
        </Text>
      ),
    },
  ].filter((column) => !(column.key === 'quantity' && quotation?.showQuantity === false)
    && !(column.key === 'discountPercent' && quotation?.showDiscount === false)
    && !(column.key === 'totalAmount' && quotation?.showGrandTotal === false)), [quotation?.showQuantity, quotation?.showDiscount, quotation?.showGrandTotal]);

  const historyColumns = useMemo(() => [
    {
      key: 'createdAtUtc',
      header: 'Thời gian',
      width: pixel(160),
      renderCell: (row) => (
        <Text type="body" color="secondary">
          {new Date(row.createdAtUtc).toLocaleString('vi-VN')}
        </Text>
      ),
    },
    {
      key: 'action',
      header: 'Thao tác',
      width: pixel(150),
      renderCell: (row) => (
        <Badge label={({ Created: 'Tạo báo giá', Updated: 'Cập nhật thông tin', ItemsUpdated: 'Cập nhật sản phẩm', StatusChanged: 'Đổi trạng thái', FileExported: 'Xuất tệp' })[row.action] || row.action} variant="blue" />
      ),
    },
    {
      key: 'description',
      header: 'Nội dung',
      width: proportional(1, { minWidth: 250 }),
      renderCell: (row) => <Text type="body">{row.description}</Text>,
    },
  ], []);

  const fileColumns = useMemo(() => [
    {
      key: 'fileName',
      header: 'Tên tệp',
      width: proportional(1, { minWidth: 220 }),
      renderCell: (row) => (
        <Text type="body" weight="semibold">{row.fileName}</Text>
      ),
    },
    {
      key: 'fileType',
      header: 'Định dạng',
      width: pixel(110),
      renderCell: (row) => (
        <Badge label={row.fileType?.toUpperCase()} variant="neutral" />
      ),
    },
    {
      key: 'storageProvider',
      header: 'Nơi lưu',
      width: pixel(130),
      renderCell: (row) => (
        <Badge variant={row.storageProvider === 'Supabase' ? 'blue' : 'neutral'} label={row.storageProvider === 'Local' ? 'Máy chủ' : row.storageProvider} />
      ),
    },
    {
      key: 'actions',
      header: 'Tải xuống',
      width: pixel(120),
      renderCell: (row) => <RowActions label={row.name || row.fileName} actions={[{ label: 'Tải tệp', icon: ArrowDownTrayIcon, onClick: () => handleDownloadFile(row), isDisabled: exporting || previewing || Boolean(previewError) }]} />,
    },
  ], [id, exporting]);

  if (!loading && (errorMessage || !quotation)) return (
    <VStack gap={4}>
      <Banner status="error" title="Không thể mở báo giá" description={errorMessage || 'Báo giá không tồn tại.'} />
      <Button icon={<Icon icon={ArrowPathIcon} size="sm" />} label="Thử lại" onClick={fetchDetail} />
      <Button icon={<Icon icon={ArrowLeftIcon} size="sm" />} label="Về danh sách báo giá" variant="secondary" onClick={() => navigate('/quotations')} />
    </VStack>
  );

  if (loading) {
    return (
      <VStack gap={4} vAlign="center" style={{ padding: 64 }}>
        <Skeleton height={40} width="60%" radius={2} index={0} />
        <Skeleton height={200} width="100%" radius={3} index={1} />
      </VStack>
    );
  }

  return (
    <VStack gap={6}>
      {/* Top Navigation & Status Bar */}
      <HStack gap={3} vAlign="center" hAlign="between" wrap="wrap">
        <HStack gap={3} vAlign="center" wrap="wrap">
          <Button
            variant="secondary"
            size="sm"
            label="Danh sách"
            icon={<Icon icon={ArrowLeftIcon} size="sm" />}
            onClick={() => navigate('/quotations')}
          />
          <Heading level={1}>{quotation.quotationNumber}</Heading>
          <QuotationStatusBadge status={quotation.status} />
          <Badge label={`Mẫu v${quotation.templateVersion}`} variant="neutral" />
        </HStack>

        <HStack gap={2} wrap="wrap">
          {quotation.status === 'Draft' && <Button icon={<Icon icon={PencilSquareIcon} size="sm" />} label="Sửa báo giá" variant="secondary" onClick={() => navigate(`/quotations/${id}/edit`)} />}
          <Button icon={<Icon icon={TrashIcon} size="sm" />} label="Xóa báo giá" variant="destructive" isDisabled={exporting || changingStatus || deleting} onClick={() => setIsDeleteOpen(true)} />
          {quotation.status === 'Draft' && (
            <ActionButton
              actionType="secondary"
              label="Đánh dấu đã gửi"
              icon={<Icon icon={PaperAirplaneIcon} size="sm" />}
              onClick={() => handleOpenStatusConfirm('Sent')}
            />
          )}
          {quotation.status === 'Sent' && (
            <>
              <ActionButton
                actionType="success"
                label="Phê duyệt"
                icon={<Icon icon={CheckCircleIcon} size="sm" />}
                onClick={() => handleOpenStatusConfirm('Approved')}
              />
              <ActionButton
                actionType="danger"
                label="Từ chối"
                icon={<Icon icon={XCircleIcon} size="sm" />}
                onClick={() => handleOpenStatusConfirm('Rejected')}
              />
            </>
          )}
          <ActionButton
            actionType="primary"
            label={exporting ? 'Đang tải...' : 'Tải PDF'}
            icon={<Icon icon={ArrowDownTrayIcon} size="sm" />}
            onClick={() => handleExport('pdf')}
            isDisabled={exporting || previewing || Boolean(previewError)}
            loading={exporting}
          />
          <ActionButton
            actionType="secondary"
            label="Tải HTML"
            icon={<Icon icon={DocumentDuplicateIcon} size="sm" />}
            onClick={() => handleExport('html')}
            isDisabled={exporting || previewing || Boolean(previewError)}
          />
        </HStack>
      </HStack>

      <AlertDialog isOpen={isDeleteOpen} onOpenChange={setIsDeleteOpen} title="Xóa báo giá?" description="Báo giá sẽ được ẩn khỏi danh sách. Dữ liệu lịch sử vẫn được giữ lại." actionLabel="Xóa báo giá" cancelLabel="Hủy" actionVariant="destructive" isActionLoading={deleting} onAction={handleDeleteQuotation} />
      {/* Confirmation AlertDialog for Status Change */}
      <AlertDialog
        isOpen={statusDialog.isOpen}
        onOpenChange={(open) => setStatusDialog((prev) => ({ ...prev, isOpen: open }))}
        title={statusDialog.title}
        description={statusDialog.description}
        actionLabel={statusDialog.targetStatus === 'Sent' ? 'Đánh dấu đã gửi' : statusDialog.targetStatus === 'Approved' ? 'Phê duyệt' : 'Từ chối'}
        actionIcon={statusDialog.targetStatus === 'Sent' ? PaperAirplaneIcon : statusDialog.targetStatus === 'Approved' ? CheckCircleIcon : XCircleIcon}
        isActionLoading={changingStatus}
        actionVariant={statusDialog.targetStatus === 'Rejected' ? 'destructive' : 'primary'}
        onAction={executeStatusChange}
        cancelLabel="Hủy"
      />

      {/* Snapshot Header Information Card */}
      <Card padding={6} style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
        <HStack gap={6} align="start" wrap="wrap">
          <VStack gap={1} style={{ flex: '1 1 280px' }}>
            <Text type="supporting" color="secondary" style={{ textTransform: 'uppercase', fontSize: 11, letterSpacing: '0.05em' }}>
              Khách hàng nhận:
            </Text>
            <Heading level={3}>{quotation.customerName || 'QUÝ KHÁCH HÀNG'}</Heading>
            <Text type="body" color="secondary">{quotation.customerAddress || '—'}</Text>
            {quotation.customerPhone && (
              <Text type="body" color="secondary">SĐT: {quotation.customerPhone}</Text>
            )}
            {quotation.customerTaxCode && (
              <Text type="body" color="secondary">MST: {quotation.customerTaxCode}</Text>
            )}
          </VStack>

          <Divider orientation="vertical" />

          <VStack gap={1} style={{ flex: '1 1 220px' }}>
            <Text type="supporting" color="secondary" style={{ textTransform: 'uppercase', fontSize: 11, letterSpacing: '0.05em' }}>
              Thời hạn & Hiệu lực:
            </Text>
            <Text type="body">
              <strong>Ngày lập:</strong> {quotation.issueDate ? new Date(quotation.issueDate).toLocaleDateString('vi-VN') : '—'}
            </Text>
            <Text type="body">
              <strong>Hạn báo giá:</strong> {quotation.validUntil ? new Date(quotation.validUntil).toLocaleDateString('vi-VN') : 'Không đặt hạn'}
            </Text>
            <Text type="body">
              <strong>Mẫu áp dụng:</strong> Phiên bản {quotation.templateVersion}
            </Text>
          </VStack>

          <Divider orientation="vertical" />

          {quotation.showGrandTotal !== false && <VStack gap={1} style={{ flex: '1 1 220px', textAlign: 'right' }}>
            <Text type="supporting" color="secondary" style={{ textTransform: 'uppercase', fontSize: 11, letterSpacing: '0.05em' }}>
              Tổng giá trị báo giá:
            </Text>
            <Heading level={2} style={{ color: 'var(--color-text-info)' }}>
              {formatVnd(quotation.totalAmount)}
            </Heading>
            {quotation.taxPercent > 0 && <Text type="supporting" color="secondary">
              VAT cộng thêm {quotation.taxPercent}% ({formatVnd(quotation.taxAmount)})
            </Text>}
            {quotation.showDiscount !== false && quotation.discountPercent > 0 && (
              <Text type="supporting" style={{ color: 'var(--color-text-error)' }}>
                Chiết khấu: -{quotation.discountPercent}% ({formatVnd(quotation.discountAmount)})
              </Text>
            )}
          </VStack>}
        </HStack>
      </Card>

      <Card padding={4}>
        <VStack gap={3}>
          <Heading level={3}>Tùy chọn xuất báo giá</Heading>
          <Switch label="Thêm VAT khi xuất" value={includeExportVat} isDisabled={exporting} onChange={(checked) => updateExportVat(checked, exportTaxPercent)} />
          {includeExportVat && <InputGroup label="Thuế suất VAT khi xuất"><NumberInput value={exportTaxPercent} min={0} max={100} precision={2} isDisabled={exporting} onChange={(percent) => updateExportVat(true, percent)} /><InputGroupText>%</InputGroupText></InputGroup>}
          <Text type="supporting" color="secondary">Tùy chọn áp dụng cho bản xem trước và tệp xuất này. Nội dung báo giá đã lưu được giữ nguyên.</Text>
          {quotation.showGrandTotal !== false && <Text type="body" weight="semibold">Tổng tiền trên tệp: {formatVnd(calculateQuotation(quotation.items, quotation.discountPercent, includeExportVat ? exportTaxPercent : 0).totalAmount)}</Text>}
          {previewing && <Skeleton height={24} />}
          {previewError && <Banner status="error" title="Không thể cập nhật bản xem trước" description={previewError} />}
        </VStack>
      </Card>

      {/* Tabs navigation */}
      <div className="quotation-tabs">
        <SegmentedControl
          value={activeTab}
          onChange={setActiveTab}
        >
          <SegmentedControlItem value="preview" label="Xem trước" />
          <SegmentedControlItem value="items" label={`Sản phẩm (${quotation.items?.length || 0})`} />
          <SegmentedControlItem value="files" label={`Tệp đã xuất (${quotation.files?.length || 0})`} />
          <SegmentedControlItem value="history" label={`Lịch sử (${quotation.histories?.length || 0})`} />
        </SegmentedControl>
      </div>

      {/* Tab 1: Preview HTML/PDF */}
      {activeTab === 'preview' && (
        <Card padding={0} style={{ overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', backgroundColor: 'var(--color-background-surface)', borderBottom: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text type="body" weight="medium">
              Xem trước nội dung báo giá
            </Text>
            <HStack gap={2}>
              <Button
                variant="primary"
                size="sm"
                label={exporting ? 'Đang tải...' : 'Tải PDF'}
                isLoading={exporting}
                icon={<Icon icon={ArrowDownTrayIcon} size="sm" />}
                onClick={() => handleExport('pdf')}
                isDisabled={exporting || previewing || Boolean(previewError)}
              />
            </HStack>
          </div>
          <div style={{ padding: 24, backgroundColor: '#525659', display: 'flex', justifyContent: 'center', minHeight: 600 }}>
            <div
              style={{
                width: '100%',
                maxWidth: '820px',
                backgroundColor: '#ffffff',
                boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
                borderRadius: 4,
                overflow: 'hidden',
              }}
            >
              {previewing ? <div className="quotation-preview-loading" role="status" aria-label="Đang tải bản xem trước"><Skeleton width="50%" height={32} /><Skeleton height={420} /></div> : previewHtml ? (
                <iframe
                  title="Bản xem trước báo giá"
                  sandbox=""
                  srcDoc={previewHtml}
                  style={{ width: '100%', height: '1100px', border: 'none' }}
                />
              ) : (
                <div style={{ padding: 48, textAlign: 'center', color: 'var(--color-text-secondary)' }}>
                  <Text type="body">Chưa tải được bản xem trước. Bạn vẫn có thể xem sản phẩm hoặc tải PDF.</Text>
                </div>
              )}
            </div>
          </div>
        </Card>
      )}

      {/* Tab 2: Danh sách dòng sản phẩm */}
      {activeTab === 'items' && (
        <Card padding={0}>
          <Table
            data={quotation.items || []}
            columns={itemColumns}
            idKey="id"
            density="balanced"
          />
        </Card>
      )}

      {/* Tab 3: File exports */}
      {activeTab === 'files' && (
        <Card padding={0}>
          <Table
            data={quotation.files || []}
            columns={fileColumns}
            idKey="id"
            density="balanced"
          />
        </Card>
      )}

      {/* Tab 4: Lịch sử giao dịch */}
      {activeTab === 'history' && (
        <Card padding={0}>
          <Table
            data={quotation.histories || []}
            columns={historyColumns}
            idKey="id"
            density="balanced"
          />
        </Card>
      )}
    </VStack>
  );
}
