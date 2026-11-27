import { Outlet, useLocation } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import FloatingSocialDock from '../components/social/FloatingSocialDock';
import { isDemoMode } from '../api/axios';

export default function StorefrontLayout() {
  const { pathname } = useLocation();
  return <div className="app-shell">
    <a className="skip-link" href="#main-content">Đến nội dung chính</a>
    {isDemoMode && <div className="demo-banner">Chế độ demo · Đơn và yêu cầu hỗ trợ chỉ tồn tại trong phiên này</div>}
    <Navbar />
    <main id="main-content"><div className="uv-page-enter" key={pathname}><Outlet /></div></main>
    <Footer /><FloatingSocialDock />
  </div>;
}
