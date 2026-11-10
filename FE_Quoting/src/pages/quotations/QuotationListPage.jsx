import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Banner } from '@astryxdesign/core/Banner';
import { Card } from '@astryxdesign/core/Card';
import { Heading, Text } from '@astryxdesign/core/Text';
import { HStack, VStack } from '@astryxdesign/core/Layout';
import { Grid } from '@astryxdesign/core/Grid';
import { TextInput } from '@astryxdesign/core/TextInput';
import { Selector } from '@astryxdesign/core/Selector';
import { Badge } from '@astryxdesign/core/Badge';
import { Button } from '@astryxdesign/core/Button';
import { EmptyState } from '@astryxdesign/core/EmptyState';
import { QuotingTable as Table, proportional, pixel } from '../../components/common/QuotingTable';
import { Pagination } from '@astryxdesign/core/Pagination';
import { Skeleton } from '@astryxdesign/core/Skeleton';
import { Icon } from '@astryxdesign/core/Icon';
import {
  PlusIcon,
  DocumentTextIcon,
  EyeIcon,
  CheckCircleIcon,
  ClockIcon,
  PaperAirplaneIcon,
} from '@heroicons/react/24/outline';
import RowActions from '../../components/common/RowActions';
import { quotationApi } from '../../api/quotationApi';

const STATUS_OPTIONS = [
  { label: 'Tất cả trạng thái', value: 'ALL' },
  { label: 'Bản nháp', value: 'Draft' },
  { label: 'Đã gửi', value: 'Sent' },
  { label: 'Đã phê duyệt', value: 'Approved' },
  { label: 'Đã từ chối', value: 'Rejected' },
  { label: 'Đã hủy', value: 'Cancelled' },
];

function formatVnd(amount) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', minimumFractionDigits: 0, maximumFractionDigits: 2 }).format(amount || 0);
}

