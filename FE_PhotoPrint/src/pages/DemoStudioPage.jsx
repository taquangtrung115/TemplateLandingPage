import { lazy, Suspense, useCallback, useEffect, useRef, useState } from 'react';
import { Camera, RotateCcw, ArrowLeftRight, Box, Frame, ImageUp, Lightbulb, ListFilter, Palette, Printer, RotateCw, Ruler, Type } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { UiverseButton, UiverseInput, UiverseLoader, UiverseToggle } from '@oneportal/uiverse-ui';
import PageHeading from '../components/common/PageHeading';
import RequestState from '../components/common/RequestState';
import PhotoImage from '../components/common/PhotoImage';
import { photoDemoApi } from '../api/photoDemoApi';
import { photoProductApi } from '../api/photoProductApi';
import { photoAssetUrl } from '../api/photoUploadApi';
import { usePhotoDraft } from '../contexts/PhotoDraftContext';
import { FrameColors, FrameHex, ModelNames, standardDimensions } from '../models/photoPrint';
import { photoAccept, readPhoto, validateUpload } from '../utils/fileUpload';
import { orientPrintSize } from '../utils/photoQuality';
import { paths, servicePath, withQuery } from '../routes/paths';
import useRequest from '../hooks/useRequest';
import useObjectUrl from '../hooks/useObjectUrl';
import useAction from '../hooks/useAction';

const Stage = lazy(() => import('../components/three/ThreeStageCanvas'));
const defaultImage = '/assets/photo-texture.webp';
const defaultRight = '/assets/photo-texture-alt.webp';

