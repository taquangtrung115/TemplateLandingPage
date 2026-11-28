import { useEffect, useState } from 'react';

export default function useVietQrImage(payload) {
  const [result, setResult] = useState({});
  useEffect(() => {
    if (!payload) return;
    let active = true;
    import('qrcode').then(({ default: qr }) => qr.toDataURL(payload, { width: 280, margin: 4, errorCorrectionLevel: 'M' }))
      .then(url => { if (active) setResult({ payload, url }); })
      .catch(() => { if (active) setResult({ payload, error: 'Không thể tạo mã QR. Bạn có thể sao chép thông tin chuyển khoản.' }); });
    return () => { active = false; };
  }, [payload]);
  return result.payload === payload ? result : {};
}
