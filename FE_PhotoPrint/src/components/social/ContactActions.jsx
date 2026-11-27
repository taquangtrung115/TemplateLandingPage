import { useState } from 'react';
import { MessageCircle, QrCode } from 'lucide-react';
import { useContactConfig } from '../../contexts/ContactConfigContext';
import { resolveMessengerUrl, resolveZaloUrl } from '../../utils/socialLinks';
import SocialConnectModal from './SocialConnectModal';

export default function ContactActions({ message, compact = false }) {
  const { config } = useContactConfig();
  const [channel, setChannel] = useState(null);
  const zalo = resolveZaloUrl(config);
  const messenger = resolveMessengerUrl(config, message);
  const actions = [
    { id: 'zalo', text: 'Zalo', url: zalo, enabled: config.zaloEnabled && (zalo || config.zaloQrImageUrl) },
    { id: 'messenger', text: 'Messenger', url: messenger, enabled: config.messengerEnabled && (messenger || config.messengerQrImageUrl) },
  ];
  return <div className="action-row">
    {actions.filter(item => item.enabled).map(item => <div key={item.id} className="contact-action">
      {item.url && <a className="uv-button uv-button--outline mobile-social" href={item.url} target="_blank" rel="noreferrer"><MessageCircle size={15} /> {item.text}</a>}
      <button type="button" className={compact ? 'icon-button' : 'uv-button uv-button--outline'} onClick={() => setChannel(item.id)} aria-label={'QR ' + item.text}>
        <QrCode size={16} />{!compact && item.text}
      </button>
    </div>)}
    {channel && <SocialConnectModal config={config} channel={channel} message={message} onClose={() => setChannel(null)} />}
  </div>;
}
