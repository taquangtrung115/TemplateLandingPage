import { Phone, ReceiptText, Search } from 'lucide-react';
import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { UiverseBadge, UiverseButton, UiverseInput } from '@oneportal/uiverse-ui';
import PageHeading from '../components/common/PageHeading';
import { photoOrderApi } from '../api/photoOrderApi';
import { OrderStates } from '../models/photoPrint';
import useAction from '../hooks/useAction';
import { sanitizePhone } from '../utils/safeUrl';
import { formatMoney } from '../utils/photoPricing';

export default function OrderTrackingPage() {
  const [params] = useSearchParams();
  const [order, setOrder] = useState(null);
  const action = useAction();
  function submit(event) {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(event.currentTarget));
    action.run(async signal => {
      setOrder(null);
      const phone = sanitizePhone(data.phone);
      if (!phone) throw new Error('Nhập số điện thoại đã dùng để đặt in.');
      const result = await photoOrderApi.track({ code: data.code.trim().toUpperCase(), phone }, signal);
      if (!signal.aborted) setOrder(result);
    });
  }
  const entries = Object.entries(OrderStates).filter(([key]) => key !== 'Cancelled');
  const currentIndex = entries.findIndex(([key]) => key === order?.status);
  return <div className="shell page-section">
    <PageHeading title="Tra cứu đơn in" trail="Tra cứu" description="Nhập mã đơn và số điện thoại đã dùng để đặt in." />
    <div className="detail-grid">
      <form className="panel form-stack" onSubmit={submit}>
        <UiverseInput required labelIcon={ReceiptText} label="Mã đơn" name="code" defaultValue={params.get('code') || ''} placeholder="PA-YYYYMMDD-XXXX" maxLength={36} />
        <UiverseInput required labelIcon={Phone} label="Số điện thoại" type="tel" name="phone" maxLength={30} />
        {action.error && <p className="notice notice-error" role="alert">{action.error}</p>}
        <UiverseButton icon={<Search className="control-icon" aria-hidden="true" />} type="submit" isLoading={action.busy}>Tra cứu</UiverseButton>
      </form>
      {order && <section className="panel form-stack" aria-live="polite">
        <h2 className="mono">{order.orderCode}</h2>
        {order.status === 'Cancelled' ? <UiverseBadge tone="rose">Đã hủy</UiverseBadge> : <ol className="timeline">
          {entries.map(([key, label], index) => <li key={key} data-done={index <= currentIndex} aria-current={index === currentIndex ? 'step' : undefined}>{label}</li>)}
        </ol>}
        {order.adminNote && <p className="notice">{order.adminNote}</p>}
        {order.items?.map((item, index) => <p key={item.id || index}>{item.productName} · {item.sizeLabel} · {item.quantity} bản</p>)}
        {order.grandTotal != null && <strong>{formatMoney(order.grandTotal)}</strong>}
      </section>}
    </div>
  </div>;
}
