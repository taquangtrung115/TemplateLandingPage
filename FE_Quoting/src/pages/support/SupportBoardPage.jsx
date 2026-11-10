import { Icon } from '@astryxdesign/core/Icon';
import { ArrowPathIcon, EyeIcon, CheckCircleIcon, PlayIcon } from '@heroicons/react/24/outline';
import React, { useEffect, useRef, useState } from 'react';
import { Card } from '@astryxdesign/core/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '@astryxdesign/core/Badge';
import { Text, Heading } from '@astryxdesign/core/Text';
import { VStack, HStack } from '@astryxdesign/core/Stack';
import { TextInput } from '@astryxdesign/core/TextInput';
import { Selector } from '@astryxdesign/core/Selector';
import { Pagination } from '@astryxdesign/core/Pagination';
import { Skeleton } from '@astryxdesign/core/Skeleton';
import { Banner } from '@astryxdesign/core/Banner';
import { EmptyState } from '@astryxdesign/core/EmptyState';
import { Drawer, DrawerHeader } from '@astryxdesign/core/Drawer';
import { SegmentedControl, SegmentedControlItem } from '@astryxdesign/core/SegmentedControl';
import { useMediaQuery } from '@astryxdesign/core/hooks';
import { useToast } from '@astryxdesign/core/Toast';
import { quotingSupportApi } from '../../api/quotingSupportApi';
import { useAuth } from '../../contexts/AuthContext';

// #region Workflow labels
const COLUMNS = [
  { status: 'New', label: 'Mới', variant: 'blue', next: 'InProgress', action: 'Bắt đầu xử lý', icon: PlayIcon },
  { status: 'InProgress', label: 'Đang xử lý', variant: 'warning', next: 'Resolved', action: 'Đánh dấu đã xử lý', icon: CheckCircleIcon },
  { status: 'Resolved', label: 'Đã xử lý', variant: 'success', next: 'New', action: 'Mở lại yêu cầu', icon: ArrowPathIcon },
];
const PRIORITIES = { normal: { label: 'Bình thường', variant: 'neutral' }, high: { label: 'Ưu tiên cao', variant: 'warning' }, urgent: { label: 'Khẩn cấp', variant: 'error' } };
const formatDate = (value) => value ? new Date(value).toLocaleString('vi-VN') : '—';
const emptyBoard = () => Object.fromEntries(COLUMNS.map(({ status }) => [status, { data: [], total: 0 }]));
// #endregion

