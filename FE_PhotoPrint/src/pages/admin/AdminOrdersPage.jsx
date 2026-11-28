import { useCallback, useState } from 'react';
import { Download, Clock3, Eye, Search } from 'lucide-react';
import { UiverseBadge, UiverseButton, UiverseInput } from '@oneportal/uiverse-ui';
import { photoOrderApi } from '../../api/photoOrderApi';
import { photoAssetUrl } from '../../api/photoUploadApi';
import { OrderStates, parseArray } from '../../models/photoPrint';
import { formatMoney } from '../../utils/photoPricing';
import { paymentStatuses } from '../../utils/vietQr';
import useRequest from '../../hooks/useRequest';
import useDebounce from '../../hooks/useDebounce';
import PageHeading from '../../components/common/PageHeading';
import PhotoImage from '../../components/common/PhotoImage';
import RequestState from '../../components/common/RequestState';
import Pagination from '../../components/common/Pagination';
import StateEditor from './StateEditor';

const pageSize = 20;

function downloadUrl(value) {
  const safe = photoAssetUrl(value);
  if (!safe || safe.startsWith('blob:')) return safe;
  const url = new URL(safe, window.location.origin);
  if (/\/photoprint\/uploads\//.test(url.pathname)) url.searchParams.set('download', 'true');
  return url.href;
}

function OrderItem({ item }) {
  return <section className="panel form-stack"><div><h3>{item.productName}</h3>
    <p>{item.sizeLabel || item.widthCm + ' × ' + item.heightCm + ' cm'} · {item.surfaceName} · {item.quantity} bản</p>
    {item.finishingSummary && <p>{item.finishingSummary}</p>}
    {item.productOptions?.coverType && <p>{item.productOptions.coverType} · {item.productOptions.pageCount} trang</p>}
    {item.sendAlbumLater && <p>Khách gửi album gốc sau khi đặt. {photoAssetUrl(item.albumUrl) && <a className="text-link" href={photoAssetUrl(item.albumUrl)} target="_blank" rel="noreferrer">Mở album</a>}</p>}
  </div>
    {parseArray(item.photoFiles ?? item.photoFilesJson).map((photo, index) => {
      const source = downloadUrl(photo.fileUrl ?? photo.originalFileUrl);
      return <div className="order-photo" key={index}>
        <PhotoImage src={photo.thumbnailUrl || photo.fileUrl} className="admin-row-image" />
        <div><strong>{photo.originalFileName || 'Ảnh gốc'}</strong>
          <p>{photo.widthPx} × {photo.heightPx} px · {photo.printQty} bản · {photo.fitMode}</p>
          <p>Lấy nét {Math.round((photo.focalX ?? 0.5) * 100)}% ngang, {Math.round((photo.focalY ?? 0.5) * 100)}% dọc</p>
          {photo.caption && <p>Caption: {photo.caption} · {photo.captionFont} · {photo.borderTone}</p>}
          {photo.note && <p>Retouch: {photo.note}</p>}
          <UiverseBadge tone={photo.computedDpi < 150 ? 'low' : photo.computedDpi < 250 ? 'medium' : 'high'}>{photo.computedDpi} DPI</UiverseBadge>
        </div>
        {source && <a className="text-link inline-flex gap-2 items-center" href={source} target="_blank" rel="noreferrer" download><Download size={16} />Tải ảnh gốc</a>}
      </div>;
    })}
  </section>;
}

export default function AdminOrdersPage() {
  const [status, setStatus] = useState(''), [query, setQuery] = useState(''), [page, setPage] = useState(1);
  const [selected, setSelected] = useState(null);
  const search = useDebounce(query);
  const load = useCallback(signal => photoOrderApi.list({ status, search, page, pageSize }, signal), [status, search, page]);
  const orders = useRequest(load);
  return <>
    <PageHeading title="Đơn in ảnh" description="Kiểm tra file gốc, quy cách cắt và tiến độ từng đơn." />
    <div className="admin-toolbar">
      <UiverseInput type="search" labelIcon={Search} label="Tìm mã đơn, tên hoặc SĐT" value={query} onChange={event => { setQuery(event.target.value); setPage(1); }} />
      <UiverseInput labelIcon={Clock3} label="Trạng thái" as="select" value={status} onChange={event => { setStatus(event.target.value); setPage(1); }}>
        <option value="">Tất cả</option>{Object.entries(OrderStates).map(([key, label]) => <option value={key} key={key}>{label}</option>)}
      </UiverseInput>
    </div>
    <RequestState result={orders}>
      {orders.data?.items.length ? <ul className="admin-list panel">{orders.data.items.map(order => <li key={order.id}>
        <div><strong className="mono">{order.orderCode}</strong><p>{order.customerName} · {order.totalPhotoCount} bản</p></div>
        <div className="action-row"><UiverseBadge>{OrderStates[order.status] || order.status}</UiverseBadge>
          {order.transferMemo && <UiverseBadge tone={order.paymentStatus === 'Paid' ? 'emerald' : 'neutral'}>{paymentStatuses[order.paymentStatus]}</UiverseBadge>}</div>
        <strong className="mono">{formatMoney(order.grandTotal)}</strong>
        <UiverseButton icon={<Eye className="control-icon" aria-hidden="true" />} variant="outline" size="small" onClick={() => setSelected(order)}>Chi tiết</UiverseButton>
      </li>)}</ul> : <p className="notice">Chưa có đơn phù hợp.</p>}
      <Pagination page={page} pageSize={pageSize} totalCount={orders.data?.totalCount} onPage={setPage} />
    </RequestState>
    {selected && <StateEditor title={selected.orderCode} record={selected} states={OrderStates} update={photoOrderApi.setStatus}
      onClose={() => setSelected(null)} onChanged={() => { setSelected(null); orders.reload(); }} onConflict={orders.reload}>
      <div><strong>{selected.customerName}</strong><p>{selected.customerPhone}{selected.customerEmail ? ' · ' + selected.customerEmail : ''}</p>
        {selected.deliveryAddress && <p>{selected.deliveryAddress}</p>}{selected.notes && <p>{selected.notes}</p>}</div>
      {selected.paymentReceipt && <section className="panel"><h3>Biên lai VietQR</h3><dl className="price-summary">
        <div><dt>Mã giao dịch</dt><dd>{selected.paymentReceipt.transactionCode}</dd></div>
        <div><dt>Trạng thái</dt><dd>{paymentStatuses[selected.paymentReceipt.status]}</dd></div>
        <div><dt>Số tiền</dt><dd>{formatMoney(selected.paymentReceipt.amount)}</dd></div>
      </dl></section>}
      {selected.items?.map((item, index) => <OrderItem key={item.id || index} item={item} />)}
    </StateEditor>}
  </>;
}
