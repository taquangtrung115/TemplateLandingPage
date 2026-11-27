import { House } from 'lucide-react';
import { Link } from 'react-router-dom';
import PageHeading from '../components/common/PageHeading';
import { paths } from '../routes/paths';

export default function NotFoundPage() {
  return <div className="shell page-section"><PageHeading title="Không tìm thấy trang" />
    <Link to={paths.home} className="uv-button uv-button--outline"><House className="control-icon" aria-hidden="true" /> Về trang chủ</Link></div>;
}