function Studio({ linkedProduct, preset }) {
  const { draft, setDraft } = usePhotoDraft();
  const navigate = useNavigate();
  const stage = useRef(null);
  const action = useAction();
  const draftPhoto = draft?.productSlug === linkedProduct?.slug ? draft?.photo : null;
  const firstModel = Object.hasOwn(ModelNames, preset) ? preset : linkedProduct?.defaultModel3DType || 'framed_photo';
  const [model, setModel] = useState(firstModel);
  const [size, setSize] = useState(() => {
    const [width, height] = standardDimensions[firstModel] ?? standardDimensions.framed_photo;
    return { widthCm: draft?.widthCm || width, heightCm: draft?.heightCm || height };
  });
  const [photo, setPhoto] = useState(draftPhoto);
  const [rightPhoto, setRightPhoto] = useState(null);
  const [sample, setSample] = useState(null);
  const [caption, setCaption] = useState(draftPhoto?.caption || '');
  const [frame, setFrame] = useState('oak');
  const [mat, setMat] = useState(true);
  const [warm, setWarm] = useState(false);
  const [autoRotate, setAutoRotate] = useState(false);
  const [flip, setFlip] = useState(false);
  const [back, setBack] = useState(false);
  const [filter, setFilter] = useState('');
  const src = useObjectUrl(photo?.file);
  const rightSrc = useObjectUrl(rightPhoto?.file);
  const loadDemos = useCallback(signal => photoDemoApi.list({ model3DType: filter || undefined, page: 1, pageSize: 60 }, signal), [filter]);
  const gallery = useRequest(loadDemos);
  const effectiveSize = photo ? orientPrintSize(photo.widthPx, photo.heightPx, Number(size.widthCm), Number(size.heightCm)) : size;
  const productSlug = sample?.linkedProductSlug || linkedProduct?.slug;
  const options = {
    model, ...effectiveSize, src: flip ? rightSrc || defaultRight : src || photoAssetUrl(sample?.textureImageUrl) || defaultImage,
    rightSrc: flip ? src || defaultImage : rightSrc || defaultRight,
    fitMode: photo?.fitMode || 'Fill', focalX: photo?.focalX, focalY: photo?.focalY, caption, captionFont: photo?.captionFont, borderTone: photo?.borderTone,
    frameColor: FrameHex[frame], hasMatboard: mat, warm, autoRotate: autoRotate && !back, flipped: back,
  };

  function presetModel(value) {
    setModel(value);
    setSample(null);
    setFlip(false);
    const [widthCm, heightCm] = standardDimensions[value];
    setSize({ widthCm, heightCm });
  }

  function pickPhoto(file, right) {
    if (!file) return;
    action.run(async signal => {
      validateUpload(file, 'preview');
      const dimensions = await readPhoto(file);
      if (signal.aborted) return;
      const item = { id: crypto.randomUUID(), file, ...dimensions, fitMode: 'Fill', focalX: .5, focalY: .5, printQty: 1, caption: '', captionFont: 'serif', borderTone: 'white', note: '' };
      if (right) setRightPhoto(item);
      else setPhoto(item);
    });
  }

  function pickSample(item) {
    setSample(item);
    setPhoto(null);
    setRightPhoto(null);
    setCaption('');
    setFlip(false);
    setModel(item.model3DType);
    setSize({ widthCm: item.widthCm, heightCm: item.heightCm });
    setFrame(Object.hasOwn(FrameHex, item.frameColor) ? item.frameColor : 'oak');
    setMat(Boolean(item.hasMatboard));
    document.getElementById('studio-preview')?.scrollIntoView({ block: 'start' });
  }

  function savePrint() {
    if (!productSlug) { navigate(paths.services); return; }
    const nextPhoto = photo ? { ...photo, caption } : null;
    const photos = nextPhoto ? [nextPhoto, ...(draft?.photos || []).filter(item => item.id !== nextPhoto.id)] : [];
    setDraft({ productSlug, ...size, photo: nextPhoto, photos });
    navigate(servicePath(productSlug));
  }

  return <>
    <div className="studio-grid" id="studio-preview">
      <div className="studio-stage" data-back={back}>
        <div className="studio-toolbar"><span>{ModelNames[model]}</span><small>{effectiveSize.widthCm} × {effectiveSize.heightCm} cm</small></div>
        <Suspense fallback={<UiverseLoader label="Đang dựng khung ảnh…" />}><Stage ref={stage} options={options} /></Suspense>
        {back && <div className="studio-back-spec print-back-spec" aria-live="polite">
          <h3>Thông số thành phẩm</h3>
          <p>{ModelNames[model]}</p>
          <p className="mono">{effectiveSize.widthCm} × {effectiveSize.heightCm} cm</p>
          <p>{FrameColors[frame]}{mat && model === 'framed_photo' ? ' · Có bo viền trắng' : ''}</p>
        </div>}
        <div className="studio-toolbar">
          <button type="button" className="icon-button" aria-label="Đặt lại góc nhìn" onClick={() => stage.current?.resetCamera()}><RotateCcw size={18} /></button>
          <UiverseButton variant="outline" aria-pressed={back} onClick={() => setBack(value => !value)} icon={<RotateCw size={17} />}>
            {back ? 'Xem mặt trước' : 'Lật mặt sau 180°'}
          </UiverseButton>
          <UiverseToggle labelIcon={RotateCw} label="Tự xoay" checked={autoRotate} onChange={setAutoRotate} />
          <UiverseButton isLoading={action.busy} variant="outline" icon={<Camera size={17} />} onClick={() => action.run(async () => {
            const snapshot = await stage.current?.captureSnapshot();
            if (!snapshot) throw new Error('Khung ảnh đang tải. Hãy thử lại.');
            const link = document.createElement('a');
            link.href = snapshot;
            link.download = 'photo-print-mockup.png';
            link.click();
          })}>Lưu PNG</UiverseButton>
        </div>
      </div>
      <aside className="panel form-stack" aria-label="Cấu hình Studio">
        <UiverseInput as="select" labelIcon={Box} label="Kiểu thành phẩm" value={model} onChange={event => presetModel(event.target.value)}>
          {Object.entries(ModelNames).map(([key, label]) => <option value={key} key={key}>{label}</option>)}
        </UiverseInput>
        <UiverseInput labelIcon={ImageUp} label={model === 'photobook_open' ? 'Ảnh trang trái' : 'Tải ảnh xem thử'} type="file" accept={photoAccept} onChange={event => { pickPhoto(event.target.files[0], false); event.target.value = ''; }} />
        {model === 'photobook_open' && <>
          <UiverseInput labelIcon={ImageUp} label="Ảnh trang phải" type="file" accept={photoAccept} onChange={event => { pickPhoto(event.target.files[0], true); event.target.value = ''; }} />
          <UiverseButton icon={<ArrowLeftRight className="control-icon" aria-hidden="true" />} variant="outline" onClick={() => setFlip(value => !value)}>Đổi hai trang</UiverseButton>
        </>}
        <div className="form-columns">
          <UiverseInput labelIcon={Ruler} label="Rộng (cm)" type="number" min="1" max="500" value={size.widthCm} onChange={event => setSize(value => ({ ...value, widthCm: event.target.value }))} />
          <UiverseInput labelIcon={Ruler} label="Cao (cm)" type="number" min="1" max="500" value={size.heightCm} onChange={event => setSize(value => ({ ...value, heightCm: event.target.value }))} />
        </div>
        {model === 'polaroid_card' && <UiverseInput labelIcon={Type} label="Chữ dưới ảnh" maxLength={100} value={caption} onChange={event => setCaption(event.target.value)} />}
        <UiverseInput as="select" labelIcon={Palette} label="Màu khung / cạnh" value={frame} onChange={event => setFrame(event.target.value)}>
          {Object.entries(FrameColors).map(([key, label]) => <option value={key} key={key}>{label}</option>)}
        </UiverseInput>
        {model === 'framed_photo' && <UiverseToggle labelIcon={Frame} label="Bo viền trắng" checked={mat} onChange={setMat} />}
        <UiverseToggle labelIcon={Lightbulb} label="Đèn vàng gallery" variant="day-night" checked={warm} onChange={setWarm} />
        {action.error && <p role="alert" className="notice notice-error">{action.error}</p>}
        <UiverseButton icon={<Printer className="control-icon" aria-hidden="true" />} onClick={savePrint} disabled={Number(size.widthCm) < 1 || Number(size.heightCm) < 1 || Number(size.widthCm) > 500 || Number(size.heightCm) > 500}>{productSlug ? 'Đặt in theo mẫu này' : 'Chọn sản phẩm để đặt in'}</UiverseButton>
      </aside>
    </div>
    <section className="mt-12" aria-labelledby="demo-title">
      <div className="section-heading"><div><h2 id="demo-title">Thư viện thành phẩm</h2><p>Chọn mẫu để xem trong studio.</p></div>
        <UiverseInput as="select" labelIcon={ListFilter} label="Lọc theo kiểu in" value={filter} onChange={event => setFilter(event.target.value)}><option value="">Tất cả</option>
          {Object.entries(ModelNames).map(([key, label]) => <option value={key} key={key}>{label}</option>)}
        </UiverseInput>
      </div>
      <RequestState result={gallery}>{gallery.data?.items.length ? <div className="product-grid">{gallery.data.items.map(item => <article className="uv-card product-card" key={item.id}>
        <PhotoImage src={item.previewImageUrl} className="product-image" alt={item.title} /><div className="product-content">
          <h3>{item.title}</h3><p>{item.widthCm} × {item.heightCm} cm · {item.description}</p>
          <UiverseButton icon={<Box className="control-icon" aria-hidden="true" />} variant="outline" onClick={() => pickSample(item)}>Thử trên Studio 3D</UiverseButton></div>
      </article>)}</div> : <p className="notice">Chưa có mẫu phù hợp.</p>}</RequestState>
    </section>
  </>;
}

export default function DemoStudioPage() {
  const [params] = useSearchParams();
  const slug = params.get('serviceSlug');
  const load = useCallback(signal => slug ? photoProductApi.detail(slug, signal) : Promise.resolve(null), [slug]);
  const product = useRequest(load);
  return <div className="shell page-section"><PageHeading title="Studio ảnh 3D" trail="Studio 3D" description="Thử ảnh của bạn trên khung, canvas, pha lê và photobook." />
    {product.loading ? <UiverseLoader /> : <>
      {product.error && <RequestState result={product} />}
      <Studio key={slug || params.get('preset') || 'studio'} linkedProduct={product.data} preset={params.get('preset')} />
    </>}
  </div>;
}
