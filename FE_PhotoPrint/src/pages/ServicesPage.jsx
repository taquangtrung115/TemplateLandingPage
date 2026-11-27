import { ArrowDownWideNarrow, Layers, Search, Target } from 'lucide-react';
import { useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import PageHeading from '../components/common/PageHeading';
import ProductCard from '../components/common/ProductCard';
import RequestState from '../components/common/RequestState';
import Pagination from '../components/common/Pagination';
import { UiverseInput } from '@oneportal/uiverse-ui';
import useDebounce from '../hooks/useDebounce';
import useRequest from '../hooks/useRequest';
import { UsageTypes } from '../models/photoPrint';
import { photoProductApi } from '../api/photoProductApi';

const pageSize = 12;

export default function ServicesPage() {
  const [params, setParams] = useSearchParams();
  const search = params.get('q') || '';
  const debounced = useDebounce(search.trim());
  const category = params.get('category') || '';
  const usage = params.get('usage') || '';
  const sort = params.get('sort') || 'featured';
  const page = Math.max(1, Number.parseInt(params.get('page'), 10) || 1);
  const categories = useRequest(photoProductApi.categories);
  const load = useCallback(signal => photoProductApi.search({ search: debounced, categorySlug: category, usage, sort, page, pageSize }, signal),
    [debounced, category, usage, sort, page]);
  const products = useRequest(load);

  function filter(name, value) {
    setParams(previous => {
      const next = new URLSearchParams(previous);
      if (value) next.set(name, value);
      else next.delete(name);
      if (name !== 'page') next.delete('page');
      return next;
    }, { replace: name === 'q' });
  }

  return <div className="shell page-section">
    <PageHeading title="Sản phẩm & in ảnh" trail="Sản phẩm" description="Chọn cỡ, chất liệu và kiểu hoàn thiện. Xem giá trước khi gửi ảnh." />
    <div className="filter-bar">
      <UiverseInput labelIcon={Search} label="Tìm theo tên hoặc kích thước" type="search" placeholder="10x15, Polaroid, khung gỗ…" value={search} onChange={event => filter('q', event.target.value)} />
      <UiverseInput as="select" labelIcon={Layers} label="Nhóm sản phẩm" value={category} onChange={event => filter('category', event.target.value)}>
        <option value="">Tất cả</option>{categories.data?.map(item => <option key={item.id} value={item.slug}>{item.name}</option>)}
      </UiverseInput>
      <UiverseInput as="select" labelIcon={Target} label="Mục đích" value={usage} onChange={event => filter('usage', event.target.value)}>
        <option value="">Tất cả</option>{Object.entries(UsageTypes).map(([key, label]) => <option key={key} value={key}>{label}</option>)}
      </UiverseInput>
      <UiverseInput as="select" labelIcon={ArrowDownWideNarrow} label="Sắp xếp" value={sort} onChange={event => filter('sort', event.target.value)}>
        <option value="featured">Nổi bật</option><option value="priceAsc">Giá thấp đến cao</option><option value="priceDesc">Giá cao đến thấp</option><option value="fastest">In lấy liền</option>
      </UiverseInput>
    </div>
    {categories.error && <RequestState result={categories} />}
    <RequestState result={products}>
      <p className="result-count">{products.data?.totalCount || 0} sản phẩm</p>
      {products.data?.items.length ? <div className="product-grid">{products.data.items.map(product => <ProductCard key={product.id} product={product} />)}</div>
        : <p className="notice">Chưa tìm thấy sản phẩm phù hợp. Thử thay đổi từ khóa hoặc nhóm sản phẩm.</p>}
      <Pagination page={page} pageSize={pageSize} totalCount={products.data?.totalCount} onPage={value => filter('page', value)} />
    </RequestState>
  </div>;
}
