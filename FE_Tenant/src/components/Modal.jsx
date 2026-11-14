import React, { useEffect, useId, useRef } from 'react';
export default function Modal({ title, onClose, busy, children }) {
  const ref = useRef(null), titleId = useId();
  useEffect(() => {
    const dialog = ref.current;
    if (typeof dialog.showModal === 'function') dialog.showModal(); else dialog.setAttribute('open', '');
    dialog.querySelector('input, select')?.focus();
    return () => { if (dialog.open && typeof dialog.close === 'function') dialog.close(); };
  }, []);
  return <dialog ref={ref} className="portal-dialog" aria-labelledby={titleId} onCancel={event => { event.preventDefault(); if (!busy) onClose(); }}>
    <div className="panel-heading"><h2 id={titleId}>{title}</h2><button type="button" className="portal-secondary" disabled={busy} onClick={onClose} aria-label="Đóng hộp thoại">Đóng</button></div>{children}
  </dialog>;
}
