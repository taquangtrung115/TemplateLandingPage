import { useState } from 'react';
import { Headset, MessageCircle, Phone, QrCode } from 'lucide-react';
import { Link } from 'react-router-dom';
import { UiverseSocialDock } from '@oneportal/uiverse-ui';
import { useContactConfig } from '../../contexts/ContactConfigContext';
import { resolveMessengerUrl, resolveZaloUrl } from '../../utils/socialLinks';
import { sanitizePhone } from '../../utils/safeUrl';
import { paths } from '../../routes/paths';
import SocialConnectModal from './SocialConnectModal';

export default function FloatingSocialDock() {
  const { config } = useContactConfig();
  const [channel, setChannel] = useState(null);
  const zalo = resolveZaloUrl(config), messenger = resolveMessengerUrl(config);
  const phone = sanitizePhone(config.hotline);
  return <UiverseSocialDock className="social-dock" label="Liên hệ tiệm ảnh" trigger={<><MessageCircle size={20} /><span>Tư vấn</span></>}>
    <div className="social-options">
      {config.zaloEnabled && (zalo || config.zaloQrImageUrl) && <div className="social-row">
        {zalo && <a className="mobile-social" href={zalo} target="_blank" rel="noreferrer">Zalo</a>}
        <button type="button" onClick={() => setChannel('zalo')}><QrCode size={17} /> QR Zalo</button>
      </div>}
      {config.messengerEnabled && (messenger || config.messengerQrImageUrl) && <div className="social-row">
        {messenger && <a href={messenger} target="_blank" rel="noreferrer"><MessageCircle size={17} /> Messenger</a>}
        <button type="button" onClick={() => setChannel('messenger')} aria-label="QR Messenger"><QrCode size={17} /></button>
      </div>}
      {phone && <a href={'tel:' + phone}><Phone size={17} /> Gọi tiệm</a>}
      <Link to={paths.support}><Headset size={17} /> Gửi yêu cầu</Link>
    </div>
    {channel && <SocialConnectModal config={config} channel={channel} onClose={() => setChannel(null)} />}
  </UiverseSocialDock>;
}
