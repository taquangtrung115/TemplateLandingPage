import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { VStack, HStack } from '@astryxdesign/core/Layout';
import { Heading, Text } from '@astryxdesign/core/Text';
import { Banner } from '@astryxdesign/core/Banner';
import { Skeleton } from '@astryxdesign/core/Skeleton';
import { Card } from '@astryxdesign/core/Card';
import { Grid, GridSpan } from '@astryxdesign/core/Grid';
import { Button } from '@astryxdesign/core/Button';
import { Badge } from '@astryxdesign/core/Badge';
import { QuotingTable as Table, proportional } from '../../components/common/QuotingTable';
import { Divider } from '@astryxdesign/core/Divider';
import { Icon } from '@astryxdesign/core/Icon';
import { EmptyState } from '@astryxdesign/core/EmptyState';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import {
  ArrowUpIcon,
  ArrowDownIcon,
  PlusIcon,
  DocumentTextIcon,
  CheckCircleIcon,
  ClockIcon,
  BanknotesIcon,
} from '@heroicons/react/24/outline';
import { quotationApi } from '../../api/quotationApi';

function formatVnd(amount) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', minimumFractionDigits: 0, maximumFractionDigits: 2 }).format(amount || 0);
}

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) {
    return null;
  }
  return (
    <Card padding={3}>
      <VStack gap={0.5}>
        <Text type="supporting" color="secondary">{label}</Text>
        <Text type="body" weight="bold">
          {formatVnd(payload[0].value)}
        </Text>
      </VStack>
    </Card>
  );
}

function MetricCard({ value, change, label, positive = true, icon: IconComponent }) {
  return (
    <Card>
      <VStack gap={2}>
        <HStack hAlign="between" vAlign="center">
          <Text type="body" color="secondary">
            {label}
          </Text>
          {IconComponent && (
            <div
              style={{
                padding: 6,
                borderRadius: 8,
                backgroundColor: 'var(--color-background-surface)',
                border: '1px solid var(--color-border)',
                display: 'inline-flex',
              }}
            >
              <Icon icon={IconComponent} size="sm" color="accent" />
            </div>
          )}
        </HStack>
        <HStack gap={3} vAlign="baseline">
          <Text type="display-3" weight="bold">
            {value}
          </Text>
          <HStack gap={1} vAlign="center">
            <Icon
              icon={positive ? ArrowUpIcon : ArrowDownIcon}
              size="xsm"
              color={positive ? 'success' : 'error'}
            />
            <Text type="supporting" color={positive ? 'accent' : 'secondary'}>
              {change}
            </Text>
          </HStack>
        </HStack>
      </VStack>
    </Card>
  );
}