function MetricSummaryCard({ label, count, icon: IconComponent, badgeVariant, loading, index }) {
  if (loading) {
    return (
      <Card>
        <VStack gap={2}>
          <Skeleton height={20} width="60%" radius={2} index={index} />
          <Skeleton height={32} width="40%" radius={2} index={index + 1} />
        </VStack>
      </Card>
    );
  }

  return (
    <Card>
      <HStack gap={3} vAlign="center" hAlign="between">
        <HStack gap={3} vAlign="center">
          <div
            className="metric-icon"
            style={{
              padding: 10,
              borderRadius: 8,
              backgroundColor: 'var(--color-background-surface)',
              border: '1px solid var(--color-border)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Icon icon={IconComponent} size="md" color="accent" />
          </div>
          <VStack gap={0.5}>
            <Text type="supporting" color="secondary">
              {label}
            </Text>
            <Heading level={2}>{count}</Heading>
          </VStack>
        </HStack>
        {badgeVariant && (
          <Badge label={`${count}`} variant={badgeVariant} />
        )}
      </HStack>
    </Card>
  );
}

export default function QuotationListPage() {
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState(null);
  const [totalItems, setTotalItems] = useState(0);
  const [summary, setSummary] = useState(null);
  const [quotations, setQuotations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('ALL');

  // Pagination state
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  useEffect(() => {
    let isMounted = true;
    quotationApi.getSummary().then((result) => { if (isMounted) setSummary(result); }).catch(() => {});
    return () => { isMounted = false; };
  }, []);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    const timer = setTimeout(async () => {
      try {
        const result = await quotationApi.getQuotations({ search: searchTerm.trim() || undefined, status: selectedStatus === 'ALL' ? undefined : selectedStatus, page, pageSize });
        if (!isMounted) return;
        setQuotations(result?.data || []);
        setTotalItems(result?.total || 0);
        setErrorMessage(null);
      } catch (error) {
        if (isMounted) setErrorMessage(error.message || 'Không thể tải danh sách báo giá. Vui lòng thử lại.');
      } finally { if (isMounted) setLoading(false); }
    }, 250);
    return () => { isMounted = false; clearTimeout(timer); };
  }, [searchTerm, selectedStatus, page, pageSize]);

  const totalCount = summary?.totalCount ?? '—';
  const draftCount = summary?.draftCount ?? '—';
  const sentCount = summary?.sentCount ?? '—';
  const approvedCount = summary?.approvedCount ?? '—';

  // Columns definition for Astryx Table
  const columns = useMemo(
    () => [
      {
        key: 'quotationNumber',
        header: 'Số báo giá',
        width: pixel(180),
        renderCell: (row) => (
          <VStack gap={0.5}>
            <Text type="body" weight="semibold">
              {row.quotationNumber}
            </Text>
            <Text type="supporting" color="secondary">
              v{row.templateVersion || 1}
            </Text>
          </VStack>
        ),
      },
      {
        key: 'customerName',
        header: 'Khách hàng',
        width: proportional(1, { minWidth: 200 }),
        renderCell: (row) => (
          <VStack gap={0.5}>
            <Text type="body" weight="medium">
              {row.customerName}
            </Text>
            <Text type="supporting" color="secondary">
              {row.customerPhone || 'Chưa có SĐT'}
            </Text>
          </VStack>
        ),
      },
      {
        key: 'issueDate',
        header: 'Ngày lập',
        width: pixel(140),
        renderCell: (row) => (
          <Text type="body" color="secondary">
            {row.issueDate ? new Date(row.issueDate).toLocaleDateString('vi-VN') : '—'}
          </Text>
        ),
      },
      {
        key: 'status',
        header: 'Trạng thái',
        width: pixel(160),
        renderCell: (row) => {
          const status = row.status;
          const variant =
            status === 'Approved' ? 'success' :
            status === 'Sent' ? 'warning' : 'neutral';
          const label =
            status === 'Approved' ? 'Đã duyệt' :
            status === 'Sent' ? 'Đã gửi' :
            status === 'Draft' ? 'Bản nháp' : (status || 'Bản nháp');
          return <Badge label={label} variant={variant} />;
        },
      },
      {
        key: 'totalAmount',
        header: 'Tổng tiền',
        width: pixel(160),
        renderCell: (row) => (
          <Text type="body" weight="semibold">
            {row.showGrandTotal === false ? '—' : formatVnd(row.totalAmount)}
          </Text>
        ),
      },
      {
        key: 'actions',
        header: 'Thao tác',
        width: pixel(140),
        renderCell: (row) => <RowActions label={row.quotationNumber} actions={[
          { label: 'Xem chi tiết', icon: EyeIcon, onClick: () => navigate(`/quotations/${row.id}`) },
          row.status === 'Draft' && { label: 'Sửa báo giá', onClick: () => navigate(`/quotations/${row.id}/edit`) },
        ]} />,
      },
    ],
    [navigate]
  );

  return (
    <VStack gap={6}>
      {/* Page Title & Main Action */}
      <HStack gap={3} vAlign="center" hAlign="between" wrap="wrap">
        <VStack gap={1}>
          <Heading level={1}>Báo giá</Heading>
          <Text type="body" color="secondary">
            Tạo và theo dõi báo giá gửi khách hàng.
          </Text>
        </VStack>
        <Button
          variant="primary"
          label="Tạo báo giá"
          icon={<Icon icon={PlusIcon} size="sm" />}
          onClick={() => navigate('/quotations/create')}
        />
      </HStack>

      {/* KPI Cards theo Gothic Theme */}
      <Grid className="quoting-grid quotation-metrics" columns={{ minWidth: 220, repeat: 'fit' }} gap={4}>
        <MetricSummaryCard
          label="Tổng số báo giá"
          count={totalCount}
          icon={DocumentTextIcon}
          badgeVariant="neutral"
          loading={loading}
          index={0}
        />
        <MetricSummaryCard
          label="Bản nháp"
          count={draftCount}
          icon={ClockIcon}
          badgeVariant="neutral"
          loading={loading}
          index={1}
        />
        <MetricSummaryCard
          label="Đã gửi"
          count={sentCount}
          icon={PaperAirplaneIcon}
          badgeVariant="warning"
          loading={loading}
          index={2}
        />
        <MetricSummaryCard
          label="Đã phê duyệt"
          count={approvedCount}
          icon={CheckCircleIcon}
          badgeVariant="success"
          loading={loading}
          index={3}
        />
      </Grid>

      {/* Filter and Search Bar theo table-filter template */}
      <HStack gap={4} vAlign="center" hAlign="between" wrap="wrap">
        <div style={{ width: 260, maxWidth: '100%' }}>
          <Selector
            label="Trạng thái"
            isLabelHidden
            value={selectedStatus}
            onChange={(val) => { setSelectedStatus(val); setPage(1); }}
            options={STATUS_OPTIONS}
          />
        </div>

        <div style={{ width: 320, maxWidth: '100%' }}>
          <TextInput
            label="Tìm kiếm báo giá"
            isLabelHidden
            placeholder="Tìm theo số báo giá, tên khách..."
            value={searchTerm}
            onChange={(val) => { setSearchTerm(val); setPage(1); }}
          />
        </div>
      </HStack>

      {errorMessage && <Banner status="error" title="Không thể tải báo giá" description={errorMessage} />}
      {/* Main Table or Empty State or Skeleton */}
      <Card padding={0}>
        {loading ? (
          <div style={{ padding: 24 }}>
            <VStack gap={3}>
              <Skeleton height={44} width="100%" radius={2} index={0} />
              <Skeleton height={44} width="100%" radius={2} index={1} />
              <Skeleton height={44} width="100%" radius={2} index={2} />
              <Skeleton height={44} width="100%" radius={2} index={3} />
            </VStack>
          </div>
        ) : errorMessage ? <div style={{ padding: 24 }}><Text>Vui lòng tải lại trang để thử lại.</Text></div> : totalItems === 0 ? (
          <div style={{ padding: 48 }}>
            <EmptyState
              title="Chưa có báo giá nào"
              description="Bắt đầu tạo báo giá mới chuẩn hóa biểu mẫu in ấn từ danh mục sản phẩm."
              actions={
                <Button
                  variant="primary"
                  label="Tạo báo giá"
                  icon={<Icon icon={PlusIcon} size="sm" />}
                  onClick={() => navigate('/quotations/create')}
                />
              }
            />
          </div>
        ) : (
          <>
            <Table
              data={quotations}
              columns={columns}
              idKey="id"
              density="balanced"
              hasHover
            />
            {totalItems > 0 && (
              <div style={{ padding: '16px 20px', display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid var(--color-border)' }}>
                <Pagination
                  page={page}
                  onChange={setPage}
                  totalItems={totalItems}
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
