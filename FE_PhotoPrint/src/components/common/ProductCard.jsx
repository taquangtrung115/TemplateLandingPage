import { ArrowUpRight, Box, Clock3 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { UiverseCard } from '@oneportal/uiverse-ui';
import PhotoImage from './PhotoImage';
import { billingUnit, formatMoney } from '../../utils/photoPricing';
import { paths, servicePath, withQuery } from '../../routes/paths';

export default function ProductCard({ product }) {
  return <UiverseCard variant="spotlight" interactive className="product-card">
    <Link to={servicePath(product.slug)} className="product-image-link" tabIndex={-1} aria-hidden="true">
      <PhotoImage src={product.thumbnailUrl} className="product-image" />
    </Link>
    <div className="product-content">
      <div className="product-meta">{product.categoryName && <span>{product.categoryName}</span>}{product.productionTimeLabel && <span><Clock3 size={13} />{product.productionTimeLabel}</span>}</div>
      <h3><Link to={servicePath(product.slug)}>{product.name}</Link></h3>
      <p>{product.shortDescription}</p>
      <div className="product-price"><small>Từ</small> <strong>{formatMoney(product.basePrice)}</strong><small> / {billingUnit(product.pricingMode)}</small></div>
      <div className="product-actions"><Link to={servicePath(product.slug)} className="text-link">Tải ảnh & đặt in <ArrowUpRight size={15} /></Link>
        {product.defaultModel3DType && <Link to={withQuery(paths.demo, { serviceSlug: product.slug })} aria-label={'Xem 3D ' + product.name} className="icon-button"><Box size={17} /></Link>}
      </div>
    </div>
  </UiverseCard>;
}
