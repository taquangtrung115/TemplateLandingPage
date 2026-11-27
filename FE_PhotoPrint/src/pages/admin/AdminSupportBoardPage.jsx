import { Flag, MessageSquareText, Search } from 'lucide-react';
import { useCallback, useState } from 'react';
import { UiverseBadge, UiverseButton, UiverseCard, UiverseInput } from '@oneportal/uiverse-ui';
import { photoSupportApi } from '../../api/photoSupportApi';
import { Priorities, TicketStates } from '../../models/photoPrint';
import { photoAssetUrl } from '../../api/photoUploadApi';
import useRequest from '../../hooks/useRequest';
import useDebounce from '../../hooks/useDebounce';
import PageHeading from '../../components/common/PageHeading';
import RequestState from '../../components/common/RequestState';
import PhotoImage from '../../components/common/PhotoImage';
import Pagination from '../../components/common/Pagination';
import StateEditor from './StateEditor';

const pageSize = 12;

export default function AdminSupportBoardPage() {
  const [query, setQuery] = useState(''), [priority, setPriority] = useState('');
  const [pages, setPages] = useState({});
  const [selected, setSelected] = useState(null);
  const search = useDebounce(query);
  const load = useCallback(signal => Promise.all(Object.keys(TicketStates).map(async status => ({
    status, ...await photoSupportApi.list({ status, search, priority, page: pages[status] || 1, pageSize }, signal),
  }))), [search, priority, pages]);
  const tickets = useRequest(load);

  return <>
    <PageHeading title="Yêu cầu hỗ trợ" description="Tiếp nhận, xử lý và trả lời khách tại một chỗ." />
    <div className="admin-toolbar">
      <UiverseInput labelIcon={Search} label="Tìm tên, mã yêu cầu, email hoặc SĐT" type="search" value={query} onChange={event => { setQuery(event.target.value); setPages({}); }} />
      <UiverseInput labelIcon={Flag} label="Mức độ" as="select" value={priority} onChange={event => { setPriority(event.target.value); setPages({}); }}>
        <option value="">Tất cả</option>{Object.entries(Priorities).map(([key, label]) => <option key={key} value={key}>{label}</option>)}
      </UiverseInput>
    </div>
    <RequestState result={tickets}><div className="board">
      {tickets.data?.map(({ status, items, totalCount }) => <section className="board-column" key={status}>
        <h2>{TicketStates[status]} <span>{totalCount}</span></h2>
        {items.map(ticket => <UiverseCard key={ticket.id} className="ticket-card">
          <small className="mono">{ticket.ticketCode}</small><strong>{ticket.topic}</strong>
          <p>{ticket.fullName}</p><UiverseBadge tone={ticket.priority === 'urgent' ? 'rose' : ticket.priority === 'high' ? 'amber' : 'neutral'}>{Priorities[ticket.priority]}</UiverseBadge>
          <UiverseButton icon={<MessageSquareText className="control-icon" aria-hidden="true" />} size="small" variant="outline" onClick={() => setSelected(ticket)}>Mở yêu cầu</UiverseButton>
        </UiverseCard>)}
        {!items.length && <p className="muted">Chưa có yêu cầu.</p>}
        <Pagination page={pages[status] || 1} pageSize={pageSize} totalCount={totalCount} onPage={page => setPages(current => ({ ...current, [status]: page }))} />
      </section>)}
    </div></RequestState>
    {selected && <StateEditor title={selected.ticketCode} record={selected} states={TicketStates} update={photoSupportApi.setStatus}
      onClose={() => setSelected(null)} onChanged={() => { setSelected(null); tickets.reload(); }} onConflict={tickets.reload}>
      <div><h3>{selected.topic}</h3><p>{selected.fullName} · {selected.phone}{selected.email && ' · ' + selected.email}</p>
        {selected.orderCode && <p>Đơn in: {selected.orderCode}</p>}<p className="whitespace-pre-wrap">{selected.message}</p></div>
      {photoAssetUrl(selected.attachmentUrl) && <a href={photoAssetUrl(selected.attachmentUrl)} target="_blank" rel="noreferrer">
        <PhotoImage src={selected.attachmentUrl} className="admin-preview" alt="Ảnh khách đính kèm" />
      </a>}
    </StateEditor>}
  </>;
}
