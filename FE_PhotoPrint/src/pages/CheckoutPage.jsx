import { CheckCircle2, CreditCard, ImageUp, Mail, MapPin, NotebookPen, Pencil, Phone, Search, Send, Truck, UserRound } from 'lucide-react';
import { Link } from 'react-router-dom';
import { UiverseButton, UiverseInput } from '@oneportal/uiverse-ui';
import { useState } from 'react';
import { useCart } from '../contexts/CartContext';
import PageHeading from '../components/common/PageHeading';
import CopyButton from '../components/common/CopyButton';
import ContactActions from '../components/social/ContactActions';
import { photoOrderApi } from '../api/photoOrderApi';
import { sanitizePhone } from '../utils/safeUrl';
import { formatMoney, orderItemPayload } from '../utils/photoPricing';
import useAction from '../hooks/useAction';
import { paths, withQuery } from '../routes/paths';

export default function CheckoutPage() {
  const [delivery, setDelivery] = useState('Pickup');
  const [order, setOrder] = useState(null);
  const cart = useCart();
  const action = useAction();

  function submit(event) {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(event.currentTarget));
    const items = [...cart.items];
    action.run(async () => {
      const phone = sanitizePhone(data.customerPhone);
      if (!phone) throw new Error('Nhập số điện thoại hợp lệ.');
      if (!data.customerName.trim()) throw new Error('Nhập họ và tên.');
      if (delivery !== 'Pickup' && !data.deliveryAddress.trim()) throw new Error('Nhập địa chỉ giao ảnh.');
      const result = await photoOrderApi.create({ ...data, customerPhone: phone, items: items.map(orderItemPayload) });
      if (!result?.orderCode) throw new Error('Máy chủ chưa trả về mã đơn.');
      setOrder(result);
      cart.removeOrdered(items);
    });
  }

  return <div className="shell page-section">
    <PageHeading title={order ? 'Tiệm đã nhận đơn' : 'Đặt in'} trail="Đặt in" />
    {order ? <div className="panel confirmation"><CheckCircle2 size={38} /><h2>Mã đơn <span className="mono">{order.orderCode}</span></h2>
      <CopyButton value={order.orderCode} children="Sao chép mã đơn" />
      <p>Tiệm sẽ kiểm tra file ảnh và liên hệ để xác nhận đơn.</p>
      {order.grandTotal != null && <p>Thành tiền đã xác nhận {formatMoney(order.grandTotal)}</p>}
      <ContactActions message={'Xin chào, mình gửi ảnh gốc và xác nhận đơn ' + order.orderCode + '.'} />
      <Link className="uv-button uv-button--outline" to={withQuery(paths.trackOrder, { code: order.orderCode })}><Search className="control-icon" aria-hidden="true" /> Tra cứu đơn</Link></div>
    : cart.items.length ? <div className="detail-grid">
      <form className="panel form-stack" onSubmit={submit}>
        <h2>Thông tin người đặt</h2>
        <fieldset className="form-stack" disabled={action.busy}>
          <UiverseInput required labelIcon={UserRound} label="Họ và tên" name="customerName" autoComplete="name" maxLength={120} />
          <div className="form-columns">
            <UiverseInput required labelIcon={Phone} label="Số điện thoại" name="customerPhone" type="tel" autoComplete="tel" maxLength={30} />
            <UiverseInput labelIcon={Mail} label="Email (tùy chọn)" name="customerEmail" type="email" autoComplete="email" maxLength={160} />
          </div>
          <UiverseInput as="select" name="deliveryMethod" labelIcon={Truck} label="Cách nhận ảnh" value={delivery} onChange={event => setDelivery(event.target.value)}>
            <option value="Pickup">Nhận tại tiệm ảnh</option><option value="LocalDelivery">Giao nhanh nội thành</option><option value="NationwideCod">Ship COD toàn quốc</option>
          </UiverseInput>
          {delivery !== 'Pickup' && <UiverseInput required labelIcon={MapPin} label="Địa chỉ giao ảnh" name="deliveryAddress" autoComplete="street-address" maxLength={350} />}
          <UiverseInput as="select" name="paymentMethod" labelIcon={CreditCard} label="Thanh toán">
            <option value="VietQr">Chuyển khoản VietQR</option><option value="Cash">Tiền mặt khi nhận</option><option value="Deposit">Đặt cọc</option>
          </UiverseInput>
          <UiverseInput as="textarea" labelIcon={NotebookPen} label="Ghi chú cho tiệm" name="notes" rows={3} maxLength={1000} />
        </fieldset>
        {action.error && <p role="alert" className="notice notice-error">{action.error}</p>}
        <UiverseButton icon={<Send className="control-icon" aria-hidden="true" />} type="submit" isLoading={action.busy}>Gửi đơn đặt in</UiverseButton>
      </form>
      <aside className="panel form-stack"><h2>Đơn in của bạn</h2><dl className="price-summary">
        {cart.items.map(item => <div key={item.id}><dt>{item.productName} · {item.quantity} bản</dt><dd>{formatMoney(item.lineTotal)}</dd></div>)}
        <div className="price-total"><dt>Tạm tính</dt><dd>{formatMoney(cart.total)}</dd></div>
      </dl><p className="muted">Máy chủ xác nhận giá theo quy cách tại thời điểm gửi đơn.</p><Link className="text-link" to={paths.cart}><Pencil className="control-icon" aria-hidden="true" /> Sửa giỏ hàng</Link></aside>
    </div> : <p className="notice">Giỏ hàng đang trống. <Link className="text-link" to={paths.services}><ImageUp className="control-icon" aria-hidden="true" /> Chọn ảnh để đặt in</Link>.</p>}
  </div>;
}
