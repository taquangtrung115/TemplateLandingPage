import { NavLink } from 'react-router-dom';
import { QrCode, ReceiptText, UserPlus, Users } from 'lucide-react';
import { UiverseIconLabel } from '@oneportal/uiverse-ui';
import { paths } from '../../routes/paths';

export default function SettingsNavigation() {
  return <nav className="tabs mb-5" aria-label="Cài đặt quản trị">
    <NavLink className="tab" to={paths.adminSettings} end><UiverseIconLabel icon={QrCode}>Kênh liên hệ & QR</UiverseIconLabel></NavLink>
    <NavLink className="tab" to={paths.adminPayments}><UiverseIconLabel icon={ReceiptText}>Giao dịch QR</UiverseIconLabel></NavLink>
    <NavLink className="tab" to={paths.adminMembers}><UiverseIconLabel icon={Users}>Thành viên</UiverseIconLabel></NavLink>
    <NavLink className="tab" to={paths.adminRegistration}><UiverseIconLabel icon={UserPlus}>Tự đăng ký</UiverseIconLabel></NavLink>
  </nav>;
}