export default function SupportBoardPage() {
  // #region State and effects
  const { isAdmin } = useAuth();
  const toast = useToast();
  const isMobile = useMediaQuery('(max-width: 1023px)');
  const [board, setBoard] = useState(emptyBoard);
  const [pages, setPages] = useState({ New: 1, InProgress: 1, Resolved: 1 });
  const [searchTerm, setSearchTerm] = useState('');
  const [keyword, setKeyword] = useState('');
  const [priority, setPriority] = useState('');
  const [activeColumn, setActiveColumn] = useState('New');
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);
  const [error, setError] = useState(null);
  const [selected, setSelected] = useState(null);
  const [attempt, setAttempt] = useState(0);
  const requestSequence = useRef(0);
  const mutationPending = useRef(false);

  useEffect(() => {
    if (searchTerm.trim() === keyword) return;
    const timer = setTimeout(() => { setKeyword(searchTerm.trim()); setPages({ New: 1, InProgress: 1, Resolved: 1 }); }, 250);
    return () => clearTimeout(timer);
  }, [searchTerm, keyword]);

  useEffect(() => {
    if (!isAdmin) return;
    const sequence = ++requestSequence.current;
    setLoading(true); setError(null);
    Promise.all(COLUMNS.map(async ({ status }) => [status, await quotingSupportApi.searchRequests({ status, page: pages[status], pageSize: 20, searchTerm: keyword || undefined, priority: priority || undefined })]))
      .then((results) => {
        if (sequence !== requestSequence.current) return;
        setBoard(Object.fromEntries(results));
        const nextPages = { ...pages };
        for (const [status, result] of results) nextPages[status] = Math.min(pages[status], Math.max(1, Math.ceil(result.total / 20)));
        if (Object.keys(pages).some((status) => pages[status] !== nextPages[status])) setPages(nextPages);
      })
      .catch((failure) => { if (sequence === requestSequence.current) setError(failure.message || 'Không thể tải yêu cầu hỗ trợ.'); })
      .finally(() => { if (sequence === requestSequence.current) setLoading(false); });
    return () => { requestSequence.current += 1; };
  }, [isAdmin, keyword, priority, pages, attempt]);
  // #endregion

  // #region Status actions
  const handleStatusChange = async (request, status) => {
    if (mutationPending.current || !isAdmin) return;
    mutationPending.current = true; setBusyId(request.id);
    try {
      const result = await quotingSupportApi.changeStatus(request.id, status, request.revision);
      setSelected((current) => current?.id === request.id ? result.request : current);
      toast({ body: status === 'Resolved' ? 'Đã đánh dấu yêu cầu đã xử lý.' : 'Đã cập nhật trạng thái hỗ trợ.', type: 'info' });
      setAttempt((value) => value + 1);
    } catch (failure) {
      toast({ body: failure.message || 'Không thể cập nhật trạng thái hỗ trợ.', type: 'error' });
      if (failure.status === 409) { setSelected(null); setAttempt((value) => value + 1); }
    } finally { mutationPending.current = false; setBusyId(null); }
  };
  // #endregion

  if (!isAdmin) return <Banner status="info" title="Không có quyền truy cập" description="Chỉ quản trị viên được xem và xử lý yêu cầu hỗ trợ." />;
  return <VStack gap={5}>
    <HStack gap={3} hAlign="between" wrap="wrap"><VStack gap={1}><Heading level={1}>Xử lý hỗ trợ</Heading><Text color="secondary">Theo dõi yêu cầu và cập nhật tiến độ xử lý.</Text></VStack><Button icon={<Icon icon={ArrowPathIcon} size="sm" />} label="Tải lại" variant="secondary" isDisabled={loading || Boolean(busyId)} onClick={() => setAttempt((value) => value + 1)} /></HStack>
    <HStack gap={3} wrap="wrap"><TextInput label="Tìm yêu cầu hỗ trợ" placeholder="Tìm tên, email, chủ đề hoặc nội dung" value={searchTerm} onChange={setSearchTerm} width="min(100%, 380px)" /><Selector label="Mức độ ưu tiên" value={priority} onChange={(value) => { setPriority(value); setPages({ New: 1, InProgress: 1, Resolved: 1 }); }} options={[{ value: '', label: 'Tất cả mức ưu tiên' }, ...Object.entries(PRIORITIES).map(([value, option]) => ({ value, label: option.label }))]} /></HStack>
    {error && <Banner status="error" title="Không thể tải bảng hỗ trợ" description={error} />}
    {isMobile && <SegmentedControl label="Trạng thái yêu cầu hỗ trợ" value={activeColumn} onChange={setActiveColumn}>{COLUMNS.map((column) => <SegmentedControlItem key={column.status} value={column.status} label={`${column.label} (${board[column.status]?.total || 0})`} />)}</SegmentedControl>}
    <div className="support-board" aria-label="Bảng xử lý hỗ trợ">
      {COLUMNS.filter((column) => !isMobile || column.status === activeColumn).map((column) => <section key={column.status} className="support-column" aria-label={column.label}>
        <HStack gap={2} hAlign="between"><Heading level={2}>{column.label}</Heading><Badge label={board[column.status]?.total || 0} variant={column.variant} /></HStack>
        {loading ? <VStack gap={3}><Skeleton height={180} /><Skeleton height={180} /></VStack> : board[column.status]?.data?.length ? board[column.status].data.map((request) => <Card key={request.id} padding={4} aria-label={`Yêu cầu của ${request.fullName}`}>
          <VStack gap={3}>
            <HStack gap={2} wrap="wrap"><Badge {...(PRIORITIES[request.priority] || { label: request.priority || 'Không xác định', variant: 'neutral' })} /><Badge label={column.label} variant={column.variant} /><Text type="supporting" color="secondary">{formatDate(request.createdAtUtc)}</Text></HStack>
            <Heading level={3}>{request.topic}</Heading><Text weight="semibold">{request.fullName}</Text><Text color="secondary">{request.email}</Text>
            <Text className="support-message">{request.message}</Text>
            {request.resolvedAtUtc && <Text type="supporting" color="secondary">Đã xử lý: {formatDate(request.resolvedAtUtc)}</Text>}
            <HStack gap={2} wrap="wrap"><Button icon={<Icon icon={EyeIcon} size="sm" />} label="Xem chi tiết" variant="secondary" onClick={() => setSelected(request)} /><Button icon={<Icon icon={column.icon} size="sm" />} label={column.action} variant={column.status === 'InProgress' ? 'success' : 'primary'} isDisabled={Boolean(busyId)} isLoading={busyId === request.id} onClick={() => handleStatusChange(request, column.next)} /></HStack>
            {column.status === 'New' && <Button icon={<Icon icon={CheckCircleIcon} size="sm" />} label="Đánh dấu đã xử lý" variant="secondary" isDisabled={Boolean(busyId)} onClick={() => handleStatusChange(request, 'Resolved')} />}
          </VStack>
        </Card>) : <EmptyState title="Chưa có yêu cầu" description={keyword || priority ? 'Không có yêu cầu phù hợp với bộ lọc trong cột này.' : 'Yêu cầu sẽ xuất hiện khi được gửi hoặc chuyển trạng thái.'} />}
        {board[column.status]?.total > 20 && <Pagination page={pages[column.status]} pageSize={20} totalItems={board[column.status].total} onChange={(page) => setPages((current) => ({ ...current, [column.status]: page }))} />}
      </section>)}
    </div>
    <Drawer isOpen={Boolean(selected)} onOpenChange={(open) => { if (!open) setSelected(null); }} label="Chi tiết yêu cầu hỗ trợ" side="end" width={540}>
      {selected && <VStack gap={4} className="support-detail"><DrawerHeader title="Chi tiết yêu cầu hỗ trợ" onOpenChange={(open) => { if (!open) setSelected(null); }} /><Badge label={COLUMNS.find((column) => column.status === selected.status)?.label || selected.status} variant={COLUMNS.find((column) => column.status === selected.status)?.variant || 'neutral'} /><Heading level={2}>{selected.topic}</Heading><Text weight="semibold">{selected.fullName}</Text><Text>Email: {selected.email}</Text><Text>Điện thoại: {selected.phone || 'Không cung cấp'}</Text><Text>Gửi lúc: {formatDate(selected.createdAtUtc)}</Text><Text className="support-detail-message">{selected.message}</Text>{selected.resolvedAtUtc && <Text>Đã xử lý lúc: {formatDate(selected.resolvedAtUtc)}</Text>}<Selector label="Chuyển trạng thái" value={selected.status} isDisabled={Boolean(busyId)} onChange={(status) => handleStatusChange(selected, status)} options={COLUMNS.map((column) => ({ value: column.status, label: column.label }))} /></VStack>}
    </Drawer>
  </VStack>;
}
