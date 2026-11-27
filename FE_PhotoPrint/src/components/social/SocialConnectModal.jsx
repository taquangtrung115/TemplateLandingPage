import { useEffect, useState } from 'react';
import { ArrowUpRight, Download } from 'lucide-react';
import Modal from '../common/Modal';
import CopyButton from '../common/CopyButton';
import { generateQrDataUrl, resolveMessengerUrl, resolveZaloUrl } from '../../utils/socialLinks';
import { photoAssetUrl } from '../../api/photoUploadApi';
import { UiverseLoader } from '@oneportal/uiverse-ui';

export function useChannelQr(target) {
  const [result, setResult] = useState({ target: null });
  useEffect(() => {
    if (!target) return;
    let cancelled = false;
    generateQrDataUrl(target).then(value => { if (!cancelled) setResult({ target, value }); })
      .catch(() => { if (!cancelled) setResult({ target, error: 'Không thể tạo mã QR.' }); });
    return () => { cancelled = true; };
  }, [target]);
  return result.target === target ? result : {};
}

export default function SocialConnectModal({ config, channel, message, onClose }) {
  const [selected, setSelected] = useState(channel);
  const [autoQr, setAutoQr] = useState(false);
  const zalo = selected === 'zalo';
  const target = zalo ? resolveZaloUrl(config) : resolveMessengerUrl(config, message);
  const custom = photoAssetUrl(zalo ? config.zaloQrImageUrl : config.messengerQrImageUrl);
  const qr = useChannelQr(target);
  const image = (!autoQr && custom) || qr.value;
  const name = zalo ? config.zaloAccountName || config.zaloPhoneOrOaId : config.messengerPageIdOrUsername;
  const id = zalo ? config.zaloPhoneOrOaId : config.messengerPageIdOrUsername;
  const content = message || (zalo ? config.zaloPrefillText : config.messengerPrefillText);
  return <Modal title={zalo ? 'Gửi ảnh HD qua Zalo' : 'Nhắn qua Messenger'} onClose={onClose}>
    <div className="tabs" aria-label="Kênh liên hệ">
      {['zalo', 'messenger'].map(item => <button type="button" key={item} className="tab" aria-pressed={item === selected}
        onClick={() => { setSelected(item); setAutoQr(false); }}>{item === 'zalo' ? 'Zalo' : 'Messenger'}</button>)}
    </div>
    {target || custom ? <div className="qr-panel">
      {image ? <img className="qr-image" src={image} alt={'Mã QR ' + selected} /> : qr.error ? <p role="alert">{qr.error}</p> : <UiverseLoader label="Đang tạo mã QR…" />}
      {name && <p>{name} {id && <CopyButton value={id} />}</p>}
      {custom && target && <button type="button" className="text-link" onClick={() => setAutoQr(value => !value)}>{autoQr ? 'Dùng QR của tiệm' : 'Dùng QR từ liên kết'}</button>}
      {image && <a className="text-link inline-flex items-center gap-2" href={image} download={selected + '-qr.png'} target="_blank" rel="noreferrer"><Download size={16} /> Tải ảnh QR</a>}
      {content && <div className="notice"><p>{content}</p><CopyButton value={content} children="Sao chép nội dung" /></div>}
      {target && <a className="uv-button uv-button--push3d" href={target} target="_blank" rel="noreferrer">Mở {zalo ? 'Zalo' : 'Messenger'} <ArrowUpRight size={16} /></a>}
    </div> : <p className="notice">Tiệm chưa cấu hình kênh này.</p>}
  </Modal>;
}
