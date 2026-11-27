import { Link } from 'react-router-dom';
import { photoOrderApi } from '../../api/photoOrderApi';
import { photoSupportApi } from '../../api/photoSupportApi';
import { photoProductApi } from '../../api/photoProductApi';
import PageHeading from '../../components/common/PageHeading';
import RequestState from '../../components/common/RequestState';
import useRequest from '../../hooks/useRequest';
import { formatMoney } from '../../utils/photoPricing';
import { paths } from '../../routes/paths';

const load = async signal => {
  const [orders, waiting, support, products] = await Promise.all([
    photoOrderApi.list({ page: 1, pageSize: 20 }, signal),
    photoOrderApi.list({ status: 'FileChecking', page: 1, pageSize: 1 }, signal),
    photoSupportApi.list({ status: 'New', page: 1, pageSize: 1 }, signal),
    photoProductApi.search({ page: 1, pageSize: 1 }, signal),
  ]);
  return { orders, waiting: waiting.totalCount, support: support.totalCount, products: products.totalCount };
};

export default function AdminDashboardPage() {
  const dashboard = useRequest(load);
  const data = dashboard.data;
  return <>
    <PageHeading title="Tổng quan tiệm ảnh" description="Theo dõi đơn in và yêu cầu từ khách." />
    <RequestState result={dashboard}>{data && <>
      <div className="metric-grid">
        {[[data.orders.totalCount, 'Đơn in', paths.adminOrders], [data.waiting, 'Đang kiểm tra ảnh', paths.adminOrders],
          [data.support, 'Hỗ trợ mới', paths.adminSupport], [data.products, 'Sản phẩm đang bán', paths.adminServices]].map(([value, label, to]) =>
          <Link to={to} className="panel metric" key={label}><span>{label}</span><strong>{value}</strong></Link>)}
      </div>
      <section className="panel mt-6"><div className="section-heading"><h2>Đơn in gần đây</h2><Link className="text-link" to={paths.adminOrders}>Xem danh sách</Link></div>
        {data.orders.items.length ? <ul className="admin-list">{data.orders.items.map(order =>
          <li key={order.id}><strong className="mono">{order.orderCode}</strong><span>{order.totalPhotoCount} bản · {formatMoney(order.grandTotal)}</span></li>)}</ul>
          : <p className="muted">Chưa có đơn in.</p>}
      </section>
    </>}</RequestState>
  </>;
}
