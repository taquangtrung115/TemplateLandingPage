import { lazy, Suspense, useState } from 'react';
import { ArrowUpRight, Box } from 'lucide-react';
import { Link } from 'react-router-dom';
import PhotoImage from '../common/PhotoImage';
import { ModelNames, FrameHex, standardDimensions } from '../../models/photoPrint';
import { paths, withQuery } from '../../routes/paths';

const ThreeStageCanvas = lazy(() => import('./ThreeStageCanvas'));
const presets = ['framed_photo', 'crystal_mirror', 'photobook_open'];

export default function Hero3DShowcase() {
  const [preset, setPreset] = useState('framed_photo');
  const [interactive, setInteractive] = useState(false);
  const [widthCm, heightCm] = standardDimensions[preset];
  const image = <PhotoImage className="hero-image" src="/assets/photo-hero.webp" alt="Ảnh phong cảnh trong khung gỗ bên cạnh các tấm Polaroid" eager />;
  return <div className="hero-visual">
    <div className="hero-media">
      {interactive ? <Suspense fallback={image}><ThreeStageCanvas options={{
        model: preset, widthCm, heightCm, src: '/assets/photo-texture.webp', rightSrc: '/assets/photo-texture-alt.webp',
        frameColor: FrameHex.oak, hasMatboard: true, autoRotate: true,
      }} /></Suspense> : image}
      {!interactive && <button type="button" className="preview-toggle" onClick={() => setInteractive(true)}><Box size={16} /> Xem mẫu 3D</button>}
    </div>
    <div className="hero-caption">
      <div className="preset-switch" aria-label="Mẫu xem trước">
        {presets.map(model => <button key={model} type="button" aria-pressed={model === preset} onClick={() => { setPreset(model); setInteractive(true); }}>
          {ModelNames[model]}
        </button>)}
      </div>
      <Link to={withQuery(paths.demo, { preset })} className="icon-button" aria-label="Mở studio 3D"><ArrowUpRight size={19} /></Link>
    </div>
  </div>;
}
