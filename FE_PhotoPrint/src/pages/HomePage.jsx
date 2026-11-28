import { useEffect, useMemo, useState } from 'react';
import { ArrowUpRight, Plus, QrCode, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { photoProductApi } from '../api/photoProductApi';
import useRequest from '../hooks/useRequest';
import RequestState from '../components/common/RequestState';
import ProductCard from '../components/common/ProductCard';
import BeforeAfterSlider from '../components/common/BeforeAfterSlider';
import Hero3DShowcase from '../components/three/Hero3DShowcase';
import StridePrintBoard from '../components/three/StridePrintBoard';
import SocialConnectModal from '../components/social/SocialConnectModal';
import { useCart } from '../contexts/CartContext';
import { useContactConfig } from '../contexts/ContactConfigContext';
import { printServicePresets } from '../models/photoPrint';
import { comboDiscountFor, counterOrderLine, counterServiceSlugs, formatMoney } from '../utils/photoPricing';
import { paths, servicePath, withQuery } from '../routes/paths';

const loadHome = signal => photoProductApi.search({ sort: 'fastest', page: 1, pageSize: 24 }, signal);

function QuickPriceCard({ board, onAdd }) {
  const target = board.product ? servicePath(board.slug) : paths.services;
  return <article className="stride-shop-card" data-tone={board.tone}>
    <span className="stride-shop-tag mono">{board.badge}</span>
    <h3 className="disp"><Link to={target}>{board.short}</Link></h3>
    <Link className="stride-card-print" id={'stride-card-' + board.slug} aria-label={'Đặt in ' + board.short} to={target}>
      <StridePrintBoard board={board} />
    </Link>
    <div className="stride-card-end">
      <span className="mono">{board.price || 'Xem giá'}</span>
      {board.line && <button type="button" onClick={() => onAdd(board)} aria-label={'Thêm ' + board.product.name + ' vào giỏ'}><Plus size={17} /></button>}
    </div>
  </article>;
}

function ComboBuilder({ boards, onAdded }) {
  const [selection, setSelection] = useState([]);
  const cart = useCart();
  const selected = selection.map(slug => boards.find(board => board.slug === slug)).filter(Boolean);
  const lines = selected.map(board => ({ ...board.line, comboGroupId: 'preview' }));
  const price = lines.reduce((sum, line) => sum + line.lineTotal, 0) - comboDiscountFor(lines);

  return <section id="range" className="stride-combo">
    <div className="stride-combo-grid">
      <div>
        <h2 className="disp">Combo <span>3</span><br /> Lấy liền −15%</h2>
        <div className="stride-combo-choices" aria-label="Dịch vụ ghép combo">
          {boards.map(board => <button type="button" key={board.slug} aria-label={board.product.name}
            data-reserve={!counterServiceSlugs.includes(board.slug)}
            aria-pressed={selection.includes(board.slug)} disabled={!counterServiceSlugs.includes(board.slug) || (selection.length === 3 && !selection.includes(board.slug))}
            onClick={() => setSelection(previous => previous.includes(board.slug) ? previous.filter(slug => slug !== board.slug) : [...previous, board.slug])}>
            <span className="stride-combo-thumb" data-tone={board.tone}><StridePrintBoard board={board} /></span><span>{board.short}</span>
            {selection.includes(board.slug) && <small>{selection.indexOf(board.slug) + 1}</small>}
            {!counterServiceSlugs.includes(board.slug) && <small>Đặt trước</small>}
          </button>)}
        </div>
        <button type="button" className="uv-button stride-combo-add" disabled={selected.length !== 3} onClick={() => {
          if (cart.addCombo(selected.map(board => board.line))) { setSelection([]); onAdded('Đã thêm Combo 3 vào giỏ hàng.'); }
        }}>{selected.length === 3 ? 'Thêm combo · ' + formatMoney(price) : 'Chọn thêm ' + (3 - selected.length) + ' dịch vụ'}</button>
      </div>
      <ol className="stride-combo-stage" aria-label="Dịch vụ đã chọn">
        {[0, 1, 2].map(index => {
          const board = selected[index];
          return <li key={index} className="stride-combo-slot" data-filled={Boolean(board)}>
            {board && <StridePrintBoard board={board} />}
            {board ? <button type="button" className="stride-slot-button" aria-label={'Bỏ ' + board.short + ' khỏi combo'}
              onClick={() => setSelection(previous => previous.filter(slug => slug !== board.slug))}><X size={16} /></button>
              : <span className="stride-slot-button"><X size={14} /></span>}
          </li>;
        })}
      </ol>
    </div>
  </section>;
}

export default function HomePage() {
  const catalog = useRequest(loadHome);
  const cart = useCart();
  const { config } = useContactConfig();
  const [notice, setNotice] = useState('');
  const [zalo, setZalo] = useState(false);
  const products = catalog.data?.items ?? [];
  const brand = (config.brandName || 'Photo Print') + ' Lab';
  const boards = useMemo(() => printServicePresets.map(preset => {
    const product = catalog.data?.items.find(item => item.slug === preset.slug);
    const quantity = preset.slug === 'in-anh-10x15' ? 10 : 1;
    const line = product ? counterOrderLine(product, quantity) : null;
    return { ...preset, brand, product, line, price: line ? formatMoney(line.lineTotal) : '', unit: quantity === 10 ? 'Gói 10 ảnh' : product?.productionTimeLabel,
      image: preset.image };
  }), [catalog.data, brand]);
  const comboBoards = boards.filter(board => board.line && counterServiceSlugs.includes(board.slug));
  const reserve = products.filter(product => ['anh-trang-guong', 'tranh-canvas', 'photobook-mo-phang'].includes(product.slug));
  useEffect(() => {
    if (!notice) return;
    const timeout = setTimeout(() => setNotice(''), 4600);
    return () => clearTimeout(timeout);
  }, [notice]);

  function add(board) {
    if (!board.line) return;
    cart.add(board.line);
    setNotice('Đã thêm ' + board.product.name + ' vào giỏ hàng.');
  }

  return <div className="stride-home">
    <Hero3DShowcase boards={boards} catalogReady={Boolean(catalog.data)} />
    <section id="shop" className="stride-shop">
      <div className="stride-shop-heading">
        <h2 className="disp">In ảnh &amp;<br />Ảnh thẻ 15p</h2>
        <div className="stride-shop-caption mono">
          <p>In ảnh lụa 4R, ảnh thẻ Visa/hộ chiếu lấy liền và photocopy A4 tại quầy.</p>
          <div className="action-row">
            <Link className="uv-button stride-shop-pay" to={cart.items.length ? paths.checkout : withQuery(paths.trackOrder, { payment: 'vietqr' })}><QrCode size={16} /> Thanh toán VietQR</Link>
            <button type="button" className="uv-button stride-shop-zalo" onClick={() => setZalo(true)}>Gửi file qua Zalo</button>
          </div>
        </div>
      </div>
      <RequestState result={catalog}>
        <div className="stride-shop-grid">{boards.map(board => <QuickPriceCard key={board.slug} board={board} onAdd={add} />)}</div>
      </RequestState>
      {zalo && <SocialConnectModal config={config} channel="zalo" onClose={() => setZalo(false)} />}
    </section>
    {comboBoards.length >= 3 && <ComboBuilder boards={boards.filter(board => board.line)} onAdded={setNotice} />}
    {notice && <div className="stride-feedback" role="status">{notice} <Link to={paths.cart}>Xem giỏ hàng</Link></div>}
    <div className="shell home-content">
      {reserve.length > 0 && <section><div className="section-heading"><h2 className="disp">Đặt trước tại tiệm</h2></div>
        <div className="product-grid">{reserve.map(product => <ProductCard key={product.id} product={product} />)}</div>
      </section>}
      <section className="comparison-section"><div><h2 className="disp">Ảnh trước và sau cân màu</h2><p>Kiểm tra độ nét và vùng cắt của ảnh trước khi gửi in.</p>
        <Link className="text-link" to={paths.services}>Tải ảnh và kiểm tra DPI <ArrowUpRight size={17} /></Link></div><BeforeAfterSlider /></section>
    </div>
  </div>;
}
