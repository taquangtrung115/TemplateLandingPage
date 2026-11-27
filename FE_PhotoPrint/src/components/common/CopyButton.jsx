import { useState } from 'react';
import { Copy } from 'lucide-react';

export default function CopyButton({ value, children = 'Sao chép' }) {
  const [status, setStatus] = useState('');
  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
      setStatus('Đã sao chép');
    } catch { setStatus('Chọn văn bản để sao chép'); }
  }
  return <button type="button" className="text-link inline-flex items-center gap-2" onClick={copy}><Copy size={15} />{status || children}</button>;
}
