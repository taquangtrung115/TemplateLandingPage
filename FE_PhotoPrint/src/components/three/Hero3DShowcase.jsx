import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { ArrowRight, Frame, Image, Layers3, Pause, Play, RotateCw, ScanLine, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
import { paths, servicePath } from '../../routes/paths';
import useStrideTravel, { useStrideMotion } from '../../hooks/useStrideTravel';
import StridePrintBoard from './StridePrintBoard';

const Stage = lazy(() => import('./ThreeStageCanvas'));
const slots = [
  [0, 0, 376, 0, 0], [292, 28, 278, 4, 18], [536, 58, 256, 8, 28],
  [760, 96, 240, 12, 36], [965, 136, 224, 15, 42],
];
const steps = [
  { lines: ['In ảnh &', 'Ảnh thẻ 15p'], description: 'Ảnh lụa Fuji · Ảnh thẻ cắt sẵn. Nhận ảnh tại quầy hoặc gửi file qua Zalo.', Icon: Layers3 },
  { lines: ['Bảng giá &', 'Quy cách'], description: 'Lật mặt sau 180° để xem quy cách in và đơn giá của dịch vụ đang chọn.', Icon: Frame },
  { lines: ['Ép Plastic', '& Photo A4'], description: 'In màu laser · Ép dẻo · Scan PDF · Đóng cuốn lò xo.', Icon: ScanLine },
  { lines: ['Thanh toán', 'VietQR 24/7'], description: 'Quét mã theo đơn in và gửi xác nhận để tiệm đối soát.', Icon: Zap },
];
const photos = [
  ['/assets/photo-polaroid.webp', '12%', '20%', '112px', '-18deg'],
  ['/assets/photo-frame.webp', '66%', '16%', '78px', '23deg'],
  ['/assets/photo-texture-alt.webp', '86%', '18%', '94px', '5deg'],
  ['/assets/photo-texture.webp', '7%', '72%', '84px', '-16deg'],
  ['/assets/photo-prints.webp', '21%', '84%', '72px', '12deg'],
];
const wrap = (index, size) => ((index % size) + size) % size;

export default function Hero3DShowcase({ boards, catalogReady }) {
  const reduced = useStrideMotion();
  const [{ position, previous }, setSlide] = useState({ position: 1, previous: 1 });
  const [autoplay, setAutoplay] = useState(!reduced);
  const [flipped, setFlipped] = useState(false);
  const [intro, setIntro] = useState(() => {
    if (reduced) return false;
    try { return sessionStorage.getItem('photoprint.stride.intro') !== 'seen'; } catch { return false; }
  });
  const pointer = useRef(null);
  const suppressedClick = useRef(false);
  const heroSection = useRef(null);
  const [inHero, setInHero] = useState(true);
  const board = boards[wrap(position, boards.length)];
  const travel = useStrideTravel({ active: board.slug, reduced, enabled: !reduced, catalogReady });
  const step = steps[travel.step];
  const stepFlipped = travel.step === 1;
  const activeFlip = travel.part === 'hero' ? flipped : travel.part === 'inside' && stepFlipped;
  const stageOptions = { model: 'print_board', board, widthCm: 10, heightCm: 13.6, src: board.image, flipped: activeFlip };

  function dismissIntro() {
    setIntro(false);
    try { sessionStorage.setItem('photoprint.stride.intro', 'seen'); } catch { /* The current view can continue. */ }
  }

  function select(next) {
    setSlide(current => ({ position: next, previous: current.position }));
    setFlipped(false);
    setAutoplay(false);
  }

  useEffect(() => {
    if (typeof IntersectionObserver !== 'function') return;
    const observer = new IntersectionObserver(([entry]) => setInHero(entry.intersectionRatio > 0.5), { threshold: 0.5 });
    if (heroSection.current) observer.observe(heroSection.current);
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    if (!intro) return;
    if (reduced) { dismissIntro(); return; }
    const timeout = setTimeout(dismissIntro, 760);
    return () => clearTimeout(timeout);
  }, [intro, reduced]);
  useEffect(() => {
    if (!autoplay || reduced || intro || !inHero || flipped) return;
    const interval = setInterval(() => {
      if (!document.hidden) setSlide(current => ({ position: current.position + 1, previous: current.position }));
    }, 4000);
    return () => clearInterval(interval);
  }, [autoplay, reduced, intro, inHero, flipped]);

  const items = Array.from({ length: 9 }, (_, index) => position - 4 + index);
  const fallback = <StridePrintBoard board={board} flipped={activeFlip} />;

  return <>
    <section id="flavors" ref={heroSection} className="stride-hero" data-tone={board.tone}
      style={{ '--stride-previous': boards[wrap(previous, boards.length)].color }} aria-label="Dịch vụ in tại quầy">
      <div key={position} className="stride-reveal" />
      <div className="stride-rings" aria-hidden="true" />
      {photos.map(([src, left, top, size, rotate]) => <img key={src} className="stride-bit" src={src} alt="" draggable="false"
        style={{ '--bit-left': left, '--bit-top': top, '--bit-size': size, '--bit-rotate': rotate }} />)}
      <div className="stride-arc" onPointerDown={event => { pointer.current = event.clientX; suppressedClick.current = false; }}
        onPointerCancel={() => { pointer.current = null; }}
        onPointerUp={event => {
          if (pointer.current != null && Math.abs(event.clientX - pointer.current) > 34) {
            suppressedClick.current = true;
            select(position + (event.clientX < pointer.current ? 1 : -1));
          }
          pointer.current = null;
        }}
        onClickCapture={event => { if (suppressedClick.current) { event.stopPropagation(); suppressedClick.current = false; } }}>
        {items.map(index => {
          const offset = index - position;
          const [x, y, height, rz, ry] = slots[Math.abs(offset)];
          const service = boards[wrap(index, boards.length)];
          const sign = Math.sign(offset);
          return <button className="stride-arc-card" type="button" key={index} aria-label={'Chọn ' + service.label}
            tabIndex={Math.abs(offset) === 1 ? 0 : -1} data-current={offset === 0} data-edge={Math.abs(offset) > 2}
            style={{ '--arc-x': x * sign, '--arc-y': y, '--arc-height': height, '--arc-tilt': rz * sign + 'deg', '--arc-depth': ry * sign + 'deg' }}
            onClick={() => select(index)} disabled={offset === 0}><StridePrintBoard board={service} /></button>;
        })}
        <div ref={travel.hero} className="stride-hero-target">
          {reduced && <StridePrintBoard board={board} flipped={flipped} />}
        </div>
      </div>
      <span className="stride-count" aria-hidden="true">{String(wrap(position, boards.length) + 1).padStart(2, '0')}</span>
      {!reduced && <button className="stride-auto" type="button" aria-pressed={autoplay} onClick={() => setAutoplay(value => !value)}>
        <span>{autoplay ? <Pause size={14} /> : <Play size={13} />}</span> Autoplay
      </button>}
      <div className="stride-title">
        <div className="stride-controls">
          <button className="stride-next" type="button" aria-label="Dịch vụ tiếp theo" onClick={() => select(position + 1)}><ArrowRight size={17} /></button>
          <button className="stride-flip" type="button" aria-label={flipped ? 'Xem mặt trước' : 'Lật 180°'}
            onClick={() => { setFlipped(value => !value); setAutoplay(false); }}><RotateCw size={15} /></button>
        </div>
        <h1 className="disp" aria-live={autoplay ? 'off' : 'polite'} key={position}>
          <Link to={board.product ? servicePath(board.slug) : paths.services}>{board.title}</Link>
        </h1>
      </div>
    </section>
    <section id="inside" ref={travel.inside} className="stride-inside" data-tone={board.tone} data-reduced={reduced}>
      <div className="stride-pin">
        <span className="stride-step-no" aria-hidden="true">{String(travel.step + 1).padStart(2, '0')}</span>
        <h2 className="disp stride-step-title">{step.lines.map(line => <span key={line}>{line}</span>)}</h2>
        <div className="stride-inside-target" ref={travel.insideTarget}>
          {reduced && <StridePrintBoard board={board} flipped={stepFlipped} />}
        </div>
        <div className="stride-step-actions" aria-label="Quy trình tại tiệm">
          {steps.map(({ Icon, lines }, index) => <button type="button" key={lines[0]} aria-label={lines.join(' ')}
            aria-pressed={travel.step === index} onClick={() => { setAutoplay(false); travel.goToStep(index); }}><Icon size={17} /></button>)}
        </div>
        <p className="stride-step-caption">{step.description}</p>
      </div>
    </section>
    {!reduced && createPortal(<div ref={travel.traveller} className="stride-traveller" aria-hidden="true">
      <Suspense fallback={fallback}><Stage options={stageOptions} /></Suspense>
    </div>, document.body)}
    {intro && createPortal(<div className="stride-intro" style={{ '--stride-intro-color': board.color }}>
      <span className="stride-intro-brand"><span className="brand-mark"><Image size={32} aria-hidden="true" /></span>{board.brand.replace(/ Lab$/, '')}</span>
      <button type="button" onClick={dismissIntro}>Bỏ qua intro</button>
    </div>, document.body)}
  </>;
}
