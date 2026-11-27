import { Link } from 'react-router-dom';
import PageHeading from '../components/common/PageHeading';
import { paths } from '../routes/paths';

export default function NotFoundPage() {
  return <div className="shell page-section"><PageHeading title="Không tìm thấy trang" />
    <Link to={paths.home} className="uv-button uv-button--outline">Về trang chủ</Link></div>;
}
