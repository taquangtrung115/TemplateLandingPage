import { useEffect, useState } from 'react';
import { Aperture, Box, Headphones, House, Image, Menu, MessageCircle, Package, QrCode, ReceiptText, Search, ShoppingBag, Sun, Moon, UserRound, X } from 'lucide-react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { UiverseIconLabel } from '@oneportal/uiverse-ui';
import { useCart } from '../../contexts/CartContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { useContactConfig } from '../../contexts/ContactConfigContext';
import { paths, withQuery } from '../../routes/paths';
import SocialConnectModal from '../social/SocialConnectModal';
import StrideCartDialog from './StrideCartDialog';

const links = [[paths.home, 'Trang chủ', House], [paths.services, 'Sản phẩm', Package], [paths.demo, 'Studio 3D', Box],
  [paths.trackOrder, 'Tra cứu đơn', ReceiptText], [paths.support, 'Hỗ trợ', Headphones]];
const anchors = [['flavors', 'Dịch vụ'], ['inside', 'Quy trình'], ['shop', 'Bảng giá'], ['range', 'Combo 3']];

export default function Navbar() {
  const { config } = useContactConfig();
  const { photoCount, items } = useCart();
  const { isAdmin, token } = useAuth();
  const { dark, toggleTheme } = useTheme();
  const [menu, setMenu] = useState(false);
  const [search, setSearch] = useState('');
  const [zalo, setZalo] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [anchor, setAnchor] = useState('flavors');
  const isHome = useLocation().pathname === paths.home;
  const cartLabel = 'Giỏ hàng, ' + items.length + ' dòng, ' + photoCount + ' ảnh';
  const navigate = useNavigate();
  useEffect(() => {
    if (!isHome) return;
    function update() {
      const section = anchors.findLast(([id]) => {
        const element = document.getElementById(id);
        return element && element.getBoundingClientRect().top <= Math.min(150, innerHeight * 0.25);
      });
      setAnchor(section?.[0] || 'flavors');
    }
    window.addEventListener('scroll', update, { passive: true });
    update();
    return () => window.removeEventListener('scroll', update);
  }, [isHome]);
  return <header className={'site-header' + (isHome ? ' stride-nav' : '')} data-stage={isHome ? anchor : undefined}>
    <div className="shell nav-inner">
      <Link to={paths.home} className="brand" onClick={() => setMenu(false)}><span className="brand-mark">{isHome ? <Image size={17} /> : <Aperture size={20} />}</span><span className="brand-name">{config.brandName || 'Photo Print'}</span></Link>
      {isHome && <nav className="stride-nav-pill" aria-label="Điều hướng trang chủ">
        {anchors.map(([id, label]) => <a href={'#' + id} key={id} aria-current={anchor === id ? 'location' : undefined} onClick={() => setMenu(false)}>{label}</a>)}
      </nav>}
      <nav aria-label="Điều hướng chính" className={(menu ? 'main-nav is-open' : 'main-nav') + (isHome ? ' stride-route-menu' : '')}>
        {links.map(([path, label, icon]) => <NavLink to={path} key={path} end={path === paths.home} onClick={() => setMenu(false)}><UiverseIconLabel icon={icon}>{label}</UiverseIconLabel></NavLink>)}
        <form className="nav-search" role="search" onSubmit={event => { event.preventDefault(); navigate(withQuery(paths.services, { q: search.trim() })); setMenu(false); }}>
          <input aria-label="Tìm sản phẩm" placeholder="Tìm ảnh, khung..." value={search} onChange={event => setSearch(event.target.value)} />
          <button type="submit" aria-label="Tìm kiếm"><Search size={16} /></button>
        </form>
        <Link className="mobile-quick" to={isAdmin ? paths.adminPayments : withQuery(paths.trackOrder, { payment: 'vietqr' })} onClick={() => setMenu(false)}>
          <UiverseIconLabel icon={ReceiptText}>Giao dịch</UiverseIconLabel>
        </Link>
        {config.zaloEnabled && <button className="mobile-quick" type="button" onClick={() => { setMenu(false); setZalo(true); }}><UiverseIconLabel icon={MessageCircle}>Zalo HD</UiverseIconLabel></button>}
        {isHome && <div className="stride-extra-links">
          <button type="button" className="icon-button" onClick={toggleTheme} aria-label={dark ? 'Giao diện sáng' : 'Giao diện tối'}>{dark ? <Sun size={18} /> : <Moon size={18} />}</button>
          <Link className="icon-button" to={isAdmin || token ? paths.admin : paths.login} onClick={() => setMenu(false)}
            aria-label={isAdmin ? 'Quản trị' : token ? 'Tài khoản' : 'Đăng nhập'}><UserRound size={18} /></Link>
        </div>}
      </nav>
      <div className="nav-actions">
        <Link className="nav-chip nav-transactions" to={isAdmin ? paths.adminPayments : withQuery(paths.trackOrder, { payment: 'vietqr' })} aria-label="Giao dịch" onClick={() => setMenu(false)}>
          {isHome ? <QrCode size={16} /> : <ReceiptText size={17} />}<span>Giao dịch</span>
        </Link>
        {(config.zaloEnabled || isHome) && <button type="button" className="nav-contact nav-chip" onClick={() => setZalo(true)}>{!isHome && <MessageCircle size={16} />} Zalo HD</button>}
        {!isHome && <>
          <button className="icon-button nav-theme" type="button" onClick={toggleTheme} aria-label={dark ? 'Giao diện sáng' : 'Giao diện tối'}>{dark ? <Sun size={18} /> : <Moon size={18} />}</button>
          <Link className="icon-button nav-account" to={isAdmin || token ? paths.admin : paths.login} aria-label={isAdmin ? 'Quản trị' : token ? 'Tài khoản' : 'Đăng nhập'}><UserRound size={18} /></Link>
        </>}
        {isHome ? <button type="button" className="cart-link" aria-label={cartLabel} onClick={() => setCartOpen(true)}>
          <ShoppingBag size={18} /><span id="basket-badge" data-empty={!photoCount}>{photoCount}</span>
        </button> : <Link className="cart-link" to={paths.cart} aria-label={cartLabel}><ShoppingBag size={18} /><span id="basket-badge">{photoCount}</span></Link>}
        <Link className="nav-chip nav-qr" to={items.length ? paths.checkout : withQuery(paths.trackOrder, { payment: 'vietqr' })} aria-label="QR Ngân hàng" onClick={() => setMenu(false)}>
          {!isHome && <QrCode size={17} />}<span>QR Ngân hàng</span>{isHome && <QrCode className="stride-mobile-qr" size={17} />}
        </Link>
        <button className="icon-button menu-trigger" type="button" onClick={() => setMenu(value => !value)} aria-label={menu ? 'Đóng menu' : 'Mở menu'} aria-expanded={menu}>{menu ? <X size={20} /> : <Menu size={20} />}</button>
      </div>
    </div>
    {isHome && cartOpen && <StrideCartDialog onClose={() => setCartOpen(false)} />}
    {zalo && <SocialConnectModal config={config} channel="zalo" onClose={() => setZalo(false)} />}
  </header>;
}
