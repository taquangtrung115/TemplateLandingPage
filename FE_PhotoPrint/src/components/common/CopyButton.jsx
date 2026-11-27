import { useState } from 'react';
import { Check, CircleAlert, Copy } from 'lucide-react';

export default function CopyButton({ value, children = 'Sao chép' }) {
  const [status, setStatus] = useState(null);
  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
      setStatus('copied');
    } catch { setStatus('failed'); }
  }
  const Icon = status === 'copied' ? Check : status === 'failed' ? CircleAlert : Copy;
  return <button type="button" className="text-link inline-flex items-center gap-2" onClick={copy}>
    <Icon key={status} className={status ? 'control-icon uv-view-enter' : 'control-icon'} aria-hidden="true" />
    <span aria-live="polite">{status === 'copied' ? 'Đã sao chép' : status === 'failed' ? 'Chọn văn bản để sao chép' : children}</span>
  </button>;
}
