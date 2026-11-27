import { ArrowRight, ArrowUpRight, Focus, ImageUp, Layers3, PackageCheck, ScanLine, WandSparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { photoProductApi } from '../api/photoProductApi';
import useRequest from '../hooks/useRequest';
import RequestState from '../components/common/RequestState';
import ProductCard from '../components/common/ProductCard';
import PhotoImage from '../components/common/PhotoImage';
import BeforeAfterSlider from '../components/common/BeforeAfterSlider';
import Hero3DShowcase from '../components/three/Hero3DShowcase';
import { paths, withQuery } from '../routes/paths';

const loadHome = async signal => {
  const [categories, featured] = await Promise.all([photoProductApi.categories(signal), photoProductApi.search({ featured: true, page: 1, pageSize: 8 }, signal)]);
  return { categories, products: featured.items };
};

const guarantees = [
  [Layers3, 'Màu chuẩn Lab', 'Giấy ảnh và bề mặt được chọn theo từng dòng in.'],
  [Focus, 'Kiểm tra DPI', 'Biết ảnh đủ nét cho cỡ in ngay khi tải lên.'],
  [WandSparkles, 'Cân màu & retouch', 'Có thể ghi yêu cầu riêng cho từng tấm.'],
  [PackageCheck, 'Đóng gói chống sốc', 'Bảo vệ ảnh và khung trong quá trình giao.'],
];

export default function HomePage() {
  const catalog = useRequest(loadHome);
  return <>
    <section className="home-hero"><div className="shell hero-grid">
      <div className="hero-copy">
        <div className="hero-kicker"><ScanLine size={16} /> Tiệm in ảnh chuẩn Lab</div>
        <h1>In ảnh để<br className="desktop-break" /> giữ lại <em>kỷ niệm.</em></h1>
        <p>In ảnh giấy lụa, ảnh tráng gương, khung gỗ và photobook. Tải ảnh, kiểm tra độ nét và xem thử thành phẩm trước khi đặt in.</p>
        <div className="action-row"><Link to={paths.services} className="uv-button uv-button--push3d"><ImageUp size={18} /> Tải ảnh & đặt in <ArrowRight size={17} /></Link>
          <Link to={paths.demo} className="uv-button uv-button--outline">Thử khung 3D</Link></div>
      </div>
      <Hero3DShowcase />
    </div></section>
    <section className="assurance-strip" aria-label="Dịch vụ của tiệm"><div className="shell assurance-grid">
      {guarantees.map(([Icon, title, detail]) => <div key={title}><Icon size={24} strokeWidth={1.65} /><div><h2>{title}</h2><p>{detail}</p></div></div>)}
    </div></section>
    <div className="shell home-content">
      <RequestState result={catalog}>
        {!!catalog.data?.categories.length && <section aria-labelledby="categories-title">
          <div className="section-heading"><div><h2 id="categories-title">Chọn kiểu in ảnh</h2><p>Từ ảnh lẻ để ví đến khung treo và album.</p></div>
            <Link className="text-link" to={paths.services}>Tất cả sản phẩm <ArrowUpRight size={17} /></Link></div>
          <div className="category-grid">{catalog.data.categories.slice(0, 6).map(category => <Link key={category.id} className="category-card" to={withQuery(paths.services, { category: category.slug })}>
            <PhotoImage src={category.imageUrl || category.thumbnailUrl || catalog.data.products.find(product => product.categoryId === category.id)?.thumbnailUrl} />
            <span>{category.name}<ArrowUpRight size={15} /></span>
          </Link>)}</div>
        </section>}
        {!!catalog.data?.products.length && <section aria-labelledby="featured-title">
          <div className="section-heading"><div><h2 id="featured-title">Sản phẩm được chọn nhiều</h2><p>Xem giá và quy cách cho từng kiểu in.</p></div></div>
          <div className="product-grid">{catalog.data.products.map(product => <ProductCard key={product.id} product={product} />)}</div>
        </section>}
      </RequestState>
      <section className="comparison-section"><div><h2>Từ ảnh trên điện thoại đến bản in.</h2><p>Kéo để xem ảnh trước và sau khi cân màu. Với ảnh thiếu sáng, bạn có thể ghi yêu cầu chỉnh riêng từng tấm.</p>
        <Link className="text-link" to={paths.support}>Hỏi tiệm về file ảnh <ArrowUpRight size={17} /></Link></div><BeforeAfterSlider /></section>
      <section><div className="section-heading"><h2>Đặt in qua 4 bước</h2></div>
        <ol className="steps">{['Chọn kiểu in và kích thước', 'Tải ảnh và kiểm tra DPI', 'Xem thử trên khung 3D hoặc gửi ảnh HD', 'Nhận ảnh tại tiệm hoặc giao tận nhà'].map(step => <li key={step}>{step}</li>)}</ol>
      </section>
    </div>
  </>;
}
