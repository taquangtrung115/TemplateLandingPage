import { useState } from 'react';
import { X, Copy, Check, Download, QrCode, ExternalLink } from 'lucide-react';

export default function QrCodeModal({ isOpen, onClose, url, title = 'Mã QR Trang Của Bạn' }) {
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);

  if (!isOpen) return null;

  const targetUrl = url || (typeof window !== 'undefined' ? window.location.href : '');
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=350x350&format=png&data=${encodeURIComponent(
    targetUrl
  )}`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(targetUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
      const textArea = document.createElement('textarea');
      textArea.value = targetUrl;
      document.body.appendChild(textArea);
      textArea.select();
      try {
        setCopied(Boolean(document.execCommand('copy')));
        setTimeout(() => setCopied(false), 2000);
      } catch {
        setCopied(false);
      } finally {
        document.body.removeChild(textArea);
      }
    }
  };

  const handleDownloadQr = async () => {
    try {
      setDownloading(true);
      const res = await fetch(qrCodeUrl);
      if (!res.ok) throw new Error('QR download failed');
      const blob = await res.blob();
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = `qrcode-${Date.now()}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(blobUrl);
    } catch {
      window.open(qrCodeUrl, '_blank');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4 text-center">
        <div
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
          onClick={onClose}
        />

        <div className="relative transform overflow-hidden rounded-3xl bg-white text-left shadow-2xl transition-all w-full max-w-sm p-6 z-10 border border-slate-100">
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <QrCode className="w-4 h-4" />
              </div>
              <h3 className="text-base font-semibold text-slate-800">{title}</h3>
            </div>
            <button
              onClick={onClose}
              className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* QR Code Container */}
          <div className="my-5 flex flex-col items-center">
            <div className="p-4 bg-white rounded-2xl border border-slate-100 shadow-inner flex items-center justify-center">
              <img
                src={qrCodeUrl}
                alt="QR Code"
                className="w-52 h-52 object-contain rounded-lg"
                loading="lazy"
              />
            </div>
            <p className="text-xs text-slate-500 mt-2 text-center">
              Quét mã bằng camera điện thoại để mở trang trực tiếp
            </p>
          </div>

          {/* URL Bar */}
          <div className="flex items-center gap-2 p-2 bg-slate-50 rounded-xl border border-slate-200/80 mb-4">
            <input
              type="text"
              readOnly
              value={targetUrl}
              className="bg-transparent text-xs text-slate-600 flex-1 outline-none px-2 select-all truncate"
            />
            <button
              onClick={handleCopyLink}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1 transition ${
                copied
                  ? 'bg-emerald-500 text-white shadow-sm'
                  : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm'
              }`}
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Đã chép</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Sao chép</span>
                </>
              )}
            </button>
          </div>

          {/* Actions */}
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={handleDownloadQr}
              disabled={downloading}
              className="w-full py-2.5 px-3 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center justify-center gap-1.5 transition disabled:opacity-50"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{downloading ? 'Đang tải...' : 'Tải ảnh QR'}</span>
            </button>
            <a
              href={targetUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition text-center"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Mở trang</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
