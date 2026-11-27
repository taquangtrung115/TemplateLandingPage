import { useId, useState } from 'react';
import { ImageUp, SlidersHorizontal, Trash2 } from 'lucide-react';
import { photoAccept, readPhoto, validateUpload } from '../../utils/fileUpload';
import { evaluatePhotoPrintQuality } from '../../utils/photoQuality';
import useAction from '../../hooks/useAction';
import useObjectUrl from '../../hooks/useObjectUrl';
import { UiverseBadge } from '@oneportal/uiverse-ui';
import { UiverseInput } from '@oneportal/uiverse-ui';
import PhotoCropModal from './PhotoCropModal';

function PhotoRow({ photo, widthCm, heightCm, onEdit, onRemove, onQuantity, disabled }) {
  const picture = useObjectUrl(photo.file);
  const quality = evaluatePhotoPrintQuality(photo.widthPx, photo.heightPx, widthCm, heightCm);
  return <li className="photo-row">
    {picture && <img className="photo-thumb" src={picture} alt="" />}
    <div className="photo-row-info">
      <strong title={photo.file.name}>{photo.file.name}</strong>
      <small>{photo.widthPx} × {photo.heightPx} px</small>
      <UiverseBadge tone={quality.level}>{quality.dpi} DPI · {quality.label}</UiverseBadge>
    </div>
    <UiverseInput type="number" label="Bản in" aria-label={'Bản in ' + photo.file.name} min="1" max="999" value={photo.printQty}
      disabled={disabled} onChange={event => onQuantity(Math.min(999, Math.max(1, Number(event.target.value) || 1)))} />
    <div className="photo-row-actions">
      <button className="icon-button" type="button" disabled={disabled} onClick={onEdit} aria-label={'Căn ảnh ' + photo.file.name}><SlidersHorizontal size={18} /></button>
      <button className="icon-button" type="button" disabled={disabled} onClick={onRemove} aria-label={'Xóa ' + photo.file.name}><Trash2 size={18} /></button>
    </div>
  </li>;
}

export default function BatchPhotoUploader({ photos, setPhotos, widthCm, heightCm, limit = 50, captions, disabled }) {
  const id = useId();
  const action = useAction();
  const [selected, setSelected] = useState(null);
  const editable = photos.find(photo => photo.id === selected);
  const blocked = disabled || action.busy;
  const maxPhotos = Math.max(1, Number(limit) || 50);

  async function addPhotos(files) {
    if (blocked || !files.length) return;
    await action.run(async signal => {
      const incoming = Array.from(files), remaining = maxPhotos - photos.length;
      const added = [], errors = [];
      if (incoming.length > remaining) errors.push('Có thể thêm tối đa ' + maxPhotos + ' ảnh cho cấu hình này.');
      for (const file of incoming.slice(0, Math.max(0, remaining))) {
        if (signal.aborted) return;
        try {
          validateUpload(file);
          const resolution = await readPhoto(file);
          added.push({ ...resolution, file, id: crypto.randomUUID(), fitMode: 'Fill', focalX: 0.5, focalY: 0.5,
            printQty: 1, caption: '', captionFont: 'serif', borderTone: 'white', note: '' });
        } catch (error) { errors.push(file.name + ' · ' + error.message); }
      }
      if (signal.aborted) return;
      if (added.length) setPhotos(previous => [...previous, ...added]);
      if (errors.length) action.setError(errors.join('\n'));
    });
  }

  function updatePhoto(next) {
    setPhotos(previous => previous.map(photo => photo.id === next.id ? next : photo));
  }

  return <section aria-label="Tải ảnh hàng loạt">
    <div className="drop-zone" onDragOver={event => event.preventDefault()} onDrop={event => { event.preventDefault(); addPhotos(event.dataTransfer.files); }}>
      <ImageUp size={28} aria-hidden="true" />
      <div><strong>{action.busy ? 'Đang đọc ảnh…' : 'Kéo thả hoặc chọn ảnh'}</strong><p>PNG, JPEG, WebP · tối đa {maxPhotos} ảnh, 15 MB mỗi ảnh</p></div>
      <input id={id} type="file" multiple accept={photoAccept} disabled={blocked} className="sr-only"
        onChange={event => { addPhotos(event.target.files); event.target.value = ''; }} />
      <label className="uv-button uv-button--outline" htmlFor={id} aria-disabled={blocked}>Chọn ảnh</label>
    </div>
    {action.error && <p className="notice notice-error whitespace-pre-line" role="alert">{action.error}</p>}
    {!!photos.length && <><p className="muted mt-4">Cỡ {widthCm} × {heightCm} cm đang áp dụng cho cả {photos.length} ảnh.</p>
      <ul className="photo-list">{photos.map(photo => <PhotoRow key={photo.id} photo={photo} widthCm={widthCm} heightCm={heightCm}
        disabled={blocked} onEdit={() => setSelected(photo.id)} onQuantity={printQty => updatePhoto({ ...photo, printQty })}
        onRemove={() => setPhotos(previous => previous.filter(item => item.id !== photo.id))} />)}</ul>
    </>}
    {editable && <PhotoCropModal photo={editable} widthCm={widthCm} heightCm={heightCm} captions={captions} onClose={() => setSelected(null)}
      onSave={photo => { updatePhoto(photo); setSelected(null); }} />}
  </section>;
}
