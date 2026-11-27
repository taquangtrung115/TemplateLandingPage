import { useState } from 'react';
import { Image } from 'lucide-react';
import { photoAssetUrl } from '../../api/photoUploadApi';

export default function PhotoImage({ src, alt = '', className = '', eager = false }) {
  const [failed, setFailed] = useState(null);
  const url = photoAssetUrl(src);
  if (!url || failed === url) return <span role={alt ? 'img' : undefined} aria-label={alt || undefined} className={'image-empty ' + className}><Image size={32} aria-hidden="true" /></span>;
  return <img src={url} alt={alt} className={className} loading={eager ? 'eager' : 'lazy'} decoding="async" onError={() => setFailed(url)} />;
}