export default function DashboardPage() {
  const navigate = useNavigate();
  const [summary, setSummary] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const [quotations, setQuotations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      try {
        setLoading(true);
        const [result, summaryResult] = await Promise.all([quotationApi.getQuotations({ page: 1, pageSize: 5 }), quotationApi.getSummary()]);
        if (isMounted) {
          setQuotations(result?.data || []);
          setSummary(summaryResult);
        }
      } catch (err) {

        if (isMounted) {
          setErrorMessage(err.message || 'Không thể tải tổng quan báo giá. Vui lòng thử lại.');
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadData();
    return () => {
      isMounted = false;
    };
  }, []);

  const totalQuotations = summary?.totalCount ?? 0;
  const pendingCount = (summary?.draftCount ?? 0) + (summary?.sentCount ?? 0);
  const approvedCount = summary?.approvedCount ?? 0;
  const totalEstimatedRevenue = summary?.totalAmount ?? 0;
  const chartData = useMemo(() => Object.entries(summary?.monthlyAmounts || {}).map(([month, value]) => ({ name: `${month.slice(5)}/${month.slice(0, 4)}`, value })), [summary]);

  const columns = useMemo(
    () => [
      {
        key: 'quotationNumber',
        header: 'Số báo giá',
        width: proportional(1.2),
        renderCell: (row) => (
          <Text type="body" weight="semibold">
            {row.quotationNumber}
          </Text>
        ),
      },
      {
        key: 'customerName',
        header: 'Khách hàng',
        width: proportional(2),
        renderCell: (row) => (
          <VStack gap={0.5}>
            <Text type="body" weight="medium">
              {row.customerName}
            </Text>
            {row.customerPhone && (
              <Text type="supporting" color="secondary">
                {row.customerPhone}
              </Text>
            )}
          </VStack>
        ),
      },
      {
        key: 'issueDate',
        header: 'Ngày lập',
        width: proportional(1.2),
        renderCell: (row) => (
          <Text type="supporting" color="secondary">
            {row.issueDate ? new Date(row.issueDate).toLocaleDateString('vi-VN') : '—'}
          </Text>
        ),
      },
      {
        key: 'totalAmount',
        header: 'Tổng tiền',
        width: proportional(1.5),
        renderCell: (row) => (
          <Text type="body" weight="semibold">
            {formatVnd(row.totalAmount)}
          </Text>
        ),
      },
      {
        key: 'status',
        header: 'Trạng thái',
        width: proportional(1.2),
        renderCell: (row) => {
          const status = row.status || 'Draft';
          const variant =
            status === 'Approved' ? 'success' :
            status === 'Sent' ? 'warning' : 'neutral';
          const label =
            status === 'Approved' ? 'Đã duyệt' :
            status === 'Sent' ? 'Đã gửi' : 'Bản nháp';
          return <Badge label={label} variant={variant} />;
        },
      },
      {
        key: 'actions',
        header: 'Thao tác',
        width: proportional(1),
        renderCell: (row) => (
          <Button
            label="Xem chi tiết"
            variant="secondary"
            size="sm"
            onClick={() => navigate(`/quotations/${row.id}`)}
          />
        ),
      },
    ],
    [navigate]
  );

  const recentQuotations = useMemo(() => {
    return [...quotations]
      .sort((a, b) => new Date(b.issueDate || 0) - new Date(a.issueDate || 0))
      .slice(0, 5);
  }, [quotations]);

  if (loading) return <VStack gap={4} aria-label="Đang tải tổng quan"><Skeleton height={40} /><Skeleton height={120} /><Skeleton height={300} /></VStack>;
  if (errorMessage) return <Banner status="error" title="Không thể tải tổng quan" description={errorMessage} />;

  return (
    <VStack gap={6}>
      {/* Header */}
      <HStack hAlign="between" vAlign="center" wrap="wrap" gap={3}>
        <VStack gap={1}>
          <Heading level={1}>Tổng quan báo giá</Heading>
          <Text type="body" color="secondary">
            Theo dõi báo giá, trạng thái xử lý và tổng giá trị gửi khách hàng.
          </Text>
        </VStack>
        <HStack gap={2}>
          <Button
            label="Tạo báo giá"
            variant="primary"
            icon={<Icon icon={PlusIcon} size="sm" />}
            onClick={() => navigate('/quotations/create')}
          />
        </HStack>
      </HStack>

      {/* KPI Metric Cards */}
      <Grid className="quoting-grid" columns={{ minWidth: 240, repeat: 'fit' }} gap={4}>
        <MetricCard
          label="Tổng Số báo giá"
          value={String(totalQuotations)}
          change="Toàn bộ báo giá"
          positive={true}
          icon={DocumentTextIcon}
        />
        <MetricCard
          label="Chưa hoàn tất"
          value={String(pendingCount)}
          change={`${pendingCount} đang chờ`}
          positive={true}
          icon={ClockIcon}
        />
        <MetricCard
          label="Đã phê duyệt"
          value={String(approvedCount)}
          change={`Tỷ lệ ${totalQuotations ? Math.round((approvedCount / totalQuotations) * 100) : 0}%`}
          positive={true}
          icon={CheckCircleIcon}
        />
        <MetricCard
          label="Tổng giá trị báo giá"
          value={formatVnd(totalEstimatedRevenue)}
          change="Dự kiến"
          positive={true}
          icon={BanknotesIcon}
        />
      </Grid>

      {/* Revenue Trend Chart & Summary */}
      <Grid className="quoting-grid" columns={{ minWidth: 280, max: 4 }} gap={4}>
        <GridSpan columns={3}>
          <Card>
            <VStack gap={4}>
              <HStack hAlign="between" vAlign="center">
                <VStack gap={0.5}>
                  <Heading level={3}>Xu Hướng Doanh Số báo giá</Heading>
                  <Text type="supporting" color="secondary">
                    Thống kê giá trị đơn báo giá phát hành theo chu kỳ 6 tháng gần nhất
                  </Text>
                </VStack>
              </HStack>

              <div style={{ width: '100%', height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={chartData}
                    margin={{ top: 10, right: 10, left: 10, bottom: 5 }}
                  >
                    <defs>
                      <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop
                          offset="5%"
                          stopColor="var(--color-data-categorical-green, var(--color-text-success))"
                          stopOpacity={0.35}
                        />
                        <stop
                          offset="95%"
                          stopColor="var(--color-data-categorical-green, var(--color-text-success))"
                          stopOpacity={0.02}
                        />
                      </linearGradient>
                    </defs>
                    <CartesianGrid
                      horizontal
                      vertical={false}
                      stroke="var(--color-border, rgba(255, 255, 255, 0.1))"
                    />
                    <XAxis
                      dataKey="name"
                      tick={{
                        fontSize: 12,
                        fill: 'var(--color-text-secondary, var(--color-text-secondary))',
                      }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      tickFormatter={(v) => `${(v / 1000000).toFixed(0)}Tr`}
                      tick={{
                        fontSize: 12,
                        fill: 'var(--color-text-secondary, var(--color-text-secondary))',
                      }}
                      axisLine={false}
                      tickLine={false}
                      width={55}
                    />
                    <Tooltip
                      content={<ChartTooltip />}
                      cursor={{ stroke: 'var(--color-border, rgba(255, 255, 255, 0.2))' }}
                    />
                    <Area
                      type="monotone"
                      dataKey="value"
                      stroke="var(--color-data-categorical-green, var(--color-text-success))"
                      strokeWidth={2}
                      fill="url(#revenueGradient)"
                      dot={false}
                      isAnimationActive={false}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </VStack>
          </Card>
        </GridSpan>

        <GridSpan columns={1}>
          <Card height="100%">
            <VStack gap={4} justify="space-between" height="100%">
              <VStack gap={2}>
                <Heading level={3}>Tiến độ báo giá</Heading>
                <Text type="supporting" color="secondary">
                  Số báo giá theo từng trạng thái
                </Text>
                <Divider />
                <VStack gap={3}>
                  <HStack hAlign="between" vAlign="center">
                    <Text type="body">1. Tạo bản nháp</Text>
                    <Badge label={`${summary?.draftCount ?? 0}`} variant="neutral" />
                  </HStack>
                  <HStack hAlign="between" vAlign="center">
                    <Text type="body">2. Gửi đối tác xem</Text>
                    <Badge label={`${summary?.sentCount ?? 0}`} variant="warning" />
                  </HStack>
                  <HStack hAlign="between" vAlign="center">
                    <Text type="body">3. Chốt phê duyệt</Text>
                    <Badge label={`${approvedCount}`} variant="success" />
                  </HStack>
                </VStack>
              </VStack>

              <VStack gap={2}>
                <Divider />
                <Button
                  label="Xem tất cả"
                  variant="secondary"
                  size="md"
                  width="100%"
                  onClick={() => navigate('/quotations')}
                />
              </VStack>
            </VStack>
          </Card>
        </GridSpan>
      </Grid>

      {/* Recent Activity Table */}
      <Card padding={0}>
        <VStack gap={4} style={{ padding: '20px 24px 8px 24px' }}>
          <HStack hAlign="between" vAlign="center">
            <VStack gap={0.5}>
              <Heading level={3}>Hoạt Động Báo giá gần đây</Heading>
              <Text type="supporting" color="secondary">
                5 phiếu báo giá mới nhất được cập nhật trên hệ thống
              </Text>
            </VStack>
            <Button
              label="Xem tất cả"
              variant="secondary"
              size="sm"
              onClick={() => navigate('/quotations')}
            />
          </HStack>
        </VStack>

        {recentQuotations.length === 0 ? (
          <div style={{ padding: 36 }}>
            <EmptyState
              title="Chưa có báo giá nào"
              description="Bắt đầu tạo bảng báo giá đầu tiên cho đại lý hoặc chuỗi cửa hàng."
              actions={
                <Button
                  label="Tạo báo giá"
                  variant="primary"
                  icon={<Icon icon={PlusIcon} size="sm" />}
                  onClick={() => navigate('/quotations/create')}
                />
              }
            />
          </div>
        ) : (
          <Table
            data={recentQuotations}
            columns={columns}
            idKey="id"
            density="balanced"
            hasHover
          />
        )}
      </Card>
    </VStack>
  );
}
