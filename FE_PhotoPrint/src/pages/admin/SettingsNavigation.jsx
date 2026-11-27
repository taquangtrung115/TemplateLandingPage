import { NavLink } from 'react-router-dom';
import { paths } from '../../routes/paths';

export default function SettingsNavigation() {
  return <nav className="tabs mb-5" aria-label="Cài đặt quản trị">
    <NavLink className="tab" to={paths.adminSettings} end>Kênh liên hệ & QR</NavLink>
    <NavLink className="tab" to={paths.adminMembers}>Thành viên</NavLink>
    <NavLink className="tab" to={paths.adminRegistration}>Tự đăng ký</NavLink>
  </nav>;
}
