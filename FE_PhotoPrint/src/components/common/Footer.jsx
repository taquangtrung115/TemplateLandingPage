import { Link } from 'react-router-dom';
import { Aperture } from 'lucide-react';
import { useContactConfig } from '../../contexts/ContactConfigContext';
import { paths } from '../../routes/paths';
import { sanitizePhone } from '../../utils/safeUrl';
import { resolveZaloUrl } from '../../utils/socialLinks';
import { useChannelQr } from '../social/SocialConnectModal';
import { photoAssetUrl } from '../../api/photoUploadApi';
import ContactActions from '../social/ContactActions';

export default function Footer() {
  const { config } = useContactConfig();
  const phone = sanitizePhone(config.hotline);
  const zalo = resolveZaloUrl(config);
  const generated = useChannelQr(zalo);
  const qr = config.zaloEnabled && (photoAssetUrl(config.zaloQrImageUrl) || generated.value);
  return <footer className="site-footer"><div className="shell footer-grid">
    <div><Link className="brand" to={paths.home}><span className="brand-mark"><Aperture size={20} /></span>{config.brandName || 'Photo Print'}</Link>
      <p>Tiệm in ảnh cho khoảnh khắc bạn muốn giữ lại.</p>
    </div>
    <div><h2>Đặt in</h2><Link to={paths.services}>Tất cả sản phẩm</Link><Link to={paths.demo}>Studio 3D</Link><Link to={paths.trackOrder}>Tra cứu đơn</Link><Link to={paths.support}>Hỗ trợ</Link></div>
    <div><h2>Liên hệ</h2>{config.address && <p>{config.address}</p>}{config.workingHours && <p>{config.workingHours}</p>}
      {phone && <a href={'tel:' + phone}>{phone}</a>}
      {/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(config.email || '') && <a href={'mailto:' + config.email}>{config.email}</a>}
      <ContactActions />
    </div>
    {qr && <div><h2>Zalo nhận ảnh HD</h2><img src={qr} className="footer-qr" alt="QR Zalo của tiệm" /></div>}
  </div></footer>;
}
