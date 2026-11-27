import { Link } from 'react-router-dom';
import { paths } from '../../routes/paths';

export default function PageHeading({ title, description, trail, children }) {
  return <header className="page-heading">
    {trail && <nav className="breadcrumbs" aria-label="Đường dẫn"><Link to={paths.home}>Trang chủ</Link><span aria-hidden="true">/</span><span>{trail}</span></nav>}
    <h1>{title}</h1>
    {description && <p>{description}</p>}
    {children}
  </header>;
}
