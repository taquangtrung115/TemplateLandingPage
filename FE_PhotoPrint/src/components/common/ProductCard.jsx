import { Box, Clock3 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { UiverseCard } from '@oneportal/uiverse-ui';
import PhotoImage from './PhotoImage';
import { billingUnit, formatMoney } from '../../utils/photoPricing';
import { printServicePresets } from '../../models/photoPrint';
import { paths, servicePath, withQuery } from '../../routes/paths';

export default function ProductCard({ product }) {
  const preset = printServicePresets.find(item => item.slug === product.slug || item.category === product.categorySlug);
  return <UiverseCard className="product-card" data-tone={preset?.tone}>
    <Link to={servicePath(product.slug)} className="product-image-link" tabIndex={-1} aria-hidden="true">
      <PhotoImage src={product.thumbnailUrl} className="product-image" />
    </Link>
    <div className="product-content">
      <div className="product-meta">{product.productionTimeLabel && <span><Clock3 size={14} />{product.productionTimeLabel}</span>}</div>
      <h3><Link to={servicePath(product.slug)}>{product.name}</Link></h3>
      <p>{product.shortDescription}</p>
      <div className="product-price"><small>Từ</small> <strong>{formatMoney(product.basePrice)}</strong><small> / {billingUnit(product.pricingMode)}</small></div>
      <div className="product-actions"><Link to={servicePath(product.slug)} className="uv-button uv-button--outline uv-button--small">Đặt in</Link>
        {product.defaultModel3DType && <Link to={withQuery(paths.demo, { serviceSlug: product.slug })} aria-label={'Xem 3D ' + product.name} className="icon-button"><Box size={17} /></Link>}
      </div>
    </div>
  </UiverseCard>;
}
