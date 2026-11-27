import { ArrowRight, ShoppingBag, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import PageHeading from '../components/common/PageHeading';
import PhotoImage from '../components/common/PhotoImage';
import { formatMoney } from '../utils/photoPricing';
import { paths, servicePath } from '../routes/paths';

export default function CartPage() {
  const cart = useCart();
  return <div className="shell page-section">
    <PageHeading title="Giỏ hàng" trail="Giỏ hàng" description={cart.items.length ? cart.items.length + ' cấu hình · ' + cart.photoCount + ' bản in' : ''} />
    {cart.items.length ? <div className="detail-grid">
      <ul className="cart-items">{cart.items.map(item => {
        const low = item.photoFiles.filter(photo => photo.computedDpi < 150).length;
        return <li className="panel cart-item" key={item.id}>
          <PhotoImage src={item.photoFiles[0]?.thumbnailUrl || item.thumbnailUrl} className="cart-photo" />
          <div><h2><Link to={servicePath(item.productSlug)}>{item.productName}</Link></h2>
            <p>{item.sizeLabel || item.widthCm + ' × ' + item.heightCm + ' cm'} · {item.surfaceName} · {item.quantity} bản</p>
            {!!item.finishingNames.length && <p>{item.finishingNames.join(', ')}</p>}
            {item.sendAlbumLater && <p>Gửi album sau khi đặt</p>}
            {low > 0 && <p className="warning-text">{low} ảnh dưới 150 DPI</p>}
            {item.photoFiles.length > 1 && <div className="cart-strip">{item.photoFiles.slice(1, 6).map((photo, index) => <PhotoImage key={index} src={photo.thumbnailUrl} />)}</div>}
          </div>
          <div className="cart-item-end"><strong>{formatMoney(item.lineTotal)}</strong><button className="icon-button" type="button" aria-label={'Xóa ' + item.productName} onClick={() => cart.remove(item.id)}><Trash2 size={17} /></button></div>
        </li>;
      })}</ul>
      <aside className="panel form-stack"><h2>Tóm tắt đơn in</h2><dl className="price-summary"><div><dt>Số bản</dt><dd>{cart.photoCount}</dd></div>
        <div className="price-total"><dt>Tạm tính</dt><dd>{formatMoney(cart.total)}</dd></div></dl>
        <Link to={paths.checkout} className="uv-button uv-button--push3d">Tiếp tục đặt in <ArrowRight size={17} /></Link>
        <Link to={paths.services} className="text-link">Chọn thêm sản phẩm</Link>
      </aside>
    </div> : <div className="panel empty-panel"><ShoppingBag size={34} /><h2>Giỏ hàng đang trống</h2><p>Chọn một sản phẩm và tải ảnh để bắt đầu.</p>
      <Link to={paths.services} className="uv-button uv-button--push3d">Xem sản phẩm <ArrowRight size={17} /></Link></div>}
  </div>;
}
