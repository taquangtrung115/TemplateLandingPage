import { useRef, useState } from 'react';
import Modal from '../common/Modal';
import { UiverseInput } from '@oneportal/uiverse-ui';
import { UiverseButton } from '@oneportal/uiverse-ui';
import useObjectUrl from '../../hooks/useObjectUrl';
import { orientPrintSize } from '../../utils/photoQuality';

const clamp = value => Math.max(0, Math.min(1, value));

export default function PhotoCropModal({ photo, widthCm, heightCm, captions, onClose, onSave }) {
  const [draft, setDraft] = useState(photo);
  const url = useObjectUrl(photo.file);
  const target = orientPrintSize(photo.widthPx, photo.heightPx, Number(widthCm), Number(heightCm));
  const start = useRef(null);
  const update = (key, value) => setDraft(current => ({ ...current, [key]: value }));

  function handleMove(event) {
    const gesture = start.current;
    if (!gesture) return;
    const bounds = event.currentTarget.getBoundingClientRect();
    setDraft(current => ({ ...current,
      focalX: clamp(gesture.focalX - (event.clientX - gesture.x) / bounds.width),
      focalY: clamp(gesture.focalY - (event.clientY - gesture.y) / bounds.height),
    }));
  }

  return <Modal title="Căn ảnh trước khi in" onClose={onClose} wide>
    <form className="crop-grid" onSubmit={event => { event.preventDefault(); onSave(draft); }}>
      <div className="crop-paper" style={{ background: { cream: '#f6ead2', black: '#282325' }[draft.borderTone] || '#fff' }}>
        <div className={'crop-preview' + (draft.fitMode === 'Fill' ? ' is-draggable' : '')}
          style={{ aspectRatio: target.widthCm / target.heightCm || 1 }}
          onPointerDown={event => {
            if (draft.fitMode !== 'Fill') return;
            start.current = { x: event.clientX, y: event.clientY, focalX: draft.focalX, focalY: draft.focalY };
            event.currentTarget.setPointerCapture(event.pointerId);
          }}
          onPointerMove={handleMove} onPointerUp={() => { start.current = null; }} onPointerCancel={() => { start.current = null; }}>
          {url && <img src={url} alt="Vùng ảnh sẽ được in" draggable="false"
            style={{ objectFit: draft.fitMode === 'Fit' ? 'contain' : 'cover', objectPosition: (draft.focalX * 100) + '% ' + (draft.focalY * 100) + '%' }} />}
        </div>
        {captions && <p className="crop-caption" style={{ fontFamily: { serif: 'Georgia', sans: 'system-ui', script: 'cursive' }[draft.captionFont],
          color: draft.borderTone === 'black' ? '#fff' : '#211c1a' }}>{draft.caption}</p>}
      </div>
      <div className="form-stack">
        <UiverseInput as="select" label="Cách căn ảnh" value={draft.fitMode} onChange={event => update('fitMode', event.target.value)}>
          <option value="Fill">Fill · Tràn khung</option><option value="Fit">Fit · Giữ toàn ảnh</option>
        </UiverseInput>
        {draft.fitMode === 'Fill' && <>
          <UiverseInput label="Vùng lấy nét ngang" type="range" min="0" max="1" step="0.01" value={draft.focalX} onChange={event => update('focalX', Number(event.target.value))} />
          <UiverseInput label="Vùng lấy nét dọc" type="range" min="0" max="1" step="0.01" value={draft.focalY} onChange={event => update('focalY', Number(event.target.value))} />
        </>}
        {captions && <>
          <UiverseInput label="Chữ dưới ảnh" maxLength={100} value={draft.caption} onChange={event => update('caption', event.target.value)} />
          <UiverseInput as="select" label="Kiểu chữ" value={draft.captionFont} onChange={event => update('captionFont', event.target.value)}>
            <option value="serif">Có chân</option><option value="sans">Không chân</option><option value="script">Viết tay</option>
          </UiverseInput>
          <UiverseInput as="select" label="Viền ảnh" value={draft.borderTone} onChange={event => update('borderTone', event.target.value)}>
            <option value="white">Trắng</option><option value="cream">Kem</option><option value="black">Đen</option>
          </UiverseInput>
        </>}
        <UiverseInput label="Ghi chú retouch" as="textarea" rows={2} maxLength={500} value={draft.note} onChange={event => update('note', event.target.value)} />
        <UiverseButton type="submit">Áp dụng cho ảnh này</UiverseButton>
      </div>
    </form>
  </Modal>;
}
