import { useCallback, useRef, useState } from 'react';
import { Box, Check, ImageUp, ShoppingBag, Clock, Files, FolderUp, Frame, Image, Images, Layers, Link2, Ruler, SlidersHorizontal, ZoomIn } from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { UiverseBadge, UiverseButton, UiverseCheckbox, UiverseIconLabel, UiverseInput } from '@oneportal/uiverse-ui';
import { photoProductApi } from '../api/photoProductApi';
import { uploadPhoto } from '../api/photoUploadApi';
import RequestState from '../components/common/RequestState';
import PageHeading from '../components/common/PageHeading';
import PhotoImage from '../components/common/PhotoImage';
import Modal from '../components/common/Modal';
import ContactActions from '../components/social/ContactActions';
import BatchPhotoUploader from '../components/photo/BatchPhotoUploader';
import { useCart } from '../contexts/CartContext';
import { usePhotoDraft } from '../contexts/PhotoDraftContext';
import useRequest from '../hooks/useRequest';
import useAction from '../hooks/useAction';
import { initialConfiguration } from '../models/photoPrint';
import { formatMoney, priceConfiguration } from '../utils/photoPricing';
import { evaluatePhotoPrintQuality } from '../utils/photoQuality';
import { getSafeHttpUrl } from '../utils/safeUrl';
import { uploadPhotoBatch } from '../utils/fileUpload';
import { paths, withQuery } from '../routes/paths';

