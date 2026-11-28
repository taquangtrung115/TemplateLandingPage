import { ArrowRight, QrCode, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCart } from '../../contexts/CartContext';
import { useContactConfig } from '../../contexts/ContactConfigContext';
import { paths } from '../../routes/paths';
import { formatMoney } from '../../utils/photoPricing';
import { canUseVietQr } from '../../utils/vietQr';
import Modal from './Modal';
import PhotoImage from './PhotoImage';

export default function StrideCartDialog({ onClose }) {
  const cart = useCart();
  const { config } = useContactConfig();
  return <Modal title="Giỏ hàng" id="cart-dlg" onClose={onClose}>
    {cart.items.length ? <div className="form-stack">
      <ul className="stride-cart-list">
        {cart.items.map(item => <li key={item.id}>
          <PhotoImage src={item.thumbnailUrl} />
          <div><strong>{item.productName}</strong><p className="muted">{item.quantity} bản · {item.sizeLabel}</p></div>
          <span className="mono">{formatMoney(item.lineTotal)}</span>
          <button type="button" className="icon-button" onClick={() => cart.remove(item.id)} aria-label={'Xóa ' + item.productName}><Trash2 size={16} /></button>
        </li>)}
      </ul>
      <dl className="price-summary">
        {cart.comboDiscount > 0 && <div><dt>Giảm giá Combo 3</dt><dd>−{formatMoney(cart.comboDiscount)}</dd></div>}
        <div className="price-total"><dt>Tạm tính</dt><dd>{formatMoney(cart.total)}</dd></div>
      </dl>
      <div className="action-row">
        <Link to={paths.checkout} className="uv-button uv-button--push3d" onClick={onClose}>
          {canUseVietQr(config) ? <><QrCode size={16} /> Thanh toán VietQR</> : <>Tiếp tục đặt in <ArrowRight size={16} /></>}
        </Link>
        <Link to={paths.cart} className="uv-button uv-button--outline" onClick={onClose}>Xem chi tiết giỏ</Link>
      </div>
    </div> : <p className="notice">Giỏ hàng đang trống.</p>}
  </Modal>;
}
