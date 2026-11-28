import { useCallback, useState } from 'react';
import { Check, Search, X } from 'lucide-react';
import { UiverseBadge, UiverseButton, UiverseInput } from '@oneportal/uiverse-ui';
import { photoPaymentApi } from '../../api/photoPaymentApi';
import Modal from '../../components/common/Modal';
import PageHeading from '../../components/common/PageHeading';
import Pagination from '../../components/common/Pagination';
import RequestState from '../../components/common/RequestState';
import useAction from '../../hooks/useAction';
import useDebounce from '../../hooks/useDebounce';
import useRequest from '../../hooks/useRequest';
import { formatMoney } from '../../utils/photoPricing';
import { paymentStatuses } from '../../utils/vietQr';

const statusFilters = ['PendingVerify', 'Verified', 'Rejected'];
const statusTone = { PendingVerify: 'neutral', Verified: 'emerald', Rejected: 'rose' };
const dateFormat = new Intl.DateTimeFormat('vi-VN', { dateStyle: 'short', timeStyle: 'short', timeZone: 'Asia/Ho_Chi_Minh' });

function VerifyDialog({ record, onClose, onChanged, onConflict }) {
  const action = useAction();
  const [stale, setStale] = useState(false);
  const approve = record.nextStatus === 'Verified';
  const label = approve ? 'Đánh dấu đã đối soát' : 'Từ chối giao dịch';
  function submit(event) {
    event.preventDefault();
    const values = new FormData(event.currentTarget);
    action.run(async signal => {
      try {
        await photoPaymentApi.verify(record.id, {
          status: record.nextStatus, expectedRevision: record.revision, staffNote: values.get('staffNote') || null,
        }, signal);
        if (!signal.aborted) onChanged();
      } catch (error) {
        if (error.status === 409) {
          setStale(true);
          onConflict();
        }
        throw error;
      }
    });
  }

  return <Modal title={label} onClose={onClose} locked={action.busy}>
    <form className="form-stack" onSubmit={submit}>
      <p>{approve ? 'Chỉ xác nhận sau khi so khớp khoản tiền trong sao kê ngân hàng.' : 'Khách có thể gửi lại xác nhận sau khi giao dịch này bị từ chối.'}</p>
      <dl className="price-summary"><div><dt>Mã giao dịch</dt><dd>{record.transactionCode}</dd></div>
        <div><dt>Số tiền</dt><dd>{formatMoney(record.amount)}</dd></div></dl>
      <UiverseInput label="Ghi chú đối soát" name="staffNote" as="textarea" rows={3} maxLength={500} disabled={stale || action.busy} />
      {action.error && <p className="notice notice-error" role="alert">{action.error}{stale && ' Danh sách đã được làm mới.'}</p>}
      <UiverseButton type="submit" disabled={stale} isLoading={action.busy}>{label}</UiverseButton>
    </form>
  </Modal>;
}

export default function AdminPaymentsPage() {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [record, setRecord] = useState(null);
  const [notice, setNotice] = useState('');
  const keyword = useDebounce(search.trim(), 300);
  const load = useCallback(signal => photoPaymentApi.list({ search: keyword, status: status || undefined, page, pageSize: 20 }, signal), [keyword, status, page]);
  const request = useRequest(load);
  const { data } = request;
  return <>
    <PageHeading title="Lịch sử giao dịch VietQR" description="So khớp giao dịch khách đã gửi với sao kê ngân hàng của tiệm." />
    {notice && <p className="notice mb-4" role="status">{notice}</p>}
    {data?.summary && <div className="metric-grid payment-metrics">
      {[[data.summary.totalCount, 'Tổng giao dịch'], [data.summary.pendingCount, 'Chờ đối soát'],
        [formatMoney(data.summary.verifiedAmount), 'Tổng thu đã đối soát']].map(([value, label]) =>
        <div className="panel metric" key={label}><span>{label}</span><strong>{value}</strong></div>)}
    </div>}
    <div className="form-columns panel mb-4">
      <UiverseInput label="Tìm mã giao dịch, mã đơn hoặc SĐT" labelIcon={Search} type="search" maxLength={150} value={search}
        onChange={event => { setSearch(event.target.value); setPage(1); }} />
      <UiverseInput as="select" label="Trạng thái giao dịch" value={status} onChange={event => { setStatus(event.target.value); setPage(1); }}>
        <option value="">Tất cả trạng thái</option>
        {statusFilters.map(key => <option key={key} value={key}>{paymentStatuses[key]}</option>)}
      </UiverseInput>
    </div>
    <RequestState result={request}>
      {data?.items.length === 0 && <p className="notice">Chưa có giao dịch phù hợp.</p>}
      {data && <><ul className="form-stack">{data.items.map(item => <li className="panel payment-record" key={item.id}>
        <div className="section-heading"><div><h2 className="mono">{item.transactionCode}</h2>
          <p>{item.orderCode} · {dateFormat.format(new Date(item.createdAtUtc))}</p></div>
          <UiverseBadge tone={statusTone[item.status]}>{paymentStatuses[item.status]}</UiverseBadge></div>
        <dl className="price-summary">
          <div><dt>Số tiền</dt><dd>{formatMoney(item.amount)}</dd></div>
          <div><dt>Ngân hàng / STK</dt><dd>{item.bankName} · {item.bankAccountNumber}</dd></div>
          <div><dt>Nội dung chuyển khoản</dt><dd>{item.transferMemo}</dd></div>
          <div><dt>SĐT đặt in</dt><dd>{item.customerPhone}</dd></div>
        </dl>
        {item.note && <p className="muted mt-2">Ghi chú của khách · {item.note}</p>}
        {item.staffNote && <p className="muted mt-2">Ghi chú đối soát · {item.staffNote}</p>}
        {item.status === 'PendingVerify' && <div className="action-row mt-4">
          <UiverseButton icon={<Check size={16} />} onClick={() => setRecord({ ...item, nextStatus: 'Verified' })}>Đánh dấu đã đối soát</UiverseButton>
          <UiverseButton icon={<X size={16} />} variant="outline" onClick={() => setRecord({ ...item, nextStatus: 'Rejected' })}>Từ chối</UiverseButton>
        </div>}
      </li>)}</ul>
      <Pagination page={page} totalCount={data.totalCount} pageSize={data.pageSize} onPage={setPage} /></>}
    </RequestState>
    {record && <VerifyDialog record={record} onClose={() => setRecord(null)} onConflict={request.reload}
      onChanged={() => { setNotice(record.nextStatus === 'Verified' ? 'Đã đối soát giao dịch.' : 'Đã từ chối giao dịch.'); setRecord(null); request.reload(); }} />}
  </>;
}