function ProductDetail({ product }) {
  const { draft, setDraft } = usePhotoDraft();
  const initialDraft = draft?.productSlug === product.slug ? draft : null;
  const [config, setConfig] = useState(() => initialConfiguration(product, initialDraft));
  const [photos, setPhotos] = useState(() => initialDraft?.photos || (initialDraft?.photo ? [initialDraft.photo] : []));
  const [tab, setTab] = useState(photos.length ? 'upload' : 'gallery');
  const [activeImage, setActiveImage] = useState(0);
  const [zoom, setZoom] = useState(false);
  const [progress, setProgress] = useState(null);
  const [added, setAdded] = useState(false);
  const uploaded = useRef(new Map());
  const cart = useCart();
  const navigate = useNavigate();
  const action = useAction();
  const quantity = config.sendAlbumLater || !product.supportsBatchUpload ? Number(config.quantity) : photos.reduce((total, photo) => total + photo.printQty, 0);
  const price = priceConfiguration(product, { ...config, quantity });
  const gallery = product.gallery.length ? product.gallery : [product.thumbnailUrl];
  const actualSize = product.printSizes.find(item => item.label === config.sizeLabel);
  const album = product.defaultModel3DType === 'photobook_open';
  const nextTier = [...product.discountTiers].sort((a, b) => a.minQty - b.minQty).find(item => item.minQty > quantity);
  const set = (name, value) => { setAdded(false); setConfig(current => ({ ...current, [name]: value })); };

  function changeSize(size) {
    setAdded(false);
    setConfig(current => ({ ...current, sizeLabel: size?.label || '', widthCm: size?.widthCm || current.widthCm, heightCm: size?.heightCm || current.heightCm }));
  }

  function showDemo() {
    setDraft({ productSlug: product.slug, widthCm: Number(config.widthCm), heightCm: Number(config.heightCm), photos, photo: photos[0] });
    navigate(withQuery(paths.demo, { serviceSlug: product.slug }));
  }

  function addToCart(event) {
    event.preventDefault();
    action.run(async signal => {
      setAdded(false);
      setProgress(null);
      if (quantity < 1) { setTab('upload'); throw new Error('Tải ít nhất một ảnh hoặc chọn gửi album sau.'); }
      if (quantity > 50000 || !Number.isInteger(quantity)) throw new Error('Số bản in phải là số nguyên từ 1 đến 50.000.');
      const widthCm = Number(config.widthCm), heightCm = Number(config.heightCm);
      if (widthCm <= 0 || heightCm <= 0 || widthCm > 500 || heightCm > 500) throw new Error('Cỡ ảnh phải từ trên 0 đến 500 cm.');
      const albumUrl = config.sendAlbumLater && config.albumUrl ? getSafeHttpUrl(config.albumUrl) : null;
      if (config.sendAlbumLater && config.albumUrl && (!albumUrl || !albumUrl.startsWith('https:'))) throw new Error('Liên kết album phải bắt đầu bằng https://.');
      const selected = config.sendAlbumLater ? [] : photos;
      const pending = selected.filter(photo => !uploaded.current.has(photo.id));
      if (pending.length) {
        setProgress({ completed: 0, total: pending.length });
        await uploadPhotoBatch(pending, (photo, abortSignal) => uploadPhoto(photo.file, 'print', abortSignal), {
          signal, onProgress: (completed, total, asset, photo) => {
            uploaded.current.set(photo.id, asset);
            if (!signal.aborted) setProgress({ completed, total });
          },
        });
      }
      if (signal.aborted) return;
      const photoFiles = selected.map(({ file, id, ...metadata }) => ({
        ...metadata, ...uploaded.current.get(id), originalFileName: file.name,
        computedDpi: evaluatePhotoPrintQuality(metadata.widthPx, metadata.heightPx, widthCm, heightCm).dpi,
      }));
      cart.add({
        ...config, widthCm, heightCm, sizeLabel: actualSize?.label ?? '', quantity, photoFiles,
        albumUrl: albumUrl || '', productName: product.name, productSlug: product.slug, thumbnailUrl: product.thumbnailUrl,
        lineTotal: price.lineTotal, unitPrice: price.unitFinalPrice,
      });
      setDraft(null);
      setAdded(true);
    });
  }

  return <div className="shell page-section">
    <PageHeading title={product.name} trail="Chi tiết sản phẩm" description={product.shortDescription} />
    <div className="detail-grid">
      <section className="detail-media">
        <div className="tabs" aria-label="Nội dung sản phẩm">
          <button type="button" className="tab" aria-pressed={tab === 'gallery'} onClick={() => setTab('gallery')}><Images className="control-icon" aria-hidden="true" /> Ảnh mẫu</button>
          {product.supportsBatchUpload && <button type="button" className="tab" aria-pressed={tab === 'upload'} onClick={() => setTab('upload')}><ImageUp size={16} /> Ảnh của bạn {photos.length > 0 && '(' + photos.length + ')'}</button>}
        </div>
        <div className="uv-view-enter" key={tab}>{tab === 'gallery' ? <>
          <button className="gallery-image-button" type="button" onClick={() => setZoom(true)} aria-label="Phóng to ảnh mẫu"><PhotoImage key={activeImage} src={gallery[activeImage]} className="detail-image uv-view-enter" alt={product.name} eager /><span className="gallery-control"><ZoomIn size={18} aria-hidden="true" /></span></button>
          {gallery.length > 1 && <div className="gallery-thumbs">{gallery.map((item, index) => <button className="gallery-thumb" type="button" key={index} aria-pressed={index === activeImage} onClick={() => setActiveImage(index)} aria-label={'Ảnh mẫu ' + (index + 1)}><PhotoImage src={item} /><span className="gallery-control">{index === activeImage ? <Check size={12} aria-hidden="true" /> : <Image size={12} aria-hidden="true" />}</span></button>)}</div>}
          <p>{product.description}</p>
          {!!product.printSizes.length && <details className="specifications"><summary><UiverseIconLabel icon={Ruler}>Các cỡ ảnh của sản phẩm</UiverseIconLabel></summary><ul>{product.printSizes.map(item => <li key={item.label}>{item.label} {item.priceDeltaOrBase != null && ' · ' + formatMoney(item.priceDeltaOrBase)}</li>)}</ul></details>}
        </> : <BatchPhotoUploader photos={photos} setPhotos={setPhotos} widthCm={config.widthCm} heightCm={config.heightCm}
          limit={product.maxPhotosPerBatch} captions={product.defaultModel3DType === 'polaroid_card'} disabled={action.busy || config.sendAlbumLater} />}</div>
        {product.defaultModel3DType && <UiverseButton variant="outline" className="mt-4" icon={<Box size={18} />} onClick={showDemo}>
          {photos.length ? 'Thử ảnh này trên khung 3D' : 'Xem mẫu trên khung 3D'}
        </UiverseButton>}
      </section>
      <form className="panel configurator form-stack" onSubmit={addToCart}>
        <h2>Quy cách in</h2>
        <fieldset disabled={action.busy} className="form-stack">
          <legend><UiverseIconLabel icon={Ruler}>Cỡ ảnh</UiverseIconLabel></legend>
          <div className="tabs">{product.printSizes.map(size => <button type="button" key={size.label} className="tab"
            aria-pressed={size.label === config.sizeLabel} onClick={() => changeSize(size)}><UiverseIconLabel icon={Ruler}>{size.label}</UiverseIconLabel></button>)}
            {product.pricingMode === 'PerSqm' && <button type="button" className="tab" aria-pressed={!config.sizeLabel} onClick={() => changeSize(null)}><SlidersHorizontal className="control-icon" aria-hidden="true" /> Tùy chỉnh</button>}</div>
          {!actualSize && product.pricingMode === 'PerSqm' && <div className="form-columns">
            <UiverseInput labelIcon={Ruler} label="Rộng (cm)" required type="number" min="0.1" max="500" step="0.1" value={config.widthCm} onChange={event => set('widthCm', event.target.value)} />
            <UiverseInput labelIcon={Ruler} label="Cao (cm)" required type="number" min="0.1" max="500" step="0.1" value={config.heightCm} onChange={event => set('heightCm', event.target.value)} />
          </div>}
          {!!product.paperOrSurfaceOptions.length && <UiverseInput as="select" labelIcon={Layers} label="Giấy / Bề mặt" value={config.surfaceName} onChange={event => set('surfaceName', event.target.value)}>
            {product.paperOrSurfaceOptions.map(surface => <option key={surface.name} value={surface.name}>{surface.name}{surface.pricePerUnitOrSqm > 0 ? ' (+' + formatMoney(surface.pricePerUnitOrSqm) + ')' : ''}</option>)}
          </UiverseInput>}
          {!!product.finishingOptions.length && <fieldset className="form-stack"><legend><UiverseIconLabel icon={Frame}>Khung & gia công</UiverseIconLabel></legend>
            {product.finishingOptions.map(item => <UiverseCheckbox key={item.name} checked={config.finishingNames.includes(item.name)}
              onChange={enabled => set('finishingNames', enabled ? [...config.finishingNames, item.name] : config.finishingNames.filter(name => name !== item.name))}
              labelIcon={Frame} label={item.name} priceLabel={'+' + formatMoney(item.price) + ' / ' + (item.mode === 'PerSqm' ? 'm²' : 'tấm')} />)}
          </fieldset>}
          {album && <div className="form-columns">
            <UiverseInput as="select" labelIcon={Files} label="Số trang" value={config.productOptions.pageCount} onChange={event => set('productOptions', { ...config.productOptions, pageCount: Number(event.target.value) })}>
              {[20, 30, 40, 50].map(number => <option key={number}>{number}</option>)}
            </UiverseInput>
            <UiverseInput as="select" labelIcon={Frame} label="Loại bìa" value={config.productOptions.coverType} onChange={event => set('productOptions', { ...config.productOptions, coverType: event.target.value })}>
              {['Bìa cứng', 'Bìa vải', 'Bìa da'].map(name => <option key={name}>{name}</option>)}
            </UiverseInput>
          </div>}
          <UiverseInput as="select" labelIcon={Clock} label="Thời gian in" value={config.turnaroundMode} onChange={event => set('turnaroundMode', event.target.value)}>
            <option value="Standard">Tiêu chuẩn {product.productionTimeLabel && '· ' + product.productionTimeLabel}</option>
            {product.rushSurchargePercent > 0 && <option value="Rush">In nhanh lấy liền ( +{product.rushSurchargePercent}% )</option>}
          </UiverseInput>
          {product.supportsBatchUpload && <UiverseCheckbox checked={config.sendAlbumLater} onChange={value => set('sendAlbumLater', value)} labelIcon={FolderUp} label="Tôi sẽ gửi album gốc qua Zalo / Drive sau khi đặt" />}
          {config.sendAlbumLater && <UiverseInput labelIcon={Link2} label="Liên kết album (tùy chọn)" type="url" placeholder="https://…" value={config.albumUrl} onChange={event => set('albumUrl', event.target.value)} />}
          {config.sendAlbumLater || !product.supportsBatchUpload ? <UiverseInput labelIcon={Files} label="Số bản in" required type="number" min="1" max="50000" value={config.quantity} onChange={event => set('quantity', event.target.value)} />
            : <p className="muted">{quantity} bản in từ {photos.length} ảnh. <button type="button" className="text-link" onClick={() => setTab('upload')}><ImageUp className="control-icon" aria-hidden="true" /> Chọn ảnh</button></p>}
        </fieldset>
        {nextTier && <UiverseBadge tone="cyan">Từ {nextTier.minQty} bản giảm {nextTier.discountPercent}%</UiverseBadge>}
        <dl className="price-summary">
          <div><dt>Đơn giá gốc</dt><dd>{formatMoney(price.unitBaseCost)}</dd></div>
          {price.surfaceCost > 0 && <div><dt>Phụ phí bề mặt / tấm</dt><dd>{formatMoney(price.surfaceCost)}</dd></div>}
          {price.finishingCost > 0 && <div><dt>Gia công / tấm</dt><dd>{formatMoney(price.finishingCost)}</dd></div>}
          {price.rushFee > 0 && <div><dt>In nhanh / tấm</dt><dd>{formatMoney(price.rushFee)}</dd></div>}
          {price.discountTotal > 0 && <div><dt>Chiết khấu ({price.discountPercent}%)</dt><dd>−{formatMoney(price.discountTotal)}</dd></div>}
          <div className="price-total"><dt>Tạm tính</dt><dd>{formatMoney(price.lineTotal)}</dd></div>
        </dl>
        {progress && action.busy && <label><UiverseIconLabel icon={ImageUp}>Tải ảnh gốc {progress.completed}/{progress.total}</UiverseIconLabel><progress value={progress.completed} max={progress.total} /></label>}
        {action.error && <p role="alert" className="notice notice-error">{action.error}</p>}
        {added && <p className="notice" role="status"><Check size={16} /> Đã thêm vào giỏ. <Link to={paths.cart} className="text-link"><ShoppingBag className="control-icon" aria-hidden="true" /> Xem giỏ hàng</Link></p>}
        <UiverseButton type="submit" isLoading={action.busy} icon={<ShoppingBag size={17} />}>Thêm vào giỏ</UiverseButton>
        <ContactActions message={'Tư vấn ' + product.name + ', cỡ ' + config.widthCm + ' × ' + config.heightCm + ' cm, ' + quantity + ' bản, tạm tính ' + formatMoney(price.lineTotal)} />
      </form>
    </div>
    {zoom && <Modal title={product.name} onClose={() => setZoom(false)} wide><PhotoImage src={gallery[activeImage]} className="zoom-image" alt={product.name} eager /></Modal>}
  </div>;
}

export default function ServiceDetailPage() {
  const { slug } = useParams();
  const load = useCallback(signal => photoProductApi.detail(slug, signal), [slug]);
  const product = useRequest(load);
  return product.data ? <ProductDetail product={product.data} key={product.data.id} /> : <div className="shell page-section"><RequestState result={product} /></div>;
}
