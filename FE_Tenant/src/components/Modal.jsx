import React, { useEffect, useId, useRef } from 'react';
import { X } from 'lucide-react';
import { UiverseIconLabel as IconLabel } from "@oneportal/uiverse-ui";

export default function Modal({ title, icon, onClose, busy, children }) {
  const ref = useRef(null), titleId = useId();
  useEffect(() => {
    const dialog = ref.current;
    const opener = document.activeElement;
    if (typeof dialog.showModal === 'function') dialog.showModal(); else dialog.setAttribute('open', '');
    dialog.querySelector('input, select')?.focus();
    return () => {
      if (dialog.open && typeof dialog.close === 'function') dialog.close();
      if (opener instanceof HTMLElement && opener.isConnected) opener.focus({ preventScroll: true });
    };
  }, []);
  return <dialog ref={ref} className="portal-dialog uv-modal-motion" aria-labelledby={titleId} onCancel={event => { event.preventDefault(); if (!busy) onClose(); }}>
    <div className="panel-heading">
      <h2 id={titleId}>{icon ? <IconLabel icon={icon}>{title}</IconLabel> : title}</h2>
      <button type="button" className="portal-secondary" disabled={busy} onClick={onClose} aria-label="Đóng hộp thoại">
        <IconLabel icon={X}>Đóng</IconLabel>
      </button>
    </div>
    {children}
  </dialog>;
}
