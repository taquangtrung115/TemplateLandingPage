import { useState } from 'react';
import { Aperture, Box, Headphones, House, Menu, Package, ReceiptText, Search, ShoppingBag, Sun, Moon, UserRound, X } from 'lucide-react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { UiverseIconLabel } from '@oneportal/uiverse-ui';
import { useCart } from '../../contexts/CartContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { useContactConfig } from '../../contexts/ContactConfigContext';
import { paths, withQuery } from '../../routes/paths';
import ContactActions from '../social/ContactActions';

const links = [[paths.home, 'Trang chủ', House], [paths.services, 'Sản phẩm', Package], [paths.demo, 'Studio 3D', Box],
  [paths.trackOrder, 'Tra cứu đơn', ReceiptText], [paths.support, 'Hỗ trợ', Headphones]];

export default function Navbar() {
  const { config } = useContactConfig();
  const { photoCount, items } = useCart();
  const { isAdmin, token } = useAuth();
  const { dark, toggleTheme } = useTheme();
  const [menu, setMenu] = useState(false);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();
  return <header className="site-header">
    <div className="shell nav-inner">
      <Link to={paths.home} className="brand" onClick={() => setMenu(false)}><span className="brand-mark"><Aperture size={20} /></span>{config.brandName || 'Photo Print'}</Link>
      <nav aria-label="Điều hướng chính" className={menu ? 'main-nav is-open' : 'main-nav'}>
        {links.map(([path, label, icon]) => <NavLink to={path} key={path} end={path === paths.home} onClick={() => setMenu(false)}><UiverseIconLabel icon={icon}>{label}</UiverseIconLabel></NavLink>)}
        <form className="nav-search" role="search" onSubmit={event => { event.preventDefault(); navigate(withQuery(paths.services, { q: search.trim() })); setMenu(false); }}>
          <input aria-label="Tìm sản phẩm" placeholder="Tìm ảnh, khung..." value={search} onChange={event => setSearch(event.target.value)} />
          <button type="submit" aria-label="Tìm kiếm"><Search size={16} /></button>
        </form>
      </nav>
      <div className="nav-actions">
        <span className="nav-contact"><ContactActions compact /></span>
        <button className="icon-button nav-theme" type="button" onClick={toggleTheme} aria-label={dark ? 'Giao diện sáng' : 'Giao diện tối'}>{dark ? <Sun size={18} /> : <Moon size={18} />}</button>
        <Link className="icon-button nav-account" to={isAdmin || token ? paths.admin : paths.login} aria-label={isAdmin ? 'Quản trị' : token ? 'Tài khoản' : 'Đăng nhập'}><UserRound size={18} /></Link>
        <Link className="cart-link" to={paths.cart} aria-label={'Giỏ hàng, ' + items.length + ' dòng, ' + photoCount + ' ảnh'}><ShoppingBag size={18} /><span>{photoCount}</span></Link>
        <button className="icon-button menu-trigger" type="button" onClick={() => setMenu(value => !value)} aria-label={menu ? 'Đóng menu' : 'Mở menu'} aria-expanded={menu}>{menu ? <X size={20} /> : <Menu size={20} />}</button>
      </div>
    </div>
  </header>;
}
